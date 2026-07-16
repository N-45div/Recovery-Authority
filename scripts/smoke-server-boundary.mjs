import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const server = await readFile(join(root, "dist", "server.js"), "utf8");
for (const forbidden of ["generateKeyPairSync", "authority-private", "class CapabilitySigner", "loadOrCreate"]) {
  assert.equal(server.includes(forbidden), false, `dist/server.js contains signing implementation marker: ${forbidden}`);
}
assert.equal(server.includes("class PublicCapabilityVerifier"), true);
process.stdout.write("Verifier-only MCP bundle smoke test passed\n");
