import { describe, expect, test } from "bun:test";

describe("Codex plugin MCP configuration", () => {
  test("forwards the host authority boundary into sandboxed MCP workers", async () => {
    const config = await Bun.file(new URL("../.mcp.json", import.meta.url)).json();
    const server = config.mcpServers["recovery-authority"];

    expect(server.args).toEqual(["${PLUGIN_ROOT}/dist/cli.js", "mcp"]);
    expect(server.env_vars).toEqual([
      "RECOVERY_AUTHORITY_MCP_SOCKET",
      "RECOVERY_AUTHORITY_AUDIT_SOCKET",
      "RECOVERY_AUTHORITY_SANDBOX",
      "RECOVERY_AUTHORITY_KEY_DIR",
    ]);
    expect(server.env.RECOVERY_AUTHORITY_DATA_DIR).toBe("${PLUGIN_DATA}");
  });
});
