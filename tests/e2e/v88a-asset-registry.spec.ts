import { test, expect } from "@playwright/test";

test.describe("v88a Asset Registry", () => {
  test("starts empty", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const count = await page.evaluate(() => {
      return (window as any).__lwAssetRegistry?.list().length ?? -1;
    });
    expect(count).toBe(0);
  });

  test("register adds entry", async ({ page }) => {
    await page.goto("/");
    const result = await page.evaluate(() => {
      const reg = (window as any).__lwAssetRegistry;
      reg.register({
        id: "test-asset-1",
        type: "texture",
        family: "solar-plasma",
        tags: ["test"],
        mediaUrl: "blob://test",
        sourceTheme: "solar-plasma",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return reg.list().length;
    });
    expect(result).toBe(1);
  });

  test("filterByCategory works for type", async ({ page }) => {
    await page.goto("/");
    const count = await page.evaluate(() => {
      const reg = (window as any).__lwAssetRegistry;
      reg.register({
        id: "test-asset-filter",
        type: "texture",
        family: "solar-plasma",
        tags: [],
        mediaUrl: "blob://test",
        sourceTheme: "solar-plasma",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return reg.filterByCategory({ type: "texture" }).length;
    });
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("validateShape rejects invalid entries", async ({ page }) => {
    await page.goto("/");
    const result = await page.evaluate(() => {
      const reg = (window as any).__lwAssetRegistry;
      const v = reg.validateShape({ id: "incomplete" });
      return { valid: v.valid, errorCount: v.errors?.length ?? 0 };
    });
    expect(result.valid).toBe(false);
    expect(result.errorCount).toBeGreaterThan(0);
  });
});
