import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PublicCapabilityVerifier } from "../src/crypto.js";
import { CapabilitySigner } from "../src/signer.js";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("capability key separation", () => {
  test("keeps private signing material out of the verifier data directory", async () => {
    const dataDir = await mkdtemp(join(tmpdir(), "recovery-public-data-"));
    const keyDir = await mkdtemp(join(tmpdir(), "recovery-private-keys-"));
    roots.push(dataDir, keyDir);
    const signer = await CapabilitySigner.loadOrCreate(keyDir, dataDir);
    const verifier = await PublicCapabilityVerifier.load(dataDir);
    const expiresAt = new Date(Date.now() + 60_000).toISOString();
    const capability = signer.issue({
      operationId: "11111111-1111-4111-8111-111111111111",
      kind: "filesystem.delete",
      proofDigest: "proof",
      stateWitness: "state",
      statementDigest: null,
      expiresAt,
    });

    expect(verifier.verify(capability).proofDigest).toBe("proof");
    expect(await readFile(join(dataDir, "authority-public.pem"), "utf8")).toContain("PUBLIC KEY");
    await expect(readFile(join(dataDir, "authority-private.pem"), "utf8")).rejects.toThrow();
    expect(await readFile(join(keyDir, "authority-private.pem"), "utf8")).toContain("PRIVATE KEY");
  });

  test("migrates a legacy signing key without changing its public identity", async () => {
    const legacyDir = await mkdtemp(join(tmpdir(), "recovery-legacy-data-"));
    const keyDir = await mkdtemp(join(tmpdir(), "recovery-migrated-keys-"));
    roots.push(legacyDir, keyDir);
    const legacySigner = await CapabilitySigner.loadOrCreate(legacyDir, legacyDir);
    const publicKey = await readFile(join(legacyDir, "authority-public.pem"), "utf8");
    const expiresAt = new Date(Date.now() + 60_000).toISOString();
    const capability = legacySigner.issue({
      operationId: "22222222-2222-4222-8222-222222222222",
      kind: "filesystem.delete",
      proofDigest: "legacy-proof",
      stateWitness: "legacy-state",
      statementDigest: null,
      expiresAt,
    });
    await writeFile(join(legacyDir, "unrelated"), "preserved");

    await CapabilitySigner.loadOrCreate(keyDir, legacyDir);
    expect(await readFile(join(keyDir, "authority-public.pem"), "utf8")).toBe(publicKey);
    await expect(readFile(join(legacyDir, "authority-private.pem"), "utf8")).rejects.toThrow();
    expect((await PublicCapabilityVerifier.load(legacyDir)).verify(capability).proofDigest).toBe("legacy-proof");
    expect(await readFile(join(legacyDir, "unrelated"), "utf8")).toBe("preserved");
  });
});
