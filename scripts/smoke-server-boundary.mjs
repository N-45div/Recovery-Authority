import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const bundles = await Promise.all(["server.js", "mcp.js", "hook.js"].map(async (name) => [
  name,
  await readFile(join(root, "dist", name), "utf8"),
]));
for (const [name, bundle] of bundles) {
  for (const forbidden of ["generateKeyPairSync", "authority-private", "class CapabilitySigner", "loadOrCreate"]) {
    assert.equal(bundle.includes(forbidden), false, `dist/${name} contains signing implementation marker: ${forbidden}`);
  }
}
assert.equal(bundles.find(([name]) => name === "server.js")[1].includes("class PublicCapabilityVerifier"), true);
process.stdout.write("Verifier-only MCP bundle smoke test passed\n");
