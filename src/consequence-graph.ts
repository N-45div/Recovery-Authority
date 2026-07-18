import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { sha256 } from "./crypto.js";
import { analyzePowerShellCommand } from "./powershell-policy.js";
import { platformCapabilities } from "./platform.js";
import { analyzeShellCommand, type RiskCategory, type RiskFinding } from "./shell-policy.js";
import { OperationStore } from "./store.js";
import { ManifestStore } from "./manifest-store.js";

const Scalar = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const ConsequenceNode = z.object({
  id: z.string(),
  kind: z.enum(["session", "agent", "manifest", "operation", "effect", "resource", "proof", "authorization", "receipt"]),
  label: z.string(),
  state: z.string(),
  attributes: z.record(Scalar),
});

export const ConsequenceEdge = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  relation: z.enum([
    "contains",
    "delegates_to",
    "proposes",
    "may_affect",
    "protected_by",
    "requests",
    "authorizes",
    "blocks",
    "produces",
  ]),
  state: z.string(),
});

export const RecoveryPosture = z.object({
  level: z.enum(["protected", "degraded", "unprotected"]),
  hookObserved: z.boolean(),
  independentAuthority: z.boolean(),
  platform: z.string(),
  exactAdapters: z.array(z.string()),
  limitations: z.array(z.string()),
});

export const ConsequenceGraph = z.object({
  schemaVersion: z.literal(1),
  generatedAt: z.string().datetime(),
  posture: RecoveryPosture,
  nodes: z.array(ConsequenceNode),
  edges: z.array(ConsequenceEdge),
});

export type ConsequenceGraph = z.infer<typeof ConsequenceGraph>;
export type ConsequenceNode = z.infer<typeof ConsequenceNode>;
export type ConsequenceEdge = z.infer<typeof ConsequenceEdge>;

const HookEvent = z.object({
  timestamp: z.string(),
  event: z.string().optional(),
  sessionId: z.string().nullable().optional(),
  turnId: z.string().nullable().optional(),
  agentId: z.string().nullable().optional(),
  agentType: z.string().nullable().optional(),
  commandDigest: z.string().nullable().optional(),
  blocked: z.boolean(),
  findings: z.array(z.object({
    category: z.string(),
    executable: z.string(),
    reason: z.string(),
    adapterAvailable: z.boolean(),
  })),
});

const AuthorizationRecord = z.object({
  operationId: z.string().uuid(),
  status: z.enum(["pending", "approved", "expired"]),
  proofDigest: z.string(),
  requestedAt: z.string(),
  approvedAt: z.string().nullable(),
  expiresAt: z.string(),
  approvalDigest: z.string().nullable(),
  source: z.enum(["individual", "manifest"]).default("individual"),
  manifestId: z.string().uuid().nullable().default(null),
});

type AuthorizationRecord = z.infer<typeof AuthorizationRecord>;

const ManifestAuthorizationRecord = z.object({
  manifestId: z.string().uuid(),
  status: z.enum(["pending", "approved", "expired"]),
  proofDigest: z.string(),
  requestedAt: z.string(),
  approvedAt: z.string().nullable(),
  expiresAt: z.string(),
  approvalDigest: z.string().nullable(),
});

type ManifestAuthorizationRecord = z.infer<typeof ManifestAuthorizationRecord>;

const OPERATION_CATEGORY: Record<string, RiskCategory> = {
  "filesystem.delete": "filesystem.delete",
  "sqlite.mutate": "sqlite.mutate",
  "postgres.schema-mutate": "postgres.schema-mutate",
  "git.reset-hard": "git.reset-hard",
};

const BLAST_RADIUS: Record<RiskCategory, number> = {
  "authorization.approval": 5,
  "identity.root-override": 5,
  "agent.delegate": 4,
  "filesystem.delete": 3,
  "filesystem.overwrite": 3,
  "filesystem.sync-delete": 4,
  "git.reset-hard": 3,
  "git.destructive": 4,
  "container.purge": 4,
  "sqlite.mutate": 3,
  "postgres.schema-mutate": 4,
  "database.destructive": 4,
  "remote-storage.delete": 5,
  "infrastructure.destructive": 5,
  "opaque.execution": 5,
};

class GraphBuilder {
  readonly nodes = new Map<string, ConsequenceNode>();
  readonly edges = new Map<string, ConsequenceEdge>();

  node(node: ConsequenceNode): void {
    this.nodes.set(node.id, ConsequenceNode.parse(node));
  }

  edge(from: string, to: string, relation: ConsequenceEdge["relation"], state: string): void {
    const id = `edge:${sha256(`${from}:${relation}:${to}`).slice(0, 24)}`;
    this.edges.set(id, { id, from, to, relation, state });
  }
}

