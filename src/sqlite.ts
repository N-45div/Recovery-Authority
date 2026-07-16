import { Database } from "bun:sqlite";
import { randomUUID } from "node:crypto";
import { chmod, lstat, mkdir, readFile, realpath, rename, rm, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import type { PrepareSqliteMutation, SqliteRecoveryOperation } from "./contracts.js";
import { CapabilitySigner, sha256 } from "./crypto.js";
import { OperationStore } from "./store.js";

function assertInside(root: string, candidate: string): void {
  const rel = relative(root, candidate);
  if (rel === "" || rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    throw new Error(`Database path escapes or equals the workspace root: ${candidate}`);
  }
}

function assertWithin(root: string, candidate: string): void {
  const rel = relative(root, candidate);
  if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    throw new Error(`Database path escapes the workspace root through a symlink: ${candidate}`);
  }
}

function validateMutation(sql: string): void {
  if (/\b(attach|detach|vacuum|pragma|begin|commit|rollback)\b/i.test(sql)) {
    throw new Error("Transaction control, PRAGMA, ATTACH, DETACH, and VACUUM are outside the SQLite recovery adapter");
  }
  if (!/\b(delete\s+from|drop\s+(table|index|view|trigger)|update\s+|alter\s+table|replace\s+into)\b/i.test(sql)) {
    throw new Error("SQL does not contain a supported destructive SQLite mutation");
  }
}

function serializeDatabase(path: string, readonly: boolean): Buffer {
  const database = new Database(path, { readonly, create: false, strict: true });
  try {
    return database.serialize();
  } finally {
    database.close();
  }
}

function assertIntegrity(database: Database): void {
  const rows = database.query<{ integrity_check: string }, []>("PRAGMA integrity_check").all();
  if (rows.length !== 1 || rows[0]?.integrity_check !== "ok") {
    throw new Error(`SQLite integrity check failed: ${JSON.stringify(rows)}`);
  }
}

function drillMutation(snapshot: Buffer, sql: string): void {
  const database = Database.deserialize(snapshot, { strict: true });
  try {
    const mutate = database.transaction(() => database.exec(sql));
    mutate.immediate();
    assertIntegrity(database);
  } finally {
    database.close();
  }
}

export class SqliteRecoveryService {
  constructor(
    private readonly dataDir: string,
    private readonly store: OperationStore,
    private readonly signer: CapabilitySigner,
  ) {}

