# Recovery Authority

Recovery Authority is a Codex plugin that requires a demonstrated inverse capability and separate human approval before granting a destructive forward capability.

Instead of asking only whether an agent is allowed to run a command, it asks whether the exact affected state has already been restored successfully. The resulting proof, scope, expected post-state, human approval, and expiry are bound into a short-lived signed capability.

```text
agent intent -> effect interception -> recovery artifact -> isolated restore drill
             -> pending human approval -> signed capability -> guarded commit
             -> evidence receipt -> exact restore when requested
```

## Run the complete demo

With Bun, Docker, and the retained `postgres:17-alpine` image available:

```bash
bun run demo
```

The command launches a disposable PostgreSQL database, seeds `public` and `audit` schemas, proves recovery in an isolated drill database, pauses for a human proof confirmation, commits a deletion with a cross-schema cascade, restores both schemas, verifies their witnesses, and removes the container. It runs the bundled `dist/` artifacts and does not rebuild the plugin.

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

## Current boundary

After the user trusts the plugin hook, recognized destructive Bash and native patch calls are blocked before execution. Exact recovery is available for `filesystem.delete`, local `sqlite.mutate`, scoped `postgres.schema-mutate`, and `git.reset-hard`. Root overrides, sync deletion, container purge, remote-storage deletion, shell-launched agents, filesystem overwrites, other destructive Git commands, unsupported database mutations, infrastructure operations, and opaque scripts are block-only. Commands executed outside Codex or through an uninstrumented tool are not intercepted.

The human approval gate is a control boundary for coding agents using the trusted hook and MCP server. It is not an operating-system sandbox against arbitrary malicious code already running as the same user. Approval records and signing material are mode-restricted local files; production multi-user deployment should move signing into an OS keychain, hardware authenticator, or remote policy service.

On POSIX, runtime inspection resolves the account home from the process UID through the passwd/NSS identity interfaces rather than trusting `$HOME`. Filesystem preparation refuses any target containing that account root or the authority data directory. Run `recovery_inspect_runtime` before destructive work to surface root drift and deployment warnings.

SQLite recovery assumes no external process keeps writing through the restore window. State witnesses reject changes before commit and after commit, but this version does not provide a distributed database lock.

Git hard-reset recovery rejects submodules, linked worktrees, custom hooks/content filters, redirected worktrees, and in-progress merge, rebase, cherry-pick, or revert state. It restores developer-visible repository state; Git reflog entries created by reset and recovery remain as audit history.

PostgreSQL recovery accepts one parsed `DELETE`, `UPDATE`, `TRUNCATE`, `DROP TABLE`, `DROP SEQUENCE`, or `DROP INDEX` statement. Referenced relations must remain in the authorized schema. Function calls, nested queries, user or event triggers, and relevant logical publications are rejected because their effects can escape exact database recovery. The connection role needs permission to create and drop a temporary drill database. Logical dumps protect database contents and objects, not cluster roles, tablespaces, external service effects, or already-consumed replication events. Full-database witnesses reject concurrent changes before commit and before restore; they are optimistic guards, not distributed locks.

## Requirements

- macOS or Linux
- Bun 1.3+
- Rust 1.89+ for the optional TUI
- PostgreSQL `pg_dump` and `psql` compatible with the protected server when using the PostgreSQL adapter

## Setup

Install the repository as a local Codex marketplace and add the plugin:

```bash
codex plugin marketplace add .
codex plugin add recovery-authority@recovery-authority
```

Start a new Codex session, open `/hooks`, and trust the bundled Recovery Authority hook. Codex deliberately skips untrusted plugin hooks.

When a prepare tool succeeds, show the returned `approvalCommand` to the user. The user runs it in a separate terminal and types the displayed 12-character proof prefix. The agent then calls `recovery_get_authorization` and can commit only with the returned approved capability.

The bundled `dist/server.js` lets Codex launch the MCP server without rebuilding it. To rebuild from source or develop locally:

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
RECOVERY_POSTGRES_INTEGRATION=1 bun test tests/postgres.integration.test.ts
bun run demo
bun run test:hook
bun run test:mcp
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

Apache-2.0
