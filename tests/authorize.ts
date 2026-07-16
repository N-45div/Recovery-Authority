import { createApprovalBroker } from "../src/approval.js";
import type { RecoveryOperation } from "../src/contracts.js";

export async function authorizeOperation(dataDir: string, operation: RecoveryOperation): Promise<string> {
  const broker = await createApprovalBroker(dataDir);
  await broker.request(operation);
  const approved = await broker.approve(operation.id, operation.proofDigest.slice(0, 12));
  if (!approved.capability) throw new Error("Approval broker did not issue a capability");
  return approved.capability;
}
