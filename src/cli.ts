import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { authorityKeyDir } from "./crypto.js";
import { platformCapabilities } from "./platform.js";
import { initializeAuthority } from "./signer.js";

function pluginRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "..");
}

function normalizePluginEnvironment(): void {
  process.env.PLUGIN_ROOT ??= process.env.CLAUDE_PLUGIN_ROOT ?? pluginRoot();
  if (!process.env.PLUGIN_DATA && process.env.CLAUDE_PLUGIN_DATA) {
    process.env.PLUGIN_DATA = process.env.CLAUDE_PLUGIN_DATA;
  }
  process.env.RECOVERY_AUTHORITY_DATA_DIR ??= process.env.PLUGIN_DATA;
}

async function initializeConfiguredAuthority(): Promise<void> {
  const dataDir = process.env.RECOVERY_AUTHORITY_DATA_DIR;
  if (!dataDir) throw new Error("Recovery Authority requires PLUGIN_DATA or RECOVERY_AUTHORITY_DATA_DIR");
  const resolvedDataDir = resolve(dataDir);
  const keyDir = authorityKeyDir(resolvedDataDir, process.env.RECOVERY_AUTHORITY_KEY_DIR);
  await initializeAuthority(resolvedDataDir, keyDir);
}

async function main(): Promise<void> {
  normalizePluginEnvironment();
  const [command, ...args] = process.argv.slice(2);
  if (command === "hook") {
    await (await import("./pre-tool-hook.js")).runHook();
    return;
  }
  if (command === "approve" || command === "init") {
    await (await import("./approve.js")).runApprovalCommand([command, ...args]);
    return;
  }
  if (command === "mcp") {
    if (process.env.RECOVERY_AUTHORITY_MCP_SOCKET) {
      await import("./mcp-proxy.js");
      return;
    }
    await initializeConfiguredAuthority();
    await import("./server.js");
    return;
  }
  if (command === "doctor") {
    process.stdout.write(`${JSON.stringify(platformCapabilities(), null, 2)}\n`);
    return;
  }
  throw new Error("Usage: recovery-authority <hook|mcp|approve|init|doctor> [arguments]");
}

if (import.meta.main) await main();
