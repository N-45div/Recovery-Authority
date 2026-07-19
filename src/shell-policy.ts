import parse from "bash-parser";
import { basename } from "node:path";

export type RiskCategory =
  | "authorization.approval"
  | "identity.root-override"
  | "agent.delegate"
  | "filesystem.delete"
  | "filesystem.overwrite"
  | "filesystem.sync-delete"
  | "git.reset-hard"
  | "git.destructive"
  | "container.purge"
  | "sqlite.mutate"
  | "postgres.schema-mutate"
  | "database.destructive"
  | "remote-storage.delete"
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

function assignmentWords(node: Record<string, unknown>): string[] {
  return Array.isArray(node.prefix)
    ? node.prefix.map(text).filter((word): word is string => Boolean(word))
    : [];
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
      (category === "filesystem.delete" && process.platform !== "win32") ||
      category === "sqlite.mutate" ||
      category === "postgres.schema-mutate" ||
      category === "git.reset-hard",
  };
}

export function createRiskFinding(category: RiskCategory, executable: string, reason: string): RiskFinding {
  return finding(category, executable, reason);
}

const IDENTITY_ROOTS = new Set([
  "HOME",
  "USERPROFILE",
  "HOMEDRIVE",
  "HOMEPATH",
  "XDG_CONFIG_HOME",
  "XDG_DATA_HOME",
  "XDG_STATE_HOME",
]);

function identityAssignments(words: string[]): string[] {
  return words
    .map((word) => /^([A-Za-z_][A-Za-z0-9_]*)=/.exec(word)?.[1])
    .filter((name): name is string => Boolean(name && IDENTITY_ROOTS.has(name)));
}

function interpreterDeletion(executable: string, args: string[]): RiskFinding[] {
  const source = args.join(" ");
  if (["python", "python3", "python2"].includes(executable) && /\b(?:shutil\.rmtree|os\.(?:remove|unlink|rmdir)|Path\([^)]*\)\.(?:unlink|rmdir))\b/.test(source)) {
    return [finding("filesystem.delete", executable, "embedded Python invokes a filesystem deletion API")];
  }
  if (["node", "bun", "deno"].includes(executable) && /\b(?:rmSync|unlinkSync|rmdirSync|fs\.(?:rm|unlink|rmdir))\b/.test(source)) {
    return [finding("filesystem.delete", executable, "embedded JavaScript invokes a filesystem deletion API")];
  }
  if (["pwsh", "powershell"].includes(executable) && /\b(?:Remove-Item|Clear-Content)\b/i.test(source)) {
    return [finding("filesystem.delete", executable, "PowerShell invokes a destructive filesystem command")];
  }
  if (["ruby", "ruby3"].includes(executable) && /\bFileUtils\.(?:rm_rf|rm_r|rm)\b/.test(source)) {
    return [finding("filesystem.delete", executable, "embedded Ruby invokes a filesystem deletion API")];
  }
  return [];
}

function shellMcpBootstrap(executable: string, args: string[]): RiskFinding[] {
  if (!["node", "bun", "deno", "python", "python3", "python2"].includes(executable)) return [];
  const source = args.join(" ");
  if (
    /(?:StdioClientTransport|@modelcontextprotocol\/sdk\/client)/.test(source) ||
    (/(?:^|\/)(?:cli\.js|cli\.ts)\b/.test(source) && /\bmcp\b/.test(source))
  ) {
    return [finding(
      "opaque.execution",
      executable,
      "shell-built MCP clients bypass native tool registration and the configured authority transport",
    )];
  }
  return [];
}

