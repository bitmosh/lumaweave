// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";
import { openInspectorOnTopbar } from "./helpers/inspector";

// v105.0.1: IDE spoke merged into Code spoke. Updated spoke-id + testids.
test.describe("v86d.5 Code spoke with provenance (was: IDE spoke)", () => {
  test("Code tab shows snippet for targets with provenance", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await openInspectorOnTopbar(page);
    await page.locator('[data-spoke-id="code"]').click();

    await expect(page.locator('[data-testid="snippet"]')).toBeVisible();
    const snippetText = await page.locator('[data-testid="snippet"]').textContent();
    expect(snippetText).toContain("topbar.root");
  });

  test("Code tab snippet contains valid code (not empty)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await openInspectorOnTopbar(page);
    await page.locator('[data-spoke-id="code"]').click();

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

    await openInspectorOnTopbar(page);
    await page.locator('[data-spoke-id="code"]').click();
    await page.locator('[data-testid="open-in-ide-button"]').click();

    const captured = await page.evaluate(() => (window as any).__capturedIdeEvent);
    expect(captured).toBeTruthy();
    expect(captured.filePath).toBeTruthy();
    expect(typeof captured.lineNumber).toBe("number");
  });
});
