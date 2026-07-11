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

// ── SA-028: renameLibraryEntry store action ───────────────────────────────────

test("SA-028: renameLibraryEntry updates label on recent entry", async ({ page }) => {
  await loadCytoscapeFixture(page);

  const entryId = await page.evaluate(() => {
    const lib = (window as any).__lwStore.getState().settings.sources.library;
    return (lib.pinned[0] ?? lib.recent[0])?.id;
  });
  expect(entryId).toBeTruthy();

  await page.evaluate(({ id }) => {
    (window as any).__lwStore.getState().renameLibraryEntry(id, "My Custom Label");
  }, { id: entryId });

  const label = await page.evaluate(({ id }) => {
    const lib = (window as any).__lwStore.getState().settings.sources.library;
    const entry = lib.pinned.find((e: any) => e.id === id) ?? lib.recent.find((e: any) => e.id === id);
    return entry?.label;
  }, { id: entryId });

  expect(label).toBe("My Custom Label");
});

test("SA-028: renameLibraryEntry updates label on pinned entry", async ({ page }) => {
  await loadCytoscapeFixture(page);

  const entryId = await page.evaluate(() => {
    return (window as any).__lwStore.getState().settings.sources.library.recent[0]?.id;
  });

  await page.evaluate(({ id }) => {
    (window as any).__lwStore.getState().pinLibraryEntry(id);
  }, { id: entryId });

  await page.evaluate(({ id }) => {
    (window as any).__lwStore.getState().renameLibraryEntry(id, "Pinned Renamed");
  }, { id: entryId });

  const label = await page.evaluate(({ id }) => {
    return (window as any).__lwStore.getState().settings.sources.library.pinned
      .find((e: any) => e.id === id)?.label;
  }, { id: entryId });

  expect(label).toBe("Pinned Renamed");
});

test("SA-028: renameLibraryEntry is a no-op for unknown entryId", async ({ page }) => {
  await loadCytoscapeFixture(page);

  const libBefore = await page.evaluate(() =>
    JSON.stringify((window as any).__lwStore.getState().settings.sources.library),
  );

  await page.evaluate(() => {
    (window as any).__lwStore.getState().renameLibraryEntry("nonexistent:000", "Ghost");
  });

  const libAfter = await page.evaluate(() =>
    JSON.stringify((window as any).__lwStore.getState().settings.sources.library),
  );

  expect(libAfter).toBe(libBefore);
});

// ── SA-028: rename UI in tile ─────────────────────────────────────────────────

test("SA-028: pencil button activates inline rename input in tile", async ({ page }) => {
  await loadCytoscapeFixture(page);

  const entryId = await page.evaluate(() => {
    const lib = (window as any).__lwStore.getState().settings.sources.library;
    return (lib.pinned[0] ?? lib.recent[0])?.id;
  });

  const renameBtn = page.getByTestId(`library-entry-rename-${entryId}`);
  await expect(renameBtn).toBeVisible();
  await renameBtn.click();

  const input = page.getByTestId(`library-entry-rename-input-${entryId}`);
  await expect(input).toBeVisible();
});

test("SA-028: Enter commits rename in tile", async ({ page }) => {
  await loadCytoscapeFixture(page);

  const entryId = await page.evaluate(() => {
    const lib = (window as any).__lwStore.getState().settings.sources.library;
    return (lib.pinned[0] ?? lib.recent[0])?.id;
  });

  await page.getByTestId(`library-entry-rename-${entryId}`).click();
  const input = page.getByTestId(`library-entry-rename-input-${entryId}`);
  await input.fill("Renamed via Enter");
  await input.press("Enter");

  await expect(input).not.toBeVisible();

  const label = await page.evaluate(({ id }) => {
    const lib = (window as any).__lwStore.getState().settings.sources.library;
    const entry = lib.pinned.find((e: any) => e.id === id) ?? lib.recent.find((e: any) => e.id === id);
    return entry?.label;
  }, { id: entryId });

  expect(label).toBe("Renamed via Enter");
});

test("SA-028: Escape cancels rename without saving", async ({ page }) => {
  await loadCytoscapeFixture(page);

  const { entryId, originalLabel } = await page.evaluate(() => {
    const lib = (window as any).__lwStore.getState().settings.sources.library;
    const entry = lib.pinned[0] ?? lib.recent[0];
    return { entryId: entry?.id, originalLabel: entry?.label };
  });

  await page.getByTestId(`library-entry-rename-${entryId}`).click();
  const input = page.getByTestId(`library-entry-rename-input-${entryId}`);
  await input.fill("Should Not Save");
  await input.press("Escape");

  await expect(input).not.toBeVisible();

  const label = await page.evaluate(({ id }) => {
    const lib = (window as any).__lwStore.getState().settings.sources.library;
    const entry = lib.pinned.find((e: any) => e.id === id) ?? lib.recent.find((e: any) => e.id === id);
    return entry?.label;
  }, { id: entryId });

  expect(label).toBe(originalLabel);
});
