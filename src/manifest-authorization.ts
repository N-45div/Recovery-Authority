import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import type { CapabilityVerifier } from "./crypto.js";
import type { RecoveryManifest } from "./manifest-contracts.js";
import { ManifestStore } from "./manifest-store.js";

const ManifestAuthorizationRecordSchema = z.object({
  manifestId: z.string().uuid(),
  status: z.enum(["pending", "approved", "expired"]),
  proofDigest: z.string(),
  requestedAt: z.string().datetime(),
  approvedAt: z.string().datetime().nullable(),
  expiresAt: z.string().datetime(),
  approvalDigest: z.string().nullable(),
  capability: z.string().nullable(),
});

export type ManifestAuthorizationRecord = z.infer<typeof ManifestAuthorizationRecordSchema>;

export class ManifestAuthorizationRegistry {
  private readonly approvalsDir: string;

  constructor(
    dataDir: string,
    protected readonly manifests: ManifestStore,
    private readonly verifier: CapabilityVerifier,
  ) {
    this.approvalsDir = join(dataDir, "manifest-approvals");
  }

  private path(manifestId: string): string {
    return join(this.approvalsDir, `${manifestId}.json`);
  }

  protected async write(record: ManifestAuthorizationRecord): Promise<void> {
    await mkdir(this.approvalsDir, { recursive: true, mode: 0o700 });
    const path = this.path(record.manifestId);
    const temporaryPath = `${path}.${process.pid}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(record, null, 2)}\n`, { mode: 0o600 });
    await rename(temporaryPath, path);
  }

  private async read(manifestId: string): Promise<ManifestAuthorizationRecord> {
    return ManifestAuthorizationRecordSchema.parse(JSON.parse(await readFile(this.path(manifestId), "utf8")));
  }

  async request(manifest: RecoveryManifest): Promise<ManifestAuthorizationRecord> {
    const record: ManifestAuthorizationRecord = {
      manifestId: manifest.id,
      status: "pending",
      proofDigest: manifest.proofDigest,
      requestedAt: new Date().toISOString(),
      approvedAt: null,
      expiresAt: manifest.expiresAt,
      approvalDigest: null,
      capability: null,
    };
    await this.write(record);
    return record;
  }

  async get(manifestId: string): Promise<ManifestAuthorizationRecord> {
    const manifest = await this.manifests.get(manifestId);
    const record = await this.read(manifestId);
    if (record.manifestId !== manifest.id || record.proofDigest !== manifest.proofDigest) {
      throw new Error("Manifest authorization is not bound to this aggregate proof");
    }
    if (Date.parse(record.expiresAt) <= Date.now()) {
      const expired: ManifestAuthorizationRecord = { ...record, status: "expired", capability: null };
      await this.write(expired);
      return expired;
    }
    if (record.status === "approved" && record.capability) {
      const claims = this.verifier.verify(record.capability);
      if (
        claims.operationId !== manifest.id ||
        claims.kind !== "recovery.manifest" ||
        claims.proofDigest !== manifest.proofDigest ||
        claims.stateWitness !== manifest.stateWitness ||
        claims.statementDigest !== manifest.bindingDigest
      ) {
        throw new Error("Approved capability is not bound to this recovery manifest");
      }
    }
    return record;
  }

  async assertAuthorized(manifestId: string, capability: string): Promise<void> {
    const record = await this.get(manifestId);
    if (record.status !== "approved" || !record.capability) {
      throw new Error(`Human manifest authorization is not approved: ${record.status}`);
    }
    if (record.capability !== capability) throw new Error("Capability does not match the human-approved manifest");
  }
}
