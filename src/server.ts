import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { resolve } from "node:path";
import {
  CommitFilesystemDeleteInput,
  CommitGitResetHardInput,
  CommitPostgresMutationInput,
  CommitSqliteMutationInput,
  OperationInput,
  PrepareFilesystemDeleteInput,
  PrepareGitResetHardInput,
  PreparePostgresMutationInput,
  PrepareSqliteMutationInput,
  RestorePostgresMutationInput,
} from "./contracts.js";
import { ApprovalBroker } from "./approval.js";
import { CapabilitySigner } from "./crypto.js";
import { FilesystemRecoveryService } from "./filesystem.js";
import { GitRecoveryService } from "./git.js";
import { PostgresRecoveryService } from "./postgres.js";
import { SqliteRecoveryService } from "./sqlite.js";
import { OperationStore } from "./store.js";

const dataDir = resolve(process.env.RECOVERY_AUTHORITY_DATA_DIR ?? ".recovery-authority");
const pluginRoot = resolve(process.env.PLUGIN_ROOT ?? ".");
const store = new OperationStore(dataDir);
const signer = await CapabilitySigner.load(dataDir);
const approvals = new ApprovalBroker(dataDir, store, signer);
const filesystemService = new FilesystemRecoveryService(dataDir, store, signer);
const gitService = new GitRecoveryService(dataDir, store, signer);
const postgresService = new PostgresRecoveryService(dataDir, store, signer);
const sqliteService = new SqliteRecoveryService(dataDir, store, signer);

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}

function authorizationView<T extends { operationId: string; status: string }>(authorization: T): T & { approvalCommand: string | null } {
  return {
    ...authorization,
    approvalCommand: authorization.status === "pending"
      ? `bash ${shellQuote(resolve(pluginRoot, "scripts", "approve-operation.sh"))} ${authorization.operationId} --data-dir ${shellQuote(dataDir)}`
      : null,
  };
}

const server = new McpServer(
  { name: "recovery-authority", version: "0.6.0" },
  {
    instructions:
      "Use Recovery Authority for destructive filesystem, SQLite, PostgreSQL, and Git hard-reset operations. Prepare first, inspect the restore-tested proof, wait for separate human approval, retrieve authorization, and commit only with the approved capability. Hook coverage applies only when the bundled hook is trusted.",
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
    const prepared = await filesystemService.prepare(PrepareFilesystemDeleteInput.parse(input));
    const result = {
      operation: prepared.operation,
      authorization: authorizationView(await approvals.request(prepared.operation)),
    };
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
    await approvals.assertAuthorized(parsed.operationId, parsed.capability);
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
    const prepared = await gitService.prepare(PrepareGitResetHardInput.parse(input));
    const result = {
      operation: prepared.operation,
      authorization: authorizationView(await approvals.request(prepared.operation)),
    };
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
    await approvals.assertAuthorized(parsed.operationId, parsed.capability);
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
    const prepared = await sqliteService.prepare(PrepareSqliteMutationInput.parse(input));
    const result = {
      operation: prepared.operation,
      authorization: authorizationView(await approvals.request(prepared.operation)),
    };
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
    await approvals.assertAuthorized(parsed.operationId, parsed.capability);
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
  "recovery_prepare_postgres_mutation",
  {
    title: "Prove PostgreSQL mutation recovery",
    description: "Create a full logical database dump, restore it into an isolated drill database, execute one schema-scoped destructive statement, and issue a proof-bound capability.",
    inputSchema: PreparePostgresMutationInput.shape,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  async (input) => {
    const prepared = await postgresService.prepare(PreparePostgresMutationInput.parse(input));
    const result = {
      operation: prepared.operation,
      authorization: authorizationView(await approvals.request(prepared.operation)),
    };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
);

server.registerTool(
  "recovery_commit_postgres_mutation",
  {
    title: "Commit proven PostgreSQL mutation",
    description: "Execute only the restore-tested PostgreSQL statement when the signed capability and live full-database witness still match.",
    inputSchema: CommitPostgresMutationInput.shape,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
  },
  async (input) => {
    const parsed = CommitPostgresMutationInput.parse(input);
    await approvals.assertAuthorized(parsed.operationId, parsed.capability);
    const operation = await postgresService.commit(parsed.operationId, parsed.capability, parsed.connectionUri, parsed.sql);
    return {
      content: [{ type: "text", text: JSON.stringify(operation, null, 2) }],
      structuredContent: operation,
    };
  },
);

server.registerTool(
  "recovery_restore_postgres_mutation",
  {
    title: "Restore committed PostgreSQL mutation",
    description: "Restore the full logical database dump only when no state changed after the authorized PostgreSQL mutation.",
    inputSchema: RestorePostgresMutationInput.shape,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
  },
  async (input) => {
    const parsed = RestorePostgresMutationInput.parse(input);
    const operation = await postgresService.recover(parsed.operationId, parsed.connectionUri);
    return {
      content: [{ type: "text", text: JSON.stringify(operation, null, 2) }],
      structuredContent: operation,
    };
  },
);

server.registerTool(
  "recovery_get_authorization",
  {
    title: "Read human authorization",
    description: "Read whether a restore-tested operation is pending, approved, or expired. The proof-bound capability is returned only after separate human approval.",
    inputSchema: OperationInput.shape,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async (input) => {
    const parsed = OperationInput.parse(input);
    const authorization = authorizationView(await approvals.get(parsed.operationId));
    return {
      content: [{ type: "text", text: JSON.stringify(authorization, null, 2) }],
      structuredContent: authorization,
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
