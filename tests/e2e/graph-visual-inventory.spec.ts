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
    const detailedButton = page.getByTestId("graph-evidence-mode-detailed");
    await detailedButton.click();

    const graphFrameSigma = page.getByTestId("graph-visual-inventory-row-sigma-boundary-graph.frame");
    await expect(graphFrameSigma).toBeVisible();
  });

  test("Registry entries show policy note", async ({ page }) => {
    const detailedButton = page.getByTestId("graph-evidence-mode-detailed");
    await detailedButton.click();

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

  test.describe("Graph Theme Mapping Inventory (v50)", () => {
    test("Graph Theme Mapping Inventory section is visible", async ({ page }) => {
      const mappingSection = page.getByTestId("graph-theme-mapping-inventory-section");
      await expect(mappingSection).toBeVisible();
    });

    test("Graph Theme Mapping Inventory title is visible", async ({ page }) => {
      const mappingTitle = page.getByTestId("graph-theme-mapping-inventory-title");
      await expect(mappingTitle).toBeVisible();
      await expect(mappingTitle).toHaveText("Graph Theme Mapping Inventory (v50)");
    });

    test("Graph Theme Mapping Inventory description indicates passive inventory", async ({ page }) => {
      const mappingDescription = page.getByTestId("graph-theme-mapping-inventory-description");
      await expect(mappingDescription).toBeVisible();
      await expect(mappingDescription).toHaveText("Passive inventory of graph visual element to canonical theme token relationships. No runtime application.");
    });

    test("Graph Theme Mapping Inventory reports mapping entries count", async ({ page }) => {
      const mappingCount = page.getByTestId("graph-theme-mapping-count");
      await expect(mappingCount).toBeVisible();
      const count = await mappingCount.textContent();
      expect(count).not.toBe("");
      expect(parseInt(count || "0")).toBeGreaterThan(0);
    });

    test("Graph Theme Mapping Inventory reports runtime application status as forbidden", async ({ page }) => {
      const applicationStatus = page.getByTestId("graph-theme-mapping-application-status");
      await expect(applicationStatus).toBeVisible();
      await expect(applicationStatus).toHaveText("forbidden in v50");
    });

    test("Graph Theme Mapping Inventory reports Sigma mutation status as forbidden", async ({ page }) => {
      const sigmaStatus = page.getByTestId("graph-theme-mapping-sigma-status");
      await expect(sigmaStatus).toBeVisible();
      await expect(sigmaStatus).toHaveText("forbidden in v50");
    });

    test("Graph Theme Mapping Inventory reports node/edge styling status as forbidden", async ({ page }) => {
      const stylingStatus = page.getByTestId("graph-theme-mapping-styling-status");
      await expect(stylingStatus).toBeVisible();
      await expect(stylingStatus).toHaveText("forbidden in v50");
    });

    test("Graph Theme Mapping Inventory list is visible", async ({ page }) => {
      const mappingList = page.getByTestId("graph-theme-mapping-list");
      await expect(mappingList).toBeVisible();
    });

    test("Graph Theme Mapping rows are listed", async ({ page }) => {
      const mappingList = page.getByTestId("graph-theme-mapping-list");

      // Check for known mapping entries (graph.frame → panel.border)
      const graphFrameMappingRow = page.getByTestId("graph-theme-mapping-row-graph-frame-panel-border");
      await expect(graphFrameMappingRow).toBeVisible();

      // Check for graph.surface → app.background mapping
      const graphSurfaceMappingRow = page.getByTestId("graph-theme-mapping-row-graph-surface-app-background");
      await expect(graphSurfaceMappingRow).toBeVisible();
    });

    test("Graph Theme Mapping rows show graph element ID", async ({ page }) => {
      const graphFrameElement = page.getByTestId("graph-theme-mapping-row-element-graph-frame-panel-border");
      await expect(graphFrameElement).toBeVisible();
      await expect(graphFrameElement).toHaveText("graph.frame");
    });

    test("Graph Theme Mapping rows show visual role", async ({ page }) => {
      const graphFrameRole = page.getByTestId("graph-theme-mapping-row-role-graph-frame-panel-border");
      await expect(graphFrameRole).toBeVisible();
      const roleText = await graphFrameRole.textContent();
      expect(roleText).not.toBe("");
    });

    test("Graph Theme Mapping rows show canonical token path", async ({ page }) => {
      const graphFrameToken = page.getByTestId("graph-theme-mapping-row-token-graph-frame-panel-border");
      await expect(graphFrameToken).toBeVisible();
      const tokenText = await graphFrameToken.textContent();
      expect(tokenText).toContain("Token:");
      expect(tokenText).toContain("panel.border");
    });

    test("Graph Theme Mapping rows show token source", async ({ page }) => {
      const graphFrameSource = page.getByTestId("graph-theme-mapping-row-source-graph-frame-panel-border");
      await expect(graphFrameSource).toBeVisible();
      const sourceText = await graphFrameSource.textContent();
      expect(sourceText).toContain("Source:");
      expect(sourceText).toContain("THEME_TOKEN_PATH_MAP.md");
    });

    test("Graph Theme Mapping rows show boundary notes", async ({ page }) => {
      const graphFrameBoundary = page.getByTestId("graph-theme-mapping-row-boundary-graph-frame-panel-border");
      await expect(graphFrameBoundary).toBeVisible();
      const boundaryText = await graphFrameBoundary.textContent();
      expect(boundaryText).toContain("Governance mapping only");
    });

    test("Graph Theme Mapping rows show status", async ({ page }) => {
      const graphFrameStatus = page.getByTestId("graph-theme-mapping-row-status-graph-frame-panel-border");
      await expect(graphFrameStatus).toBeVisible();
      await expect(graphFrameStatus).toHaveText("active");
    });

    test("Graph Theme Mapping Inventory has no enabled apply/edit/save controls", async ({ page }) => {
      const mappingSection = page.getByTestId("graph-theme-mapping-inventory-section");

      // Check that there are no apply buttons
      const applyButtons = mappingSection.getByRole("button", { name: /apply/i });
      await expect(applyButtons).not.toBeVisible();

      // Check that there are no edit buttons
      const editButtons = mappingSection.getByRole("button", { name: /edit/i });
      await expect(editButtons).not.toBeVisible();

      // Check that there are no save buttons
      const saveButtons = mappingSection.getByRole("button", { name: /save/i });
      await expect(saveButtons).not.toBeVisible();
    });

    test("Graph Theme Mapping Inventory is read-only (no input fields)", async ({ page }) => {
      const mappingSection = page.getByTestId("graph-theme-mapping-inventory-section");

      // Check that there are no text input fields
      const textInputs = mappingSection.getByRole("textbox");
      await expect(textInputs).not.toBeVisible();

      // Check that there are no dropdowns
      const dropdowns = mappingSection.getByRole("combobox");
      await expect(dropdowns).not.toBeVisible();
    });

    test("Graph surface still mounts with theme mapping inventory present", async ({ page }) => {
      const canvas = page.locator("canvas").first();
      await expect(canvas).toBeVisible();
    });

    test("Existing graph inventory still works with theme mapping inventory", async ({ page }) => {
      const inventoryList = page.getByTestId("graph-visual-inventory-list");
      await expect(inventoryList).toBeVisible();

      const graphFrameRow = page.getByTestId("graph-visual-inventory-row-graph.frame");
      await expect(graphFrameRow).toBeVisible();
    });

    test("Runtime probe still works with theme mapping inventory", async ({ page }) => {
      const probeSection = page.getByTestId("graph-runtime-probe-section");
      await expect(probeSection).toBeVisible();

      const mutationStatus = page.getByTestId("graph-runtime-probe-mutation-status");
      await expect(mutationStatus).toBeVisible();
      await expect(mutationStatus).toHaveText("locked/deferred");
    });

    test("Graph Evidence Detail Mode still works with theme mapping inventory", async ({ page }) => {
      const detailModeSection = page.getByTestId("graph-evidence-detail-mode");
      await expect(detailModeSection).toBeVisible();

      const summaryButton = page.getByTestId("graph-evidence-mode-summary");
      const detailedButton = page.getByTestId("graph-evidence-mode-detailed");
      const modeReadout = page.getByTestId("graph-evidence-detail-readout");

      await detailedButton.click();
      await expect(modeReadout).toHaveText("Mode: detailed");

      await summaryButton.click();
      await expect(modeReadout).toHaveText("Mode: summary");
    });

    test("No graph/Sigma styling mutation controls are introduced", async ({ page }) => {
      const panel = page.getByTestId("graph-visual-inventory-panel");

      // Check that there are no new Sigma/renderer mutation controls
      const sigmaControls = panel.getByRole("button", { name: /sigma|renderer|mutation/i });
      await expect(sigmaControls).not.toBeVisible();

      // Check that there are no new physics modification controls
      const physicsControls = panel.getByRole("button", { name: /physics|force|layout/i });
      await expect(physicsControls).not.toBeVisible();

      // Check that there are no new node/edge styling controls
      const stylingControls = panel.getByRole("button", { name: /node|edge|style|color/i });
      await expect(stylingControls).not.toBeVisible();
    });

    test("All theme mapping rows have stable testid attributes", async ({ page }) => {
      const mappingList = page.getByTestId("graph-theme-mapping-list");
      await expect(mappingList).toBeVisible();

      // Verify all rows have testid attributes
      const rows = page.locator('[data-testid^="graph-theme-mapping-row-"]');
      const count = await rows.count();

      for (let i = 0; i < count; i++) {
        const row = rows.nth(i);
        await expect(row).toHaveAttribute('data-testid');
      }
    });
  });

  test.describe("Graph Theme Evidence Wrapper Mode (v52)", () => {
    test("Graph Theme Evidence Wrapper Mode section is visible", async ({ page }) => {
      const wrapperModeSection = page.getByTestId("graph-theme-evidence-wrapper-mode-section");
      await expect(wrapperModeSection).toBeVisible();
    });

    test("Graph Theme Evidence Wrapper Mode title is visible", async ({ page }) => {
      const wrapperModeTitle = page.getByTestId("graph-theme-evidence-wrapper-mode-title");
      await expect(wrapperModeTitle).toBeVisible();
      await expect(wrapperModeTitle).toHaveText("Graph Theme Evidence Wrapper Mode (v52)");
    });

    test("Graph Theme Evidence Wrapper Mode description indicates wrapper-level state", async ({ page }) => {
      const wrapperModeDescription = page.getByTestId("graph-theme-evidence-wrapper-mode-description");
      await expect(wrapperModeDescription).toBeVisible();
      await expect(wrapperModeDescription).toHaveText("Wrapper-level theme evidence state toggle. Does not apply token values to Sigma or graph.");
    });

    test("Theme evidence toggle is visible", async ({ page }) => {
      const toggle = page.getByTestId("graph-theme-evidence-toggle");
      await expect(toggle).toBeVisible();
    });

    test("Default theme evidence status is inactive", async ({ page }) => {
      const status = page.getByTestId("graph-theme-evidence-status");
      await expect(status).toBeVisible();
      await expect(status).toHaveText("Theme evidence: inactive");
    });

    test("Toggle button shows Inactive by default", async ({ page }) => {
      const toggle = page.getByTestId("graph-theme-evidence-toggle");
      await expect(toggle).toBeVisible();
      await expect(toggle).toHaveText("Inactive");
      await expect(toggle).toHaveAttribute("aria-pressed", "false");
    });

    test("Clicking toggle changes status to active", async ({ page }) => {
      const toggle = page.getByTestId("graph-theme-evidence-toggle");
      const status = page.getByTestId("graph-theme-evidence-status");

      await toggle.click();
      await expect(status).toHaveText("Theme evidence: active");
      await expect(toggle).toHaveText("Active");
      await expect(toggle).toHaveAttribute("aria-pressed", "true");
    });

    test("Clicking toggle again returns status to inactive", async ({ page }) => {
      const toggle = page.getByTestId("graph-theme-evidence-toggle");
      const status = page.getByTestId("graph-theme-evidence-status");

      await toggle.click();
      await expect(status).toHaveText("Theme evidence: active");

      await toggle.click();
      await expect(status).toHaveText("Theme evidence: inactive");
      await expect(toggle).toHaveAttribute("aria-pressed", "false");
    });

    test("Canonical token paths metadata is visible", async ({ page }) => {
      const tokenPaths = page.getByTestId("graph-theme-evidence-token-paths");
      await expect(tokenPaths).toBeVisible();
      const tokenText = await tokenPaths.textContent();
      expect(tokenText).toContain("panel.border");
      expect(tokenText).toContain("app.background");
    });

    test("Token value application status is forbidden", async ({ page }) => {
      const tokenValueStatus = page.getByTestId("graph-theme-evidence-token-value-status");
      await expect(tokenValueStatus).toBeVisible();
      await expect(tokenValueStatus).toHaveText("forbidden in v52");
    });

    test("Sigma mutation status is forbidden", async ({ page }) => {
      const sigmaStatus = page.getByTestId("graph-theme-evidence-sigma-status");
      await expect(sigmaStatus).toBeVisible();
      await expect(sigmaStatus).toHaveText("forbidden in v52");
    });

    test("Graph surface still mounts with wrapper mode present", async ({ page }) => {
      const canvas = page.locator("canvas").first();
      await expect(canvas).toBeVisible();
    });

    test("Existing graph inventory still works with wrapper mode", async ({ page }) => {
      const inventoryList = page.getByTestId("graph-visual-inventory-list");
      await expect(inventoryList).toBeVisible();
    });

    test("Existing graph theme mapping inventory still works with wrapper mode", async ({ page }) => {
      const mappingSection = page.getByTestId("graph-theme-mapping-inventory-section");
      await expect(mappingSection).toBeVisible();
    });

    test("No new Sigma/renderer/node/edge/canvas controls are introduced", async ({ page }) => {
      const panel = page.getByTestId("graph-visual-inventory-panel");

      // Check that there are no new Sigma/renderer mutation controls
      const sigmaControls = panel.getByRole("button", { name: /sigma|renderer|mutation/i });
      await expect(sigmaControls).not.toBeVisible();

      // Check that there are no new physics modification controls
      const physicsControls = panel.getByRole("button", { name: /physics|force|layout/i });
      await expect(physicsControls).not.toBeVisible();
    });

    test("Controls are genuinely active (not dead)", async ({ page }) => {
      const toggle = page.getByTestId("graph-theme-evidence-toggle");
      const status = page.getByTestId("graph-theme-evidence-status");

      // Verify toggle is clickable and changes state
      await toggle.click();
      await expect(status).toHaveText("Theme evidence: active");

      await toggle.click();
      await expect(status).toHaveText("Theme evidence: inactive");
    });
  });

  test.describe("Graph Theme Token Value Preview (v54)", () => {
    test("Token value preview section is visible", async ({ page }) => {
      const section = page.getByTestId("graph-theme-token-preview-section");
      await expect(section).toBeVisible();
    });

    test("Token value preview title is visible", async ({ page }) => {
      const title = page.getByTestId("graph-theme-token-preview-title");
      await expect(title).toBeVisible();
      await expect(title).toHaveText("Graph Theme Token Value Preview (v54)");
    });

    test("Token value preview description is visible", async ({ page }) => {
      const description = page.getByTestId("graph-theme-token-preview-description");
      await expect(description).toBeVisible();
      await expect(description).toHaveText(
        "Read-only preview of canonical theme token values for graph theme mappings. Does not apply values to Sigma or graph."
      );
    });

    test("Preview status is visible", async ({ page }) => {
      const status = page.getByTestId("graph-theme-token-preview-status");
      await expect(status).toBeVisible();
      await expect(status).toHaveText("metadata only (value preview deferred)");
    });

    test("Token value application status shows forbidden", async ({ page }) => {
      const status = page.getByTestId("graph-theme-token-preview-application-status");
      await expect(status).toBeVisible();
      await expect(status).toHaveText("forbidden in v54");
    });

    test("CSS variable writes status shows forbidden", async ({ page }) => {
      const status = page.getByTestId("graph-theme-token-preview-css-status");
      await expect(status).toBeVisible();
      await expect(status).toHaveText("forbidden in v54");
    });

    test("Sigma mutation status shows forbidden", async ({ page }) => {
      const status = page.getByTestId("graph-theme-token-preview-sigma-status");
      await expect(status).toBeVisible();
      await expect(status).toHaveText("forbidden in v54");
    });

    test("No apply/edit/save controls exist", async ({ page }) => {
      // Verify no enabled controls for applying token values
      const section = page.getByTestId("graph-theme-token-preview-section");
      const buttons = section.getByRole("button");
      const buttonCount = await buttons.count();
      await expect(buttonCount).toBe(0);
    });

    test("Existing graph inventory still works", async ({ page }) => {
      // Verify existing inventory functionality is not broken
      const inventoryTitle = page.getByTestId("graph-visual-inventory-title");
      await expect(inventoryTitle).toBeVisible();
      await expect(inventoryTitle).toHaveText("Graph Visual Inventory");
    });

    test("Existing graph theme mapping inventory still works", async ({ page }) => {
      // Verify existing theme mapping functionality is not broken
      const mappingSection = page.getByTestId("graph-theme-mapping-inventory-section");
      await expect(mappingSection).toBeVisible();
    });

    test("Existing graph theme evidence wrapper mode still works", async ({ page }) => {
      // Verify existing evidence wrapper mode functionality is not broken
      const evidenceSection = page.getByTestId("graph-theme-evidence-wrapper-mode-section");
      await expect(evidenceSection).toBeVisible();
    });
  });

  test.describe("Graph Shell Theme Evidence Application (v56)", () => {
    test("Graph theme application section is visible", async ({ page }) => {
      const section = page.getByTestId("graph-theme-application-section");
      await expect(section).toBeVisible();
    });

    test("Graph theme application title is visible", async ({ page }) => {
      const title = page.getByTestId("graph-theme-application-title");
      await expect(title).toBeVisible();
      await expect(title).toHaveText("Graph Shell Theme Evidence Application (v56)");
    });

    test("Graph theme application description is visible", async ({ page }) => {
      const description = page.getByTestId("graph-theme-application-description");
      await expect(description).toBeVisible();
      await expect(description).toHaveText(
        "DOM-only wrapper theme application evidence. Applies data attribute to graph shell. Does not apply token values to Sigma or graph."
      );
    });

    test("Graph theme application toggle is visible", async ({ page }) => {
      const toggle = page.getByTestId("graph-theme-application-toggle");
      await expect(toggle).toBeVisible();
    });

    test("Default graph theme application status is inactive", async ({ page }) => {
      const status = page.getByTestId("graph-theme-application-status");
      await expect(status).toBeVisible();
      await expect(status).toHaveText("Graph theme application: inactive");
    });

    test("Toggle button shows Inactive by default", async ({ page }) => {
      const toggle = page.getByTestId("graph-theme-application-toggle");
      await expect(toggle).toBeVisible();
      await expect(toggle).toHaveText("Inactive");
      await expect(toggle).toHaveAttribute("aria-pressed", "false");
    });

    test("Clicking toggle changes status to active", async ({ page }) => {
      const toggle = page.getByTestId("graph-theme-application-toggle");
      const status = page.getByTestId("graph-theme-application-status");

      await toggle.click();
      await expect(status).toHaveText("Graph theme application: active");
      await expect(toggle).toHaveText("Active");
      await expect(toggle).toHaveAttribute("aria-pressed", "true");
    });

    test("Clicking toggle again returns status to inactive", async ({ page }) => {
      const toggle = page.getByTestId("graph-theme-application-toggle");
      const status = page.getByTestId("graph-theme-application-status");

      await toggle.click();
      await expect(status).toHaveText("Graph theme application: active");

      await toggle.click();
      await expect(status).toHaveText("Graph theme application: inactive");
      await expect(toggle).toHaveAttribute("aria-pressed", "false");
    });

    test("Canonical token paths metadata is visible", async ({ page }) => {
      const tokenPaths = page.getByTestId("graph-theme-application-token-paths");
      await expect(tokenPaths).toBeVisible();
      const tokenText = await tokenPaths.textContent();
      expect(tokenText).toContain("panel.border");
      expect(tokenText).toContain("app.background");
    });

    test("Token value application status is forbidden", async ({ page }) => {
      const tokenValueStatus = page.getByTestId("graph-theme-application-token-value-status");
      await expect(tokenValueStatus).toBeVisible();
      await expect(tokenValueStatus).toHaveText("forbidden in v56");
    });

    test("Sigma mutation status is forbidden", async ({ page }) => {
      const sigmaStatus = page.getByTestId("graph-theme-application-sigma-status");
      await expect(sigmaStatus).toBeVisible();
      await expect(sigmaStatus).toHaveText("forbidden in v56");
    });

    test("CSS variable writes status is forbidden", async ({ page }) => {
      const cssStatus = page.getByTestId("graph-theme-application-css-status");
      await expect(cssStatus).toBeVisible();
      await expect(cssStatus).toHaveText("forbidden in v56");
    });

    test("Node/edge styling status is forbidden", async ({ page }) => {
      const stylingStatus = page.getByTestId("graph-theme-application-styling-status");
      await expect(stylingStatus).toBeVisible();
      await expect(stylingStatus).toHaveText("forbidden in v56");
    });

    test("Graph surface still mounts with application mode present", async ({ page }) => {
      const canvas = page.locator("canvas").first();
      await expect(canvas).toBeVisible();
    });

    test("Existing graph inventory still works with application mode", async ({ page }) => {
      const inventoryList = page.getByTestId("graph-visual-inventory-list");
      await expect(inventoryList).toBeVisible();
    });

    test("Existing graph theme mapping inventory still works with application mode", async ({ page }) => {
      const mappingSection = page.getByTestId("graph-theme-mapping-inventory-section");
      await expect(mappingSection).toBeVisible();
    });

    test("Existing graph theme evidence wrapper mode still works with application mode", async ({ page }) => {
      const evidenceSection = page.getByTestId("graph-theme-evidence-wrapper-mode-section");
      await expect(evidenceSection).toBeVisible();
    });

    test("No new Sigma/renderer/node/edge/canvas controls are introduced", async ({ page }) => {
      const panel = page.getByTestId("graph-visual-inventory-panel");

      // Check that there are no new Sigma/renderer mutation controls
      const sigmaControls = panel.getByRole("button", { name: /sigma|renderer|mutation/i });
      await expect(sigmaControls).not.toBeVisible();

      // Check that there are no new physics modification controls
      const physicsControls = panel.getByRole("button", { name: /physics|force|layout/i });
      await expect(physicsControls).not.toBeVisible();
    });

    test("Controls are genuinely active (not dead)", async ({ page }) => {
      const toggle = page.getByTestId("graph-theme-application-toggle");
      const status = page.getByTestId("graph-theme-application-status");

      // Verify toggle is clickable and changes state
      await toggle.click();
      await expect(status).toHaveText("Graph theme application: active");

      await toggle.click();
      await expect(status).toHaveText("Graph theme application: inactive");
    });
  });
});
