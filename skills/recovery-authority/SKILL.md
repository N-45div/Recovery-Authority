---
name: recovery-authority
description: Use when a requested coding task may delete or destructively replace local, Git, database, or infrastructure state and must be checked by Recovery Authority before execution.
---

# Recovery Authority

Route destructive filesystem deletes, local SQLite mutations, schema-scoped PostgreSQL mutations, and Git hard resets through the Recovery Authority MCP tools. Bind independent multi-effect tasks into one Recovery Manifest instead of coordinating separately approved effects in chat.

The bundled `PreToolUse` hook independently blocks recognized destructive Bash and PowerShell commands. Do not retry a denied command through `sudo`, `env`, `sh -c`, PowerShell dynamic invocation, command substitution, a script wrapper, or another execution tool.

Use only Recovery Authority tools already exposed in the agent's native tool list. Never construct an MCP client in a shell, import an MCP transport from an interpreter, or launch `dist/cli.js mcp` manually. If `recovery_orient` is unavailable as a native tool, stop and report that the plugin MCP tools are unavailable.

## Required workflow

1. Identify the smallest affected scope and effect kind.
2. Call `recovery_orient` with the proposed command and a short goal before destructive or delegated work. Treat `safeCut` as the minimum missing recovery and authority edges. The graph is advisory; it never authorizes execution.
3. Call `recovery_inspect_runtime` once per session before destructive work. Stop if the account root is unresolved, the environment root drifts unexpectedly, or the authority data root is inside the requested purge scope.
4. For filesystem deletion, call `recovery_prepare_filesystem_delete` with workspace-relative paths.
5. For local SQLite mutation, call `recovery_prepare_sqlite_mutation` with the database path and exact SQL.
6. For PostgreSQL, call `recovery_prepare_postgres_mutation` with the connection URI, authorized schema, and exact SQL. The connection role must be able to create and drop the temporary drill database.
7. For `git reset --hard`, call `recovery_prepare_git_reset_hard` with the repository root and exact target.
8. For one effect, report the operation ID, affected scope, backup scope, proof digest, expiry, restore-drill result, and exact `approvalCommand` returned by the prepare tool.
9. For two or more independent supported effects, do not approve children individually. Call `recovery_prepare_manifest` with their exact intended commit order. If scopes overlap, stop and narrow or separate the work; never work around the conflict check.
10. Report the manifest ID, every ordered child effect and scope, aggregate proof digest, expiry, non-atomic saga semantics, and exact manifest `approvalCommand`.
11. Stop and wait while the user runs the relevant `approvalCommand` in a separate human-controlled terminal. Never invoke, wrap, automate, or type into an operation or manifest approval command for the user.
12. Re-run `recovery_orient` with the exact operation ID for one effect or exact manifest ID for multiple effects. Category similarity never transfers proof or authority readiness.
13. For one effect, call `recovery_get_authorization` after approval and use only its corresponding exact commit tool.
14. For a manifest, call `recovery_get_manifest_authorization`, then `recovery_commit_manifest` with children and execution parameters in exactly the approved order. A manifest capability does not authorize raw commands or independent child commits.
15. Treat only manifest `status: committed` as a successful commit. `compensated` means the requested saga failed and prior commits were recovered. `partially-recovered` requires immediate reporting of `failure` and `outstandingOperationIds`, followed by `recovery_restore_manifest` when recovery can safely resume.
16. Call `recovery_get_operation` or `recovery_get_manifest` whenever state is uncertain. PostgreSQL commit and restore parameters require the connection URI again because credentials are not persisted.
17. For unsupported SQL, other Git commands, infrastructure, overwrite, sync, container, remote-storage, root-override, shell-launched-agent, or opaque-script findings, stop and explain the unsatisfied `safeCut` requirement.

## Boundaries

- Exact adapters cover `filesystem.delete`, local `sqlite.mutate`, scoped `postgres.schema-mutate`, and `git.reset-hard`. Other categories are block-only.
- The living consequence graph is a bounded, derived view of operation, approval, and hook receipts. It does not mint capabilities, override a denial, or prove dependencies that have not been observed.
- Recovery Manifests compose only independent, already restore-tested operations. They provide ordered commit and reverse recovery, not cross-system atomicity or isolation.
- An aggregate approval derives exact child capabilities. Both the manifest approval and every child receipt must be bound to the same manifest before commit.
- A manifest rejects overlapping filesystem scopes and multiple operations against the same PostgreSQL database because one child could invalidate another child's proof.
- `recovery_orient` reports uncertainty explicitly. Never treat a missing graph edge as evidence that no dependency exists.
- PostgreSQL accepts one parsed `DELETE`, `UPDATE`, `TRUNCATE`, `DROP TABLE`, `DROP SEQUENCE`, or `DROP INDEX` statement. Direct and referenced relations must remain in the authorized schema.
- PostgreSQL recovery uses a full logical database artifact to include database-local cascades. It rejects function calls, nested queries, user/event triggers, and relevant logical publications that can escape the proven boundary.
- PostgreSQL credentials are supplied to each prepare, commit, and restore call. Never place the URI in a reason or other persisted field.
- Prepare tools never return a usable capability. Human approval is a separate terminal interaction bound to the operation ID, proof digest, and expiry.
- Prepare services do not mint a capability internally. Only the separate approval broker can create one after proof-prefix confirmation.
- Native subagents are logged through lifecycle hooks and receive no broad destructive authority. Never launch another coding agent through a shell command to bypass native lineage.
- `authorization.approval` is a protected effect. Never execute the approval CLI from the coding-agent session, even if the user asks the agent to type the proof prefix.
- Hook protection applies only after the user reviews and trusts the plugin hook in `/hooks`.
- Never widen the workspace root or target scope to make an operation pass.
- A recovery artifact is insufficient without a successful restore drill and matching state witness.
- A stale capability or changed state requires a new preparation step.
- Compensation is not exact recovery. Describe that distinction when an adapter cannot restore exact state.
