import { chmod, cp, lstat, mkdir, mkdtemp, readFile, readlink, realpath, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";
import type { FileRecord, FilesystemRecoveryOperation, PrepareFilesystemDelete } from "./contracts.js";
import { PublicCapabilityVerifier, type CapabilityVerifier, sha256 } from "./crypto.js";
import { OperationStore } from "./store.js";
import { assertTargetExcludesProtectedRoots, inspectRuntimeIdentity } from "./identity.js";

function assertInside(root: string, candidate: string): void {
  const rel = relative(root, candidate);
  if (rel === "" || rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    throw new Error(`Path escapes or equals the workspace root: ${candidate}`);
  }
}

function assertWithin(root: string, candidate: string): void {
  const rel = relative(root, candidate);
  if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    throw new Error(`Path escapes the workspace root through a symlink: ${candidate}`);
  }
}

function assertDisjoint(paths: string[]): void {
  for (const [index, parent] of paths.entries()) {
    for (const child of paths.slice(index + 1)) {
      const rel = relative(parent, child);
      if (rel !== "" && rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel)) {
        throw new Error(`Recovery scopes overlap: ${parent} contains ${child}`);
      }
    }
  }
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

async function hashFile(path: string): Promise<string> {
  return sha256(await readFile(path));
}

export async function collectRecords(root: string, absolutePath: string): Promise<FileRecord[]> {
  const stat = await lstat(absolutePath);
  const path = relative(root, absolutePath);

  if (stat.isSymbolicLink()) {
    return [{ path, kind: "symlink", mode: stat.mode, sha256: null, symlinkTarget: await readlink(absolutePath) }];
  }
  if (stat.isFile()) {
    return [{ path, kind: "file", mode: stat.mode, sha256: await hashFile(absolutePath), symlinkTarget: null }];
  }
  if (!stat.isDirectory()) throw new Error(`Unsupported filesystem object: ${path}`);

  const { readdir } = await import("node:fs/promises");
  const children = await readdir(absolutePath);
  const nested = await Promise.all(children.sort().map((child) => collectRecords(root, join(absolutePath, child))));
  return [{ path, kind: "directory", mode: stat.mode, sha256: null, symlinkTarget: null }, ...nested.flat()];
}

export function recordsWitness(records: FileRecord[]): string {
  return sha256(JSON.stringify([...records].sort((a, b) => a.path.localeCompare(b.path))));
}

export async function restoreRecords(payloadRoot: string, destinationRoot: string, records: FileRecord[]): Promise<void> {
  for (const record of records.filter((item) => item.kind === "directory").sort((a, b) => a.path.length - b.path.length)) {
    await mkdir(join(destinationRoot, record.path), { recursive: true, mode: record.mode });
  }
  for (const record of records.filter((item) => item.kind !== "directory")) {
    const destination = join(destinationRoot, record.path);
    await mkdir(dirname(destination), { recursive: true });
    if (record.kind === "symlink") {
      if (!record.symlinkTarget) throw new Error(`Missing symlink target for ${record.path}`);
      await symlink(record.symlinkTarget, destination);
    } else {
      await cp(join(payloadRoot, record.path), destination, { preserveTimestamps: true });
      await chmod(destination, record.mode);
    }
  }
  for (const record of records.filter((item) => item.kind === "directory").sort((a, b) => b.path.length - a.path.length)) {
    await chmod(join(destinationRoot, record.path), record.mode);
  }
}

export class FilesystemRecoveryService {
  constructor(
    private readonly dataDir: string,
    private readonly store: OperationStore,
    private readonly verifier: CapabilityVerifier,
  ) {}

