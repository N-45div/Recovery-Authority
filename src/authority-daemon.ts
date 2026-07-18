import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { appendFile, chmod, mkdir, rm } from "node:fs/promises";
import { createServer, type Server, type Socket } from "node:net";
import { dirname, join } from "node:path";
import { projectConsequenceGraph } from "./consequence-graph.js";

export interface AuthorityDaemonOptions {
  socketPath: string;
  auditSocketPath: string;
  serverEntry: string;
  dataDir: string;
  keyDir: string;
  pluginRoot: string;
  workspaceRoot: string;
}

export interface AuthorityDaemon {
  close(): Promise<void>;
}

const MAX_AUDIT_EVENT_BYTES = 256 * 1024;

function debug(message: string): void {
  if (process.env.RECOVERY_AUTHORITY_DEBUG === "1") process.stderr.write(`[authority-daemon] ${message}\n`);
}

function bridge(socket: Socket, options: AuthorityDaemonOptions, children: Set<ChildProcessWithoutNullStreams>): void {
  debug("proxy connected");
  const child = spawn(process.execPath, [options.serverEntry], {
    env: {
      ...process.env,
      PLUGIN_ROOT: options.pluginRoot,
      RECOVERY_AUTHORITY_DATA_DIR: options.dataDir,
      RECOVERY_AUTHORITY_KEY_DIR: options.keyDir,
      RECOVERY_AUTHORITY_SANDBOX_HOST: "1",
      RECOVERY_AUTHORITY_WORKSPACE_ROOT: options.workspaceRoot,
    },
    stdio: ["pipe", "pipe", "pipe"],
  });
  children.add(child);
  debug(`spawned MCP server pid=${child.pid ?? "unknown"}`);
  socket.on("data", (chunk) => debug(`proxy -> MCP ${chunk.length} bytes`));
  child.stdout.on("data", (chunk) => debug(`MCP -> proxy ${chunk.length} bytes`));
  socket.pipe(child.stdin);
  child.stdout.pipe(socket);
  child.stderr.pipe(process.stderr);

  const stopChild = (): void => {
    if (!child.killed) child.kill("SIGTERM");
  };
  socket.on("end", () => debug("proxy request stream ended"));
  socket.on("error", (error) => {
    debug(`proxy error: ${error.message}`);
    stopChild();
  });
  socket.on("close", () => {
    debug("proxy socket closed");
    stopChild();
  });
  child.on("error", (error) => socket.destroy(error));
  child.on("exit", (code, signal) => {
    debug(`MCP server exited code=${code ?? "null"} signal=${signal ?? "none"}`);
    children.delete(child);
    socket.end();
  });
}

function listen(server: Server, socketPath: string): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const onError = (error: Error): void => reject(error);
    server.once("error", onError);
    server.listen(socketPath, () => {
      server.off("error", onError);
      resolvePromise();
    });
  });
}

function auditBridge(socket: Socket, dataDir: string): void {
  const chunks: Buffer[] = [];
  let size = 0;
  socket.on("data", (chunk: Buffer) => {
    size += chunk.length;
    if (size > MAX_AUDIT_EVENT_BYTES) {
      socket.destroy(new Error("Audit event exceeds size limit"));
      return;
    }
    chunks.push(chunk);
  });
  socket.on("end", async () => {
    try {
      const event = JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
      if (!event || typeof event !== "object" || Array.isArray(event) || "command" in event) {
        throw new Error("Invalid sanitized audit event");
      }
      await appendFile(join(dataDir, "hook-events.jsonl"), `${JSON.stringify(event)}\n`, { mode: 0o600 });
      await projectConsequenceGraph(dataDir);
      socket.end("ok");
    } catch (error) {
      socket.destroy(error as Error);
    }
  });
}

export async function startAuthorityDaemon(options: AuthorityDaemonOptions): Promise<AuthorityDaemon> {
  await mkdir(dirname(options.socketPath), { recursive: true, mode: 0o700 });
  await rm(options.socketPath, { force: true });
  const children = new Set<ChildProcessWithoutNullStreams>();
  const server = createServer({ allowHalfOpen: true }, (socket) => bridge(socket, options, children));
  const auditServer = createServer({ allowHalfOpen: true }, (socket) => auditBridge(socket, options.dataDir));
  await listen(server, options.socketPath);
  await listen(auditServer, options.auditSocketPath);
  debug(`listening on ${options.socketPath}`);
  await Promise.all([chmod(options.socketPath, 0o600), chmod(options.auditSocketPath, 0o600)]);

  return {
    close: async () => {
      for (const child of children) child.kill("SIGTERM");
      await Promise.all([
        new Promise<void>((resolvePromise) => server.close(() => resolvePromise())),
        new Promise<void>((resolvePromise) => auditServer.close(() => resolvePromise())),
      ]);
      await Promise.all([
        rm(options.socketPath, { force: true }),
        rm(options.auditSocketPath, { force: true }),
      ]);
    },
  };
}
