# Recovery Authority

**Recovery-backed authorization for coding agents.**

Recovery Authority is an open-source Codex plugin and agent runtime that refuses to grant destructive authority until the exact affected state has been restored successfully in an isolated drill. A separate human approval then releases one short-lived capability bound to that proof, scope, expected result, and expiry. Independent effects can be bound into one reviewed Recovery Manifest with ordered commit and reverse recovery.

> The product contract is simple: no destructive authority without demonstrated recovery.

## The problem

Coding agents now run long tasks, delegate work, modify databases, and execute cleanup commands while developers are focused elsewhere. Existing controls leave four practical gaps:

1. **Approval asks about intent, not recoverability.** A developer sees a command but cannot know whether its complete blast radius can be reversed.
2. **Full-access mistakes cross boundaries quickly.** A bad path, mutable `$HOME`, cascade, volume purge, or hidden child process can turn one cleanup step into permanent loss.
3. **Backups are promises until restored.** A stale, incomplete, or inaccessible backup does not prove that the exact operation is recoverable now.
4. **Subagents multiply execution paths.** Native subagents, scripts, interpreters, and package hooks can perform the same destructive effect through different commands.
5. **Multi-effect tasks turn approval into choreography.** Separate proofs and prompts do not explain commit order, partial failure, compensation order, or what remains unrecovered.

This affects developers using autonomous coding agents, platform teams enabling agent workflows, and security teams responsible for developer machines, source repositories, and development databases.

## What changes

Recovery Authority governs the **effect**, not the model's explanation or one command spelling:

| Existing control | What it does well | Remaining gap | Recovery Authority |
| --- | --- | --- | --- |
| Sandbox | Contains host access | The selected workspace is still writable | Requires proof and approval for recognized destructive workspace effects |
| Approval prompt | Keeps a human in the loop | Humans must predict reversibility from intent | Shows an already-tested recovery proof before approval |
| Backup | Preserves a previous copy | Restore may be stale, incomplete, or untested | Restores the exact artifact in isolation before authority exists |
| Command denylist | Blocks known syntax | Wrappers, interpreters, and subagents change syntax | Parses effects and applies actor-independent enforcement |
| Audit log | Explains what happened | Evidence arrives after damage | Produces proof and authorization receipts before commit |

The immediate value is safer long-horizon autonomy with less blind approval: developers can delegate more work, while teams retain a concrete artifact, proof digest, human decision, state witness, and recovery path.

## How it works

See [ARCHITECTURE.md](ARCHITECTURE.md) for the complete trust-boundary, protocol, Recovery Manifest, consequence-graph, and durable-state diagrams.

```text
agent + descendants
        | Codex hook + typed MCP over stdio
        | Linux: Unix socket to authority outside bubblewrap
        | Windows: PowerShell hook + named-pipe-ready IPC
        v
portable recovery control plane (public-key verification only)
        | prepare -> recovery artifact -> isolated restore drill
        | pending approval <- separate human terminal + private signing key
        v
proof-bound capability -> guarded commit -> receipt -> exact restore
                         \-> manifest saga -> reverse recovery
```

The model-facing MCP bundle contains verification code but no signing implementation. The private Ed25519 key is loaded only by the separate terminal approval path. The Linux runner keeps the authority daemon, ledger, artifacts, and signing directory outside the agent's mount namespace.

## Living consequence graph

Recovery Authority gives the agent a bounded, machine-readable view of consequences without trusting the model to authorize itself. `recovery_orient` parses a proposed command, joins it to current proof, approval, operation, resource, session, and subagent nodes, and returns:

- a readiness vector for blast radius, recovery coverage, authority, dependency closure, uncertainty, and proof freshness;
- the minimum safe cut: the missing adapter, proof, approval, or manifest edge that prevents execution;
- a small graph neighborhood rather than the complete ledger or raw transcript.

```text
session -> agent -> proposed effect -> affected resource
                              |              |
                              v              v
                         authorization   recovery proof
                              |              |
                              +-----> exact commit -> receipt
```

The graph is derived evidence, not an authority source. It never contains a capability token, never turns a raw destructive command into an approved command, and never interprets a missing dependency edge as proof that no dependency exists. Proof and approval readiness are reported only when orientation includes the exact operation ID; category similarity cannot transfer authority between operations. Goals and commands are returned and persisted as SHA-256 digests rather than raw text. Only an exact adapter, successful restore drill, separate human approval, signed capability, and live state re-witness can authorize a commit.

