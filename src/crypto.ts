import { createHash, generateKeyPairSync, sign, verify } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

export function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function base64url(value: Buffer | string): string {
  return Buffer.from(value).toString("base64url");
}

const CapabilityClaims = z.object({
  operationId: z.string().uuid(),
  kind: z.enum(["filesystem.delete", "sqlite.mutate", "git.reset-hard"]),
  proofDigest: z.string(),
  stateWitness: z.string(),
  statementDigest: z.string().nullable().default(null),
  expiresAt: z.string().datetime(),
});

export type CapabilityClaims = z.infer<typeof CapabilityClaims>;

export class CapabilitySigner {
  private constructor(
    private readonly privateKey: string,
    private readonly publicKey: string,
  ) {}

  static async load(dataDir: string): Promise<CapabilitySigner> {
    await mkdir(dataDir, { recursive: true, mode: 0o700 });
    const privatePath = join(dataDir, "authority-private.pem");
    const publicPath = join(dataDir, "authority-public.pem");

    try {
      const [privateKey, publicKey] = await Promise.all([
        readFile(privatePath, "utf8"),
        readFile(publicPath, "utf8"),
      ]);
      return new CapabilitySigner(privateKey, publicKey);
    } catch {
      const pair = generateKeyPairSync("ed25519", {
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
        publicKeyEncoding: { type: "spki", format: "pem" },
      });
      await Promise.all([
        writeFile(privatePath, pair.privateKey, { mode: 0o600 }),
        writeFile(publicPath, pair.publicKey, { mode: 0o644 }),
      ]);
      return new CapabilitySigner(pair.privateKey, pair.publicKey);
    }
  }

  issue(claims: CapabilityClaims): string {
    const payload = base64url(JSON.stringify(claims));
    const signature = sign(null, Buffer.from(payload), this.privateKey);
    return `${payload}.${base64url(signature)}`;
  }

  verify(token: string): CapabilityClaims {
    const [payload, encodedSignature, extra] = token.split(".");
    if (!payload || !encodedSignature || extra) {
      throw new Error("Malformed capability token");
    }

    const valid = verify(
      null,
      Buffer.from(payload),
      this.publicKey,
      Buffer.from(encodedSignature, "base64url"),
    );
    if (!valid) throw new Error("Invalid capability signature");

    const claims = CapabilityClaims.parse(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")));
    if (Date.parse(claims.expiresAt) <= Date.now()) throw new Error("Capability expired");
    return claims;
  }
}
