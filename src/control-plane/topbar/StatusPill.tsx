import { useSettingsStore } from "../../control-plane/settings/settings.store";
import { getAccessibilityProfile } from "../../themes/themeAccessibilityProfile";

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

  const profile = getAccessibilityProfile(themeId);
  const wcagLabel = profile.wcag.aaa ? "AAA" : profile.wcag.aa ? "AA" : "partial";
  const wcagLevel = profile.wcag.aaa ? "aaa" : profile.wcag.aa ? "aa" : "partial";
  const tooltipText = profile.wcag.pairs
    .map((p) => `${p.label}: ${p.ratio.toFixed(2)}:1 (${p.level})`)
    .join("\n");

  return (
    <div
      className="lw-status-pill"
      data-lw-theme-target="topbar.statusPill"
      data-reduce-motion={String(reduceMotion)}
    >
      <span className="lw-status-dot" />
      <span className="lw-status-label">{themeName}</span>
      <span
        className={`lw-wcag-badge lw-wcag-${wcagLevel}`}
        data-testid="wcag-badge"
        title={`WCAG: ${wcagLabel}\n${tooltipText}`}
      >
        {wcagLabel}
      </span>
    </div>
  );
}
