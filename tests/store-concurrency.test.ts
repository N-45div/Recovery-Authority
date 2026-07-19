import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { FilesystemRecoveryOperation } from "../src/contracts.js";
import { OperationStore } from "../src/store.js";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

function operation(id: string, path: string): FilesystemRecoveryOperation {
  const now = new Date();
  return {
    id,
    kind: "filesystem.delete",
    status: "proven",
    workspaceRoot: "/workspace",
    paths: [path],
    reason: "concurrent writer regression",
    artifactDir: `/artifacts/${id}`,
    records: [{ path, kind: "file", mode: 0o100600, sha256: id, symlinkTarget: null }],
    committedPaths: [],
    stateWitness: id,
    proofDigest: id,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 300_000).toISOString(),
    committedAt: null,
    recoveredAt: null,
    failure: null,
  };
}

describe("OperationStore concurrency", () => {
  test("preserves writes from independent store instances", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "recovery-store-concurrency-"));
    roots.push(dataDir);
    const first = new OperationStore(dataDir);
    const second = new OperationStore(dataDir);

    await Promise.all([
      first.put(operation("11111111-1111-4111-8111-111111111111", "first.txt")),
      second.put(operation("22222222-2222-4222-8222-222222222222", "second.txt")),
    ]);

    expect((await new OperationStore(dataDir).list()).map((item) => item.id).sort()).toEqual([
      "11111111-1111-4111-8111-111111111111",
      "22222222-2222-4222-8222-222222222222",
    ]);
  });

  test("allows only one process to begin the same operation", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "recovery-store-transition-"));
    roots.push(dataDir);
    const id = "33333333-3333-4333-8333-333333333333";
    await new OperationStore(dataDir).put(operation(id, "state.txt"));

    const results = await Promise.allSettled([
      new OperationStore(dataDir).beginCommit(id),
      new OperationStore(dataDir).beginCommit(id),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
    expect((await new OperationStore(dataDir).get(id)).status).toBe("committing");
  });
});
