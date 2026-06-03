import React from "react";
import { useSettingsStore } from "../../control-plane/settings/settings.store";
import type { MinimapSettings } from "../../control-plane/settings/settings.schema";

export function useMinimapSettings(): MinimapSettings {
  return useSettingsStore((s) => s.settings.minimap);
}

export function useSetMinimapSetting() {
  const setSetting = useSettingsStore((s) => s.setSetting);
  const current = useSettingsStore((s) => s.settings.minimap);
  return React.useCallback(
    (keyOrPatch: string | Partial<MinimapSettings>, value?: unknown) => {
      const next =
        typeof keyOrPatch === "string"
          ? { ...current, [keyOrPatch]: value }
          : { ...current, ...keyOrPatch };
      setSetting("minimap", next);
    },
    [setSetting, current],
  );
}
