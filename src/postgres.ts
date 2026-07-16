import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { astVisitor, parse, type QName, type Statement } from "pgsql-ast-parser";
import type { PostgresRecoveryOperation, PreparePostgresMutation } from "./contracts.js";
import { CapabilitySigner, sha256 } from "./crypto.js";
import { OperationStore } from "./store.js";

const SAFE_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_$]*$/;
const DEFAULT_MAX_OUTPUT_BYTES = 512 * 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 120_000;

export interface PostgresTools {
  pgDump: string;
  psql: string;
  maxOutputBytes?: number;
  timeoutMs?: number;
}

interface CommandResult {
  stdout: Buffer;
  stderr: Buffer;
}

interface ValidatedMutation {
  targets: QName[];
}

function toolsFromEnvironment(): PostgresTools {
  return {
    pgDump: process.env.RECOVERY_AUTHORITY_PG_DUMP ?? "pg_dump",
    psql: process.env.RECOVERY_AUTHORITY_PSQL ?? "psql",
    maxOutputBytes: Number(process.env.RECOVERY_AUTHORITY_MAX_DUMP_BYTES) || DEFAULT_MAX_OUTPUT_BYTES,
    timeoutMs: Number(process.env.RECOVERY_AUTHORITY_POSTGRES_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
  };
}

function parseConnectionUri(connectionUri: string): URL {
  const parsed = new URL(connectionUri);
  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("connectionUri must use the postgres or postgresql scheme");
  }
  if (!parsed.hostname || !parsed.pathname || parsed.pathname === "/") {
    throw new Error("connectionUri must identify a PostgreSQL host and database");
  }
  return parsed;
}

function connectionFingerprint(connectionUri: string): string {
  const parsed = parseConnectionUri(connectionUri);
  parsed.password = "";
  return sha256(parsed.toString());
}

function withDatabase(connectionUri: string, database: string): string {
  const parsed = parseConnectionUri(connectionUri);
  parsed.pathname = `/${encodeURIComponent(database)}`;
  return parsed.toString();
}

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function sqlLiteral(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

function decodedPassword(parsed: URL): string {
  try {
    return decodeURIComponent(parsed.password);
  } catch {
    return parsed.password;
  }
}

function redact(text: string, connectionUri: string): string {
  const parsed = parseConnectionUri(connectionUri);
  const secrets = [connectionUri, parsed.password, decodedPassword(parsed)].filter(Boolean);
  return secrets.reduce((result, secret) => result.replaceAll(secret, "[redacted]"), text);
}

async function runCommand(
  command: string,
  args: string[],
  options: {
    input?: Uint8Array;
    maxOutputBytes: number;
    timeoutMs: number;
    connectionUri: string;
  },
): Promise<CommandResult> {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["pipe", "pipe", "pipe"] });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let settled = false;

    const finish = (error?: Error, result?: CommandResult): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (error) reject(error);
      else resolve(result as CommandResult);
    };
    const exceedLimit = (): void => {
      child.kill("SIGKILL");
      finish(new Error(`PostgreSQL tool output exceeded ${options.maxOutputBytes} bytes`));
    };

    child.stdout.on("data", (chunk: Buffer) => {
      stdoutBytes += chunk.length;
      if (stdoutBytes > options.maxOutputBytes) return exceedLimit();
      stdout.push(chunk);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderrBytes += chunk.length;
      if (stderrBytes > 1024 * 1024) return exceedLimit();
      stderr.push(chunk);
    });
    child.on("error", (error) => finish(new Error(`Failed to start ${command}: ${error.message}`)));
    child.on("close", (code, signal) => {
      if (settled) return;
      const result = { stdout: Buffer.concat(stdout), stderr: Buffer.concat(stderr) };
      if (code === 0) return finish(undefined, result);
      const detail = redact(result.stderr.toString("utf8").trim(), options.connectionUri);
      finish(new Error(`${command} failed (${signal ?? code}): ${detail || "no diagnostic output"}`));
    });

    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
      finish(new Error(`${command} exceeded the ${options.timeoutMs}ms timeout`));
    }, options.timeoutMs);
    child.stdin.on("error", (error) => {
      if ((error as NodeJS.ErrnoException).code !== "EPIPE") finish(error);
    });
    child.stdin.end(options.input);
  });
}

