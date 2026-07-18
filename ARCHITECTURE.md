# Recovery Authority Architecture

Recovery Authority is a recovery-backed authorization runtime for coding agents. It separates consequence analysis, recovery proof generation, human approval, and destructive execution so that no model-facing process can mint its own authority.

The core invariant is:

> A destructive effect is executable only through an exact adapter after successful restore testing and separate proof-bound human approval.

## System overview

```mermaid
flowchart LR
    Human["Human operator"]

    subgraph AgentBoundary["Agent execution boundary"]
        Agent["Codex agent and subagents"]
        Skill["Recovery Authority skill"]
        Hook["Lifecycle and PreToolUse hooks"]
        Proxy["MCP stdio proxy"]
        Raw["Raw shell or patch operation"]

        Agent --> Skill
        Agent --> Raw
        Raw --> Hook
        Agent --> Proxy
    end

    subgraph AuthorityBoundary["Recovery Authority boundary"]
        MCP["Official SDK MCP server<br/>public-key verification only"]
        Policy["Effect and path policy"]
        Adapters["Exact recovery adapters"]
        Drill["Isolated restore drill"]
        Operations[("Operation ledger")]
        Manifests[("Manifest ledger")]
        Artifacts[("Recovery artifacts")]
        Graph["Living consequence graph"]
        Broker["Terminal approval broker"]
        Signer["Private Ed25519 signer"]

        MCP --> Policy
        MCP --> Adapters
        Adapters --> Drill
        Adapters --> Artifacts
        Adapters --> Operations
        MCP --> Manifests
        Operations --> Graph
        Manifests --> Graph
        Hook -.->|sanitized receipts| Graph
        Broker --> Signer
        Broker --> Operations
        Broker --> Manifests
    end

    TUI["Rust mission-control TUI"]

    Hook -- "deny recognized raw effects" --> Agent
    Proxy -- "typed MCP calls" --> MCP
    MCP -- "proofs, status, capabilities after approval" --> Proxy
    Human -- "separate terminal confirmation" --> Broker
    Graph -- "advisory orientation only" --> MCP
    Operations --> TUI
    Manifests --> TUI
    Graph --> TUI

    Signer -.->|never loaded here| MCP
```

### Trust boundaries

| Boundary | Trusted responsibility | Explicitly not trusted |
| --- | --- | --- |
| Agent and descendants | Request typed operations and report results | Classifying their own effects, issuing approval, or holding signing keys |
| Codex hooks | Intercept recognized tool effects and emit sanitized receipts | Comprehensive process isolation when hooks are disabled or bypassed outside Codex |
| MCP server | Prepare proofs, verify public capabilities, re-witness state, and dispatch exact adapters | Minting capabilities or converting graph state into authority |
| Terminal approval broker | Display exact scope and proof, confirm human input, and sign capabilities | Model-controlled or non-interactive approval by default |
| Recovery adapters | Snapshot, drill, commit, and restore one supported effect kind | Generic compensation for unsupported or opaque effects |
| Linux sandbox runner | Keep host authority state outside the agent mount namespace | Protecting arbitrary remote systems or providing distributed locks |

## Single-operation protocol

```mermaid
sequenceDiagram
    autonumber
    actor User as Human operator
    participant Agent as Coding agent
    participant Hook as PreToolUse hook
    participant MCP as MCP server
    participant Adapter as Exact adapter
    participant Drill as Isolated drill
    participant Ledger as Operation and approval ledgers
    participant Broker as Terminal approval broker

    Agent->>Hook: Attempt raw destructive effect
    Hook-->>Agent: Deny and name the exact recovery workflow
    Agent->>MCP: recovery_prepare_* with exact scope
    MCP->>Adapter: Snapshot current state
    Adapter->>Drill: Restore artifact in isolation
    Drill->>Drill: Execute exact effect and verify restoration
    Drill-->>Adapter: State witness and proof result
    Adapter->>Ledger: Persist proven operation
    MCP->>Ledger: Persist pending authorization
    MCP-->>Agent: Operation, proof digest, expiry, approvalCommand
    Agent-->>User: Report proof and separate-terminal command
    User->>Broker: Run approvalCommand and type proof prefix
    Broker->>Ledger: Persist signed proof-bound approval
    Agent->>MCP: recovery_get_authorization
    MCP-->>Agent: Approved capability
    Agent->>MCP: recovery_commit_* with exact capability
    MCP->>Ledger: Verify approved record
    MCP->>Adapter: Verify capability and re-witness live state
    Adapter->>Ledger: Persist committed receipt
    MCP-->>Agent: Committed operation
    opt Exact recovery requested
        Agent->>MCP: recovery_restore_*
        MCP->>Adapter: Verify post-commit witness and restore
        Adapter->>Ledger: Persist recovered receipt
        MCP-->>Agent: Recovered operation
    end
```

The raw command remains blocked after approval. The capability is accepted only by its corresponding exact MCP commit tool.

## Recovery Manifest saga

