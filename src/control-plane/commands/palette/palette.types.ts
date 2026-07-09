// SPDX-License-Identifier: Apache-2.0
import type { CommandCategory, CommandEntry } from "../command.types";

export type CategoryFilter = "all" | CommandCategory;

export type PaletteSectionKind = "pinned" | "recent" | "suggested" | "search";

export interface RankedCommandEntry {
  command: CommandEntry;
  rank: number;
}

export interface PaletteSection {
  kind: PaletteSectionKind;
  label: string;
  items: RankedCommandEntry[];
}

export interface PalettePersistedState {
  pinned: string[];
  recent: string[];
}
