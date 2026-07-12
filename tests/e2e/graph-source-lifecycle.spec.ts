// SPDX-License-Identifier: Apache-2.0
//
// The source lifecycle used to live in a plain hook with local useState, instantiated four
// times (AppShell, the Graph Sources tile, StatusCluster, GraphInspectorTileContent). That
// meant four independent loads per switch — and cancelLoad flipped one of the four refs, so
// "Cancel" muted the tile while the canvas and the topbar finished loading the graph you had
// just cancelled, and sources.active was never reverted so the switch happened anyway.
//
// It is now one store, one lifecycle (mounted in AppShell), and read-only views.
import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { openGraphSources } from "./helpers/tiles";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE = path.resolve(__dirname, "../fixtures/cytoscape/sample-graph.json"); // 10 nodes
const SLOW_CSV = "/slow/edges.csv";

/**
 * Mock read_user_file with a call counter. The .csv path resolves slowly, so a load of it can
 * actually be cancelled mid-flight.
 */
async function installMock(page: import("@playwright/test").Page, slowMs: number) {
  const json = fs.readFileSync(SAMPLE, "utf-8");
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(
    ({ jsonContent, delay }) => {
      (window as any).__lwReadCount = 0;
      (window as any).__lwTauriMock = {
        ...(window as any).__lwTauriMock,
        read_user_file: (args: { path: string }) => {
          (window as any).__lwReadCount++;
          if (args.path.endsWith(".csv")) {
            return new Promise((resolve) =>
              setTimeout(() => resolve("source,target\na,b\nb,c\n"), delay),
            );
          }
          return jsonContent;
        },
      };
    },
    { jsonContent: json, delay: slowMs },
  );
}

const settled = (page: import("@playwright/test").Page) =>
  page.waitForFunction(
    () => {
      const s = (window as any).__lwGraphSummary;
      return s && (s.status === "loaded" || s.status === "error");
    },
    { timeout: 10_000 },
  );

const activeAdapter = (page: import("@playwright/test").Page) =>
  page.evaluate(() => (window as any).__lwStore.getState().settings.sources.active);

async function loadCytoscape(page: import("@playwright/test").Page) {
  await page.evaluate((fp) => {
    (window as any).__lwStore
      .getState()
      .commitSource("cytoscape-json", { adapterId: "cytoscape-json", filePath: fp });
  }, SAMPLE);
  await settled(page);
}

test("a source switch triggers ONE load, not one per consumer", async ({ page }) => {
  await installMock(page, 0);

  await page.evaluate(() => ((window as any).__lwReadCount = 0));
  await loadCytoscape(page);

  const reads = await page.evaluate(() => (window as any).__lwReadCount);

  // With four copies of the lifecycle this was 4 (x2 again under StrictMode, which dev — and
  // therefore Playwright — runs). One owner means at most StrictMode's double-invoke.
  expect(reads).toBeGreaterThan(0);
  expect(reads).toBeLessThanOrEqual(2);
});

test("Cancel restores the previous graph AND reverts sources.active", async ({ page }) => {
  await installMock(page, 4000);

  // Land on a real graph first, so there is something to go back to.
  await loadCytoscape(page);
  const before = await page.evaluate(() => (window as any).__lwGraphSummary);
  expect(before.normalizedNodes).toHaveLength(10);
  expect(await activeAdapter(page)).toBe("cytoscape-json");

  await openGraphSources(page);

  // Switch to a source that will take 4s to read, then cancel it mid-flight.
  await page.evaluate((fp) => {
    (window as any).__lwStore
      .getState()
      .commitSource("csv-edge-list", { adapterId: "csv-edge-list", filePath: fp });
  }, SLOW_CSV);

  const cancel = page.getByTestId("graph-sources-cancel-load-btn");
  await expect(cancel).toBeVisible({ timeout: 5000 });
  await cancel.click();

  // The graph we were on is back...
  await expect
    .poll(
      async () =>
        page.evaluate(() => (window as any).__lwGraphSummary?.normalizedNodes?.length),
      { timeout: 5000 },
    )
    .toBe(10);

  // ...and the active adapter went back with it. Leaving sources.active on the cancelled
  // adapter would mean the switch silently happened despite the cancel — the store and the
  // screen telling two different stories.
  expect(await activeAdapter(page)).toBe("cytoscape-json");

  // And the discarded load must not land later and clobber the restored state.
  await page.waitForTimeout(4500);
  const after = await page.evaluate(() => (window as any).__lwGraphSummary);
  expect(after.normalizedNodes).toHaveLength(10);
  expect(await activeAdapter(page)).toBe("cytoscape-json");
});