The lifecycle hook refreshes this model at session start, before and after compaction, during native subagent lifecycle changes, at permission escalation, and after supported tool calls. Context compaction therefore discards chat tokens without discarding authority state.

## Recovery Manifests

A Recovery Manifest is the multi-effect authority primitive. The agent first prepares two or more exact child operations, then binds their immutable proof digests, state witnesses, statement digests, scopes, and commit order into one aggregate proof. The child scopes must be independent: overlapping filesystem paths and operations against the same PostgreSQL database are rejected.

The user reviews one terminal prompt showing every ordered effect and types the aggregate proof prefix once. The private approval broker signs the manifest and derives a separate exact capability for each child. The MCP worker still has only the public verifier.

```text
child proofs -> aggregate manifest proof -> one human approval
     |                                         |
     +-> commit A -> commit B -> commit C ------+
             failure at C -> recover B -> recover A
```

This is an evidence-backed saga, not a distributed transaction. A failure causes every child recorded as committed to be recovered in reverse order. If a live-state guard prevents recovery, the manifest becomes `partially-recovered` and lists the exact outstanding operation IDs. An interrupted `committing` manifest can be sent through `recovery_restore_manifest` to abort recorded commits. Recovery Authority never reports cross-system atomicity.

## Five-minute judge path

This path uses bundled `dist/` artifacts, creates its own sample data, and does not rebuild the project. Requirements are Bun 1.3+ and Docker; Docker can pull `postgres:17-alpine` on first use.

```bash
bun run demo
```

The demo:

1. Launches a disposable PostgreSQL database and seeds `public` and `audit` schemas.
2. Creates a full-database recovery artifact and restores it into an isolated drill database.
3. Executes the exact deletion in the drill and records the expected post-state witness.
4. Pauses for a separate human proof-prefix confirmation.
5. Commits a deletion whose foreign-key cascade crosses schemas.
6. Restores both schemas, verifies their original witnesses, and removes the container.

Expected final line:

```text
Demo complete: proof, human approval, exact commit, and verified recovery.
```

For a code-only check without Docker:

```bash
bun run test:mcp
bun run test:hook
bun run test:bundle
```

`bun run test:mcp` includes a complete two-effect manifest flow: child proofs, aggregate terminal approval, ordered commit, and reverse restore.

## Recovery adapters

The filesystem adapter protects scoped deletes:

1. Snapshot only the requested files or directories.
2. Restore the artifact into an isolated temporary root.
3. Compare a deterministic state witness.
4. Issue an Ed25519-signed, short-lived capability.
5. Recheck the live state before deletion.
6. Restore and verify the original state on request.

The SQLite adapter serializes the connection-visible database image, runs the exact destructive SQL against an isolated copy, verifies `PRAGMA integrity_check`, and binds both the SQL digest and database witness into the capability.

The Git adapter snapshots `HEAD`, its symbolic ref, the raw index, tracked modifications, and untracked worktree state. It drills `git reset --hard` and restoration in an isolated repository before authorizing the live reset.

The PostgreSQL adapter parses one destructive statement into an AST, limits direct and referenced relations to an authorized schema, and takes a full logical database dump so database-local cascades are recoverable. It restores the dump into a temporary database, reproduces the original witness, executes the exact SQL there, and binds the expected post-mutation witness before issuing a capability. Live commit must produce the same witness. Connection credentials are supplied per call and are never written to the operation ledger.

The plugin also bundles syntax-aware Codex lifecycle hooks. `PreToolUse` and `PermissionRequest` parse Bash with `bash-parser` and Windows commands with PowerShell's native AST parser, then block recognized destructive effects before execution or elevation, including nested commands and common wrappers. `SessionStart`, `PreCompact`, `PostCompact`, `PostToolUse`, `SubagentStart`, and `SubagentStop` maintain local consequence receipts and compact posture context. Prepare tools return a pending authorization and an OS-native separate-terminal approval command, not a capability. The coding-agent hook blocks attempts to invoke that approval command itself.

