import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { resolve } from "node:path";
import {
  CommitFilesystemDeleteInput,
  CommitGitResetHardInput,
  CommitSqliteMutationInput,
  OperationInput,
  PrepareFilesystemDeleteInput,
  PrepareGitResetHardInput,
  PrepareSqliteMutationInput,
} from "./contracts.js";
import { CapabilitySigner } from "./crypto.js";
import { FilesystemRecoveryService } from "./filesystem.js";
import { GitRecoveryService } from "./git.js";
import { SqliteRecoveryService } from "./sqlite.js";
import { OperationStore } from "./store.js";

const dataDir = resolve(process.env.RECOVERY_AUTHORITY_DATA_DIR ?? ".recovery-authority");
const store = new OperationStore(dataDir);
const signer = await CapabilitySigner.load(dataDir);
const filesystemService = new FilesystemRecoveryService(dataDir, store, signer);
const gitService = new GitRecoveryService(dataDir, store, signer);
const sqliteService = new SqliteRecoveryService(dataDir, store, signer);

const server = new McpServer(
  { name: "recovery-authority", version: "0.4.0" },
  {
    instructions:
      "Use Recovery Authority for destructive filesystem, SQLite, and Git hard-reset operations. Prepare first, inspect the restore-tested proof, and commit only with the proof-bound capability. Hook coverage applies only when the bundled hook is trusted.",
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
    const result = await filesystemService.prepare(PrepareFilesystemDeleteInput.parse(input));
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
    const operation = await filesystemService.commit(parsed.operationId, parsed.capability);
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
    const operation = await filesystemService.recover(parsed.operationId);
    return {
      content: [{ type: "text", text: JSON.stringify(operation, null, 2) }],
      structuredContent: operation,
    };
  },
);

server.registerTool(
  "recovery_prepare_git_reset_hard",
  {
    title: "Prove Git hard-reset recovery",
    description: "Snapshot HEAD, the index, and complete worktree state, drill git reset --hard and restoration in an isolated repository, then issue a capability bound to the target commit.",
    inputSchema: PrepareGitResetHardInput.shape,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  async (input) => {
    const result = await gitService.prepare(PrepareGitResetHardInput.parse(input));
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
);

server.registerTool(
  "recovery_commit_git_reset_hard",
  {
    title: "Commit proven Git hard reset",
    description: "Run git reset --hard only when the signed proof and current HEAD/index/worktree witness still match.",
    inputSchema: CommitGitResetHardInput.shape,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
  },
  async (input) => {
    const parsed = CommitGitResetHardInput.parse(input);
    const operation = await gitService.commit(parsed.operationId, parsed.capability);
    return {
      content: [{ type: "text", text: JSON.stringify(operation, null, 2) }],
      structuredContent: operation,
    };
  },
);

server.registerTool(
  "recovery_restore_git_reset_hard",
  {
    title: "Restore committed Git hard reset",
    description: "Restore the original HEAD, index, tracked changes, and untracked worktree state when post-reset state has not changed.",
    inputSchema: OperationInput.shape,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  async (input) => {
    const parsed = OperationInput.parse(input);
    const operation = await gitService.recover(parsed.operationId);
    return {
      content: [{ type: "text", text: JSON.stringify(operation, null, 2) }],
      structuredContent: operation,
    };
  },
);

server.registerTool(
  "recovery_prepare_sqlite_mutation",
  {
    title: "Prove SQLite mutation recovery",
    description: "Serialize an existing SQLite database, execute the exact SQL against an isolated copy, verify integrity, and issue a short-lived capability.",
    inputSchema: PrepareSqliteMutationInput.shape,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  async (input) => {
    const result = await sqliteService.prepare(PrepareSqliteMutationInput.parse(input));
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
);

server.registerTool(
  "recovery_commit_sqlite_mutation",
  {
    title: "Commit proven SQLite mutation",
    description: "Execute only the restore-tested SQL when the capability and current database witness still match.",
    inputSchema: CommitSqliteMutationInput.shape,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
  },
  async (input) => {
    const parsed = CommitSqliteMutationInput.parse(input);
    const operation = await sqliteService.commit(parsed.operationId, parsed.capability, parsed.sql);
    return {
      content: [{ type: "text", text: JSON.stringify(operation, null, 2) }],
      structuredContent: operation,
    };
  },
);

server.registerTool(
  "recovery_restore_sqlite_mutation",
  {
    title: "Restore committed SQLite mutation",
    description: "Atomically restore the pre-mutation SQLite image when the post-commit database has not changed.",
    inputSchema: OperationInput.shape,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  async (input) => {
    const parsed = OperationInput.parse(input);
    const operation = await sqliteService.recover(parsed.operationId);
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
    const operation = await store.get(parsed.operationId);
    return {
      content: [{ type: "text", text: JSON.stringify(operation, null, 2) }],
      structuredContent: operation,
    };
  },
);

await server.connect(new StdioServerTransport());
