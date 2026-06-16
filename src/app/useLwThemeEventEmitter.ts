import { useEffect, useRef } from "react";
import { useSettingsStore } from "../control-plane/settings/settings.store";
import { invokeEmitThemeChanged } from "../lib/tauri-invoke";

export function useLwThemeEventEmitter(): void {
  const themeId = useSettingsStore((s) => s.settings.appearance.theme);
  const prevThemeRef = useRef<string | null>(null);

  useEffect(() => {
    const prev = prevThemeRef.current;
    prevThemeRef.current = themeId;
    if (prev !== null && prev !== themeId) {
      invokeEmitThemeChanged(prev, themeId).catch(() => {});
    }
  }, [themeId]);
}
