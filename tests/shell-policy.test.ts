import { describe, expect, test } from "bun:test";
import { evaluateHook } from "../src/pre-tool-hook.js";
import { analyzeShellCommand } from "../src/shell-policy.js";

function categories(command: string): string[] {
  return analyzeShellCommand(command).map((finding) => finding.category);
}

describe("shell policy", () => {
  test.each([
    ["rm -rf ./cache", "filesystem.delete"],
    ["sudo -n rm -rf ./cache", "filesystem.delete"],
    ["env MODE=clean unlink state.json", "filesystem.delete"],
    ["find . -type f -delete", "filesystem.delete"],
    ["echo before && shred secrets.txt", "filesystem.delete"],
    ["echo $(rm -rf ./cache)", "filesystem.delete"],
    ["sh -c 'rm -rf ./cache'", "filesystem.delete"],
    ["truncate -s 0 production.db", "filesystem.overwrite"],
    ["dd if=/dev/zero of=production.db", "filesystem.overwrite"],
    ["git reset --hard HEAD", "git.destructive"],
    ["psql -c 'DROP TABLE users'", "database.destructive"],
    ["sqlite3 app.sqlite 'DELETE FROM users'", "sqlite.mutate"],
    ["terraform destroy -auto-approve", "infrastructure.destructive"],
    ["kubectl delete namespace production", "infrastructure.destructive"],
    ["bash scripts/cleanup.sh", "opaque.execution"],
  ])("detects %s", (command, expectedCategory) => {
    expect(categories(command)).toContain(expectedCategory);
  });

  test.each([
    "cargo test --workspace",
    "git status --short",
    "printf '%s' 'rm -rf /'",
    "echo 'kubectl delete namespace production'",
    "find . -type f -print",
  ])("allows analyzed non-destructive command: %s", (command) => {
    expect(analyzeShellCommand(command)).toEqual([]);
  });

  test("returns a Codex PreToolUse denial with recovery instructions", () => {
    const decision = evaluateHook({
      hook_event_name: "PreToolUse",
      session_id: "session-1",
      turn_id: "turn-1",
      cwd: "/workspace",
      tool_name: "Bash",
      tool_input: { command: "rm -rf cache" },
    });

    expect(decision.blocked).toBe(true);
    expect(decision.output).toMatchObject({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
      },
    });
    expect(JSON.stringify(decision.output)).toContain("recovery_prepare_filesystem_delete");
  });

  test("accepts the Codex cmd input field and emits no output for a safe command", () => {
    const decision = evaluateHook({
      hook_event_name: "PreToolUse",
      cwd: "/workspace",
      tool_name: "Bash",
      tool_input: { cmd: "git status --short" },
    });

    expect(decision.blocked).toBe(false);
    expect(decision.output).toBeNull();
  });
});
