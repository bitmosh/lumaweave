import { test, expect } from "@playwright/test";

test.describe("v86d.5 IDE spoke with provenance", () => {
  test("IDE tab shows snippet for targets with provenance", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const target = page.locator('[data-lw-theme-target="topbar.root"]');
    await target.click({ modifiers: ["Alt", "Shift"] });
    await page.locator('[data-spoke-id="ide"]').click();

    await expect(page.locator('[data-testid="snippet"]')).toBeVisible();
    const snippetText = await page.locator('[data-testid="snippet"]').textContent();
    expect(snippetText).toContain("topbar.root");
  });

  test("IDE tab snippet contains valid code (not empty)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const target = page.locator('[data-lw-theme-target="topbar.root"]');
    await target.click({ modifiers: ["Alt", "Shift"] });
    await page.locator('[data-spoke-id="ide"]').click();

    const snippetText = await page.locator('[data-testid="snippet"]').textContent();
    expect(snippetText?.length).toBeGreaterThan(20);
  });

  test("Open in editor button dispatches inspector:open-in-ide event", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.evaluate(() => {
      (window as any).__capturedIdeEvent = null;
      window.addEventListener("inspector:open-in-ide", (e: any) => {
        (window as any).__capturedIdeEvent = e.detail;
      });
    });

    const target = page.locator('[data-lw-theme-target="topbar.root"]');
    await target.click({ modifiers: ["Alt", "Shift"] });
    await page.locator('[data-spoke-id="ide"]').click();
    await page.locator('[data-testid="open-in-ide-button"]').click();

    const captured = await page.evaluate(() => (window as any).__capturedIdeEvent);
    expect(captured).toBeTruthy();
    expect(captured.filePath).toBeTruthy();
    expect(typeof captured.lineNumber).toBe("number");
  });
});
