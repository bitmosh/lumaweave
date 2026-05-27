import { matchSorterWithRankInfo, rankings } from "match-sorter";
import type { CommandEntry } from "../command.types";
import type { CategoryFilter, PalettePersistedState, PaletteSection, RankedCommandEntry } from "./palette.types";

export const STARTER_COMMAND_IDS = [
  "graph.fit",
  "view.toggleInspector",
  "theme.next",
  "view.openSettings",
  "graph.cycleDialect",
  "labels.cycleNodeLabelMode",
];

export function searchCommands(
  query: string,
  commands: ReadonlyArray<CommandEntry>,
  filter: CategoryFilter,
): RankedCommandEntry[] {
  const pool = filter === "all" ? commands : commands.filter((c) => c.category === filter);
  const active = pool.filter((c) => c.enabled?.() !== false);

  const ranked = matchSorterWithRankInfo(active, query, {
    keys: [
      { key: "label", threshold: rankings.CONTAINS },
      { key: (c) => c.aliases ?? [], threshold: rankings.CONTAINS },
      { key: "description", threshold: rankings.CONTAINS },
      { key: "id", threshold: rankings.CONTAINS },
    ],
    threshold: rankings.MATCHES,
  });

  return ranked.map((item) => ({ command: item.item, rank: item.rank }));
}

export function buildIdleSections(
  commands: ReadonlyArray<CommandEntry>,
  persisted: PalettePersistedState,
): PaletteSection[] {
  const sections: PaletteSection[] = [];
  const active = commands.filter((c) => c.enabled?.() !== false);

  const pinned = persisted.pinned
    .map((id) => active.find((c) => c.id === id))
    .filter((c): c is CommandEntry => c !== undefined);

  if (pinned.length > 0) {
    sections.push({
      kind: "pinned",
      label: "Pinned",
      items: pinned.map((c) => ({ command: c, rank: rankings.EQUAL })),
    });
  }

  const recentCmds = persisted.recent
    .map((id) => active.find((c) => c.id === id))
    .filter((c): c is CommandEntry => c !== undefined)
    .filter((c) => !persisted.pinned.includes(c.id))
    .slice(0, 5);

  if (recentCmds.length > 0) {
    sections.push({
      kind: "recent",
      label: "Recent",
      items: recentCmds.map((c) => ({ command: c, rank: rankings.EQUAL })),
    });
  }

  const usedIds = new Set([...persisted.pinned, ...recentCmds.map((c) => c.id)]);
  const suggested = STARTER_COMMAND_IDS
    .map((id) => active.find((c) => c.id === id))
    .filter((c): c is CommandEntry => c !== undefined && !usedIds.has(c.id))
    .slice(0, 6);

  if (suggested.length > 0) {
    sections.push({
      kind: "suggested",
      label: "Suggested",
      items: suggested.map((c) => ({ command: c, rank: rankings.EQUAL })),
    });
  }

  return sections;
}
