import { afterEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAuthorizationRegistry } from "../src/authorization.js";
import { PublicCapabilityVerifier } from "../src/crypto.js";
import { createFilesystemRecoveryService } from "../src/filesystem.js";
import { GitRecoveryService } from "../src/git.js";
import { RecoveryManifestService } from "../src/manifest.js";
import { ManifestAuthorizationRegistry } from "../src/manifest-authorization.js";
import { createManifestApprovalBroker } from "../src/manifest-approval.js";
import { ManifestCoordinator } from "../src/manifest-coordinator.js";
import { ManifestStore } from "../src/manifest-store.js";
import { PostgresRecoveryService } from "../src/postgres.js";
import { initializeAuthority } from "../src/signer.js";
import { SqliteRecoveryService } from "../src/sqlite.js";
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

async function approvedFilesystemManifest() {
  const base = await harness();
  const firstRoot = await temporaryRoot("recovery-manifest-run-first-");
  const secondRoot = await temporaryRoot("recovery-manifest-run-second-");
  await writeFile(join(firstRoot, "first.txt"), "first");
  await writeFile(join(secondRoot, "second.txt"), "second");
  const first = await base.filesystem.prepare({
    workspaceRoot: firstRoot,
    paths: ["first.txt"],
    reason: "first manifest effect",
    ttlSeconds: 300,
  });
  const second = await base.filesystem.prepare({
    workspaceRoot: secondRoot,
    paths: ["second.txt"],
    reason: "second manifest effect",
    ttlSeconds: 300,
  });
  await base.approvals.request(first.operation);
  await base.approvals.request(second.operation);
  const manifest = await base.manifests.prepare({
    operationIds: [first.operation.id, second.operation.id],
    reason: "Run two restore-tested effects as one saga",
  });
  const verifier = await PublicCapabilityVerifier.load(base.dataDir);
  const manifestStore = new ManifestStore(base.dataDir);
  const manifestAuthorizations = new ManifestAuthorizationRegistry(base.dataDir, manifestStore, verifier);
  await manifestAuthorizations.request(manifest);
  const approved = await (await createManifestApprovalBroker(base.dataDir))
    .approve(manifest.id, manifest.proofDigest.slice(0, 12));
  const operations = new OperationStore(base.dataDir);
  const coordinator = new ManifestCoordinator(
    manifestStore,
    operations,
    manifestAuthorizations,
    base.approvals,
    {
      filesystem: base.filesystem,
      git: new GitRecoveryService(base.dataDir, operations, verifier),
      postgres: new PostgresRecoveryService(base.dataDir, operations, verifier),
      sqlite: new SqliteRecoveryService(base.dataDir, operations, verifier),
    },
  );
  return { ...base, first, second, firstRoot, secondRoot, manifest, approved, coordinator };
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

  test("one manifest confirmation derives exact child capabilities", async () => {
    const { dataDir, approvals, filesystem, manifests } = await harness();
    const firstRoot = await temporaryRoot("recovery-manifest-approval-first-");
    const secondRoot = await temporaryRoot("recovery-manifest-approval-second-");
    await writeFile(join(firstRoot, "first.txt"), "first");
    await writeFile(join(secondRoot, "second.txt"), "second");
    const first = await filesystem.prepare({
      workspaceRoot: firstRoot,
      paths: ["first.txt"],
      reason: "first approved effect",
      ttlSeconds: 300,
    });
    const second = await filesystem.prepare({
      workspaceRoot: secondRoot,
      paths: ["second.txt"],
      reason: "second approved effect",
      ttlSeconds: 300,
    });
    await approvals.request(first.operation);
    await approvals.request(second.operation);
    const manifest = await manifests.prepare({
      operationIds: [first.operation.id, second.operation.id],
      reason: "Approve both effects as one reviewed manifest",
    });
    const verifier = await PublicCapabilityVerifier.load(dataDir);
    const manifestAuthorizations = new ManifestAuthorizationRegistry(dataDir, new ManifestStore(dataDir), verifier);
    await manifestAuthorizations.request(manifest);
    const broker = await createManifestApprovalBroker(dataDir);

    await expect(broker.approve(manifest.id, "incorrect")).rejects.toThrow("must match proof prefix");
    const approved = await broker.approve(manifest.id, manifest.proofDigest.slice(0, 12));
    expect(approved.status).toBe("approved");
    expect(verifier.verify(approved.capability as string).kind).toBe("recovery.manifest");
    for (const operation of [first.operation, second.operation]) {
      const child = await approvals.get(operation.id);
      expect(child.status).toBe("approved");
      expect(child.source).toBe("manifest");
      expect(child.manifestId).toBe(manifest.id);
      expect(verifier.verify(child.capability as string).operationId).toBe(operation.id);
    }
  });

  test("commits in order and recovers in reverse order", async () => {
    const { first, second, firstRoot, secondRoot, manifest, approved, coordinator } = await approvedFilesystemManifest();
    const executions = [
      { operationId: first.operation.id },
      { operationId: second.operation.id },
    ];
    const committed = await coordinator.commit(manifest.id, approved.capability as string, executions);
    expect(committed.status).toBe("committed");
    expect(committed.committedOperationIds).toEqual(executions.map((execution) => execution.operationId));
    expect(await Bun.file(join(firstRoot, "first.txt")).exists()).toBe(false);
    expect(await Bun.file(join(secondRoot, "second.txt")).exists()).toBe(false);

    const recovered = await coordinator.recover(manifest.id, executions);
    expect(recovered.status).toBe("recovered");
    expect(recovered.recoveredOperationIds).toEqual([second.operation.id, first.operation.id]);
    expect(await Bun.file(join(firstRoot, "first.txt")).text()).toBe("first");
    expect(await Bun.file(join(secondRoot, "second.txt")).text()).toBe("second");
  });

  test("compensates prior commits when a later child drifts", async () => {
    const { first, second, firstRoot, secondRoot, manifest, approved, coordinator } = await approvedFilesystemManifest();
    await writeFile(join(secondRoot, "second.txt"), "changed after proof");
    const result = await coordinator.commit(manifest.id, approved.capability as string, [
      { operationId: first.operation.id },
      { operationId: second.operation.id },
    ]);

    expect(result.status).toBe("compensated");
    expect(result.committedOperationIds).toEqual([first.operation.id]);
    expect(result.recoveredOperationIds).toEqual([first.operation.id]);
    expect(result.outstandingOperationIds).toEqual([]);
    expect(result.failure).toContain("Protected state changed");
    expect(await Bun.file(join(firstRoot, "first.txt")).text()).toBe("first");
    expect(await Bun.file(join(secondRoot, "second.txt")).text()).toBe("changed after proof");
  });

  test("journals outstanding work and resumes partial recovery", async () => {
    const {
      filesystem,
      first,
      second,
      firstRoot,
      secondRoot,
      manifest,
      approved,
      coordinator,
    } = await approvedFilesystemManifest();
    await writeFile(join(secondRoot, "second.txt"), "changed after proof");
    const originalCommit = filesystem.commit.bind(filesystem);
    filesystem.commit = async (operationId, capability) => {
      if (operationId === second.operation.id) {
        await writeFile(join(firstRoot, "first.txt"), "later live state");
      }
      return originalCommit(operationId, capability);
    };
    const executions = [
      { operationId: first.operation.id },
      { operationId: second.operation.id },
    ];

    const partial = await coordinator.commit(manifest.id, approved.capability as string, executions);
    expect(partial.status).toBe("partially-recovered");
    expect(partial.outstandingOperationIds).toEqual([first.operation.id]);
    expect(partial.failure).toContain("Recovery would overwrite live state");
    expect(await Bun.file(join(firstRoot, "first.txt")).text()).toBe("later live state");

    await rm(join(firstRoot, "first.txt"));
    const resumed = await coordinator.recover(manifest.id, executions);
    expect(resumed.status).toBe("compensated");
    expect(resumed.outstandingOperationIds).toEqual([]);
    expect(resumed.recoveredOperationIds).toEqual([first.operation.id]);
    expect(await Bun.file(join(firstRoot, "first.txt")).text()).toBe("first");
  });
});
