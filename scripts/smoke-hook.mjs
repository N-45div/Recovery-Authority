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

async function invokeBootstrap(payload, pluginEnvironment = {}) {
  const hooks = JSON.parse(await readFile(join(pluginRoot, "hooks", "hooks.json"), "utf8"));
  const command = hooks.hooks.PreToolUse[0].hooks[0].command;
  return await new Promise((resolveResult, reject) => {
    const env = { ...process.env };
    delete env.PLUGIN_ROOT;
    delete env.PLUGIN_DATA;
    delete env.CLAUDE_PLUGIN_ROOT;
    delete env.CLAUDE_PLUGIN_DATA;
    Object.assign(env, pluginEnvironment);
    const child = spawn("bash", ["-c", command], { cwd: pluginRoot, env });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.stdin.on("error", (error) => {
      if (error.code !== "EPIPE") reject(error);
    });
    child.on("error", reject);
    child.on("close", (status) => resolveResult({ status, stdout, stderr }));
    child.stdin.end(JSON.stringify(payload));
  });
}

async function invoke(payload) {
  const result = await new Promise((resolveResult, reject) => {
    const child = spawn(bun, [join(pluginRoot, "dist", "hook.js")], {
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
  const hookManifest = JSON.parse(await readFile(join(pluginRoot, "hooks", "hooks.json"), "utf8"));
  for (const registrations of Object.values(hookManifest.hooks)) {
    for (const registration of registrations) {
      for (const hook of registration.hooks) {
        assert.match(hook.command, /dist\/hook\.js/);
        assert.match(hook.commandWindows, /dist\\hook\.js/);
        assert.doesNotMatch(hook.commandWindows, /\.sh/);
      }
    }
  }

  const safePayload = {
    hook_event_name: "PreToolUse",
    session_id: "root-session",
    turn_id: "root-turn",
    cwd: pluginRoot,
    tool_name: "Bash",
    tool_input: { command: "git status --short" },
    permission_mode: "default",
  };
  const session = await invoke({
    hook_event_name: "SessionStart",
    session_id: "root-session",
    cwd: pluginRoot,
    source: "startup",
    permission_mode: "default",
  });
  assert.equal(session.hookSpecificOutput.hookEventName, "SessionStart");
  assert.match(session.hookSpecificOutput.additionalContext, /Recovery posture:/);
  const unavailable = await invokeBootstrap(safePayload);
  assert.equal(unavailable.status, 0, unavailable.stderr);
  assert.equal(unavailable.stdout, "");

  const compatible = await invokeBootstrap(safePayload, {
    CLAUDE_PLUGIN_ROOT: pluginRoot,
    CLAUDE_PLUGIN_DATA: dataDir,
  });
  assert.equal(compatible.status, 0, compatible.stderr);

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

  const permission = await invoke({
    hook_event_name: "PermissionRequest",
    session_id: "root-session",
    turn_id: "root-turn",
    cwd: pluginRoot,
    tool_name: "Bash",
    tool_input: { command: "docker volume prune -f" },
    permission_mode: "default",
  });
  assert.equal(permission.hookSpecificOutput.decision.behavior, "deny");

  const compacted = await invoke({
    hook_event_name: "PostCompact",
    session_id: "root-session",
    turn_id: "root-turn",
    cwd: pluginRoot,
    trigger: "auto",
  });
  assert.equal(compacted.hookSpecificOutput.hookEventName, "PostCompact");
  assert.match(compacted.hookSpecificOutput.additionalContext, /Pending approvals:/);

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
  assert.equal(events.length, 7);
  assert.equal(events[6].agentId, "worker-42");
  assert.equal(events[6].permissionMode, "bypassPermissions");
  assert.equal(events[2].commandDigest.length, 64);
  assert.equal("command" in events[2], false);
  assert.equal(existsSync(join(dataDir, "consequence-graph.json")), true);

  process.stdout.write("Packaged hook smoke test passed\n");
} finally {
  await rm(dataDir, { recursive: true, force: true });
}
