import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = process.env.PLUGIN_UNDER_TEST ?? sourceRoot;
const workspace = await mkdtemp(join(tmpdir(), "recovery-mcp-workspace-"));
const dataDir = await mkdtemp(join(tmpdir(), "recovery-mcp-data-"));
const keyDir = `${dataDir}.keys`;
await writeFile(join(workspace, "state.txt"), "recover me");
const databasePath = join(workspace, "app.sqlite");
const localBun = join(sourceRoot, ".tools", "bun", "bin", "bun");
const bun = existsSync(localBun) ? localBun : "bun";

function runBun(source) {
  const result = spawnSync(bun, ["-e", source], {
    encoding: "utf8",
    env: { ...process.env, DATABASE_PATH: databasePath },
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function runGit(args) {
  const result = spawnSync("git", args, {
    cwd: workspace,
    encoding: "utf8",
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0", LC_ALL: "C" },
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

async function approve(preparedOutput) {
  assert.equal(preparedOutput.authorization.status, "pending");
  assert.equal(preparedOutput.authorization.capability, null);
  assert.match(preparedOutput.authorization.approvalCommand, /dist\/cli\.js/);
  assert.equal("capability" in preparedOutput, false);
  const result = spawnSync(
    bun,
    [
      join(pluginRoot, "dist", "cli.js"),
      "approve",
      preparedOutput.operation.id,
      "--data-dir",
      dataDir,
      "--key-dir",
      keyDir,
    ],
    {
      encoding: "utf8",
      input: `${preparedOutput.operation.proofDigest.slice(0, 12)}\n`,
      env: {
        ...process.env,
        PLUGIN_ROOT: pluginRoot,
        RECOVERY_AUTHORITY_ALLOW_NONINTERACTIVE_APPROVAL: "1",
      },
    },
  );
  assert.equal(result.status, 0, result.stderr);
  const authorization = await client.callTool({
    name: "recovery_get_authorization",
    arguments: { operationId: preparedOutput.operation.id },
  });
  assert.equal(authorization.structuredContent.status, "approved");
  assert.ok(authorization.structuredContent.capability);
  return authorization.structuredContent.capability;
}

runBun(`
  import { Database } from "bun:sqlite";
  const db = new Database(process.env.DATABASE_PATH);
  db.exec("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL)");
  db.exec("INSERT INTO users (name) VALUES ('Ada'), ('Grace')");
  db.close();
`);

const transport = new StdioClientTransport({
  command: bun,
  args: [join(pluginRoot, "dist", "cli.js"), "mcp"],
  env: {
    PATH: process.env.PATH ?? "",
    PLUGIN_ROOT: pluginRoot,
    RECOVERY_AUTHORITY_DATA_DIR: dataDir,
    RECOVERY_AUTHORITY_KEY_DIR: keyDir,
  },
  stderr: "pipe",
});
const client = new Client({ name: "recovery-authority-smoke", version: "0.1.0" });

try {
  await client.connect(transport);
  const tools = await client.listTools();
  assert.deepEqual(
    tools.tools.map((tool) => tool.name).sort(),
    [
      "recovery_commit_filesystem_delete",
      "recovery_commit_git_reset_hard",
      "recovery_commit_postgres_mutation",
      "recovery_commit_sqlite_mutation",
      "recovery_get_authorization",
      "recovery_get_consequence_graph",
      "recovery_get_operation",
      "recovery_inspect_runtime",
      "recovery_orient",
      "recovery_prepare_filesystem_delete",
      "recovery_prepare_git_reset_hard",
      "recovery_prepare_postgres_mutation",
      "recovery_prepare_sqlite_mutation",
      "recovery_restore_filesystem_delete",
      "recovery_restore_git_reset_hard",
      "recovery_restore_postgres_mutation",
      "recovery_restore_sqlite_mutation",
    ],
  );
  assert.equal(
    tools.tools.find((tool) => tool.name === "recovery_commit_filesystem_delete").annotations.destructiveHint,
    true,
  );

  const orientation = await client.callTool({
    name: "recovery_orient",
    arguments: { goal: "remove disposable cache", command: "rm -rf cache", shellDialect: "posix" },
  });
  assert.equal(orientation.structuredContent.destructive, true);
  assert.equal(orientation.structuredContent.executable, false);
  assert.equal(orientation.structuredContent.safeCut[0].requirement, "prepare_proof");
  assert.equal(orientation.structuredContent.graph.schemaVersion, 1);

  const runtime = await client.callTool({
    name: "recovery_inspect_runtime",
    arguments: {},
  });
  assert.equal(runtime.structuredContent.identity.authorityDataRoot, dataDir);
  assert.equal(runtime.structuredContent.invariants.destructiveEffectsAreActorIndependent, true);
  assert.equal(
    tools.tools.find((tool) => tool.name === "recovery_commit_sqlite_mutation").annotations.destructiveHint,
    true,
  );
  assert.equal(
    tools.tools.find((tool) => tool.name === "recovery_commit_git_reset_hard").annotations.destructiveHint,
    true,
  );

  const prepared = await client.callTool({
    name: "recovery_prepare_filesystem_delete",
    arguments: {
      workspaceRoot: workspace,
      paths: ["state.txt"],
      reason: "Exercise the packaged MCP flow",
      ttlSeconds: 300,
    },
  });
  const preparedOutput = prepared.structuredContent;
  assert.equal(preparedOutput.operation.status, "proven");
  const graph = await client.callTool({
    name: "recovery_get_consequence_graph",
    arguments: { operationId: preparedOutput.operation.id },
  });
  assert.ok(graph.structuredContent.nodes.some((node) => node.kind === "proof"));
  assert.ok(graph.structuredContent.edges.some((edge) => edge.relation === "protected_by"));
  const filesystemCapability = await approve(preparedOutput);

  await client.callTool({
    name: "recovery_commit_filesystem_delete",
    arguments: {
      operationId: preparedOutput.operation.id,
      capability: filesystemCapability,
    },
  });
  await assert.rejects(readFile(join(workspace, "state.txt"), "utf8"));

  const recovered = await client.callTool({
    name: "recovery_restore_filesystem_delete",
    arguments: { operationId: preparedOutput.operation.id },
  });
  assert.equal(recovered.structuredContent.status, "recovered");
  assert.equal(await readFile(join(workspace, "state.txt"), "utf8"), "recover me");

  const sql = "DELETE FROM users WHERE name = 'Grace'";
  const sqlitePrepared = await client.callTool({
    name: "recovery_prepare_sqlite_mutation",
    arguments: {
      workspaceRoot: workspace,
      databasePath: "app.sqlite",
      sql,
      reason: "Exercise SQLite recovery over MCP",
      ttlSeconds: 300,
    },
  });
  const sqliteCapability = await approve(sqlitePrepared.structuredContent);
  await client.callTool({
    name: "recovery_commit_sqlite_mutation",
    arguments: {
      operationId: sqlitePrepared.structuredContent.operation.id,
      capability: sqliteCapability,
      sql,
    },
  });
  assert.equal(
    runBun(`
      import { Database } from "bun:sqlite";
      const db = new Database(process.env.DATABASE_PATH, { readonly: true });
      console.log(JSON.stringify(db.query("SELECT name FROM users ORDER BY id").all()));
      db.close();
    `),
    '[{"name":"Ada"}]',
  );
  await client.callTool({
    name: "recovery_restore_sqlite_mutation",
    arguments: { operationId: sqlitePrepared.structuredContent.operation.id },
  });
  assert.equal(
    runBun(`
      import { Database } from "bun:sqlite";
      const db = new Database(process.env.DATABASE_PATH, { readonly: true });
      console.log(JSON.stringify(db.query("SELECT name FROM users ORDER BY id").all()));
      db.close();
    `),
    '[{"name":"Ada"},{"name":"Grace"}]',
  );

  runGit(["init", "-b", "main"]);
  runGit(["config", "user.name", "Recovery Smoke"]);
  runGit(["config", "user.email", "recovery@example.test"]);
  runGit(["add", "."]);
  runGit(["commit", "-m", "baseline"]);
  await writeFile(join(workspace, "state.txt"), "git recovery state");
  const gitPrepared = await client.callTool({
    name: "recovery_prepare_git_reset_hard",
    arguments: {
      repositoryRoot: workspace,
      target: "HEAD",
      reason: "Exercise Git recovery over MCP",
      ttlSeconds: 300,
    },
  });
  const gitCapability = await approve(gitPrepared.structuredContent);
  await client.callTool({
    name: "recovery_commit_git_reset_hard",
    arguments: {
      operationId: gitPrepared.structuredContent.operation.id,
      capability: gitCapability,
    },
  });
  assert.equal(await readFile(join(workspace, "state.txt"), "utf8"), "recover me");
  await client.callTool({
    name: "recovery_restore_git_reset_hard",
    arguments: { operationId: gitPrepared.structuredContent.operation.id },
  });
  assert.equal(await readFile(join(workspace, "state.txt"), "utf8"), "git recovery state");
  process.stdout.write("MCP smoke test passed\n");
} finally {
  await client.close();
  await Promise.all([
    rm(workspace, { recursive: true, force: true }),
    rm(dataDir, { recursive: true, force: true }),
    rm(keyDir, { recursive: true, force: true }),
  ]);
}
