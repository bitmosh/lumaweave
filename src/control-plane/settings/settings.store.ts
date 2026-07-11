// SPDX-License-Identifier: Apache-2.0
import { create } from "zustand";
import { defaultSettings } from "./settings.defaults";
import { migrateSettings } from "./settings.migrations";
import type { LumaWeaveSettings, SourceEntry } from "./settings.schema";

export const CURRENT_SCHEMA_VERSION = 96;

export type SettingsStore = {
  settings: LumaWeaveSettings;
  setSetting: (path: string, value: unknown) => void;
  resetSettings: () => void;
  pushLibraryEntry: (partial: Omit<SourceEntry, "id">) => void;
  pinLibraryEntry: (entryId: string) => void;
  unpinLibraryEntry: (entryId: string) => void;
  removeLibraryEntry: (entryId: string) => void;
  updateLibraryEntryThumbnail: (entryId: string, dataUrl: string) => void;
  renameLibraryEntry: (entryId: string, label: string) => void;
};

// Stable ID for a library entry: hash of adapterId + sorted config keys.
// Must be deterministic across page loads (no Math.random / Date).
function makeEntryId(adapterId: string, config: Record<string, unknown>): string {
  const stable = JSON.stringify(
    Object.fromEntries(Object.entries(config).sort(([a], [b]) => a.localeCompare(b))),
  );
  let h = 0;
  for (let i = 0; i < stable.length; i++) {
    h = (Math.imul(31, h) + stable.charCodeAt(i)) | 0;
  }
  return `${adapterId}:${(h >>> 0).toString(36)}`;
}

function updateLibrary(
  settings: LumaWeaveSettings,
  library: { pinned: SourceEntry[]; recent: SourceEntry[] },
): LumaWeaveSettings {
  const copy = structuredClone(settings);
  copy.sources.library = library;
  return copy;
}

function setNestedValue(obj: any, path: string, value: unknown) {
  const keys = path.split(".");
  const copy = structuredClone(obj);
  let cursor = copy;

  for (let i = 0; i < keys.length - 1; i++) {
    cursor = cursor[keys[i]];
  }

  cursor[keys[keys.length - 1]] = value;
  return copy;
}

