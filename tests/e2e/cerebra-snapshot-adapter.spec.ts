// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.resolve(__dirname, "../fixtures/cerebra-snapshot");

// Loads a fixture file by name, mocking read_user_file to return its contents.
async function loadFixture(page: import("@playwright/test").Page, filename: string) {
  const filePath = path.join(FIXTURE_DIR, filename);
  const fileContent = fs.readFileSync(filePath, "utf-8");

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.evaluate(
    ({ fp, content }) => {
      (window as any).__lwTauriMock = {
        ...(window as any).__lwTauriMock,
        read_user_file: (_args: { path: string }) => content,
      };
      const store = (window as any).__lwStore;
      store.getState().setSetting("sources.active", "cerebra-snapshot");
      store.getState().setSetting("sources.configurations", {
        ...store.getState().settings.sources.configurations,
        "cerebra-snapshot": { adapterId: "cerebra-snapshot", filePath: fp },
      });
    },
    { fp: filePath, content: fileContent },
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

// Injects arbitrary JSON content as the file read result — used for error-case tests.
async function loadInline(page: import("@playwright/test").Page, jsonContent: string) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.evaluate(
    ({ content }) => {
      (window as any).__lwTauriMock = {
        ...(window as any).__lwTauriMock,
        read_user_file: (_args: { path: string }) => content,
      };
      const store = (window as any).__lwStore;
      store.getState().setSetting("sources.active", "cerebra-snapshot");
      store.getState().setSetting("sources.configurations", {
        ...store.getState().settings.sources.configurations,
        "cerebra-snapshot": { adapterId: "cerebra-snapshot", filePath: "/mock/graph.json" },
      });
    },
    { content: jsonContent },
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

// ── sample-graph.json ─────────────────────────────────────────────────────────
// 10 raw nodes → 8 valid (1 dup skipped, 1 missing-id skipped)
// 8 raw edges → 6 valid (1 orphan silently skipped, 1 missing-id skipped)
// Warnings: dup-node, missing-id-node, missing-id-edge

test("sample: node and edge counts", async ({ page }) => {
  const s = await loadFixture(page, "sample-graph.json");
  expect(s.status).toBe("loaded");
  expect(s.normalizedNodes).toHaveLength(8);
  expect(s.normalizedEdges).toHaveLength(6);
});

test("sample: label derived from metadata.vaultPath", async ({ page }) => {
  const s = await loadFixture(page, "sample-graph.json");
  expect(s.label).toBe("Cerebra: my-vault");
});

test("sample: spine node raw fields preserved", async ({ page }) => {
  const s = await loadFixture(page, "sample-graph.json");
  const spine1 = s.normalizedNodes.find((n: any) => n.id === "spine-1");
  expect(spine1).toBeDefined();
  expect(spine1.raw.cluster).toBe("core");
  expect(spine1.raw.status).toBe("active");
  expect(spine1.raw.tags).toEqual(["important", "core"]);
  expect(spine1.raw.size).toBe(10);
  expect(spine1.raw.path).toBe("core/main.md");
});

test("sample: memory_record fullLabel and raw passthrough", async ({ page }) => {
  const s = await loadFixture(page, "sample-graph.json");
  const mem1 = s.normalizedNodes.find((n: any) => n.id === "mem-1");
  expect(mem1).toBeDefined();
  expect(mem1.raw.fullLabel).toBe("Full Memory Record A — expanded");
  expect(mem1.raw.cerebraData).toMatchObject({ sku: "abc-123" });
});

test("sample: edge type becomes relationship field", async ({ page }) => {
  const s = await loadFixture(page, "sample-graph.json");
  const e1 = s.normalizedEdges.find((e: any) => e.id === "e1");
  expect(e1).toBeDefined();
  expect(e1.relationship).toBe("contains");
});

test("sample: edge weight and bidirectional preserved in raw", async ({ page }) => {
  const s = await loadFixture(page, "sample-graph.json");
  const e4 = s.normalizedEdges.find((e: any) => e.id === "e4");
  expect(e4).toBeDefined();
  expect(e4.raw.weight).toBe(0.75);
  expect(e4.raw.bidirectional).toBe(true);
});

test("sample: edge provenance preserved in raw", async ({ page }) => {
  const s = await loadFixture(page, "sample-graph.json");
  const e2 = s.normalizedEdges.find((e: any) => e.id === "e2");
  expect(e2).toBeDefined();
  expect(e2.raw.provenance).toBe("auto");
});

test("sample: edge with no type has undefined relationship", async ({ page }) => {
  const s = await loadFixture(page, "sample-graph.json");
  const e6 = s.normalizedEdges.find((e: any) => e.id === "e6");
  expect(e6).toBeDefined();
  expect(e6.relationship).toBeUndefined();
});

test("sample: duplicate node warning emitted, first occurrence kept", async ({ page }) => {
  const s = await loadFixture(page, "sample-graph.json");
  const dupWarning = s.warnings.find((w: string) => /Duplicate node id.*spine-1/.test(w));
  expect(dupWarning).toBeDefined();
  // Only one spine-1 node
  const spine1s = s.normalizedNodes.filter((n: any) => n.id === "spine-1");
  expect(spine1s).toHaveLength(1);
  expect(spine1s[0].label).toBe("Main Spine");
});

test("sample: missing-id node warning emitted and node skipped", async ({ page }) => {
  const s = await loadFixture(page, "sample-graph.json");
  expect(s.warnings.some((w: string) => /Node missing id/.test(w))).toBe(true);
});

test("sample: missing-id edge warning emitted and edge skipped", async ({ page }) => {
  const s = await loadFixture(page, "sample-graph.json");
  expect(s.warnings.some((w: string) => /Edge missing id/.test(w))).toBe(true);
});

test("sample: orphan edge silently skipped — no orphan warning in warnings array", async ({ page }) => {
  const s = await loadFixture(page, "sample-graph.json");
  // e-orphan targets ghost-node which is not in the node set — skipped without a warning
  const orphanEdge = s.normalizedEdges.find((e: any) => e.id === "e-orphan");
  expect(orphanEdge).toBeUndefined();
  // No warning mentions ghost-node
  expect(s.warnings.some((w: string) => /ghost-node/.test(w))).toBe(false);
});

// ── error cases ───────────────────────────────────────────────────────────────

test("error: wrong schemaVersion", async ({ page }) => {
  const s = await loadInline(
    page,
    JSON.stringify({ schemaVersion: "cerebra/v2", nodes: [], edges: [] }),
  );
  expect(s.status).toBe("error");
  expect(s.error).toMatch(/Unsupported schema version.*cerebra\/v2/i);
});

test("error: missing schemaVersion", async ({ page }) => {
  const s = await loadInline(
    page,
    JSON.stringify({ nodes: [], edges: [] }),
  );
  expect(s.status).toBe("error");
  expect(s.error).toMatch(/missing/i);
});

test("error: missing nodes array", async ({ page }) => {
  const s = await loadInline(
    page,
    JSON.stringify({ schemaVersion: "cerebra/v1", edges: [] }),
  );
  expect(s.status).toBe("error");
  expect(s.error).toMatch(/Missing required nodes/i);
});

test("error: missing edges array", async ({ page }) => {
  const s = await loadInline(
    page,
    JSON.stringify({ schemaVersion: "cerebra/v1", nodes: [] }),
  );
  expect(s.status).toBe("error");
  expect(s.error).toMatch(/Missing required nodes or edges/i);
});

test("error: no filePath configured", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    store.getState().setSetting("sources.active", "cerebra-snapshot");
    store.getState().setSetting("sources.configurations", {
      ...store.getState().settings.sources.configurations,
      "cerebra-snapshot": { adapterId: "cerebra-snapshot" },
    });
  });

  await page.waitForFunction(
    () => {
      const s = (window as any).__lwGraphSummary;
      return s && (s.status === "loaded" || s.status === "error");
    },
    { timeout: 10000 },
  );

  const s = await page.evaluate(() => (window as any).__lwGraphSummary);
  expect(s.status).toBe("error");
  expect(s.error).toMatch(/file path not configured/i);
});
