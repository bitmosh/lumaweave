// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.resolve(__dirname, "../fixtures/package-dependency");

async function loadFixture(
  page: import("@playwright/test").Page,
  filename: string,
  manifestType: "package.json" | "pyproject.toml" = "package.json",
) {
  const projectPath = FIXTURE_DIR;
  const fileContent =
    manifestType === "package.json"
      ? fs.readFileSync(path.join(FIXTURE_DIR, filename), "utf-8")
      : "";

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.evaluate(
    ({ pp, content, mType }) => {
      (window as any).__lwTauriMock = {
        ...(window as any).__lwTauriMock,
        read_user_file: (_args: { path: string }) => content,
      };
      const store = (window as any).__lwStore;
      store.getState().setSetting("sources.active", "package-dependency");
      store.getState().setSetting("sources.configurations", {
        ...store.getState().settings.sources.configurations,
        "package-dependency": {
          adapterId: "package-dependency",
          projectPath: pp,
          manifestType: mType,
        },
      });
    },
    { pp: projectPath, content: fileContent, mType: manifestType },
  );

  await page.waitForFunction(
    () => {
      const s = (window as any).__lwGraphSummary;
      return s && (s.status === "loaded" || s.status === "error");
    },
    { timeout: 10000 },
  );

  return await page.evaluate(() => (window as any).__lwGraphSummary);
}

test("sample: node and edge counts", async ({ page }) => {
  // react appears in both dependencies + peerDependencies — one node (deduped), two edges
  // nodes: 1 root + 5 prod + 3 dev + 0 new from peer (react already seen) = 9
  // edges: 5 depends-on + 3 depends-on-dev + 1 depends-on-peer = 9
  const s = await loadFixture(page, "sample-package.json");
  expect(s.status).toBe("loaded");
  expect(s.normalizedNodes).toHaveLength(9);
  expect(s.normalizedEdges).toHaveLength(9);
});

test("sample: root node has kind=project with version and description", async ({ page }) => {
  const s = await loadFixture(page, "sample-package.json");
  const root = s.normalizedNodes.find((n: any) => n.id === "acme-dashboard");
  expect(root).toBeDefined();
  expect(root.raw.kind).toBe("project");
  expect(root.raw.version).toBe("2.1.0");
  expect(root.raw.description).toBe("Internal dashboard for the Acme platform");
});

test("sample: package node carries version constraint in raw", async ({ page }) => {
  const s = await loadFixture(page, "sample-package.json");
  const reactNode = s.normalizedNodes.find((n: any) => n.id === "react");
  expect(reactNode).toBeDefined();
  expect(reactNode.raw.kind).toBe("package");
  expect(reactNode.raw.version).toBe("^19.0.0"); // production version wins (first occurrence)
});

test("sample: dual-edge for react (prod + peer)", async ({ page }) => {
  const s = await loadFixture(page, "sample-package.json");
  const prodEdge = s.normalizedEdges.find(
    (e: any) => e.source === "acme-dashboard" && e.target === "react" && e.relationship === "depends-on",
  );
  const peerEdge = s.normalizedEdges.find(
    (e: any) =>
      e.source === "acme-dashboard" && e.target === "react" && e.relationship === "depends-on-peer",
  );
  expect(prodEdge).toBeDefined();
  expect(peerEdge).toBeDefined();
});

test("sample: dev dep edge has depends-on-dev relationship", async ({ page }) => {
  const s = await loadFixture(page, "sample-package.json");
  const viteEdge = s.normalizedEdges.find(
    (e: any) =>
      e.source === "acme-dashboard" && e.target === "vite" && e.relationship === "depends-on-dev",
  );
  expect(viteEdge).toBeDefined();
});

test("missing-name: fallback root id and warning", async ({ page }) => {
  const s = await loadFixture(page, "missing-name.json");
  expect(s.status).toBe("loaded");
  expect(s.normalizedNodes).toHaveLength(2); // "package" root + lodash
  expect(s.normalizedEdges).toHaveLength(1);
  const fallbackRoot = s.normalizedNodes.find((n: any) => n.id === "package");
  expect(fallbackRoot).toBeDefined();
  expect(s.warnings.some((w: string) => /name/i.test(w))).toBe(true);
});

test("pyproject.toml: returns error before reading file", async ({ page }) => {
  const s = await loadFixture(page, "sample-package.json", "pyproject.toml");
  expect(s.status).toBe("error");
  expect(s.error).toMatch(/pyproject\.toml.*not.*supported/i);
});