The same plugin registers native subagent lifecycle hooks. Each delegated executor is logged with the parent session, agent ID, type, permission mode, model, turn, and lifecycle state, then surfaced in the TUI. Enforcement remains actor-independent because Codex does not include `agent_id` in every turn-scoped tool hook. See the [threat model](docs/THREAT_MODEL.md) for the exact trust boundaries and evidence corpus.

## Users and adoption

The current release is a local-first, Apache-2.0 developer tool:

| User | Pain addressed | Product surface |
| --- | --- | --- |
| Individual developer | An autonomous session can destroy uncommitted work or local data | Codex plugin, proof approval, exact recovery, optional TUI |
| Platform or security team | Full-access agents lack a consistent destructive-action policy | Shared MCP/skill contract, fail-closed adapters, evidence ledger |
| Agent harness builder | Every agent reinvents command checks and approval UX | Portable typed authority boundary and verifier-only MCP worker |

The open-source runtime is the adoption wedge. A production team offering can build on the same protocol with centralized policy, remote or hardware-backed signing, managed artifact retention, organization-wide receipts, and SIEM/compliance exports. Those hosted controls are a product direction, not claims about this local release.

## Enforceable Linux boundary

The recommended mode launches the coding harness inside `bubblewrap` and keeps the typed MCP authority server outside that mount namespace:

```bash
mkdir -p "$HOME/.local/share/recovery-authority/project-data"
mkdir -p "$HOME/.local/share/recovery-authority/project-keys"

bun run sandbox \
  --workspace "$PWD" \
  --data-dir "$HOME/.local/share/recovery-authority/project-data" \
  --key-dir "$HOME/.local/share/recovery-authority/project-keys" \
  -- codex
```

The two authority directories must be outside and disjoint from the workspace. The runner makes the host root read-only, binds only the selected workspace writable, masks both authority directories, drops capabilities, disables nested user namespaces, and creates PID, IPC, UTS, cgroup, and user namespaces where supported. Parent agents, native subagents, shell-launched agents, scripts, and package hooks inherit the same boundary. Filesystem, SQLite, and Git recovery tools are cryptographically hosted outside the sandbox but refuse any root other than the canonical selected workspace. Network access remains available for model APIs; add `--isolate-network` for offline work.

For direct `codex` launches, the runner automatically stages a disposable writable `CODEX_HOME`. Authentication and configuration files are copied into that temporary root; large packages, plugins, skills, rules, memories, and cache trees are read-only references. The temporary state is removed when the session exits, while the real home remains read-only.

Inside the sandbox, `dist/cli.js mcp` becomes a stdio-to-Unix-socket proxy. Only the host authority daemon and terminal approver can write authority state; model-controlled processes cannot mount it. A second narrow socket relays sanitized hook receipts so the TUI keeps parent and subagent history without exposing the ledger. The MCP bundle contains only public verification code; the private Ed25519 key and issuer implementation live in the separate terminal approval path. Existing installations migrate a legacy private key out of the data directory without changing its public identity.

## Current coverage

After the user trusts the plugin hook, recognized destructive Bash, PowerShell, and native patch calls are blocked before execution. Exact recovery is available for `filesystem.delete` on POSIX, plus local `sqlite.mutate`, scoped `postgres.schema-mutate`, and `git.reset-hard` on supported hosts. Recovery Manifests compose independent exact operations into one approval and a compensated saga. Windows filesystem deletion remains block-only until ACL, alternate-stream, and reparse-point metadata can be restore-tested. Root overrides, sync deletion, container purge, remote-storage deletion, shell-launched agents, filesystem overwrites, other destructive Git commands, unsupported database mutations, infrastructure operations, and opaque scripts are block-only. Commands executed outside Codex or through an uninstrumented tool are not intercepted.

Without `bun run sandbox`, the hook and approval gate remain a harness-level control and cannot mediate arbitrary same-user binaries. In the recommended Linux mode, the operating-system boundary protects host files and authority state even when full-access mode is selected inside the nested harness. The writable repository is intentionally still editable; recognized destructive repository effects are governed by the hook and proof-bound MCP commit tools.

On POSIX, runtime inspection resolves the account home from the process UID through passwd/NSS identity interfaces rather than trusting `$HOME`. On Windows it asks the OS known-folder API through a non-profile PowerShell process rather than trusting `$env:USERPROFILE`. Filesystem preparation refuses any target containing the resolved account root or authority data directory. Run `recovery_inspect_runtime` or `bun dist/cli.js doctor` to surface deployment boundaries.