  async prepare(input: PrepareSqliteMutation): Promise<{ operation: SqliteRecoveryOperation }> {
    validateMutation(input.sql);
    const workspaceRoot = await realpath(resolve(input.workspaceRoot));
    const databasePath = resolve(workspaceRoot, input.databasePath);
    assertInside(workspaceRoot, databasePath);
    assertWithin(workspaceRoot, await realpath(dirname(databasePath)));
    const stat = await lstat(databasePath);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("SQLite database must be a regular file inside the workspace");

    const snapshot = serializeDatabase(databasePath, true);
    const stateWitness = sha256(snapshot);
    drillMutation(snapshot, input.sql);

    const id = randomUUID();
    const artifactDir = join(this.dataDir, "artifacts", id);
    await mkdir(artifactDir, { recursive: true, mode: 0o700 });
    await writeFile(join(artifactDir, "before.sqlite"), snapshot, { mode: 0o600 });
    const artifactWitness = sha256(await readFile(join(artifactDir, "before.sqlite")));
    if (artifactWitness !== stateWitness) throw new Error("SQLite recovery artifact failed witness verification");

    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + input.ttlSeconds * 1000);
    const statementDigest = sha256(input.sql);
    const proofDigest = sha256(JSON.stringify({
      id,
      kind: "sqlite.mutate",
      stateWitness,
      statementDigest,
      createdAt: createdAt.toISOString(),
    }));
    const relativeDatabasePath = relative(workspaceRoot, databasePath);
    const operation: SqliteRecoveryOperation = {
      id,
      kind: "sqlite.mutate",
      status: "proven",
      workspaceRoot,
      paths: [relativeDatabasePath],
      reason: input.reason,
      artifactDir,
      databasePath: relativeDatabasePath,
      stateWitness,
      statementDigest,
      proofDigest,
      integrityCheck: "ok",
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

  async commit(operationId: string, capability: string, sql: string): Promise<SqliteRecoveryOperation> {
    const operation = await this.get(operationId);
    if (operation.status !== "proven") throw new Error(`Operation is not committable: ${operation.status}`);
    const statementDigest = sha256(sql);
    if (statementDigest !== operation.statementDigest) throw new Error("SQL does not match the restore-tested statement");
    const claims = this.signer.verify(capability);
    if (
      claims.operationId !== operation.id ||
      claims.kind !== operation.kind ||
      claims.proofDigest !== operation.proofDigest ||
      claims.stateWitness !== operation.stateWitness ||
      claims.statementDigest !== operation.statementDigest
    ) {
      throw new Error("Capability is not bound to this SQLite recovery proof");
    }

    const databasePath = join(operation.workspaceRoot, operation.databasePath);
    const database = new Database(databasePath, { create: false, strict: true });
    let postCommitWitness: string;
    try {
      if (sha256(database.serialize()) !== operation.stateWitness) {
        throw new Error("Protected SQLite state changed after the recovery proof was issued");
      }
      const mutate = database.transaction(() => database.exec(sql));
      mutate.immediate();
      assertIntegrity(database);
      postCommitWitness = sha256(database.serialize());
    } finally {
      database.close();
    }

    const committed: SqliteRecoveryOperation = {
      ...operation,
      status: "committed",
      postCommitWitness,
      committedAt: new Date().toISOString(),
    };
    await this.store.put(committed);
    return committed;
  }

  async recover(operationId: string): Promise<SqliteRecoveryOperation> {
    const operation = await this.get(operationId);
    if (operation.status !== "committed" || !operation.postCommitWitness) {
      throw new Error(`Operation is not recoverable from status: ${operation.status}`);
    }
    const databasePath = join(operation.workspaceRoot, operation.databasePath);
    if (sha256(serializeDatabase(databasePath, true)) !== operation.postCommitWitness) {
      throw new Error("SQLite recovery would overwrite state changed after the authorized mutation");
    }

    const snapshot = await readFile(join(operation.artifactDir, "before.sqlite"));
    if (sha256(snapshot) !== operation.stateWitness) throw new Error("SQLite recovery artifact witness is invalid");
    const restored = Database.deserialize(snapshot, { readonly: true, strict: true });
    try {
      assertIntegrity(restored);
    } finally {
      restored.close();
    }

    const mode = (await lstat(databasePath)).mode;
    const temporaryPath = `${databasePath}.recovery-${operation.id}.tmp`;
    await writeFile(temporaryPath, snapshot, { mode: 0o600 });
    await chmod(temporaryPath, mode);
    await Promise.all([
      rm(`${databasePath}-wal`, { force: true }),
      rm(`${databasePath}-shm`, { force: true }),
    ]);
    await rename(temporaryPath, databasePath);
    if (sha256(serializeDatabase(databasePath, true)) !== operation.stateWitness) {
      throw new Error("SQLite recovery completed but witness verification failed");
    }

    const recovered: SqliteRecoveryOperation = {
      ...operation,
      status: "recovered",
      recoveredAt: new Date().toISOString(),
    };
    await this.store.put(recovered);
    return recovered;
  }

  async get(operationId: string): Promise<SqliteRecoveryOperation> {
    const operation = await this.store.get(operationId);
    if (operation.kind !== "sqlite.mutate") throw new Error(`Operation is not a SQLite mutation: ${operation.kind}`);
    return operation;
  }
}

export async function createSqliteRecoveryService(dataDir: string): Promise<SqliteRecoveryService> {
  const store = new OperationStore(dataDir);
  const signer = await CapabilitySigner.load(dataDir);
  return new SqliteRecoveryService(dataDir, store, signer);
}
