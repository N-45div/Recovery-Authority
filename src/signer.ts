import { generateKeyPairSync, sign } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { CapabilityClaims } from "./crypto.js";
import { authorityKeyDir } from "./crypto.js";

function base64url(value: Buffer | string): string {
  return Buffer.from(value).toString("base64url");
}

export class CapabilitySigner {
  private constructor(private readonly privateKey: string) {}

  static async loadOrCreate(keyDir: string, publicDataDir: string): Promise<CapabilitySigner> {
    const resolvedKeyDir = resolve(keyDir);
    const resolvedDataDir = resolve(publicDataDir);
    await Promise.all([
      mkdir(resolvedKeyDir, { recursive: true, mode: 0o700 }),
      mkdir(resolvedDataDir, { recursive: true, mode: 0o700 }),
    ]);
    const privatePath = join(resolvedKeyDir, "authority-private.pem");
    const keyPublicPath = join(resolvedKeyDir, "authority-public.pem");
    const verifierPublicPath = join(resolvedDataDir, "authority-public.pem");
    const legacyPrivatePath = join(resolvedDataDir, "authority-private.pem");

    if (resolvedKeyDir !== resolvedDataDir) {
      const legacyPrivate = await readFile(legacyPrivatePath, "utf8").catch((error) => {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
        throw error;
      });
      if (legacyPrivate) {
        const legacyPublic = await readFile(verifierPublicPath, "utf8");
        const existingPrivate = await readFile(privatePath, "utf8").catch(() => null);
        const existingPublic = await readFile(keyPublicPath, "utf8").catch(() => null);
        if (existingPrivate && existingPrivate !== legacyPrivate) {
          throw new Error("Refusing to overwrite a distinct authority signing key during migration");
        }
        if (existingPublic && existingPublic !== legacyPublic) {
          throw new Error("Refusing to overwrite a distinct authority public key during migration");
        }
        if (!existingPrivate) await writeFile(privatePath, legacyPrivate, { mode: 0o600, flag: "wx" });
        if (!existingPublic) await writeFile(keyPublicPath, legacyPublic, { mode: 0o644, flag: "wx" });
        await rm(legacyPrivatePath);
      }
    }

    let privateKey: string;
    let publicKey: string;
    try {
      [privateKey, publicKey] = await Promise.all([
        readFile(privatePath, "utf8"),
        readFile(keyPublicPath, "utf8"),
      ]);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      const pair = generateKeyPairSync("ed25519", {
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
        publicKeyEncoding: { type: "spki", format: "pem" },
      });
      privateKey = pair.privateKey;
      publicKey = pair.publicKey;
      await Promise.all([
        writeFile(privatePath, privateKey, { mode: 0o600, flag: "wx" }),
        writeFile(keyPublicPath, publicKey, { mode: 0o644, flag: "wx" }),
      ]).catch(async (writeError) => {
        if ((writeError as NodeJS.ErrnoException).code !== "EEXIST") throw writeError;
        [privateKey, publicKey] = await Promise.all([
          readFile(privatePath, "utf8"),
          readFile(keyPublicPath, "utf8"),
        ]);
      });
    }
    await writeFile(verifierPublicPath, publicKey, { mode: 0o644 });
    return new CapabilitySigner(privateKey);
  }

  issue(claims: CapabilityClaims): string {
    const payload = base64url(JSON.stringify(claims));
    const signature = sign(null, Buffer.from(payload), this.privateKey);
    return `${payload}.${base64url(signature)}`;
  }
}

export async function initializeAuthority(dataDir: string, keyDir = authorityKeyDir(dataDir)): Promise<void> {
  await CapabilitySigner.loadOrCreate(keyDir, dataDir);
}

