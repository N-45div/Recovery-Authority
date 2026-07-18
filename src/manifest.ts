import { randomUUID } from "node:crypto";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { AuthorizationRegistry, statementDigest } from "./authorization.js";
import type { RecoveryOperation } from "./contracts.js";
import { sha256 } from "./crypto.js";
import type { ManifestBinding, PrepareManifest, RecoveryManifest } from "./manifest-contracts.js";
import { ManifestStore } from "./manifest-store.js";
import { OperationStore } from "./store.js";

interface LocalScope {
  operationId: string;
  absolutePath: string;
}

function operationScopes(operation: RecoveryOperation): string[] {
  if (operation.kind === "postgres.schema-mutate") {
    return [`postgresql:${operation.connectionFingerprint}:database`];
  }
  if (operation.kind === "git.reset-hard") return [`filesystem:${resolve(operation.repositoryRoot)}`];
  if (operation.kind === "sqlite.mutate") {
    return [`filesystem:${resolve(operation.workspaceRoot, operation.databasePath)}`];
  }
  return operation.paths.map((path) => `filesystem:${resolve(operation.workspaceRoot, path)}`);
}

function bindingFor(operation: RecoveryOperation): ManifestBinding {
  return {
    operationId: operation.id,
    kind: operation.kind,
    proofDigest: operation.proofDigest,
    stateWitness: operation.stateWitness,
    statementDigest: statementDigest(operation),
    scope: operationScopes(operation),
  };
}

function pathContains(parent: string, child: string): boolean {
  const pathFromParent = relative(parent, child);
  return pathFromParent === "" || (
    pathFromParent !== ".." &&
    !pathFromParent.startsWith(`..${sep}`) &&
    !isAbsolute(pathFromParent)
  );
}

function assertIndependentScopes(bindings: ManifestBinding[]): void {
  const postgres = new Map<string, string>();
  const local: LocalScope[] = [];
  for (const binding of bindings) {
    for (const scope of binding.scope) {
      if (scope.startsWith("postgresql:")) {
        const existing = postgres.get(scope);
        if (existing) {
          throw new Error(`Manifest operations overlap one PostgreSQL database: ${existing}, ${binding.operationId}`);
        }
        postgres.set(scope, binding.operationId);
      } else if (scope.startsWith("filesystem:")) {
        local.push({ operationId: binding.operationId, absolutePath: scope.slice("filesystem:".length) });
      }
    }
  }
  for (let left = 0; left < local.length; left += 1) {
    for (let right = left + 1; right < local.length; right += 1) {
      const a = local[left]!;
      const b = local[right]!;
      if (a.operationId === b.operationId) continue;
      if (pathContains(a.absolutePath, b.absolutePath) || pathContains(b.absolutePath, a.absolutePath)) {
        throw new Error(`Manifest operations have overlapping filesystem scope: ${a.operationId}, ${b.operationId}`);
      }
    }
  }
}

export class RecoveryManifestService {
  constructor(
    private readonly manifests: ManifestStore,
    private readonly operations: OperationStore,
    private readonly approvals: AuthorizationRegistry,
  ) {}

  async prepare(input: PrepareManifest): Promise<RecoveryManifest> {
    if (new Set(input.operationIds).size !== input.operationIds.length) {
      throw new Error("Recovery manifest operation IDs must be distinct");
    }
    const operations = await Promise.all(input.operationIds.map((id) => this.operations.get(id)));
    for (const operation of operations) {
      if (operation.status !== "proven") {
        throw new Error(`Manifest child is not proven: ${operation.id} (${operation.status})`);
      }
      if (Date.parse(operation.expiresAt) <= Date.now()) {
        throw new Error(`Manifest child proof expired: ${operation.id}`);
      }
      const authorization = await this.approvals.get(operation.id);
      if (authorization.status !== "pending") {
        throw new Error(`Manifest child must have pending individual authorization: ${operation.id} (${authorization.status})`);
      }
    }

    const bindings = operations.map(bindingFor);
    assertIndependentScopes(bindings);
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Math.min(...operations.map((operation) => Date.parse(operation.expiresAt)))).toISOString();
    const bindingDigest = sha256(JSON.stringify(bindings));
    const stateWitness = sha256(JSON.stringify(bindings.map(({ operationId, stateWitness }) => ({ operationId, stateWitness }))));
    const proofDigest = sha256(JSON.stringify({ id, reason: input.reason, bindingDigest, stateWitness, createdAt, expiresAt }));
    const manifest: RecoveryManifest = {
      id,
      status: "prepared",
      reason: input.reason,
      bindings,
      proofDigest,
      stateWitness,
      bindingDigest,
      createdAt,
      expiresAt,
      committedOperationIds: [],
      recoveredOperationIds: [],
      outstandingOperationIds: [],
      committedAt: null,
      recoveredAt: null,
      failure: null,
    };
    await this.manifests.put(manifest);
    return manifest;
  }

  async get(manifestId: string): Promise<RecoveryManifest> {
    const manifest = await this.manifests.get(manifestId);
    if (manifest.status === "prepared" && Date.parse(manifest.expiresAt) <= Date.now()) {
      const expired: RecoveryManifest = { ...manifest, status: "expired" };
      await this.manifests.put(expired);
      return expired;
    }
    return manifest;
  }
}
