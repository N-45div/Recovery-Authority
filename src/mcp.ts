import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = resolve(process.env.PLUGIN_ROOT ?? process.env.CLAUDE_PLUGIN_ROOT ??
  join(dirname(fileURLToPath(import.meta.url)), ".."));
process.env.PLUGIN_ROOT = pluginRoot;
if (!process.env.PLUGIN_DATA && process.env.CLAUDE_PLUGIN_DATA) process.env.PLUGIN_DATA = process.env.CLAUDE_PLUGIN_DATA;
process.env.RECOVERY_AUTHORITY_DATA_DIR ??= process.env.PLUGIN_DATA;

if (process.env.RECOVERY_AUTHORITY_MCP_SOCKET) {
  await import("./mcp-proxy.js");
} else {
  const dataDirValue = process.env.RECOVERY_AUTHORITY_DATA_DIR;
  if (!dataDirValue) throw new Error("Recovery Authority requires PLUGIN_DATA or RECOVERY_AUTHORITY_DATA_DIR");
  const dataDir = resolve(dataDirValue);
  if (!existsSync(join(dataDir, "authority-public.pem"))) {
    const authorityEntry = resolve(pluginRoot, "dist", "authority.js");
    const result = spawnSync(process.execPath, [authorityEntry, "init", "--data-dir", dataDir], {
      env: process.env,
      encoding: "utf8",
    });
    if (result.status !== 0) {
      throw new Error(`Recovery Authority initialization failed: ${result.stderr?.trim() || `status ${result.status}`}`);
    }
  }
  await import("./server.js");
}
