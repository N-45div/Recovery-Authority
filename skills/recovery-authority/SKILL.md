---
name: recovery-authority
description: Use when a requested coding task deletes or destructively replaces filesystem state and should be recovery-tested before execution.
---

# Recovery Authority

Route destructive filesystem deletes through the Recovery Authority MCP tools.

## Required workflow

1. Identify the smallest workspace-relative set of files or directories affected.
2. Call `recovery_prepare_filesystem_delete` with the workspace root, relative paths, and concrete reason.
3. Report the operation ID, affected scope, proof digest, expiry, and whether the restore drill passed.
4. Call `recovery_commit_filesystem_delete` only when deletion is part of the user's requested task and the capability remains fresh.
5. Call `recovery_get_operation` when status is uncertain.
6. Call `recovery_restore_filesystem_delete` when the committed effect must be reversed.

## Boundaries

- Never represent ordinary `rm`, shell scripts, Git commands, database mutations, or external API calls as protected by this plugin.
- Never widen the workspace root or target scope to make an operation pass.
- A recovery artifact is insufficient without a successful restore drill and matching state witness.
- A stale capability or changed state requires a new preparation step.
- Compensation is not exact recovery. Describe that distinction when an adapter cannot restore exact state.
