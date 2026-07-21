import { spawn, spawnSync } from "node:child_process";
import { cp, lstat, mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { authorityKeyDir } from "./crypto.js";
import { initializeAuthority } from "./signer.js";
import { startAuthorityDaemon } from "./authority-daemon.js";
import { containsPath } from "./path-policy.js";

interface SandboxArguments {
  workspace: string;
  dataDir: string;
  keyDir: string;
  command: string[];
  isolateNetwork: boolean;
  stageCodexHome: boolean;
  codexHome: string | null;
}

function option(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function parseArguments(): SandboxArguments {
  const args = process.argv.slice(2);
  if (args[0] !== "sandbox") {
    throw new Error("Usage: sandbox --workspace <path> --data-dir <path> [--key-dir <path>] [--stage-codex-home] [--isolate-network] -- <command...>");
  }
  const separator = args.indexOf("--");
  if (separator < 0 || separator === args.length - 1) throw new Error("Sandbox requires -- followed by a command");
  const workspace = option(args.slice(0, separator), "--workspace");
  const dataDirValue = option(args.slice(0, separator), "--data-dir");
  if (!workspace || !dataDirValue) throw new Error("Sandbox requires --workspace and --data-dir");
  const dataDir = resolve(dataDirValue);
  return {
    workspace: resolve(workspace),
    dataDir,
    keyDir: authorityKeyDir(dataDir, option(args.slice(0, separator), "--key-dir")),
    command: args.slice(separator + 1),
    isolateNetwork: args.slice(0, separator).includes("--isolate-network"),
    stageCodexHome:
      args.slice(0, separator).includes("--stage-codex-home") || basename(args[separator + 1] ?? "") === "codex",
    codexHome: null,
  };
}

function assertDisjoint(label: string, workspace: string, protectedPath: string): void {
  if (containsPath(workspace, protectedPath) || containsPath(protectedPath, workspace)) {
    throw new Error(`${label} must be outside and disjoint from the writable workspace`);
  }
}

function serverEntry(): string {
  const current = fileURLToPath(import.meta.url);
  const source = current.endsWith(".ts");
  return join(dirname(current), source ? "server.ts" : "server.js");
}

async function waitForExit(child: ReturnType<typeof spawn>): Promise<number> {
  return await new Promise((resolvePromise, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal) {
        process.stderr.write(`Sandboxed command terminated by ${signal}\n`);
        resolvePromise(128);
        return;
      }
      resolvePromise(code ?? 1);
    });
  });
}

