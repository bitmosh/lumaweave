import { create } from "zustand";
import { defaultSettings } from "./settings.defaults";
import { migrateSettings } from "./settings.migrations";
import type { StarmapSettings } from "./settings.schema";

export const CURRENT_SCHEMA_VERSION = 82;

export type SettingsStore = {
  settings: StarmapSettings;
  setSetting: (path: string, value: unknown) => void;
  resetSettings: () => void;
};

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
function loadSettings(): StarmapSettings {
  try {
    const saved = localStorage.getItem("lumaweave-settings");
    if (!saved) {
      return defaultSettings;
    }
    const parsed = JSON.parse(saved) as Partial<StarmapSettings>;
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

  setSetting: (path, value) =>
    set((state) => ({
      settings: setNestedValue(state.settings, path, value),
    })),

  resetSettings: () =>
    set({
      settings: defaultSettings,
    }),
}));

// Export raw store for test helpers (dev mode only)
export const settingsStore = useSettingsStore;