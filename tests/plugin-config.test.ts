import { describe, expect, test } from "bun:test";
import { removeTomlTableFamily } from "../src/sandbox.js";

describe("Codex plugin MCP configuration", () => {
  test("forwards the host authority boundary into sandboxed MCP workers", async () => {
    const config = await Bun.file(new URL("../.mcp.json", import.meta.url)).json();
    const server = config.mcpServers["recovery-authority"];

    expect(server.command).toBe("bun");
    expect(server.args).toEqual(["./dist/mcp.js"]);
    expect(server.cwd).toBe(".");
    expect(server.args.join(" ")).not.toContain("${PLUGIN_ROOT}");
    expect(server.env_vars).toEqual([
      "RECOVERY_AUTHORITY_MCP_SOCKET",
      "RECOVERY_AUTHORITY_AUDIT_SOCKET",
      "RECOVERY_AUTHORITY_SANDBOX",
      "RECOVERY_AUTHORITY_KEY_DIR",
      "RECOVERY_AUTHORITY_DATA_DIR",
    ]);
    expect(server.env).toBeUndefined();
  });
});

describe("disposable Codex configuration", () => {
  test("removes inherited MCP servers while preserving plugin and hook state", () => {
    const config = [
      'model = "gpt-5.6-sol"',
      "",
      "[mcp_servers.unrelated]",
      'url = "https://example.invalid/mcp"',
      "",
      "[mcp_servers.unrelated.tools]",
      'enabled = ["search"]',
      "",
      "[hooks.state]",
      "trusted = true",
      "",
      '[plugins."recovery-authority@recovery-authority"]',
      "enabled = true",
      "",
    ].join("\n");

    const isolated = removeTomlTableFamily(config, "mcp_servers");

    expect(isolated).not.toContain("mcp_servers");
    expect(isolated).not.toContain("example.invalid");
    expect(isolated).toContain("[hooks.state]");
    expect(isolated).toContain('[plugins."recovery-authority@recovery-authority"]');
  });
});
