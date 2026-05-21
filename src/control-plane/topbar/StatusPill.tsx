import { useSettingsStore } from "../../control-plane/settings/settings.store";

function getThemeDisplayName(themeId: string): string {
  const map: Record<string, string> = {
    "solar-plasma":    "Solar Plasma",
    "obsidian-aurora": "Obsidian Aurora",
    "midnight-loom":   "Midnight Loom",
    "void-circuit":    "Void Circuit",
    "agartha-dream":   "Agartha Dream",
    "agartha-dusk":    "Agartha Dusk",
  };
  return map[themeId] ?? themeId;
}

export function StatusPill() {
  const reduceMotion = useSettingsStore((s) => s.settings.appearance.reduceMotion);
  const themeId = useSettingsStore((s) => s.settings.appearance.theme);
  const themeName = getThemeDisplayName(themeId);

  return (
    <div
      className="lw-status-pill"
      data-lw-theme-target="topbar.statusPill"
      data-reduce-motion={String(reduceMotion)}
    >
      <span className="lw-status-dot" />
      <span className="lw-status-label">{themeName}</span>
    </div>
  );
}
