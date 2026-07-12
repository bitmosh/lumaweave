// SPDX-License-Identifier: Apache-2.0
//
// Cover for the picker's draft-config layer.
//
// Before it, AdapterConfigForm wrote every keystroke straight into persisted settings.
// Opening the picker merely to LOOK at a config and then cancelling destroyed it — the
// roadmap's "configuration non-destructive until committed / Cancel returns the user to
// where they were with no change" was not true of the code.
//
// Also covers the scan-evidence rule: selecting a candidate must not wipe the ranked list
// ("automated decisions are inspectable — selection reversible").
import { test, expect } from "@playwright/test";
import { openGraphSources } from "./helpers/tiles";

const ORIGINAL = "/original/keep-me.json";
const TYPED = "/scratch/typed-but-abandoned.json";

async function openPickerWithStoredConfig(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.evaluate((original) => {
    const store = (window as any).__lwStore;
    store.getState().setSetting("sources.active", null);
    store.getState().setSetting("sources.configurations", {
      ...store.getState().settings.sources.configurations,
      "cytoscape-json": { adapterId: "cytoscape-json", filePath: original },
    });
  }, ORIGINAL);

  await openGraphSources(page);
  await page.getByTestId("graph-sources-open-picker-btn").click();
  await expect(page.getByTestId("graph-source-picker-backdrop")).toBeVisible({ timeout: 3000 });

  // Select the Cytoscape adapter to reveal its config form.
  await page.getByTestId("graph-source-adapter-card-cytoscape-json").click();
  await expect(page.getByTestId("adapter-config-cytoscape-file-path")).toBeVisible();
}

const storedPath = (page: import("@playwright/test").Page) =>
  page.evaluate(
    () =>
      (window as any).__lwStore.getState().settings.sources.configurations["cytoscape-json"]
        ?.filePath,
  );

test("editing config in the picker does not touch persisted settings until Load", async ({ page }) => {
  await openPickerWithStoredConfig(page);

  await page.getByTestId("adapter-config-cytoscape-file-path").fill(TYPED);

  // The field shows the edit, but nothing has been persisted.
  await expect(page.getByTestId("adapter-config-cytoscape-file-path")).toHaveValue(TYPED);
  expect(await storedPath(page)).toBe(ORIGINAL);
});

test("Cancel discards config edits and leaves the working source intact", async ({ page }) => {
  await openPickerWithStoredConfig(page);

  await page.getByTestId("adapter-config-cytoscape-file-path").fill(TYPED);
  await page.getByTestId("graph-source-picker-cancel").click();
  await expect(page.getByTestId("graph-source-picker-backdrop")).toBeHidden();

  expect(await storedPath(page)).toBe(ORIGINAL);
});

test("Escape discards config edits too", async ({ page }) => {
  await openPickerWithStoredConfig(page);

  await page.getByTestId("adapter-config-cytoscape-file-path").fill(TYPED);
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("graph-source-picker-backdrop")).toBeHidden();

  expect(await storedPath(page)).toBe(ORIGINAL);
});

test("Load commits the draft — the edit survives exactly when the user asks for it", async ({ page }) => {
  await openPickerWithStoredConfig(page);

  await page.getByTestId("adapter-config-cytoscape-file-path").fill(TYPED);
  await page.getByTestId("graph-source-picker-load").click();
  await expect(page.getByTestId("graph-source-picker-backdrop")).toBeHidden();

  expect(await storedPath(page)).toBe(TYPED);
});

test("selecting a scan candidate keeps the ranked list on screen", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    (window as any).__lwStore?.getState().setSetting("sources.active", null);
  });
  await openGraphSources(page);
  await page.getByTestId("graph-sources-open-picker-btn").click();
  await expect(page.getByTestId("graph-source-picker-backdrop")).toBeVisible({ timeout: 3000 });

  await page.getByTestId("graph-source-scan-input").fill("/home/user/data/edges.csv");
  await page.getByTestId("graph-source-scan-btn").click();
  await expect(page.getByTestId("graph-source-scan-results")).toBeVisible({ timeout: 5000 });

  await page.getByTestId("graph-source-scan-candidate-csv-edge-list").click();

  // The evidence survives the choice: the candidate list is still there, the chosen row is
  // marked, and its config form has expanded in place.
  await expect(page.getByTestId("graph-source-scan-results")).toBeVisible();
  await expect(page.getByTestId("graph-source-scan-candidate-csv-edge-list")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    page.getByTestId("graph-source-scan-candidate-config-csv-edge-list"),
  ).toBeVisible();
});