  async prepare(input: PrepareFilesystemDelete): Promise<{ operation: FilesystemRecoveryOperation }> {
    const workspaceRoot = await realpath(resolve(input.workspaceRoot));
    const requestedPaths = [...new Set(input.paths.map((path) => path.replace(/^\.\//, "")))];
    const absolutePaths = requestedPaths.map((path) => resolve(workspaceRoot, path)).sort();
    absolutePaths.forEach((path) => assertInside(workspaceRoot, path));
    const identity = await inspectRuntimeIdentity(this.dataDir);
    for (const path of absolutePaths) {
      assertTargetExcludesProtectedRoots(path, [
        { label: "account home", path: identity.accountHome },
        { label: "authority data root", path: identity.authorityDataRoot },
      ]);
    }
    assertDisjoint(absolutePaths);
    for (const path of absolutePaths) {
      assertWithin(workspaceRoot, await realpath(dirname(path)));
    }
    const normalizedPaths = absolutePaths.map((path) => relative(workspaceRoot, path));

    const records = (await Promise.all(absolutePaths.map((path) => collectRecords(workspaceRoot, path)))).flat();
    const stateWitness = recordsWitness(records);
    const id = randomUUID();
    const artifactDir = join(this.dataDir, "artifacts", id);
    const payloadRoot = join(artifactDir, "payload");
    await mkdir(payloadRoot, { recursive: true, mode: 0o700 });

    for (const absolutePath of absolutePaths) {
      const destination = join(payloadRoot, relative(workspaceRoot, absolutePath));
      await mkdir(dirname(destination), { recursive: true });
      await cp(absolutePath, destination, { recursive: true, dereference: false, preserveTimestamps: true });
    }

    const restoreRoot = await mkdtemp(join(tmpdir(), "recovery-authority-proof-"));
    try {
      await restoreRecords(payloadRoot, restoreRoot, records);
      const restoredRecords = (await Promise.all(normalizedPaths.map((path) => collectRecords(restoreRoot, join(restoreRoot, path))))).flat();
      if (recordsWitness(restoredRecords) !== stateWitness) throw new Error("Restore drill produced a different state witness");
    } finally {
      await rm(restoreRoot, { recursive: true, force: true });
    }

    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + input.ttlSeconds * 1000);
    const proofDigest = sha256(JSON.stringify({ id, stateWitness, records, createdAt: createdAt.toISOString() }));
    const operation: FilesystemRecoveryOperation = {
      id,
      kind: "filesystem.delete",
      status: "proven",
      workspaceRoot,
      paths: normalizedPaths,
      reason: input.reason,
      artifactDir,
      records,
      stateWitness,
      proofDigest,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      committedAt: null,
      recoveredAt: null,
      failure: null,
    };
    await this.store.put(operation);

    return { operation };
  }

  async commit(operationId: string, capability: string): Promise<FilesystemRecoveryOperation> {
    const operation = await this.store.get(operationId);
    if (operation.kind !== "filesystem.delete") throw new Error(`Operation is not a filesystem delete: ${operation.kind}`);
    if (operation.status !== "proven") throw new Error(`Operation is not committable: ${operation.status}`);
    const claims = this.verifier.verify(capability);
    if (
      claims.operationId !== operation.id ||
      claims.kind !== operation.kind ||
      claims.proofDigest !== operation.proofDigest ||
      claims.stateWitness !== operation.stateWitness
    ) {
      throw new Error("Capability is not bound to this recovery proof");
    }

    const currentRecords = (await Promise.all(operation.paths.map((path) => collectRecords(operation.workspaceRoot, join(operation.workspaceRoot, path))))).flat();
    if (recordsWitness(currentRecords) !== operation.stateWitness) throw new Error("Protected state changed after the recovery proof was issued");

    for (const path of [...operation.paths].sort((a, b) => b.length - a.length)) {
      await rm(join(operation.workspaceRoot, path), { recursive: true, force: false });
    }
    const committed: FilesystemRecoveryOperation = { ...operation, status: "committed", committedAt: new Date().toISOString() };
    await this.store.put(committed);
    return committed;
  }

  async recover(operationId: string): Promise<FilesystemRecoveryOperation> {
    const operation = await this.store.get(operationId);
    if (operation.kind !== "filesystem.delete") throw new Error(`Operation is not a filesystem delete: ${operation.kind}`);
    if (operation.status !== "committed") throw new Error(`Operation is not recoverable from status: ${operation.status}`);
    for (const path of operation.paths) {
      if (await pathExists(join(operation.workspaceRoot, path))) {
        throw new Error(`Recovery would overwrite live state: ${path}`);
      }
    }
    await restoreRecords(join(operation.artifactDir, "payload"), operation.workspaceRoot, operation.records);
    const restoredRecords = (await Promise.all(operation.paths.map((path) => collectRecords(operation.workspaceRoot, join(operation.workspaceRoot, path))))).flat();
    if (recordsWitness(restoredRecords) !== operation.stateWitness) throw new Error("Recovery completed but invariant verification failed");
    const recovered: FilesystemRecoveryOperation = { ...operation, status: "recovered", recoveredAt: new Date().toISOString() };
    await this.store.put(recovered);
    return recovered;
  }

  async get(operationId: string): Promise<FilesystemRecoveryOperation> {
    const operation = await this.store.get(operationId);
    if (operation.kind !== "filesystem.delete") throw new Error(`Operation is not a filesystem delete: ${operation.kind}`);
    return operation;
  }
}

export async function createFilesystemRecoveryService(dataDir: string): Promise<FilesystemRecoveryService> {
  const store = new OperationStore(dataDir);
  const verifier = await PublicCapabilityVerifier.load(dataDir);
  return new FilesystemRecoveryService(dataDir, store, verifier);
}
