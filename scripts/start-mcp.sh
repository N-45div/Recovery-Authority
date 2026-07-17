#!/usr/bin/env bash
set -euo pipefail

root=${PLUGIN_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}
export PLUGIN_ROOT="$root"

if [[ -x "$root/.tools/bun/bin/bun" ]]; then
  bun_bin="$root/.tools/bun/bin/bun"
elif command -v bun >/dev/null 2>&1; then
  bun_bin=$(command -v bun)
else
  echo "Recovery Authority requires Bun. See README.md for installation." >&2
  exit 1
fi

if [[ -n "${RECOVERY_AUTHORITY_MCP_SOCKET:-}" ]]; then
  if [[ -f "$root/dist/mcp-proxy.js" ]]; then
    exec "$bun_bin" "$root/dist/mcp-proxy.js"
  fi
  exec "$bun_bin" "$root/src/mcp-proxy.ts"
fi

if [[ -f "$root/dist/cli.js" ]]; then
  exec "$bun_bin" "$root/dist/cli.js" mcp
fi

exec "$bun_bin" "$root/src/cli.ts" mcp
