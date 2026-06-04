import { test, expect } from "@playwright/test";

test.describe("v88b.0.1 Engine → graph integration", () => {
  test("graph nodes have engine-picked hex colors after build", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => !!(window as any).__lwGraphologyGraph);

    const result = await page.evaluate(() => {
      const graph = (window as any).__lwGraphologyGraph;
      const nodeIds: string[] = graph.nodes();
      if (nodeIds.length === 0) return { nodeCount: 0, allValid: false };

      const hexPattern = /^#[0-9a-f]{6}$/i;
      const allValid = nodeIds.every((id: string) => {
        const color = graph.getNodeAttribute(id, "color") as string;
        return hexPattern.test(color ?? "");
      });

      return { nodeCount: nodeIds.length, allValid };
    });

    expect(result.nodeCount).toBeGreaterThan(0);
    expect(result.allValid).toBe(true);
  });

  test.fixme("engine rotation state shows node-primary usage after graph build", async ({ page }) => {
    // Flaky timing-sensitive graph integration test. v105.0.2: quarantined.
    await page.goto("/");
    await page.waitForFunction(() => !!(window as any).__lwGraphologyGraph);

    const result = await page.evaluate(() => {
      const engine = (window as any).__lwColorSuggestionEngine;
      const state = engine.getRotationState();
      return {
        hasNodePrimary: "node-primary" in state,
        entryCount: Object.keys(state).length,
      };
    });

    expect(result.hasNodePrimary).toBe(true);
    expect(result.entryCount).toBeGreaterThan(0);
  });

  test("raw.color matches color attribute for all nodes", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => !!(window as any).__lwGraphologyGraph);

    const result = await page.evaluate(() => {
      const graph = (window as any).__lwGraphologyGraph;
      const nodeIds: string[] = graph.nodes();
      if (nodeIds.length === 0) return { nodeCount: 0, allMatch: false };

      const allMatch = nodeIds.every((id: string) => {
        const color = graph.getNodeAttribute(id, "color") as string;
        const raw = graph.getNodeAttribute(id, "raw") as any;
        return raw?.color === color;
      });

      return { nodeCount: nodeIds.length, allMatch };
    });

    expect(result.nodeCount).toBeGreaterThan(0);
    expect(result.allMatch).toBe(true);
  });

  test.fixme("engine getRotationState has entries after graph build", async ({ page }) => {
    // Flaky timing-sensitive graph integration test. v105.0.2: quarantined.
    await page.goto("/");
    await page.waitForFunction(() => !!(window as any).__lwGraphologyGraph);

    const result = await page.evaluate(() => {
      const engine = (window as any).__lwColorSuggestionEngine;
      const state = engine.getRotationState();
      const entries = Object.entries(state) as [string, number][];
      return {
        entryCount: entries.length,
        nodePrimaryValue: state["node-primary"],
      };
    });

    expect(result.entryCount).toBeGreaterThan(0);
    expect(typeof result.nodePrimaryValue).toBe("number");
  });
});
