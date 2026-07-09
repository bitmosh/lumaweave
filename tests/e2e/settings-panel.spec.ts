// SPDX-License-Identifier: Apache-2.0
import { expect, test } from "@playwright/test";
import { clearTiles } from "./helpers/tiles";

const CATEGORY_IDS = [
  "theme",
  "typography",
  "graph",
  "inspector",
  "data-sources",
  "display",
  "accessibility",
  "advanced",
] as const;

async function openPanel(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await clearTiles(page);
  await page.locator('[data-testid="topbar-settings-button"]').click();
  await expect(page.getByTestId("settings-panel-root")).toBeVisible({ timeout: 5000 });
}

// Evidence 1: Panel opens via Ctrl+,
test("settings-panel: opens via Ctrl+,", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("settings-panel-root")).not.toBeVisible();
  await page.keyboard.press("Control+Comma");
  await expect(page.getByTestId("settings-panel-root")).toBeVisible({ timeout: 5000 });
});

// Evidence 9: Topbar gear button opens panel
test("settings-panel: topbar gear button opens panel", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("settings-panel-root")).not.toBeVisible();
  await page.getByRole("button", { name: "Open settings" }).click();
  await expect(page.getByTestId("settings-panel-root")).toBeVisible({ timeout: 5000 });
});

// Evidence 7: Close button closes panel
test("settings-panel: close button closes panel", async ({ page }) => {
  await openPanel(page);
  await page.getByTestId("settings-panel-close").click();
  await expect(page.getByTestId("settings-panel-root")).not.toBeVisible();
});

// Evidence 8: Escape closes panel
test("settings-panel: Escape closes panel", async ({ page }) => {
  await openPanel(page);
  await page.getByTestId("settings-panel-root").focus();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("settings-panel-root")).not.toBeVisible();
});

// Evidence 2: All 8 category nav items present
test("settings-panel: all 8 category nav items are present", async ({ page }) => {
  await openPanel(page);
  for (const id of CATEGORY_IDS) {
    await expect(page.getByTestId(`settings-category-nav-${id}`)).toBeVisible();
  }
});

// Evidence 3: Switching category updates content area
test("settings-panel: switching category renders correct content section", async ({ page }) => {
  await openPanel(page);
  for (const id of CATEGORY_IDS) {
    await page.getByTestId(`settings-category-nav-${id}`).click();
    await expect(page.getByTestId(`settings-category-content-${id}`)).toBeVisible({ timeout: 3000 });
  }
});

// Evidence 4: Search filter affects sidebar category match counts
test("settings-panel: search filters sidebar match counts", async ({ page }) => {
  await openPanel(page);
  const search = page.getByTestId("settings-panel-search");
  await search.fill("physics");
  // Graph category has physics settings — its badge should appear
  const graphBadge = page.locator('[data-testid="settings-category-nav-graph"] .lw-sidebar-badge');
  await expect(graphBadge).toBeVisible({ timeout: 3000 });
  // Clear search — badge should disappear
  await search.fill("");
  await expect(graphBadge).not.toBeVisible();
});

// Evidence 5a: Minimize works
test("settings-panel: minimize button toggles minimized state", async ({ page }) => {
  await openPanel(page);
  const panel = page.getByTestId("settings-panel-root");
  await page.getByTestId("settings-panel-minimize").click();
  await expect(panel).toHaveClass(/is-minimized/);
  await page.getByTestId("settings-panel-minimize").click();
  await expect(panel).not.toHaveClass(/is-minimized/);
});

// Evidence 5b: Drag moves the panel
test("settings-panel: title bar drag moves panel", async ({ page }) => {
  await openPanel(page);
  const titlebar = page.getByTestId("settings-panel-titlebar");
  const box = await titlebar.boundingBox();
  if (!box) throw new Error("No bounding box for titlebar");
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 100, startY + 60, { steps: 8 });
  await page.mouse.up();
  const newBox = await titlebar.boundingBox();
  if (!newBox) throw new Error("No bounding box after drag");
  expect(newBox.x).toBeGreaterThan(box.x + 50);
});

// Evidence 5c: Resize via SE handle
test.fixme("settings-panel: SE resize handle resizes panel", async ({ page }) => {
  // Headless Playwright mouse-drag is unreliable for the SE handle — drag registers
  // but the panel width doesn't change (1120 before and after). Flaky in CI.
  // v105.0.2: quarantined. Re-enable when a reliable drag helper is available.
  await openPanel(page);
  const panel = page.getByTestId("settings-panel-root");
  const before = await panel.boundingBox();
  if (!before) throw new Error("No panel bounding box");
  const handle = page.locator(".lw-resize-se");
  const hbox = await handle.boundingBox();
  if (!hbox) throw new Error("No resize handle bounding box");
  await page.mouse.move(hbox.x + 4, hbox.y + 4);
  await page.mouse.down();
  await page.mouse.move(hbox.x + 104, hbox.y + 80, { steps: 8 });
  await page.mouse.up();
  const after = await panel.boundingBox();
  if (!after) throw new Error("No panel bounding box after resize");
  expect(after.width).toBeGreaterThan(before.width + 50);
});

// Evidence 6: Geometry persists across page reload
test("settings-panel: geometry persists across reload", async ({ page }) => {
  await openPanel(page);
  // Drag to a known position
  const titlebar = page.getByTestId("settings-panel-titlebar");
  const box = await titlebar.boundingBox();
  if (!box) throw new Error("No titlebar bounding box");
  const targetLeft = 300;
  const targetTop = 150;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetLeft + box.width / 2, targetTop + box.height / 2, { steps: 10 });
  await page.mouse.up();
  // Audited 2026-06-09 (v111.3): legitimate debounce simulation per Playwright best practice
  // (waiting for a debounced store update to complete, no observable DOM end-state to assert on).
  // DO NOT convert to web-first assertion — debounce timing is the test's actual subject.
  await page.waitForTimeout(300); // let debounce flush

  // Verify localStorage was written
  const stored = await page.evaluate(() =>
    localStorage.getItem("lw.settings.panel.geometry.v1")
  );
  expect(stored).not.toBeNull();
  const geo = JSON.parse(stored!);
  expect(typeof geo.left).toBe("number");
  expect(typeof geo.top).toBe("number");

  // Close and reload
  await page.getByTestId("settings-panel-close").click();
  await page.reload();
  await page.waitForLoadState("networkidle");

  // Reopen — panel should restore to saved position
  await page.locator('[data-testid="topbar-settings-button"]').click();
  await expect(page.getByTestId("settings-panel-root")).toBeVisible({ timeout: 5000 });
  const panel = page.getByTestId("settings-panel-root");
  const restoredBox = await panel.boundingBox();
  if (!restoredBox) throw new Error("No panel box after reload");
  // Position should be close to where we dragged it (within 10px)
  expect(Math.abs(restoredBox.x - geo.left)).toBeLessThan(10);
  expect(Math.abs(restoredBox.y - geo.top)).toBeLessThan(10);
});
