import { createHash, verify } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { z } from "zod";

export function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}
export const CapabilityClaimsSchema = z.object({
  operationId: z.string().uuid(),
  kind: z.enum([
    "filesystem.delete",
    "sqlite.mutate",
    "git.reset-hard",
    "postgres.schema-mutate",
    "recovery.manifest",
  ]),
  proofDigest: z.string(),
  stateWitness: z.string(),
  statementDigest: z.string().nullable().default(null),
  expiresAt: z.string().datetime(),
});

export type CapabilityClaims = z.infer<typeof CapabilityClaimsSchema>;

export interface CapabilityVerifier {
  verify(token: string): CapabilityClaims;
}

export function authorityKeyDir(dataDir: string, configured = process.env.RECOVERY_AUTHORITY_KEY_DIR): string {
  return resolve(configured ?? `${resolve(dataDir)}.keys`);
}

export class PublicCapabilityVerifier implements CapabilityVerifier {
  private constructor(private readonly publicKey: string) {}

  static async load(dataDir: string): Promise<PublicCapabilityVerifier> {
    const publicKey = await readFile(join(dataDir, "authority-public.pem"), "utf8").catch((error) => {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new Error("Recovery Authority is not initialized: the public capability key is missing");
      }
      throw error;
    });
    return new PublicCapabilityVerifier(publicKey);
  }

  verify(token: string): CapabilityClaims {
    const [payload, encodedSignature, extra] = token.split(".");
    if (!payload || !encodedSignature || extra) throw new Error("Malformed capability token");
    const valid = verify(
      null,
      Buffer.from(payload),
      this.publicKey,
      Buffer.from(encodedSignature, "base64url"),
    );
    if (!valid) throw new Error("Invalid capability signature");
    const claims = CapabilityClaimsSchema.parse(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")));
    if (Date.parse(claims.expiresAt) <= Date.now()) throw new Error("Capability expired");
    return claims;
  }
}
