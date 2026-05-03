#!/usr/bin/env bash
set -euo pipefail

REPO="/home/boop/Projects/lumaweave"

cd "$REPO"

if [ "$(pwd)" != "$REPO" ]; then
  echo "ERROR: wrong pwd: $(pwd)" >&2
  exit 2
fi

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ "$ROOT" != "$REPO" ]; then
  echo "ERROR: wrong git root: $ROOT" >&2
  exit 3
fi

exec "$@"
