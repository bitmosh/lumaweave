import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { openSourceAdapter } from "./helpers/tiles";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.resolve(__dirname, "../fixtures/csv-edge-list");

type CsvConfig = {
  hasHeader?: boolean;
  delimiter?: string;
  sourceColumn?: string;
  targetColumn?: string;
  labelColumn?: string;
};

async function loadFixture(
  page: import("@playwright/test").Page,
  filename: string,
  csvConfig: CsvConfig = {},
) {
  const filePath = path.join(FIXTURE_DIR, filename);
  const fileContent = fs.readFileSync(filePath, "utf-8");

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.evaluate(
    ({ fp, content, config }) => {
      (window as any).__lwTauriMock = {
        ...(window as any).__lwTauriMock,
        read_user_file: (_args: { path: string }) => content,
      };
      const store = (window as any).__lwStore;
      store.getState().setSetting("sources.active", "csv-edge-list");
      store.getState().setSetting("sources.configurations", {
        ...store.getState().settings.sources.configurations,
        "csv-edge-list": {
          adapterId: "csv-edge-list",
          filePath: fp,
          ...config,
        },
      });
    },
    { fp: filePath, content: fileContent, config: csvConfig },
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

// ── sample-edges.csv ──────────────────────────────────────────────────────────
// 8 unique nodes (alice bob carol dave eve frank gary helen), 10 edges
// frank→frank self-loop; alice→bob appears twice (with and without relationship)

test("sample-edges: node and edge counts", async ({ page }) => {
  const s = await loadFixture(page, "sample-edges.csv", {
    hasHeader: true,
    sourceColumn: "source",
    targetColumn: "target",
    labelColumn: "relationship",
  });
  expect(s.status).toBe("loaded");
  expect(s.normalizedNodes).toHaveLength(8);
  expect(s.normalizedEdges).toHaveLength(10);
});

test("sample-edges: self-loop silently allowed", async ({ page }) => {
  const s = await loadFixture(page, "sample-edges.csv", {
    hasHeader: true,
    sourceColumn: "source",
    targetColumn: "target",
    labelColumn: "relationship",
  });
  const loop = s.normalizedEdges.find(
    (e: any) => e.source === "frank" && e.target === "frank",
  );
  expect(loop).toBeDefined();
  expect(loop.relationship).toBe("refers-to-self");
});

test("sample-edges: empty label cell produces edge with no relationship", async ({ page }) => {
  const s = await loadFixture(page, "sample-edges.csv", {
    hasHeader: true,
    sourceColumn: "source",
    targetColumn: "target",
    labelColumn: "relationship",
  });
  // Row 8 (alice,bob,) — empty label column
  const unlabeled = s.normalizedEdges.find(
    (e: any) => e.source === "alice" && e.target === "bob" && e.relationship === undefined,
  );
  expect(unlabeled).toBeDefined();
});

test("sample-edges: labeled edge has relationship field", async ({ page }) => {
  const s = await loadFixture(page, "sample-edges.csv", {
    hasHeader: true,
    sourceColumn: "source",
    targetColumn: "target",
    labelColumn: "relationship",
  });
  const labeled = s.normalizedEdges.find(
    (e: any) => e.source === "alice" && e.target === "bob" && e.relationship === "knows",
  );
  expect(labeled).toBeDefined();
});

// ── no-header.csv ─────────────────────────────────────────────────────────────
// 3 nodes, 3 edges; columns by 0-based index

test("no-header: index-based column references", async ({ page }) => {
  const s = await loadFixture(page, "no-header.csv", {
    hasHeader: false,
    sourceColumn: "0",
    targetColumn: "1",
    labelColumn: "2",
  });
  expect(s.status).toBe("loaded");
  expect(s.normalizedNodes).toHaveLength(3);
  expect(s.normalizedEdges).toHaveLength(3);
  const edge = s.normalizedEdges[0];
  expect(edge.relationship).toBe("knows");
});

// ── quoted-fields.csv ─────────────────────────────────────────────────────────
// 5 nodes, 3 edges; RFC 4180 compliance

test("quoted-fields: embedded delimiter preserved in node id", async ({ page }) => {
  const s = await loadFixture(page, "quoted-fields.csv", {
    hasHeader: true,
    sourceColumn: "source",
    targetColumn: "target",
    labelColumn: "relationship",
  });
  expect(s.status).toBe("loaded");
  expect(s.normalizedNodes).toHaveLength(5);
  const node = s.normalizedNodes.find((n: any) => n.id === "alice,jr");
  expect(node).toBeDefined();
});

test("quoted-fields: escaped double-quotes decoded correctly", async ({ page }) => {
  const s = await loadFixture(page, "quoted-fields.csv", {
    hasHeader: true,
    sourceColumn: "source",
    targetColumn: "target",
    labelColumn: "relationship",
  });
  const node = s.normalizedNodes.find((n: any) => n.id === 'carol "the great"');
  expect(node).toBeDefined();
});

test("quoted-fields: literal newline inside quoted field is preserved", async ({ page }) => {
  const s = await loadFixture(page, "quoted-fields.csv", {
    hasHeader: true,
    sourceColumn: "source",
    targetColumn: "target",
    labelColumn: "relationship",
  });
  const node = s.normalizedNodes.find((n: any) => n.id.includes("\n"));
  expect(node).toBeDefined();
  expect(node.id).toBe("node\nwith-newline");
});

// ── malformed.csv ─────────────────────────────────────────────────────────────
// 4 nodes, 2 edges; 3 rows skipped with warnings

test("malformed: skip+warn for bad rows, partial graph loads", async ({ page }) => {
  const s = await loadFixture(page, "malformed.csv", {
    hasHeader: true,
    sourceColumn: "source",
    targetColumn: "target",
  });
  expect(s.status).toBe("loaded");
  expect(s.normalizedNodes).toHaveLength(4);
  expect(s.normalizedEdges).toHaveLength(2);
  expect(s.warnings.length).toBeGreaterThanOrEqual(3);
});

// ── error cases ───────────────────────────────────────────────────────────────

test("error: source column name not found in header", async ({ page }) => {
  const s = await loadFixture(page, "sample-edges.csv", {
    hasHeader: true,
    sourceColumn: "nonexistent",
    targetColumn: "target",
  });
  expect(s.status).toBe("error");
  expect(s.error).toMatch(/source column.*not found/i);
});

test("error: non-numeric column ref when hasHeader is false", async ({ page }) => {
  const s = await loadFixture(page, "no-header.csv", {
    hasHeader: false,
    sourceColumn: "source",
    targetColumn: "1",
  });
  expect(s.status).toBe("error");
  expect(s.error).toMatch(/not a valid numeric index/i);
});

// ── config form ───────────────────────────────────────────────────────────────

test("config form: all six fields render when csv-edge-list is active", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openSourceAdapter(page);

  // Set csv-edge-list as active adapter
  const csvEntry = page.getByTestId("source-adapter-entry-csv-edge-list");
  await csvEntry.getByRole("button", { name: /set as active/i }).click();

  await expect(page.getByTestId("adapter-config-csv-edge-list-filePath")).toBeVisible();
  await expect(page.getByTestId("adapter-config-csv-edge-list-hasHeader")).toBeVisible();
  await expect(page.getByTestId("adapter-config-csv-edge-list-delimiter")).toBeVisible();
  await expect(page.getByTestId("adapter-config-csv-edge-list-sourceColumn")).toBeVisible();
  await expect(page.getByTestId("adapter-config-csv-edge-list-targetColumn")).toBeVisible();
  await expect(page.getByTestId("adapter-config-csv-edge-list-labelColumn")).toBeVisible();
});
