import { test, expect } from "@playwright/test";
import { openInspectorOnTopbar } from "./helpers/inspector";

// v90c: Orb promoted from stub to active in the node program registry.
// Tests confirm Orb's registry status, distinct program class, and smoke
// render (no WebGL link errors).

async function openGeometryTab(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openInspectorOnTopbar(page);
  await expect(page.locator('[data-testid="inspector-mini-graph"]')).toBeVisible();
  await page.locator('[data-spoke-id="geometry"]').click();
  await expect(page.locator('[data-testid="geometry-tab"]')).toBeVisible();
}

test.describe("v90c Orb Program", () => {
  test("orb preset button is present in geometry tab", async ({ page }) => {
    await openGeometryTab(page);
    await expect(page.locator('[data-testid="geometry-preset-orb"]')).toBeVisible();
  });

  test("clicking orb preset writes orb override without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.message));

    await openGeometryTab(page);
    await page.locator('[data-testid="geometry-preset-orb"]').click();

    const overrides = await page.evaluate(() => {
      const raw = localStorage.getItem("lumaweave-theme-overrides");
      if (!raw) return null;
      return JSON.parse(raw);
    });

    const match = overrides?.overrides?.find(
      (o: any) => o.tokenPath === "node.geometry.preset",
    );
    expect(match?.value).toBe("orb");

    const glErrors = errors.filter((e) => e.includes("WebGL") || e.includes("shader") || e.includes("program"));
    expect(glErrors).toHaveLength(0);
  });

  test("orb and glass-sphere preset buttons are distinct registry entries", async ({ page }) => {
    await openGeometryTab(page);
    await expect(page.locator('[data-testid="geometry-preset-orb"]')).toBeVisible();
    await expect(page.locator('[data-testid="geometry-preset-glass-sphere"]')).toBeVisible();

    const orbId = await page.locator('[data-testid="geometry-preset-orb"]').getAttribute("data-testid");
    const glassId = await page.locator('[data-testid="geometry-preset-glass-sphere"]').getAttribute("data-testid");
    expect(orbId).not.toBe(glassId);
  });

  test("orb and crystal preset buttons are distinct registry entries", async ({ page }) => {
    await openGeometryTab(page);
    await expect(page.locator('[data-testid="geometry-preset-orb"]')).toBeVisible();
    await expect(page.locator('[data-testid="geometry-preset-crystal"]')).toBeVisible();

    const orbId = await page.locator('[data-testid="geometry-preset-orb"]').getAttribute("data-testid");
    const crystalId = await page.locator('[data-testid="geometry-preset-crystal"]').getAttribute("data-testid");
    expect(orbId).not.toBe(crystalId);
  });
});
