import { computeWCAGResult } from "./wcagContrast";
import type { ThemeAccessibilityProfile } from "./theme.types";
import { getThemeRuntimeTokens } from "./themeTokens";
import type { ThemeId } from "../control-plane/settings/settings.schema";

const cache = new Map<ThemeId, ThemeAccessibilityProfile>();
const listeners = new Set<() => void>();

// kind: "text" → evaluated at WCAG 1.4.3 (4.5:1 AA / 7:1 AAA, normal size)
// kind: "non-text" → evaluated at WCAG 1.4.11 (3:1, single bar, no AAA tier)
const CONTRAST_PAIRS = [
  { label: "text on background",       fg: "textPrimary", bg: "background",      kind: "text"     },
  { label: "muted text on background", fg: "textMuted",   bg: "background",      kind: "text"     },
  { label: "text on panel",            fg: "textPrimary", bg: "panelBackground", kind: "text"     },
  { label: "accent on background",     fg: "accent",      bg: "background",      kind: "non-text" },
] as const;

export function computeAccessibilityProfile(themeId: ThemeId): ThemeAccessibilityProfile {
  const { app } = getThemeRuntimeTokens(themeId);

  const pairs = CONTRAST_PAIRS.map((pair) => {
    const fg = app[pair.fg as keyof typeof app] as string | undefined;
    const bg = app[pair.bg as keyof typeof app] as string | undefined;

    if (!fg || !bg) {
      return { label: pair.label, foreground: fg ?? "?", background: bg ?? "?", ratio: 0, level: "fail" as const };
    }

    const result = computeWCAGResult(fg, bg, pair.kind === "non-text" ? { nonText: true } : undefined);
    return {
      label: pair.label,
      foreground: fg,
      background: bg,
      ratio: Math.round(result.ratio * 100) / 100,
      level: result.level,
    };
  });

  // Per-criterion aggregation (v103.0.5b):
  //   aa  = every pair passes its own criterion (text ≥4.5, non-text ≥3)
  //   aaa = every TEXT pair is AAA (≥7) AND every non-text pair passes 3:1
  // Non-text pairs max at "AA" (no AAA tier in 1.4.11), so using pairs.every(AAA)
  // would permanently block aaa — even if all text pairs are AAA.
  const aa  = pairs.every((p) => p.level !== "fail");
  const aaa = pairs.every((p, i) =>
    CONTRAST_PAIRS[i].kind === "non-text" ? p.level !== "fail" : p.level === "AAA"
  );

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
