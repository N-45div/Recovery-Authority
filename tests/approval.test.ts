import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApprovalBroker } from "../src/approval.js";
import { createFilesystemRecoveryService as createUninitializedFilesystemService } from "../src/filesystem.js";
import { initializeAuthority } from "../src/signer.js";

const temporaryRoots: string[] = [];

async function createFilesystemRecoveryService(dataDir: string) {
  await initializeAuthority(dataDir);
  return createUninitializedFilesystemService(dataDir);
}

async function temporaryRoot(prefix: string): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), prefix));
  temporaryRoots.push(root, `${root}.keys`);
  return root;
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("human approval broker", () => {
  test("withholds authorization until the proof prefix is confirmed", async () => {
    const workspace = await temporaryRoot("recovery-approval-workspace-");
    const dataDir = await temporaryRoot("recovery-approval-data-");
    await writeFile(join(workspace, "state.txt"), "protected state");
    const service = await createFilesystemRecoveryService(dataDir);
    const broker = await createApprovalBroker(dataDir);
    const prepared = await service.prepare({
      workspaceRoot: workspace,
      paths: ["state.txt"],
      reason: "Exercise the human authorization boundary",
      ttlSeconds: 300,
    });

    const pending = await broker.request(prepared.operation);
    expect(pending.status).toBe("pending");
    expect(pending.capability).toBeNull();
    await expect(broker.assertAuthorized(prepared.operation.id, "capability-not-issued"))
      .rejects.toThrow("not approved");
    await expect(broker.approve(prepared.operation.id, "incorrect"))
      .rejects.toThrow("must match proof prefix");

    const approved = await broker.approve(
      prepared.operation.id,
      prepared.operation.proofDigest.slice(0, 12),
    );
    expect(approved.status).toBe("approved");
    expect(approved.approvalDigest).not.toBeNull();
    expect(approved.capability).not.toBeNull();
    await broker.assertAuthorized(prepared.operation.id, approved.capability as string);

    await service.commit(prepared.operation.id, approved.capability as string);
    await expect(Bun.file(join(workspace, "state.txt")).text()).rejects.toThrow();
    await service.recover(prepared.operation.id);
    expect(await Bun.file(join(workspace, "state.txt")).text()).toBe("protected state");
  });
});
