// SPDX-License-Identifier: Apache-2.0
//
// Regression cover for the commitSource verb.
//
// Before commitSource, every "load this source" path wrote sources.active directly.
// useGraphSourceSummary keys its effect on [sources.active, sources.refreshToken], so
// committing the adapter that was ALREADY active left the dep array byte-identical and
// the load never re-fired. Swapping the file under a live adapter silently did nothing,
// which made the error card's "Different config" escape hatch permanently dead.
//
// Each test here fails against the pre-commitSource tree.
import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.resolve(__dirname, "../fixtures/cytoscape");

const SAMPLE = path.join(FIXTURE_DIR, "sample-graph.json"); // 10 nodes normalized
const FLAT = path.join(FIXTURE_DIR, "flat-form.json"); //  4 nodes normalized
const MISSING = path.join(FIXTURE_DIR, "does-not-exist.json");

/** Install a path-aware read_user_file mock so one page can serve several fixtures. */
async function mockFiles(page: import("@playwright/test").Page) {
  const files: Record<string, string> = {
    [SAMPLE]: fs.readFileSync(SAMPLE, "utf-8"),
    [FLAT]: fs.readFileSync(FLAT, "utf-8"),
  };
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate((table) => {
    (window as any).__lwTauriMock = {
      ...(window as any).__lwTauriMock,
      read_user_file: (args: { path: string }) => {
        const content = table[args.path];
        if (content === undefined) throw new Error(`ENOENT: no such file: ${args.path}`);
        return content;
      },
    };
  }, files);
}

async function waitForSettled(page: import("@playwright/test").Page) {
  await page.waitForFunction(
    () => {
      const s = (window as any).__lwGraphSummary;
      return s && (s.status === "loaded" || s.status === "error");
    },
    { timeout: 10_000 },
  );
  return page.evaluate(() => (window as any).__lwGraphSummary);
}

/** Commit a cytoscape-json source at `filePath` through the store's commit verb. */
async function commit(page: import("@playwright/test").Page, filePath: string) {
  await page.evaluate((fp) => {
    (window as any).__lwStore
      .getState()
      .commitSource("cytoscape-json", { adapterId: "cytoscape-json", filePath: fp });
  }, filePath);
}

test("swapping the file under an already-active adapter reloads the graph", async ({ page }) => {
  await mockFiles(page);

  await commit(page, SAMPLE);
  let summary = await waitForSettled(page);
  expect(summary.status).toBe("loaded");
  expect(summary.normalizedNodes).toHaveLength(10);

  // Same adapter, different file. sources.active does not change — only refreshToken does.
  await commit(page, FLAT);
  await page.waitForFunction(
    () => (window as any).__lwGraphSummary?.normalizedNodes?.length === 4,
    { timeout: 10_000 },
  );

  summary = await page.evaluate(() => (window as any).__lwGraphSummary);
  expect(summary.status).toBe("loaded");
  expect(summary.normalizedNodes).toHaveLength(4);
});

test("re-committing the identical source reloads rather than no-opping", async ({ page }) => {
  await mockFiles(page);

  await commit(page, SAMPLE);
  await waitForSettled(page);

  const tokenBefore = await page.evaluate(
    () => (window as any).__lwStore.getState().settings.sources.refreshToken,
  );

  // Identical adapter, identical config: the load must still fire.
  await commit(page, SAMPLE);
  const summary = await waitForSettled(page);

  const tokenAfter = await page.evaluate(
    () => (window as any).__lwStore.getState().settings.sources.refreshToken,
  );

  expect(tokenAfter).toBe(tokenBefore + 1);
  expect(summary.status).toBe("loaded");
  expect(summary.normalizedNodes).toHaveLength(10);
});

test('the error card\'s "Different config" hatch can actually recover the load', async ({ page }) => {
  await mockFiles(page);

  // Land in the error state on a bad path — deliberately via the OLD setSetting route, so
  // the only thing this test exercises is the picker's Load button. Against the pre-fix
  // tree it therefore fails on the real defect (Load no-ops) rather than on a missing API.
  await page.evaluate((fp) => {
    const store = (window as any).__lwStore;
    store.getState().setSetting("sources.configurations", {
      ...store.getState().settings.sources.configurations,
      "cytoscape-json": { adapterId: "cytoscape-json", filePath: fp },
    });
    store.getState().setSetting("sources.active", "cytoscape-json");
  }, MISSING);

  const failed = await waitForSettled(page);
  expect(failed.status).toBe("error");

  const errorEscapes = page.getByTestId("graph-sources-error-escapes");
  await expect(errorEscapes).toBeVisible();

  // "Different config" reopens the picker with the failing adapter pre-selected.
  await page.getByTestId("graph-sources-different-config-btn").click();
  await expect(page.getByTestId("graph-source-picker-load")).toBeVisible();

  // Correct the path the way a user does — by typing into the form. (Poking the store
  // directly would no longer work, and shouldn't: the picker edits a draft seeded at mount,
  // so post-mount store writes are deliberately invisible to it.)
  await page.getByTestId("adapter-config-cytoscape-file-path").fill(SAMPLE);

  // Load commits the same adapter it failed on — the exact case that used to no-op.
  await page.getByTestId("graph-source-picker-load").click();

  await page.waitForFunction(
    () => (window as any).__lwGraphSummary?.status === "loaded",
    { timeout: 10_000 },
  );
  const recovered = await page.evaluate(() => (window as any).__lwGraphSummary);
  expect(recovered.normalizedNodes).toHaveLength(10);
});
