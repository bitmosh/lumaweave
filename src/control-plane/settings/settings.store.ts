import { create } from "zustand";
import { defaultSettings } from "./settings.defaults";
import { migrateSettings } from "./settings.migrations";
import type { StarmapSettings } from "./settings.schema";

type SettingsStore = {
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
    return migrateSettings(parsed);
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