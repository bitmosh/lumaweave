import { test, expect } from "@playwright/test";

test.describe("v88a defineTheme", () => {
  test("returns ThemePreset shape", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const result = await page.evaluate(async () => {
      const probe = (window as any).__lwDefineTheme;
      const preset = await probe.defineTheme({
        id: "test-theme-1",
        label: "Test Theme",
        primitives: { primary: "#8b5cf6" },
      });
      return {
        hasId: typeof preset.id === "string",
        hasName: typeof preset.name === "string",
        hasHash: typeof preset.hash === "string",
        hashLength: preset.hash?.length,
        builtIn: preset.builtIn,
      };
    });
    expect(result.hasId).toBe(true);
    expect(result.hasName).toBe(true);
    expect(result.hasHash).toBe(true);
    expect(result.hashLength).toBe(64);
    expect(result.builtIn).toBe(false);
  });

  test("derives lineage from parent reference", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const result = await page.evaluate(async () => {
      const probeDefine = (window as any).__lwDefineTheme;
      const probeLineage = (window as any).__lwThemeLineage;
      probeLineage.clearLineage("test-theme-2");

      await probeDefine.defineTheme({
        id: "test-theme-2",
        label: "Test Theme 2",
        primitives: { primary: "#f472b6" },
        lineage: [{ parentId: "solar-plasma", parentHash: "abc", timestamp: 1, changeKind: "fork" }],
      });

      return probeLineage.getLineage("test-theme-2");
    });
    expect(result.length).toBeGreaterThan(0);
  });

  test("built-in themes get hashes computed at boot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Wait for async hash computation to complete
    await page.waitForFunction(() => {
      const builtIns: any[] = (window as any).__lwBuiltInThemes ?? [];
      return builtIns.length > 0 && builtIns.every((p: any) => typeof p.hash === "string" && p.hash.length === 64);
    }, { timeout: 5000 });

    const result = await page.evaluate(() => {
      const builtIns: any[] = (window as any).__lwBuiltInThemes ?? [];
      return builtIns.map((p: any) => ({ id: p.id, hasHash: typeof p.hash === "string" && p.hash.length === 64 }));
    });

    expect(result.length).toBe(6);
    for (const r of result) {
      expect(r.hasHash).toBe(true);
    }
  });
});
