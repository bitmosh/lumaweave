// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { openSourceAdapter } from "./helpers/tiles";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_VAULT = path.resolve(__dirname, "../fixtures/markdown-vault");

function readFixtureVault(dir: string, base: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(base, fullPath).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      Object.assign(result, readFixtureVault(fullPath, base));
    } else if (entry.name.endsWith(".md")) {
      result[relPath] = fs.readFileSync(fullPath, "utf-8");
    }
  }
  return result;
}

test("markdown-vault: loads fixture vault with expected node/edge counts", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const fixtureFiles = readFixtureVault(FIXTURE_VAULT, FIXTURE_VAULT);
  const relPaths = Object.keys(fixtureFiles);

  // Inject Tauri mock before triggering load so list_files/read_vault_file are intercepted
  await page.evaluate(
    ({ files, paths }) => {
      (window as any).__lwTauriMock = {
        list_files: () => paths,
        read_vault_file: (args: { relativePath: string }) => files[args.relativePath] ?? "",
      };
    },
    { files: fixtureFiles, paths: relPaths },
  );

  // Set configuration then activate (triggers loadSummary via useGraphSourceSummary)
  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    store.getState().setSetting("sources.configurations", {
      ...store.getState().settings.sources.configurations,
      "markdown-vault": { adapterId: "markdown-vault", vaultRoot: "/mock-vault" },
    });
    store.getState().setSetting("sources.active", "markdown-vault");
  });

  // Wait until __lwGraphSummary reports loaded state
  await page.waitForFunction(
    () => {
      const s = (window as any).__lwGraphSummary;
      return s?.status === "loaded" && s?.sourceId === "markdown-vault";
    },
    { timeout: 10000 },
  );

  const summary = await page.evaluate(() => (window as any).__lwGraphSummary);

  // 10 original notes + 3 new (AnchorAndDisplayLink, ModifiedDate, HexColorBody)
  // + 3 disambiguation notes = 16 total
  const noteNodes = (summary.normalizedNodes as any[]).filter((n) => n.type === "note");
  expect(noteNodes).toHaveLength(16);

  // 9 original tags + 2 disambiguation (work-projects, personal-projects)
  // + 2 new (archived, hex-color-test) = 13 total
  const tagNodes = (summary.normalizedNodes as any[]).filter((n) => n.type === "tag");
  expect(tagNodes).toHaveLength(13);

  // 9 original wikilinks + 1 disambiguation link + 3 from AnchorAndDisplayLink = 13
  const wikilinkEdges = (summary.normalizedEdges as any[]).filter((e) => e.relationship === "wikilink");
  expect(wikilinkEdges).toHaveLength(13);

  // Disambiguation: personal/Project.md wins over work/Project.md (alphabetical tiebreak)
  const disambigEdge = wikilinkEdges.find((e: any) => e.source === "LinkByCommonName.md");
  expect(disambigEdge?.target).toBe("personal/Project.md");

  // Alias resolution: [[The Aliased Note]] resolves to Aliased.md
  const aliasEdge = wikilinkEdges.find((e: any) => e.source === "LinkByAlias.md");
  expect(aliasEdge?.target).toBe("Aliased.md");

  // Two unresolved wikilinks in UnresolvedLinks.md
  const unresolvedWarnings = (summary.warnings as string[]).filter((w) =>
    w.includes("Unresolved wikilink"),
  );
  expect(unresolvedWarnings).toHaveLength(2);
});

// ── Focused-mock tests: single-file loads to verify specific adapter behaviours ──

function buildMock(files: Record<string, string>) {
  return {
    files,
    paths: Object.keys(files),
  };
}

async function loadVaultMock(
  page: import("@playwright/test").Page,
  files: Record<string, string>,
) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const { paths } = buildMock(files);

  await page.evaluate(
    ({ fileMap, pathList }) => {
      (window as any).__lwTauriMock = {
        list_files: () => pathList,
        read_vault_file: (args: { relativePath: string }) => fileMap[args.relativePath] ?? "",
      };
      const store = (window as any).__lwStore;
      store.getState().setSetting("sources.configurations", {
        ...store.getState().settings.sources.configurations,
        "markdown-vault": { adapterId: "markdown-vault", vaultRoot: "/mock-vault" },
      });
      store.getState().setSetting("sources.active", "markdown-vault");
    },
    { fileMap: files, pathList: paths },
  );

  await page.waitForFunction(
    () => {
      const s = (window as any).__lwGraphSummary;
      return s?.status === "loaded" && s?.sourceId === "markdown-vault";
    },
    { timeout: 10000 },
  );

  return await page.evaluate(() => (window as any).__lwGraphSummary);
}

