import { afterEach, describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createGitRecoveryService as createUninitializedGitService } from "../src/git.js";
import { initializeAuthority } from "../src/signer.js";
import { authorizeOperation } from "./authorize.js";

const temporaryRoots: string[] = [];

async function createGitRecoveryService(dataDir: string) {
  await initializeAuthority(dataDir);
  return createUninitializedGitService(dataDir);
}

async function temporaryRoot(prefix: string): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), prefix));
  temporaryRoots.push(root, `${root}.keys`);
  return root;
}

function git(repository: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd: repository,
    encoding: "utf8",
    env: { ...process.env, LC_ALL: "C", GIT_TERMINAL_PROMPT: "0" },
  }).trim();
}

async function createRepository(): Promise<string> {
  const repository = await temporaryRoot("recovery-git-workspace-");
  git(repository, ["init", "-b", "main"]);
  git(repository, ["config", "user.name", "Recovery Test"]);
  git(repository, ["config", "user.email", "recovery@example.test"]);
  await writeFile(join(repository, "app.txt"), "committed app\n");
  await writeFile(join(repository, "staged.txt"), "committed staged\n");
  git(repository, ["add", "."]);
  git(repository, ["commit", "-m", "initial"]);
  return repository;
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("Git reset recovery authority", () => {
  test("restores HEAD, index, tracked changes, and untracked files", async () => {
    const repository = await createRepository();
    const dataDir = await temporaryRoot("recovery-git-data-");
    await writeFile(join(repository, "app.txt"), "unstaged app change\n");
    await writeFile(join(repository, "staged.txt"), "staged change\n");
    git(repository, ["add", "staged.txt"]);
    await writeFile(join(repository, "untracked.txt"), "untracked state\n");
    const statusBefore = git(repository, ["status", "--porcelain=v1"]);
    const headBefore = git(repository, ["rev-parse", "HEAD"]);

    const service = await createGitRecoveryService(dataDir);
    const prepared = await service.prepare({
      repositoryRoot: repository,
      target: "HEAD",
      reason: "Discard experimental changes",
      ttlSeconds: 300,
    });
    expect(prepared.operation.status).toBe("proven");
    expect(git(repository, ["status", "--porcelain=v1"])).toBe(statusBefore);

    const capability = await authorizeOperation(dataDir, prepared.operation);
    await service.commit(prepared.operation.id, capability);
    expect(await readFile(join(repository, "app.txt"), "utf8")).toBe("committed app\n");
    expect(await readFile(join(repository, "staged.txt"), "utf8")).toBe("committed staged\n");
    expect(await readFile(join(repository, "untracked.txt"), "utf8")).toBe("untracked state\n");

    const recovered = await service.recover(prepared.operation.id);
    expect(recovered.status).toBe("recovered");
    expect(git(repository, ["rev-parse", "HEAD"])).toBe(headBefore);
    expect(git(repository, ["status", "--porcelain=v1"])).toBe(statusBefore);
    expect(await readFile(join(repository, "app.txt"), "utf8")).toBe("unstaged app change\n");
    expect(await readFile(join(repository, "staged.txt"), "utf8")).toBe("staged change\n");
    expect(await readFile(join(repository, "untracked.txt"), "utf8")).toBe("untracked state\n");
  });

  test("restores the branch after resetting to an older commit", async () => {
    const repository = await createRepository();
    const dataDir = await temporaryRoot("recovery-git-data-");
    await writeFile(join(repository, "second.txt"), "second commit\n");
    git(repository, ["add", "second.txt"]);
    git(repository, ["commit", "-m", "second"]);
    const originalHead = git(repository, ["rev-parse", "HEAD"]);
    const targetHead = git(repository, ["rev-parse", "HEAD^"]);
    const service = await createGitRecoveryService(dataDir);
    const prepared = await service.prepare({
      repositoryRoot: repository,
      target: "HEAD^",
      reason: "Roll back the latest commit",
      ttlSeconds: 300,
    });

    const capability = await authorizeOperation(dataDir, prepared.operation);
    await service.commit(prepared.operation.id, capability);
    expect(git(repository, ["rev-parse", "HEAD"])).toBe(targetHead);
    expect(readFile(join(repository, "second.txt"), "utf8")).rejects.toThrow();

    await service.recover(prepared.operation.id);
    expect(git(repository, ["rev-parse", "HEAD"])).toBe(originalHead);
    expect(await readFile(join(repository, "second.txt"), "utf8")).toBe("second commit\n");
  });

  test("rejects reset when Git state changed after proof", async () => {
    const repository = await createRepository();
    const dataDir = await temporaryRoot("recovery-git-data-");
    const service = await createGitRecoveryService(dataDir);
    const prepared = await service.prepare({
      repositoryRoot: repository,
      target: "HEAD",
      reason: "Discard local state",
      ttlSeconds: 300,
    });
    await writeFile(join(repository, "app.txt"), "changed after proof\n");

    const capability = await authorizeOperation(dataDir, prepared.operation);
    expect(service.commit(prepared.operation.id, capability)).rejects.toThrow("state changed");
    expect(await readFile(join(repository, "app.txt"), "utf8")).toBe("changed after proof\n");
  });

  test("does not recover over work added after reset", async () => {
    const repository = await createRepository();
    const dataDir = await temporaryRoot("recovery-git-data-");
    await writeFile(join(repository, "app.txt"), "discard me\n");
    const service = await createGitRecoveryService(dataDir);
    const prepared = await service.prepare({
      repositoryRoot: repository,
      target: "HEAD",
      reason: "Discard local state",
      ttlSeconds: 300,
    });
    const capability = await authorizeOperation(dataDir, prepared.operation);
    await service.commit(prepared.operation.id, capability);
    await writeFile(join(repository, "new-work.txt"), "new work after reset\n");

    expect(service.recover(prepared.operation.id)).rejects.toThrow("overwrite state changed");
    expect(await readFile(join(repository, "new-work.txt"), "utf8")).toBe("new work after reset\n");
  });

  test("rejects linked worktrees whose Git metadata lives outside the snapshot", async () => {
    const repository = await createRepository();
    const linked = await temporaryRoot("recovery-git-linked-parent-");
    const linkedWorktree = join(linked, "worktree");
    git(repository, ["worktree", "add", "--detach", linkedWorktree, "HEAD"]);
    const dataDir = await temporaryRoot("recovery-git-data-");
    const service = await createGitRecoveryService(dataDir);

    expect(
      service.prepare({
        repositoryRoot: linkedWorktree,
        target: "HEAD",
        reason: "Unsupported linked worktree reset",
        ttlSeconds: 300,
      }),
    ).rejects.toThrow("linked worktrees");
  });
});
