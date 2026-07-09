// SPDX-License-Identifier: Apache-2.0
import type { CommandEntry } from "../command.types";

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function findSuggestions(
  query: string,
  commands: ReadonlyArray<CommandEntry>,
  maxResults = 3,
): CommandEntry[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();

  const scored = commands
    .filter((c) => c.enabled?.() !== false)
    .map((c) => {
      const targets = [c.label, ...(c.aliases ?? [])].map((t) => t.toLowerCase());
      const dist = Math.min(...targets.map((t) => levenshtein(q, t)));
      return { command: c, dist };
    })
    .filter(({ dist }) => dist <= Math.max(2, Math.floor(query.length / 3)))
    .sort((a, b) => a.dist - b.dist);

  return scored.slice(0, maxResults).map((s) => s.command);
}
