#!/usr/bin/env bash
# SPDX-License-Identifier: Apache-2.0
set -euo pipefail

REPO="/home/boop/Projects/lumaweave"
cd "$REPO"

echo "Bandit shell locked to: $(pwd)"
echo "Git root: $(git rev-parse --show-toplevel)"
echo
exec bash --noprofile --norc
