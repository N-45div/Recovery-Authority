import { ApprovalBroker } from "./approval.js";
import { statementDigest } from "./authorization.js";
import type { CapabilityVerifier } from "./crypto.js";
import { authorityKeyDir, PublicCapabilityVerifier, sha256 } from "./crypto.js";
import {
  ManifestAuthorizationRegistry,
  type ManifestAuthorizationRecord,
} from "./manifest-authorization.js";
import { ManifestStore } from "./manifest-store.js";
import { CapabilitySigner } from "./signer.js";
import { OperationStore } from "./store.js";

export class ManifestApprovalBroker extends ManifestAuthorizationRegistry {
  constructor(
    dataDir: string,
    manifests: ManifestStore,
    verifier: CapabilityVerifier,
    private readonly operations: OperationStore,
    private readonly childApprovals: ApprovalBroker,
    private readonly signer: CapabilitySigner,
  ) {
    super(dataDir, manifests, verifier);
  }

  async approve(manifestId: string, confirmation: string): Promise<ManifestAuthorizationRecord> {
    const manifest = await this.manifests.get(manifestId);
    if (manifest.status !== "prepared") throw new Error(`Manifest is not approvable: ${manifest.status}`);
    if (Date.parse(manifest.expiresAt) <= Date.now()) throw new Error("Recovery manifest expired before approval");
    const record = await this.get(manifestId);
    if (record.status === "approved") return record;
    const expected = manifest.proofDigest.slice(0, 12);
    if (confirmation.trim() !== expected) {
      throw new Error(`Manifest approval confirmation must match proof prefix ${expected}`);
    }

    for (const binding of manifest.bindings) {
      const operation = await this.operations.get(binding.operationId);
      if (
        operation.status !== "proven" ||
        operation.kind !== binding.kind ||
        operation.proofDigest !== binding.proofDigest ||
        operation.stateWitness !== binding.stateWitness ||
        statementDigest(operation) !== binding.statementDigest
      ) {
        throw new Error(`Manifest child no longer matches its aggregate proof: ${binding.operationId}`);
      }
      const childAuthorization = await this.childApprovals.get(operation.id);
      if (
        childAuthorization.status !== "pending" &&
        !(childAuthorization.status === "approved" &&
          childAuthorization.source === "manifest" &&
          childAuthorization.manifestId === manifest.id)
      ) {
        throw new Error(`Manifest child is not available for aggregate approval: ${operation.id}`);
      }
    }

    const approvedAt = new Date().toISOString();
    const childReceipts = [];
    for (const binding of manifest.bindings) {
      childReceipts.push(await this.childApprovals.approveByManifest(
        binding.operationId,
        manifest.id,
        manifest.proofDigest,
        approvedAt,
      ));
    }
    const capability = this.signer.issue({
      operationId: manifest.id,
      kind: "recovery.manifest",
      proofDigest: manifest.proofDigest,
      stateWitness: manifest.stateWitness,
      statementDigest: manifest.bindingDigest,
      expiresAt: manifest.expiresAt,
    });
    const approvalDigest = sha256(JSON.stringify({
      manifestId: manifest.id,
      proofDigest: manifest.proofDigest,
      approvedAt,
      expiresAt: manifest.expiresAt,
      childApprovalDigests: childReceipts.map((child) => child.approvalDigest),
    }));
    const approved: ManifestAuthorizationRecord = {
      ...record,
      status: "approved",
      approvedAt,
      approvalDigest,
      capability,
    };
    await this.write(approved);
    return approved;
  }
}

export async function createManifestApprovalBroker(
  dataDir: string,
  keyDir = authorityKeyDir(dataDir),
): Promise<ManifestApprovalBroker> {
  const operations = new OperationStore(dataDir);
  const manifests = new ManifestStore(dataDir);
  const signer = await CapabilitySigner.loadOrCreate(keyDir, dataDir);
  const verifier = await PublicCapabilityVerifier.load(dataDir);
  const childApprovals = new ApprovalBroker(dataDir, operations, verifier, signer);
  return new ManifestApprovalBroker(dataDir, manifests, verifier, operations, childApprovals, signer);
}
