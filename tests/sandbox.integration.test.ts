import { afterEach, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const roots: string[] = [];
const hasBubblewrap = process.platform === "linux" && spawnSync("bwrap", ["--version"]).status === 0;
const hasCodex = spawnSync("codex", ["--version"]).status === 0;
const runSandboxIntegration = hasBubblewrap && process.env.RECOVERY_SANDBOX_INTEGRATION === "1";

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe.skipIf(!runSandboxIntegration)("Linux sandbox boundary", () => {
  test("protects host and authority state across delegated child processes", async () => {
    const root = await mkdtemp(join(dirname(pluginRoot), ".recovery-sandbox-test-"));
    roots.push(root);
    const workspace = join(root, "workspace");
    const dataDir = join(root, "authority-data");
    const keyDir = join(root, "authority-keys");
    const protectedPath = join(root, "host-state.txt");
    await mkdir(workspace);
    await Promise.all([mkdir(dataDir), mkdir(keyDir)]);
    await writeFile(protectedPath, "host state");

    const script = [
      "set -eu",
      "printf 'workspace state' > inside.txt",
      "if rm -f \"$PROTECTED_PATH\" 2>/dev/null; then exit 20; fi",
      "test -f \"$PROTECTED_PATH\"",
      "test ! -e \"$RECOVERY_AUTHORITY_DATA_DIR/authority-public.pem\"",
      "test ! -e \"$RECOVERY_AUTHORITY_KEY_DIR/authority-private.pem\"",
      "bash -c 'if rm -f \"$PROTECTED_PATH\" 2>/dev/null; then exit 21; fi'",
      "printf '%s\\n' '{\"hook_event_name\":\"SubagentStart\",\"session_id\":\"parent\",\"cwd\":\"/repo\",\"agent_id\":\"nested-worker\",\"agent_type\":\"worker\"}' | bash \"$PLUGIN_ROOT/scripts/run-pre-tool-hook.sh\" >/dev/null",
      "timeout 10 node \"$PLUGIN_ROOT/scripts/smoke-sandbox-mcp.mjs\" > mcp-response.jsonl",
      "grep -q '\"serverInfo\"' mcp-response.jsonl",
    ].join("\n");
    const result = spawnSync(
      process.execPath,
      [
        join(pluginRoot, "src", "sandbox.ts"),
        "sandbox",
        "--workspace", workspace,
        "--data-dir", dataDir,
        "--key-dir", keyDir,
        "--",
        "bash", "-lc", script,
      ],
      {
        cwd: pluginRoot,
        encoding: "utf8",
        timeout: 20_000,
        env: { ...process.env, PLUGIN_ROOT: pluginRoot, PROTECTED_PATH: protectedPath },
      },
    );

    expect(result.status, `${result.stderr}\n${result.stdout}`).toBe(0);
    expect(await readFile(protectedPath, "utf8")).toBe("host state");
    expect(await readFile(join(workspace, "inside.txt"), "utf8")).toBe("workspace state");
    expect(await readFile(join(keyDir, "authority-private.pem"), "utf8")).toContain("PRIVATE KEY");
    expect(await readFile(join(dataDir, "hook-events.jsonl"), "utf8")).toContain("nested-worker");
  }, 25_000);

  test("rejects authority state located inside the writable workspace", async () => {
    const root = await mkdtemp(join(dirname(pluginRoot), ".recovery-sandbox-overlap-"));
    roots.push(root);
    const workspace = join(root, "workspace");
    const dataDir = join(workspace, ".authority");
    const keyDir = join(root, "authority-keys");
    await mkdir(workspace);
    await Promise.all([mkdir(dataDir), mkdir(keyDir)]);
    const result = spawnSync(
      process.execPath,
      [
        join(pluginRoot, "src", "sandbox.ts"),
        "sandbox",
        "--workspace", workspace,
        "--data-dir", dataDir,
        "--key-dir", keyDir,
        "--", "true",
      ],
      { cwd: pluginRoot, encoding: "utf8", timeout: 10_000 },
    );
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("must be outside and disjoint");
  });

  test.skipIf(!hasCodex)("starts Codex with disposable writable state", async () => {
    const root = await mkdtemp(join(dirname(pluginRoot), ".recovery-sandbox-codex-"));
    roots.push(root);
    const workspace = join(root, "workspace");
    const dataDir = join(root, "authority-data");
    const keyDir = join(root, "authority-keys");
    await Promise.all([mkdir(workspace), mkdir(dataDir), mkdir(keyDir)]);
    const result = spawnSync(
      process.execPath,
      [
        join(pluginRoot, "src", "sandbox.ts"),
        "sandbox",
        "--workspace", workspace,
        "--data-dir", dataDir,
        "--key-dir", keyDir,
        "--", "codex", "--version",
      ],
      { cwd: pluginRoot, encoding: "utf8", timeout: 15_000 },
    );
    expect(result.status, `${result.stderr}\n${result.stdout}`).toBe(0);
    expect(result.stdout).toContain("codex-cli");
    expect(result.stderr).not.toContain("Read-only file system");
  }, 20_000);
});
