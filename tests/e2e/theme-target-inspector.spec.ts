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

  test("Mission Control toggle keeps UI Inspector state in sync", async ({ page }) => {
    await page.goto("/");
    await openQaPanel(page);
    await openDebugTab(page);

    const debugToggleState = page.getByTestId("theme-inspector-toggle-state");
    const controlButton = page.getByTestId("theme-inspector-toggle-button");
    const hudIndicator = page.getByTestId(OVERLAY_TOGGLE);

    await expect(debugToggleState).toContainText("OFF");
    await expect(hudIndicator).toContainText("OFF");

    await controlButton.click();
    await expect(debugToggleState).toContainText("ON");
    await expect(hudIndicator).toContainText("ON");

    const missionControlPanel = page.locator('[data-lw-theme-target="mission-control.panel"]').first();
    await missionControlPanel.hover();
    await expect(page.getByTestId("theme-target-inspector-panel")).toBeVisible();

    await controlButton.click();
    await expect(debugToggleState).toContainText("OFF");
    await expect(page.getByTestId("theme-target-inspector-panel")).toHaveCount(0);
    await expect(hudIndicator).toContainText("OFF");
  });

  test("ghost overlay appears only when inspector is enabled", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("theme-target-ghost-layer")).toHaveCount(0);

    await page.keyboard.press("Alt+Shift+I");
    const ghostLayer = page.getByTestId("theme-target-ghost-layer");
    await expect(ghostLayer).toBeVisible();
    const outlineCount = await page.getByTestId("theme-target-ghost-outline").count();
    expect(outlineCount).toBeGreaterThan(0);

    const outlineLabels = await page
      .locator('[data-testid="theme-target-ghost-outline"] span')
      .allTextContents();
    expect(outlineLabels).toContain("mission-control.panel");

    await page.keyboard.press("Alt+Shift+I");
    await expect(page.getByTestId("theme-target-ghost-layer")).toHaveCount(0);
  });

  test("ghost overlay keeps Mission Control interactive", async ({ page }) => {
    await page.goto("/");
    await openQaPanel(page);
    await openDebugTab(page);

    const controlButton = page.getByTestId("theme-inspector-toggle-button");
    await controlButton.click();
    const ghostLayer = page.getByTestId("theme-target-ghost-layer");
    await expect(ghostLayer).toBeVisible();
    const pointerEvents = await ghostLayer.evaluate((element) => window.getComputedStyle(element).pointerEvents);
    expect(pointerEvents).toBe("none");

    await page.getByTestId("qa-tab-checklist").click();
    await expect(page.getByTestId("qa-question-counter")).toBeVisible();

    await openDebugTab(page);
    await controlButton.click();
    await expect(page.getByTestId("theme-target-ghost-layer")).toHaveCount(0);
  });

  test("ghost overlay toggles via hotkey", async ({ page }) => {
    await page.goto("/");

    await page.keyboard.press("Alt+Shift+I");
    await expect(page.getByTestId("theme-target-ghost-layer")).toBeVisible();

    await page.keyboard.press("Alt+Shift+I");
    await expect(page.getByTestId("theme-target-ghost-layer")).toHaveCount(0);
  });
});
