import { afterEach, describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createSqliteRecoveryService } from "../src/sqlite.js";
import { authorizeOperation } from "./authorize.js";

const temporaryRoots: string[] = [];

async function temporaryRoot(prefix: string): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), prefix));
  temporaryRoots.push(root);
  return root;
}

function createUsersDatabase(path: string): void {
  const database = new Database(path, { create: true, strict: true });
  database.exec("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL)");
  database.exec("INSERT INTO users (name) VALUES ('Ada'), ('Grace'), ('Linus')");
  database.close();
}

function userNames(path: string): string[] {
  const database = new Database(path, { readonly: true, create: false, strict: true });
  try {
    return database.query<{ name: string }, []>("SELECT name FROM users ORDER BY id").all().map((row) => row.name);
  } finally {
    database.close();
  }
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("SQLite recovery authority", () => {
  test("restore-tests, commits, and exactly recovers destructive SQL", async () => {
    const workspace = await temporaryRoot("recovery-sqlite-workspace-");
    const dataDir = await temporaryRoot("recovery-sqlite-data-");
    const databasePath = join(workspace, "app.sqlite");
    createUsersDatabase(databasePath);
    const service = await createSqliteRecoveryService(dataDir);
    const sql = "DELETE FROM users WHERE name IN ('Grace', 'Linus')";

    const prepared = await service.prepare({
      workspaceRoot: workspace,
      databasePath: "app.sqlite",
      sql,
      reason: "Remove expired demo users",
      ttlSeconds: 300,
    });
    expect(prepared.operation.status).toBe("proven");
    expect(prepared.operation.integrityCheck).toBe("ok");
    expect(userNames(databasePath)).toEqual(["Ada", "Grace", "Linus"]);

    const capability = await authorizeOperation(dataDir, prepared.operation);
    const committed = await service.commit(prepared.operation.id, capability, sql);
    expect(committed.status).toBe("committed");
    expect(userNames(databasePath)).toEqual(["Ada"]);

    const recovered = await service.recover(prepared.operation.id);
    expect(recovered.status).toBe("recovered");
    expect(userNames(databasePath)).toEqual(["Ada", "Grace", "Linus"]);
  });

  test("rejects SQL different from the restore-tested statement", async () => {
    const workspace = await temporaryRoot("recovery-sqlite-workspace-");
    const dataDir = await temporaryRoot("recovery-sqlite-data-");
    const databasePath = join(workspace, "app.sqlite");
    createUsersDatabase(databasePath);
    const service = await createSqliteRecoveryService(dataDir);
    const prepared = await service.prepare({
      workspaceRoot: workspace,
      databasePath: "app.sqlite",
      sql: "DELETE FROM users WHERE name = 'Grace'",
      reason: "Remove one user",
      ttlSeconds: 300,
    });

    const capability = await authorizeOperation(dataDir, prepared.operation);
    expect(service.commit(prepared.operation.id, capability, "DELETE FROM users"))
      .rejects.toThrow("does not match");
    expect(userNames(databasePath)).toEqual(["Ada", "Grace", "Linus"]);
  });

  test("rejects commit after concurrent database changes", async () => {
    const workspace = await temporaryRoot("recovery-sqlite-workspace-");
    const dataDir = await temporaryRoot("recovery-sqlite-data-");
    const databasePath = join(workspace, "app.sqlite");
    createUsersDatabase(databasePath);
    const service = await createSqliteRecoveryService(dataDir);
    const sql = "DROP TABLE users";
    const prepared = await service.prepare({
      workspaceRoot: workspace,
      databasePath: "app.sqlite",
      sql,
      reason: "Drop obsolete table",
      ttlSeconds: 300,
    });
    const database = new Database(databasePath, { strict: true });
    database.exec("INSERT INTO users (name) VALUES ('Margaret')");
    database.close();

    const capability = await authorizeOperation(dataDir, prepared.operation);
    expect(service.commit(prepared.operation.id, capability, sql)).rejects.toThrow(
      "state changed",
    );
    expect(userNames(databasePath)).toEqual(["Ada", "Grace", "Linus", "Margaret"]);
  });

  test("does not recover over post-commit database changes", async () => {
    const workspace = await temporaryRoot("recovery-sqlite-workspace-");
    const dataDir = await temporaryRoot("recovery-sqlite-data-");
    const databasePath = join(workspace, "app.sqlite");
    createUsersDatabase(databasePath);
    const service = await createSqliteRecoveryService(dataDir);
    const sql = "DELETE FROM users WHERE name = 'Linus'";
    const prepared = await service.prepare({
      workspaceRoot: workspace,
      databasePath: "app.sqlite",
      sql,
      reason: "Remove one user",
      ttlSeconds: 300,
    });
    const capability = await authorizeOperation(dataDir, prepared.operation);
    await service.commit(prepared.operation.id, capability, sql);
    const database = new Database(databasePath, { strict: true });
    database.exec("INSERT INTO users (name) VALUES ('Margaret')");
    database.close();

    expect(service.recover(prepared.operation.id)).rejects.toThrow("overwrite state changed");
    expect(userNames(databasePath)).toEqual(["Ada", "Grace", "Margaret"]);
  });
});
