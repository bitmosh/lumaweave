// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CYTOSCAPE_FIXTURE = path.resolve(__dirname, "../fixtures/cytoscape/flat-form.json");

// 1×1 white JPEG as a stand-in for a real thumbnail
const FAKE_THUMBNAIL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUE/8QAIhAAAQMFAAMBAAAAAAAAAAAAAQIDBAUREiExQf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCgkLRLFJJYLBZJiJXMnM8/SjlHMrE3yNPVH6Q2X2WvgAAA/9k=";

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

// ── SA-012: updateLibraryEntryThumbnail store action ─────────────────────────

test("SA-012: updateLibraryEntryThumbnail updates thumbnailDataUrl on recent entry", async ({ page }) => {
  await loadCytoscapeFixture(page);

  const entryId = await page.evaluate(() => {
    const lib = (window as any).__lwStore.getState().settings.sources.library;
    return (lib.pinned[0] ?? lib.recent[0])?.id;
  });
  expect(entryId).toBeTruthy();

  await page.evaluate(
    ({ id, url }) => {
      (window as any).__lwStore.getState().updateLibraryEntryThumbnail(id, url);
    },
    { id: entryId, url: FAKE_THUMBNAIL },
  );

  const stored = await page.evaluate(({ id }) => {
    const lib = (window as any).__lwStore.getState().settings.sources.library;
    const entry =
      lib.pinned.find((e: any) => e.id === id) ??
      lib.recent.find((e: any) => e.id === id);
    return entry?.thumbnailDataUrl;
  }, { id: entryId });

  expect(stored).toBe(FAKE_THUMBNAIL);
});

test("SA-012: updateLibraryEntryThumbnail updates thumbnailDataUrl on pinned entry", async ({ page }) => {
  await loadCytoscapeFixture(page);

  const entryId = await page.evaluate(() => {
    return (window as any).__lwStore.getState().settings.sources.library.recent[0]?.id;
  });

  // Pin the entry first
  await page.evaluate(({ id }) => {
    (window as any).__lwStore.getState().pinLibraryEntry(id);
  }, { id: entryId });

  await page.evaluate(
    ({ id, url }) => {
      (window as any).__lwStore.getState().updateLibraryEntryThumbnail(id, url);
    },
    { id: entryId, url: FAKE_THUMBNAIL },
  );

  const stored = await page.evaluate(({ id }) => {
    const lib = (window as any).__lwStore.getState().settings.sources.library;
    return lib.pinned.find((e: any) => e.id === id)?.thumbnailDataUrl;
  }, { id: entryId });

  expect(stored).toBe(FAKE_THUMBNAIL);
});

test("SA-012: updateLibraryEntryThumbnail is a no-op for unknown entryId", async ({ page }) => {
  await loadCytoscapeFixture(page);

  const libBefore = await page.evaluate(() =>
    JSON.stringify((window as any).__lwStore.getState().settings.sources.library),
  );

  await page.evaluate(({ url }) => {
    (window as any).__lwStore.getState().updateLibraryEntryThumbnail("nonexistent:000", url);
  }, { url: FAKE_THUMBNAIL });

  const libAfter = await page.evaluate(() =>
    JSON.stringify((window as any).__lwStore.getState().settings.sources.library),
  );

  expect(libAfter).toBe(libBefore); // no mutation
});

// ── SA-012b: thumbnail display in library card ────────────────────────────────

test("SA-012b: thumbnail image is shown when thumbnailDataUrl is set", async ({ page }) => {
  await loadCytoscapeFixture(page);

  const entryId = await page.evaluate(() => {
    const lib = (window as any).__lwStore.getState().settings.sources.library;
    return (lib.pinned[0] ?? lib.recent[0])?.id;
  });

  // Inject fake thumbnail
  await page.evaluate(
    ({ id, url }) => {
      (window as any).__lwStore.getState().updateLibraryEntryThumbnail(id, url);
    },
    { id: entryId, url: FAKE_THUMBNAIL },
  );

  const img = page.getByTestId(`library-entry-thumbnail-${entryId}`);
  await expect(img).toBeVisible();
  const src = await img.getAttribute("src");
  expect(src).toBe(FAKE_THUMBNAIL);
});

test("SA-012b: no thumbnail element when thumbnailDataUrl is absent", async ({ page }) => {
  await loadCytoscapeFixture(page);

  const entryId = await page.evaluate(() => {
    const lib = (window as any).__lwStore.getState().settings.sources.library;
    return (lib.pinned[0] ?? lib.recent[0])?.id;
  });

  // Ensure no thumbnail is set (default state after fresh load)
  const hasThumbnail = await page.evaluate(({ id }) => {
    const lib = (window as any).__lwStore.getState().settings.sources.library;
    const entry =
      lib.pinned.find((e: any) => e.id === id) ??
      lib.recent.find((e: any) => e.id === id);
    return !!entry?.thumbnailDataUrl;
  }, { id: entryId });

  expect(hasThumbnail).toBe(false);
  await expect(page.getByTestId(`library-entry-thumbnail-${entryId}`)).not.toBeVisible();
});

test("SA-012b: thumbnail persists through pin/unpin cycle", async ({ page }) => {
  await loadCytoscapeFixture(page);

  const entryId = await page.evaluate(() => {
    return (window as any).__lwStore.getState().settings.sources.library.recent[0]?.id;
  });

  // Set thumbnail, then pin, then unpin
  await page.evaluate(
    ({ id, url }) => {
      const store = (window as any).__lwStore.getState();
      store.updateLibraryEntryThumbnail(id, url);
      store.pinLibraryEntry(id);
      store.unpinLibraryEntry(id);
    },
    { id: entryId, url: FAKE_THUMBNAIL },
  );

  // After unpin, entry is back in recent — thumbnail carries through (spread-based copy)
  const stored = await page.evaluate(({ id }) => {
    const lib = (window as any).__lwStore.getState().settings.sources.library;
    return lib.recent.find((e: any) => e.id === id)?.thumbnailDataUrl;
  }, { id: entryId });

  expect(stored).toBe(FAKE_THUMBNAIL);
});
