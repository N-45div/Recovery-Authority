# Architecture

Recovery Authority separates model execution, recovery execution, and human signing into different authority domains.

```text
host
├── terminal approver
│   └── reads proof + loads private key + signs one expiring operation
├── authority daemon
│   ├── owns ledger and recovery artifacts
│   ├── launches public-key-only MCP workers
│   └── listens on a mode-0600 Unix socket
└── bubblewrap sandbox
    ├── coding harness
    ├── native subagents and hidden descendants
    ├── writable selected workspace
    ├── disposable writable CODEX_HOME
    ├── read-only host filesystem
    ├── masked authority data and signing directories
    ├── stdio MCP proxy -> mounted Unix socket
    └── sanitized hook receipts -> audit socket
```

## Authority domains

| Process | Can edit workspace | Can edit recovery state | Can load private key | Can execute typed recovery commit |
| --- | --- | --- | --- | --- |
| Agent or descendant | Yes | No | No | Only through MCP with an approved capability |
| MCP worker | Through exact adapters, limited to the selected workspace | Yes | No | Yes, after public verification and live re-witnessing |
| Terminal approver | No model-controlled path | Approval record only | Yes | No |

## Capability flow

1. A prepare tool scopes one destructive effect and captures its pre-state witness.
2. The authority daemon creates an artifact and restores it in an isolated drill.
3. The daemon records a pending authorization but returns no capability.
4. The human runs the displayed command outside the agent sandbox and confirms the proof prefix.
5. The approval process signs the operation ID, kind, proof digest, state witness, statement digest, and expiry.
6. The MCP worker verifies the signature using only the public key, re-witnesses live state, and executes the exact prepared effect.
7. The ledger records commit and recovery evidence.

The MCP socket does not add a second authorization protocol. It transports the existing MCP contract across the mount boundary, keeping the model-facing plugin portable while moving durable authority out of the model process. The separate audit socket accepts bounded JSON receipts without raw command text; those receipts are useful telemetry but are not trusted as cryptographic actor identity.
