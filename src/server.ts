import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { resolve } from "node:path";
import { realpath } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CommitFilesystemDeleteInput,
  CommitGitResetHardInput,
  CommitPostgresMutationInput,
  CommitSqliteMutationInput,
  ConsequenceGraphInput,
  ConsequenceOrientationInput,
  OperationInput,
  PrepareFilesystemDeleteInput,
  PrepareGitResetHardInput,
  PreparePostgresMutationInput,
  PrepareSqliteMutationInput,
  RestorePostgresMutationInput,
  RuntimeInspectionInput,
} from "./contracts.js";
import {
  CommitManifestInput,
  ManifestInput,
  PrepareManifestInput,
  RestoreManifestInput,
} from "./manifest-contracts.js";
import { orientConsequences, projectConsequenceGraph, sliceConsequenceGraph } from "./consequence-graph.js";
import { AuthorizationRegistry } from "./authorization.js";
import { authorityKeyDir, PublicCapabilityVerifier } from "./crypto.js";
import { FilesystemRecoveryService } from "./filesystem.js";
import { GitRecoveryService } from "./git.js";
import { PostgresRecoveryService } from "./postgres.js";
import { SqliteRecoveryService } from "./sqlite.js";
import { OperationStore } from "./store.js";
import { inspectRuntimeIdentity } from "./identity.js";
import { ManifestAuthorizationRegistry } from "./manifest-authorization.js";
import { ManifestCoordinator } from "./manifest-coordinator.js";
import { RecoveryManifestService } from "./manifest.js";
import { ManifestStore } from "./manifest-store.js";
import { formatApprovalCommand, formatManifestApprovalCommand, platformCapabilities } from "./platform.js";
import { pathsEqual } from "./path-policy.js";

const dataDir = resolve(process.env.RECOVERY_AUTHORITY_DATA_DIR ?? ".recovery-authority");
const keyDir = authorityKeyDir(dataDir);
const authorityWorkspaceRoot = process.env.RECOVERY_AUTHORITY_WORKSPACE_ROOT
  ? await realpath(resolve(process.env.RECOVERY_AUTHORITY_WORKSPACE_ROOT))
  : null;
const pluginRoot = process.env.PLUGIN_ROOT
  ? resolve(process.env.PLUGIN_ROOT)
  : resolve(dirname(fileURLToPath(import.meta.url)), "..");
const authorityEntry = resolve(pluginRoot, "dist", "authority.js");
const store = new OperationStore(dataDir);
const verifier = await PublicCapabilityVerifier.load(dataDir);
const approvals = new AuthorizationRegistry(dataDir, store, verifier);
const filesystemService = new FilesystemRecoveryService(dataDir, store, verifier);
const gitService = new GitRecoveryService(dataDir, store, verifier);
const postgresService = new PostgresRecoveryService(dataDir, store, verifier);
const sqliteService = new SqliteRecoveryService(dataDir, store, verifier);
const manifestStore = new ManifestStore(dataDir);
const manifestApprovals = new ManifestAuthorizationRegistry(dataDir, manifestStore, verifier);
const manifestService = new RecoveryManifestService(manifestStore, store, approvals);
const manifestCoordinator = new ManifestCoordinator(
  manifestStore,
  store,
  manifestApprovals,
  approvals,
  { filesystem: filesystemService, git: gitService, postgres: postgresService, sqlite: sqliteService },
);

async function assertAuthorityWorkspace(requestedRoot: string): Promise<void> {
  if (!authorityWorkspaceRoot) return;
  const requested = await realpath(resolve(requestedRoot));
  if (!pathsEqual(requested, authorityWorkspaceRoot)) {
    throw new Error(`Recovery scope must equal the sandbox workspace: ${authorityWorkspaceRoot}`);
  }
}

function authorizationView<T extends { operationId: string; status: string }>(authorization: T): T & { approvalCommand: string | null } {
  return {
    ...authorization,
    approvalCommand: authorization.status === "pending"
      ? formatApprovalCommand(authorityEntry, authorization.operationId, dataDir, keyDir)
      : null,
  };
}

