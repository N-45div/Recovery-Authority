import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { chmod, cp, lstat, mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import type { FileRecord, GitResetHardRecoveryOperation, PrepareGitResetHard } from "./contracts.js";
import { PublicCapabilityVerifier, type CapabilityVerifier, sha256 } from "./crypto.js";
import { collectRecords, recordsWitness, restoreRecords } from "./filesystem.js";
import { OperationStore } from "./store.js";

interface GitState {
  records: FileRecord[];
  head: string;
  headRef: string | null;
  index: Buffer;
  indexDigest: string;
  indexMode: number;
  witness: string;
}

function runGit(cwd: string, args: string[]): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    execFile(
      "git",
      args,
      {
        cwd,
        encoding: "utf8",
        maxBuffer: 16 * 1024 * 1024,
        env: { ...process.env, GIT_TERMINAL_PROMPT: "0", LC_ALL: "C" },
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`git ${args.join(" ")} failed: ${stderr.trim() || error.message}`));
          return;
        }
        resolvePromise(stdout.trim());
      },
    );
  });
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function gitPath(repositoryRoot: string, name: string): Promise<string> {
  const path = await runGit(repositoryRoot, ["rev-parse", "--git-path", name]);
  return resolve(repositoryRoot, path);
}

async function collectWorktreeRecords(repositoryRoot: string): Promise<FileRecord[]> {
  const entries = (await readdir(repositoryRoot)).filter((entry) => entry !== ".git").sort();
  return (await Promise.all(entries.map((entry) => collectRecords(repositoryRoot, join(repositoryRoot, entry))))).flat();
}

async function copyWorktree(repositoryRoot: string, payloadRoot: string): Promise<void> {
  await mkdir(payloadRoot, { recursive: true, mode: 0o700 });
  for (const entry of (await readdir(repositoryRoot)).filter((item) => item !== ".git")) {
    await cp(join(repositoryRoot, entry), join(payloadRoot, entry), {
      recursive: true,
      dereference: false,
      preserveTimestamps: true,
    });
  }
}

async function clearWorktree(repositoryRoot: string): Promise<void> {
  for (const entry of (await readdir(repositoryRoot)).filter((item) => item !== ".git")) {
    await rm(join(repositoryRoot, entry), { recursive: true, force: true });
  }
}

async function readGitState(repositoryRoot: string): Promise<GitState> {
  const [records, head, symbolicRef, indexPath] = await Promise.all([
    collectWorktreeRecords(repositoryRoot),
    runGit(repositoryRoot, ["rev-parse", "HEAD"]),
    runGit(repositoryRoot, ["symbolic-ref", "-q", "HEAD"]).catch(() => ""),
    gitPath(repositoryRoot, "index"),
  ]);
  const [index, indexStat] = await Promise.all([readFile(indexPath), lstat(indexPath)]);
  const indexDigest = sha256(index);
  const headRef = symbolicRef || null;
  const witness = sha256(JSON.stringify({
    records: recordsWitness(records),
    head,
    headRef,
    indexDigest,
    indexMode: indexStat.mode,
  }));
  return { records, head, headRef, index, indexDigest, indexMode: indexStat.mode, witness };
}

async function restoreGitState(
  repositoryRoot: string,
  payloadRoot: string,
  originalHead: string,
  index: Buffer,
  indexMode: number,
): Promise<void> {
  await runGit(repositoryRoot, ["reset", "--hard", originalHead]);
  await clearWorktree(repositoryRoot);
  const records = await collectWorktreeRecords(payloadRoot);
  await restoreRecords(payloadRoot, repositoryRoot, records);
  const indexPath = await gitPath(repositoryRoot, "index");
  await writeFile(indexPath, index, { mode: 0o600 });
  await chmod(indexPath, indexMode);
}

async function assertSupportedRepository(repositoryRoot: string): Promise<void> {
  const dotGit = await lstat(join(repositoryRoot, ".git"));
  if (!dotGit.isDirectory() || dotGit.isSymbolicLink()) {
    throw new Error("Git reset recovery does not yet support linked worktrees or redirected .git paths");
  }
  const bare = await runGit(repositoryRoot, ["rev-parse", "--is-bare-repository"]);
  if (bare !== "false") throw new Error("Git reset recovery requires a non-bare worktree");
  const configNames = (await runGit(repositoryRoot, ["config", "--name-only", "--list"]))
    .split("\n")
    .map((name) => name.toLowerCase());
  if (
    configNames.some(
      (name) =>
        ["core.hookspath", "core.fsmonitor"].includes(name) ||
        /^filter\..*\.(clean|smudge|process)$/.test(name),
    )
  ) {
    throw new Error("Git reset recovery refuses custom hook, fsmonitor, or content-filter configuration");
  }
  const submodules = await runGit(repositoryRoot, ["submodule", "status", "--recursive"]);
  if (submodules) throw new Error("Git reset recovery does not yet support repositories with submodules");
  for (const marker of ["MERGE_HEAD", "CHERRY_PICK_HEAD", "REVERT_HEAD", "REBASE_HEAD", "rebase-merge", "rebase-apply"]) {
    if (await pathExists(await gitPath(repositoryRoot, marker))) {
      throw new Error(`Git reset recovery refuses repositories with an in-progress operation: ${marker}`);
    }
  }
}

export class GitRecoveryService {
  constructor(
    private readonly dataDir: string,
    private readonly store: OperationStore,
    private readonly verifier: CapabilityVerifier,
  ) {}

