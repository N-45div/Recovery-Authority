import { appendFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import { sha256 } from "./crypto.js";
import { analyzeShellCommand, type RiskFinding } from "./shell-policy.js";

const HookInput = z.object({
  hook_event_name: z.literal("PreToolUse"),
  session_id: z.string().optional(),
  turn_id: z.string().optional(),
  cwd: z.string(),
  tool_name: z.string(),
  tool_input: z.record(z.unknown()),
});

type HookInput = z.infer<typeof HookInput>;

interface HookDecision {
  blocked: boolean;
  command: string | null;
  findings: RiskFinding[];
  output: Record<string, unknown> | null;
}

function commandFrom(input: HookInput): string | null {
  for (const key of ["command", "cmd"]) {
    const value = input.tool_input[key];
    if (typeof value === "string") return value;
  }
  return null;
}

export function evaluateHook(rawInput: unknown): HookDecision {
  const input = HookInput.parse(rawInput);
  const command = commandFrom(input);
  if (!command) return { blocked: false, command: null, findings: [], output: null };

  const findings = analyzeShellCommand(command);
  if (findings.length === 0) return { blocked: false, command, findings, output: null };

  const categories = [...new Set(findings.map((item) => item.category))];
  const categorySet = new Set(categories);
  let nextStep: string;
  if (categorySet.size === 1 && categorySet.has("filesystem.delete")) {
    nextStep = "Call recovery_prepare_filesystem_delete with the exact workspace-relative paths, then use the returned capability with recovery_commit_filesystem_delete.";
  } else if (categorySet.size === 1 && categorySet.has("sqlite.mutate")) {
    nextStep = "Call recovery_prepare_sqlite_mutation with the exact database path and SQL, then use the returned capability with recovery_commit_sqlite_mutation.";
  } else {
    nextStep = "No single exact recovery adapter covers every detected effect. Do not bypass this hook through another shell wrapper; narrow the operation or ask the user for a supported recovery plan.";
  }
  const reason = `Recovery Authority blocked this command before execution. Detected: ${categories.join(", ")}. ${nextStep}`;

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

async function recordDecision(input: HookInput, decision: HookDecision): Promise<void> {
  const dataDir = resolve(process.env.PLUGIN_DATA ?? process.env.RECOVERY_AUTHORITY_DATA_DIR ?? ".recovery-authority");
  await mkdir(dataDir, { recursive: true, mode: 0o700 });
  await appendFile(
    resolve(dataDir, "hook-events.jsonl"),
    `${JSON.stringify({
      timestamp: new Date().toISOString(),
      sessionId: input.session_id ?? null,
      turnId: input.turn_id ?? null,
      cwd: input.cwd,
      toolName: input.tool_name,
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