// Load settings from localStorage with migration
function loadSettings(): LumaWeaveSettings {
  try {
    const saved = localStorage.getItem("lumaweave-settings");
    if (!saved) {
      return defaultSettings;
    }
    const parsed = JSON.parse(saved) as Partial<LumaWeaveSettings>;
    const migrated = migrateSettings(parsed);

    // Version gate: reject if migration didn't reach current version
    if (migrated.version !== CURRENT_SCHEMA_VERSION) {
      throw new Error(
        `Settings migration ended at v${migrated.version}, expected v${CURRENT_SCHEMA_VERSION}. Migration chain is incomplete.`,
      );
    }

    return migrated;
  } catch {
    return defaultSettings;
  }
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: loadSettings(),

  setSetting: (path: string, value: unknown) =>
    set((state) => ({
      settings: setNestedValue(state.settings, path, value),
    })),

  resetSettings: () =>
    set({
      settings: defaultSettings,
    }),

  pushLibraryEntry: (partial) =>
    set((state) => {
      const id = makeEntryId(partial.adapterId, partial.config as unknown as Record<string, unknown>);
      const entry: SourceEntry = { ...partial, id };
      const library = state.settings.sources.library;

      // If already pinned, update in-place (label/counts/time) — don't re-add to recent.
      const pinnedIdx = library.pinned.findIndex((e) => e.id === id);
      if (pinnedIdx >= 0) {
        const pinned = library.pinned.map((e, i) =>
          i === pinnedIdx
            ? { ...e, label: entry.label, loadedAt: entry.loadedAt, nodeCount: entry.nodeCount, edgeCount: entry.edgeCount }
            : e,
        );
        return { settings: updateLibrary(state.settings, { ...library, pinned }) };
      }

      // Upsert in recent: move to front if exists, else prepend. Trim to 20.
      const recentIdx = library.recent.findIndex((e) => e.id === id);
      let recent: SourceEntry[] = recentIdx >= 0
        ? [entry, ...library.recent.filter((_, i) => i !== recentIdx)]
        : [entry, ...library.recent];
      if (recent.length > 20) recent = recent.slice(0, 20);
      return { settings: updateLibrary(state.settings, { ...library, recent }) };
    }),

  pinLibraryEntry: (entryId) =>
    set((state) => {
      const library = state.settings.sources.library;
      const idx = library.recent.findIndex((e) => e.id === entryId);
      if (idx < 0) return {};
      const entry = { ...library.recent[idx], pinnedAt: new Date().toISOString() };
      const recent = library.recent.filter((_, i) => i !== idx);
      const pinned = [entry, ...library.pinned];
      return { settings: updateLibrary(state.settings, { pinned, recent }) };
    }),

  unpinLibraryEntry: (entryId) =>
    set((state) => {
      const library = state.settings.sources.library;
      const idx = library.pinned.findIndex((e) => e.id === entryId);
      if (idx < 0) return {};
      const { pinnedAt: _removed, ...unpinned } = library.pinned[idx];
      const pinned = library.pinned.filter((_, i) => i !== idx);
      let recent = [unpinned, ...library.recent];
      if (recent.length > 20) recent = recent.slice(0, 20);
      return { settings: updateLibrary(state.settings, { pinned, recent }) };
    }),

  removeLibraryEntry: (entryId) =>
    set((state) => {
      const library = state.settings.sources.library;
      return {
        settings: updateLibrary(state.settings, {
          pinned: library.pinned.filter((e) => e.id !== entryId),
          recent: library.recent.filter((e) => e.id !== entryId),
        }),
      };
    }),

  updateLibraryEntryThumbnail: (entryId, dataUrl) =>
    set((state) => {
      const library = state.settings.sources.library;
      const pinnedIdx = library.pinned.findIndex((e) => e.id === entryId);
      if (pinnedIdx >= 0) {
        const pinned = library.pinned.map((e, i) =>
          i === pinnedIdx ? { ...e, thumbnailDataUrl: dataUrl } : e,
        );
        return { settings: updateLibrary(state.settings, { ...library, pinned }) };
      }
      const recentIdx = library.recent.findIndex((e) => e.id === entryId);
      if (recentIdx >= 0) {
        const recent = library.recent.map((e, i) =>
          i === recentIdx ? { ...e, thumbnailDataUrl: dataUrl } : e,
        );
        return { settings: updateLibrary(state.settings, { ...library, recent }) };
      }
      return {};
    }),

  renameLibraryEntry: (entryId, label) =>
    set((state) => {
      const library = state.settings.sources.library;
      const pinnedIdx = library.pinned.findIndex((e) => e.id === entryId);
      if (pinnedIdx >= 0) {
        const pinned = library.pinned.map((e, i) =>
          i === pinnedIdx ? { ...e, label } : e,
        );
        return { settings: updateLibrary(state.settings, { ...library, pinned }) };
      }
      const recentIdx = library.recent.findIndex((e) => e.id === entryId);
      if (recentIdx >= 0) {
        const recent = library.recent.map((e, i) =>
          i === recentIdx ? { ...e, label } : e,
        );
        return { settings: updateLibrary(state.settings, { ...library, recent }) };
      }
      return {};
    }),
}));

// Subscribe to state changes and persist to localStorage
useSettingsStore.subscribe((state) => {
  try {
    localStorage.setItem("lumaweave-settings", JSON.stringify(state.settings));
  } catch (error) {
    console.error("Failed to save settings to localStorage:", error);
  }
});

// Export raw store for test helpers (dev mode only)
export const settingsStore = useSettingsStore;

// Install the probe in DEV/PLAYWRIGHT mode
if (
  typeof window !== "undefined" &&
  (import.meta.env.DEV || (window as any).PLAYWRIGHT)
) {
  (window as any).__lwStore = useSettingsStore;
}