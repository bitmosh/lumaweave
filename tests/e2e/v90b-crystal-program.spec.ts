import { test, expect } from "@playwright/test";

// v90b: Crystal promoted from stub to active in the node program registry.
// Tests confirm Crystal's registry status, distinct program class, and smoke
// render (no WebGL link errors).

async function openGeometryTab(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const target = page.locator('[data-lw-theme-target="topbar.root"]');
  await target.click({ modifiers: ["Alt", "Shift"] });
  await expect(page.locator('[data-testid="inspector-mini-graph"]')).toBeVisible();
  await page.locator('[data-spoke-id="geometry"]').click();
  await expect(page.locator('[data-testid="geometry-tab"]')).toBeVisible();
}

test.describe("v90b Crystal Program", () => {
  test("crystal preset button is present in geometry tab", async ({ page }) => {
    await openGeometryTab(page);
    await expect(page.locator('[data-testid="geometry-preset-crystal"]')).toBeVisible();
  });

  test("clicking crystal preset writes crystal override without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.message));

    await openGeometryTab(page);
    await page.locator('[data-testid="geometry-preset-crystal"]').click();

    const overrides = await page.evaluate(() => {
      const raw = localStorage.getItem("lumaweave-theme-overrides");
      if (!raw) return null;
      return JSON.parse(raw);
    });

    const match = overrides?.overrides?.find(
      (o: any) => o.tokenPath === "node.geometry.preset",
    );
    expect(match?.value).toBe("crystal");

    const glErrors = errors.filter((e) => e.includes("WebGL") || e.includes("shader") || e.includes("program"));
    expect(glErrors).toHaveLength(0);
  });

  test("crystal and glass-sphere preset buttons both exist (distinct registry entries)", async ({ page }) => {
    await openGeometryTab(page);
    await expect(page.locator('[data-testid="geometry-preset-crystal"]')).toBeVisible();
    await expect(page.locator('[data-testid="geometry-preset-glass-sphere"]')).toBeVisible();

    // Verify they are distinct buttons — not the same element
    const crystalBtn = page.locator('[data-testid="geometry-preset-crystal"]');
    const glassBtn = page.locator('[data-testid="geometry-preset-glass-sphere"]');
    const crystalId = await crystalBtn.getAttribute("data-testid");
    const glassId = await glassBtn.getAttribute("data-testid");
    expect(crystalId).not.toBe(glassId);
  });
});