SQLite recovery assumes no external process keeps writing through the restore window. State witnesses reject changes before commit and after commit, but this version does not provide a distributed database lock.

Git hard-reset recovery rejects submodules, linked worktrees, custom hooks/content filters, redirected worktrees, and in-progress merge, rebase, cherry-pick, or revert state. It restores developer-visible repository state; Git reflog entries created by reset and recovery remain as audit history.

PostgreSQL recovery accepts one parsed `DELETE`, `UPDATE`, `TRUNCATE`, `DROP TABLE`, `DROP SEQUENCE`, or `DROP INDEX` statement. Referenced relations must remain in the authorized schema. Function calls, nested queries, user or event triggers, and relevant logical publications are rejected because their effects can escape exact database recovery. The connection role needs permission to create and drop a temporary drill database. Logical dumps protect database contents and objects, not cluster roles, tablespaces, external service effects, or already-consumed replication events. Full-database witnesses reject concurrent changes before commit and before restore; they are optimistic guards, not distributed locks.

## Security and data handling

- Recovery artifacts, ledgers, public keys, and signing keys remain local by default.
- PostgreSQL credentials are supplied per call and are not written to operation records.
- Hook receipts store command digests and structured findings rather than raw command text.
- The sandbox masks authority state from agents and descendants; only typed MCP operations cross the boundary.
- Unsupported effects fail closed instead of receiving a broad or misleading safety approval.
- Exact guarantees and residual risks are documented in [Threat model](docs/THREAT_MODEL.md).

## Supported platforms

| Platform | Plugin, hook, and MCP | Enforcement backend | Status |
| --- | --- | --- | --- |
| Linux | Bun CLI, Bash AST, Unix sockets | Recovery Authority `bubblewrap` runner; Codex host sandbox also compatible | Supported; fully exercised locally |
| macOS | Bun CLI, Bash AST, Unix sockets | Codex Seatbelt host sandbox | Preview; no independent Recovery Authority sandbox backend |
| Windows 11 | Bun CLI, `commandWindows`, native PowerShell AST, named-pipe-ready IPC | Codex native Windows sandbox | Preview; PowerShell parser exercised through Windows PowerShell, clean-host end-to-end smoke still required |

Platform-agnostic means one proof, approval, capability, ledger, MCP, and TUI protocol with OS-native command parsing, identity, path, IPC, and containment adapters. It does not mean emulating Linux security primitives on every host.

Additional requirements:

- Bun 1.3+
- Windows PowerShell 5.1+ on Windows
- Rust 1.89+ for the optional TUI
- PostgreSQL `pg_dump` and `psql` compatible with the protected server when using the PostgreSQL adapter
- Docker only for the self-contained PostgreSQL demo and integration test

## Installation

The committed `dist/` artifacts let judges install and run the plugin without rebuilding or cloning the repository manually:

```bash
codex plugin marketplace add N-45div/Recovery-Authority --ref main
codex plugin add recovery-authority@recovery-authority
```

Start a new Codex session after installation. To refresh an existing installation after a release:

```bash
codex plugin marketplace upgrade recovery-authority
codex plugin remove recovery-authority@recovery-authority
codex plugin add recovery-authority@recovery-authority
```

Open `/hooks` and trust the bundled Recovery Authority hook. Codex deliberately skips untrusted plugin hooks.

For the enforceable Linux mode, launch that session through `bun run sandbox` as shown above. The command can wrap another harness by replacing `codex`; use `--stage-codex-home` when Codex is launched indirectly through a shell script.

When one prepare tool succeeds, show the returned `approvalCommand` to the user. The user runs it in a separate terminal and types the displayed 12-character proof prefix. The agent then calls `recovery_get_authorization` and can commit only with the returned approved capability.

For an independent multi-effect task, prepare every child without approving them individually, call `recovery_prepare_manifest` with the exact operation order, and show its aggregate `approvalCommand`. After separate terminal approval, call `recovery_get_manifest_authorization`, then `recovery_commit_manifest` with execution parameters in the same order. Read `status`, `failure`, and `outstandingOperationIds`; `compensated` and `partially-recovered` are not successful commits.

To rebuild from source or develop locally:

```bash
bun install
bun run build
cargo build --release -p recovery-authority
```

