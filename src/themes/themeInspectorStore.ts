import { create } from "zustand";

interface ThemeInspectorState {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (value: boolean) => void;
}

export const useThemeInspectorStore = create<ThemeInspectorState>((set) => ({
  enabled: false,
  toggle: () => set((state) => ({ enabled: !state.enabled })),
  setEnabled: (value: boolean) => set({ enabled: value }),
}));
