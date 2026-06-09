import { test, expect } from "@playwright/test";

test.describe("ide-integration (v96)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[data-testid="graph-viewport"]', { timeout: 15000 });
  });

  test("inspector:open-in-ide listener installs without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    // Reload to capture any install-time errors with the listener in the fresh hook
    await page.reload();
    await page.waitForSelector('[data-testid="graph-viewport"]', { timeout: 15000 });
    const ideErrors = errors.filter((e) => e.toLowerCase().includes("open-in-ide"));
    expect(ideErrors).toHaveLength(0);
  });

  test("dispatching inspector:open-in-ide does not throw", async ({ page }) => {
    const threw = await page.evaluate(async () => {
      try {
        window.dispatchEvent(
          new CustomEvent("inspector:open-in-ide", {
            detail: { filePath: "/home/user/project/src/file.ts", lineNumber: 10 },
          }),
        );
        // Allow microtasks to flush (the listener is async)
        await new Promise((r) => setTimeout(r, 50));
        return false;
      } catch {
        return true;
      }
    });
    expect(threw).toBe(false);
  });

  test("editorTemplateRegistry exposes all 10 editor ids in DEV/PLAYWRIGHT mode", async ({ page }) => {
    const ids = await page.evaluate(() => {
      const reg = (window as any).__lwEditorTemplateRegistry;
      return reg ? Object.keys(reg.templates) : null;
    });
    expect(ids).not.toBeNull();
    expect(ids).toHaveLength(10);
    expect(ids).toContain("vscode");
    expect(ids).toContain("windsurf");
    expect(ids).toContain("cursor");
    expect(ids).toContain("system-default");
    expect(ids).toContain("custom");
  });

  test("buildEditorUrl returns correct vscode URL", async ({ page }) => {
    const url = await page.evaluate(() => {
      const reg = (window as any).__lwEditorTemplateRegistry;
      return reg?.buildEditorUrl("vscode", "/home/user/src/component.tsx", 42);
    });
    expect(url).toBe("vscode://file//home/user/src/component.tsx:42");
  });

  test("buildEditorUrl returns null for system-default editor", async ({ page }) => {
    const url = await page.evaluate(() => {
      const reg = (window as any).__lwEditorTemplateRegistry;
      return reg?.buildEditorUrl("system-default", "/home/user/src/component.tsx", 1);
    });
    expect(url).toBeNull();
  });
});
