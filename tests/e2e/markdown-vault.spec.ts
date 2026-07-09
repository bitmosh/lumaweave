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

  // 10 original notes + 3 disambiguation notes
  const noteNodes = (summary.normalizedNodes as any[]).filter((n) => n.type === "note");
  expect(noteNodes).toHaveLength(13);

  // 9 original tags + 2 from disambiguation (work-projects, personal-projects)
  const tagNodes = (summary.normalizedNodes as any[]).filter((n) => n.type === "tag");
  expect(tagNodes).toHaveLength(11);

  // 9 original wikilinks + 1 disambiguation link
  const wikilinkEdges = (summary.normalizedEdges as any[]).filter((e) => e.relationship === "wikilink");
  expect(wikilinkEdges).toHaveLength(10);

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
