# Recovery Authority

Recovery Authority is a Codex plugin that requires a demonstrated inverse capability before granting a destructive forward capability.

The first working adapter protects scoped filesystem deletes:

1. Snapshot only the requested files or directories.
2. Restore the artifact into an isolated temporary root.
3. Compare a deterministic state witness.
4. Issue an Ed25519-signed, short-lived capability.
5. Recheck the live state before deletion.
6. Restore and verify the original state on request.

## Current boundary

Only operations executed through the Recovery Authority MCP tools are protected. The plugin does not claim to intercept arbitrary shell commands, Git operations, database mutations, or external API calls yet.

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
cargo run -p recovery-authority -- tui --operations .recovery-authority/operations.json
```

## MCP tools

- `recovery_prepare_filesystem_delete`
- `recovery_commit_filesystem_delete`
- `recovery_restore_filesystem_delete`
- `recovery_get_operation`

## OpenAI Build Week

The project is being built with Codex during the official submission period. Codex is both the development collaborator and the first agent integration. GPT-5.6 will be used to propose effect scopes and human-readable invariants; deterministic recovery code remains the authorization authority.

## License

Apache-2.0
