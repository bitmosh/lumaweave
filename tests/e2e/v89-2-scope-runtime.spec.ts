// SPDX-License-Identifier: Apache-2.0
import { test, expect, Page } from "@playwright/test";

type OverrideStorageWindow = Window & {
  __lwThemeOverrideStorage?: {
    resetAllOverrides: () => void;
    setTargetOverride: (targetId: string, tokenPath: string, value: string) => void;
    setTargetKindOverride: (targetKind: string, tokenPath: string, value: string) => void;
    getTargetKindOverride: (targetKind: string, tokenPath: string) => string | undefined;
    removeTargetKindOverride: (targetKind: string, tokenPath: string) => void;
    getTargetKindOverrides: (targetKind: string) => unknown[];
    setClusterOverride: (clusterAnchor: string, tokenPath: string, value: string) => void;
    getClusterOverride: (clusterAnchor: string, tokenPath: string) => string | undefined;
    removeClusterOverride: (clusterAnchor: string, tokenPath: string) => void;
    getClusterOverrides: (clusterAnchor: string) => unknown[];
    setGlobalOverride: (tokenPath: string, value: string) => void;
    resolveForTarget: (
      tokenPath: string,
      targetId: string,
      targetKind: string | undefined,
      clusterAnchor: string | null,
    ) => string | undefined;
  };
};

const storage = (page: Page) =>
  page.evaluate(() => (window as OverrideStorageWindow).__lwThemeOverrideStorage!);

test.describe("v89.2 Target-kind + cluster scope runtime", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      (window as OverrideStorageWindow).__lwThemeOverrideStorage?.resetAllOverrides();
    });
  });

  test.afterEach(async ({ page }) => {
    await page.evaluate(() => {
      (window as OverrideStorageWindow).__lwThemeOverrideStorage?.resetAllOverrides();
    });
  });

  test("setTargetKindOverride writes and reads back", async ({ page }) => {
    const value = await page.evaluate(() => {
      const s = (window as OverrideStorageWindow).__lwThemeOverrideStorage!;
      s.setTargetKindOverride("panel", "panel.background", "#ff0000");
      return s.getTargetKindOverride("panel", "panel.background");
    });
    expect(value).toBe("#ff0000");
  });

  test("setClusterOverride writes and reads back", async ({ page }) => {
    const value = await page.evaluate(() => {
      const s = (window as OverrideStorageWindow).__lwThemeOverrideStorage!;
      s.setClusterOverride("topbar.root", "panel.background", "#00ff00");
      return s.getClusterOverride("topbar.root", "panel.background");
    });
    expect(value).toBe("#00ff00");
  });

  test("resolveForTarget priority: target wins over target-kind", async ({ page }) => {
    const value = await page.evaluate(() => {
      const s = (window as OverrideStorageWindow).__lwThemeOverrideStorage!;
      s.setTargetKindOverride("panel", "panel.background", "#ff0000");
      s.setTargetOverride("settings.panel", "panel.background", "#0000ff");
      return s.resolveForTarget("panel.background", "settings.panel", "panel", null);
    });
    expect(value).toBe("#0000ff");
  });

  test("resolveForTarget priority: target-kind wins over cluster", async ({ page }) => {
    const value = await page.evaluate(() => {
      const s = (window as OverrideStorageWindow).__lwThemeOverrideStorage!;
      s.setClusterOverride("hub-node", "panel.background", "#0000ff");
      s.setTargetKindOverride("panel", "panel.background", "#ff0000");
      return s.resolveForTarget("panel.background", "settings.panel", "panel", "hub-node");
    });
    expect(value).toBe("#ff0000");
  });

  test("resolveForTarget priority: cluster wins over global", async ({ page }) => {
    const value = await page.evaluate(() => {
      const s = (window as OverrideStorageWindow).__lwThemeOverrideStorage!;
      s.setGlobalOverride("panel.background", "#000000");
      s.setClusterOverride("hub-node", "panel.background", "#0000ff");
      return s.resolveForTarget("panel.background", "settings.panel", undefined, "hub-node");
    });
    expect(value).toBe("#0000ff");
  });

  test("resolveForTarget falls back to global when no scoped overrides match", async ({ page }) => {
    const value = await page.evaluate(() => {
      const s = (window as OverrideStorageWindow).__lwThemeOverrideStorage!;
      s.setGlobalOverride("panel.background", "#abcabc");
      return s.resolveForTarget("panel.background", "unknown.target", undefined, null);
    });
    expect(value).toBe("#abcabc");
  });

  test("removeTargetKindOverride removes only that scope+path+kind", async ({ page }) => {
    const result = await page.evaluate(() => {
      const s = (window as OverrideStorageWindow).__lwThemeOverrideStorage!;
      s.setTargetKindOverride("panel", "panel.background", "#ff0000");
      s.setTargetKindOverride("topbar", "panel.background", "#00ff00");
      s.removeTargetKindOverride("panel", "panel.background");
      return {
        panel: s.getTargetKindOverride("panel", "panel.background"),
        topbar: s.getTargetKindOverride("topbar", "panel.background"),
      };
    });
    expect(result.panel).toBeUndefined();
    expect(result.topbar).toBe("#00ff00");
  });

  test("getTargetKindOverrides returns all overrides for that kind", async ({ page }) => {
    const count = await page.evaluate(() => {
      const s = (window as OverrideStorageWindow).__lwThemeOverrideStorage!;
      s.setTargetKindOverride("panel", "panel.background", "#ff0000");
      s.setTargetKindOverride("panel", "panel.border", "#00ff00");
      return s.getTargetKindOverrides("panel").length;
    });
    expect(count).toBe(2);
  });

  test("validation: invalid token path throws on setTargetKindOverride", async ({ page }) => {
    const errored = await page.evaluate(() => {
      const s = (window as OverrideStorageWindow).__lwThemeOverrideStorage!;
      try {
        s.setTargetKindOverride("panel", "not.a.real.path" as never, "#ff0000");
        return false;
      } catch {
        return true;
      }
    });
    expect(errored).toBe(true);
  });
});