The PostgreSQL adapter defaults to `pg_dump` and `psql` on `PATH`. Override them with `RECOVERY_AUTHORITY_PG_DUMP` and `RECOVERY_AUTHORITY_PSQL`. Structured wrapper arguments can be supplied without shell parsing through `RECOVERY_AUTHORITY_PG_DUMP_ARGS_JSON` and `RECOVERY_AUTHORITY_PSQL_ARGS_JSON`. `RECOVERY_AUTHORITY_MAX_DUMP_BYTES` defaults to 512 MiB, and `RECOVERY_AUTHORITY_POSTGRES_TIMEOUT_MS` defaults to 120 seconds.

For local development, replace the GitHub marketplace source with `codex plugin marketplace add .` from the repository root. The repository root is the Codex plugin, its manifest is `.codex-plugin/plugin.json`, and `.mcp.json` launches the bundled stdio MCP server.

## Development

```bash
bun test
RECOVERY_SANDBOX_INTEGRATION=1 bun test tests/sandbox.integration.test.ts
RECOVERY_POSTGRES_INTEGRATION=1 bun test tests/postgres.integration.test.ts
bun run demo
bun run test:hook
bun run test:mcp
bun run test:bundle
bun run check
bun run evaluate
bun run build
cargo test --workspace
```

Run the local TUI against a plugin data directory:

```bash
cargo run -p recovery-authority -- tui --data-dir .recovery-authority
```

Navigate with left/right or `1`-`8`. The views show mission status, intercepted effects, recovery operations, manifests, delegated agents, the living consequence graph, adapter coverage, and proof receipts.

## MCP tools

- `recovery_orient`
- `recovery_get_consequence_graph`
- `recovery_inspect_runtime`
- `recovery_prepare_filesystem_delete`
- `recovery_commit_filesystem_delete`
- `recovery_restore_filesystem_delete`
- `recovery_prepare_git_reset_hard`
- `recovery_commit_git_reset_hard`
- `recovery_restore_git_reset_hard`
- `recovery_prepare_sqlite_mutation`
- `recovery_commit_sqlite_mutation`
- `recovery_restore_sqlite_mutation`
- `recovery_prepare_postgres_mutation`
- `recovery_commit_postgres_mutation`
- `recovery_restore_postgres_mutation`
- `recovery_get_authorization`
- `recovery_get_operation`
- `recovery_prepare_manifest`
- `recovery_commit_manifest`
- `recovery_restore_manifest`
- `recovery_get_manifest_authorization`
- `recovery_get_manifest`

## Shell policy

The hook detects direct and interpreter-mediated filesystem deletion, patch-file deletion, mutable identity-root overrides, destructive Git operations, rsync/rclone deletion, container and volume purge, destructive SQL and framework resets, approval-command execution, shell-launched agents, Terraform/Kubernetes/cloud deletion, PowerShell dynamic invocation, Windows disk/volume commands, and opaque scripts. Denial receipts store a SHA-256 command digest and structured findings rather than the raw command. The regression corpus preserves source URLs and expected categories without executing destructive fixtures.

`bun run evaluate` replays that corpus through the consequence engine and reports category recall, fail-closed rate, adapter coverage, and safe-cut requirements. It never executes or prints the destructive fixture commands.

## OpenAI Build Week

This project was built with Codex during the official submission period. Codex was used to research the agent-safety problem, challenge the initial CLI-only design, implement the Bun MCP server and Rust TUI, build Bash and PowerShell AST hooks, design the proof-bound capability contracts, create platform adapters, write the PostgreSQL adapter, run destructive recovery drills, diagnose runtime failures, package the plugin, and execute the test matrix.

The human made the key product decisions: recovery must be demonstrated rather than promised; agents must consume the same MCP and skill contract; PostgreSQL cascades require a full-database artifact; multi-effect work needs an aggregate proof and compensated saga rather than repeated blind approvals; approval must occur outside the coding-agent session; and unsupported effects must remain blocked rather than receive a fake safety guarantee. The submission's Codex `/feedback` session ID and dated commit history provide the authoritative GPT-5.6/Codex build trace.

## License

[Apache License 2.0](LICENSE). The source may be used, modified, and distributed, including commercially, subject to the license terms. The `private` field in `package.json` only prevents accidental npm publication; it does not make the repository or license private.
