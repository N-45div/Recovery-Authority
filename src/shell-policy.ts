import parse from "bash-parser";
import { basename } from "node:path";

export type RiskCategory =
  | "filesystem.delete"
  | "filesystem.overwrite"
  | "git.reset-hard"
  | "git.destructive"
  | "sqlite.mutate"
  | "database.destructive"
  | "infrastructure.destructive"
  | "opaque.execution";

export interface RiskFinding {
  category: RiskCategory;
  executable: string;
  reason: string;
  adapterAvailable: boolean;
}

function text(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = (value as { text?: unknown }).text;
  return typeof candidate === "string" ? candidate : undefined;
}

function commandWords(node: Record<string, unknown>): string[] {
  const name = text(node.name);
  if (!name) return [];
  const suffix = Array.isArray(node.suffix) ? node.suffix.map(text).filter((word): word is string => Boolean(word)) : [];
  return [name, ...suffix];
}

function unwrap(words: string[]): string[] {
  let remaining = [...words];
  while (remaining.length > 0) {
    const executable = basename(remaining[0] ?? "");
    if (executable === "sudo" || executable === "command" || executable === "builtin" || executable === "nohup") {
      remaining = remaining.slice(1);
      while (remaining[0]?.startsWith("-")) remaining = remaining.slice(1);
      continue;
    }
    if (executable === "env") {
      remaining = remaining.slice(1);
      while (remaining[0] && (remaining[0].startsWith("-") || remaining[0].includes("="))) remaining = remaining.slice(1);
      continue;
    }
    break;
  }
  return remaining;
}

function finding(category: RiskCategory, executable: string, reason: string): RiskFinding {
  return {
    category,
    executable,
    reason,
    adapterAvailable:
      category === "filesystem.delete" || category === "sqlite.mutate" || category === "git.reset-hard",
  };
}

function classifyWords(input: string[]): RiskFinding[] {
  const words = unwrap(input);
  const executable = basename(words[0] ?? "").toLowerCase();
  const args = words.slice(1);
  if (!executable) return [];

  if (["rm", "unlink", "shred", "rmdir"].includes(executable)) {
    return [finding("filesystem.delete", executable, `${executable} removes filesystem state`)];
  }
  if (executable === "find" && args.some((arg) => arg === "-delete" || arg === "-exec" || arg === "-execdir")) {
    return [finding("filesystem.delete", executable, "find can delete or invoke a destructive command over many paths")];
  }
  if (executable === "truncate" || (executable === "dd" && args.some((arg) => arg.startsWith("of=")))) {
    return [finding("filesystem.overwrite", executable, `${executable} can irreversibly overwrite file contents`)];
  }
  if (executable === "git") {
    let index = 0;
    while (index < args.length && args[index]?.startsWith("-")) {
      if (["-C", "-c", "--git-dir", "--work-tree", "--namespace"].includes(args[index] ?? "")) index += 2;
      else index += 1;
    }
    const subcommand = args[index];
    const subcommandArgs = args.slice(index + 1);
    if (subcommand === "reset" && subcommandArgs.includes("--hard")) {
      return [finding("git.reset-hard", executable, "git reset --hard discards index and worktree state")];
    }
    if (subcommand === "clean" || subcommand === "restore" || subcommand === "checkout") {
      return [finding("git.destructive", executable, `git ${subcommand} can discard uncommitted state`)];
    }
  }
  if (["psql", "mysql", "sqlite3", "mongosh"].includes(executable)) {
    const statement = args.join(" ");
    if (/\b(drop|truncate|delete\s+from|alter\s+table)\b/i.test(statement)) {
      if (executable === "sqlite3") {
        return [finding("sqlite.mutate", executable, "sqlite3 contains a destructive database statement")];
      }
      return [finding("database.destructive", executable, `${executable} contains a destructive database statement`)];
    }
  }
  if (executable === "terraform" && args.some((arg) => arg === "destroy" || arg === "apply")) {
    return [finding("infrastructure.destructive", executable, `terraform ${args[0] ?? "operation"} can destroy remote infrastructure`)];
  }
  if (executable === "kubectl" && args.includes("delete")) {
    return [finding("infrastructure.destructive", executable, "kubectl delete removes cluster resources")];
  }
  if (["aws", "gcloud", "az"].includes(executable) && args.some((arg) => ["delete", "remove", "rm", "terminate-instances"].includes(arg))) {
    return [finding("infrastructure.destructive", executable, `${executable} command removes remote resources`)];
  }
  if (["sh", "bash", "zsh", "dash"].includes(executable)) {
    const commandFlag = args.findIndex((arg) => arg === "-c" || arg === "-lc");
    const nestedCommand = commandFlag >= 0 ? args[commandFlag + 1] : undefined;
    if (nestedCommand) return analyzeShellCommand(nestedCommand);
    if (args.some((arg) => !arg.startsWith("-"))) {
      return [finding("opaque.execution", executable, `${executable} executes a script whose effects are not represented in this tool call`)];
    }
  }
  return [];
}

function walk(value: unknown, findings: RiskFinding[]): void {
  if (Array.isArray(value)) {
    value.forEach((item) => walk(item, findings));
    return;
  }
  if (!value || typeof value !== "object") return;
  const node = value as Record<string, unknown>;
  if (node.type === "Command") findings.push(...classifyWords(commandWords(node)));
  for (const nested of Object.values(node)) walk(nested, findings);
}

export function analyzeShellCommand(source: string): RiskFinding[] {
  let ast: unknown;
  try {
    ast = parse(source);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return [finding("opaque.execution", "shell", `Shell syntax could not be analyzed: ${message}`)];
  }

  const findings: RiskFinding[] = [];
  walk(ast, findings);
  return [...new Map(findings.map((item) => [`${item.category}:${item.executable}:${item.reason}`, item])).values()];
}
