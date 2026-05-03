#!/usr/bin/env bash
set -euo pipefail

REPO="/home/boop/Projects/lumaweave"
cd "$REPO"

echo "Bandit shell locked to: $(pwd)"
echo "Git root: $(git rev-parse --show-toplevel)"
echo
exec bash --noprofile --norc
