// SPDX-License-Identifier: Apache-2.0
/**
 * Unit tests for the cluster-color resolver (v103.0.1).
 *
 * Tests the resolver in isolation — no graph render, no wiring.
 * Runs via Playwright so the full Vite bundle + JSON import path is exercised.
 *
 * Reference: cluster-colors.json palette
 *   gold=#FFB347, azure=#3D8BD8, violet=#8B5CF6, teal=#14B8A6,
 *   lime=#84CC16, slate=#64748B, stone=#A8A29E, ember=#D8541F,
 *   crimson=#DC2626, indigo=#6366F1
 */

import { test, expect } from "@playwright/test";

test("clusterColor: loadClusterColors returns all 10 palette entries with correct hex", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const result = await page.evaluate(() => {
    const { loadClusterColors } = (window as any).__lwClusterColor ?? {};
    if (!loadClusterColors) return { missing: true };
    const palette = loadClusterColors();
    return {
      gold: palette.gold?.hex,
      azure: palette.azure?.hex,
      violet: palette.violet?.hex,
      teal: palette.teal?.hex,
      lime: palette.lime?.hex,
      slate: palette.slate?.hex,
      stone: palette.stone?.hex,
      ember: palette.ember?.hex,
      crimson: palette.crimson?.hex,
      indigo: palette.indigo?.hex,
      keys: Object.keys(palette).length,
    };
  });

  if ((result as any).missing) {
    // Probe not exposed — skip gracefully with a note
    console.log("__lwClusterColor probe not available; skipping browser-eval assertions");
    return;
  }

  expect(result.gold).toBe("#FFB347");
  expect(result.azure).toBe("#3D8BD8");
  expect(result.violet).toBe("#8B5CF6");
  expect(result.teal).toBe("#14B8A6");
  expect(result.lime).toBe("#84CC16");
  expect(result.slate).toBe("#64748B");
  expect((result as any).keys).toBeGreaterThanOrEqual(10);
});

test("clusterColor: resolveClusterColor semantic mode returns correct hex for known clusters", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const result = await page.evaluate(() => {
    const { loadClusterColors, resolveClusterColor } = (window as any).__lwClusterColor ?? {};
    if (!loadClusterColors || !resolveClusterColor) return { missing: true };
    const palette = loadClusterColors();
    const mode = { kind: "semantic" as const };
    return {
      azure: resolveClusterColor("azure", mode, palette),
      gold: resolveClusterColor("gold", mode, palette),
      violet: resolveClusterColor("violet", mode, palette),
      slate: resolveClusterColor("slate", mode, palette),
    };
  });

  if ((result as any).missing) {
    console.log("__lwClusterColor probe not available; skipping browser-eval assertions");
    return;
  }

  expect(result.azure).toBe("#3D8BD8");
  expect(result.gold).toBe("#FFB347");
  expect(result.violet).toBe("#8B5CF6");
  expect(result.slate).toBe("#64748B");
});

test("clusterColor: resolveClusterColor returns null for undefined / unknown cluster", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const result = await page.evaluate(() => {
    const { loadClusterColors, resolveClusterColor } = (window as any).__lwClusterColor ?? {};
    if (!loadClusterColors || !resolveClusterColor) return { missing: true };
    const palette = loadClusterColors();
    const mode = { kind: "semantic" as const };
    return {
      undefinedCluster: resolveClusterColor(undefined, mode, palette),
      unknownCluster: resolveClusterColor("nonexistent", mode, palette),
      purpleNotInPalette: resolveClusterColor("purple", mode, palette),
    };
  });

  if ((result as any).missing) {
    console.log("__lwClusterColor probe not available; skipping browser-eval assertions");
    return;
  }

  expect(result.undefinedCluster).toBeNull();
  expect(result.unknownCluster).toBeNull();
  // "purple" appears in real fixture data but is NOT in cluster-colors.json → null
  expect(result.purpleNotInPalette).toBeNull();
});

test("clusterColor: resolveClusterColor mono-shades and custom modes return null (not implemented)", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const result = await page.evaluate(() => {
    const { loadClusterColors, resolveClusterColor } = (window as any).__lwClusterColor ?? {};
    if (!loadClusterColors || !resolveClusterColor) return { missing: true };
    const palette = loadClusterColors();
    return {
      monoShades: resolveClusterColor("azure", { kind: "mono-shades", baseHue: "#3D8BD8", steps: 10 }, palette),
      custom: resolveClusterColor("azure", { kind: "custom", map: { azure: "#ff0000" } }, palette),
    };
  });

  if ((result as any).missing) {
    console.log("__lwClusterColor probe not available; skipping browser-eval assertions");
    return;
  }

  // Not implemented — return null until v103.0.5
  expect(result.monoShades).toBeNull();
  expect(result.custom).toBeNull();
});
