import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = resolve(process.env.PLUGIN_ROOT ?? join(dirname(fileURLToPath(import.meta.url)), ".."));
const container = `recovery-authority-demo-${randomUUID().slice(0, 8)}`;
const connectionUri = "postgresql://postgres:recovery@127.0.0.1:5432/app";
const dataDirOption = process.argv.indexOf("--data-dir");
if (dataDirOption >= 0 && !process.argv[dataDirOption + 1]) throw new Error("--data-dir requires a path");
const retainedDataDir = process.env.RECOVERY_AUTHORITY_DEMO_DATA_DIR ??
  (dataDirOption >= 0 ? process.argv[dataDirOption + 1] : undefined);
const temporaryRoot = retainedDataDir ? null : await mkdtemp(join(tmpdir(), "recovery-authority-demo-"));
const dataDir = resolve(retainedDataDir ?? join(temporaryRoot as string, "authority"));
await mkdir(dataDir, { recursive: true, mode: 0o700 });
let client: Client | null = null;

function docker(args: string[], input?: string): string {
  const result = spawnSync("docker", args, { encoding: "utf8", input });
  if (result.status !== 0) throw new Error(result.stderr || `docker ${args.join(" ")} failed`);
  return result.stdout.trim();
}

function query(sql: string): string {
  return docker([
    "exec", "-i", container,
    "psql", "--no-psqlrc", "--set", "ON_ERROR_STOP=1",
    "--tuples-only", "--no-align", "--username", "postgres", "--dbname", "app",
    "--command", sql,
  ]);
}

async function waitForDatabase(): Promise<void> {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const result = spawnSync("docker", [
      "exec", container,
      "psql", "--username", "postgres", "--dbname", "app", "--command", "SELECT 1",
    ]);
    if (result.status === 0) return;
    await Bun.sleep(250);
  }
  throw new Error("PostgreSQL demo database did not become ready");
}

function rows(): string {
  const users = query("SELECT string_agg(name, ', ' ORDER BY id) FROM public.users");
  const events = query("SELECT string_agg(user_id::text || ':' || event, ', ' ORDER BY id) FROM audit.user_events");
  return `users=[${users}] audit=[${events}]`;
}

