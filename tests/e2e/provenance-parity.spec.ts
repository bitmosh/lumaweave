// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";

test("provenance manifest contains entry for every active themeTargetRegistry target", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const result = await page.evaluate(() => {
    const registry = (window as any).__lwThemeTargetRegistry;
    const provenance = (window as any).__lwProvenanceRegistry;
    const activeTargets = registry.targets.filter(
      (t: any) => t.status === "active",
    );
    const missing = activeTargets.filter(
      (t: any) => !provenance.getProvenance(t.themeTargetId),
    );
    return {
      activeCount: activeTargets.length,
      missingCount: missing.length,
      missingIds: missing.map((t: any) => t.themeTargetId),
    };
  });

  if (result.missingCount > 0) {
    console.warn(`Provenance missing for: ${result.missingIds.join(", ")}`);
  }

  expect(result.missingCount).toBe(0);
});