function canonicalDump(dump: Uint8Array): Buffer {
  const normalized = Buffer.from(dump)
    .toString("utf8")
    .replace(/^\\(?:un)?restrict\s+\S+\r?\n/gm, "");
  return Buffer.from(normalized, "utf8");
}

function witness(dump: Uint8Array): string {
  return sha256(canonicalDump(dump));
}

function validateTarget(target: QName, schema: string): void {
  if (!SAFE_IDENTIFIER.test(target.name)) {
    throw new Error(`PostgreSQL target uses an unsupported identifier: ${target.name}`);
  }
  if (target.schema && target.schema !== schema) {
    throw new Error(`PostgreSQL mutation escapes authorized schema ${schema}: ${target.schema}.${target.name}`);
  }
}

export function validatePostgresMutation(sql: string, schema: string): ValidatedMutation {
  let statements: Statement[];
  try {
    statements = parse(sql);
  } catch (error) {
    throw new Error(`PostgreSQL SQL could not be parsed safely: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (statements.length !== 1 || !statements[0]) {
    throw new Error("PostgreSQL recovery authorizes exactly one destructive SQL statement");
  }

  const statement = statements[0];
  let targets: QName[];
  switch (statement.type) {
    case "delete":
      targets = [statement.from];
      break;
    case "update":
      targets = [statement.table];
      break;
    case "truncate table":
      targets = statement.tables;
      break;
    case "drop table":
    case "drop sequence":
    case "drop index":
      targets = statement.names;
      break;
    default:
      throw new Error(`Unsupported PostgreSQL mutation type: ${statement.type}`);
  }
  targets.forEach((target) => validateTarget(target, schema));

  const referencedRelations: QName[] = [];
  let unsafeExpression: string | null = null;
  const visitor = astVisitor((base) => ({
    tableRef: (table) => {
      referencedRelations.push(table);
      base.super().tableRef(table);
    },
    call: (call) => {
      unsafeExpression = "function calls";
      base.super().call(call);
    },
    selection: (selection) => {
      unsafeExpression = "nested SELECT statements";
      base.super().selection(selection);
    },
    default: (value) => {
      unsafeExpression = "DEFAULT expressions";
      base.super().default(value);
    },
  }));
  visitor.statement(statement);
  referencedRelations.forEach((relation) => validateTarget(relation, schema));
  if (unsafeExpression) {
    throw new Error(`PostgreSQL recovery does not authorize ${unsafeExpression} in destructive statements`);
  }
  return { targets };
}

export class PostgresRecoveryService {
  private readonly tools: Required<PostgresTools>;

  constructor(
    private readonly dataDir: string,
    private readonly store: OperationStore,
    private readonly signer: CapabilitySigner,
    tools: PostgresTools = toolsFromEnvironment(),
  ) {
    this.tools = {
      pgDump: tools.pgDump,
      psql: tools.psql,
      maxOutputBytes: tools.maxOutputBytes ?? DEFAULT_MAX_OUTPUT_BYTES,
      timeoutMs: tools.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    };
  }

  private async command(command: string, args: string[], connectionUri: string, input?: Uint8Array): Promise<CommandResult> {
    return await runCommand(command, args, {
      ...(input ? { input } : {}),
      connectionUri,
      maxOutputBytes: this.tools.maxOutputBytes,
      timeoutMs: this.tools.timeoutMs,
    });
  }

  private async dump(connectionUri: string): Promise<Buffer> {
    const result = await this.command(this.tools.pgDump, [
      "--dbname", connectionUri,
      "--format=p",
      "--clean",
      "--if-exists",
      "--no-password",
    ], connectionUri);
    return result.stdout;
  }

  private async execute(connectionUri: string, sql: string, schema: string): Promise<void> {
    const scopedSql = `SET LOCAL search_path TO ${quoteIdentifier(schema)}, pg_catalog;\n${sql}`;
    await this.command(this.tools.psql, [
      "--no-psqlrc",
      "--no-password",
      "--set", "ON_ERROR_STOP=1",
      "--single-transaction",
      "--dbname", connectionUri,
      "--command", scopedSql,
    ], connectionUri);
  }

  private async restore(connectionUri: string, dump: Uint8Array): Promise<void> {
    await this.command(this.tools.psql, [
      "--no-psqlrc",
      "--no-password",
      "--set", "ON_ERROR_STOP=1",
      "--single-transaction",
      "--dbname", connectionUri,
    ], connectionUri, dump);
  }

  private async assertRuntimeGuardrails(connectionUri: string, targets: QName[], schema: string): Promise<void> {
    const names = targets.map((target) => sqlLiteral(target.name)).join(", ");
    const query = `
SELECT CASE WHEN
  EXISTS (SELECT 1 FROM pg_event_trigger WHERE evtenabled <> 'D')
  OR EXISTS (SELECT 1 FROM pg_publication WHERE puballtables)
  OR EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class c ON c.oid = pr.prrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = ${sqlLiteral(schema)} AND c.relname IN (${names})
  )
  OR EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE NOT t.tgisinternal AND t.tgenabled <> 'D'
      AND n.nspname = ${sqlLiteral(schema)} AND c.relname IN (${names})
  )
THEN 'unsafe' ELSE 'safe' END;`;
    const result = await this.command(this.tools.psql, [
      "--no-psqlrc",
      "--no-password",
      "--set", "ON_ERROR_STOP=1",
      "--tuples-only",
      "--no-align",
      "--dbname", connectionUri,
      "--command", query,
    ], connectionUri);
    if (result.stdout.toString("utf8").trim() !== "safe") {
      throw new Error("PostgreSQL target has user triggers, event triggers, or logical replication that can escape exact recovery");
    }
  }

  private async createDrillDatabase(connectionUri: string, database: string): Promise<string> {
    const adminUri = withDatabase(connectionUri, "postgres");
    await this.command(this.tools.psql, [
      "--no-psqlrc",
      "--no-password",
      "--set", "ON_ERROR_STOP=1",
      "--dbname", adminUri,
      "--command", `CREATE DATABASE ${quoteIdentifier(database)} TEMPLATE template0`,
    ], connectionUri);
    return withDatabase(connectionUri, database);
  }

  private async dropDrillDatabase(connectionUri: string, database: string): Promise<void> {
    const adminUri = withDatabase(connectionUri, "postgres");
    await this.command(this.tools.psql, [
      "--no-psqlrc",
      "--no-password",
      "--set", "ON_ERROR_STOP=1",
      "--dbname", adminUri,
      "--command", `DROP DATABASE IF EXISTS ${quoteIdentifier(database)} WITH (FORCE)`,
    ], connectionUri);
  }

  async prepare(input: PreparePostgresMutation): Promise<{ operation: PostgresRecoveryOperation }> {
    const parsedUri = parseConnectionUri(input.connectionUri);
    const password = decodedPassword(parsedUri);
    if (input.reason.includes(input.connectionUri) || (password && input.reason.includes(password))) {
      throw new Error("PostgreSQL credentials must not appear in the persisted reason");
    }
    const validation = validatePostgresMutation(input.sql, input.schema);
    await this.assertRuntimeGuardrails(input.connectionUri, validation.targets, input.schema);
    const snapshot = await this.dump(input.connectionUri);
    const stateWitness = witness(snapshot);
    const id = randomUUID();
    const drillDatabase = `recovery_drill_${id.replaceAll("-", "")}`;
    const drillUri = await this.createDrillDatabase(input.connectionUri, drillDatabase);
    let drillPostWitness = "";
    try {
      await this.restore(drillUri, snapshot);
      if (witness(await this.dump(drillUri)) !== stateWitness) {
        throw new Error("PostgreSQL recovery drill could not reproduce the protected database witness");
      }
      await this.execute(drillUri, input.sql, input.schema);
      drillPostWitness = witness(await this.dump(drillUri));
    } finally {
      await this.dropDrillDatabase(input.connectionUri, drillDatabase);
    }

    const artifactDir = join(this.dataDir, "artifacts", id);
    await mkdir(artifactDir, { recursive: true, mode: 0o700 });
    const artifactPath = join(artifactDir, "before.sql");
    await writeFile(artifactPath, snapshot, { mode: 0o600 });
    const artifactDigest = sha256(await readFile(artifactPath));
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + input.ttlSeconds * 1000);
    const statementDigest = sha256(input.sql);
    const fingerprint = connectionFingerprint(input.connectionUri);
    const proofDigest = sha256(JSON.stringify({
      id,
      kind: "postgres.schema-mutate",
      schema: input.schema,
      backupScope: "database",
      connectionFingerprint: fingerprint,
      stateWitness,
      statementDigest,
      artifactDigest,
      drillPostWitness,
      createdAt: createdAt.toISOString(),
    }));
    const operation: PostgresRecoveryOperation = {
      id,
      kind: "postgres.schema-mutate",
      status: "proven",
      workspaceRoot: "postgresql",
      paths: [`schema:${input.schema}`],
      reason: input.reason,
      artifactDir,
      schema: input.schema,
      backupScope: "database",
      connectionFingerprint: fingerprint,
      stateWitness,
      statementDigest,
      artifactDigest,
      drillPostWitness,
      proofDigest,
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

  async commit(operationId: string, capability: string, connectionUri: string, sql: string): Promise<PostgresRecoveryOperation> {
    const operation = await this.get(operationId);
    if (operation.status !== "proven") throw new Error(`Operation is not committable: ${operation.status}`);
    if (connectionFingerprint(connectionUri) !== operation.connectionFingerprint) {
      throw new Error("PostgreSQL connection does not match the restore-tested database");
    }
    if (sha256(sql) !== operation.statementDigest) throw new Error("SQL does not match the restore-tested statement");
    const claims = this.signer.verify(capability);
    if (
      claims.operationId !== operation.id ||
      claims.kind !== operation.kind ||
      claims.proofDigest !== operation.proofDigest ||
      claims.stateWitness !== operation.stateWitness ||
      claims.statementDigest !== operation.statementDigest
    ) {
      throw new Error("Capability is not bound to this PostgreSQL recovery proof");
    }
    const validation = validatePostgresMutation(sql, operation.schema);
    await this.assertRuntimeGuardrails(connectionUri, validation.targets, operation.schema);
    if (witness(await this.dump(connectionUri)) !== operation.stateWitness) {
      throw new Error("Protected PostgreSQL state changed after the recovery proof was issued");
    }
    await this.execute(connectionUri, sql, operation.schema);
    const postCommitWitness = witness(await this.dump(connectionUri));
    const committed: PostgresRecoveryOperation = {
      ...operation,
      status: "committed",
      postCommitWitness,
      committedAt: new Date().toISOString(),
    };
    await this.store.put(committed);
    if (postCommitWitness !== operation.drillPostWitness) {
      throw new Error("PostgreSQL mutation committed, but its live result differs from the restore-tested result; the operation is recorded as recoverable");
    }
    return committed;
  }

  async recover(operationId: string, connectionUri: string): Promise<PostgresRecoveryOperation> {
    const operation = await this.get(operationId);
    if (operation.status !== "committed" || !operation.postCommitWitness) {
      throw new Error(`Operation is not recoverable from status: ${operation.status}`);
    }
    if (connectionFingerprint(connectionUri) !== operation.connectionFingerprint) {
      throw new Error("PostgreSQL connection does not match the restore-tested database");
    }
    if (witness(await this.dump(connectionUri)) !== operation.postCommitWitness) {
      throw new Error("PostgreSQL recovery would overwrite state changed after the authorized mutation");
    }
    const snapshot = await readFile(join(operation.artifactDir, "before.sql"));
    if (sha256(snapshot) !== operation.artifactDigest || witness(snapshot) !== operation.stateWitness) {
      throw new Error("PostgreSQL recovery artifact witness is invalid");
    }
    await this.restore(connectionUri, snapshot);
    if (witness(await this.dump(connectionUri)) !== operation.stateWitness) {
      throw new Error("PostgreSQL recovery completed but witness verification failed");
    }
    const recovered: PostgresRecoveryOperation = {
      ...operation,
      status: "recovered",
      recoveredAt: new Date().toISOString(),
    };
    await this.store.put(recovered);
    return recovered;
  }

  async get(operationId: string): Promise<PostgresRecoveryOperation> {
    const operation = await this.store.get(operationId);
    if (operation.kind !== "postgres.schema-mutate") {
      throw new Error(`Operation is not a PostgreSQL mutation: ${operation.kind}`);
    }
    return operation;
  }
}

export async function createPostgresRecoveryService(dataDir: string, tools?: PostgresTools): Promise<PostgresRecoveryService> {
  const store = new OperationStore(dataDir);
  const signer = await CapabilitySigner.load(dataDir);
  return new PostgresRecoveryService(dataDir, store, signer, tools);
}
