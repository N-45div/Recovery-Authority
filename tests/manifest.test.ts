import { afterEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAuthorizationRegistry } from "../src/authorization.js";
import { createFilesystemRecoveryService } from "../src/filesystem.js";
import { RecoveryManifestService } from "../src/manifest.js";
import { ManifestStore } from "../src/manifest-store.js";
import { initializeAuthority } from "../src/signer.js";
import { OperationStore } from "../src/store.js";

const temporaryRoots: string[] = [];

async function temporaryRoot(prefix: string): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), prefix));
  temporaryRoots.push(root, `${root}.keys`);
  return root;
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function harness() {
  const dataDir = await temporaryRoot("recovery-manifest-data-");
  await initializeAuthority(dataDir);
  const approvals = await createAuthorizationRegistry(dataDir);
  return {
    dataDir,
    approvals,
    filesystem: await createFilesystemRecoveryService(dataDir),
    manifests: new RecoveryManifestService(new ManifestStore(dataDir), new OperationStore(dataDir), approvals),
  };
}

describe("recovery manifests", () => {
  test("bind independent pending proofs in explicit commit order", async () => {
    const { approvals, filesystem, manifests } = await harness();
    const firstRoot = await temporaryRoot("recovery-manifest-first-");
    const secondRoot = await temporaryRoot("recovery-manifest-second-");
    await writeFile(join(firstRoot, "first.txt"), "first");
    await writeFile(join(secondRoot, "second.txt"), "second");
    const first = await filesystem.prepare({
      workspaceRoot: firstRoot,
      paths: ["first.txt"],
      reason: "first independent effect",
      ttlSeconds: 300,
    });
    const second = await filesystem.prepare({
      workspaceRoot: secondRoot,
      paths: ["second.txt"],
      reason: "second independent effect",
      ttlSeconds: 240,
    });
    await approvals.request(first.operation);
    await approvals.request(second.operation);

    const manifest = await manifests.prepare({
      operationIds: [second.operation.id, first.operation.id],
      reason: "Apply two independently recoverable effects as one reviewed change",
    });

    expect(manifest.status).toBe("prepared");
    expect(manifest.bindings.map((binding) => binding.operationId)).toEqual([
      second.operation.id,
      first.operation.id,
    ]);
    expect(manifest.expiresAt).toBe(second.operation.expiresAt);
    expect(manifest.committedOperationIds).toEqual([]);
    expect((await manifests.get(manifest.id)).proofDigest).toBe(manifest.proofDigest);
  });

  test("rejects duplicate and overlapping child effects", async () => {
    const { approvals, filesystem, manifests } = await harness();
    const workspace = await temporaryRoot("recovery-manifest-overlap-");
    await mkdir(join(workspace, "nested"));
    await writeFile(join(workspace, "nested", "state.txt"), "state");
    const parent = await filesystem.prepare({
      workspaceRoot: workspace,
      paths: ["nested"],
      reason: "parent scope",
      ttlSeconds: 300,
    });
    const child = await filesystem.prepare({
      workspaceRoot: workspace,
      paths: ["nested/state.txt"],
      reason: "child scope",
      ttlSeconds: 300,
    });
    await approvals.request(parent.operation);
    await approvals.request(child.operation);

    await expect(manifests.prepare({
      operationIds: [parent.operation.id, parent.operation.id],
      reason: "duplicate should fail",
    })).rejects.toThrow("must be distinct");
    await expect(manifests.prepare({
      operationIds: [parent.operation.id, child.operation.id],
      reason: "overlap should fail",
    })).rejects.toThrow("overlapping filesystem scope");
  });
});
