import { describe, expect, test } from "bun:test";
import { evaluateHook } from "../src/pre-tool-hook.js";
import { PURGE_VECTOR_CORPUS } from "../src/purge-vectors.js";
import { analyzeShellCommand } from "../src/shell-policy.js";

function categories(command: string): string[] {
  return analyzeShellCommand(command).map((finding) => finding.category);
}

describe("shell policy", () => {
  test.each([
    ["./scripts/approve-operation.sh 123", "authorization.approval"],
    ["bash ./scripts/approve-operation.sh 123", "authorization.approval"],
    ["bun ./dist/approve.js approve 123", "authorization.approval"],
    ["bun ./dist/cli.js approve 123", "authorization.approval"],
    ["bun ./dist/cli.js approve-manifest 123", "authorization.approval"],
    ["rm -rf ./cache", "filesystem.delete"],
    ["sudo -n rm -rf ./cache", "filesystem.delete"],
    ["env MODE=clean unlink state.json", "filesystem.delete"],
    ["find . -type f -delete", "filesystem.delete"],
    ["echo before && shred secrets.txt", "filesystem.delete"],
    ["echo $(rm -rf ./cache)", "filesystem.delete"],
    ["sh -c 'rm -rf ./cache'", "filesystem.delete"],
    ["truncate -s 0 production.db", "filesystem.overwrite"],
    ["dd if=/dev/zero of=production.db", "filesystem.overwrite"],
    ["tee production.db", "filesystem.overwrite"],
    ["HOME=/tmp/agent rm -rf $HOME", "identity.root-override"],
    ["env HOME=/tmp/agent rm -rf /tmp/agent", "identity.root-override"],
    ["rsync -a --delete source/ destination/", "filesystem.sync-delete"],
    ["rclone purge remote:bucket", "remote-storage.delete"],
    ["git reset --hard HEAD", "git.reset-hard"],
    ["git -C repo reset --hard HEAD", "git.reset-hard"],
    ["git stash clear", "git.destructive"],
    ["git push --force origin main", "git.destructive"],
    ["docker system prune -a --volumes --force", "container.purge"],
    ["docker compose down -v", "container.purge"],
    ["psql -c 'DROP TABLE users'", "postgres.schema-mutate"],
    ["psql -c 'UPDATE users SET active = false'", "postgres.schema-mutate"],
    ["sqlite3 app.sqlite 'DELETE FROM users'", "sqlite.mutate"],
    ["terraform destroy -auto-approve", "infrastructure.destructive"],
    ["kubectl delete namespace production", "infrastructure.destructive"],
    ["python3 -c 'import shutil; shutil.rmtree(target)'", "filesystem.delete"],
    ["node -e 'require(\"fs\").rmSync(target, {recursive:true})'", "filesystem.delete"],
    ["codex exec --full-auto 'fix it'", "agent.delegate"],
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

  test("routes destructive psql through the PostgreSQL recovery adapter", () => {
    const decision = evaluateHook({
      hook_event_name: "PreToolUse",
      cwd: "/workspace",
      tool_name: "Bash",
      tool_input: { command: "psql -c 'TRUNCATE public.users'" },
    });

    expect(decision.blocked).toBe(true);
    expect(JSON.stringify(decision.output)).toContain("recovery_prepare_postgres_mutation");
  });

  test.each([...PURGE_VECTOR_CORPUS])("blocks evidence corpus vector: $id", (vector) => {
    expect(categories(vector.command)).toContain(vector.expectedCategory);
    expect(vector.sourceUrl).toMatch(/^https:\/\//);
  });

  test("blocks explicit file deletion through apply_patch", () => {
    const decision = evaluateHook({
      hook_event_name: "PreToolUse",
      session_id: "session-1",
      turn_id: "turn-1",
      cwd: "/workspace",
      tool_name: "apply_patch",
      tool_input: { patch: "*** Begin Patch\n*** Delete File: secrets.txt\n*** End Patch" },
    });

    expect(decision.blocked).toBe(true);
    expect(decision.findings[0]?.category).toBe("filesystem.delete");
  });

  test("registers subagents without granting destructive authority", () => {
    const decision = evaluateHook({
      hook_event_name: "SubagentStart",
      session_id: "parent-session",
      turn_id: "child-turn",
      cwd: "/workspace",
      agent_id: "agent-42",
      agent_type: "worker",
      permission_mode: "bypassPermissions",
    });

    expect(decision.blocked).toBe(false);
    expect(decision.output).toMatchObject({
      hookSpecificOutput: {
        hookEventName: "SubagentStart",
      },
    });
    expect(JSON.stringify(decision.output)).toContain("no independent destructive authority");
  });

  test("injects graph orientation guidance at session start", () => {
    const decision = evaluateHook({
      hook_event_name: "SessionStart",
      session_id: "session-1",
      cwd: "/workspace",
      source: "startup",
      permission_mode: "default",
    });

    expect(decision.output).toMatchObject({
      hookSpecificOutput: { hookEventName: "SessionStart" },
    });
    expect(JSON.stringify(decision.output)).toContain("recovery_orient");
  });

  test("denies destructive elevation through PermissionRequest", () => {
    const decision = evaluateHook({
      hook_event_name: "PermissionRequest",
      session_id: "session-1",
      turn_id: "turn-1",
      cwd: "/workspace",
      tool_name: "Bash",
      tool_input: { command: "docker volume prune -f", description: "clean Docker" },
      permission_mode: "default",
    });

    expect(decision.blocked).toBe(true);
    expect(decision.output).toMatchObject({
      hookSpecificOutput: {
        hookEventName: "PermissionRequest",
        decision: { behavior: "deny" },
      },
    });
  });

  test("records but does not retroactively block PostToolUse", () => {
    const decision = evaluateHook({
      hook_event_name: "PostToolUse",
      session_id: "session-1",
      turn_id: "turn-1",
      cwd: "/workspace",
      tool_name: "Bash",
      tool_input: { command: "rm -rf cache" },
      tool_response: { output: "", exit_code: 0 },
    });

    expect(decision.blocked).toBe(false);
    expect(decision.findings[0]?.category).toBe("filesystem.delete");
    expect(decision.output).toBeNull();
  });

  test("reinjects graph orientation after compaction", () => {
    const decision = evaluateHook({
      hook_event_name: "PostCompact",
      session_id: "session-1",
      turn_id: "turn-1",
      cwd: "/workspace",
      trigger: "auto",
    });

    expect(decision.output).toMatchObject({
      hookSpecificOutput: { hookEventName: "PostCompact" },
    });
  });
});
