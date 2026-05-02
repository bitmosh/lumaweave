import { create } from "zustand";
import { defaultSettings } from "./settings.defaults";
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

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: defaultSettings,

  setSetting: (path, value) =>
    set((state) => ({
      settings: setNestedValue(state.settings, path, value),
    })),

  resetSettings: () =>
    set({
      settings: defaultSettings,
    }),
}));