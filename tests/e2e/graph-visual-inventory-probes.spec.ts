import { test, expect } from "@playwright/test";
import { openGraphVisualInventory } from "./helpers/tiles";

test.describe("Graph Visual Inventory", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await openGraphVisualInventory(page);
  });

  test.describe("Graph Runtime Probe (v46)", () => {
    test("Runtime probe section is visible", async ({ page }) => {
      const probeSection = page.getByTestId("graph-runtime-probe-section");
      await expect(probeSection).toBeVisible();
    });

    test("Runtime probe title is visible", async ({ page }) => {
      const probeTitle = page.getByTestId("graph-runtime-probe-title");
      await expect(probeTitle).toBeVisible();
      await expect(probeTitle).toHaveText("Graph Runtime Probe (v46)");
    });

    test("Runtime probe description indicates passive readout", async ({ page }) => {
      const probeDescription = page.getByTestId("graph-runtime-probe-description");
      await expect(probeDescription).toBeVisible();
      await expect(probeDescription).toHaveText("Passive readout of graph container/evidence status. No mutation.");
    });

    test("Runtime probe reports registry entries count", async ({ page }) => {
      const registryCount = page.getByTestId("graph-runtime-probe-registry-count");
      await expect(registryCount).toBeVisible();
      const count = await registryCount.textContent();
      expect(count).not.toBe("");
      expect(parseInt(count || "0")).toBeGreaterThan(0);
    });

    test("Runtime probe reports mutation status as locked/deferred", async ({ page }) => {
      const mutationStatus = page.getByTestId("graph-runtime-probe-mutation-status");
      await expect(mutationStatus).toBeVisible();
      await expect(mutationStatus).toHaveText("locked/deferred");
    });

    test("Runtime probe reports Sigma mutation status as forbidden", async ({ page }) => {
      const sigmaStatus = page.getByTestId("graph-runtime-probe-sigma-status");
      await expect(sigmaStatus).toBeVisible();
      await expect(sigmaStatus).toHaveText("forbidden in v46");
    });

    test("Runtime probe reports physics mutation status as forbidden", async ({ page }) => {
      const physicsStatus = page.getByTestId("graph-runtime-probe-physics-status");
      await expect(physicsStatus).toBeVisible();
      await expect(physicsStatus).toHaveText("forbidden in v46");
    });

    test("Runtime probe has no enabled controls", async ({ page }) => {
      const probeSection = page.getByTestId("graph-runtime-probe-section");
      const controls = probeSection.locator("button, input, select");
      const count = await controls.count();
      expect(count).toBe(0);
    });

    test("Graph surface still mounts with runtime probe present", async ({ page }) => {
      const canvas = page.locator("canvas").first();
      await expect(canvas).toBeVisible();
    });

    test("Graph Visual Inventory still works with runtime probe", async ({ page }) => {
      const list = page.getByTestId("graph-visual-inventory-list");
      await expect(list).toBeVisible();

      const graphFrameRow = page.getByTestId("graph-visual-inventory-row-graph.frame");
      await expect(graphFrameRow).toBeVisible();
    });
  });

  test.describe("Graph Evidence Detail Mode (v48)", () => {
    test("Graph Evidence Detail Mode section is visible", async ({ page }) => {
      const detailModeSection = page.getByTestId("graph-evidence-detail-mode");
      await expect(detailModeSection).toBeVisible();
    });

    test("Graph Evidence Detail Mode title is visible", async ({ page }) => {
      const detailModeTitle = page.getByTestId("graph-evidence-detail-mode-title");
      await expect(detailModeTitle).toBeVisible();
      await expect(detailModeTitle).toHaveText("Graph Evidence Detail Mode (v48)");
    });

    test("Graph Evidence Detail Mode description indicates non-persistent UI mode", async ({ page }) => {
      const detailModeDescription = page.getByTestId("graph-evidence-detail-mode-description");
      await expect(detailModeDescription).toBeVisible();
      await expect(detailModeDescription).toHaveText("Non-persistent UI mode: switch between Summary and Detailed evidence display");
    });

    test("Summary mode button is visible", async ({ page }) => {
      const summaryButton = page.getByTestId("graph-evidence-mode-summary");
      await expect(summaryButton).toBeVisible();
      await expect(summaryButton).toHaveText("Summary");
    });

    test("Detailed mode button is visible", async ({ page }) => {
      const detailedButton = page.getByTestId("graph-evidence-mode-detailed");
      await expect(detailedButton).toBeVisible();
      await expect(detailedButton).toHaveText("Detailed");
    });

    test("Mode readout is visible", async ({ page }) => {
      const modeReadout = page.getByTestId("graph-evidence-detail-readout");
      await expect(modeReadout).toBeVisible();
      const readoutText = await modeReadout.textContent();
      expect(readoutText).toContain("Mode:");
    });

    test("Summary mode is default", async ({ page }) => {
      const modeReadout = page.getByTestId("graph-evidence-detail-readout");
      await expect(modeReadout).toHaveText("Mode: summary");
    });

    test("Clicking Detailed mode changes mode readout", async ({ page }) => {
      const detailedButton = page.getByTestId("graph-evidence-mode-detailed");
      const modeReadout = page.getByTestId("graph-evidence-detail-readout");

      await detailedButton.click();
      await expect(modeReadout).toHaveText("Mode: detailed");
    });

    test("Clicking Summary mode changes mode readout back", async ({ page }) => {
      const detailedButton = page.getByTestId("graph-evidence-mode-detailed");
      const summaryButton = page.getByTestId("graph-evidence-mode-summary");
      const modeReadout = page.getByTestId("graph-evidence-detail-readout");

      await detailedButton.click();
      await expect(modeReadout).toHaveText("Mode: detailed");

      await summaryButton.click();
      await expect(modeReadout).toHaveText("Mode: summary");
    });

    test("Summary mode hides sigma boundary and policy text", async ({ page }) => {
      const summaryButton = page.getByTestId("graph-evidence-mode-summary");
      const graphFrameSigmaBoundary = page.getByTestId("graph-visual-inventory-row-sigma-boundary-graph.frame");
      const graphFramePolicy = page.getByTestId("graph-visual-inventory-row-policy-graph.frame");

      await summaryButton.click();
      await expect(graphFrameSigmaBoundary).not.toBeVisible();
      await expect(graphFramePolicy).not.toBeVisible();
    });

    test("Detailed mode shows sigma boundary and policy text", async ({ page }) => {
      const detailedButton = page.getByTestId("graph-evidence-mode-detailed");
      const graphFrameSigmaBoundary = page.getByTestId("graph-visual-inventory-row-sigma-boundary-graph.frame");
      const graphFramePolicy = page.getByTestId("graph-visual-inventory-row-policy-graph.frame");

      await detailedButton.click();
      await expect(graphFrameSigmaBoundary).toBeVisible();
      await expect(graphFramePolicy).toBeVisible();
    });

    test("Graph surface still mounts with detail mode present", async ({ page }) => {
      const canvas = page.locator("canvas").first();
      await expect(canvas).toBeVisible();
    });

    test("Runtime probe still reports mutation boundaries with detail mode", async ({ page }) => {
      const mutationStatus = page.getByTestId("graph-runtime-probe-mutation-status");
      await expect(mutationStatus).toBeVisible();
      await expect(mutationStatus).toHaveText("locked/deferred");
    });

    test("No new graph renderer/physics/camera/filter controls are introduced", async ({ page }) => {
      const panel = page.getByTestId("graph-visual-inventory-panel");

      // Check that there are no new Sigma/renderer mutation controls
      const sigmaControls = panel.getByRole("button", { name: /sigma|renderer|mutation/i });
      await expect(sigmaControls).not.toBeVisible();

      // Check that there are no new physics modification controls
      const physicsControls = panel.getByRole("button", { name: /physics|force|layout/i });
      await expect(physicsControls).not.toBeVisible();
    });

    test("Controls are genuinely active (not dead)", async ({ page }) => {
      const detailedButton = page.getByTestId("graph-evidence-mode-detailed");
      const summaryButton = page.getByTestId("graph-evidence-mode-summary");
      const modeReadout = page.getByTestId("graph-evidence-detail-readout");

      // Verify buttons are clickable and change state
      await detailedButton.click();
      await expect(modeReadout).toHaveText("Mode: detailed");

      await summaryButton.click();
      await expect(modeReadout).toHaveText("Mode: summary");
    });
  });
});
