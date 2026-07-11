// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CYTOSCAPE_FIXTURE = path.resolve(__dirname, "../fixtures/cytoscape/flat-form.json");

async function loadCytoscapeFixture(page: import("@playwright/test").Page) {
  const content = fs.readFileSync(CYTOSCAPE_FIXTURE, "utf-8");
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.evaluate(
    ({ fp, fileContent }) => {
      (window as any).__lwTauriMock = {
        ...(window as any).__lwTauriMock,
        read_user_file: () => fileContent,
      };
      const store = (window as any).__lwStore;
      store.getState().setSetting("sources.configurations", {
        ...store.getState().settings.sources.configurations,
        "cytoscape-json": { adapterId: "cytoscape-json", filePath: fp },
      });
      store.getState().setSetting("sources.active", "cytoscape-json");
    },
    { fp: CYTOSCAPE_FIXTURE, fileContent: content },
  );

  await page.waitForFunction(
    () => {
      const s = (window as any).__lwGraphSummary;
      return s && (s.status === "loaded" || s.status === "error");
    },
    { timeout: 10000 },
  );
}

function getLibrary(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const store = (window as any).__lwStore;
    return store.getState().settings.sources.library as {
      pinned: any[];
      recent: any[];
    };
  });
}

// ── SA-009: push on successful load ──────────────────────────────────────────

test("SA-009: successful load pushes entry to sources.library.recent", async ({ page }) => {
  await loadCytoscapeFixture(page);
  const lib = await getLibrary(page);
  expect(lib.recent.length).toBeGreaterThan(0);
  const entry = lib.recent[0];
  expect(entry.adapterId).toBe("cytoscape-json");
  expect(entry.id).toMatch(/^cytoscape-json:/);
  expect(entry.label).toBeTruthy();
  expect(entry.loadedAt).toBeTruthy();
  expect(typeof entry.nodeCount).toBe("number");
});

test("SA-009: loading the same source again updates entry in-place (dedup, not append)", async ({ page }) => {
  await loadCytoscapeFixture(page);

  // Re-trigger load by bumping refreshToken
  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    const t = store.getState().settings.sources.refreshToken;
    store.getState().setSetting("sources.refreshToken", t + 1);
  });
  await page.waitForFunction(
    () => (window as any).__lwGraphSummary?.status === "loaded",
    { timeout: 10000 },
  );

  const lib = await getLibrary(page);
  const cyEntries = lib.recent.filter((e: any) => e.adapterId === "cytoscape-json");
  expect(cyEntries).toHaveLength(1); // still exactly one entry
});

test("SA-009: error load does NOT push to library", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.evaluate(() => {
    (window as any).__lwTauriMock = {
      ...(window as any).__lwTauriMock,
      read_user_file: () => { throw new Error("file not found"); },
    };
    const store = (window as any).__lwStore;
    store.getState().setSetting("sources.library", { pinned: [], recent: [] });
    store.getState().setSetting("sources.configurations", {
      ...store.getState().settings.sources.configurations,
      "cytoscape-json": { adapterId: "cytoscape-json", filePath: "/no/such/file.json" },
    });
    store.getState().setSetting("sources.active", "cytoscape-json");
  });

  await page.waitForFunction(
    () => (window as any).__lwGraphSummary?.status === "error",
    { timeout: 10000 },
  );

  const lib = await getLibrary(page);
  expect(lib.recent).toHaveLength(0);
  expect(lib.pinned).toHaveLength(0);
});

// ── SA-010: library tile UI ───────────────────────────────────────────────────

test("SA-010: library section appears in tile after successful load", async ({ page }) => {
  await loadCytoscapeFixture(page);
  await expect(page.getByTestId("graph-sources-library")).toBeVisible();
  await expect(page.getByTestId("graph-sources-library-recent")).toBeVisible();
});

test("SA-010: library visible in empty state when entries exist", async ({ page }) => {
  await loadCytoscapeFixture(page);
  // Clear active source to reach empty state
  await page.evaluate(() => {
    (window as any).__lwStore.getState().setSetting("sources.active", null);
  });
  // Library should still be visible, plus an "Open a graph source" button
  await expect(page.getByTestId("graph-sources-library")).toBeVisible();
  await expect(page.getByTestId("graph-sources-open-new-btn")).toBeVisible();
});

