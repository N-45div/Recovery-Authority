# Threat model

Recovery Authority treats a purge as any effect that makes durable state unavailable, not only an `rm` command. The policy corpus in `src/purge-vectors.ts` is executable test data derived from public incidents and official command semantics.

## Actors

- **Root agent:** the user-visible coding-agent thread.
- **Delegated agent:** a native subagent with its own model context and tool calls.
- **Hidden executor:** a shell-launched agent, interpreter, script, package hook, or child process.
- **Concurrent writer:** another agent, editor, daemon, database client, or sync process changing the same state.
- **Harness/control plane:** the agent host, updater, session cleaner, and hook runner.
- **Human approver:** a person operating a separate interactive terminal.

No model actor is trusted to classify its own command as safe. A destructive effect is denied regardless of which actor requested it.

## Security invariants

1. **Effect authority is exact.** Approval binds one operation ID, pre-state witness, restore proof, statement or target digest, and expiry.
2. **Recovery precedes authority.** An adapter must restore its artifact in isolation before approval can be requested.
3. **Only the approval broker mints forward capabilities.** Prepare paths never create a valid capability.
4. **Authority is not inherited as a broad permission.** A parent or child can only submit the exact approved operation; a subagent does not receive a reusable destructive grant.
5. **Mutable environment roots are not identity roots.** On POSIX, the account home is resolved from the UID through the local passwd database, NSS, or the BSD identity interface, independently of `$HOME`.
6. **The recovery authority protects itself.** A filesystem operation cannot contain the authority data root or the OS account root.
7. **State changes invalidate proof.** Every adapter re-witnesses protected state before commit and refuses recovery over later live changes.
8. **Unknown effects fail closed.** Unsupported, mixed, indirect, or opaque destructive effects remain blocked.

## Evidence-backed purge families

| Family | Examples covered | Why it matters |
| --- | --- | --- |
| Direct filesystem deletion | `rm`, `unlink`, `shred`, `find -delete`, `find -exec` | A broad `find ... -exec rm -rf` deleted most of a reported Codex repository, including `.git`. |
| Native edit deletion | `apply_patch` `Delete File`, empty replacement | Shell-only gates miss destructive editor tools. |
| Mutable root confusion | `HOME=...`, `env HOME=...`, `USERPROFILE`, XDG roots | A temporary-root setup can turn a cleanup target into an account-root target. |
| Git state loss | `reset --hard`, `restore`, `clean`, force push, stash/reflog deletion | `git restore` has overwritten real uncommitted work even after explicit user constraints. |
| Sync mirroring | `rsync --delete`, `--remove-source-files`, `rclone purge/sync` | A source/destination reversal or empty source can fan out deletion locally or remotely. |
| Container purge | system/volume prune, Compose `down -v` | Persistent database state may live in a volume that looks unused to the current process. |
| Database purge | DROP, TRUNCATE, broad DELETE/UPDATE, framework reset commands | Cascades, triggers, and external effects can make the blast radius larger than the statement text. |
| Infrastructure purge | Terraform destroy/apply, Kubernetes and cloud deletes | Durable state can be remote and cannot be restored from a local file snapshot. |
| Interpreter bypass | Python, JavaScript, Ruby, PowerShell deletion APIs | Blocking the `rm` token alone does not block the same syscall through another runtime. |
| Hidden agent delegation | `codex exec`, headless Claude, OpenCode run | Shell-spawned agents do not produce native subagent lifecycle identity for this plugin. |
| Concurrent-agent cleanup | one agent removes files created by another | A file can be valid live work even when absent from one agent's context. |

Primary evidence:

- [Codex repository-wide deletion report](https://github.com/openai/codex/issues/5594)
- [Codex Git restore data-loss report](https://github.com/openai/codex/issues/8643)
- [Codex concurrent-agent cleanup report](https://github.com/openai/codex/issues/4969)
- [Codex alternate deletion mechanism report](https://github.com/openai/codex/issues/5128)
- [Codex orphaned subagent lifecycle report](https://github.com/openai/codex/issues/19197)
- [Claude Code unapproved deletion report](https://github.com/anthropics/claude-code/issues/6608)
- [Docker system prune semantics](https://docs.docker.com/reference/cli/docker/system/prune/)
- [Rsync delete semantics](https://download.samba.org/pub/rsync/rsync.1)
- [PostgreSQL TRUNCATE semantics](https://www.postgresql.org/docs/current/sql-truncate.html)

## Delegated-agent model

Codex exposes `agent_id` on `SubagentStart` and `SubagentStop`, while turn-scoped hooks use the parent `session_id`. Recovery Authority records those lifecycle events and displays active delegated executors in the TUI. It does not invent a cryptographic actor binding where the host does not provide one.

The safety boundary is therefore actor-independent: every recognized destructive tool call is denied, even when actor attribution is unavailable. A native subagent receives additional recovery context, but that context is defense in depth; the `PreToolUse` denial and MCP approval checks are the enforcement points.

## Current limitations

- Plugin hooks must be reviewed and trusted. Disabling hooks or using an uninstrumented tool removes interception.
- `SubagentStart` can inject context but cannot prevent a subagent from starting. Shell-launched agents are blocked when recognized, not comprehensively discovered.
- Command and patch analysis cannot mediate arbitrary already-running same-user binaries. A production runtime should place the agent in an OS sandbox or copy-on-write filesystem and keep the broker outside it.
- POSIX account-home attestation uses `/etc/passwd`, absolute-path `getent`, or BSD `id -P`. Environments where all three are unavailable may report the account root as unresolved and should fail deployment policy until an OS-native identity provider is configured.
- The filesystem adapter witnesses contents, modes, and symlink targets. It does not yet preserve every ACL, extended attribute, sparse-file layout, hard-link relationship, or open-file semantic.
- Local filesystem commit uses path revalidation followed by deletion, not descriptor-relative `openat2`/`unlinkat`; hostile concurrent path replacement remains outside this release's guarantee.
- Remote infrastructure and object-storage effects are block-only because compensation is not exact recovery.
