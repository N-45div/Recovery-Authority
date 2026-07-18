import { appendFile, mkdir } from "node:fs/promises";
import { createConnection } from "node:net";
import { resolve } from "node:path";
import { z } from "zod";
import { sha256 } from "./crypto.js";
import { analyzeShellCommand, type RiskFinding } from "./shell-policy.js";
import { analyzePowerShellCommand } from "./powershell-policy.js";
import { projectConsequenceGraph, type ConsequenceGraph } from "./consequence-graph.js";

const HookInput = z.object({
  hook_event_name: z.enum([
    "SessionStart",
    "PreToolUse",
    "PermissionRequest",
    "PostToolUse",
    "PreCompact",
    "PostCompact",
    "SubagentStart",
    "SubagentStop",
  ]),
  session_id: z.string().optional(),
  turn_id: z.string().optional(),
  transcript_path: z.string().nullable().optional(),
  cwd: z.string(),
  model: z.string().optional(),
  permission_mode: z.string().optional(),
  tool_name: z.string().optional(),
  tool_use_id: z.string().optional(),
  tool_input: z.record(z.unknown()).optional(),
  tool_response: z.unknown().optional(),
  agent_id: z.string().optional(),
  agent_type: z.string().optional(),
  source: z.string().optional(),
  trigger: z.string().optional(),
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

function denialReason(findings: RiskFinding[]): string {
  const categories = [...new Set(findings.map((item) => item.category))];
  const categorySet = new Set(categories);
  const exactAdapterAvailable = findings.every((item) => item.adapterAvailable);
  let nextStep: string;
  if (exactAdapterAvailable && categorySet.size === 1 && categorySet.has("filesystem.delete")) {
    nextStep = "Call recovery_prepare_filesystem_delete with the exact workspace-relative paths, then use the approved operation with recovery_commit_filesystem_delete.";
  } else if (exactAdapterAvailable && categorySet.size === 1 && categorySet.has("sqlite.mutate")) {
    nextStep = "Call recovery_prepare_sqlite_mutation with the exact database path and SQL, then use the approved operation with recovery_commit_sqlite_mutation.";
  } else if (exactAdapterAvailable && categorySet.size === 1 && categorySet.has("git.reset-hard")) {
    nextStep = "Call recovery_prepare_git_reset_hard with the repository root and target commit, then use the approved operation with recovery_commit_git_reset_hard.";
  } else if (exactAdapterAvailable && categorySet.size === 1 && categorySet.has("postgres.schema-mutate")) {
    nextStep = "Call recovery_prepare_postgres_mutation with the connection URI, authorized schema, and exact SQL, then use the approved operation with recovery_commit_postgres_mutation.";
  } else {
    nextStep = "No exact recovery adapter covers every detected effect. Do not retry through another tool, interpreter, agent, or wrapper; narrow the operation or ask the user for a supported recovery plan.";
  }
  return `Recovery Authority blocked this effect before execution. Detected: ${categories.join(", ")}. ${nextStep}`;
}

function deny(findings: RiskFinding[], command: string | null): HookDecision {
  const reason = denialReason(findings);

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

function denyPermission(findings: RiskFinding[], command: string | null): HookDecision {
  const reason = denialReason(findings);
  return {
    blocked: true,
    command,
    findings,
    output: {
      systemMessage: reason,
      hookSpecificOutput: {
        hookEventName: "PermissionRequest",
        decision: { behavior: "deny", message: reason },
      },
    },
  };
}

function lifecycleOutput(event: "SessionStart" | "PostCompact", context: string): Record<string, unknown> {
  return {
    hookSpecificOutput: {
      hookEventName: event,
      additionalContext: context,
    },
  };
}

export function evaluateHook(rawInput: unknown): HookDecision {
  const input = HookInput.parse(rawInput);
  if (input.hook_event_name === "SessionStart") {
    return {
      blocked: false,
      command: null,
      findings: [],
      output: lifecycleOutput("SessionStart", "Recovery Authority is active. Call recovery_orient before destructive or delegated work; raw destructive commands never inherit authority from a prepared proof."),
    };
  }
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
    return { blocked: false, command: null, findings: [], output: { continue: true } };
  }
  if (input.hook_event_name === "PreCompact") {
    return { blocked: false, command: null, findings: [], output: null };
  }
  if (input.hook_event_name === "PostCompact") {
    return {
      blocked: false,
      command: null,
      findings: [],
      output: lifecycleOutput("PostCompact", "Recovery Authority retained the living consequence graph outside model context. Re-orient before continuing destructive work."),
    };
  }

  const command = commandFrom(input);
  const fileFindings = input.tool_name && input.tool_input ? analyzeFileTool(input.tool_name, input.tool_input) : [];
  if (fileFindings.length > 0) {
    return input.hook_event_name === "PermissionRequest" ? denyPermission(fileFindings, null) : deny(fileFindings, null);
  }
  if (!command) return { blocked: false, command: null, findings: [], output: null };

  const dialect = process.env.RECOVERY_AUTHORITY_SHELL_DIALECT ?? (
    process.platform === "win32" || input.tool_name === "PowerShell" ? "powershell" : "posix"
  );
  const findings = dialect === "powershell"
    ? analyzePowerShellCommand(command)
    : analyzeShellCommand(command);
  if (findings.length === 0) return { blocked: false, command, findings, output: null };
  if (input.hook_event_name === "PostToolUse") {
    return { blocked: false, command, findings, output: null };
  }
  if (input.hook_event_name === "PermissionRequest") return denyPermission(findings, command);
  return deny(findings, command);
}

async function recordDecision(input: HookInput, decision: HookDecision, dataDir: string): Promise<void> {
  const event = {
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
    toolUseId: input.tool_use_id ?? null,
    commandDigest: decision.command ? sha256(decision.command) : null,
    resultDigest: input.tool_response === undefined ? null : sha256(JSON.stringify(input.tool_response)),
    source: input.source ?? null,
    trigger: input.trigger ?? null,
    blocked: decision.blocked,
    findings: decision.findings,
  };
  const auditSocket = process.env.RECOVERY_AUTHORITY_AUDIT_SOCKET;
  if (auditSocket) {
    await new Promise<void>((resolvePromise, reject) => {
      const socket = createConnection({ path: auditSocket, allowHalfOpen: true });
      const timeout = setTimeout(() => socket.destroy(new Error("Audit relay timed out")), 2_000);
      socket.on("connect", () => socket.end(JSON.stringify(event)));
      socket.on("data", () => undefined);
      socket.on("error", reject);
      socket.on("close", (hadError) => {
        clearTimeout(timeout);
        if (!hadError) resolvePromise();
      });
    });
    return;
  }
  await mkdir(dataDir, { recursive: true, mode: 0o700 });
  await appendFile(resolve(dataDir, "hook-events.jsonl"), `${JSON.stringify(event)}\n`, { mode: 0o600 });
}

function graphContext(graph: ConsequenceGraph): string {
  const pending = graph.nodes.filter((node) => node.kind === "authorization" && node.state === "pending").length;
  const activeAgents = graph.nodes.filter((node) => node.kind === "agent" && node.state === "active").length;
  return `Recovery posture: ${graph.posture.level}. Exact adapters: ${graph.posture.exactAdapters.join(", ") || "none"}. Pending approvals: ${pending}. Active delegated agents: ${activeAgents}. Call recovery_orient for the minimum safe cut before destructive work.`;
}

export async function runHook(): Promise<void> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  const rawInput = JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  const parsedInput = HookInput.parse(rawInput);
  const decision = evaluateHook(parsedInput);
  const dataDir = resolve(process.env.PLUGIN_DATA ?? process.env.RECOVERY_AUTHORITY_DATA_DIR ?? ".recovery-authority");
  await recordDecision(parsedInput, decision, dataDir).catch(() => undefined);
  const graph = await projectConsequenceGraph(dataDir).catch(() => null);
  if (graph && parsedInput.hook_event_name === "SessionStart") {
    decision.output = lifecycleOutput("SessionStart", graphContext(graph));
  } else if (graph && parsedInput.hook_event_name === "PostCompact") {
    decision.output = lifecycleOutput("PostCompact", graphContext(graph));
  } else if (graph && parsedInput.hook_event_name === "SubagentStart" && decision.output) {
    const output = decision.output.hookSpecificOutput as Record<string, unknown>;
    output.additionalContext = `${String(output.additionalContext)} ${graphContext(graph)}`;
  }
  if (decision.output) process.stdout.write(`${JSON.stringify(decision.output)}\n`);
}
