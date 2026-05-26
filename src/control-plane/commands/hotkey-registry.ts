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
};

if (typeof window !== "undefined" && (import.meta.env.DEV || (window as any).PLAYWRIGHT)) {
  (window as any).__lwHotkeyRegistry = hotkeyRegistry;
}
