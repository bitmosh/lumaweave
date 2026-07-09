// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";

test.describe("v88a Theme Hash", () => {
  test("hash produces 64-char hex string", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const hash = await page.evaluate(async () => {
      const probe = (window as any).__lwThemeHash;
      return await probe.computeThemeHash({
        primitives: { color: { void: { 900: "#000000" } } },
      });
    });
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  test("identical content produces identical hash", async ({ page }) => {
    await page.goto("/");
    const result = await page.evaluate(async () => {
      const probe = (window as any).__lwThemeHash;
      const a = await probe.computeThemeHash({ primitives: { color: { void: { 900: "#000000" } } } });
      const b = await probe.computeThemeHash({ primitives: { color: { void: { 900: "#000000" } } } });
      return { a, b, equal: a === b };
    });
    expect(result.equal).toBe(true);
  });

  test("different content produces different hash", async ({ page }) => {
    await page.goto("/");
    const result = await page.evaluate(async () => {
      const probe = (window as any).__lwThemeHash;
      const a = await probe.computeThemeHash({ primitives: { color: { void: { 900: "#000000" } } } });
      const b = await probe.computeThemeHash({ primitives: { color: { void: { 900: "#000001" } } } });
      return { equal: a === b };
    });
    expect(result.equal).toBe(false);
  });
});
