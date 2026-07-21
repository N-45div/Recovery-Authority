import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(process.env.PLUGIN_ROOT ?? join(dirname(fileURLToPath(import.meta.url)), ".."));
const timestamp = new Date().toISOString().replaceAll(/[^0-9TZ]/g, "");
const session = process.env.RECOVERY_AUTHORITY_TMUX_SESSION ?? `recovery-live-${timestamp}`;
if (!session.match(/^[A-Za-z0-9_-]+$/)) {
  throw new Error("RECOVERY_AUTHORITY_TMUX_SESSION may contain only letters, numbers, underscores, and hyphens");
}
const sessionRoot = resolve(
  process.env.RECOVERY_AUTHORITY_LIVE_ROOT ??
    join(homedir(), ".local", "share", "recovery-authority", "live-sessions", timestamp),
);
const dataDir = join(sessionRoot, "data");
const keyDir = join(sessionRoot, "keys");
const demoFixture = join(root, ".internal", "live-demo", "customer-data.txt");
const tui = join(root, "target", "release", "recovery-authority");
const checkOnly = process.argv.includes("--check");
const terminalWidth = String(Math.max(process.stdout.columns ?? 160, 120));
const terminalHeight = String(Math.max(process.stdout.rows ?? 45, 36));
const requiredForwardedEnvironment = [
  "RECOVERY_AUTHORITY_MCP_SOCKET",
  "RECOVERY_AUTHORITY_AUDIT_SOCKET",
  "RECOVERY_AUTHORITY_SANDBOX",
  "RECOVERY_AUTHORITY_KEY_DIR",
  "RECOVERY_AUTHORITY_DATA_DIR",
] as const;

function run(
  command: string,
  args: string[],
  options: { inherit?: boolean; allowFailure?: boolean; env?: NodeJS.ProcessEnv } = {},
) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: options.inherit ? undefined : "utf8",
    stdio: options.inherit ? "inherit" : "pipe",
    env: options.env ?? process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0 && !options.allowFailure) {
    const detail = typeof result.stderr === "string" ? result.stderr.trim() : "";
    throw new Error(`${command} failed with status ${result.status}${detail ? `: ${detail}` : ""}`);
  }
  return result;
}

