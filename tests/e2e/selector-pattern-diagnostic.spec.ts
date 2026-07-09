// SPDX-License-Identifier: Apache-2.0
/**
 * vP-Forensics-1: Selector pattern diagnostic
 *
 * Diagnoses why the SIGMA_ELEMENT_SELECTOR pattern doesn't match.
 */

import { test, expect } from "@playwright/test";

test("SIGMA_ELEMENT_SELECTOR diagnostic", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("canvas");

  const diagnostic = await page.evaluate(() => {
    const viewport = document.querySelector('[data-testid="self-graph-fixture-loaded"],[data-testid="graph-viewport"]');
    if (!viewport) return { hasViewport: false };

    // Check viewport attributes
    const viewportAttrs = Array.from(viewport.attributes).map(attr => `${attr.name}="${attr.value}"`);

    // Create a test element with data-sigma-element
    const testCanvas = document.createElement("canvas");
    testCanvas.setAttribute("data-sigma-element", "test-node");
    viewport.appendChild(testCanvas);

    // Test different selector patterns
    const patterns = [
      "[data-testid='self-graph-fixture-loaded'] canvas",
      "[data-testid='self-graph-fixture-loaded'] svg",
      "[data-testid='self-graph-fixture-loaded'] [data-sigma-element]",
      "[data-testid=\"self-graph-fixture-loaded\"] canvas",
      "[data-testid=\"self-graph-fixture-loaded\"] svg",
      "[data-testid=\"self-graph-fixture-loaded\"] [data-sigma-element]",
    ];

    const results = patterns.map(pattern => ({
      pattern,
      matches: testCanvas.matches(pattern),
    }));

    // Check what the viewport actually is
    const viewportTag = viewport.tagName;
    const viewportId = viewport.id;
    const viewportClass = viewport.className;

    // Cleanup
    testCanvas.remove();

    return {
      hasViewport: true,
      viewportAttrs,
      viewportTag,
      viewportId,
      viewportClass,
      results,
    };
  });

  console.log("Diagnostic:", JSON.stringify(diagnostic, null, 2));
});
