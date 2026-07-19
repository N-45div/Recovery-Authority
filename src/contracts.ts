import { z } from "zod";

export const PrepareFilesystemDeleteInput = z.object({
  workspaceRoot: z.string().min(1).describe("Absolute path to the authorized workspace root"),
  paths: z.array(z.string().min(1)).min(1).max(100).describe("Workspace-relative files or directories to delete"),
  reason: z.string().min(1).max(500).describe("Why the destructive operation is needed"),
  ttlSeconds: z.number().int().min(30).max(900).default(300),
});

export const OperationInput = z.object({
  operationId: z.string().uuid(),
});

export const RuntimeInspectionInput = z.object({});

export const ConsequenceOrientationInput = z.object({
  goal: z.string().min(1).max(500).optional(),
  command: z.string().min(1).max(100_000).optional(),
  shellDialect: z.enum(["auto", "posix", "powershell"]).default("auto"),
  sessionId: z.string().min(1).max(500).optional(),
  operationId: z.string().uuid().optional(),
  manifestId: z.string().uuid().optional(),
  maxNodes: z.number().int().min(10).max(200).default(80),
});

export const ConsequenceGraphInput = z.object({
  operationId: z.string().uuid().optional(),
  manifestId: z.string().uuid().optional(),
  sessionId: z.string().min(1).max(500).optional(),
  category: z.string().min(1).max(100).optional(),
  maxNodes: z.number().int().min(10).max(200).default(80),
});

export const CommitFilesystemDeleteInput = OperationInput.extend({
  capability: z.string().min(1),
});

export const PrepareSqliteMutationInput = z.object({
  workspaceRoot: z.string().min(1).describe("Absolute path to the authorized workspace root"),
  databasePath: z.string().min(1).describe("Workspace-relative path to an existing SQLite database"),
  sql: z.string().min(1).max(100_000).describe("Exact destructive SQL to restore-test and authorize"),
  reason: z.string().min(1).max(500),
  ttlSeconds: z.number().int().min(30).max(900).default(300),
});

export const CommitSqliteMutationInput = OperationInput.extend({
  capability: z.string().min(1),
  sql: z.string().min(1).max(100_000),
});

export const PrepareGitResetHardInput = z.object({
  repositoryRoot: z.string().min(1).describe("Absolute path to the Git worktree root"),
  target: z.string().min(1).max(500).default("HEAD").describe("Commit-ish passed to git reset --hard"),
  reason: z.string().min(1).max(500),
  ttlSeconds: z.number().int().min(30).max(900).default(300),
});

export const CommitGitResetHardInput = OperationInput.extend({
  capability: z.string().min(1),
});

export const PreparePostgresMutationInput = z.object({
  connectionUri: z.string().url().describe("PostgreSQL connection URI; credentials are never persisted"),
  schema: z.string().regex(/^[A-Za-z_][A-Za-z0-9_$]*$/).default("public"),
  sql: z.string().min(1).max(100_000),
  reason: z.string().min(1).max(500),
  ttlSeconds: z.number().int().min(30).max(900).default(300),
});

export const CommitPostgresMutationInput = OperationInput.extend({
  capability: z.string().min(1),
  connectionUri: z.string().url(),
  sql: z.string().min(1).max(100_000),
});

export const RestorePostgresMutationInput = OperationInput.extend({
  connectionUri: z.string().url(),
});

export const FileRecord = z.object({
  path: z.string(),
  kind: z.enum(["file", "directory", "symlink"]),
  mode: z.number().int(),
  sha256: z.string().nullable(),
  symlinkTarget: z.string().nullable(),
});

const RecoveryOperationBase = z.object({
  id: z.string().uuid(),
  status: z.enum(["proven", "committing", "committed", "recovered", "expired", "failed"]),
  workspaceRoot: z.string(),
  paths: z.array(z.string()),
  reason: z.string(),
  artifactDir: z.string(),
  stateWitness: z.string(),
  proofDigest: z.string(),
  createdAt: z.string(),
  expiresAt: z.string(),
  committedAt: z.string().nullable(),
  recoveredAt: z.string().nullable(),
  failure: z.string().nullable(),
});

export const FilesystemRecoveryOperation = RecoveryOperationBase.extend({
  kind: z.literal("filesystem.delete"),
  records: z.array(FileRecord),
  committedPaths: z.array(z.string()).default([]),
});

export const SqliteRecoveryOperation = RecoveryOperationBase.extend({
  kind: z.literal("sqlite.mutate"),
  databasePath: z.string(),
  statementDigest: z.string(),
  integrityCheck: z.literal("ok"),
  drillPostWitness: z.string().nullable().default(null),
  postCommitWitness: z.string().nullable(),
});

export const GitResetHardRecoveryOperation = RecoveryOperationBase.extend({
  kind: z.literal("git.reset-hard"),
  repositoryRoot: z.string(),
  targetCommit: z.string(),
  originalHead: z.string(),
  originalHeadRef: z.string().nullable(),
  records: z.array(FileRecord),
  indexDigest: z.string(),
  indexMode: z.number().int(),
  drillPostWitness: z.string().nullable().default(null),
  postCommitWitness: z.string().nullable(),
});

export const PostgresRecoveryOperation = RecoveryOperationBase.extend({
  kind: z.literal("postgres.schema-mutate"),
  schema: z.string(),
  backupScope: z.literal("database"),
  connectionFingerprint: z.string(),
  connectionDisplay: z.string().default("PostgreSQL database (legacy operation; connection identity unavailable)"),
  statementDigest: z.string(),
  artifactDigest: z.string(),
  drillPostWitness: z.string(),
  postCommitWitness: z.string().nullable(),
});

export const RecoveryOperation = z.discriminatedUnion("kind", [
  FilesystemRecoveryOperation,
  SqliteRecoveryOperation,
  GitResetHardRecoveryOperation,
  PostgresRecoveryOperation,
]);

export type FileRecord = z.infer<typeof FileRecord>;
export type RecoveryOperation = z.infer<typeof RecoveryOperation>;
export type FilesystemRecoveryOperation = z.infer<typeof FilesystemRecoveryOperation>;
export type SqliteRecoveryOperation = z.infer<typeof SqliteRecoveryOperation>;
export type GitResetHardRecoveryOperation = z.infer<typeof GitResetHardRecoveryOperation>;
export type PostgresRecoveryOperation = z.infer<typeof PostgresRecoveryOperation>;
export type PrepareFilesystemDelete = z.infer<typeof PrepareFilesystemDeleteInput>;
export type PrepareSqliteMutation = z.infer<typeof PrepareSqliteMutationInput>;
export type PrepareGitResetHard = z.infer<typeof PrepareGitResetHardInput>;
export type PreparePostgresMutation = z.infer<typeof PreparePostgresMutationInput>;
