---
name: recovery-authority
description: Use when a requested coding task may delete or destructively replace local, Git, database, or infrastructure state and must be checked by Recovery Authority before execution.
---

# Recovery Authority

Route destructive filesystem deletes through the Recovery Authority MCP tools.

The bundled `PreToolUse` hook independently blocks recognized destructive Bash commands. Do not retry a denied command through `sudo`, `env`, `sh -c`, command substitution, a script wrapper, or another execution tool.

## Required workflow

1. Identify the smallest workspace-relative set of files or directories affected.
2. Call `recovery_prepare_filesystem_delete` with the workspace root, relative paths, and concrete reason.
3. Report the operation ID, affected scope, proof digest, expiry, and whether the restore drill passed.
4. Call `recovery_commit_filesystem_delete` only when deletion is part of the user's requested task and the capability remains fresh.
5. Call `recovery_get_operation` when status is uncertain.
6. Call `recovery_restore_filesystem_delete` when the committed effect must be reversed.
7. For Git, database, infrastructure, overwrite, or opaque-script findings, stop and explain that an exact recovery adapter is not available yet.

## Boundaries

- Only `filesystem.delete` currently has an exact recovery adapter. Other detected destructive categories are block-only.
- Hook protection applies only after the user reviews and trusts the plugin hook in `/hooks`.
- Never widen the workspace root or target scope to make an operation pass.
- A recovery artifact is insufficient without a successful restore drill and matching state witness.
- A stale capability or changed state requires a new preparation step.
- Compensation is not exact recovery. Describe that distinction when an adapter cannot restore exact state.
