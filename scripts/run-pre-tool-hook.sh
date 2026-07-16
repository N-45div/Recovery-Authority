#!/usr/bin/env bash
set -euo pipefail

root=${PLUGIN_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}

if [[ -x "$root/.tools/bun/bin/bun" ]]; then
  bun_bin="$root/.tools/bun/bin/bun"
elif command -v bun >/dev/null 2>&1; then
  bun_bin=$(command -v bun)
else
  echo "Recovery Authority hook requires Bun. See README.md for installation." >&2
  exit 1
fi

if [[ -f "$root/dist/pre-tool-hook.js" ]]; then
  exec "$bun_bin" "$root/dist/pre-tool-hook.js"
fi

exec "$bun_bin" "$root/src/pre-tool-hook.ts"
