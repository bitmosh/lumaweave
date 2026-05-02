import { test, expect } from "@playwright/test";
import { openQaPanel, openDebugTab } from "./helpers/qa";

const OVERLAY_TOGGLE = "theme-target-inspector-toggle-state";

test.describe("Theme Target Registry + Inspector Overlay", () => {
  test("debug tab shows Theme Target registry summary", async ({ page }) => {
    await page.goto("/");
    await openQaPanel(page);
    await openDebugTab(page);

    await expect(page.getByTestId("theme-target-summary")).toBeVisible();
    await expect(page.getByTestId("theme-target-summary-total")).toContainText(/\d+/);
    await expect(page.getByTestId("theme-target-summary-active")).toContainText(/\d+/);
    await expect(page.getByTestId("theme-target-surface-list")).toBeVisible();
  });

  test("data-lw-theme-target attributes exist on shell + mission control + graph", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator('[data-lw-theme-target="app.shell"]').first()).toBeVisible();
    await expect(page.locator('[data-lw-theme-target="topbar.root"]').first()).toBeVisible();
    await expect(page.locator('[data-lw-theme-target="mission-control.panel"]').first()).toBeVisible();
    await expect(page.locator('[data-lw-theme-target="graph.frame"]').first()).toBeVisible();
    await expect(page.locator('[data-lw-theme-target="settings.panel"]').first()).toBeVisible();
  });

  test("inspector overlay toggles via hotkey and shows metadata", async ({ page }) => {
    await page.goto("/");

    const toggleIndicator = page.getByTestId(OVERLAY_TOGGLE);
    await expect(toggleIndicator).toContainText("OFF");

    await page.keyboard.press("Alt+Shift+I");
    await expect(toggleIndicator).toContainText("ON");

    const missionControlPanel = page.locator('[data-lw-theme-target="mission-control.panel"]').first();
    await missionControlPanel.hover();

    const panel = page.getByTestId("theme-target-inspector-panel");
    await expect(panel).toBeVisible();
    await expect(panel).toContainText("mission-control.panel");
    await expect(panel).toContainText("Token Bindings");

    const tooltip = page.getByTestId("theme-target-inspector-tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText("mission-control.panel");

    // Toggle off to ensure overlay hides cleanly
    await page.keyboard.press("Alt+Shift+I");
    await expect(toggleIndicator).toContainText("OFF");
    await expect(page.getByTestId("theme-target-inspector-panel")).toHaveCount(0);
    await expect(page.getByTestId("theme-target-inspector-tooltip")).toHaveCount(0);
  });

  test("overlay can toggle off even if focus is inside Mission Control note", async ({ page }) => {
    await page.goto("/");
    const toggleIndicator = page.getByTestId(OVERLAY_TOGGLE);
    await expect(toggleIndicator).toContainText("OFF");
    await page.keyboard.press("Alt+Shift+I");
    await expect(toggleIndicator).toContainText("ON");

    const missionControlPanel = page.locator('[data-lw-theme-target="mission-control.panel"]').first();
    await missionControlPanel.hover();
    await expect(page.getByTestId("theme-target-inspector-panel")).toBeVisible();

    const qaNoteInput = page.locator('[data-testid="qa-note-input"]');
    if (await qaNoteInput.count()) {
      await qaNoteInput.first().click();
      await qaNoteInput.first().fill("focus test");
    }

    await page.keyboard.press("Alt+Shift+I");
    await expect(toggleIndicator).toContainText("OFF");
    await expect(page.getByTestId("theme-target-inspector-panel")).toHaveCount(0);
    await expect(page.getByTestId("theme-target-inspector-tooltip")).toHaveCount(0);
  });

  test("fixed metadata panel collapses when cursor leaves registered targets", async ({ page }) => {
    await page.goto("/");
    const toggleIndicator = page.getByTestId(OVERLAY_TOGGLE);
    await expect(toggleIndicator).toContainText("OFF");
    await page.keyboard.press("Alt+Shift+I");
    await expect(toggleIndicator).toContainText("ON");

    const missionControlPanel = page.locator('[data-lw-theme-target="mission-control.panel"]').first();
    await missionControlPanel.hover();
    await expect(page.getByTestId("theme-target-inspector-panel")).toBeVisible();

    await page.locator("body").hover();
    await page.evaluate(() => {
      document.body.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
    });
    await expect(page.getByTestId("theme-target-inspector-panel")).toHaveCount(0);
    await expect(page.getByTestId("theme-target-inspector-tooltip")).toHaveCount(0);
  });

  test("UI Inspector panel stays inside graph viewport lower-right", async ({ page }) => {
    await page.goto("/");

    const toggleIndicator = page.getByTestId(OVERLAY_TOGGLE);
    await expect(toggleIndicator).toContainText("OFF");
    await page.keyboard.press("Alt+Shift+I");
    await expect(toggleIndicator).toContainText("ON");

    const missionControlPanel = page.locator('[data-lw-theme-target="mission-control.panel"]').first();
    await missionControlPanel.hover();
    const panel = page.getByTestId("theme-target-inspector-panel");
    await expect(panel).toBeVisible();

    const panelBox = await panel.boundingBox();
    const graphBox = await page.getByTestId("graph-viewport").boundingBox();

    expect(panelBox).not.toBeNull();
    expect(graphBox).not.toBeNull();

    if (!panelBox || !graphBox) {
      throw new Error("Failed to measure UI Inspector panel or graph viewport");
    }

    expect(panelBox.x).toBeGreaterThanOrEqual(graphBox.x - 1);
    expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(graphBox.x + graphBox.width + 1);

    const rightGap = graphBox.x + graphBox.width - (panelBox.x + panelBox.width);
    expect(rightGap).toBeGreaterThanOrEqual(0);
    expect(rightGap).toBeLessThanOrEqual(48);

    expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(graphBox.y + graphBox.height + 1);
  });
});
