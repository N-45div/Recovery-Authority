import { afterEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { orientConsequences, projectConsequenceGraph, sliceConsequenceGraph } from "../src/consequence-graph.js";
import { ManifestStore } from "../src/manifest-store.js";
import { OperationStore } from "../src/store.js";

const temporaryRoots: string[] = [];

async function temporaryDataDir(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "recovery-consequence-"));
  temporaryRoots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function seedFilesystemProof(dataDir: string, status: "pending" | "approved" = "pending"): Promise<string> {
  const operationId = "11111111-1111-4111-8111-111111111111";
  const expiresAt = new Date(Date.now() + 300_000).toISOString();
  await new OperationStore(dataDir).put({
    id: operationId,
    kind: "filesystem.delete",
    status: "proven",
    workspaceRoot: "/workspace",
    paths: ["cache"],
    reason: "test consequence graph",
    artifactDir: join(dataDir, "artifacts", operationId),
    stateWitness: "state-witness",
    proofDigest: "proof-digest",
    createdAt: new Date().toISOString(),
    expiresAt,
    committedAt: null,
    recoveredAt: null,
    failure: null,
    records: [{ path: "cache", kind: "directory", mode: 0o755, sha256: null, symlinkTarget: null }],
    committedPaths: [],
  });
  await mkdir(join(dataDir, "approvals"), { recursive: true });
  await writeFile(join(dataDir, "approvals", `${operationId}.json`), JSON.stringify({
    operationId,
    status,
    proofDigest: "proof-digest",
    requestedAt: new Date().toISOString(),
    approvedAt: status === "approved" ? new Date().toISOString() : null,
    expiresAt,
    approvalDigest: status === "approved" ? "approval-digest" : null,
    capability: status === "approved" ? "redacted-from-graph" : null,
  }));
  return operationId;
}

async function observeHook(dataDir: string): Promise<void> {
  await writeFile(join(dataDir, "hook-events.jsonl"), `${JSON.stringify({
    timestamp: new Date().toISOString(),
    event: "SessionStart",
    sessionId: "session-1",
    turnId: null,
    agentId: null,
    agentType: null,
    commandDigest: null,
    blocked: false,
    findings: [],
  })}\n`);
}

