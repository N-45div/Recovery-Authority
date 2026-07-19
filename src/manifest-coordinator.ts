import { AuthorizationRegistry } from "./authorization.js";
import { FilesystemRecoveryService } from "./filesystem.js";
import { GitRecoveryService } from "./git.js";
import { ManifestAuthorizationRegistry } from "./manifest-authorization.js";
import type { ManifestExecution, RecoveryManifest } from "./manifest-contracts.js";
import { ManifestStore } from "./manifest-store.js";
import { PostgresRecoveryService } from "./postgres.js";
import { SqliteRecoveryService } from "./sqlite.js";
import { OperationStore } from "./store.js";

interface RecoveryServices {
  filesystem: FilesystemRecoveryService;
  git: GitRecoveryService;
  postgres: PostgresRecoveryService;
  sqlite: SqliteRecoveryService;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function executionMap(
  manifest: RecoveryManifest,
  executions: ManifestExecution[],
  purpose: "commit" | "recover",
): Map<string, ManifestExecution> {
  const expected = manifest.bindings.map((binding) => binding.operationId);
  const received = executions.map((execution) => execution.operationId);
  if (expected.length !== received.length || expected.some((id, index) => id !== received[index])) {
    throw new Error("Manifest execution order must exactly match the approved child order");
  }
  const mapped = new Map(executions.map((execution) => [execution.operationId, execution]));
  for (const binding of manifest.bindings) {
    const execution = mapped.get(binding.operationId)!;
    if (purpose === "commit" && binding.kind === "sqlite.mutate" && !execution.sql) {
      throw new Error(`SQLite manifest child requires exact SQL: ${binding.operationId}`);
    }
    if (purpose === "commit" && binding.kind === "postgres.schema-mutate" && (!execution.sql || !execution.connectionUri)) {
      throw new Error(`PostgreSQL manifest child requires exact SQL and connection URI: ${binding.operationId}`);
    }
    if (purpose === "commit" && (binding.kind === "filesystem.delete" || binding.kind === "git.reset-hard") &&
      (execution.sql || execution.connectionUri)) {
      throw new Error(`Manifest child has unexpected execution parameters: ${binding.operationId}`);
    }
  }
  return mapped;
}

export class ManifestCoordinator {
  constructor(
    private readonly manifests: ManifestStore,
    private readonly operations: OperationStore,
    private readonly manifestAuthorizations: ManifestAuthorizationRegistry,
    private readonly childAuthorizations: AuthorizationRegistry,
    private readonly services: RecoveryServices,
  ) {}

  private async commitChild(execution: ManifestExecution, capability: string): Promise<void> {
    const operation = await this.operations.get(execution.operationId);
    switch (operation.kind) {
      case "filesystem.delete":
        await this.services.filesystem.commit(operation.id, capability);
        return;
      case "git.reset-hard":
        await this.services.git.commit(operation.id, capability);
        return;
      case "sqlite.mutate":
        await this.services.sqlite.commit(operation.id, capability, execution.sql!);
        return;
      case "postgres.schema-mutate":
        await this.services.postgres.commit(operation.id, capability, execution.connectionUri!, execution.sql!);
    }
  }

  private async recoverChild(execution: ManifestExecution): Promise<void> {
    const operation = await this.operations.get(execution.operationId);
    switch (operation.kind) {
      case "filesystem.delete":
        await this.services.filesystem.recover(operation.id);
        return;
      case "git.reset-hard":
        await this.services.git.recover(operation.id);
        return;
      case "sqlite.mutate":
        await this.services.sqlite.recover(operation.id);
        return;
      case "postgres.schema-mutate":
        if (!execution.connectionUri) {
          throw new Error(`PostgreSQL recovery requires its connection URI: ${operation.id}`);
        }
        await this.services.postgres.recover(operation.id, execution.connectionUri);
    }
  }

