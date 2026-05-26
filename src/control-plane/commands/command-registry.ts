import type { CommandEntry } from "./command.types";

const entries: CommandEntry[] = [];

export const commandRegistry = {
  register(entry: CommandEntry): void {
    entries.push(entry);
  },

  getAll(): ReadonlyArray<CommandEntry> {
    return entries;
  },
};

if (typeof window !== "undefined" && (import.meta.env.DEV || (window as any).PLAYWRIGHT)) {
  (window as any).__lwCommandRegistry = commandRegistry;
}
