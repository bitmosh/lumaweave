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
});