A Recovery Manifest composes two to twenty independent, already proven operations. It provides one aggregate review while preserving exact child authority.

```mermaid
sequenceDiagram
    autonumber
    actor User as Human operator
    participant Agent as Coding agent
    participant MCP as MCP server
    participant Manifest as Manifest coordinator
    participant Ledger as Authority ledgers
    participant Broker as Terminal approval broker
    participant A as Adapter A
    participant B as Adapter B

    Note over Agent,Ledger: Child operations A and B are proven, fresh, distinct, and pending approval
    Agent->>MCP: recovery_prepare_manifest([A, B])
    MCP->>Manifest: Validate immutable bindings and order
    Manifest->>Manifest: Reject overlapping filesystem or PostgreSQL scopes
    Manifest->>Ledger: Persist aggregate proof and pending approval
    MCP-->>Agent: Manifest proof and approvalCommand
    Agent-->>User: Show every ordered effect and scope
    User->>Broker: Confirm aggregate proof in separate terminal
    Broker->>Ledger: Sign manifest capability
    Broker->>Ledger: Derive exact A and B child capabilities
    Agent->>MCP: recovery_commit_manifest([A, B])
    MCP->>Manifest: Verify aggregate and child authority
    Manifest->>A: Commit A
    A->>Ledger: Record A committed
    Manifest->>B: Commit B
    alt B commits
        B->>Ledger: Record B committed
        Manifest->>Ledger: Record manifest committed
        MCP-->>Agent: status = committed
    else B fails or reports a mismatched live result
        Manifest->>Ledger: Re-read B status after the thrown call
        Manifest->>A: Recover A in reverse order
        alt A recovers
            A->>Ledger: Record A recovered
            Manifest->>Ledger: Record manifest compensated
            MCP-->>Agent: status = compensated
        else Recovery guard refuses later live-state overwrite
            Manifest->>Ledger: Record outstanding A
            MCP-->>Agent: status = partially-recovered
        end
    end
```

### Manifest state machine

```mermaid
stateDiagram-v2
    state "partially-recovered" as partially_recovered
    [*] --> prepared
    prepared --> expired: proof TTL elapsed
    prepared --> committing: aggregate capability verified
    committing --> committed: every child committed
    committing --> recovering: child failure or explicit abort
    committed --> recovering: restore requested
    recovering --> compensated: failed saga fully reversed
    recovering --> recovered: committed saga fully restored
    recovering --> partially_recovered: one or more recovery guards refuse
    partially_recovered --> recovering: explicit resume
    committing --> failed: unrecoverable coordinator error
    prepared --> failed: invalid durable state
    expired --> [*]
    compensated --> [*]
    recovered --> [*]
    failed --> [*]
```

This is a compensated saga, not a distributed transaction. It does not claim cross-system atomicity, isolation, or invisible intermediate states.

## Living consequence graph

The consequence graph is a bounded, derived projection for agent orientation and the TUI. It reduces repeated context reconstruction without becoming an authorization source.

```mermaid
flowchart TD
    Session["Session"] -->|delegates_to| Subagent["Subagent"]
    Session -->|produces| Denial["Hook denial receipt"]
    Denial -->|blocks| Proposed["Proposed effect"]

    Manifest["Recovery Manifest"] -->|contains| OperationA["Operation A"]
    Manifest -->|contains| OperationB["Operation B"]
    Manifest -->|protected_by| AggregateProof["Aggregate proof"]
    Manifest -->|requests| ManifestApproval["Manifest authorization"]
    ManifestApproval -->|authorizes| Manifest

    OperationA -->|proposes| EffectA["Exact effect A"]
    OperationB -->|proposes| EffectB["Exact effect B"]
    EffectA -->|may_affect| ResourceA["Resource A"]
    EffectB -->|may_affect| ResourceB["Resource B"]
    EffectA -->|protected_by| ProofA["Restore proof A"]
    EffectB -->|protected_by| ProofB["Restore proof B"]
    OperationA -->|requests| ApprovalA["Child authorization A"]
    OperationB -->|requests| ApprovalB["Child authorization B"]

    OperationA -->|produces| ReceiptA["Commit or recovery receipt"]
    Manifest -->|produces| SagaReceipt["Saga or outstanding-work receipt"]

    GraphView["recovery_orient and graph slice"]
    Session -.-> GraphView
    Manifest -.-> GraphView
    ResourceA -.-> GraphView
    ResourceB -.-> GraphView
    GraphView -.->|advisory only| AgentDecision["Agent planning"]
```

`recovery_orient` returns:

- blast radius;
- recovery coverage;
- authority readiness;
- dependency closure;
- uncertainty;
- proof freshness;
- the minimum safe cut still preventing execution.

The graph stores digests rather than raw commands and never stores capability tokens. Exact readiness requires an operation ID or manifest ID; category similarity cannot transfer authority.

## Durable state model

