# Recovery Authority

Recovery Authority is a Codex plugin that requires a demonstrated inverse capability before granting a destructive forward capability.

The filesystem adapter protects scoped deletes:

1. Snapshot only the requested files or directories.
2. Restore the artifact into an isolated temporary root.
3. Compare a deterministic state witness.
4. Issue an Ed25519-signed, short-lived capability.
5. Recheck the live state before deletion.
6. Restore and verify the original state on request.

The SQLite adapter serializes the connection-visible database image, runs the exact destructive SQL against an isolated copy, verifies `PRAGMA integrity_check`, and binds both the SQL digest and database witness into the capability.

The Git adapter snapshots `HEAD`, its symbolic ref, the raw index, tracked modifications, and untracked worktree state. It drills `git reset --hard` and restoration in an isolated repository before authorizing the live reset.

The plugin also bundles a syntax-aware Codex `PreToolUse` hook. It parses Bash commands into an AST and blocks recognized destructive effects before execution, including nested commands and common wrappers.

## Current boundary

After the user trusts the plugin hook, recognized destructive Bash calls are blocked before execution. Exact recovery is currently available for `filesystem.delete`, local `sqlite.mutate`, and `git.reset-hard`; filesystem overwrites, other destructive Git commands, remote databases, infrastructure operations, and opaque scripts are block-only. Commands executed outside Codex or through an uninstrumented tool are not intercepted.

SQLite recovery assumes no external process keeps writing through the restore window. State witnesses reject changes before commit and after commit, but this version does not provide a distributed database lock.

Git hard-reset recovery rejects submodules, linked worktrees, custom hooks/content filters, redirected worktrees, and in-progress merge, rebase, cherry-pick, or revert state. It restores developer-visible repository state; Git reflog entries created by reset and recovery remain as audit history.

## Requirements

- macOS or Linux
- Bun 1.3+
- Rust 1.89+ for the optional TUI

## Setup

Install the repository as a local Codex marketplace and add the plugin:

```bash
codex plugin marketplace add .
codex plugin add recovery-authority@recovery-authority
```

Start a new Codex session, open `/hooks`, and trust the bundled Recovery Authority hook. Codex deliberately skips untrusted plugin hooks.

The bundled `dist/server.js` lets Codex launch the MCP server without rebuilding it. To rebuild from source or develop locally:

```bash
bun install
bun run build
cargo build --release -p recovery-authority
```

The repository root is the Codex plugin. Its manifest is `.codex-plugin/plugin.json`, and `.mcp.json` launches the bundled stdio MCP server.

## Development

```bash
bun test
bun run test:mcp
bun run check
bun run build
cargo test --workspace
```

Run the local TUI against a plugin data directory:

```bash
cargo run -p recovery-authority -- tui --data-dir .recovery-authority
```

Navigate with left/right or `1`-`5`. The views show mission status, intercepted effects, recovery operations, adapter coverage, and proof receipts.

## MCP tools

- `recovery_prepare_filesystem_delete`
- `recovery_commit_filesystem_delete`
- `recovery_restore_filesystem_delete`
- `recovery_prepare_git_reset_hard`
- `recovery_commit_git_reset_hard`
- `recovery_restore_git_reset_hard`
- `recovery_prepare_sqlite_mutation`
- `recovery_commit_sqlite_mutation`
- `recovery_restore_sqlite_mutation`
- `recovery_get_operation`

## Shell policy

The hook currently detects destructive filesystem commands, destructive Git operations, destructive SQL passed to common database clients, Terraform/Kubernetes/cloud deletion commands, and opaque shell-script execution. Denial receipts store a SHA-256 command digest and structured findings rather than the raw command.

## OpenAI Build Week

The project is being built with Codex during the official submission period. Codex is both the development collaborator and the first agent integration. GPT-5.6 will be used to propose effect scopes and human-readable invariants; deterministic recovery code remains the authorization authority.

## License

Apache-2.0
