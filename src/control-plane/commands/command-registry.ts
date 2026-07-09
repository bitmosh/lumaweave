// SPDX-License-Identifier: Apache-2.0
import type { CommandEntry } from "./command.types";

const entries: CommandEntry[] = [];

export const commandRegistry = {
  register(entry: CommandEntry): void {
    entries.push(entry);
  },

  getAll(): ReadonlyArray<CommandEntry> {
    return entries;
  },

  list(): ReadonlyArray<CommandEntry> {
    return entries;
  },

  getById(id: string): CommandEntry | undefined {
    return entries.find((e) => e.id === id);
  },
};

if (typeof window !== "undefined" && (import.meta.env.DEV || (window as any).PLAYWRIGHT)) {
  (window as any).__lwCommandRegistry = commandRegistry;
}
