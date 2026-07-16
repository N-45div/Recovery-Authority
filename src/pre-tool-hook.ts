import { appendFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import { sha256 } from "./crypto.js";
import { analyzeShellCommand, type RiskFinding } from "./shell-policy.js";

const HookInput = z.object({
  hook_event_name: z.enum(["PreToolUse", "SubagentStart", "SubagentStop"]),
  session_id: z.string().optional(),
  turn_id: z.string().optional(),
  transcript_path: z.string().nullable().optional(),
  cwd: z.string(),
  model: z.string().optional(),
  permission_mode: z.string().optional(),
  tool_name: z.string().optional(),
  tool_input: z.record(z.unknown()).optional(),
  agent_id: z.string().optional(),
  agent_type: z.string().optional(),
});

type HookInput = z.infer<typeof HookInput>;

interface HookDecision {
  blocked: boolean;
  command: string | null;
  findings: RiskFinding[];
  output: Record<string, unknown> | null;
}

function commandFrom(input: HookInput): string | null {
  if (!input.tool_input) return null;
  for (const key of ["command", "cmd"]) {
    const value = input.tool_input[key];
    if (typeof value === "string") return value;
  }
  return null;
}

function patchFinding(category: "filesystem.delete" | "filesystem.overwrite", reason: string): RiskFinding {
  return {
    category,
    executable: "apply_patch",
    reason,
    adapterAvailable: category === "filesystem.delete",
  };
}

function patchText(toolInput: Record<string, unknown>): string | null {
  for (const key of ["patch", "input", "text"]) {
    const value = toolInput[key];
    if (typeof value === "string") return value;
  }
  return null;
}

function analyzeFileTool(toolName: string, toolInput: Record<string, unknown>): RiskFinding[] {
  if (/^(?:apply_patch|Edit|Write)$/.test(toolName)) {
    const patch = patchText(toolInput);
    if (patch?.includes("*** Delete File:")) {
      return [patchFinding("filesystem.delete", "apply_patch contains an explicit file deletion")];
    }
    if (patch?.includes("*** Move to:")) {
      return [patchFinding("filesystem.overwrite", "apply_patch move can replace a destination and remove the source path")];
    }
    const content = toolInput.content ?? toolInput.file_text ?? toolInput.new_string ?? toolInput.new_str;
    if (typeof content === "string" && content.length === 0) {
      return [patchFinding("filesystem.overwrite", `${toolName} replaces existing content with an empty value`)];
    }
  }
  return [];
}

function deny(findings: RiskFinding[], command: string | null): HookDecision {
  const categories = [...new Set(findings.map((item) => item.category))];
  const categorySet = new Set(categories);
  let nextStep: string;
  if (categorySet.size === 1 && categorySet.has("filesystem.delete")) {
    nextStep = "Call recovery_prepare_filesystem_delete with the exact workspace-relative paths, then use the approved operation with recovery_commit_filesystem_delete.";
  } else if (categorySet.size === 1 && categorySet.has("sqlite.mutate")) {
    nextStep = "Call recovery_prepare_sqlite_mutation with the exact database path and SQL, then use the approved operation with recovery_commit_sqlite_mutation.";
  } else if (categorySet.size === 1 && categorySet.has("git.reset-hard")) {
    nextStep = "Call recovery_prepare_git_reset_hard with the repository root and target commit, then use the approved operation with recovery_commit_git_reset_hard.";
  } else if (categorySet.size === 1 && categorySet.has("postgres.schema-mutate")) {
    nextStep = "Call recovery_prepare_postgres_mutation with the connection URI, authorized schema, and exact SQL, then use the approved operation with recovery_commit_postgres_mutation.";
  } else {
    nextStep = "No exact recovery adapter covers every detected effect. Do not retry through another tool, interpreter, agent, or wrapper; narrow the operation or ask the user for a supported recovery plan.";
  }
  const reason = `Recovery Authority blocked this effect before execution. Detected: ${categories.join(", ")}. ${nextStep}`;

  return {
    blocked: true,
    command,
    findings,
    output: {
      systemMessage: reason,
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    },
  };
}

export function evaluateHook(rawInput: unknown): HookDecision {
  const input = HookInput.parse(rawInput);
  if (input.hook_event_name === "SubagentStart") {
    const agentLabel = input.agent_id ?? "unknown";
    const context = `Recovery Authority registered delegated agent ${agentLabel}. This agent receives no independent destructive authority. Destructive effects remain blocked until one exact restore-tested operation receives separate human approval.`;
    return {
      blocked: false,
      command: null,
      findings: [],
      output: {
        systemMessage: context,
        hookSpecificOutput: {
          hookEventName: "SubagentStart",
          additionalContext: context,
        },
      },
    };
  }
  if (input.hook_event_name === "SubagentStop") {
    return { blocked: false, command: null, findings: [], output: null };
  }

  const command = commandFrom(input);
  const fileFindings = input.tool_name && input.tool_input ? analyzeFileTool(input.tool_name, input.tool_input) : [];
  if (fileFindings.length > 0) return deny(fileFindings, null);
  if (!command) return { blocked: false, command: null, findings: [], output: null };

  const findings = analyzeShellCommand(command);
  if (findings.length === 0) return { blocked: false, command, findings, output: null };
  return deny(findings, command);
}

async function recordDecision(input: HookInput, decision: HookDecision): Promise<void> {
  const dataDir = resolve(process.env.PLUGIN_DATA ?? process.env.RECOVERY_AUTHORITY_DATA_DIR ?? ".recovery-authority");
  await mkdir(dataDir, { recursive: true, mode: 0o700 });
  await appendFile(
    resolve(dataDir, "hook-events.jsonl"),
    `${JSON.stringify({
      timestamp: new Date().toISOString(),
      event: input.hook_event_name,
      sessionId: input.session_id ?? null,
      turnId: input.turn_id ?? null,
      agentId: input.agent_id ?? null,
      agentType: input.agent_type ?? null,
      permissionMode: input.permission_mode ?? null,
      model: input.model ?? null,
      cwd: input.cwd,
      toolName: input.tool_name ?? null,
      commandDigest: decision.command ? sha256(decision.command) : null,
      blocked: decision.blocked,
      findings: decision.findings,
    })}\n`,
    { mode: 0o600 },
  );
}

async function main(): Promise<void> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  const rawInput = JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  const parsedInput = HookInput.parse(rawInput);
  const decision = evaluateHook(parsedInput);
  await recordDecision(parsedInput, decision).catch(() => undefined);
  if (decision.output) process.stdout.write(`${JSON.stringify(decision.output)}\n`);
}

if (import.meta.main) await main();
