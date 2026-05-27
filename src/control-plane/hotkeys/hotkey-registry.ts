import type { HotkeyEntry } from "./hotkey-binding.types";

const entries: HotkeyEntry[] = [];

export const hotkeyRegistry = {
  register(entry: HotkeyEntry): void {
    entries.push(entry);
  },

  getAll(): ReadonlyArray<HotkeyEntry> {
    return entries;
  },

  getActive(): ReadonlyArray<HotkeyEntry> {
    return entries.filter((e) => e.status === "active");
  },

  getNative(): ReadonlyArray<HotkeyEntry> {
    return entries.filter((e) => e.status === "native");
  },

  getBanned(): ReadonlyArray<HotkeyEntry> {
    return entries.filter((e) => e.status === "banned");
  },

  getActiveByCommandId(commandId: string): HotkeyEntry | undefined {
    return entries.find((e) => e.status === "active" && e.commandId === commandId);
  },
};

if (typeof window !== "undefined" && (import.meta.env.DEV || (window as any).PLAYWRIGHT)) {
  (window as any).__lwHotkeyRegistry = hotkeyRegistry;
}