export function bubblewrapArguments(
  input: SandboxArguments,
  runtimeDir: string,
  socketPath: string,
  auditSocketPath: string,
): string[] {
  const args = [
    "--ro-bind", "/", "/",
    "--dev", "/dev",
    "--proc", "/proc",
    "--tmpfs", "/tmp",
    "--unshare-user",
    "--disable-userns",
    "--unshare-pid",
    "--unshare-ipc",
    "--unshare-uts",
    "--unshare-cgroup-try",
    "--die-with-parent",
    "--new-session",
    "--cap-drop", "ALL",
    "--tmpfs", input.dataDir,
    "--tmpfs", input.keyDir,
    "--bind", runtimeDir, runtimeDir,
    "--bind", input.workspace, input.workspace,
    "--setenv", "RECOVERY_AUTHORITY_MCP_SOCKET", socketPath,
    "--setenv", "RECOVERY_AUTHORITY_AUDIT_SOCKET", auditSocketPath,
    "--setenv", "RECOVERY_AUTHORITY_DATA_DIR", input.dataDir,
    "--setenv", "RECOVERY_AUTHORITY_KEY_DIR", input.keyDir,
    "--setenv", "RECOVERY_AUTHORITY_SANDBOX", "1",
    "--chdir", input.workspace,
  ];
  if (input.codexHome) args.push("--setenv", "CODEX_HOME", input.codexHome);
  if (input.isolateNetwork) args.push("--unshare-net");
  return [...args, "--", ...input.command];
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

export function removeTomlTableFamily(config: string, table: string): string {
  let excluded = false;
  const kept = config.split("\n").filter((line) => {
    const header = line.match(/^\s*\[([^\]]+)]\s*(?:#.*)?$/);
    if (header) {
      excluded = header[1] === table || header[1]?.startsWith(`${table}.`) === true;
    }
    return !excluded;
  });
  return kept.join("\n").replace(/\n{3,}/g, "\n\n");
}

async function stageCodexHome(runtimeDir: string): Promise<string> {
  const source = await realpath(resolve(process.env.CODEX_HOME ?? join(homedir(), ".codex")));
  const destination = join(runtimeDir, "codex-home");
  await mkdir(destination, { recursive: true, mode: 0o700 });
  const copiedFiles = [
    "auth.json",
    "installation_id",
    "models_cache.json",
    "state_5.sqlite",
    "state_5.sqlite-shm",
    "state_5.sqlite-wal",
    "version.json",
  ];
  for (const name of copiedFiles) {
    const sourcePath = join(source, name);
    if (await pathExists(sourcePath)) await cp(sourcePath, join(destination, name), { preserveTimestamps: true });
  }
  const sourceConfig = join(source, "config.toml");
  if (await pathExists(sourceConfig)) {
    const config = await readFile(sourceConfig, "utf8");
    await writeFile(
      join(destination, "config.toml"),
      removeTomlTableFamily(config, "mcp_servers"),
      { mode: 0o600 },
    );
  }
  for (const name of ["cache", "memories", "packages", "plugins", "rules", "skills"]) {
    const sourcePath = join(source, name);
    if (await pathExists(sourcePath)) await symlink(sourcePath, join(destination, name), "dir");
  }
  for (const name of ["log", "mcp-oauth-locks", "sessions", "shell_snapshots", "tmp"]) {
    await mkdir(join(destination, name), { recursive: true, mode: 0o700 });
  }
  return destination;
}

async function main(): Promise<void> {
  if (process.platform !== "linux") throw new Error("The enforceable sandbox currently requires Linux");
  const available = spawnSync("bwrap", ["--version"], { encoding: "utf8" });
  if (available.status !== 0) throw new Error("bubblewrap (bwrap) is required and was not found on PATH");

  const parsed = parseArguments();
  await Promise.all([
    mkdir(parsed.dataDir, { recursive: true, mode: 0o700 }),
    mkdir(parsed.keyDir, { recursive: true, mode: 0o700 }),
  ]);
  parsed.workspace = await realpath(parsed.workspace);
  parsed.dataDir = await realpath(parsed.dataDir);
  parsed.keyDir = await realpath(parsed.keyDir);
  assertDisjoint("Authority data directory", parsed.workspace, parsed.dataDir);
  assertDisjoint("Authority signing directory", parsed.workspace, parsed.keyDir);
  if (containsPath(parsed.dataDir, parsed.keyDir) || containsPath(parsed.keyDir, parsed.dataDir)) {
    throw new Error("Authority data and signing directories must be disjoint");
  }

  await initializeAuthority(parsed.dataDir, parsed.keyDir);
  const runtimeParent = process.env.RECOVERY_AUTHORITY_RUNTIME_ROOT
    ? resolve(process.env.RECOVERY_AUTHORITY_RUNTIME_ROOT)
    : dirname(parsed.dataDir);
  await mkdir(runtimeParent, { recursive: true, mode: 0o700 });
  const runtimeDir = await mkdtemp(join(runtimeParent, ".recovery-authority-sandbox-"));
  if (parsed.stageCodexHome) parsed.codexHome = await stageCodexHome(runtimeDir);
  const socketPath = join(runtimeDir, "authority.sock");
  const auditSocketPath = join(runtimeDir, "audit.sock");
  const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const daemon = await startAuthorityDaemon({
    socketPath,
    auditSocketPath,
    serverEntry: serverEntry(),
    dataDir: parsed.dataDir,
    keyDir: parsed.keyDir,
    pluginRoot,
    workspaceRoot: parsed.workspace,
  });

  try {
    const child = spawn("bwrap", bubblewrapArguments(parsed, runtimeDir, socketPath, auditSocketPath), {
      env: process.env,
      stdio: "inherit",
    });
    process.exitCode = await waitForExit(child);
  } finally {
    await daemon.close();
    await rm(runtimeDir, { recursive: true, force: true });
  }
}

if (import.meta.main) await main();
