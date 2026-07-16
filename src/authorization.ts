import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import type { RecoveryOperation } from "./contracts.js";
import type { CapabilityVerifier } from "./crypto.js";
import { PublicCapabilityVerifier } from "./crypto.js";
import { OperationStore } from "./store.js";

const AuthorizationRecordSchema = z.object({
  operationId: z.string().uuid(),
  status: z.enum(["pending", "approved", "expired"]),
  proofDigest: z.string(),
  requestedAt: z.string().datetime(),
  approvedAt: z.string().datetime().nullable(),
  expiresAt: z.string().datetime(),
  approvalDigest: z.string().nullable(),
  capability: z.string().nullable(),
});

export type AuthorizationRecord = z.infer<typeof AuthorizationRecordSchema>;

export function statementDigest(operation: RecoveryOperation): string | null {
  return "statementDigest" in operation ? operation.statementDigest : null;
}

export class AuthorizationRegistry {
  private readonly approvalsDir: string;

  constructor(
    dataDir: string,
    protected readonly store: OperationStore,
    private readonly verifier: CapabilityVerifier,
  ) {
    this.approvalsDir = join(dataDir, "approvals");
  }

  private path(operationId: string): string {
    return join(this.approvalsDir, `${operationId}.json`);
  }

  protected async write(record: AuthorizationRecord): Promise<void> {
    await mkdir(this.approvalsDir, { recursive: true, mode: 0o700 });
    const path = this.path(record.operationId);
    const temporaryPath = `${path}.${process.pid}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(record, null, 2)}\n`, { mode: 0o600 });
    await rename(temporaryPath, path);
  }

  private async read(operationId: string): Promise<AuthorizationRecord> {
    return AuthorizationRecordSchema.parse(JSON.parse(await readFile(this.path(operationId), "utf8")));
  }

  async request(operation: RecoveryOperation): Promise<AuthorizationRecord> {
    const record: AuthorizationRecord = {
      operationId: operation.id,
      status: "pending",
      proofDigest: operation.proofDigest,
      requestedAt: new Date().toISOString(),
      approvedAt: null,
      expiresAt: operation.expiresAt,
      approvalDigest: null,
      capability: null,
    };
    await this.write(record);
    return record;
  }

  async get(operationId: string): Promise<AuthorizationRecord> {
    const operation = await this.store.get(operationId);
    const record = await this.read(operationId);
    if (record.operationId !== operation.id || record.proofDigest !== operation.proofDigest) {
      throw new Error("Authorization record is not bound to this recovery proof");
    }
    if (Date.parse(record.expiresAt) <= Date.now()) {
      const expired: AuthorizationRecord = { ...record, status: "expired", capability: null };
      await this.write(expired);
      return expired;
    }
    if (record.status === "approved" && record.capability) {
      const claims = this.verifier.verify(record.capability);
      if (
        claims.operationId !== operation.id ||
        claims.kind !== operation.kind ||
        claims.proofDigest !== operation.proofDigest ||
        claims.stateWitness !== operation.stateWitness ||
        claims.statementDigest !== statementDigest(operation)
      ) {
        throw new Error("Approved capability is not bound to this recovery proof");
      }
    }
    return record;
  }

  async assertAuthorized(operationId: string, capability: string): Promise<void> {
    const record = await this.get(operationId);
    if (record.status !== "approved" || !record.capability) {
      throw new Error(`Human authorization is not approved: ${record.status}`);
    }
    if (record.capability !== capability) throw new Error("Capability does not match the human-approved authorization");
  }
}

export async function createAuthorizationRegistry(dataDir: string): Promise<AuthorizationRegistry> {
  const store = new OperationStore(dataDir);
  const verifier = await PublicCapabilityVerifier.load(dataDir);
  return new AuthorizationRegistry(dataDir, store, verifier);
}