  private async compensate(
    manifest: RecoveryManifest,
    executions: Map<string, ManifestExecution>,
    finalStatus: "compensated" | "recovered",
    originalFailure: string | null,
  ): Promise<RecoveryManifest> {
    const committed = new Set(manifest.committedOperationIds);
    for (const binding of manifest.bindings) {
      const operation = await this.operations.get(binding.operationId);
      if (["committing", "committed"].includes(operation.status)) committed.add(operation.id);
    }
    let progress: RecoveryManifest = {
      ...manifest,
      status: "recovering",
      committedOperationIds: manifest.bindings
        .map((binding) => binding.operationId)
        .filter((id) => committed.has(id)),
      outstandingOperationIds: [...committed].filter((id) => !manifest.recoveredOperationIds.includes(id)),
      failure: originalFailure,
    };
    await this.manifests.put(progress);

    const recoveryFailures: string[] = [];
    for (const binding of [...manifest.bindings].reverse()) {
      if (!committed.has(binding.operationId) || progress.recoveredOperationIds.includes(binding.operationId)) continue;
      try {
        await this.recoverChild(executions.get(binding.operationId)!);
        progress = {
          ...progress,
          recoveredOperationIds: [...progress.recoveredOperationIds, binding.operationId],
          outstandingOperationIds: progress.outstandingOperationIds.filter((id) => id !== binding.operationId),
        };
        await this.manifests.put(progress);
      } catch (error) {
        recoveryFailures.push(`${binding.operationId}: ${errorMessage(error)}`);
      }
    }

    const failure = [originalFailure, ...recoveryFailures].filter(Boolean).join(" | ") || null;
    const finished: RecoveryManifest = {
      ...progress,
      status: progress.outstandingOperationIds.length === 0 ? finalStatus : "partially-recovered",
      recoveredAt: new Date().toISOString(),
      failure,
    };
    await this.manifests.put(finished);
    return finished;
  }

  async commit(manifestId: string, capability: string, executionList: ManifestExecution[]): Promise<RecoveryManifest> {
    const manifest = await this.manifests.get(manifestId);
    if (manifest.status !== "prepared") throw new Error(`Manifest is not committable: ${manifest.status}`);
    const executions = executionMap(manifest, executionList, "commit");
    await this.manifestAuthorizations.assertAuthorized(manifestId, capability);
    for (const binding of manifest.bindings) {
      const child = await this.childAuthorizations.get(binding.operationId);
      if (child.source !== "manifest" || child.manifestId !== manifest.id || !child.capability) {
        throw new Error(`Child capability is not derived from this manifest: ${binding.operationId}`);
      }
      await this.childAuthorizations.assertManifestChildAuthorized(binding.operationId, manifest.id, child.capability);
    }

    let progress = await this.manifests.beginCommit(manifest.id);
    for (const binding of manifest.bindings) {
      const execution = executions.get(binding.operationId)!;
      const child = await this.childAuthorizations.get(binding.operationId);
      try {
        await this.commitChild(execution, child.capability!);
        progress = {
          ...progress,
          committedOperationIds: [...progress.committedOperationIds, binding.operationId],
        };
        await this.manifests.put(progress);
      } catch (error) {
        const operation = await this.operations.get(binding.operationId);
        if (["committing", "committed"].includes(operation.status) && !progress.committedOperationIds.includes(operation.id)) {
          progress = { ...progress, committedOperationIds: [...progress.committedOperationIds, operation.id] };
        }
        return this.compensate(progress, executions, "compensated", errorMessage(error));
      }
    }
    const committed: RecoveryManifest = {
      ...progress,
      status: "committed",
      committedAt: new Date().toISOString(),
      outstandingOperationIds: [...progress.committedOperationIds],
    };
    await this.manifests.put(committed);
    return committed;
  }

  async recover(manifestId: string, executionList: ManifestExecution[]): Promise<RecoveryManifest> {
    const manifest = await this.manifests.get(manifestId);
    if (!["committed", "committing", "partially-recovered"].includes(manifest.status)) {
      throw new Error(`Manifest is not recoverable: ${manifest.status}`);
    }
    const executions = executionMap(manifest, executionList, "recover");
    const finalStatus = manifest.status === "committed" ? "recovered" : "compensated";
    return this.compensate(manifest, executions, finalStatus, manifest.failure);
  }
}
