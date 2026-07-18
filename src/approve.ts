import { createInterface } from "node:readline/promises";
import { resolve } from "node:path";
import { createApprovalBroker } from "./approval.js";
import { authorityKeyDir } from "./crypto.js";
import { createManifestApprovalBroker } from "./manifest-approval.js";
import { ManifestStore } from "./manifest-store.js";
import { initializeAuthority } from "./signer.js";
import { OperationStore } from "./store.js";

type ApprovalArguments =
  | { command: "init"; dataDir: string; keyDir: string }
  | { command: "approve"; operationId: string; dataDir: string; keyDir: string }
  | { command: "approve-manifest"; manifestId: string; dataDir: string; keyDir: string };

function option(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function parseArguments(args: string[]): ApprovalArguments {
  if (!(["approve", "approve-manifest", "init"] as string[]).includes(args[0] ?? "")) {
    throw new Error("Usage: init|approve|approve-manifest [id] --data-dir <path> [--key-dir <path>]");
  }
  const dataDirValue = option(args, "--data-dir") ?? process.env.RECOVERY_AUTHORITY_DATA_DIR;
  if (!dataDirValue) throw new Error("Authority command requires --data-dir or RECOVERY_AUTHORITY_DATA_DIR");
  const dataDir = resolve(dataDirValue);
  const keyDir = authorityKeyDir(dataDir, option(args, "--key-dir") ?? process.env.RECOVERY_AUTHORITY_KEY_DIR);
  if (args[0] === "init") return { command: "init", dataDir, keyDir };
  if (!args[1] || args[1].startsWith("--")) throw new Error("Approval requires an operation ID");
  if (args[0] === "approve-manifest") {
    return { command: "approve-manifest", manifestId: args[1], dataDir, keyDir };
  }
  return { command: "approve", operationId: args[1], dataDir, keyDir };
}

export async function runApprovalCommand(args = process.argv.slice(2)): Promise<void> {
  const arguments_ = parseArguments(args);
  if (arguments_.command === "init") {
    await initializeAuthority(arguments_.dataDir, arguments_.keyDir);
    process.stdout.write(`${JSON.stringify({ initialized: true, dataDir: arguments_.dataDir })}\n`);
    return;
  }
  const { dataDir, keyDir } = arguments_;
  if (!process.stdin.isTTY && process.env.RECOVERY_AUTHORITY_ALLOW_NONINTERACTIVE_APPROVAL !== "1") {
    throw new Error("Human approval requires an interactive terminal");
  }
  if (arguments_.command === "approve-manifest") {
    const manifest = await new ManifestStore(dataDir).get(arguments_.manifestId);
    const proofPrefix = manifest.proofDigest.slice(0, 12);
    const effects = manifest.bindings.map((binding, index) =>
      `  ${index + 1}. ${binding.kind} (${binding.operationId})\n     ${binding.scope.join(", ")}`
    );
    process.stderr.write([
      "\nRecovery Authority manifest approval\n",
      `Manifest:  ${manifest.id}\n`,
      `Reason:    ${manifest.reason}\n`,
      `Expires:   ${manifest.expiresAt}\n`,
      `Proof:     ${manifest.proofDigest}\n`,
      "Effects in commit order:\n",
      `${effects.join("\n")}\n\n`,
    ].join(""));
    const terminal = createInterface({ input: process.stdin, output: process.stderr });
    const confirmation = await terminal.question(`Type manifest proof prefix ${proofPrefix} to approve all effects: `);
    terminal.close();
    const approved = await (await createManifestApprovalBroker(dataDir, keyDir))
      .approve(manifest.id, confirmation);
    const { capability: _capability, ...receipt } = approved;
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
    return;
  }
  const { operationId } = arguments_;
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
  const approved = await (await createApprovalBroker(dataDir, keyDir)).approve(operationId, confirmation);
  const { capability: _capability, ...receipt } = approved;
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
}
