# Recovery Authority

**Recovery-backed authorization for coding agents.**

Recovery Authority is an open-source Codex plugin and agent runtime that refuses to grant destructive authority until the exact affected state has been restored successfully in an isolated drill. A separate human approval then releases one short-lived capability bound to that proof, scope, expected result, and expiry.

> The product contract is simple: no destructive authority without demonstrated recovery.

## The problem

Coding agents now run long tasks, delegate work, modify databases, and execute cleanup commands while developers are focused elsewhere. Existing controls leave four practical gaps:

1. **Approval asks about intent, not recoverability.** A developer sees a command but cannot know whether its complete blast radius can be reversed.
2. **Full-access mistakes cross boundaries quickly.** A bad path, mutable `$HOME`, cascade, volume purge, or hidden child process can turn one cleanup step into permanent loss.
3. **Backups are promises until restored.** A stale, incomplete, or inaccessible backup does not prove that the exact operation is recoverable now.
4. **Subagents multiply execution paths.** Native subagents, scripts, interpreters, and package hooks can perform the same destructive effect through different commands.

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

```text
agent + descendants (read-only host, writable repo)
        | typed MCP over a mounted Unix socket
        v
authority daemon (outside sandbox, public-key verification only)
        | prepare -> recovery artifact -> isolated restore drill
        | pending approval <- separate human terminal + private signing key
        v
proof-bound capability -> guarded commit -> receipt -> exact restore
```

The model-facing MCP bundle contains verification code but no signing implementation. The private Ed25519 key is loaded only by the separate terminal approval path. The Linux runner keeps the authority daemon, ledger, artifacts, and signing directory outside the agent's mount namespace.

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

The plugin also bundles a syntax-aware Codex `PreToolUse` hook. It parses Bash commands into an AST and blocks recognized destructive effects before execution, including nested commands and common wrappers. Prepare tools return a pending authorization and an exact separate-terminal approval command, not a capability. The coding-agent hook blocks attempts to invoke that approval command itself.

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

Inside the sandbox, `scripts/start-mcp.sh` becomes a stdio-to-Unix-socket proxy. Only the host authority daemon and terminal approver can write authority state; model-controlled processes cannot mount it. A second narrow socket relays sanitized hook receipts so the TUI keeps parent and subagent history without exposing the ledger. The MCP bundle contains only public verification code; the private Ed25519 key and issuer implementation live in the separate terminal approval path. Existing installations migrate a legacy private key out of the data directory without changing its public identity.

## Current coverage

After the user trusts the plugin hook, recognized destructive Bash and native patch calls are blocked before execution. Exact recovery is available for `filesystem.delete`, local `sqlite.mutate`, scoped `postgres.schema-mutate`, and `git.reset-hard`. Root overrides, sync deletion, container purge, remote-storage deletion, shell-launched agents, filesystem overwrites, other destructive Git commands, unsupported database mutations, infrastructure operations, and opaque scripts are block-only. Commands executed outside Codex or through an uninstrumented tool are not intercepted.

Without `bun run sandbox`, the hook and approval gate remain a harness-level control and cannot mediate arbitrary same-user binaries. In the recommended Linux mode, the operating-system boundary protects host files and authority state even when full-access mode is selected inside the nested harness. The writable repository is intentionally still editable; recognized destructive repository effects are governed by the hook and proof-bound MCP commit tools.

On POSIX, runtime inspection resolves the account home from the process UID through the passwd/NSS identity interfaces rather than trusting `$HOME`. Filesystem preparation refuses any target containing that account root or the authority data directory. Run `recovery_inspect_runtime` before destructive work to surface root drift and deployment warnings.

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

| Platform | Plugin, hook, and MCP | Enforceable agent sandbox | Notes |
| --- | --- | --- | --- |
| Linux | Supported | Supported with `bubblewrap` and user namespaces | Fully exercised by the integration suite |
| macOS | Supported | Not yet available | Harness-level hook and approval boundary only |
| Windows | Not currently supported | Not available | Bash launch and identity paths require a native backend |

Additional requirements:

- Bun 1.3+
- Rust 1.89+ for the optional TUI
- PostgreSQL `pg_dump` and `psql` compatible with the protected server when using the PostgreSQL adapter
- Docker only for the self-contained PostgreSQL demo and integration test

## Installation

The committed `dist/` artifacts let judges install and run the plugin without rebuilding. From the repository root:

```bash
codex plugin marketplace add .
codex plugin add recovery-authority@recovery-authority
```

Start a new Codex session, open `/hooks`, and trust the bundled Recovery Authority hook. Codex deliberately skips untrusted plugin hooks.

For the enforceable Linux mode, launch that session through `bun run sandbox` as shown above. The command can wrap another harness by replacing `codex`; use `--stage-codex-home` when Codex is launched indirectly through a shell script.

When a prepare tool succeeds, show the returned `approvalCommand` to the user. The user runs it in a separate terminal and types the displayed 12-character proof prefix. The agent then calls `recovery_get_authorization` and can commit only with the returned approved capability.

To rebuild from source or develop locally:

```bash
bun install
bun run build
cargo build --release -p recovery-authority
```

The PostgreSQL adapter defaults to `pg_dump` and `psql` on `PATH`. Override them for a managed installation or container wrapper with `RECOVERY_AUTHORITY_PG_DUMP` and `RECOVERY_AUTHORITY_PSQL`. `RECOVERY_AUTHORITY_MAX_DUMP_BYTES` defaults to 512 MiB, and `RECOVERY_AUTHORITY_POSTGRES_TIMEOUT_MS` defaults to 120 seconds.

The repository root is the Codex plugin. Its manifest is `.codex-plugin/plugin.json`, and `.mcp.json` launches the bundled stdio MCP server.

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
bun run build
cargo test --workspace
```

Run the local TUI against a plugin data directory:

```bash
cargo run -p recovery-authority -- tui --data-dir .recovery-authority
```

Navigate with left/right or `1`-`6`. The views show mission status, intercepted effects, recovery operations, delegated agents, adapter coverage, and proof receipts.

## MCP tools

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

## Shell policy

The hook detects direct and interpreter-mediated filesystem deletion, patch-file deletion, mutable identity-root overrides, destructive Git operations, rsync/rclone deletion, container and volume purge, destructive SQL and framework resets, approval-command execution, shell-launched agents, Terraform/Kubernetes/cloud deletion, and opaque shell scripts. Denial receipts store a SHA-256 command digest and structured findings rather than the raw command. The regression corpus preserves source URLs and expected categories without executing any destructive fixture.

## OpenAI Build Week

This project was built with Codex during the official submission period. Codex was used to research the agent-safety problem, challenge the initial CLI-only design, implement the Bun MCP server and Rust TUI, build the Bash AST hook, design the proof-bound capability contracts, write the PostgreSQL adapter, run destructive recovery drills, diagnose container-readiness failures, package the plugin, and execute the test matrix.

The human made the key product decisions: recovery must be demonstrated rather than promised; agents must consume the same MCP and skill contract; PostgreSQL cascades require a full-database artifact; approval must occur outside the coding-agent session; and unsupported effects must remain blocked rather than receive a fake safety guarantee. The submission's Codex `/feedback` session ID and dated commit history provide the authoritative GPT-5.6/Codex build trace.

## License

[Apache License 2.0](LICENSE). The source may be used, modified, and distributed, including commercially, subject to the license terms. The `private` field in `package.json` only prevents accidental npm publication; it does not make the repository or license private.