async function readHookEvents(dataDir: string): Promise<z.infer<typeof HookEvent>[]> {
  try {
    const content = await readFile(join(dataDir, "hook-events.jsonl"), "utf8");
    return content.split(/\r?\n/).filter(Boolean).map((line) => HookEvent.parse(JSON.parse(line)));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function readAuthorizations(dataDir: string): Promise<AuthorizationRecord[]> {
  try {
    const files = await readdir(join(dataDir, "approvals"));
    return await Promise.all(files.filter((file) => file.endsWith(".json")).map(async (file) =>
      AuthorizationRecord.parse(JSON.parse(await readFile(join(dataDir, "approvals", file), "utf8"))),
    ));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function readManifestAuthorizations(dataDir: string): Promise<ManifestAuthorizationRecord[]> {
  try {
    const files = await readdir(join(dataDir, "manifest-approvals"));
    return await Promise.all(files.filter((file) => file.endsWith(".json")).map(async (file) =>
      ManifestAuthorizationRecord.parse(JSON.parse(await readFile(join(dataDir, "manifest-approvals", file), "utf8"))),
    ));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

function resourceLabel(operation: Awaited<ReturnType<OperationStore["list"]>>[number], path: string): string {
  if (operation.kind === "postgres.schema-mutate") return `${operation.connectionFingerprint}:${path}`;
  if (operation.kind === "git.reset-hard") return `${operation.repositoryRoot}:${path}`;
  return `${operation.workspaceRoot}:${path}`;
}

function exactAdapters(): string[] {
  const adapters = platformCapabilities().recoveryAdapters;
  return [
    adapters.filesystemDelete ? "filesystem.delete" : null,
    adapters.sqliteMutation ? "sqlite.mutate" : null,
    adapters.postgresMutation ? "postgres.schema-mutate" : null,
    adapters.gitResetHard ? "git.reset-hard" : null,
  ].filter((value): value is string => value !== null);
}

function posture(hookObserved: boolean): z.infer<typeof RecoveryPosture> {
  const platform = platformCapabilities();
  const independentAuthority = process.env.RECOVERY_AUTHORITY_SANDBOX_HOST === "1";
  const limitations: string[] = [];
  if (!independentAuthority) limitations.push("authority relies on the Codex host sandbox");
  if (!platform.recoveryAdapters.filesystemDelete) limitations.push("exact filesystem deletion recovery is unavailable on this platform");
  if (!hookObserved) limitations.push("no trusted lifecycle hook receipt has been observed");
  return {
    level: independentAuthority ? "protected" : hookObserved ? "degraded" : "unprotected",
    hookObserved,
    independentAuthority,
    platform: platform.platform,
    exactAdapters: exactAdapters(),
    limitations,
  };
}

export async function projectConsequenceGraph(dataDir: string): Promise<ConsequenceGraph> {
  const [operations, authorizations, manifests, manifestAuthorizations, events] = await Promise.all([
    new OperationStore(dataDir).list(),
    readAuthorizations(dataDir),
    new ManifestStore(dataDir).list(),
    readManifestAuthorizations(dataDir),
    readHookEvents(dataDir),
  ]);
  const builder = new GraphBuilder();
  const authorizationByOperation = new Map(authorizations.map((record) => [record.operationId, record]));
  const authorizationByManifest = new Map(manifestAuthorizations.map((record) => [record.manifestId, record]));

  for (const operation of operations) {
    const operationId = `operation:${operation.id}`;
    const effectId = `effect:${operation.id}`;
    const proofId = `proof:${operation.proofDigest}`;
    builder.node({ id: operationId, kind: "operation", label: operation.kind, state: operation.status, attributes: { operationId: operation.id, expiresAt: operation.expiresAt } });
    builder.node({ id: effectId, kind: "effect", label: operation.kind, state: operation.status, attributes: { category: operation.kind } });
    builder.node({ id: proofId, kind: "proof", label: operation.proofDigest.slice(0, 12), state: operation.status === "failed" ? "failed" : "verified", attributes: { digest: operation.proofDigest, expiresAt: operation.expiresAt } });
    builder.edge(operationId, effectId, "proposes", operation.status);
    builder.edge(effectId, proofId, "protected_by", "restore-tested");
    for (const path of operation.paths) {
      const label = resourceLabel(operation, path);
      const resourceId = `resource:${sha256(label).slice(0, 24)}`;
      builder.node({ id: resourceId, kind: "resource", label, state: "observed", attributes: { path, witness: operation.stateWitness } });
      builder.edge(effectId, resourceId, "may_affect", operation.status);
    }
    const authorization = authorizationByOperation.get(operation.id);
    if (authorization) {
      const authorizationId = `authorization:${operation.id}`;
      builder.node({
        id: authorizationId,
        kind: "authorization",
        label: authorization.status,
        state: authorization.status,
        attributes: {
          operationId: operation.id,
          expiresAt: authorization.expiresAt,
          source: authorization.source,
          manifestId: authorization.manifestId,
        },
      });
      builder.edge(operationId, authorizationId, "requests", authorization.status);
      if (authorization.status === "approved") builder.edge(authorizationId, operationId, "authorizes", "approved");
    }
    if (operation.committedAt || operation.recoveredAt) {
      const receiptId = `receipt:${operation.id}:${operation.status}`;
      builder.node({ id: receiptId, kind: "receipt", label: operation.status, state: operation.status, attributes: { committedAt: operation.committedAt, recoveredAt: operation.recoveredAt } });
      builder.edge(operationId, receiptId, "produces", operation.status);
    }
  }

  for (const manifest of manifests) {
    const manifestId = `manifest:${manifest.id}`;
    const proofId = `proof:${manifest.proofDigest}`;
    builder.node({
      id: manifestId,
      kind: "manifest",
      label: "recovery.manifest",
      state: manifest.status,
      attributes: {
        manifestId: manifest.id,
        expiresAt: manifest.expiresAt,
        childCount: manifest.bindings.length,
        outstandingCount: manifest.outstandingOperationIds.length,
        bindingDigest: manifest.bindingDigest,
      },
    });
    builder.node({
      id: proofId,
      kind: "proof",
      label: manifest.proofDigest.slice(0, 12),
      state: manifest.status === "failed" ? "failed" : "verified",
      attributes: { digest: manifest.proofDigest, expiresAt: manifest.expiresAt },
    });
    builder.edge(manifestId, proofId, "protected_by", "aggregate-proof");
    for (const binding of manifest.bindings) {
      builder.edge(manifestId, `operation:${binding.operationId}`, "contains", manifest.status);
    }
    const authorization = authorizationByManifest.get(manifest.id);
    if (authorization) {
      const authorizationId = `manifest-authorization:${manifest.id}`;
      builder.node({
        id: authorizationId,
        kind: "authorization",
        label: authorization.status,
        state: authorization.status,
        attributes: { manifestId: manifest.id, expiresAt: authorization.expiresAt },
      });
      builder.edge(manifestId, authorizationId, "requests", authorization.status);
      if (authorization.status === "approved") builder.edge(authorizationId, manifestId, "authorizes", "approved");
    }
    if (manifest.committedAt || manifest.recoveredAt || manifest.failure) {
      const receiptId = `manifest-receipt:${manifest.id}:${manifest.status}`;
      builder.node({
        id: receiptId,
        kind: "receipt",
        label: manifest.status,
        state: manifest.status,
        attributes: {
          manifestId: manifest.id,
          committedAt: manifest.committedAt,
          recoveredAt: manifest.recoveredAt,
          outstandingCount: manifest.outstandingOperationIds.length,
        },
      });
      builder.edge(manifestId, receiptId, "produces", manifest.status);
    }
  }

  for (const event of events) {
    const sessionKey = event.sessionId ?? "unknown";
    const sessionId = `session:${sha256(sessionKey).slice(0, 24)}`;
    builder.node({ id: sessionId, kind: "session", label: sessionKey.slice(0, 12), state: "observed", attributes: { sessionDigest: sha256(sessionKey) } });
    if (event.agentId) {
      const agentId = `agent:${sha256(event.agentId).slice(0, 24)}`;
      const active = event.event !== "SubagentStop";
      builder.node({ id: agentId, kind: "agent", label: event.agentType ?? "subagent", state: active ? "active" : "stopped", attributes: { agentDigest: sha256(event.agentId) } });
      builder.edge(sessionId, agentId, "delegates_to", active ? "active" : "closed");
    }
    if (event.commandDigest) {
      const receiptId = `receipt:${event.commandDigest}:${event.timestamp}`;
      builder.node({ id: receiptId, kind: "receipt", label: event.blocked ? "denial" : "tool", state: event.blocked ? "blocked" : "observed", attributes: { commandDigest: event.commandDigest, timestamp: event.timestamp } });
      builder.edge(sessionId, receiptId, "produces", event.blocked ? "blocked" : "observed");
      for (const finding of event.findings) {
        const effectId = `effect:${event.commandDigest}:${finding.category}`;
        builder.node({ id: effectId, kind: "effect", label: finding.category, state: event.blocked ? "blocked" : "observed", attributes: { executable: finding.executable, adapterAvailable: finding.adapterAvailable } });
        builder.edge(receiptId, effectId, event.blocked ? "blocks" : "proposes", event.blocked ? "blocked" : "observed");
      }
    }
  }

  const graph = ConsequenceGraph.parse({
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    posture: posture(events.length > 0),
    nodes: [...builder.nodes.values()],
    edges: [...builder.edges.values()],
  });
  await mkdir(dataDir, { recursive: true, mode: 0o700 });
  const graphPath = join(dataDir, "consequence-graph.json");
  const temporaryPath = `${graphPath}.${process.pid}.${crypto.randomUUID()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(graph, null, 2)}\n`, { mode: 0o600 });
  await rename(temporaryPath, graphPath);
  return graph;
}

function freshness(operation: ConsequenceNode): boolean {
  const expiresAt = operation.attributes.expiresAt;
  return typeof expiresAt === "string" && Date.parse(expiresAt) > Date.now() && operation.state === "proven";
}

export interface SafeCutItem {
  category: string;
  requirement: "split_manifest" | "adapter_required" | "prepare_proof" | "human_approval" | "exact_commit_tool";
  satisfied: boolean;
  detail: string;
}

export interface ConsequenceOrientation {
  goalDigest: string | null;
  commandDigest: string | null;
  destructive: boolean;
  executable: false;
  findings: RiskFinding[];
  readiness: {
    blastRadius: number;
    recoveryCoverage: number;
    authority: number;
    dependencyClosure: number;
    uncertainty: number;
    proofFreshness: number;
  };
  safeCut: SafeCutItem[];
  graph: ConsequenceGraph;
}

export function orientConsequences(
  graph: ConsequenceGraph,
  options: { goal?: string; command?: string; operationId?: string; manifestId?: string; shellDialect?: "auto" | "posix" | "powershell" },
): ConsequenceOrientation {
  const dialect = options.shellDialect === "auto" || !options.shellDialect
    ? platformCapabilities().shellDialect
    : options.shellDialect;
  const findings = options.command
    ? dialect === "powershell" ? analyzePowerShellCommand(options.command) : analyzeShellCommand(options.command)
    : [];
  const categories = [...new Set(findings.map((finding) => finding.category))];
  const operations = graph.nodes.filter((node) => node.kind === "operation");
  const approvals = graph.nodes.filter((node) => node.kind === "authorization");
  const selectedManifest = options.manifestId
    ? graph.nodes.find((node) => node.kind === "manifest" && node.attributes.manifestId === options.manifestId)
    : undefined;
  const manifestOperationIds = new Set(selectedManifest
    ? graph.edges
      .filter((edge) => edge.from === selectedManifest.id && edge.relation === "contains")
      .map((edge) => graph.nodes.find((node) => node.id === edge.to)?.attributes.operationId)
      .filter((id): id is string => typeof id === "string")
    : []);
  const aggregateApproved = options.manifestId !== undefined && approvals.some((authorization) =>
    authorization.attributes.manifestId === options.manifestId &&
    authorization.attributes.operationId === undefined &&
    authorization.state === "approved",
  );
  const operationApproved = (operation: ConsequenceNode): boolean => approvals.some((authorization) =>
    authorization.attributes.operationId === operation.attributes.operationId &&
    authorization.state === "approved" &&
    (options.manifestId === undefined || (
      aggregateApproved &&
      authorization.attributes.source === "manifest" &&
      authorization.attributes.manifestId === options.manifestId
    )),
  );
  const safeCut: SafeCutItem[] = [];
  if (categories.length > 1) {
    const requiredKinds = new Set(categories.map((category) =>
      Object.entries(OPERATION_CATEGORY).find(([, value]) => value === category)?.[0],
    ).filter((kind): kind is string => Boolean(kind)));
    const manifestKinds = new Set(operations
      .filter((operation) => manifestOperationIds.has(operation.attributes.operationId as string))
      .map((operation) => operation.label));
    const exactManifest = selectedManifest !== undefined &&
      selectedManifest.state === "prepared" &&
      requiredKinds.size === manifestKinds.size &&
      [...requiredKinds].every((kind) => manifestKinds.has(kind));
    safeCut.push(exactManifest
      ? { category: "multi-effect", requirement: "split_manifest", satisfied: true, detail: "The exact effects are bound into one ordered recovery manifest." }
      : { category: "multi-effect", requirement: "split_manifest", satisfied: false, detail: "Prepare exact adapter proofs, then bind the independent effects into one recovery manifest." });
  }
  for (const category of categories) {
    const finding = findings.find((item) => item.category === category);
    const operationKind = Object.entries(OPERATION_CATEGORY).find(([, value]) => value === category)?.[0];
    if (!finding?.adapterAvailable || !operationKind) {
      safeCut.push({ category, requirement: "adapter_required", satisfied: false, detail: "No exact recovery adapter covers this effect." });
      continue;
    }
    const candidates = operations.filter((node) =>
      node.label === operationKind &&
      freshness(node) &&
      ((options.operationId !== undefined && node.attributes.operationId === options.operationId) ||
        (options.manifestId !== undefined && manifestOperationIds.has(node.attributes.operationId as string))),
    );
    if (candidates.length === 0) {
      safeCut.push({ category, requirement: "prepare_proof", satisfied: false, detail: "Prepare and restore-test an exact recovery operation." });
      continue;
    }
    const approved = candidates.some(operationApproved);
    safeCut.push(approved
      ? { category, requirement: "exact_commit_tool", satisfied: true, detail: "Use the capability only through the operation's exact MCP commit tool; the raw command remains blocked." }
      : { category, requirement: "human_approval", satisfied: false, detail: "A fresh restore proof exists but still requires separate human approval." });
  }
  const supported = findings.filter((finding) => finding.adapterAvailable).length;
  const proofCovered = categories.filter((category) => operations.some((node) =>
    node.label === category &&
    freshness(node) &&
    ((options.operationId !== undefined && node.attributes.operationId === options.operationId) ||
      (options.manifestId !== undefined && manifestOperationIds.has(node.attributes.operationId as string))),
  )).length;
  const approvedCovered = categories.filter((category) => operations.some((operation) =>
    operation.label === category &&
    freshness(operation) &&
    ((options.operationId !== undefined && operation.attributes.operationId === options.operationId) ||
      (options.manifestId !== undefined && manifestOperationIds.has(operation.attributes.operationId as string))) &&
    operationApproved(operation),
  )).length;
  const uncertain = findings.filter((finding) => finding.category === "opaque.execution" || !finding.adapterAvailable).length;
  return {
    goalDigest: options.goal ? sha256(options.goal) : null,
    commandDigest: options.command ? sha256(options.command) : null,
    destructive: findings.length > 0,
    executable: false,
    findings,
    readiness: {
      blastRadius: findings.reduce((highest, finding) => Math.max(highest, BLAST_RADIUS[finding.category]), 0),
      recoveryCoverage: findings.length === 0 ? 3 : supported === findings.length ? proofCovered === categories.length ? 2 : 1 : 0,
      authority: categories.length > 0 && approvedCovered === categories.length ? 2 : proofCovered > 0 ? 1 : 0,
      dependencyClosure: findings.length === 0 ? 1 : Number(((findings.length - uncertain) / findings.length).toFixed(2)),
      uncertainty: uncertain,
      proofFreshness: categories.length === 0 ? 1 : Number((proofCovered / categories.length).toFixed(2)),
    },
    safeCut,
    graph,
  };
}

export function sliceConsequenceGraph(
  graph: ConsequenceGraph,
  filter: { operationId?: string; manifestId?: string; sessionId?: string; category?: string; maxNodes: number },
): ConsequenceGraph {
  const seeds = new Set(graph.nodes.filter((node) =>
    (!filter.operationId || node.attributes.operationId === filter.operationId) &&
    (!filter.manifestId || node.attributes.manifestId === filter.manifestId) &&
    (!filter.category || node.label === filter.category || node.attributes.category === filter.category) &&
    (!filter.sessionId || node.attributes.sessionDigest === sha256(filter.sessionId)),
  ).map((node) => node.id));
  if (seeds.size === 0 && !filter.operationId && !filter.manifestId && !filter.sessionId && !filter.category) {
    graph.nodes.slice(0, filter.maxNodes).forEach((node) => seeds.add(node.id));
  }
  const selected = new Set<string>();
  const queue = [...seeds];
  while (queue.length > 0 && selected.size < filter.maxNodes) {
    const current = queue.shift()!;
    if (selected.has(current)) continue;
    selected.add(current);
    for (const edge of graph.edges) {
      if (edge.from === current && !selected.has(edge.to)) queue.push(edge.to);
      if (edge.to === current && !selected.has(edge.from)) queue.push(edge.from);
    }
  }
  return { ...graph, nodes: graph.nodes.filter((node) => selected.has(node.id)), edges: graph.edges.filter((edge) => selected.has(edge.from) && selected.has(edge.to)) };
}
