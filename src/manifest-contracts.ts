import { z } from "zod";

export const RecoveryEffectKind = z.enum([
  "filesystem.delete",
  "sqlite.mutate",
  "git.reset-hard",
  "postgres.schema-mutate",
]);

export const ManifestBinding = z.object({
  operationId: z.string().uuid(),
  kind: RecoveryEffectKind,
  proofDigest: z.string(),
  stateWitness: z.string(),
  statementDigest: z.string().nullable(),
  scope: z.array(z.string()).min(1),
});

export const RecoveryManifest = z.object({
  id: z.string().uuid(),
  status: z.enum([
    "prepared",
    "committing",
    "committed",
    "recovering",
    "recovered",
    "compensated",
    "partially-recovered",
    "failed",
    "expired",
  ]),
  reason: z.string().min(1).max(500),
  bindings: z.array(ManifestBinding).min(2).max(20),
  proofDigest: z.string(),
  stateWitness: z.string(),
  bindingDigest: z.string(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  committedOperationIds: z.array(z.string().uuid()),
  recoveredOperationIds: z.array(z.string().uuid()),
  outstandingOperationIds: z.array(z.string().uuid()),
  committedAt: z.string().datetime().nullable(),
  recoveredAt: z.string().datetime().nullable(),
  failure: z.string().nullable(),
});

export const PrepareManifestInput = z.object({
  operationIds: z.array(z.string().uuid()).min(2).max(20),
  reason: z.string().min(1).max(500),
});

export const ManifestInput = z.object({
  manifestId: z.string().uuid(),
});

export const ManifestExecution = z.object({
  operationId: z.string().uuid(),
  sql: z.string().min(1).max(100_000).optional(),
  connectionUri: z.string().url().optional(),
});

export const CommitManifestInput = ManifestInput.extend({
  capability: z.string().min(1),
  operations: z.array(ManifestExecution).min(2).max(20),
});

export const RestoreManifestInput = ManifestInput.extend({
  operations: z.array(ManifestExecution).min(2).max(20),
});

export type RecoveryEffectKind = z.infer<typeof RecoveryEffectKind>;
export type ManifestBinding = z.infer<typeof ManifestBinding>;
export type RecoveryManifest = z.infer<typeof RecoveryManifest>;
export type PrepareManifest = z.infer<typeof PrepareManifestInput>;
export type ManifestExecution = z.infer<typeof ManifestExecution>;
