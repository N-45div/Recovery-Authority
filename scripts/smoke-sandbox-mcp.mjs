import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { join } from "node:path";

const pluginRoot = process.env.PLUGIN_ROOT;
if (!pluginRoot) throw new Error("PLUGIN_ROOT is required");

const transport = new StdioClientTransport({
  command: "bash",
  args: [join(pluginRoot, "scripts", "start-mcp.sh")],
  env: {
    PATH: process.env.PATH ?? "",
    PLUGIN_ROOT: pluginRoot,
    RECOVERY_AUTHORITY_MCP_SOCKET: process.env.RECOVERY_AUTHORITY_MCP_SOCKET ?? "",
  },
  stderr: "inherit",
});
const client = new Client({ name: "recovery-sandbox-probe", version: "0.1.0" });

try {
  await client.connect(transport);
  const tools = await client.listTools();
  assert.ok(tools.tools.some((tool) => tool.name === "recovery_inspect_runtime"));
  const runtime = await client.callTool({ name: "recovery_inspect_runtime", arguments: {} });
  assert.equal(runtime.structuredContent.executionBoundary.workspaceRoot, process.cwd());
  const escapedScope = await client.callTool({
    name: "recovery_prepare_filesystem_delete",
    arguments: {
      workspaceRoot: "/",
      paths: ["tmp/nonexistent-recovery-authority-probe"],
      reason: "Verify the authority cannot be redirected outside the selected workspace",
      ttlSeconds: 60,
    },
  });
  assert.equal(escapedScope.isError, true);
  assert.match(escapedScope.content[0].text, /must equal the sandbox workspace/);
  process.stdout.write(`${JSON.stringify({
    serverInfo: client.getServerVersion(),
    toolCount: tools.tools.length,
    workspaceRoot: runtime.structuredContent.executionBoundary.workspaceRoot,
  })}\n`);
} finally {
  await client.close();
}
