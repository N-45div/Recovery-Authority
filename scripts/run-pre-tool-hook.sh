#!/usr/bin/env bash
set -euo pipefail

root=${PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}}

if [[ -z "${PLUGIN_DATA:-}" && -n "${CLAUDE_PLUGIN_DATA:-}" ]]; then
  export PLUGIN_DATA="$CLAUDE_PLUGIN_DATA"
fi

if [[ -x "$root/.tools/bun/bin/bun" ]]; then
  bun_bin="$root/.tools/bun/bin/bun"
elif command -v bun >/dev/null 2>&1; then
  bun_bin=$(command -v bun)
else
  echo "Recovery Authority hook requires Bun. See README.md for installation." >&2
  exit 1
fi

if [[ -f "$root/dist/cli.js" ]]; then
  exec "$bun_bin" "$root/dist/cli.js" hook
fi

exec "$bun_bin" "$root/src/cli.ts" hook
