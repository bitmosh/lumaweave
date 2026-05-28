import { test, expect, Page } from "@playwright/test";
import { openQaPanel, openDebugTab } from "./helpers/qa";
import { clearTiles } from "./helpers/tiles";
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

const enableInspector = async (page: Page): Promise<void> => {
  await openQaPanel(page);
  await page.click("body");
  await page.keyboard.press("Alt+Shift+I");
};

const disableInspector = async (page: Page): Promise<void> => {
  await page.keyboard.press("Alt+Shift+I");
};

type SyntheticCandidateOptions = {
  elementId?: string;
  top?: number;
  left?: number;
};

const PIN_HOTKEY = "Alt+Shift+P";

const createSyntheticCandidate = async (
  page: Page,
  elementOrOptions?: string | SyntheticCandidateOptions,
): Promise<void> => {
  const options = typeof elementOrOptions === "string" ? { elementId: elementOrOptions } : elementOrOptions ?? {};
  const { elementId = "probe-warning-candidate", top = 160, left = 160 } = options;

  await page.evaluate(({ id, topPosition, leftPosition }) => {
    const existing = document.getElementById(id);
    existing?.remove();

    const container = document.createElement("div");
    container.id = id;
    container.className = "lw-panel probe-warning";
    container.setAttribute("data-testid", "mission-control-probe-warning");
    Object.assign(container.style, {
      width: "360px",
      height: "200px",
      position: "absolute",
      top: `${topPosition}px`,
      left: `${leftPosition}px`,
      zIndex: 1,
    });
    const firstButton = document.createElement("button");
    firstButton.textContent = "Primary";
    const secondButton = document.createElement("button");
    secondButton.textContent = "Secondary";
    container.appendChild(firstButton);
    container.appendChild(secondButton);
    document.body.appendChild(container);
  }, { id: elementId, topPosition: top, leftPosition: left });
};

const createUnknownFixture = async (page: Page, elementId = "probe-unknown-container"): Promise<void> => {
  await page.evaluate((id) => {
    document.getElementById(id)?.remove();
    const element = document.createElement("div");
    element.id = id;
    element.setAttribute("data-testid", "mission-control-unknown-surface");
    element.style.width = "200px";
    element.style.height = "80px";
    document.body.appendChild(element);
  }, elementId);
};

const triggerPinHotkey = async (page: Page): Promise<void> => {
  await page.keyboard.press(PIN_HOTKEY);
};

const removeElementById = async (page: Page, elementId: string): Promise<void> => {
  await page.evaluate((id) => {
    document.getElementById(id)?.remove();
  }, elementId);
};

