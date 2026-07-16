import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = await mkdtemp(join(tmpdir(), "recovery-hook-smoke-"));
const localBun = join(pluginRoot, ".tools", "bun", "bin", "bun");
const bun = existsSync(localBun) ? localBun : "bun";

async function invoke(payload) {
  const result = await new Promise((resolveResult, reject) => {
    const child = spawn(bun, [join(pluginRoot, "dist", "pre-tool-hook.js")], {
      cwd: pluginRoot,
      env: {
        ...process.env,
        PLUGIN_ROOT: pluginRoot,
        PLUGIN_DATA: dataDir,
      },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (status) => resolveResult({ status, stdout, stderr }));
    child.stdin.end(JSON.stringify(payload));
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout ? JSON.parse(result.stdout) : null;
}

try {
  const shell = await invoke({
    hook_event_name: "PreToolUse",
    session_id: "root-session",
    turn_id: "root-turn",
    cwd: pluginRoot,
    tool_name: "Bash",
    tool_input: { command: "rsync -a --delete source/ destination/" },
    permission_mode: "bypassPermissions",
  });
  assert.equal(shell.hookSpecificOutput.permissionDecision, "deny");
  assert.match(shell.hookSpecificOutput.permissionDecisionReason, /filesystem\.sync-delete/);

  const patch = await invoke({
    hook_event_name: "PreToolUse",
    session_id: "root-session",
    turn_id: "root-turn",
    cwd: pluginRoot,
    tool_name: "apply_patch",
    tool_input: { patch: "*** Begin Patch\n*** Delete File: data.db\n*** End Patch" },
    permission_mode: "default",
  });
  assert.equal(patch.hookSpecificOutput.permissionDecision, "deny");
  assert.match(patch.hookSpecificOutput.permissionDecisionReason, /filesystem\.delete/);

  const subagent = await invoke({
    hook_event_name: "SubagentStart",
    session_id: "root-session",
    turn_id: "child-turn",
    cwd: pluginRoot,
    agent_id: "worker-42",
    agent_type: "worker",
    model: "test-model",
    permission_mode: "bypassPermissions",
  });
  assert.equal(subagent.hookSpecificOutput.hookEventName, "SubagentStart");
  assert.match(subagent.hookSpecificOutput.additionalContext, /no independent destructive authority/i);

  const events = (await readFile(join(dataDir, "hook-events.jsonl"), "utf8"))
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  assert.equal(events.length, 3);
  assert.equal(events[2].agentId, "worker-42");
  assert.equal(events[2].permissionMode, "bypassPermissions");
  assert.equal(events[0].commandDigest.length, 64);
  assert.equal("command" in events[0], false);

  process.stdout.write("Packaged hook smoke test passed\n");
} finally {
  await rm(dataDir, { recursive: true, force: true });
}