test("markdown-vault: anchor link captures raw.anchor", async ({ page }) => {
  const s = await loadVaultMock(page, {
    "Hub.md": "---\n---\nThe main hub.\n",
    "AnchorAndDisplayLink.md": "---\n---\nBasic anchor: [[Hub#introduction]]\n",
  });
  const wikilinkEdges = (s.normalizedEdges as any[]).filter((e) => e.relationship === "wikilink");
  const anchorEdge = wikilinkEdges.find(
    (e: any) => e.source === "AnchorAndDisplayLink.md" && e.target === "Hub.md",
  );
  expect(anchorEdge).toBeDefined();
  expect(anchorEdge.raw.anchor).toBe("introduction");
  expect(anchorEdge.raw.displayText).toBeUndefined();
});

test("markdown-vault: display text link captures raw.displayText", async ({ page }) => {
  const s = await loadVaultMock(page, {
    "Hub.md": "---\n---\nThe main hub.\n",
    "AnchorAndDisplayLink.md": "---\n---\nDisplay text only: [[Hub|my hub note]]\n",
  });
  const wikilinkEdges = (s.normalizedEdges as any[]).filter((e) => e.relationship === "wikilink");
  const displayEdge = wikilinkEdges.find(
    (e: any) => e.source === "AnchorAndDisplayLink.md" && e.target === "Hub.md",
  );
  expect(displayEdge).toBeDefined();
  expect(displayEdge.raw.displayText).toBe("my hub note");
  expect(displayEdge.raw.anchor).toBeUndefined();
});

test("markdown-vault: combined anchor+display text captures both raw fields", async ({ page }) => {
  const s = await loadVaultMock(page, {
    "Hub.md": "---\n---\nThe main hub.\n",
    "AnchorAndDisplayLink.md": "---\n---\nBoth: [[Hub#setup|Getting Started]]\n",
  });
  const wikilinkEdges = (s.normalizedEdges as any[]).filter((e) => e.relationship === "wikilink");
  const comboEdge = wikilinkEdges.find(
    (e: any) => e.source === "AnchorAndDisplayLink.md" && e.target === "Hub.md",
  );
  expect(comboEdge).toBeDefined();
  expect(comboEdge.raw.anchor).toBe("setup");
  expect(comboEdge.raw.displayText).toBe("Getting Started");
});

test("markdown-vault: 'modified' frontmatter key maps to raw.updatedAt", async ({ page }) => {
  const s = await loadVaultMock(page, {
    "ModifiedDate.md": "---\nmodified: 2026-02-01\ntags: [archived]\n---\nOlder note.\n",
  });
  const noteNodes = (s.normalizedNodes as any[]).filter((n) => n.type === "note");
  const note = noteNodes.find((n: any) => n.id === "ModifiedDate.md");
  expect(note).toBeDefined();
  expect(note.raw.updatedAt).toMatch(/^2026-02-01/);
});

test("markdown-vault: hex color codes in body are not extracted as tags", async ({ page }) => {
  const s = await loadVaultMock(page, {
    "HexColorBody.md":
      "---\n---\nWarning states use #FF0000, tints use #abc, brand is #DeadBe.\nTracked as #hex-color-test.\n",
  });
  const tagNodes = (s.normalizedNodes as any[]).filter((n) => n.type === "tag");
  const tagIds = tagNodes.map((n: any) => n.id as string);
  // hex-color-test should become a tag (node IDs are prefixed with "tag:")
  expect(tagIds).toContain("tag:hex-color-test");
  // hex color values must NOT become tags
  expect(tagIds).not.toContain("tag:FF0000");
  expect(tagIds).not.toContain("tag:abc");
  expect(tagIds).not.toContain("tag:DeadBe");
});

test("markdown-vault: config form visible when adapter is active", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await openSourceAdapter(page);

  await page.evaluate(() => {
    (window as any).__lwStore.getState().setSetting("sources.active", "markdown-vault");
  });

  const mvEntry = page.getByTestId("source-adapter-entry-markdown-vault");
  await expect(mvEntry.getByTestId("adapter-config-markdown-vault")).toBeVisible();
  await expect(mvEntry.getByTestId("adapter-config-vault-root")).toBeVisible();

  // Empty-state should not be visible when a registered form is shown
  await expect(page.getByTestId("adapter-config-empty")).not.toBeVisible();
});
