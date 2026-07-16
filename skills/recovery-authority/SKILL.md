---
name: recovery-authority
description: Use when a requested coding task may delete or destructively replace local, Git, database, or infrastructure state and must be checked by Recovery Authority before execution.
---

# Recovery Authority

Route destructive filesystem deletes and local SQLite mutations through the Recovery Authority MCP tools.

The bundled `PreToolUse` hook independently blocks recognized destructive Bash commands. Do not retry a denied command through `sudo`, `env`, `sh -c`, command substitution, a script wrapper, or another execution tool.

## Required workflow

1. Identify the smallest affected scope and effect kind.
2. For filesystem deletion, call `recovery_prepare_filesystem_delete` with workspace-relative paths.
3. For local SQLite mutation, call `recovery_prepare_sqlite_mutation` with the database path and exact SQL.
4. Report the operation ID, affected scope, proof digest, expiry, and restore-drill result.
5. Commit only through the corresponding recovery commit tool while the capability remains fresh.
6. Call `recovery_get_operation` when status is uncertain and the corresponding restore tool when the effect must be reversed.
7. For Git, remote databases, infrastructure, overwrite, mixed-effect, or opaque-script findings, stop and explain that one exact recovery adapter does not cover the operation.

## Boundaries

- Only `filesystem.delete` and local `sqlite.mutate` currently have exact recovery adapters. Other categories are block-only.
- Hook protection applies only after the user reviews and trusts the plugin hook in `/hooks`.
- Never widen the workspace root or target scope to make an operation pass.
- A recovery artifact is insufficient without a successful restore drill and matching state witness.
- A stale capability or changed state requires a new preparation step.
- Compensation is not exact recovery. Describe that distinction when an adapter cannot restore exact state.
