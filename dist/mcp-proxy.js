// @bun
// src/mcp-proxy.ts
import { once } from "events";
import { createConnection } from "net";
async function main() {
  const socketPath = process.env.RECOVERY_AUTHORITY_MCP_SOCKET;
  if (!socketPath)
    throw new Error("RECOVERY_AUTHORITY_MCP_SOCKET is required");
  const socket = createConnection({ path: socketPath, allowHalfOpen: true });
  await once(socket, "connect");
  if (process.env.RECOVERY_AUTHORITY_DEBUG === "1")
    process.stderr.write(`[authority-proxy] connected
`);
  process.stdin.on("data", (chunk) => {
    if (process.env.RECOVERY_AUTHORITY_DEBUG === "1")
      process.stderr.write(`[authority-proxy] stdin ${chunk.length} bytes
`);
  });
  socket.on("data", (chunk) => {
    if (process.env.RECOVERY_AUTHORITY_DEBUG === "1")
      process.stderr.write(`[authority-proxy] response ${chunk.length} bytes
`);
  });
  process.stdin.pipe(socket);
  socket.pipe(process.stdout);
  socket.on("error", (error) => {
    process.stderr.write(`Recovery Authority proxy failed: ${error.message}
`);
    process.exitCode = 1;
  });
  await once(socket, "close");
}
if (import.meta.main)
  await main();
