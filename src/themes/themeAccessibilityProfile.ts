import { computeWCAGResult } from "./wcagContrast";
import type { ThemeAccessibilityProfile } from "./theme.types";
import { getThemeRuntimeTokens } from "./themeTokens";
import type { ThemeId } from "../control-plane/settings/settings.schema";

const cache = new Map<ThemeId, ThemeAccessibilityProfile>();
const listeners = new Set<() => void>();

const CONTRAST_PAIRS = [
  { label: "text on background",       fg: "textPrimary", bg: "background" },
  { label: "muted text on background", fg: "textMuted",   bg: "background" },
  { label: "text on panel",            fg: "textPrimary", bg: "panelBackground" },
  { label: "accent on background",     fg: "accent",      bg: "background" },
] as const;

export function computeAccessibilityProfile(themeId: ThemeId): ThemeAccessibilityProfile {
  const { app } = getThemeRuntimeTokens(themeId);

  const pairs = CONTRAST_PAIRS.map((pair) => {
    const fg = app[pair.fg as keyof typeof app] as string | undefined;
    const bg = app[pair.bg as keyof typeof app] as string | undefined;

    if (!fg || !bg) {
      return { label: pair.label, foreground: fg ?? "?", background: bg ?? "?", ratio: 0, level: "fail" as const };
    }

    const result = computeWCAGResult(fg, bg);
    return {
      label: pair.label,
      foreground: fg,
      background: bg,
      ratio: Math.round(result.ratio * 100) / 100,
      level: result.level,
    };
  });

  const aa = pairs.every((p) => p.level === "AA" || p.level === "AAA");
  const aaa = pairs.every((p) => p.level === "AAA");

  return {
    themeId,
    wcag: { aa, aaa, pairs },
    computedAt: Date.now(),
  };
}

export function getAccessibilityProfile(themeId: ThemeId): ThemeAccessibilityProfile {
  if (!cache.has(themeId)) {
    cache.set(themeId, computeAccessibilityProfile(themeId));
  }
  return cache.get(themeId)!;
}

export function recomputeAllProfiles(): void {
  cache.clear();
  listeners.forEach((l) => l());
}

export function subscribeAccessibility(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

if (
  typeof window !== "undefined" &&
  (import.meta.env.DEV || (window as any).PLAYWRIGHT)
) {
  (window as any).__lwAccessibilityProfile = { getAccessibilityProfile, recomputeAllProfiles };
}