function manifestAuthorizationView<T extends { manifestId: string; status: string }>(authorization: T): T & { approvalCommand: string | null } {
  return {
    ...authorization,
    approvalCommand: authorization.status === "pending"
      ? formatManifestApprovalCommand(authorityEntry, authorization.manifestId, dataDir, keyDir)
      : null,
  };
}

const server = new McpServer(
  { name: "recovery-authority", version: "0.12.0" },
  {
    instructions:
      "Call recovery_orient before destructive or delegated work to inspect consequence coverage, uncertainty, and the minimum safe cut. For supported filesystem, SQLite, PostgreSQL, and Git hard-reset effects, prepare first, inspect the restore-tested proof, wait for separate human approval, retrieve authorization, and commit only with the approved capability. Raw destructive commands remain blocked even after approval. Hook coverage applies only when the bundled hook is trusted.",
  },
);

server.registerTool(
  "recovery_prepare_manifest",
  {
    title: "Compose a recovery manifest",
    description: "Bind two or more independent pending recovery proofs into one ordered saga and one separately reviewed human approval.",
    inputSchema: PrepareManifestInput.shape,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  async (input) => {
    const manifest = await manifestService.prepare(PrepareManifestInput.parse(input));
    const result = {
      manifest,
      authorization: manifestAuthorizationView(await manifestApprovals.request(manifest)),
      semantics: {
        atomicAcrossSystems: false,
        commitOrder: "manifest binding order",
        recoveryOrder: "reverse binding order",
        overlappingScopesAllowed: false,
      },
    };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
);

server.registerTool(
  "recovery_commit_manifest",
  {
    title: "Commit an approved recovery manifest",
    description: "Commit child effects in approved order and automatically compensate recorded commits in reverse order if a later child fails.",
    inputSchema: CommitManifestInput.shape,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
  },
  async (input) => {
    const parsed = CommitManifestInput.parse(input);
    const manifest = await manifestCoordinator.commit(parsed.manifestId, parsed.capability, parsed.operations);
    return {
      content: [{ type: "text", text: JSON.stringify(manifest, null, 2) }],
      structuredContent: manifest,
    };
  },
);

server.registerTool(
  "recovery_restore_manifest",
  {
    title: "Restore or resume a recovery manifest",
    description: "Recover committed children in reverse order, including resuming explicit outstanding work after a partial recovery or interrupted commit.",
    inputSchema: RestoreManifestInput.shape,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
  },
  async (input) => {
    const parsed = RestoreManifestInput.parse(input);
    const manifest = await manifestCoordinator.recover(parsed.manifestId, parsed.operations);
    return {
      content: [{ type: "text", text: JSON.stringify(manifest, null, 2) }],
      structuredContent: manifest,
    };
  },
);

server.registerTool(
  "recovery_get_manifest_authorization",
  {
    title: "Read manifest human authorization",
    description: "Read aggregate approval status and reveal the proof-bound manifest capability only after separate terminal confirmation.",
    inputSchema: ManifestInput.shape,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async (input) => {
    const parsed = ManifestInput.parse(input);
    const authorization = manifestAuthorizationView(await manifestApprovals.get(parsed.manifestId));
    return {
      content: [{ type: "text", text: JSON.stringify(authorization, null, 2) }],
      structuredContent: authorization,
    };
  },
);

server.registerTool(
  "recovery_get_manifest",
  {
    title: "Read recovery manifest",
    description: "Read ordered child proofs, aggregate status, compensation progress, outstanding recovery work, and failure evidence.",
    inputSchema: ManifestInput.shape,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async (input) => {
    const parsed = ManifestInput.parse(input);
    const manifest = await manifestService.get(parsed.manifestId);
    return {
      content: [{ type: "text", text: JSON.stringify(manifest, null, 2) }],
      structuredContent: manifest,
    };
  },
);

server.registerTool(
  "recovery_orient",
  {
    title: "Orient to consequences and authority",
    description: "Return a compact readiness vector, minimum missing recovery and authority edges, and a bounded slice of the living consequence graph before acting.",
    inputSchema: ConsequenceOrientationInput.shape,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async (input) => {
    const parsed = ConsequenceOrientationInput.parse(input);
    const graph = await projectConsequenceGraph(dataDir);
    const orientation = orientConsequences(graph, {
      ...(parsed.goal ? { goal: parsed.goal } : {}),
      ...(parsed.command ? { command: parsed.command } : {}),
      ...(parsed.operationId ? { operationId: parsed.operationId } : {}),
      ...(parsed.manifestId ? { manifestId: parsed.manifestId } : {}),
      shellDialect: parsed.shellDialect,
    });
    const result = {
      ...orientation,
      graph: sliceConsequenceGraph(graph, {
        ...(parsed.sessionId ? { sessionId: parsed.sessionId } : {}),
        ...(parsed.operationId ? { operationId: parsed.operationId } : {}),
        ...(parsed.manifestId ? { manifestId: parsed.manifestId } : {}),
        maxNodes: parsed.maxNodes,
      }),
    };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
);

server.registerTool(
  "recovery_get_consequence_graph",
  {
    title: "Read the living consequence graph",
    description: "Read a bounded operation, session, or effect neighborhood without exposing capability tokens or raw command text.",
    inputSchema: ConsequenceGraphInput.shape,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async (input) => {
    const parsed = ConsequenceGraphInput.parse(input);
    const graph = await projectConsequenceGraph(dataDir);
    const result = sliceConsequenceGraph(graph, {
      ...(parsed.operationId ? { operationId: parsed.operationId } : {}),
      ...(parsed.manifestId ? { manifestId: parsed.manifestId } : {}),
      ...(parsed.sessionId ? { sessionId: parsed.sessionId } : {}),
      ...(parsed.category ? { category: parsed.category } : {}),
      maxNodes: parsed.maxNodes,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
);

server.registerTool(
  "recovery_inspect_runtime",
  {
    title: "Inspect recovery runtime boundaries",
    description: "Report the OS account root, mutable environment root, authority data root, and any identity drift before destructive work begins.",
    inputSchema: RuntimeInspectionInput.shape,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async () => {
    const identity = await inspectRuntimeIdentity(dataDir);
    const result = {
      identity,
      invariants: {
        accountRootIsNotDerivedFromHomeOnPosix:
          process.platform === "win32" || identity.accountHomeSource !== "unresolved",
        accountRootUsesWindowsKnownFolder:
          process.platform !== "win32" || identity.accountHomeSource === "windows-known-folder",
        authorityDataOutsideMutableHomeRequired: true,
        destructiveEffectsAreActorIndependent: true,
        nativeSubagentIdentityAvailableOnlyInLifecycleHooks: true,
        privateSigningKeyLoadedByMcp: false,
        authorityServerOutsideAgentSandbox: Boolean(process.env.RECOVERY_AUTHORITY_SANDBOX_HOST),
      },
      executionBoundary: {
        sandboxActive: process.env.RECOVERY_AUTHORITY_SANDBOX_HOST === "1",
        authorityTransport: process.env.RECOVERY_AUTHORITY_SANDBOX_HOST === "1" ? "unix-socket" : "stdio",
        platform: platformCapabilities(),
        signingKeyDirectory: keyDir,
        workspaceRoot: authorityWorkspaceRoot,
      },
    };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
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
    const parsed = PrepareFilesystemDeleteInput.parse(input);
    await assertAuthorityWorkspace(parsed.workspaceRoot);
    const prepared = await filesystemService.prepare(parsed);
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
    await approvals.assertIndividualAuthorized(parsed.operationId, parsed.capability);
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
    const parsed = PrepareGitResetHardInput.parse(input);
    await assertAuthorityWorkspace(parsed.repositoryRoot);
    const prepared = await gitService.prepare(parsed);
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
    await approvals.assertIndividualAuthorized(parsed.operationId, parsed.capability);
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
    const parsed = PrepareSqliteMutationInput.parse(input);
    await assertAuthorityWorkspace(parsed.workspaceRoot);
    const prepared = await sqliteService.prepare(parsed);
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
    await approvals.assertIndividualAuthorized(parsed.operationId, parsed.capability);
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
    await approvals.assertIndividualAuthorized(parsed.operationId, parsed.capability);
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
    const stored = await approvals.get(parsed.operationId);
    const authorization = authorizationView(stored.source === "manifest"
      ? { ...stored, capability: null }
      : stored);
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
