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

1. **Effect authority is exact.** Individual approval binds one operation ID, pre-state witness, restore proof, statement or target digest, and expiry. Aggregate approval binds an immutable ordered set of those exact child proofs.
2. **Recovery precedes authority.** An adapter must restore its artifact in isolation before approval can be requested.
3. **Only the approval broker mints forward capabilities.** Prepare paths never create a valid capability.
4. **Authority is not inherited as a broad permission.** A parent or child can only submit the exact approved operation; a subagent does not receive a reusable destructive grant.
5. **Mutable environment roots are not identity roots.** On POSIX, the account home is resolved from the UID through the local passwd database, NSS, or the BSD identity interface. On Windows, the user profile is resolved through the OS known-folder API. `$HOME` and `$env:USERPROFILE` remain untrusted inputs.
6. **The recovery authority protects itself.** A filesystem operation cannot contain the authority data root or the OS account root.
7. **State changes invalidate proof.** Every adapter re-witnesses protected state before commit and refuses recovery over later live changes.
8. **Unknown effects fail closed.** Unsupported, mixed, indirect, or opaque destructive effects remain blocked.
9. **The model process does not hold signing authority.** MCP services load only the public verifier; the private key is loaded only by the separate terminal approval process.
10. **Sandboxed actors cannot modify authority state.** In Linux sandbox mode, the daemon, ledger, artifacts, and key directory remain outside the agent mount namespace and are reachable only through typed MCP messages.
11. **The authority cannot be redirected to host paths.** Filesystem, SQLite, and Git prepare requests must use the canonical workspace selected by the sandbox runner.
12. **Graph awareness is not authority.** Consequence nodes, readiness vectors, and minimum-safe-cut guidance cannot mint capabilities, override hook denial, or make a raw command executable.
13. **Unknown edges remain unknown.** Missing dependency data lowers graph closure; it is never interpreted as proof that an effect has no downstream impact.
14. **Manifest authority is not broad authority.** One manifest confirmation derives exact child capabilities; it cannot add children, change order, widen scopes, alter SQL, or authorize raw shell equivalents.
15. **Saga recovery is explicit.** Multi-effect commit is not described as atomic. Recorded commits are recovered in reverse order after failure, and any refused recovery remains visible as an outstanding operation in `partially-recovered` state.
16. **Conflicting proofs are not composed.** Recovery Manifests reject overlapping filesystem scopes and more than one operation against the same PostgreSQL database.

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

## Process boundary

In enforceable Linux mode, the runner starts the authority daemon before entering `bubblewrap`. The daemon creates one public-key-only MCP server per Unix-socket connection. The in-sandbox plugin launcher is a byte proxy, not an authority process. The model can disconnect the proxy or submit ordinary MCP requests, but it cannot read or mutate the host ledger, recovery artifacts, or private signing directory.

The root filesystem is mounted read-only and the selected repository is rebound writable. This mount policy is inherited by all descendants, including shell-launched agents that do not emit Codex lifecycle hooks. A disposable `CODEX_HOME` prevents normal session writes from failing without granting write access to the real Codex state tree. Sanitized hook metadata is relayed to a dedicated host audit socket; raw commands are never accepted by that endpoint. Network is shared by default because hosted model calls require it; offline operators can request a separate network namespace.

## Current limitations

- Plugin hooks must be reviewed and trusted. Disabling hooks or using an uninstrumented tool removes interception.
- `SubagentStart` can inject context but cannot prevent a subagent from starting. Shell-launched agents are blocked when recognized, not comprehensively discovered.
- Direct plugin mode cannot mediate arbitrary already-running same-user binaries. Use the Linux sandbox runner when the harness or its descendants are not trusted with host write access.
- The independent authority runner targets Linux with `bubblewrap`. macOS and Windows use harness-level interception plus the Codex host sandbox; Recovery Authority does not claim those host sandboxes as its own isolation implementation.
- The selected workspace is writable by design. The sandbox contains its blast radius; hook interception and recovery capabilities govern destructive effects within that workspace.
- The Unix socket is an availability boundary, not a secret. A sandboxed process can disconnect its own proxy, but direct socket access exposes only the same typed MCP methods and no signing operation.
- Hook lifecycle records are operational telemetry, not cryptographic actor attestations. A process inside the sandbox can forge or suppress its own audit-socket events; recovery operations, approvals, and capabilities remain authority-owned.
- The consequence graph is a derived operational view and may be stale between receipts. Enforcement always re-reads authority-owned operation state and live resource witnesses instead of trusting graph state.
- Recovery Manifests are compensated sagas, not distributed transactions. There is no cross-system lock or atomic visibility boundary; concurrent writers can invalidate a child commit or later recovery.
- Manifest progress is journaled after each adapter returns. A process or storage failure inside an adapter's narrow mutation-to-ledger-write interval can require operator inspection of the resource and child operation before resuming recovery.
- A failed reverse recovery never overwrites later state to force completion. The manifest remains `partially-recovered` with exact outstanding child IDs until the conflict is resolved safely.
- POSIX account-home attestation uses `/etc/passwd`, absolute-path `getent`, or BSD `id -P`. Environments where all three are unavailable may report the account root as unresolved and should fail deployment policy until an OS-native identity provider is configured.
- Windows command policy depends on the native PowerShell parser. Parser startup errors, syntax errors, dynamic invocation, encoded commands, `cmd.exe` nesting, and script execution fail closed. Windows device paths and alternate data streams are rejected from recoverable workspace scopes.
- Windows filesystem deletion is block-only because this release does not restore-test ACLs, alternate streams, and reparse-point metadata exactly.
- The filesystem adapter witnesses contents, modes, and symlink targets. It does not yet preserve every ACL, extended attribute, sparse-file layout, hard-link relationship, or open-file semantic.
- Local filesystem commit uses path revalidation followed by deletion, not descriptor-relative `openat2`/`unlinkat`; hostile concurrent path replacement remains outside this release's guarantee.
- Remote infrastructure and object-storage effects are block-only because compensation is not exact recovery.
