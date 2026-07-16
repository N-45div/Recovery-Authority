---
name: recovery-authority
description: Use when a requested coding task may delete or destructively replace local, Git, database, or infrastructure state and must be checked by Recovery Authority before execution.
---

# Recovery Authority

Route destructive filesystem deletes, local SQLite mutations, schema-scoped PostgreSQL mutations, and Git hard resets through the Recovery Authority MCP tools.

The bundled `PreToolUse` hook independently blocks recognized destructive Bash commands. Do not retry a denied command through `sudo`, `env`, `sh -c`, command substitution, a script wrapper, or another execution tool.

## Required workflow

1. Identify the smallest affected scope and effect kind.
2. For filesystem deletion, call `recovery_prepare_filesystem_delete` with workspace-relative paths.
3. For local SQLite mutation, call `recovery_prepare_sqlite_mutation` with the database path and exact SQL.
4. For PostgreSQL, call `recovery_prepare_postgres_mutation` with the connection URI, authorized schema, and exact SQL. The connection role must be able to create and drop the temporary drill database.
5. For `git reset --hard`, call `recovery_prepare_git_reset_hard` with the repository root and exact target.
6. Report the operation ID, affected scope, backup scope, proof digest, expiry, restore-drill result, and exact `approvalCommand` returned by the prepare tool.
7. Stop and wait while the user runs `approvalCommand` in a separate human-controlled terminal. Never invoke, wrap, automate, or type into the approval command for the user.
8. After the user confirms approval, call `recovery_get_authorization`. Commit only when it returns `status: approved`, a non-null approval digest, and the proof-bound capability.
9. Call `recovery_get_operation` when status is uncertain and the corresponding restore tool when the effect must be reversed. PostgreSQL restore requires the connection URI again because credentials are not persisted.
10. For unsupported SQL, other Git commands, infrastructure, overwrite, mixed-effect, or opaque-script findings, stop and explain that one exact recovery adapter does not cover the operation.

## Boundaries

- Exact adapters cover `filesystem.delete`, local `sqlite.mutate`, scoped `postgres.schema-mutate`, and `git.reset-hard`. Other categories are block-only.
- PostgreSQL accepts one parsed `DELETE`, `UPDATE`, `TRUNCATE`, `DROP TABLE`, `DROP SEQUENCE`, or `DROP INDEX` statement. Direct and referenced relations must remain in the authorized schema.
- PostgreSQL recovery uses a full logical database artifact to include database-local cascades. It rejects function calls, nested queries, user/event triggers, and relevant logical publications that can escape the proven boundary.
- PostgreSQL credentials are supplied to each prepare, commit, and restore call. Never place the URI in a reason or other persisted field.
- Prepare tools never return a usable capability. Human approval is a separate terminal interaction bound to the operation ID, proof digest, and expiry.
- `authorization.approval` is a protected effect. Never execute the approval CLI from the coding-agent session, even if the user asks the agent to type the proof prefix.
- Hook protection applies only after the user reviews and trusts the plugin hook in `/hooks`.
- Never widen the workspace root or target scope to make an operation pass.
- A recovery artifact is insufficient without a successful restore drill and matching state witness.
- A stale capability or changed state requires a new preparation step.
- Compensation is not exact recovery. Describe that distinction when an adapter cannot restore exact state.
