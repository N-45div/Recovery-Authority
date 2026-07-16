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

export const CommitFilesystemDeleteInput = OperationInput.extend({
  capability: z.string().min(1),
});

export const FileRecord = z.object({
  path: z.string(),
  kind: z.enum(["file", "directory", "symlink"]),
  mode: z.number().int(),
  sha256: z.string().nullable(),
  symlinkTarget: z.string().nullable(),
});

export const RecoveryOperation = z.object({
  id: z.string().uuid(),
  kind: z.literal("filesystem.delete"),
  status: z.enum(["proven", "committed", "recovered", "expired", "failed"]),
  workspaceRoot: z.string(),
  paths: z.array(z.string()),
  reason: z.string(),
  artifactDir: z.string(),
  records: z.array(FileRecord),
  stateWitness: z.string(),
  proofDigest: z.string(),
  createdAt: z.string(),
  expiresAt: z.string(),
  committedAt: z.string().nullable(),
  recoveredAt: z.string().nullable(),
  failure: z.string().nullable(),
});

export type FileRecord = z.infer<typeof FileRecord>;
export type RecoveryOperation = z.infer<typeof RecoveryOperation>;
export type PrepareFilesystemDelete = z.infer<typeof PrepareFilesystemDeleteInput>;
