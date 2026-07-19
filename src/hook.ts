import { runHook } from "./pre-tool-hook.js";

if (!process.env.PLUGIN_DATA && process.env.CLAUDE_PLUGIN_DATA) {
  process.env.PLUGIN_DATA = process.env.CLAUDE_PLUGIN_DATA;
}

if (import.meta.main) await runHook();
