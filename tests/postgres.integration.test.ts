import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createPostgresRecoveryService as createUninitializedPostgresService,
  type PostgresTools,
} from "../src/postgres.js";
import { initializeAuthority } from "../src/signer.js";
import { authorizeOperation } from "./authorize.js";

const integration = process.env.RECOVERY_POSTGRES_INTEGRATION === "1" ? describe : describe.skip;
const container = `recovery-pg-${randomUUID().slice(0, 8)}`;
const connectionUri = "postgresql://postgres:recovery@127.0.0.1:5432/app";
let temporaryRoot = "";
let dataDir = "";
let pgDump = "";
let psql = "";

async function createPostgresRecoveryService(dataDir: string, tools?: PostgresTools) {
  await initializeAuthority(dataDir);
  return createUninitializedPostgresService(dataDir, tools);
}

function docker(args: string[], input?: string): string {
  const result = spawnSync("docker", args, { encoding: "utf8", input });
  if (result.status !== 0) throw new Error(result.stderr || `docker ${args.join(" ")} failed`);
  return result.stdout.trim();
}

function databaseSql(sql: string): string {
  return docker([
    "exec", "-i", container,
    "psql", "--no-psqlrc", "--set", "ON_ERROR_STOP=1",
    "--tuples-only", "--no-align", "--username", "postgres", "--dbname", "app",
    "--command", sql,
  ]);
}

integration("PostgreSQL recovery authority", () => {
  beforeAll(async () => {
    temporaryRoot = await mkdtemp(join(tmpdir(), "recovery-postgres-"));
    dataDir = join(temporaryRoot, "data");
    docker([
      "run", "--detach", "--rm", "--name", container,
      "--tmpfs", "/var/lib/postgresql/data:rw,nosuid,size=256m",
      "--env", "POSTGRES_PASSWORD=recovery",
      "--env", "POSTGRES_DB=app",
      "postgres:17-alpine",
    ]);
    let ready = false;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const result = spawnSync("docker", [
        "exec", container,
        "psql", "--username", "postgres", "--dbname", "app", "--command", "SELECT 1",
      ]);
      if (result.status === 0) {
        ready = true;
        break;
      }
      await Bun.sleep(250);
    }
    if (!ready) throw new Error("PostgreSQL integration container did not become ready");

    databaseSql(`
      CREATE TABLE public.users (id bigint PRIMARY KEY, name text NOT NULL);
      CREATE SCHEMA audit;
      CREATE TABLE audit.user_events (
        id bigint PRIMARY KEY,
        user_id bigint NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        event text NOT NULL
      );
      INSERT INTO public.users VALUES (1, 'Ada'), (2, 'Grace'), (3, 'Linus');
      INSERT INTO audit.user_events VALUES (10, 2, 'login'), (11, 3, 'login');
    `);

    pgDump = join(temporaryRoot, "pg_dump");
    psql = join(temporaryRoot, "psql");
    await Promise.all([
      writeFile(pgDump, `#!/bin/sh\nexec docker exec -i ${container} pg_dump "$@"\n`, { mode: 0o700 }),
      writeFile(psql, `#!/bin/sh\nexec docker exec -i ${container} psql "$@"\n`, { mode: 0o700 }),
    ]);
    await Promise.all([chmod(pgDump, 0o700), chmod(psql, 0o700)]);
  }, 30_000);

  afterAll(async () => {
    spawnSync("docker", ["rm", "--force", container], { encoding: "utf8" });
    if (temporaryRoot) await rm(temporaryRoot, { recursive: true, force: true });
  });

  test("drills, commits, and restores a destructive mutation plus its cross-schema cascade", async () => {
    const service = await createPostgresRecoveryService(dataDir, {
      pgDump,
      psql,
      maxOutputBytes: 32 * 1024 * 1024,
      timeoutMs: 30_000,
    });
    const sql = "DELETE FROM public.users WHERE name = 'Grace'";
    const prepared = await service.prepare({
      connectionUri,
      schema: "public",
      sql,
      reason: "Remove an expired account with a recoverable cascade",
      ttlSeconds: 300,
    });

    expect(prepared.operation.status).toBe("proven");
    expect(prepared.operation.backupScope).toBe("database");
    expect(databaseSql("SELECT name FROM public.users ORDER BY id")).toBe("Ada\nGrace\nLinus");
    expect(await readFile(join(dataDir, "operations.json"), "utf8")).not.toContain("recovery@127.0.0.1");

    const capability = await authorizeOperation(dataDir, prepared.operation);
    const committed = await service.commit(prepared.operation.id, capability, connectionUri, sql);
    expect(committed.status).toBe("committed");
    expect(committed.postCommitWitness).toBe(prepared.operation.drillPostWitness);
    expect(databaseSql("SELECT name FROM public.users ORDER BY id")).toBe("Ada\nLinus");
    expect(databaseSql("SELECT event FROM audit.user_events ORDER BY id")).toBe("login");

    const recovered = await service.recover(prepared.operation.id, connectionUri);
    expect(recovered.status).toBe("recovered");
    expect(databaseSql("SELECT name FROM public.users ORDER BY id")).toBe("Ada\nGrace\nLinus");
    expect(databaseSql("SELECT user_id FROM audit.user_events ORDER BY id")).toBe("2\n3");
  }, 60_000);

  test("rejects commit after the protected database changes", async () => {
    const service = await createPostgresRecoveryService(join(temporaryRoot, "stale-data"), {
      pgDump,
      psql,
      maxOutputBytes: 32 * 1024 * 1024,
      timeoutMs: 30_000,
    });
    const sql = "DELETE FROM public.users WHERE name = 'Linus'";
    const prepared = await service.prepare({
      connectionUri,
      schema: "public",
      sql,
      reason: "Exercise stale proof refusal",
      ttlSeconds: 300,
    });
    databaseSql("INSERT INTO audit.user_events VALUES (12, 1, 'password-change')");

    const capability = await authorizeOperation(join(temporaryRoot, "stale-data"), prepared.operation);
    await expect(service.commit(prepared.operation.id, capability, connectionUri, sql))
      .rejects.toThrow("state changed after the recovery proof");
    expect(databaseSql("SELECT name FROM public.users ORDER BY id")).toBe("Ada\nGrace\nLinus");
  }, 60_000);

  test("refuses recovery over state added after the authorized mutation", async () => {
    const service = await createPostgresRecoveryService(join(temporaryRoot, "changed-after-data"), {
      pgDump,
      psql,
      maxOutputBytes: 32 * 1024 * 1024,
      timeoutMs: 30_000,
    });
    const sql = "DELETE FROM public.users WHERE name = 'Linus'";
    const prepared = await service.prepare({
      connectionUri,
      schema: "public",
      sql,
      reason: "Exercise post-commit overwrite refusal",
      ttlSeconds: 300,
    });
    const capability = await authorizeOperation(join(temporaryRoot, "changed-after-data"), prepared.operation);
    await service.commit(prepared.operation.id, capability, connectionUri, sql);
    databaseSql("INSERT INTO public.users VALUES (4, 'Margaret')");

    await expect(service.recover(prepared.operation.id, connectionUri))
      .rejects.toThrow("would overwrite state changed after");
    expect(databaseSql("SELECT name FROM public.users ORDER BY id")).toBe("Ada\nGrace\nMargaret");
  }, 60_000);
});
