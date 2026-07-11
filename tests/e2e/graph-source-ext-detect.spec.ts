// SPDX-License-Identifier: Apache-2.0
/**
 * SA-003b: Extension auto-detect in GraphSourcePicker "Open new" tab.
 * Tests that typing a file path surfaces adapter suggestion chips based
 * on the filename extension — no Tauri call, no scan required.
 */
import { test, expect } from "@playwright/test";
import { openGraphSources } from "./helpers/tiles";

async function openPickerOpenNew(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openGraphSources(page);

  // Clear active adapter so EmptyPane renders
  await page.evaluate(() => {
    (window as any).__lwStore.getState().setSetting("sources.active", null);
  });

  await expect(page.getByTestId("graph-sources-open-picker-btn")).toBeVisible();
  await page.getByTestId("graph-sources-open-picker-btn").click();
  await expect(page.getByTestId("graph-source-picker-backdrop")).toBeVisible();
  await page.getByTestId("graph-source-picker-tab-open-new").click();
}

test("SA-003b: typing a .json path shows cytoscape-json suggestion chip", async ({ page }) => {
  await openPickerOpenNew(page);
  await page.getByTestId("graph-source-scan-input").fill("/home/user/exports/graph.json");
  await expect(page.getByTestId("graph-source-ext-suggestions")).toBeVisible();
  await expect(page.getByTestId("graph-source-ext-suggestion-cytoscape-json")).toBeVisible();
});

test("SA-003b: typing a .csv path shows csv-edge-list suggestion chip", async ({ page }) => {
  await openPickerOpenNew(page);
  await page.getByTestId("graph-source-scan-input").fill("/data/edges.csv");
  await expect(page.getByTestId("graph-source-ext-suggestions")).toBeVisible();
  await expect(page.getByTestId("graph-source-ext-suggestion-csv-edge-list")).toBeVisible();
});

test("SA-003b: typing a Cargo.toml path shows package-dependency suggestion chip", async ({ page }) => {
  await openPickerOpenNew(page);
  await page.getByTestId("graph-source-scan-input").fill("/home/user/project/Cargo.toml");
  await expect(page.getByTestId("graph-source-ext-suggestions")).toBeVisible();
  await expect(page.getByTestId("graph-source-ext-suggestion-package-dependency")).toBeVisible();
});

test("SA-003b: typing a directory path with no extension shows no suggestions", async ({ page }) => {
  await openPickerOpenNew(page);
  await page.getByTestId("graph-source-scan-input").fill("/home/user/projects/my-repo");
  await expect(page.getByTestId("graph-source-ext-suggestions")).not.toBeVisible();
});

test("SA-003b: clicking a suggestion chip selects that adapter", async ({ page }) => {
  await openPickerOpenNew(page);
  await page.getByTestId("graph-source-scan-input").fill("/data/graph.json");
  await page.getByTestId("graph-source-ext-suggestion-cytoscape-json").click();
  await expect(page.getByTestId("graph-source-adapter-card-cytoscape-json")).toHaveClass(/lw-picker__adapter-card--selected/);
});

test("SA-003b: suggestions clear after scan is triggered", async ({ page }) => {
  await openPickerOpenNew(page);
  const input = page.getByTestId("graph-source-scan-input");
  await input.fill("/data/graph.json");
  await expect(page.getByTestId("graph-source-ext-suggestions")).toBeVisible();
  await page.getByTestId("graph-source-scan-btn").click();
  await expect(page.getByTestId("graph-source-ext-suggestions")).not.toBeVisible();
});
