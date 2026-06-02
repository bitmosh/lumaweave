/**
 * WCAG 2.1 contrast ratio — correct by construction.
 *
 * Parsing + luminance: culori (wcagContrast/wcagLuminance).
 * Handles hex, rgb, rgba, oklch, hsl, named colors without hand-rolled regex.
 *
 * Translucency policy: contrast is computed on the colors as passed.
 * For semi-transparent colors, culori computes luminance on the pre-multiplied
 * (effective) color value. WCAG formally requires opaque inputs; callers should
 * composite translucent tokens over their actual backdrop before calling here
 * when strict accuracy is needed. The badge and StatusPill inputs are currently
 * opaque hex — this note is for future callers.
 *
 * Level classification:
 *   Normal text (default):  AAA ≥ 7.0 | AA ≥ 4.5 | else fail
 *   Large text (largeText): AAA ≥ 4.5 | AA ≥ 3.0 | else fail
 * "AA-large" is NOT a level for normal text. 3–4.5 on normal text is a FAIL.
 *
 * Parse failures: culori returns null for unparseable input → throw a clear
 * error rather than silently computing a confident-but-garbage rating.
 * Safety principle: never display a computed-from-garbage rating as if valid.
 *
 * v102.0.4: replaced hand-rolled hex/rgba regex parser with culori.
 * Verified against independent reference table (6 theme pairs, ±0.005).
 */

import { wcagContrast as culoriWcagContrast } from "culori";

export type WCAGLevel = "AAA" | "AA" | "fail";

export interface WCAGResult {
  ratio: number;
  level: WCAGLevel;
}

function classifyLevel(ratio: number, largeText: boolean): WCAGLevel {
  if (largeText) {
    if (ratio >= 4.5) return "AAA";
    if (ratio >= 3.0) return "AA";
    return "fail";
  }
  if (ratio >= 7.0) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "fail";
}

export function computeContrastRatio(fg: string, bg: string): number {
  const ratio = culoriWcagContrast(fg, bg);
  if (isNaN(ratio)) {
    throw new Error(`wcagContrast: could not compute ratio for fg="${fg}" bg="${bg}". Check that both are valid CSS color strings.`);
  }
  return ratio;
}

export function computeWCAGResult(
  fg: string,
  bg: string,
  opts?: { largeText?: boolean },
): WCAGResult {
  const ratio = computeContrastRatio(fg, bg);
  const level = classifyLevel(ratio, opts?.largeText ?? false);
  return { ratio, level };
}
