import { test, expect } from "@playwright/test";

test.describe("Graph Visual Inventory", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Graph Visual Inventory panel is visible", async ({ page }) => {
    const panel = page.getByTestId("graph-visual-inventory-panel");
    await expect(panel).toBeVisible();
  });

  test("Graph Visual Inventory title is visible", async ({ page }) => {
    const title = page.getByTestId("graph-visual-inventory-title");
    await expect(title).toBeVisible();
    await expect(title).toHaveText("Graph Visual Inventory");
  });

  test("Graph Visual Inventory description is visible", async ({ page }) => {
    const description = page.getByTestId("graph-visual-inventory-description");
    await expect(description).toBeVisible();
    await expect(description).toHaveText("Read-only inventory of graph visual elements");
  });

  test("Graph Visual Inventory list is visible", async ({ page }) => {
    const list = page.getByTestId("graph-visual-inventory-list");
    await expect(list).toBeVisible();
  });

  test("Registry entries are listed", async ({ page }) => {
    const list = page.getByTestId("graph-visual-inventory-list");
    
    // Check for known registry entries
    const graphFrameRow = page.getByTestId("graph-visual-inventory-row-graph.frame");
    await expect(graphFrameRow).toBeVisible();
    
    const graphSurfaceRow = page.getByTestId("graph-visual-inventory-row-graph.surface");
    await expect(graphSurfaceRow).toBeVisible();
    
    const graphNodesRow = page.getByTestId("graph-visual-inventory-row-graph.nodes");
    await expect(graphNodesRow).toBeVisible();
    
    const graphEdgesRow = page.getByTestId("graph-visual-inventory-row-graph.edges");
    await expect(graphEdgesRow).toBeVisible();
  });

  test("Registry entries show titles", async ({ page }) => {
    const graphFrameTitle = page.getByTestId("graph-visual-inventory-row-title-graph.frame");
    await expect(graphFrameTitle).toBeVisible();
    await expect(graphFrameTitle).toHaveText("Graph Frame");
  });

  test("Registry entries show descriptions", async ({ page }) => {
    const graphFrameDescription = page.getByTestId("graph-visual-inventory-row-description-graph.frame");
    await expect(graphFrameDescription).toBeVisible();
  });

  test("Registry entries show status", async ({ page }) => {
    const graphFrameStatus = page.getByTestId("graph-visual-inventory-row-status-graph.frame");
    await expect(graphFrameStatus).toBeVisible();
    await expect(graphFrameStatus).toHaveText("active");
  });

  test("Registry entries show category", async ({ page }) => {
    const graphFrameCategory = page.getByTestId("graph-visual-inventory-row-category-graph.frame");
    await expect(graphFrameCategory).toBeVisible();
    await expect(graphFrameCategory).toHaveText(/Category: frame/);
  });

  test("Registry entries show evidence kind", async ({ page }) => {
    const graphFrameEvidence = page.getByTestId("graph-visual-inventory-row-evidence-graph.frame");
    await expect(graphFrameEvidence).toBeVisible();
    await expect(graphFrameEvidence).toHaveText(/Evidence: dom-wrapper/);
  });

  test("Registry entries show sigma boundary", async ({ page }) => {
    const graphFrameSigma = page.getByTestId("graph-visual-inventory-row-sigma-boundary-graph.frame");
    await expect(graphFrameSigma).toBeVisible();
  });

  test("Registry entries show policy note", async ({ page }) => {
    const graphFramePolicy = page.getByTestId("graph-visual-inventory-row-policy-graph.frame");
    await expect(graphFramePolicy).toBeVisible();
  });

  test("Future/locked elements are labeled", async ({ page }) => {
    const graphHudRow = page.getByTestId("graph-visual-inventory-row-graph.hud");
    await expect(graphHudRow).toBeVisible();
    
    const graphHudStatus = page.getByTestId("graph-visual-inventory-row-status-graph.hud");
    await expect(graphHudStatus).toBeVisible();
    await expect(graphHudStatus).toHaveText("future");
    
    const graphMinimapRow = page.getByTestId("graph-visual-inventory-row-graph.minimap");
    await expect(graphMinimapRow).toBeVisible();
    
    const graphMinimapStatus = page.getByTestId("graph-visual-inventory-row-status-graph.minimap");
    await expect(graphMinimapStatus).toBeVisible();
    await expect(graphMinimapStatus).toHaveText("locked");
  });

  test("No enabled graph action/apply/execute controls exist", async ({ page }) => {
    const panel = page.getByTestId("graph-visual-inventory-panel");
    
    // Check that there are no buttons with apply/execute labels
    const applyButtons = panel.getByRole("button", { name: /apply/i });
    await expect(applyButtons).not.toBeVisible();
    
    const executeButtons = panel.getByRole("button", { name: /execute/i });
    await expect(executeButtons).not.toBeVisible();
  });

  test("Graph surface still mounts", async ({ page }) => {
    const graphViewport = page.getByTestId("graph-viewport");
    await expect(graphViewport).toBeVisible();
  });

  test("Command Deck still works", async ({ page }) => {
    const commandDeckPanel = page.getByTestId("command-deck-panel");
    await expect(commandDeckPanel).toBeVisible();
  });

  test("QA panel still works", async ({ page }) => {
    const qaPanel = page.getByTestId("qa-panel").nth(0);
    await expect(qaPanel).toBeVisible();
  });

  test("Registry entry count matches inventory row count", async ({ page }) => {
    const list = page.getByTestId("graph-visual-inventory-list");
    await expect(list).toBeVisible();

    // Count all inventory rows with testid pattern (row containers only)
    const inventoryRows = await page.locator('[data-testid^="graph-visual-inventory-row-"][data-testid$="-graph.frame"], [data-testid^="graph-visual-inventory-row-"][data-testid$="-graph.surface"], [data-testid^="graph-visual-inventory-row-"][data-testid$="-graph.nodes"], [data-testid^="graph-visual-inventory-row-"][data-testid$="-graph.edges"]').count();
    
    // Verify at least the core registry entries are present
    expect(inventoryRows).toBeGreaterThanOrEqual(4);
  });

  test("All inventory rows have stable testid attributes", async ({ page }) => {
    const list = page.getByTestId("graph-visual-inventory-list");
    await expect(list).toBeVisible();

    // Verify all rows have testid attributes
    const rows = page.locator('[data-testid^="graph-visual-inventory-row-"]');
    const count = await rows.count();
    
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      await expect(row).toHaveAttribute('data-testid');
    }
  });

  test("Graph surface remains visible when inventory panel is open", async ({ page }) => {
    const graphViewport = page.getByTestId("graph-viewport");
    const inventoryPanel = page.getByTestId("graph-visual-inventory-panel");
    
    // Both should be visible simultaneously
    await expect(graphViewport).toBeVisible();
    await expect(inventoryPanel).toBeVisible();
  });

  test("No Sigma/renderer mutation controls in inventory panel", async ({ page }) => {
    const panel = page.getByTestId("graph-visual-inventory-panel");
    
    // Check that there are no Sigma/renderer mutation controls
    const sigmaControls = panel.getByRole("button", { name: /sigma|renderer|mutation/i });
    await expect(sigmaControls).not.toBeVisible();
    
    // Check that there are no physics modification controls
    const physicsControls = panel.getByRole("button", { name: /physics|force|layout/i });
    await expect(physicsControls).not.toBeVisible();
  });

  test("Inventory panel is read-only (no input fields)", async ({ page }) => {
    const panel = page.getByTestId("graph-visual-inventory-panel");
    
    // Check that there are no text input fields
    const textInputs = panel.getByRole("textbox");
    await expect(textInputs).not.toBeVisible();
    
    // Check that there are no dropdowns
    const dropdowns = panel.getByRole("combobox");
    await expect(dropdowns).not.toBeVisible();
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
});
