// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";
import { openGraphSources } from "./helpers/tiles";

// Minimal v0 self-graph fixture. Enough for adaptSelfGraphToSigma to produce a
// loaded summary without touching the real filesystem.
const MOCK_SELF_GRAPH_JSON = JSON.stringify({
  nodes: [{ id: "a", label: "Node A", type: "doc", sourceAdapter: "self-graph", metadata: {} }],
  edges: [],
  metadata: {
    adapterId: "self-graph-yaml-frontmatter",
    createdAt: "2026-01-01T00:00:00Z",
    inputSummary: "mock",
    nodeCount: 1,
    edgeCount: 0,
    warnings: [],
  },
});

// Sets up the two Tauri mocks that loadSelfGraph() needs and waits until
// __lwGraphSummary reports status==="loaded" for the self-graph adapter.
// The Regenerate button is only rendered in the isLoadedState branch, so any
// test that wants to click it must call this first.
//
// The self-graph load fires on page mount (sources.active defaults to self-graph).
// By the time this helper runs, that attempt has already completed and likely
// failed (no mock in place yet). We bump refreshToken to re-trigger the effect
// with the mocks now installed.
async function mockAndWaitForSelfGraphLoaded(page: import("@playwright/test").Page): Promise<void> {
  await page.evaluate((json) => {
    (window as any).__lwTauriMock = {
      ...(window as any).__lwTauriMock,
      get_project_root: async () => "/mock/project",
      read_file: async () => json,
    };
    // Re-trigger useGraphSourceSummary's effect now that mocks are in place.
    const store = (window as any).__lwStore;
    if (store) {
      const tok = store.getState().settings.sources.refreshToken ?? 0;
      store.getState().setSetting("sources.refreshToken", tok + 1);
    }
  }, MOCK_SELF_GRAPH_JSON);

  await page.waitForFunction(
    () => {
      const s = (window as any).__lwGraphSummary;
      return s?.status === "loaded" && s?.sourceId === "self-graph-yaml-frontmatter";
    },
    { timeout: 10000 },
  );
}

test("Graph Sources tile renders with Regenerate button", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openGraphSources(page);
  await mockAndWaitForSelfGraphLoaded(page);

  const tile = page.getByTestId("graph-sources-tile-content");
  await expect(tile).toBeVisible();

  const regenBtn = page.getByTestId("graph-sources-regenerate-btn");
  await expect(regenBtn).toBeVisible();
  await expect(regenBtn).toBeEnabled();
});

test("Graph Sources Regenerate button — success path updates refreshToken", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openGraphSources(page);
  await mockAndWaitForSelfGraphLoaded(page);

  const tokenBefore = await page.evaluate(
    () => (window as any).__lwStore?.getState().settings.sources.refreshToken ?? 0,
  );

  // Spread to preserve read_file mock — Regenerate increments refreshToken which
  // re-triggers loadSelfGraph, so read_file must still be available.
  await page.evaluate(() => {
    (window as any).__lwTauriMock = {
      ...(window as any).__lwTauriMock,
      run_script: async () => ({ stdout: "done", stderr: "", exit_code: 0 }),
    };
  });

  const regenBtn = page.getByTestId("graph-sources-regenerate-btn");
  await regenBtn.click();

  // Audited 2026-06-09 (v111.3): correct web-first pattern (polling for store state change).
  await page.waitForFunction(
    (before) => {
      const token = (window as any).__lwStore?.getState().settings.sources.refreshToken ?? 0;
      return token > before;
    },
    tokenBefore,
    { timeout: 5000 },
  );

  const tokenAfter = await page.evaluate(
    () => (window as any).__lwStore?.getState().settings.sources.refreshToken ?? 0,
  );
  expect(tokenAfter).toBe(tokenBefore + 1);

  const lastGenerated = page.getByTestId("graph-sources-last-generated");
  await expect(lastGenerated).toBeVisible();
});

test("Graph Sources Regenerate button — error path shows error testid", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openGraphSources(page);
  await mockAndWaitForSelfGraphLoaded(page);

  await page.evaluate(() => {
    (window as any).__lwTauriMock = {
      ...(window as any).__lwTauriMock,
      run_script: async () => ({ stdout: "", stderr: "Node not found", exit_code: 127 }),
    };
  });

  const regenBtn = page.getByTestId("graph-sources-regenerate-btn");
  await regenBtn.click();

  const errorDiv = page.getByTestId("graph-sources-regenerate-error");
  await expect(errorDiv).toBeVisible();
  await expect(errorDiv).toContainText("Node not found");

  await expect(regenBtn).toHaveText("Retry");
});

