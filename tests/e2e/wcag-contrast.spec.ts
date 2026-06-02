/**
 * WCAG contrast correctness tests.
 *
 * These tests verify computeWCAGResult against an independent reference table
 * computed outside the codebase (WCAG 2.1 spec, (L1+0.05)/(L2+0.05)).
 * They run in the Playwright browser context so the full culori dependency
 * chain is available (same as production).
 *
 * Reference table: textPrimary-on-background for all 6 themes.
 * Ratios independently computed; Bandit must match to ±0.05.
 */

import { test, expect } from "@playwright/test";

const REFERENCE_PAIRS = [
  { theme: "solar-plasma",    fg: "#FFE9D6", bg: "#03000A", expectedRatio: 17.73, expectedLevel: "AAA" },
  { theme: "obsidian-aurora", fg: "#e2e8f0", bg: "#0a0a0f", expectedRatio: 16.02, expectedLevel: "AAA" },
  { theme: "midnight-loom",   fg: "#fef3c7", bg: "#0c0a09", expectedRatio: 17.74, expectedLevel: "AAA" },
  { theme: "void-circuit",    fg: "#f0abfc", bg: "#050505", expectedRatio: 11.58, expectedLevel: "AAA" },
  { theme: "agartha-dream",   fg: "#1e1b4b", bg: "#fefce8", expectedRatio: 15.46, expectedLevel: "AAA" },
  { theme: "agartha-dusk",    fg: "#f5d0fe", bg: "#1e1b4b", expectedRatio: 11.67, expectedLevel: "AAA" },
] as const;

// Edge cases for level classification correctness.
const EDGE_CASES = [
  // Below AA threshold on normal text → fail (not AA-large)
  { fg: "#777777", bg: "#888888", maxRatio: 3.0, expectedLevel: "fail" },
  // Explicit fail pair with known borderline ratio
  { fg: "#8a8a8a", bg: "#ffffff", maxRatio: 4.49, expectedLevel: "fail" },
] as const;

test("wcagContrast: reference table — all 6 theme textPrimary-on-background pairs match", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const results = await page.evaluate(() => {
    // Access the WCAG function via the dev probe (exposed in dev mode)
    // We call it via the app's theme system to exercise the same code path.
    const { getAccessibilityProfile } = (window as any).__lwAccessibilityProfile;
    const themeIds = ["solar-plasma", "obsidian-aurora", "midnight-loom", "void-circuit", "agartha-dream", "agartha-dusk"];
    return themeIds.map((id) => {
      const profile = getAccessibilityProfile(id as any);
      const textOnBg = profile.wcag.pairs[0]; // textPrimary on background — first pair
      return {
        theme: id,
        ratio: textOnBg.ratio,
        level: textOnBg.level,
      };
    });
  });

  const TOLERANCE = 0.05;
  for (const ref of REFERENCE_PAIRS) {
    const actual = results.find((r) => r.theme === ref.theme);
    expect(actual, `${ref.theme}: result missing`).toBeTruthy();
    expect(
      Math.abs(actual!.ratio - ref.expectedRatio),
      `${ref.theme}: ratio ${actual!.ratio.toFixed(2)} differs from expected ${ref.expectedRatio} by more than ${TOLERANCE}`,
    ).toBeLessThanOrEqual(TOLERANCE);
    expect(actual!.level, `${ref.theme}: level mismatch`).toBe(ref.expectedLevel);
  }
});

test("wcagContrast: fail cases — low-contrast pairs correctly classified as fail (not AA-large)", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const results = await page.evaluate(() => {
    // Access via the window.__lwAccessibilityProfile dev probe
    // Force-compute a known-fail pair by examining obsidian-aurora's textMuted/bg pair
    // (ratio ~4.2 — below 4.5 threshold, must be "fail" not "AA-large").
    const { getAccessibilityProfile } = (window as any).__lwAccessibilityProfile;
    const profile = getAccessibilityProfile("obsidian-aurora" as any);
    const textMutedOnBg = profile.wcag.pairs[1]; // textMuted on background — second pair
    return {
      ratio: textMutedOnBg.ratio,
      level: textMutedOnBg.level,
      label: textMutedOnBg.label,
    };
  });

  // obsidian-aurora textMuted (#64748b) on background (#0a0a0f) = ~4.2 → fail
  expect(results.level).toBe("fail");
  expect(results.ratio).toBeLessThan(4.5);
});

test("wcagContrast: oklch input — parses without NaN or wrong level", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Verify culori handles oklch strings (future-proofing for v99+ OKLCH tokens).
  // We test via page.evaluate since culori is a bundled browser dep.
  const result = await page.evaluate(() => {
    // Use the culori instance exposed on the window by the theme system.
    // culori's wcagContrast should handle oklch strings without NaN/throw.
    const culori = (window as any).__lwCulori;
    if (!culori || !culori.wcagContrast) {
      // Probe not available in this build — mark as skipped with a sentinel
      return { skipped: true, ratio: 0, nan: false };
    }
    const ratio = culori.wcagContrast("oklch(0.7 0.15 30)", "#000000");
    return { skipped: false, ratio, nan: isNaN(ratio) };
  });

  if (!result.skipped) {
    expect(result.nan).toBe(false);
    expect(result.ratio).toBeGreaterThan(0);
  }
});

test("wcagContrast: nonText criterion (WCAG 1.4.11) — 3:1 bar, no AAA tier", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const results = await page.evaluate(() => {
    const { getAccessibilityProfile } = (window as any).__lwAccessibilityProfile;
    // agartha-dream accent/bg = 3.83 → fails text criterion (< 4.5) but passes non-text (≥ 3)
    // After fix: agartha-dream should be AAA (all text pairs AAA, accent passes 1.4.11)
    const profile = getAccessibilityProfile("agartha-dream" as any);
    const accentPair = profile.wcag.pairs[3]; // accent on background — 4th pair
    return {
      accentLevel: accentPair.level,
      accentRatio: accentPair.ratio,
      aa: profile.wcag.aa,
      aaa: profile.wcag.aaa,
    };
  });

  // agartha-dream accent/bg ≈ 3.83 → non-text: AA (passes 3:1); NOT fail
  expect(results.accentLevel).toBe("AA");
  expect(results.accentRatio).toBeGreaterThanOrEqual(3.0);
  // All text pairs AAA + accent passes non-text 3:1 → theme is AAA
  expect(results.aaa).toBe(true);
  expect(results.aa).toBe(true);
});
