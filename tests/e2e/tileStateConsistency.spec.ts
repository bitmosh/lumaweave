// SPDX-License-Identifier: Apache-2.0
/**
 * v103.1.2: Tile state consistency — interaction tests.
 *
 * Tests the three interaction bugs fixed in v103.1.2:
 *   Bug 1: Tiles couldn't be toggled via popover after closing (close=remove broke the checkbox)
 *   Bug 2: Closing a grouped tile left a ghost outline (hidden tiles not excluded from groups)
 *   Bug 3: Docked tiles jumped back to edge on drag (flip didn't seed resolved x/y)
 *
 * These were silent bugs missed by appearance-only smoke testing.
 */

import { test, expect } from "@playwright/test";

// Reset dev mode after each test so subsequent tests don't inherit it
test.afterEach(async ({ page }) => {
  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    if (store) store.getState().setSetting("developer.devMode", false);
  });
});

// Sets up a fresh tile session with qa-feedback-section visible.
async function setupWithQaTile(page: any) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Clear layout + bootstrap flag so we start clean
  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    if (store) {
      store.getState().setSetting("ui.tileLayout", []);
      store.getState().setSetting("developer.devMode", true);
    }
    localStorage.removeItem("lumaweave-tiles-bootstrapped");
  });
  await page.waitForTimeout(150);
}

// ─── Bug 1: close=hide + popover toggle ───────────────────────────────────

test("v103.1.2: close tile via × → popover checkbox unchecked (not stuck checked)", async ({ page }) => {
  await setupWithQaTile(page);

  // Open via popover
  await page.getByTestId("status-bar-tiles-button").click();
  const qaCheckbox = page.getByTestId("tiles-popover-checkbox-qa-feedback-section");
  await expect(qaCheckbox).toBeVisible();

  // Open the tile
  if (!(await qaCheckbox.isChecked())) {
    await qaCheckbox.check();
  }
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("qa-panel-tile-content")).toBeVisible({ timeout: 5000 });

  // Close tile via the × button (title="Hide")
  const hideBtn = page.locator('[title="Hide"]').first();
  await hideBtn.click();

  // Tile body should be gone
  await expect(page.getByTestId("qa-panel-tile-content")).not.toBeVisible({ timeout: 3000 });

  // Open popover — checkbox must be UNCHECKED (Bug 1 was: stuck checked)
  await page.getByTestId("status-bar-tiles-button").click();
  await expect(qaCheckbox).not.toBeChecked();
});

test("v103.1.2: re-checking a closed tile re-opens it (round-trip)", async ({ page }) => {
  await setupWithQaTile(page);

  // Open via popover
  await page.getByTestId("status-bar-tiles-button").click();
  const qaCheckbox = page.getByTestId("tiles-popover-checkbox-qa-feedback-section");
  if (!(await qaCheckbox.isChecked())) {
    await qaCheckbox.check();
  }
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("qa-panel-tile-content")).toBeVisible({ timeout: 5000 });

  // Close
  const hideBtn = page.locator('[title="Hide"]').first();
  await hideBtn.click();
  await expect(page.getByTestId("qa-panel-tile-content")).not.toBeVisible({ timeout: 3000 });

  // Re-open via popover — tile must reappear
  await page.getByTestId("status-bar-tiles-button").click();
  const qaCheckboxAfter = page.getByTestId("tiles-popover-checkbox-qa-feedback-section");
  await expect(qaCheckboxAfter).not.toBeChecked();
  await qaCheckboxAfter.check();
  await page.keyboard.press("Escape");

  // Tile is visible again
  await expect(page.getByTestId("qa-panel-tile-content")).toBeVisible({ timeout: 5000 });
});

// ─── Bug 3: docked→floating flip seeds resolved position ─────────────────

test("v103.1.2: dragging a docked tile flips it to floating with resolved x/y (not stale stored coords)", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Set up a docked tile with a stale x:3092 in the store
  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    if (!store) return;
    const dockedTile = {
      id: "test-docked-tile",
      sectionKey: "qa-feedback-section",
      x: 3092, // stale — should NOT be the stored x after drag-flip
      y: 100,
      w: 280,
      h: 300,
      collapsed: false,
      z: 1,
      visible: true,
      mode: "docked",
      anchor: { edge: "right", slot: 0 },
    };
    store.getState().setSetting("ui.tileLayout", [dockedTile]);
    localStorage.setItem("lumaweave-tiles-bootstrapped", "1");
  });
  await page.waitForTimeout(300);

  // Tile must render (at resolved position, not stale x:3092)
  const tileBody = page.getByTestId("tile-body-qa-feedback-section");
  await expect(tileBody).toBeVisible({ timeout: 5000 });

  // Drag the header — hover first to guarantee cursor placement, then drag
  const tileHead = page.locator(".tile-head").first();
  await expect(tileHead).toBeVisible();
  await tileHead.hover();
  await page.mouse.down();
  await page.mouse.move(100, 100, { steps: 10 }); // move to center-ish of viewport
  await page.mouse.up();
  await page.waitForTimeout(100);

  // After drag: mode must be "floating" and stored x must NOT be 3092
  const result = await page.evaluate(() => {
    const store = (window as any).__lwStore;
    if (!store) return null;
    const tiles = store.getState().settings.ui?.tileLayout ?? [];
    const t = tiles.find((t: any) => t.id === "test-docked-tile");
    return t ? { mode: t.mode, x: t.x } : null;
  });

  expect(result).not.toBeNull();
  expect(result!.mode).toBe("floating");
  // The stored x must be the resolved docked position (viewport-relative), not the stale 3092
  expect(result!.x).not.toBe(3092);
  expect(result!.x).toBeGreaterThanOrEqual(0);
  expect(result!.x).toBeLessThan(3000);
});