test("Graph Sources Regenerate button disabled during running state", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openGraphSources(page);
  await mockAndWaitForSelfGraphLoaded(page);

  await page.evaluate(() => {
    (window as any).__lwTauriMock = {
      ...(window as any).__lwTauriMock,
      run_script: () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ stdout: "", stderr: "", exit_code: 0 }), 500),
        ),
    };
  });

  const regenBtn = page.getByTestId("graph-sources-regenerate-btn");
  await regenBtn.click();

  await expect(regenBtn).toBeDisabled();
  const status = page.getByTestId("graph-sources-regenerate-status");
  await expect(status).toBeVisible();
});

// ── tile state machine (added v113.0) ─────────────────────────────────────────

test("empty pane: visible when no active adapter is set", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Clear the active adapter before the tile is open so empty pane renders on mount
  await page.evaluate(() => {
    (window as any).__lwStore?.getState().setSetting("sources.active", null);
  });

  await openGraphSources(page);

  await expect(page.getByTestId("graph-sources-empty-pane")).toBeVisible();
  await expect(page.getByTestId("graph-sources-open-picker-btn")).toBeVisible();
  await expect(page.getByTestId("graph-sources-open-picker-btn")).toHaveText("Select graph source");
});

test("cancel load button: visible during an in-flight load, disappears after cancel", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openGraphSources(page);

  // Mock read_user_file to hang indefinitely — keeps the adapter in loading state
  await page.evaluate(() => {
    (window as any).__lwTauriMock = {
      ...(window as any).__lwTauriMock,
      read_user_file: () => new Promise(() => {}),
    };
    const store = (window as any).__lwStore;
    store.getState().setSetting("sources.active", "csv-edge-list");
    store.getState().setSetting("sources.configurations", {
      ...store.getState().settings.sources.configurations,
      "csv-edge-list": { adapterId: "csv-edge-list", filePath: "/mock/edges.csv" },
    });
  });

  const cancelBtn = page.getByTestId("graph-sources-cancel-load-btn");
  await expect(cancelBtn).toBeVisible({ timeout: 5000 });

  await cancelBtn.click();

  await expect(cancelBtn).not.toBeVisible({ timeout: 3000 });
});

test("error state: three escape buttons visible", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openGraphSources(page);

  // csv-edge-list with no filePath → "File path not configured" error
  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    store.getState().setSetting("sources.active", "csv-edge-list");
    store.getState().setSetting("sources.configurations", {
      ...store.getState().settings.sources.configurations,
      "csv-edge-list": { adapterId: "csv-edge-list" },
    });
  });

  await page.waitForFunction(
    () => (window as any).__lwGraphSummary?.status === "error",
    { timeout: 10000 },
  );

  await expect(page.getByTestId("graph-sources-error-escapes")).toBeVisible();
  await expect(page.getByTestId("graph-sources-try-again-btn")).toBeVisible();
  await expect(page.getByTestId("graph-sources-different-config-btn")).toBeVisible();
  await expect(page.getByTestId("graph-sources-different-adapter-btn")).toBeVisible();
});

test("loaded state: change source button visible", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openGraphSources(page);

  // Mock a minimal valid CSV so the adapter loads successfully
  await page.evaluate(() => {
    (window as any).__lwTauriMock = {
      ...(window as any).__lwTauriMock,
      read_user_file: () => "source,target\na,b\n",
    };
    const store = (window as any).__lwStore;
    store.getState().setSetting("sources.active", "csv-edge-list");
    store.getState().setSetting("sources.configurations", {
      ...store.getState().settings.sources.configurations,
      "csv-edge-list": {
        adapterId: "csv-edge-list",
        filePath: "/mock/edges.csv",
        hasHeader: true,
        sourceColumn: "source",
        targetColumn: "target",
      },
    });
  });

  await page.waitForFunction(
    () => (window as any).__lwGraphSummary?.status === "loaded",
    { timeout: 10000 },
  );

  await expect(page.getByTestId("graph-sources-change-source-btn")).toBeVisible();
});
