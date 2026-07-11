// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";
import { openGraphSources } from "./helpers/tiles";

// Opens the graph sources tile with no active source (empty pane), then
// clicks the CTA to open the picker and waits for it to appear.
async function openPicker(page: import("@playwright/test").Page): Promise<void> {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Clear active source before mounting so empty pane renders immediately.
  await page.evaluate(() => {
    (window as any).__lwStore?.getState().setSetting("sources.active", null);
  });

  await openGraphSources(page);

  await page.getByTestId("graph-sources-open-picker-btn").click();
  await expect(page.getByTestId("graph-source-picker-backdrop")).toBeVisible({ timeout: 3000 });
  // Default tab is "Open new"; scan input lives there.
  await expect(page.getByTestId("graph-source-scan-input")).toBeVisible();
}

// ── file-based heuristics (pure path logic, no Tauri filesystem calls) ───────

test("scan: .csv path → strong match for csv-edge-list", async ({ page }) => {
  await openPicker(page);

  await page.getByTestId("graph-source-scan-input").fill("/home/user/data/edges.csv");
  await page.getByTestId("graph-source-scan-btn").click();

  await expect(page.getByTestId("graph-source-scan-results")).toBeVisible({ timeout: 5000 });

  const candidate = page.getByTestId("graph-source-scan-candidate-csv-edge-list");
  await expect(candidate).toBeVisible();
  await expect(candidate).toContainText("CSV Edge List");
  await expect(candidate).toContainText("strong match");
});

test("scan: package.json path → strong match for package-dependency", async ({ page }) => {
  await openPicker(page);

  await page.getByTestId("graph-source-scan-input").fill("/home/user/project/package.json");
  await page.getByTestId("graph-source-scan-btn").click();

  await expect(page.getByTestId("graph-source-scan-results")).toBeVisible({ timeout: 5000 });

  const candidate = page.getByTestId("graph-source-scan-candidate-package-dependency");
  await expect(candidate).toBeVisible();
  await expect(candidate).toContainText("strong match");
  await expect(candidate).toContainText("package.json manifest detected");
});

test("scan: .cerebra/graph.json path → strong match for cerebra-snapshot", async ({ page }) => {
  await openPicker(page);

  await page.getByTestId("graph-source-scan-input").fill("/home/user/vault/.cerebra/graph.json");
  await page.getByTestId("graph-source-scan-btn").click();

  await expect(page.getByTestId("graph-source-scan-results")).toBeVisible({ timeout: 5000 });

  const candidate = page.getByTestId("graph-source-scan-candidate-cerebra-snapshot");
  await expect(candidate).toBeVisible();
  await expect(candidate).toContainText("strong match");
});

test("scan: .json path → possible match for cytoscape-json", async ({ page }) => {
  await openPicker(page);

  // A plain .json file that isn't a .cerebra/graph.json path
  await page.getByTestId("graph-source-scan-input").fill("/home/user/exports/network.json");
  await page.getByTestId("graph-source-scan-btn").click();

  await expect(page.getByTestId("graph-source-scan-results")).toBeVisible({ timeout: 5000 });

  const candidate = page.getByTestId("graph-source-scan-candidate-cytoscape-json");
  await expect(candidate).toBeVisible();
  await expect(candidate).toContainText("possible");
});

test("scan: unrecognized extension → no-match message and adapter list stays visible", async ({ page }) => {
  await openPicker(page);

  await page.getByTestId("graph-source-scan-input").fill("/home/user/data.xml");
  await page.getByTestId("graph-source-scan-btn").click();

  await expect(page.getByTestId("graph-source-scan-no-match")).toBeVisible({ timeout: 5000 });
  await expect(page.getByTestId("graph-source-scan-no-match")).toContainText("No adapter recognized");
  // Adapter list always visible when no scan results
  await expect(page.locator(".lw-picker__adapter-list")).toBeVisible();
});

// ── candidate selection ───────────────────────────────────────────────────────

test("scan: clicking a candidate pre-fills config and switches to adapter list", async ({ page }) => {
  await openPicker(page);

  await page.getByTestId("graph-source-scan-input").fill("/home/user/edges.csv");
  await page.getByTestId("graph-source-scan-btn").click();
  await expect(page.getByTestId("graph-source-scan-results")).toBeVisible({ timeout: 5000 });

  await page.getByTestId("graph-source-scan-candidate-csv-edge-list").click();

  // Scan results clear; adapter list re-appears with csv-edge-list selected
  await expect(page.getByTestId("graph-source-scan-results")).not.toBeVisible();
  const card = page.getByTestId("graph-source-adapter-card-csv-edge-list");
  await expect(card).toBeVisible();
  await expect(card).toHaveClass(/lw-picker__adapter-card--selected/);

  // Config is pre-filled with the scanned path
  const filePath = await page.evaluate(
    () => (window as any).__lwStore?.getState().settings.sources.configurations["csv-edge-list"]?.filePath,
  );
  expect(filePath).toBe("/home/user/edges.csv");
});

test("scan: 'Different type' button reveals adapter list below results", async ({ page }) => {
  await openPicker(page);

  // .json matches cytoscape-json → results show; adapter list hides
  await page.getByTestId("graph-source-scan-input").fill("/home/user/network.json");
  await page.getByTestId("graph-source-scan-btn").click();
  await expect(page.getByTestId("graph-source-scan-results")).toBeVisible({ timeout: 5000 });
  await expect(page.locator(".lw-picker__adapter-list")).not.toBeVisible();

  await page.getByTestId("graph-source-show-all-adapters-btn").click();

  await expect(page.locator(".lw-picker__adapter-list")).toBeVisible();
});

// ── directory-based scan (requires Tauri mock for list_files) ─────────────────

test("scan: directory with .md files → markdown-vault weak match", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.evaluate(() => {
    (window as any).__lwTauriMock = {
      ...(window as any).__lwTauriMock,
      list_files: async () => ["note1.md", "note2.md", "index.md"],
    };
    (window as any).__lwStore?.getState().setSetting("sources.active", null);
  });

  await openGraphSources(page);
  await page.getByTestId("graph-sources-open-picker-btn").click();
  await expect(page.getByTestId("graph-source-picker-backdrop")).toBeVisible({ timeout: 3000 });

  await page.getByTestId("graph-source-scan-input").fill("/home/user/my-vault");
  await page.getByTestId("graph-source-scan-btn").click();

  await expect(page.getByTestId("graph-source-scan-results")).toBeVisible({ timeout: 5000 });

  const candidate = page.getByTestId("graph-source-scan-candidate-markdown-vault");
  await expect(candidate).toBeVisible();
  await expect(candidate).toContainText("weak match");
  await expect(candidate).toContainText(".md file");
});

test("scan: Enter key in path input triggers scan", async ({ page }) => {
  await openPicker(page);

  const input = page.getByTestId("graph-source-scan-input");
  await input.fill("/home/user/graph-data.csv");
  await input.press("Enter");

  await expect(page.getByTestId("graph-source-scan-results")).toBeVisible({ timeout: 5000 });
  await expect(page.getByTestId("graph-source-scan-candidate-csv-edge-list")).toBeVisible();
});
