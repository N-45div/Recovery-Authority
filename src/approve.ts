import { createInterface } from "node:readline/promises";
import { resolve } from "node:path";
import { createApprovalBroker } from "./approval.js";
import { OperationStore } from "./store.js";

function parseArguments(): { operationId: string; dataDir: string } {
  const args = process.argv.slice(2);
  if (args[0] !== "approve" || !args[1]) {
    throw new Error("Usage: approve <operation-id> [--data-dir <path>]");
  }
  const dataDirIndex = args.indexOf("--data-dir");
  const dataDir = dataDirIndex >= 0 ? args[dataDirIndex + 1] : process.env.RECOVERY_AUTHORITY_DATA_DIR;
  if (!dataDir) throw new Error("Approval requires --data-dir or RECOVERY_AUTHORITY_DATA_DIR");
  return { operationId: args[1], dataDir: resolve(dataDir) };
}

async function main(): Promise<void> {
  const { operationId, dataDir } = parseArguments();
  if (!process.stdin.isTTY && process.env.RECOVERY_AUTHORITY_ALLOW_NONINTERACTIVE_APPROVAL !== "1") {
    throw new Error("Human approval requires an interactive terminal");
  }
  const operation = await new OperationStore(dataDir).get(operationId);
  const proofPrefix = operation.proofDigest.slice(0, 12);
  process.stderr.write([
    "\nRecovery Authority approval\n",
    `Operation: ${operation.id}\n`,
    `Effect:    ${operation.kind}\n`,
    `Scope:     ${operation.paths.join(", ")}\n`,
    `Reason:    ${operation.reason}\n`,
    `Expires:   ${operation.expiresAt}\n`,
    `Proof:     ${operation.proofDigest}\n\n`,
  ].join(""));

  const terminal = createInterface({ input: process.stdin, output: process.stderr });
  const confirmation = await terminal.question(`Type proof prefix ${proofPrefix} to approve: `);
  terminal.close();
  const approved = await (await createApprovalBroker(dataDir)).approve(operationId, confirmation);
  const { capability: _capability, ...receipt } = approved;
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
}

if (import.meta.main) await main();