function requireCommand(command: string): void {
  if (!Bun.which(command)) throw new Error(`Live demo requires '${command}' on PATH`);
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

function shellCommand(parts: string[]): string {
  return parts.map(shellQuote).join(" ");
}

async function assertMcpForwarding(pluginRoot: string, label: string): Promise<void> {
  const configPath = join(pluginRoot, ".mcp.json");
  const config = await Bun.file(configPath).json();
  const mcp = config?.mcpServers?.["recovery-authority"];
  const forwarded = mcp?.env_vars;
  const missing = requiredForwardedEnvironment.filter(
    (name) => !Array.isArray(forwarded) || !forwarded.includes(name),
  );
  if (missing.length > 0) {
    throw new Error([
      `${label} does not forward the host authority boundary into its MCP worker.`,
      `Missing from ${configPath}: ${missing.join(", ")}`,
      "Refresh the marketplace and reinstall Recovery Authority before starting a live demo.",
    ].join("\n"));
  }
  if (JSON.stringify(mcp?.args ?? []).includes("${PLUGIN_ROOT}")) {
    throw new Error([
      `${label} relies on unsupported PLUGIN_ROOT argument interpolation.`,
      `Codex passes the placeholder literally and the MCP worker cannot start: ${configPath}`,
      "Refresh the marketplace and reinstall Recovery Authority before starting a live demo.",
    ].join("\n"));
  }
  if (mcp?.cwd !== "." || mcp?.args?.[0] !== "./dist/mcp.js") {
    throw new Error([
      `${label} does not use the portable plugin-relative MCP launcher.`,
      `Expected cwd '.' and entry './dist/mcp.js' in ${configPath}`,
      "Refresh the marketplace and reinstall Recovery Authority before starting a live demo.",
    ].join("\n"));
  }
}

function assertMcpHandshake(pluginRoot: string): void {
  run("node", [join(root, "scripts", "smoke-mcp.mjs")], {
    env: { ...process.env, PLUGIN_UNDER_TEST: pluginRoot },
  });
}

for (const command of ["bun", "cargo", "codex", "tmux", "bwrap"]) requireCommand(command);
if (!existsSync(tui)) throw new Error("Release TUI is missing. Run: cargo build --release -p recovery-authority");

const pluginList = run("codex", ["plugin", "list"]);
const pluginMatch = String(pluginList.stdout).match(
  /^recovery-authority@recovery-authority\s+installed, enabled\s+(\S+)\s+(.+)$/m,
);
if (!pluginMatch) {
  throw new Error([
    "Recovery Authority is not installed and enabled in Codex.",
    "Run:",
    "  codex plugin marketplace add N-45div/Recovery-Authority --ref main",
    "  codex plugin add recovery-authority@recovery-authority",
  ].join("\n"));
}
await assertMcpForwarding(root, "Repository MCP configuration");
const codexHome = resolve(process.env.CODEX_HOME ?? join(homedir(), ".codex"));
const installedPluginRoot = join(
  codexHome,
  "plugins",
  "cache",
  "recovery-authority",
  "recovery-authority",
  pluginMatch[1]!,
);
if (!existsSync(installedPluginRoot)) {
  throw new Error([
    "Codex reports Recovery Authority as installed, but its installed cache is missing.",
    `Expected: ${installedPluginRoot}`,
    `Marketplace source: ${pluginMatch[2]!.trim()}`,
    "Refresh the marketplace and reinstall Recovery Authority.",
  ].join("\n"));
}
await assertMcpForwarding(installedPluginRoot, "Installed Recovery Authority plugin");
const mcpRegistration = String(run("codex", ["mcp", "get", "recovery-authority"]).stdout);
const missingRegistration = requiredForwardedEnvironment.filter((name) => !mcpRegistration.includes(name));
if (!mcpRegistration.includes("transport: stdio") || missingRegistration.length > 0) {
  throw new Error([
    "Codex does not expose the expected native Recovery Authority MCP registration.",
    `Missing forwarded environment entries: ${missingRegistration.join(", ") || "none"}`,
    "Refresh and reinstall the plugin before starting a live demo.",
  ].join("\n"));
}
assertMcpHandshake(installedPluginRoot);

if (checkOnly) {
  process.stdout.write([
    "Recovery Authority live-demo preflight passed.",
    `Workspace: ${root}`,
    `Release TUI: ${tui}`,
    "Plugin: installed and enabled",
    "Host authority socket forwarding: verified",
    "Native Codex MCP handshake: verified",
    "tmux and bubblewrap: available",
    `tmux recording size: ${terminalWidth}x${terminalHeight}`,
    "",
  ].join("\n"));
  process.exit(0);
}

await mkdir(dataDir, { recursive: true, mode: 0o700 });
await mkdir(keyDir, { recursive: true, mode: 0o700 });
await mkdir(dirname(demoFixture), { recursive: true });
await writeFile(demoFixture, "Ada\nGrace\n", { mode: 0o600 });

const codexCommand = shellCommand([
  "bun", "run", "sandbox",
  "--workspace", root,
  "--data-dir", dataDir,
  "--key-dir", keyDir,
  "--", "codex", "--no-alt-screen",
]);
const tuiCommand = shellCommand([tui, "tui", "--data-dir", dataDir]);
const approvalCommand = shellCommand([
  "env",
  `RECOVERY_AUTHORITY_DATA_DIR=${dataDir}`,
  `RECOVERY_AUTHORITY_KEY_DIR=${keyDir}`,
  "PS1=[human-approval] \\w \\$ ",
  "bash", "--noprofile", "--norc",
]);

const agentPane = String(run("tmux", [
  "new-session", "-d", "-P", "-F", "#{pane_id}",
  "-x", terminalWidth, "-y", terminalHeight,
  "-s", session, "-n", "agent", "-c", root, codexCommand,
]).stdout).trim();
try {
  const approvalPane = String(run("tmux", [
    "split-window", "-v", "-l", "24%", "-P", "-F", "#{pane_id}",
    "-t", agentPane, "-c", root, approvalCommand,
  ]).stdout).trim();
  run("tmux", ["select-pane", "-t", agentPane, "-T", "Codex agent"]);
  run("tmux", ["select-pane", "-t", approvalPane, "-T", "Human approval"]);
  run("tmux", ["select-pane", "-t", agentPane]);
  run("tmux", ["new-window", "-d", "-t", `${session}:`, "-n", "mission", "-c", root, tuiCommand]);
  run("tmux", ["set-option", "-t", session, "mouse", "on"]);
  run("tmux", ["set-window-option", "-t", session, "pane-border-status", "top"]);
  run("tmux", ["set-option", "-t", session, "status-position", "top"]);
  run("tmux", ["set-option", "-t", session, "status-style", "bg=black,fg=white"]);
  run("tmux", ["set-option", "-t", session, "window-status-current-style", "bg=green,fg=black,bold"]);
  run("tmux", ["select-window", "-t", `${session}:agent`]);
} catch (error) {
  run("tmux", ["kill-session", "-t", session], { allowFailure: true });
  throw error;
}

process.stdout.write([
  `Recovery Authority live session: ${session}`,
  `Evidence ledger: ${dataDir}`,
  `Fresh demo fixture: ${demoFixture}`,
  "",
  "agent: sandboxed Codex plus separate human approval terminal",
  "mission: live Rust TUI over the same host-owned ledger",
  "",
  "Use Ctrl-b n to switch windows. In the TUI use 1-8 and q.",
  "",
].join("\n"));

const attachArgs = process.env.TMUX
  ? ["switch-client", "-t", session]
  : ["attach-session", "-t", session];
const attached = run("tmux", attachArgs, { inherit: true, allowFailure: true });
process.exit(attached.status ?? 0);
