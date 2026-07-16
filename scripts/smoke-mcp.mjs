import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspace = await mkdtemp(join(tmpdir(), "recovery-mcp-workspace-"));
const dataDir = await mkdtemp(join(tmpdir(), "recovery-mcp-data-"));
await writeFile(join(workspace, "state.txt"), "recover me");

const transport = new StdioClientTransport({
  command: "bash",
  args: [join(pluginRoot, "scripts", "start-mcp.sh")],
  env: {
    PATH: process.env.PATH ?? "",
    PLUGIN_ROOT: pluginRoot,
    RECOVERY_AUTHORITY_DATA_DIR: dataDir,
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
      "recovery_get_operation",
      "recovery_prepare_filesystem_delete",
      "recovery_restore_filesystem_delete",
    ],
  );
  assert.equal(
    tools.tools.find((tool) => tool.name === "recovery_commit_filesystem_delete").annotations.destructiveHint,
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

  await client.callTool({
    name: "recovery_commit_filesystem_delete",
    arguments: {
      operationId: preparedOutput.operation.id,
      capability: preparedOutput.capability,
    },
  });
  await assert.rejects(readFile(join(workspace, "state.txt"), "utf8"));

  const recovered = await client.callTool({
    name: "recovery_restore_filesystem_delete",
    arguments: { operationId: preparedOutput.operation.id },
  });
  assert.equal(recovered.structuredContent.status, "recovered");
  assert.equal(await readFile(join(workspace, "state.txt"), "utf8"), "recover me");
  process.stdout.write("MCP smoke test passed\n");
} finally {
  await client.close();
  await Promise.all([
    rm(workspace, { recursive: true, force: true }),
    rm(dataDir, { recursive: true, force: true }),
  ]);
}