describe("living consequence graph", () => {
  test("projects restore proofs, affected resources, and local hook posture", async () => {
    const dataDir = await temporaryDataDir();
    await seedFilesystemProof(dataDir);
    await observeHook(dataDir);

    const graph = await projectConsequenceGraph(dataDir);
    expect(graph.posture.level).toBe("degraded");
    expect(graph.posture.hookObserved).toBe(true);
    expect(graph.nodes.some((node) => node.kind === "resource" && node.label === "/workspace:cache")).toBe(true);
    expect(graph.edges.some((edge) => edge.relation === "protected_by" && edge.state === "restore-tested")).toBe(true);
    expect(await Bun.file(join(dataDir, "consequence-graph.json")).exists()).toBe(true);
  });

  test("distinguishes a fresh recovery proof from human authority", async () => {
    const dataDir = await temporaryDataDir();
    const operationId = await seedFilesystemProof(dataDir);
    const graph = await projectConsequenceGraph(dataDir);

    const orientation = orientConsequences(graph, { command: "rm -rf cache", operationId, shellDialect: "posix" });
    expect(orientation.destructive).toBe(true);
    expect(orientation.executable).toBe(false);
    expect(orientation.readiness.recoveryCoverage).toBe(2);
    expect(orientation.readiness.authority).toBe(1);
    expect(orientation.safeCut).toContainEqual(expect.objectContaining({ requirement: "human_approval", satisfied: false }));
  });

  test("keeps the raw command non-executable after approval", async () => {
    const dataDir = await temporaryDataDir();
    const operationId = await seedFilesystemProof(dataDir, "approved");
    const graph = await projectConsequenceGraph(dataDir);

    const orientation = orientConsequences(graph, { command: "rm -rf cache", operationId, shellDialect: "posix" });
    expect(orientation.executable).toBe(false);
    expect(orientation.readiness.authority).toBe(2);
    expect(orientation.safeCut).toContainEqual(expect.objectContaining({ requirement: "exact_commit_tool", satisfied: true }));
  });

  test("marks unsupported and opaque effects as uncertainty", async () => {
    const dataDir = await temporaryDataDir();
    const graph = await projectConsequenceGraph(dataDir);
    const orientation = orientConsequences(graph, { command: "docker volume prune -f", shellDialect: "posix" });

    expect(orientation.readiness.blastRadius).toBe(4);
    expect(orientation.readiness.recoveryCoverage).toBe(0);
    expect(orientation.readiness.uncertainty).toBe(1);
    expect(orientation.safeCut).toContainEqual(expect.objectContaining({ requirement: "adapter_required" }));
  });

  test("does not transfer proof readiness across operations of the same category", async () => {
    const dataDir = await temporaryDataDir();
    await seedFilesystemProof(dataDir, "approved");
    const graph = await projectConsequenceGraph(dataDir);

    const orientation = orientConsequences(graph, { command: "rm -rf unrelated", shellDialect: "posix" });
    expect(orientation.readiness.recoveryCoverage).toBe(1);
    expect(orientation.readiness.authority).toBe(0);
    expect(orientation.safeCut).toContainEqual(expect.objectContaining({ requirement: "prepare_proof" }));
  });

  test("exposes the missing manifest edge for multi-effect commands", async () => {
    const dataDir = await temporaryDataDir();
    const graph = await projectConsequenceGraph(dataDir);
    const orientation = orientConsequences(graph, {
      command: "rm -rf cache && sqlite3 app.db 'DELETE FROM users'",
      shellDialect: "posix",
    });

    expect(orientation.safeCut[0]).toMatchObject({ category: "multi-effect", requirement: "split_manifest" });
    expect(orientation.findings.map((finding) => finding.category)).toEqual(["filesystem.delete", "sqlite.mutate"]);
  });

  test("recognizes exact multi-effect proofs bound by an approved manifest", async () => {
    const dataDir = await temporaryDataDir();
    const filesystemId = await seedFilesystemProof(dataDir, "approved");
    const sqliteId = "22222222-2222-4222-8222-222222222222";
    const manifestId = "33333333-3333-4333-8333-333333333333";
    const expiresAt = new Date(Date.now() + 300_000).toISOString();
    await new OperationStore(dataDir).put({
      id: sqliteId,
      kind: "sqlite.mutate",
      status: "proven",
      workspaceRoot: "/workspace",
      paths: ["app.db"],
      reason: "test SQLite consequence",
      artifactDir: join(dataDir, "artifacts", sqliteId),
      databasePath: "app.db",
      stateWitness: "sqlite-state-witness",
      statementDigest: "statement-digest",
      proofDigest: "sqlite-proof-digest",
      integrityCheck: "ok",
      drillPostWitness: "sqlite-drill-post-witness",
      postCommitWitness: null,
      createdAt: new Date().toISOString(),
      expiresAt,
      committedAt: null,
      recoveredAt: null,
      failure: null,
    });
    await writeFile(join(dataDir, "approvals", `${sqliteId}.json`), JSON.stringify({
      operationId: sqliteId,
      status: "approved",
      proofDigest: "sqlite-proof-digest",
      requestedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      expiresAt,
      approvalDigest: "sqlite-approval-digest",
      capability: "redacted-from-graph",
      source: "manifest",
      manifestId,
      manifestProofDigest: "manifest-proof-digest",
    }));
    await new ManifestStore(dataDir).put({
      id: manifestId,
      status: "prepared",
      reason: "test aggregate consequence",
      bindings: [
        { operationId: filesystemId, kind: "filesystem.delete", proofDigest: "proof-digest", stateWitness: "state-witness", statementDigest: null, scope: ["filesystem:/workspace/cache"] },
        { operationId: sqliteId, kind: "sqlite.mutate", proofDigest: "sqlite-proof-digest", stateWitness: "sqlite-state-witness", statementDigest: "statement-digest", scope: ["filesystem:/workspace/app.db"] },
      ],
      proofDigest: "manifest-proof-digest",
      stateWitness: "manifest-state-witness",
      bindingDigest: "binding-digest",
      createdAt: new Date().toISOString(),
      expiresAt,
      committedOperationIds: [],
      recoveredOperationIds: [],
      outstandingOperationIds: [],
      committedAt: null,
      recoveredAt: null,
      failure: null,
    });
    await mkdir(join(dataDir, "manifest-approvals"), { recursive: true });
    await writeFile(join(dataDir, "manifest-approvals", `${manifestId}.json`), JSON.stringify({
      manifestId,
      status: "approved",
      proofDigest: "manifest-proof-digest",
      requestedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      expiresAt,
      approvalDigest: "manifest-approval-digest",
      capability: "redacted-from-graph",
    }));
    await writeFile(join(dataDir, "approvals", `${filesystemId}.json`), JSON.stringify({
      operationId: filesystemId,
      status: "approved",
      proofDigest: "proof-digest",
      requestedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      expiresAt,
      approvalDigest: "filesystem-manifest-approval-digest",
      capability: "redacted-from-graph",
      source: "manifest",
      manifestId,
      manifestProofDigest: "manifest-proof-digest",
    }));

    const graph = await projectConsequenceGraph(dataDir);
    const orientation = orientConsequences(graph, {
      command: "rm -rf cache && sqlite3 app.db 'DELETE FROM users'",
      manifestId,
      shellDialect: "posix",
    });
    expect(orientation.safeCut[0]).toMatchObject({ requirement: "split_manifest", satisfied: true });
    expect(orientation.safeCut.filter((item) => item.requirement === "exact_commit_tool")).toHaveLength(2);
    expect(graph.nodes.some((node) => node.kind === "manifest" && node.attributes.manifestId === manifestId)).toBe(true);
    expect(graph.edges.filter((edge) => edge.relation === "contains")).toHaveLength(2);
    const slice = sliceConsequenceGraph(graph, { manifestId, maxNodes: 30 });
    expect(slice.nodes.some((node) => node.kind === "resource")).toBe(true);
    expect(slice.nodes.some((node) => node.kind === "proof" && node.attributes.digest === "sqlite-proof-digest")).toBe(true);
  });

  test("returns a bounded operation neighborhood", async () => {
    const dataDir = await temporaryDataDir();
    const operationId = await seedFilesystemProof(dataDir);
    const graph = await projectConsequenceGraph(dataDir);
    const slice = sliceConsequenceGraph(graph, { operationId, maxNodes: 20 });

    expect(slice.nodes.some((node) => node.attributes.operationId === operationId)).toBe(true);
    expect(slice.nodes.length).toBeLessThanOrEqual(20);
    expect(slice.edges.every((edge) =>
      slice.nodes.some((node) => node.id === edge.from) && slice.nodes.some((node) => node.id === edge.to),
    )).toBe(true);
  });
});
