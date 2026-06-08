import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.resolve(__dirname, "../fixtures/cytoscape");

async function loadFixture(page: import("@playwright/test").Page, filename: string) {
  const filePath = path.join(FIXTURE_DIR, filename);
  const content = fs.readFileSync(filePath, "utf-8");

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.evaluate(
    ({ fp, fileContent }) => {
      (window as any).__lwTauriMock = {
        ...(window as any).__lwTauriMock,
        read_user_file: (_args: { path: string }) => fileContent,
      };
      const store = (window as any).__lwStore;
      store.getState().setSetting("sources.active", "cytoscape-json");
      store.getState().setSetting("sources.configurations", {
        ...store.getState().settings.sources.configurations,
        "cytoscape-json": { adapterId: "cytoscape-json", filePath: fp },
      });
    },
    { fp: filePath, fileContent: content },
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

test("nested form: counts after dedup+orphan-skip", async ({ page }) => {
  const s = await loadFixture(page, "sample-graph.json");
  expect(s.status).toBe("loaded");
  expect(s.normalizedNodes).toHaveLength(10); // 11 - 1 dup
  expect(s.normalizedEdges).toHaveLength(14); // 15 - 1 orphan
});

test("nested form: dedup + orphan warnings", async ({ page }) => {
  const s = await loadFixture(page, "sample-graph.json");
  expect(s.warnings.some((w: string) => /Duplicate node id.*n2/.test(w))).toBe(true);
  expect(s.warnings.some((w: string) => /Edge.*e15.*missing node/.test(w))).toBe(true);
});

test("data passthrough: n2 has custom fields in raw.cytoscapeData", async ({ page }) => {
  const s = await loadFixture(page, "sample-graph.json");
  const n2 = s.normalizedNodes.find((n: any) => n.id === "n2");
  expect(n2.raw.cytoscapeData).toMatchObject({ weight: 5, color: "red" });
});

test("position passthrough", async ({ page }) => {
  const s = await loadFixture(page, "sample-graph.json");
  const n1 = s.normalizedNodes.find((n: any) => n.id === "n1");
  expect(n1.raw.position).toEqual({ x: 100, y: 200 });
});

test("edge relationship from label", async ({ page }) => {
  const s = await loadFixture(page, "sample-graph.json");
  const e1 = s.normalizedEdges.find((e: any) => e.id === "e1");
  expect(e1.relationship).toBe("calls");
});

test("flat-array form loads correctly", async ({ page }) => {
  const s = await loadFixture(page, "flat-form.json");
  expect(s.status).toBe("loaded");
  expect(s.normalizedNodes).toHaveLength(4);
  expect(s.normalizedEdges).toHaveLength(3);
});

test("Cytoscape Desktop format rejected with clear error", async ({ page }) => {
  const s = await loadFixture(page, "desktop-format.json");
  expect(s.status).toBe("error");
  expect(s.error).toMatch(/Cytoscape Desktop/i);
});