test("SA-010: clicking a library entry loads it (restores config + sets active)", async ({ page }) => {
  await loadCytoscapeFixture(page);
  // Clear active so we're in library-only state
  await page.evaluate(() => {
    (window as any).__lwStore.getState().setSetting("sources.active", null);
  });

  // Click the first library entry's load area
  const entryId = await page.evaluate(() => {
    const lib = (window as any).__lwStore.getState().settings.sources.library;
    return (lib.pinned[0] ?? lib.recent[0])?.id;
  });
  await page.getByTestId(`library-entry-load-${entryId}`).click();

  await page.waitForFunction(
    () => (window as any).__lwGraphSummary?.status === "loaded",
    { timeout: 10000 },
  );
  const activeId = await page.evaluate(() =>
    (window as any).__lwStore.getState().settings.sources.active,
  );
  expect(activeId).toBe("cytoscape-json");
});

// ── SA-010: pin / unpin ───────────────────────────────────────────────────────

test("SA-010: pin button moves entry from recent to pinned", async ({ page }) => {
  await loadCytoscapeFixture(page);

  const entryId = await page.evaluate(() => {
    return (window as any).__lwStore.getState().settings.sources.library.recent[0]?.id;
  });
  await page.getByTestId(`library-entry-pin-${entryId}`).click();

  const lib = await getLibrary(page);
  expect(lib.pinned.some((e: any) => e.id === entryId)).toBe(true);
  expect(lib.recent.some((e: any) => e.id === entryId)).toBe(false);
  // Pinned section should be visible
  await expect(page.getByTestId("graph-sources-library-pinned")).toBeVisible();
});

test("SA-010: unpin button moves entry back to recent", async ({ page }) => {
  await loadCytoscapeFixture(page);

  const entryId = await page.evaluate(() => {
    return (window as any).__lwStore.getState().settings.sources.library.recent[0]?.id;
  });
  // Pin it first
  await page.getByTestId(`library-entry-pin-${entryId}`).click();
  // Now unpin
  await page.getByTestId(`library-entry-unpin-${entryId}`).click();

  const lib = await getLibrary(page);
  expect(lib.pinned.some((e: any) => e.id === entryId)).toBe(false);
  expect(lib.recent.some((e: any) => e.id === entryId)).toBe(true);
});

// ── SA-025: delete confirmation ───────────────────────────────────────────────

test("SA-025: delete button shows inline confirmation", async ({ page }) => {
  await loadCytoscapeFixture(page);

  const entryId = await page.evaluate(() => {
    return (window as any).__lwStore.getState().settings.sources.library.recent[0]?.id;
  });
  await page.getByTestId(`library-entry-delete-${entryId}`).click();
  await expect(page.getByTestId(`library-entry-delete-confirm-${entryId}`)).toBeVisible();
});

test("SA-025: confirming delete removes entry from library", async ({ page }) => {
  await loadCytoscapeFixture(page);

  const entryId = await page.evaluate(() => {
    return (window as any).__lwStore.getState().settings.sources.library.recent[0]?.id;
  });
  await page.getByTestId(`library-entry-delete-${entryId}`).click();
  await page.getByTestId(`library-entry-delete-yes-${entryId}`).click();

  const lib = await getLibrary(page);
  expect(lib.recent.some((e: any) => e.id === entryId)).toBe(false);
  expect(lib.pinned.some((e: any) => e.id === entryId)).toBe(false);
});

test("SA-025: cancelling delete leaves entry intact", async ({ page }) => {
  await loadCytoscapeFixture(page);

  const entryId = await page.evaluate(() => {
    return (window as any).__lwStore.getState().settings.sources.library.recent[0]?.id;
  });
  await page.getByTestId(`library-entry-delete-${entryId}`).click();
  await page.getByTestId(`library-entry-delete-cancel-${entryId}`).click();

  const lib = await getLibrary(page);
  expect(lib.recent.some((e: any) => e.id === entryId)).toBe(true);
  await expect(page.getByTestId(`library-entry-delete-confirm-${entryId}`)).not.toBeVisible();
});

// ── SA-024: reinterpret as… ───────────────────────────────────────────────────

test("SA-024: reinterpret button opens picker pre-populated with entry config", async ({ page }) => {
  await loadCytoscapeFixture(page);

  const entryId = await page.evaluate(() => {
    const lib = (window as any).__lwStore.getState().settings.sources.library;
    return (lib.pinned[0] ?? lib.recent[0])?.id;
  });
  await page.getByTestId(`library-entry-reinterpret-${entryId}`).click();

  // Picker should open on the open-new tab
  await expect(page.getByTestId("graph-source-picker-backdrop")).toBeVisible();
  await expect(page.getByTestId("graph-source-picker-tab-open-new")).toHaveAttribute("aria-selected", "true");

  // cytoscape-json should be pre-selected (the entry's adapter)
  await expect(page.getByTestId("graph-source-adapter-card-cytoscape-json")).toHaveClass(/lw-picker__adapter-card--selected/);

  // Load button says "Load with this adapter"
  await expect(page.getByTestId("graph-source-picker-load")).toHaveText("Load with this adapter");
});
