import { test, expect, Page } from "@playwright/test";
import { openQaPanel, openDebugTab } from "./helpers/qa";
import type { ThemeTargetProbeResult } from "../../src/themes/themeTargetHeuristics";

const OVERLAY_TOGGLE = "theme-target-inspector-toggle-state";

type ProbeWindow = Window & {
  __lwRunThemeTargetProbe?: (options?: { minSignals?: number }) => ThemeTargetProbeResult | null;
};

const runRuntimeProbe = async (
  page: Page,
  options?: { minSignals?: number },
): Promise<ThemeTargetProbeResult | null> =>
  page.evaluate((opts) => (window as ProbeWindow).__lwRunThemeTargetProbe?.(opts) ?? null, options);

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

    await page.click("body");
    await page.keyboard.press("Alt+Shift+I");
    await expect(page.getByTestId("theme-target-ghost-layer")).toBeVisible();

    await page.keyboard.press("Alt+Shift+I");
    await expect(page.getByTestId("theme-target-ghost-layer")).toHaveCount(0);
  });

  test("runtime probe helper is registered globally", async ({ page }) => {
    await page.goto("/");
    const result = await runRuntimeProbe(page);
    expect(result).not.toBeNull();
    expect(result?.totalElementsAnalyzed).toBeGreaterThan(0);
  });

  test("registered surfaces are not reported as missing", async ({ page }) => {
    await page.goto("/");
    const result = await runRuntimeProbe(page);
    expect(result).not.toBeNull();
    const descriptors = [
      ...(result?.candidates ?? []),
      ...(result?.unknown ?? []),
    ].map((candidate) => candidate.descriptor).join(" ");
    expect(descriptors).not.toContain("qa-panel");
    expect(descriptors).not.toContain("settings-panel");
    expect(descriptors).not.toContain("graph.frame");
  });

  test("never-warn categories remain excluded from runtime probe", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const ids = [
        "probe-never-warn-button",
        "probe-never-warn-label",
        "probe-layout-shim",
        "probe-handle-control",
      ];
      ids.forEach((id) => document.getElementById(id)?.remove());

      const button = document.createElement("button");
      button.id = "probe-never-warn-button";
      button.setAttribute("data-testid", "probe-never-warn-button");
      button.textContent = "Should stay excluded";

      const label = document.createElement("label");
      label.id = "probe-never-warn-label";
      label.htmlFor = button.id;
      label.textContent = "Never-warn label";

      const layoutShim = document.createElement("div");
      layoutShim.id = "probe-layout-shim";
      layoutShim.className = "lw-control-grid";
      layoutShim.setAttribute("data-testid", "probe-layout-shim");

      const handleControl = document.createElement("div");
      handleControl.id = "probe-handle-control";
      handleControl.setAttribute("data-handle-id", "probe-handle");
      handleControl.textContent = "Handle control";

      document.body.appendChild(button);
      document.body.appendChild(label);
      document.body.appendChild(layoutShim);
      document.body.appendChild(handleControl);
    });

    const result = await runRuntimeProbe(page);
    expect(result).not.toBeNull();
    const entries = [
      ...(result?.candidates ?? []),
      ...(result?.unknown ?? []),
    ];
    const descriptors = entries.map((entry) => entry.descriptor).join(" ");
    const dataTestIds = entries.map((entry) => entry.dataTestId ?? "").join(" ");

    expect(dataTestIds).not.toContain("theme-inspector-toggle-button");
    expect(dataTestIds).not.toContain("qa-tab-checklist");
    expect(dataTestIds).not.toContain("qa-tab-advisory");
    expect(dataTestIds).not.toContain("probe-never-warn-button");
    expect(descriptors).not.toContain("button#probe-never-warn-button");
    expect(descriptors).not.toContain("label#probe-never-warn-label");
    expect(descriptors).not.toContain("#probe-handle-control");
    expect(descriptors).not.toContain("#probe-layout-shim");
    expect(descriptors).not.toContain("lw-control-grid");

    await page.evaluate(() => {
      [
        "probe-never-warn-button",
        "probe-never-warn-label",
        "probe-layout-shim",
        "probe-handle-control",
      ].forEach((id) => document.getElementById(id)?.remove());
    });
  });

  test("ghost overlay DOM remains excluded even when inspector is on", async ({ page }) => {
    await page.goto("/");
    await page.click("body");
    await page.keyboard.press("Alt+Shift+I");
    const ghostLayer = page.getByTestId("theme-target-ghost-layer");
    await expect(ghostLayer).toBeVisible();
    const ghostOutlines = page.getByTestId("theme-target-ghost-outline");
    expect(await ghostOutlines.count()).toBeGreaterThan(0);
    const missionControlPanel = page.locator('[data-lw-theme-target="mission-control.panel"]').first();
    await missionControlPanel.hover();
    await expect(page.getByTestId("theme-target-inspector-panel")).toBeVisible();
    const result = await runRuntimeProbe(page);
    expect(result).not.toBeNull();
    const allDescriptors = [
      ...(result?.candidates ?? []),
      ...(result?.unknown ?? []),
    ].map((candidate) => candidate.descriptor).join(" ");
    expect(allDescriptors).not.toContain("theme-target-ghost-layer");
    expect(allDescriptors).not.toContain("theme-target-ghost-outline");
    expect(allDescriptors).not.toContain("theme-target-inspector-panel");
  });

  test("graph viewport primitives remain excluded", async ({ page }) => {
    await page.goto("/");
    const result = await runRuntimeProbe(page);
    const entries = [
      ...(result?.candidates ?? []),
      ...(result?.unknown ?? []),
    ];
    const descriptors = entries.map((candidate) => candidate.descriptor).join(" ");
    const dataTestIds = entries.map((candidate) => candidate.dataTestId ?? "").join(" ");
    expect(descriptors).not.toContain("graph-viewport");
    expect(descriptors).not.toContain("canvas");
    expect(descriptors).not.toContain("graph.node");
    expect(descriptors).not.toContain("graph.edge");
    expect(dataTestIds).not.toContain("graph-viewport");
  });

  test("synthetic container requires >=3 signals to become candidate", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const existing = document.getElementById("probe-test-container");
      if (existing) {
        existing.remove();
      }
      const container = document.createElement("div");
      container.id = "probe-test-container";
      container.className = "lw-panel probe-test";
      container.setAttribute("data-testid", "mission-control-probe-candidate");
      Object.assign(container.style, {
        width: "420px",
        height: "220px",
        position: "absolute",
        top: "120px",
        left: "120px",
        zIndex: 1,
      });
      const buttonA = document.createElement("button");
      buttonA.textContent = "Action A";
      const buttonB = document.createElement("button");
      buttonB.textContent = "Action B";
      container.appendChild(buttonA);
      container.appendChild(buttonB);
      document.body.appendChild(container);
    });

    const result = await runRuntimeProbe(page);
    expect(result).not.toBeNull();
    const candidate = result?.candidates.find((entry) => entry.descriptor.includes("probe-test-container"));
    expect(candidate).toBeDefined();
    expect(candidate?.signals.length ?? 0).toBeGreaterThanOrEqual(3);

    await page.evaluate(() => {
      document.getElementById("probe-test-container")?.remove();
    });
  });

  test("insufficient signals return unknown/no warning", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const targetId = "probe-unknown-container";
      document.getElementById(targetId)?.remove();
      const element = document.createElement("div");
      element.id = targetId;
      element.setAttribute("data-testid", "mission-control-unknown-surface");
      element.style.width = "200px";
      element.style.height = "80px";
      document.body.appendChild(element);
    });

    const result = await runRuntimeProbe(page);
    const unknownEntry = result?.unknown.find((entry) => entry.descriptor.includes("probe-unknown-container"));
    expect(unknownEntry).toBeDefined();
    expect(unknownEntry?.status).toBe("unknown");

    await page.evaluate(() => {
      document.getElementById("probe-unknown-container")?.remove();
    });
  });

  test("runtime probe does not render warning badges", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const existing = document.getElementById("probe-warning-candidate");
      existing?.remove();
      const container = document.createElement("div");
      container.id = "probe-warning-candidate";
      container.className = "lw-panel probe-warning";
      container.setAttribute("data-testid", "mission-control-probe-warning");
      Object.assign(container.style, {
        width: "360px",
        height: "200px",
        position: "absolute",
        top: "160px",
        left: "160px",
      });
      const firstButton = document.createElement("button");
      firstButton.textContent = "Primary";
      const secondButton = document.createElement("button");
      secondButton.textContent = "Secondary";
      container.appendChild(firstButton);
      container.appendChild(secondButton);
      document.body.appendChild(container);
    });

    const result = await runRuntimeProbe(page);
    expect(result).not.toBeNull();
    expect(result?.candidates.length ?? 0).toBeGreaterThan(0);

    await page.keyboard.press("Alt+Shift+I");
    await expect(page.getByTestId("theme-target-warning-badge")).toHaveCount(0);
    await expect(page.locator('[data-testid="theme-target-warning-indicator"]')).toHaveCount(0);
    await page.keyboard.press("Alt+Shift+I");
    await expect(page.getByTestId("theme-target-warning-badge")).toHaveCount(0);

    await page.evaluate(() => {
      document.getElementById("probe-warning-candidate")?.remove();
    });
  });
});