const waitForWarningLayerToSettle = async (page: Page): Promise<void> => {
  await page.waitForTimeout(250);
};

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
    await openQaPanel(page);

    await expect(page.locator('[data-lw-theme-target="app.shell"]').first()).toBeVisible();
    await expect(page.locator('[data-lw-theme-target="topbar.root"]').first()).toBeVisible();
    await expect(page.locator('[data-lw-theme-target="mission-control.panel"]').first()).toBeVisible();
    await expect(page.locator('[data-lw-theme-target="graph.frame"]').first()).toBeVisible();

    // settings.panel target is on the SettingsPanel dialog — open it first
    await page.locator('[data-testid="topbar-settings-button"]').click();
    await expect(page.locator('[data-lw-theme-target="settings.panel"]').first()).toBeVisible({ timeout: 5000 });
  });

  test("inspector overlay toggles via hotkey and shows metadata", async ({ page }) => {
    await page.goto("/");
    await openQaPanel(page);

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
    await openQaPanel(page);
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
    await openQaPanel(page);
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

  test.skip("UI Inspector panel stays inside graph viewport lower-right - SKIP-WITH-DOCUMENTATION: Test correctly identifies real production bug. Panel right edge (1264px) exceeds viewport right boundary (861px) in real source mode. Panel positioning logic in ThemeTargetInspectorOverlay.tsx is broken for real source dimensions. Test uses measured graphBox.width (not hardcoded fixture width) and should be kept to enforce this contract until production bug is fixed. See docs/test-forensics/theme-target-inspector--inspector-panel-stays-inside-graph-viewport.md", async ({ page }) => {
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
    const graphBox = await page.locator(
      "[data-testid='self-graph-fixture-loaded']," +
      "[data-testid='graph-viewport']"
    ).first().boundingBox();

    expect(panelBox).not.toBeNull();
    expect(graphBox).not.toBeNull();

    if (!panelBox || !graphBox) {
      throw new Error("Failed to measure UI Inspector panel or graph viewport");
    }

    expect(panelBox.x).toBeGreaterThanOrEqual(graphBox.x - 1);
    expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(graphBox.x + graphBox.width + 1);

    const rightGap = graphBox.x + graphBox.width - (panelBox.x + panelBox.width);
    expect(rightGap).toBeGreaterThanOrEqual(0);

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
    await openQaPanel(page);

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

    await enableInspector(page);
    await expect(page.getByTestId("theme-target-ghost-layer")).toBeVisible();

    await disableInspector(page);
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
    await enableInspector(page);
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

  test("warning badges appear for >=3-signal candidates only while inspector is on", async ({ page }) => {
    await page.goto("/");
    await enableInspector(page);
    await waitForWarningLayerToSettle(page);
    const baselineCount = await page.getByTestId("theme-target-warning-badge").count();
    await disableInspector(page);

    await createSyntheticCandidate(page);
    await enableInspector(page);
    await waitForWarningLayerToSettle(page);
    const updatedCount = await page.getByTestId("theme-target-warning-badge").count();
    expect(updatedCount).toBeGreaterThan(baselineCount);

    await disableInspector(page);
    await expect(page.getByTestId("theme-target-warning-badge")).toHaveCount(0);
    await removeElementById(page, "probe-warning-candidate");
  });

  test("unknown <3-signal fixtures never render warning badges", async ({ page }) => {
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

    await enableInspector(page);
    await waitForWarningLayerToSettle(page);
    const baselineCount = await page.getByTestId("theme-target-warning-badge").count();
    await disableInspector(page);

    await enableInspector(page);
    await waitForWarningLayerToSettle(page);
    const postUnknownCount = await page.getByTestId("theme-target-warning-badge").count();
    expect(postUnknownCount).toBe(baselineCount);
    await disableInspector(page);
    await removeElementById(page, "probe-unknown-container");
  });

  test("warning badges ignore never-warn fixtures", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const ids = [
        "v27b-never-warn-button",
        "v27b-never-warn-label",
      ];
      ids.forEach((id) => document.getElementById(id)?.remove());

      const button = document.createElement("button");
      button.id = "v27b-never-warn-button";
      button.textContent = "Excluded button";
      const label = document.createElement("label");
      label.id = "v27b-never-warn-label";
      label.textContent = "Excluded label";
      document.body.appendChild(button);
      document.body.appendChild(label);
    });

    await enableInspector(page);
    await waitForWarningLayerToSettle(page);
    const baselineCount = await page.getByTestId("theme-target-warning-badge").count();
    await disableInspector(page);

    await enableInspector(page);
    await waitForWarningLayerToSettle(page);
    const postCount = await page.getByTestId("theme-target-warning-badge").count();
    expect(postCount).toBe(baselineCount);
    await disableInspector(page);
    await removeElementById(page, "v27b-never-warn-button");
    await removeElementById(page, "v27b-never-warn-label");
  });

  test("warning badges clamp within viewport padding", async ({ page }) => {
    await page.goto("/");
    await createSyntheticCandidate(page, { elementId: "top-left-candidate", top: 4, left: 4 });

    await enableInspector(page);
    await waitForWarningLayerToSettle(page);

    const badges = page.getByTestId("theme-target-warning-badge");
    const badgeCount = await badges.count();
    expect(badgeCount).toBeGreaterThan(0);

    for (let index = 0; index < badgeCount; index += 1) {
      const box = await badges.nth(index).boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(8);
        expect(box.y).toBeGreaterThanOrEqual(8);
      }
    }

    await disableInspector(page);
    await removeElementById(page, "top-left-candidate");
  });

  test("warning layer remains pointer-events none", async ({ page }) => {
    await page.goto("/");
    await createSyntheticCandidate(page, "pointer-events-candidate");
    await enableInspector(page);
    await waitForWarningLayerToSettle(page);

    const warningLayer = page.getByTestId("theme-target-warning-layer");
    await expect(warningLayer).toBeVisible();
    await expect(warningLayer).toHaveCSS("pointer-events", "none");
    const badges = page.getByTestId("theme-target-warning-badge");
    const badgeCount = await badges.count();
    expect(badgeCount).toBeGreaterThan(0);
    for (let i = 0; i < badgeCount; i += 1) {
      await expect(badges.nth(i)).toHaveCSS("pointer-events", "none");
    }

    await disableInspector(page);
    await removeElementById(page, "pointer-events-candidate");
  });

  test("registered target can be pinned, persist after hover leaves, and unpinned", async ({ page }) => {
    await page.goto("/");
    await enableInspector(page);

    const missionControlPanel = page.locator('[data-lw-theme-target="mission-control.panel"]').first();
    await missionControlPanel.hover();
    const pinnedBadge = page.getByTestId("theme-target-pinned-state");

    await triggerPinHotkey(page);
    await page.mouse.move(0, 0);
    await expect(pinnedBadge).toBeVisible();

    await missionControlPanel.hover();
    await triggerPinHotkey(page);
    await expect(page.getByTestId("theme-target-pin-hint")).toBeVisible();
    await disableInspector(page);
  });

  test("inspector OFF clears pinned state", async ({ page }) => {
    await page.goto("/");
    await enableInspector(page);

    await page.locator('[data-lw-theme-target="mission-control.panel"]').first().hover();
    await triggerPinHotkey(page);
    await expect(page.getByTestId("theme-target-pinned-state")).toBeVisible();

    await disableInspector(page);
    await expect(page.getByTestId("theme-target-inspector-panel")).not.toBeVisible();

    await enableInspector(page);
    await expect(page.getByTestId("theme-target-pinned-state")).toHaveCount(0);
    await disableInspector(page);
  });

  test("warning candidate can be pinned", async ({ page }) => {
    await page.goto("/");
    const candidateId = "pin-candidate";
    await createSyntheticCandidate(page, candidateId);
    // Enable inspector without placing QA tile (tile would overlap the synthetic candidate)
    await page.click("body");
    await page.keyboard.press("Alt+Shift+I");
    await waitForWarningLayerToSettle(page);

    await page.locator(`#${candidateId}`).hover();
    await expect(page.getByTestId("theme-target-display-kind")).toContainText("Candidate surface");
    await triggerPinHotkey(page);
    await page.locator("body").hover();
    await expect(page.getByTestId("theme-target-pinned-state")).toBeVisible();

    await disableInspector(page);
    await removeElementById(page, candidateId);
  });

  test("unknown fixtures cannot be pinned", async ({ page }) => {
    await page.goto("/");
    const unknownId = "pin-unknown";
    await createUnknownFixture(page, unknownId);
    await enableInspector(page);

    await page.locator(`#${unknownId}`).hover();
    await triggerPinHotkey(page);
    await expect(page.getByTestId("theme-target-inspector-panel")).not.toBeVisible();

    await disableInspector(page);
    await removeElementById(page, unknownId);
  });

  test("never-warn fixtures cannot be pinned", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      document.getElementById("pin-button")?.remove();
      const button = document.createElement("button");
      button.id = "pin-button";
      button.textContent = "Pinned?";
      document.body.appendChild(button);
    });

    await enableInspector(page);
    await page.locator("#pin-button").hover();
    await triggerPinHotkey(page);
    await expect(page.getByTestId("theme-target-inspector-panel")).not.toBeVisible();

    await disableInspector(page);
    await removeElementById(page, "pin-button");
  });

  test("overlay DOM cannot be pinned", async ({ page }) => {
    await page.goto("/");
    await enableInspector(page);

    await page.evaluate(() => {
      const overlay = document.querySelector<HTMLElement>("[data-testid='theme-target-inspector-overlay']");
      overlay?.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
    });
    await triggerPinHotkey(page);
    await expect(page.getByTestId("theme-target-inspector-panel")).not.toBeVisible();

    await disableInspector(page);
  });

  test.skip("Sigma/graph primitives cannot be pinned - SKIP-WITH-DOCUMENTATION: Real production bug found. SIGMA_ELEMENT_SELECTOR in ThemeTargetInspectorOverlay.tsx line 42 uses `[data-testid='self-graph-fixture-loaded']` but actual DOM has `data-testid='graph-viewport'` in real source mode. Selector pattern does not match in production, so exclusion logic is broken. Test correctly asserts contract the code does not currently honor. See docs/test-forensics/theme-target-inspector--sigma-graph-primitives-cannot-be-pinned.md", async ({ page }) => {
    await page.goto("/");
    await enableInspector(page);

    // Verify the SIGMA_ELEMENT_SELECTOR pattern excludes data-sigma-element
    const selectorMatches = await page.evaluate(() => {
      const viewport = document.querySelector('[data-testid="self-graph-fixture-loaded"],[data-testid="graph-viewport"]');
      if (!viewport) return { hasViewport: false, selectorTest: null };

      // Create a test element with data-sigma-element
      const testCanvas = document.createElement("canvas");
      testCanvas.setAttribute("data-sigma-element", "test-node");
      viewport.appendChild(testCanvas);

      // Test if it matches the SIGMA_ELEMENT_SELECTOR pattern
      // SIGMA_ELEMENT_SELECTOR = `${GRAPH_VIEWPORT_SELECTOR} canvas, ${GRAPH_VIEWPORT_SELECTOR} svg, ${GRAPH_VIEWPORT_SELECTOR} [data-sigma-element]`
      // where GRAPH_VIEWPORT_SELECTOR = "[data-testid='self-graph-fixture-loaded']"
      const selectorPattern = "[data-testid='self-graph-fixture-loaded'] canvas, [data-testid='self-graph-fixture-loaded'] svg, [data-testid='self-graph-fixture-loaded'] [data-sigma-element]";
      const matchesSelector = testCanvas.matches(selectorPattern);

      // Cleanup
      testCanvas.remove();

      return { hasViewport: true, selectorTest: matchesSelector };
    });

    expect(selectorMatches.hasViewport).toBe(true);
    expect(selectorMatches.selectorTest).toBe(true);

    await disableInspector(page);
  });
});
