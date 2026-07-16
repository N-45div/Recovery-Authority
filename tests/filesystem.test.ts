import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createFilesystemRecoveryService } from "../src/filesystem.js";
import { authorizeOperation } from "./authorize.js";

const temporaryRoots: string[] = [];

async function temporaryRoot(prefix: string): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), prefix));
  temporaryRoots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("filesystem recovery authority", () => {
  test("proves, commits, and recovers a directory delete", async () => {
    const workspace = await temporaryRoot("recovery-workspace-");
    const dataDir = await temporaryRoot("recovery-data-");
    await mkdir(join(workspace, "sessions"));
    await writeFile(join(workspace, "sessions", "expired.json"), "important state\n");

    const service = await createFilesystemRecoveryService(dataDir);
    const prepared = await service.prepare({
      workspaceRoot: workspace,
      paths: ["sessions"],
      reason: "Remove expired sessions",
      ttlSeconds: 300,
    });

    expect(prepared.operation.status).toBe("proven");
    expect(prepared.operation.records.some((record) => record.path === "sessions/expired.json")).toBe(true);

    const capability = await authorizeOperation(dataDir, prepared.operation);
    const committed = await service.commit(prepared.operation.id, capability);
    expect(committed.status).toBe("committed");
    expect(readFile(join(workspace, "sessions", "expired.json"), "utf8")).rejects.toThrow();

    const recovered = await service.recover(prepared.operation.id);
    expect(recovered.status).toBe("recovered");
    expect(await readFile(join(workspace, "sessions", "expired.json"), "utf8")).toBe("important state\n");
  });

  test("rejects commit when state changes after proof", async () => {
    const workspace = await temporaryRoot("recovery-workspace-");
    const dataDir = await temporaryRoot("recovery-data-");
    await writeFile(join(workspace, "state.txt"), "before");

    const service = await createFilesystemRecoveryService(dataDir);
    const prepared = await service.prepare({
      workspaceRoot: workspace,
      paths: ["state.txt"],
      reason: "Delete generated state",
      ttlSeconds: 300,
    });
    await writeFile(join(workspace, "state.txt"), "changed after proof");

    const capability = await authorizeOperation(dataDir, prepared.operation);
    expect(service.commit(prepared.operation.id, capability)).rejects.toThrow(
      "Protected state changed",
    );
    expect(await readFile(join(workspace, "state.txt"), "utf8")).toBe("changed after proof");
  });

  test("rejects workspace escape", async () => {
    const workspace = await temporaryRoot("recovery-workspace-");
    const dataDir = await temporaryRoot("recovery-data-");
    const service = await createFilesystemRecoveryService(dataDir);

    expect(
      service.prepare({
        workspaceRoot: workspace,
        paths: ["../outside"],
        reason: "Invalid scope",
        ttlSeconds: 300,
      }),
    ).rejects.toThrow("escapes");
  });

  test("rejects overlapping scopes", async () => {
    const workspace = await temporaryRoot("recovery-workspace-");
    const dataDir = await temporaryRoot("recovery-data-");
    await mkdir(join(workspace, "sessions"));
    await writeFile(join(workspace, "sessions", "one.json"), "state");
    const service = await createFilesystemRecoveryService(dataDir);

    expect(
      service.prepare({
        workspaceRoot: workspace,
        paths: ["sessions", "sessions/one.json"],
        reason: "Invalid duplicate scope",
        ttlSeconds: 300,
      }),
    ).rejects.toThrow("overlap");
  });

  test("refuses to delete the authority ledger or recovery artifacts", async () => {
    const workspace = await temporaryRoot("recovery-workspace-");
    const dataDir = join(workspace, ".recovery-authority");
    await mkdir(dataDir);
    await writeFile(join(dataDir, "authority-private.pem"), "authority state");
    const service = await createFilesystemRecoveryService(dataDir);

    expect(service.prepare({
      workspaceRoot: workspace,
      paths: [".recovery-authority"],
      reason: "Attempt to remove recovery evidence",
      ttlSeconds: 300,
    })).rejects.toThrow("protected authority data root");
  });

  test("rejects a target reached through an escaping directory symlink", async () => {
    const workspace = await temporaryRoot("recovery-workspace-");
    const outside = await temporaryRoot("recovery-outside-");
    const dataDir = await temporaryRoot("recovery-data-");
    await writeFile(join(outside, "secret.txt"), "outside state");
    await symlink(outside, join(workspace, "linked"));
    const service = await createFilesystemRecoveryService(dataDir);

    expect(
      service.prepare({
        workspaceRoot: workspace,
        paths: ["linked/secret.txt"],
        reason: "Invalid symlink traversal",
        ttlSeconds: 300,
      }),
    ).rejects.toThrow("symlink");
    expect(await readFile(join(outside, "secret.txt"), "utf8")).toBe("outside state");
  });

  test("does not overwrite state recreated after commit", async () => {
    const workspace = await temporaryRoot("recovery-workspace-");
    const dataDir = await temporaryRoot("recovery-data-");
    await writeFile(join(workspace, "state.txt"), "original");
    const service = await createFilesystemRecoveryService(dataDir);
    const prepared = await service.prepare({
      workspaceRoot: workspace,
      paths: ["state.txt"],
      reason: "Replace generated state",
      ttlSeconds: 300,
    });
    const capability = await authorizeOperation(dataDir, prepared.operation);
    await service.commit(prepared.operation.id, capability);
    await writeFile(join(workspace, "state.txt"), "new live state");

    expect(service.recover(prepared.operation.id)).rejects.toThrow("overwrite live state");
    expect(await readFile(join(workspace, "state.txt"), "utf8")).toBe("new live state");
  });
});