```mermaid
erDiagram
    RECOVERY_OPERATION ||--|| AUTHORIZATION : requests
    RECOVERY_MANIFEST ||--|| MANIFEST_AUTHORIZATION : requests
    RECOVERY_MANIFEST ||--|{ MANIFEST_BINDING : contains
    RECOVERY_OPERATION ||--o{ MANIFEST_BINDING : bound_by
    RECOVERY_OPERATION ||--|{ RECOVERY_ARTIFACT : protected_by
    RECOVERY_OPERATION ||--o{ RECEIPT : produces
    RECOVERY_MANIFEST ||--o{ RECEIPT : produces
    HOOK_EVENT }o--|| CONSEQUENCE_GRAPH : projects_into
    RECOVERY_OPERATION }o--|| CONSEQUENCE_GRAPH : projects_into
    RECOVERY_MANIFEST }o--|| CONSEQUENCE_GRAPH : projects_into

    RECOVERY_OPERATION {
        uuid id
        string kind
        string status
        string proof_digest
        string state_witness
        datetime expires_at
    }
    AUTHORIZATION {
        uuid operation_id
        string status
        string approval_digest
        string source
        uuid manifest_id
    }
    RECOVERY_MANIFEST {
        uuid id
        string status
        string binding_digest
        string proof_digest
        uuid_array outstanding_operation_ids
    }
    MANIFEST_BINDING {
        uuid operation_id
        string kind
        string proof_digest
        string state_witness
        string_array scope
    }
    MANIFEST_AUTHORIZATION {
        uuid manifest_id
        string status
        string approval_digest
    }
    RECOVERY_ARTIFACT {
        string local_path
        string digest
    }
    RECEIPT {
        string status
        datetime committed_at
        datetime recovered_at
    }
    HOOK_EVENT {
        string command_digest
        string event
        boolean blocked
    }
    CONSEQUENCE_GRAPH {
        int schema_version
        datetime generated_at
    }
```

Local authority state is stored with owner-only permissions and atomic file replacement:

```text
RECOVERY_AUTHORITY_DATA_DIR/
  operations.json
  manifests.json
  approvals/<operation-id>.json
  manifest-approvals/<manifest-id>.json
  artifacts/<operation-id>/...
  hook-events.jsonl
  consequence-graph.json
  authority-public.pem

RECOVERY_AUTHORITY_KEY_DIR/
  authority-private.pem
```

The private key directory is separate from the verifier data directory. In Linux sandbox mode, both authority directories remain outside the agent mount namespace.

## Adapter architecture

| Adapter | Recovery artifact | Drill | Live commit guard | Recovery guard |
| --- | --- | --- | --- | --- |
| `filesystem.delete` | Scoped file tree, modes, and symlink metadata | Restore into an isolated temporary root | Exact record witness still matches | Refuse to overwrite recreated paths |
| `sqlite.mutate` | Serialized database image | Execute exact SQL on an isolated database copy and run integrity checks | Database image and SQL digest match | Post-commit image unchanged |
| `git.reset-hard` | HEAD, symbolic ref, raw index, tracked and untracked worktree state | Reset and restore an isolated repository | Complete Git state witness matches | Post-reset Git witness unchanged |
| `postgres.schema-mutate` | Full logical database dump | Restore a temporary database and execute parsed schema-scoped SQL | Database witness, connection fingerprint, SQL digest, and runtime guardrails match | Full post-commit database witness unchanged |

Unsupported, mixed, indirect, or opaque effects remain block-only. The system does not substitute best-effort compensation for exact recovery.

## Source layout

```text
src/
  server.ts                    Official SDK MCP surface
  pre-tool-hook.ts             Codex hook entrypoint
  shell-policy.ts              Bash effect analysis
  powershell-policy.ts         PowerShell effect analysis
  filesystem.ts                Filesystem recovery adapter
  sqlite.ts                    SQLite recovery adapter
  git.ts                       Git recovery adapter
  postgres.ts                  PostgreSQL recovery adapter
  authorization.ts             Public-verifier authorization registry
  approval.ts                  Separate operation signing broker
  manifest.ts                  Manifest proof construction and conflict checks
  manifest-approval.ts         Aggregate terminal approval and child derivation
  manifest-coordinator.ts      Ordered commit and reverse recovery
  consequence-graph.ts         Derived graph and orientation vector
  authority-daemon.ts          Out-of-sandbox authority host
  sandbox.ts                   Linux bubblewrap runner

crates/
  recovery-core/               Read-only Rust ledger models
  recovery-tui/                Ratatui mission-control interface
```

## Failure semantics

1. A changed pre-state invalidates a proof before commit.
2. An expired capability cannot start a commit.
3. A thrown adapter call is followed by a ledger reread because a system such as PostgreSQL may commit and then report a post-state mismatch.
4. Manifest compensation traverses only recorded committed children and runs in reverse binding order.
5. Recovery never overwrites later live state to force completion.
6. Outstanding recovery work remains durable and resumable under `partially-recovered`.
7. The narrow interval between an adapter mutation and its ledger write remains a documented crash-consistency limitation requiring operator inspection.

For the complete security assumptions and residual risks, see [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md).