async function main(): Promise<void> {
  process.stdout.write("Recovery Authority: proof-bound PostgreSQL authorization\n\n");
  process.stdout.write("[1/7] Launching disposable PostgreSQL 17\n");
  docker([
    "run", "--detach", "--rm", "--name", container,
    "--tmpfs", "/var/lib/postgresql/data:rw,nosuid,size=256m",
    "--env", "POSTGRES_PASSWORD=recovery",
    "--env", "POSTGRES_DB=app",
    "postgres:17-alpine",
  ]);
  await waitForDatabase();

  process.stdout.write("[2/7] Seeding public data and a cross-schema cascade\n");
  query(`
    CREATE TABLE public.users (id bigint PRIMARY KEY, name text NOT NULL);
    CREATE SCHEMA audit;
    CREATE TABLE audit.user_events (
      id bigint PRIMARY KEY,
      user_id bigint NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      event text NOT NULL
    );
    INSERT INTO public.users VALUES (1, 'Ada'), (2, 'Grace'), (3, 'Linus');
    INSERT INTO audit.user_events VALUES (10, 2, 'login'), (11, 3, 'login');
  `);
  process.stdout.write(`      BEFORE  ${rows()}\n`);

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [join(pluginRoot, "dist", "mcp.js")],
    env: {
      PATH: process.env.PATH ?? "",
      PLUGIN_ROOT: pluginRoot,
      RECOVERY_AUTHORITY_DATA_DIR: dataDir,
      RECOVERY_AUTHORITY_PG_DUMP: "docker",
      RECOVERY_AUTHORITY_PG_DUMP_ARGS_JSON: JSON.stringify(["exec", "-i", container, "pg_dump"]),
      RECOVERY_AUTHORITY_PSQL: "docker",
      RECOVERY_AUTHORITY_PSQL_ARGS_JSON: JSON.stringify(["exec", "-i", container, "psql"]),
    },
    stderr: "pipe",
  });
  client = new Client({ name: "recovery-authority-demo", version: "0.1.0" });
  await client.connect(transport);

  const sql = "DELETE FROM public.users WHERE name = 'Grace'";
  const proposedCommand = `psql app --command \"${sql}\"`;
  process.stdout.write("[3/7] Orienting to consequences and minimum safe cut\n");
  const initialOrientation = await client.callTool({
    name: "recovery_orient",
    arguments: {
      goal: "Delete one account and preserve database-local cascades",
      command: proposedCommand,
      shellDialect: "posix",
    },
  });
  const initialOutput = initialOrientation.structuredContent as {
    readiness: { recoveryCoverage: number; authority: number; uncertainty: number };
    safeCut: Array<{ requirement: string }>;
  };
  process.stdout.write(`      VECTOR  recovery=${initialOutput.readiness.recoveryCoverage} authority=${initialOutput.readiness.authority} uncertainty=${initialOutput.readiness.uncertainty}\n`);
  process.stdout.write(`      SAFE CUT ${initialOutput.safeCut.map((item) => item.requirement).join(", ")}\n`);

  process.stdout.write("[4/7] Creating full-database artifact and running isolated restore drill\n");
  const prepared = await client.callTool({
    name: "recovery_prepare_postgres_mutation",
    arguments: {
      connectionUri,
      schema: "public",
      sql,
      reason: "Demonstrate recoverable account deletion",
      ttlSeconds: 300,
    },
  });
  const preparedOutput = prepared.structuredContent as {
    operation: { id: string; proofDigest: string; drillPostWitness: string };
    authorization: { status: string; capability: null };
  };
  process.stdout.write(`      PROOF   ${preparedOutput.operation.proofDigest}\n`);
  process.stdout.write(`      STATUS  ${preparedOutput.authorization.status}; capability withheld\n`);

  process.stdout.write("[5/7] Waiting for separate human authorization\n");
  const approval = spawnSync(
    process.execPath,
    [
      join(pluginRoot, "dist", "cli.js"),
      "approve",
      preparedOutput.operation.id,
      "--data-dir",
      dataDir,
    ],
    {
      stdio: "inherit",
      env: { ...process.env, PLUGIN_ROOT: pluginRoot },
    },
  );
  if (approval.status !== 0) throw new Error("Human authorization was not completed");
  const authorization = await client.callTool({
    name: "recovery_get_authorization",
    arguments: { operationId: preparedOutput.operation.id },
  });
  const approved = authorization.structuredContent as { status: string; capability: string; approvalDigest: string };
  if (approved.status !== "approved" || !approved.capability) throw new Error("Approval did not produce a capability");
  process.stdout.write(`      APPROVAL ${approved.approvalDigest}\n`);

  await client.callTool({
    name: "recovery_orient",
    arguments: {
      goal: "Commit only the exact restore-tested account deletion",
      command: proposedCommand,
      operationId: preparedOutput.operation.id,
      shellDialect: "posix",
    },
  });

  process.stdout.write("[6/7] Committing the exact approved SQL\n");
  const committed = await client.callTool({
    name: "recovery_commit_postgres_mutation",
    arguments: {
      operationId: preparedOutput.operation.id,
      capability: approved.capability,
      connectionUri,
      sql,
    },
  });
  const committedOutput = committed.structuredContent as { postCommitWitness: string };
  if (committedOutput.postCommitWitness !== preparedOutput.operation.drillPostWitness) {
    throw new Error("Live PostgreSQL state did not match the restore-tested result");
  }
  process.stdout.write(`      AFTER   ${rows()}\n`);

  process.stdout.write("[7/7] Restoring the proven artifact and verifying both schemas\n");
  await client.callTool({
    name: "recovery_restore_postgres_mutation",
    arguments: { operationId: preparedOutput.operation.id, connectionUri },
  });
  process.stdout.write(`      RESTORED ${rows()}\n\n`);
  await client.callTool({
    name: "recovery_orient",
    arguments: {
      goal: "Verify the account deletion was recovered",
      command: proposedCommand,
      operationId: preparedOutput.operation.id,
      shellDialect: "posix",
    },
  });
  process.stdout.write("Demo complete: proof, human approval, exact commit, and verified recovery.\n");
  if (retainedDataDir) {
    process.stdout.write(`Evidence ledger retained for the TUI at ${dataDir}\n`);
  }
}

try {
  await main();
} finally {
  const connectedClient = client as Client | null;
  if (connectedClient) await connectedClient.close().catch(() => undefined);
  spawnSync("docker", ["rm", "--force", container], { encoding: "utf8" });
  if (temporaryRoot) await rm(temporaryRoot, { recursive: true, force: true });
}
