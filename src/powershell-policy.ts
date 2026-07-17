import { spawnSync } from "node:child_process";
import { dirname, posix, resolve, win32 } from "node:path";
import { fileURLToPath } from "node:url";
import {
  classifyCommandWords,
  createRiskFinding,
  type RiskFinding,
} from "./shell-policy.js";

interface ParsedPowerShellCommand {
  name: string | null;
  dynamic: boolean;
  invocationOperator: string;
  elements: string[];
}

export interface ParsedPowerShell {
  errors: string[];
  assignments: string[];
  commands: ParsedPowerShellCommand[];
}

const PROTECTED_ROOTS = new Set([
  "HOME",
  "USERPROFILE",
  "HOMEDRIVE",
  "HOMEPATH",
  "XDG_CONFIG_HOME",
  "XDG_DATA_HOME",
  "XDG_STATE_HOME",
]);

function commandName(value: string): string {
  const unquoted = value.replace(/^['"]|['"]$/g, "");
  return posix.basename(win32.basename(unquoted)).replace(/\.exe$/i, "").toLowerCase();
}

function unique(findings: RiskFinding[]): RiskFinding[] {
  return [...new Map(findings.map((item) => [`${item.category}:${item.executable}:${item.reason}`, item])).values()];
}

function classifyPowerShellCommand(command: ParsedPowerShellCommand): RiskFinding[] {
  if (command.dynamic || command.invocationOperator === "Ampersand" || command.invocationOperator === "Dot") {
    return [createRiskFinding("opaque.execution", "powershell", "PowerShell uses dynamic or dot-sourced invocation")];
  }
  const executable = commandName(command.name ?? command.elements[0] ?? "");
  const args = command.elements.slice(1);
  if (!executable) return [];

  if (["remove-item", "ri", "del", "erase", "rd", "rmdir", "rm", "clear-recyclebin"].includes(executable)) {
    return [createRiskFinding("filesystem.delete", executable, `${executable} removes filesystem state`)];
  }
  if (["clear-content", "clc", "set-content", "sc", "out-file", "copy-item", "move-item"].includes(executable)) {
    return [createRiskFinding("filesystem.overwrite", executable, `${executable} can replace filesystem state`)];
  }
  if (["clear-disk", "format-volume", "format", "diskpart", "initialize-disk"].includes(executable)) {
    return [createRiskFinding("filesystem.overwrite", executable, `${executable} can destroy disk or volume state`)];
  }
  if (executable === "invoke-expression" || executable === "iex" || executable === "start-process") {
    return [createRiskFinding("opaque.execution", executable, `${executable} executes effects not represented by the parsed command`)];
  }
  if (["powershell", "pwsh"].includes(executable) && args.some((arg) => /^(?:-e|-enc|-encodedcommand)$/i.test(arg))) {
    return [createRiskFinding("opaque.execution", executable, "Encoded PowerShell hides the command effects from policy analysis")];
  }
  if (executable === "cmd") {
    const commandIndex = args.findIndex((arg) => /^\/(?:c|k)$/i.test(arg));
    const nested = commandIndex >= 0 ? args.slice(commandIndex + 1) : [];
    const nestedExecutable = commandName(nested[0] ?? "");
    if (["del", "erase", "rd", "rmdir"].includes(nestedExecutable)) {
      return [createRiskFinding("filesystem.delete", "cmd", `cmd ${nestedExecutable} removes filesystem state`)];
    }
    return [createRiskFinding("opaque.execution", "cmd", "cmd.exe command effects are not represented by the PowerShell AST")];
  }
  if (executable === "wsl" && args.some((arg) => /^--unregister$/i.test(arg))) {
    return [createRiskFinding("infrastructure.destructive", executable, "wsl --unregister permanently removes a distribution")];
  }
  if (executable.endsWith(".ps1")) {
    return [createRiskFinding("opaque.execution", executable, "PowerShell executes a script whose effects are not represented in this tool call")];
  }
  if (/^(?:remove|uninstall)-/.test(executable)) {
    return [createRiskFinding("infrastructure.destructive", executable, `${executable} removes system or remote state without a recovery adapter`)];
  }
  return classifyCommandWords([executable, ...args]);
}

export function analyzeParsedPowerShell(parsed: ParsedPowerShell): RiskFinding[] {
  if (parsed.errors.length > 0) {
    return [createRiskFinding("opaque.execution", "powershell", `PowerShell syntax could not be analyzed: ${parsed.errors.join("; ")}`)];
  }
  const protectedAssignments = parsed.assignments.filter((name) => PROTECTED_ROOTS.has(name.toUpperCase()));
  const findings = protectedAssignments.length > 0
    ? [createRiskFinding(
        "identity.root-override",
        "powershell",
        `PowerShell overrides protected identity root${protectedAssignments.length === 1 ? "" : "s"}: ${protectedAssignments.join(", ")}`,
      )]
    : [];
  for (const command of parsed.commands) findings.push(...classifyPowerShellCommand(command));
  return unique(findings);
}

function parserScript(): string {
  const root = process.env.PLUGIN_ROOT ?? process.env.CLAUDE_PLUGIN_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), "..");
  return resolve(root, "scripts", "parse-powershell.ps1");
}

export function analyzePowerShellCommand(source: string): RiskFinding[] {
  const result = spawnSync(
    "powershell.exe",
    [
      "-NoLogo",
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      parserScript(),
      Buffer.from(source, "utf8").toString("base64"),
    ],
    { encoding: "utf8", timeout: 4_000, windowsHide: true },
  );
  if (result.status !== 0) {
    const detail = result.error?.message ?? result.stderr.trim() ?? `exit code ${result.status ?? "unknown"}`;
    return [createRiskFinding("opaque.execution", "powershell", `Native PowerShell parser failed: ${detail}`)];
  }
  try {
    return analyzeParsedPowerShell(JSON.parse(result.stdout) as ParsedPowerShell);
  } catch (error) {
    return [createRiskFinding("opaque.execution", "powershell", `Native PowerShell parser returned invalid JSON: ${String(error)}`)];
  }
}
