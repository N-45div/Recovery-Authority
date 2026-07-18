import { AuthorizationRegistry, statementDigest, type AuthorizationRecord } from "./authorization.js";
import type { CapabilityVerifier } from "./crypto.js";
import { authorityKeyDir, PublicCapabilityVerifier, sha256 } from "./crypto.js";
import { CapabilitySigner } from "./signer.js";
import { OperationStore } from "./store.js";

export type { AuthorizationRecord } from "./authorization.js";

export class ApprovalBroker extends AuthorizationRegistry {
  constructor(
    dataDir: string,
    store: OperationStore,
    verifier: CapabilityVerifier,
    private readonly signer: CapabilitySigner,
  ) {
    super(dataDir, store, verifier);
  }

  async approve(operationId: string, confirmation: string): Promise<AuthorizationRecord> {
    const operation = await this.store.get(operationId);
    if (operation.status !== "proven") throw new Error(`Operation is not approvable: ${operation.status}`);
    if (Date.parse(operation.expiresAt) <= Date.now()) throw new Error("Recovery proof expired before approval");
    const record = await this.get(operationId);
    if (record.status === "approved") return record;
    const expected = operation.proofDigest.slice(0, 12);
    if (confirmation.trim() !== expected) {
      throw new Error(`Approval confirmation must match proof prefix ${expected}`);
    }

    const approvedAt = new Date().toISOString();
    const capability = this.signer.issue({
      operationId: operation.id,
      kind: operation.kind,
      proofDigest: operation.proofDigest,
      stateWitness: operation.stateWitness,
      statementDigest: statementDigest(operation),
      expiresAt: operation.expiresAt,
    });
    const approvalDigest = sha256(JSON.stringify({
      operationId: operation.id,
      proofDigest: operation.proofDigest,
      approvedAt,
      expiresAt: operation.expiresAt,
    }));
    const approved: AuthorizationRecord = {
      ...record,
      status: "approved",
      approvedAt,
      approvalDigest,
      capability,
    };
    await this.write(approved);
    return approved;
  }

  async approveByManifest(
    operationId: string,
    manifestId: string,
    manifestProofDigest: string,
    approvedAt: string,
  ): Promise<AuthorizationRecord> {
    const operation = await this.store.get(operationId);
    if (operation.status !== "proven") throw new Error(`Manifest child is not approvable: ${operation.status}`);
    if (Date.parse(operation.expiresAt) <= Date.now()) throw new Error("Manifest child proof expired before approval");
    const record = await this.get(operationId);
    if (record.status === "approved") {
      if (record.source === "manifest" && record.manifestId === manifestId) return record;
      throw new Error(`Manifest child was approved through another authority path: ${operationId}`);
    }
    const capability = this.signer.issue({
      operationId: operation.id,
      kind: operation.kind,
      proofDigest: operation.proofDigest,
      stateWitness: operation.stateWitness,
      statementDigest: statementDigest(operation),
      expiresAt: operation.expiresAt,
    });
    const approved: AuthorizationRecord = {
      ...record,
      status: "approved",
      approvedAt,
      approvalDigest: sha256(JSON.stringify({
        operationId,
        proofDigest: operation.proofDigest,
        manifestId,
        manifestProofDigest,
        approvedAt,
        expiresAt: operation.expiresAt,
      })),
      capability,
      source: "manifest",
      manifestId,
      manifestProofDigest,
    };
    await this.write(approved);
    return approved;
  }
}

export async function createApprovalBroker(
  dataDir: string,
  keyDir = authorityKeyDir(dataDir),
): Promise<ApprovalBroker> {
  const store = new OperationStore(dataDir);
  const signer = await CapabilitySigner.loadOrCreate(keyDir, dataDir);
  const verifier = await PublicCapabilityVerifier.load(dataDir);
  return new ApprovalBroker(dataDir, store, verifier, signer);
}
