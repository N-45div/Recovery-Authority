import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { resolve } from "node:path";
import {
  CommitFilesystemDeleteInput,
  OperationInput,
  PrepareFilesystemDeleteInput,
} from "./contracts.js";
import { createFilesystemRecoveryService } from "./filesystem.js";

const dataDir = resolve(process.env.RECOVERY_AUTHORITY_DATA_DIR ?? ".recovery-authority");
const service = await createFilesystemRecoveryService(dataDir);

const server = new McpServer(
  { name: "recovery-authority", version: "0.1.0" },
  {
    instructions:
      "Use Recovery Authority for destructive filesystem operations. Prepare first, inspect the restore-tested proof, and commit only with the proof-bound capability. Do not claim that raw shell operations are protected.",
  },
);

server.registerTool(
  "recovery_prepare_filesystem_delete",
  {
    title: "Prove filesystem recovery",
    description: "Create a scoped artifact, restore-test it in isolation, and issue a short-lived capability for deleting files or directories.",
    inputSchema: PrepareFilesystemDeleteInput.shape,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  async (input) => {
    const result = await service.prepare(PrepareFilesystemDeleteInput.parse(input));
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
);

server.registerTool(
  "recovery_commit_filesystem_delete",
  {
    title: "Commit proven filesystem delete",
    description: "Execute a prepared delete only when its signed capability is valid and the protected state has not changed.",
    inputSchema: CommitFilesystemDeleteInput.shape,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
  },
  async (input) => {
    const parsed = CommitFilesystemDeleteInput.parse(input);
    const operation = await service.commit(parsed.operationId, parsed.capability);
    return {
      content: [{ type: "text", text: JSON.stringify(operation, null, 2) }],
      structuredContent: operation,
    };
  },
);

server.registerTool(
  "recovery_restore_filesystem_delete",
  {
    title: "Restore committed filesystem delete",
    description: "Restore a committed filesystem delete from its independently stored artifact and verify the original state witness.",
    inputSchema: OperationInput.shape,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  async (input) => {
    const parsed = OperationInput.parse(input);
    const operation = await service.recover(parsed.operationId);
    return {
      content: [{ type: "text", text: JSON.stringify(operation, null, 2) }],
      structuredContent: operation,
    };
  },
);

server.registerTool(
  "recovery_get_operation",
  {
    title: "Read recovery operation",
    description: "Read the proof, status, scope, and recovery receipt for an operation.",
    inputSchema: OperationInput.shape,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async (input) => {
    const parsed = OperationInput.parse(input);
    const operation = await service.get(parsed.operationId);
    return {
      content: [{ type: "text", text: JSON.stringify(operation, null, 2) }],
      structuredContent: operation,
    };
  },
);

await server.connect(new StdioServerTransport());