export function classifyCommandWords(input: string[], assignments: string[] = []): RiskFinding[] {
  const rawExecutable = basename(input[0] ?? "").toLowerCase();
  const rawArgs = input.slice(1);
  const rootOverrides = identityAssignments([...assignments, ...(rawExecutable === "env" ? rawArgs : [])]);
  const words = unwrap(input);
  const executable = basename(words[0] ?? "").toLowerCase();
  const args = words.slice(1);
  if (!executable) return [];

  if (rootOverrides.length > 0) {
    return [finding("identity.root-override", executable, `command overrides protected identity root${rootOverrides.length === 1 ? "" : "s"}: ${rootOverrides.join(", ")}`)];
  }

  if (
    (executable === "codex" && args.some((arg) => ["exec", "e"].includes(arg))) ||
    (executable === "claude" && args.some((arg) => ["-p", "--print"].includes(arg))) ||
    (executable === "opencode" && args.includes("run"))
  ) {
    return [finding("agent.delegate", executable, "shell-launched agents bypass native subagent lineage and lifecycle hooks")];
  }

  if (
    executable === "approve-operation.sh" ||
    executable === "recovery-authority-approve" ||
    (["bash", "sh", "zsh", "dash", "bun", "node"].includes(executable) &&
      (args.some((arg) => /(?:^|\/)(?:approve-operation\.sh|approve\.js|approve\.ts)$/.test(arg)) ||
        (args.some((arg) => /(?:^|\/)(?:cli\.js|cli\.ts)$/.test(arg)) &&
          (args.includes("approve") || args.includes("approve-manifest")))))
  ) {
    return [finding("authorization.approval", executable, "human approval must happen outside the coding agent session")];
  }

  const mcpBootstrap = shellMcpBootstrap(executable, args);
  if (mcpBootstrap.length > 0) return mcpBootstrap;

  if (["rm", "unlink", "shred", "rmdir"].includes(executable)) {
    return [finding("filesystem.delete", executable, `${executable} removes filesystem state`)];
  }
  if (executable === "find" && args.some((arg) => arg === "-delete" || arg === "-exec" || arg === "-execdir")) {
    return [finding("filesystem.delete", executable, "find can delete or invoke a destructive command over many paths")];
  }
  if (executable === "truncate" || (executable === "dd" && args.some((arg) => arg.startsWith("of=")))) {
    return [finding("filesystem.overwrite", executable, `${executable} can irreversibly overwrite file contents`)];
  }
  if (executable === "tee" && !args.includes("-a") && !args.includes("--append")) {
    return [finding("filesystem.overwrite", executable, "tee replaces destination contents unless append mode is explicit")];
  }
  if (executable === "rsync" && args.some((arg) => arg === "--delete" || arg === "--del" || arg.startsWith("--delete-") || arg === "--remove-source-files")) {
    return [finding("filesystem.sync-delete", executable, "rsync is configured to remove source or destination entries")];
  }
  if (executable === "rclone" && args.some((arg) => ["purge", "delete", "deletefile", "rmdir", "cleanup", "sync"].includes(arg))) {
    return [finding("remote-storage.delete", executable, "rclone operation can remove remote storage objects")];
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
    if (
      subcommand === "clean" ||
      subcommand === "restore" ||
      subcommand === "checkout" ||
      (subcommand === "stash" && ["clear", "drop"].includes(subcommandArgs[0] ?? "")) ||
      (subcommand === "reflog" && ["expire", "delete"].includes(subcommandArgs[0] ?? "")) ||
      (subcommand === "branch" && subcommandArgs.some((arg) => arg === "-D")) ||
      (subcommand === "push" && subcommandArgs.some((arg) => arg === "-f" || arg === "--force" || arg.startsWith("--force-with-lease")))
    ) {
      return [finding("git.destructive", executable, `git ${subcommand} can discard uncommitted state`)];
    }
  }
  if (["docker", "podman"].includes(executable)) {
    const destructive =
      args.some((arg) => arg === "prune") ||
      (args[0] === "volume" && ["rm", "remove", "prune"].includes(args[1] ?? "")) ||
      (args[0] === "system" && args[1] === "prune") ||
      (args[0] === "compose" && args[1] === "down" && args.some((arg) => arg === "-v" || arg === "--volumes"));
    if (destructive) {
      return [finding("container.purge", executable, `${executable} operation can remove persistent container or volume state`)];
    }
  }
  if (["psql", "mysql", "sqlite3", "mongosh"].includes(executable)) {
    const statement = args.join(" ");
    if (/\b(drop|truncate|delete\s+from|update\s+|alter\s+table)\b/i.test(statement)) {
      if (executable === "sqlite3") {
        return [finding("sqlite.mutate", executable, "sqlite3 contains a destructive database statement")];
      }
      if (executable === "psql") {
        return [finding("postgres.schema-mutate", executable, "psql contains a destructive PostgreSQL statement")];
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
  if (
    (executable === "prisma" && args.includes("reset")) ||
    (["rails", "rake"].includes(executable) && args.some((arg) => /db:(?:drop|reset|purge)/.test(arg))) ||
    (executable === "manage.py" && args.includes("flush"))
  ) {
    return [finding("database.destructive", executable, `${executable} operation resets or purges database state`)];
  }
  const embeddedDeletion = interpreterDeletion(executable, args);
  if (embeddedDeletion.length > 0) return embeddedDeletion;
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
  if (node.type === "Command") findings.push(...classifyCommandWords(commandWords(node), assignmentWords(node)));
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