  async prepare(input: PrepareGitResetHard): Promise<{ operation: GitResetHardRecoveryOperation }> {
    const requestedRoot = await realpath(resolve(input.repositoryRoot));
    const repositoryRoot = await realpath(await runGit(requestedRoot, ["rev-parse", "--show-toplevel"]));
    if (repositoryRoot !== requestedRoot) throw new Error(`repositoryRoot must be the Git worktree root: ${repositoryRoot}`);
    await assertSupportedRepository(repositoryRoot);
    const targetCommit = await runGit(repositoryRoot, [
      "rev-parse",
      "--verify",
      "--end-of-options",
      `${input.target}^{commit}`,
    ]);
    const original = await readGitState(repositoryRoot);

    const id = randomUUID();
    const artifactDir = join(this.dataDir, "artifacts", id);
    const payloadRoot = join(artifactDir, "worktree");
    await copyWorktree(repositoryRoot, payloadRoot);
    await writeFile(join(artifactDir, "index"), original.index, { mode: 0o600 });

    const drillParent = await mkdtemp(join(tmpdir(), "recovery-authority-git-proof-"));
    const drillRepository = join(drillParent, basename(repositoryRoot));
    try {
      await cp(repositoryRoot, drillRepository, { recursive: true, dereference: false, preserveTimestamps: true });
      await runGit(drillRepository, ["reset", "--hard", targetCommit]);
      await restoreGitState(drillRepository, payloadRoot, original.head, original.index, original.indexMode);
      const restored = await readGitState(drillRepository);
      if (restored.witness !== original.witness) throw new Error("Git restore drill produced a different state witness");
    } finally {
      await rm(drillParent, { recursive: true, force: true });
    }

    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + input.ttlSeconds * 1000);
    const proofDigest = sha256(JSON.stringify({
      id,
      kind: "git.reset-hard",
      stateWitness: original.witness,
      targetCommit,
      createdAt: createdAt.toISOString(),
    }));
    const operation: GitResetHardRecoveryOperation = {
      id,
      kind: "git.reset-hard",
      status: "proven",
      workspaceRoot: repositoryRoot,
      repositoryRoot,
      paths: ["."],
      reason: input.reason,
      artifactDir,
      records: original.records,
      stateWitness: original.witness,
      proofDigest,
      targetCommit,
      originalHead: original.head,
      originalHeadRef: original.headRef,
      indexDigest: original.indexDigest,
      indexMode: original.indexMode,
      postCommitWitness: null,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      committedAt: null,
      recoveredAt: null,
      failure: null,
    };
    await this.store.put(operation);
    return { operation };
  }

  async commit(operationId: string, capability: string): Promise<GitResetHardRecoveryOperation> {
    const operation = await this.get(operationId);
    if (operation.status !== "proven") throw new Error(`Operation is not committable: ${operation.status}`);
    const claims = this.verifier.verify(capability);
    if (
      claims.operationId !== operation.id ||
      claims.kind !== operation.kind ||
      claims.proofDigest !== operation.proofDigest ||
      claims.stateWitness !== operation.stateWitness
    ) {
      throw new Error("Capability is not bound to this Git recovery proof");
    }
    if ((await readGitState(operation.repositoryRoot)).witness !== operation.stateWitness) {
      throw new Error("Protected Git state changed after the recovery proof was issued");
    }

    await runGit(operation.repositoryRoot, ["reset", "--hard", operation.targetCommit]);
    const postCommitWitness = (await readGitState(operation.repositoryRoot)).witness;
    const committed: GitResetHardRecoveryOperation = {
      ...operation,
      status: "committed",
      postCommitWitness,
      committedAt: new Date().toISOString(),
    };
    await this.store.put(committed);
    return committed;
  }

  async recover(operationId: string): Promise<GitResetHardRecoveryOperation> {
    const operation = await this.get(operationId);
    if (operation.status !== "committed" || !operation.postCommitWitness) {
      throw new Error(`Operation is not recoverable from status: ${operation.status}`);
    }
    if ((await readGitState(operation.repositoryRoot)).witness !== operation.postCommitWitness) {
      throw new Error("Git recovery would overwrite state changed after the authorized reset");
    }
    const index = await readFile(join(operation.artifactDir, "index"));
    if (sha256(index) !== operation.indexDigest) throw new Error("Git index recovery artifact witness is invalid");
    await restoreGitState(
      operation.repositoryRoot,
      join(operation.artifactDir, "worktree"),
      operation.originalHead,
      index,
      operation.indexMode,
    );
    if ((await readGitState(operation.repositoryRoot)).witness !== operation.stateWitness) {
      throw new Error("Git recovery completed but witness verification failed");
    }
    const recovered: GitResetHardRecoveryOperation = {
      ...operation,
      status: "recovered",
      recoveredAt: new Date().toISOString(),
    };
    await this.store.put(recovered);
    return recovered;
  }

  async get(operationId: string): Promise<GitResetHardRecoveryOperation> {
    const operation = await this.store.get(operationId);
    if (operation.kind !== "git.reset-hard") throw new Error(`Operation is not a Git reset: ${operation.kind}`);
    return operation;
  }
}

export async function createGitRecoveryService(dataDir: string): Promise<GitRecoveryService> {
  const store = new OperationStore(dataDir);
  const verifier = await PublicCapabilityVerifier.load(dataDir);
  return new GitRecoveryService(dataDir, store, verifier);
}
