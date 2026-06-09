import { test, expect } from "@playwright/test";
import { openGraphSources } from "./helpers/tiles";

test("Graph Sources tile renders with Regenerate button", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openGraphSources(page);

  const tile = page.getByTestId("graph-sources-tile-content");
  await expect(tile).toBeVisible();

  const regenBtn = page.getByTestId("graph-sources-regenerate-btn");
  await expect(regenBtn).toBeVisible();
  await expect(regenBtn).toBeEnabled();
});

test("Graph Sources Regenerate button — success path updates refreshToken", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openGraphSources(page);

  // Read baseline refreshToken
  const tokenBefore = await page.evaluate(
    () => (window as any).__lwStore?.getState().settings.sources.refreshToken ?? 0,
  );

  // Inject mock: run_script returns success
  await page.evaluate(() => {
    (window as any).__lwTauriMock = {
      run_script: async () => ({ stdout: "done", stderr: "", exit_code: 0 }),
      get_project_root: async () => "/mock/project/root",
    };
  });

  const regenBtn = page.getByTestId("graph-sources-regenerate-btn");
  await regenBtn.click();

  // After success, refreshToken should be incremented
  // Audited 2026-06-09 (v111.3): correct web-first pattern (polling for store state change).
  // This was previously listed as a flaker but the implementation is sound.
  await page.waitForFunction(
    (before) => {
      const token = (window as any).__lwStore?.getState().settings.sources.refreshToken ?? 0;
      return token > before;
    },
    tokenBefore,
    { timeout: 5000 },
  );

  const tokenAfter = await page.evaluate(
    () => (window as any).__lwStore?.getState().settings.sources.refreshToken ?? 0,
  );
  expect(tokenAfter).toBe(tokenBefore + 1);

  // Last-generated timestamp should appear
  const lastGenerated = page.getByTestId("graph-sources-last-generated");
  await expect(lastGenerated).toBeVisible();
});

test("Graph Sources Regenerate button — error path shows error testid", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openGraphSources(page);

  // Inject mock: run_script returns non-zero exit
  await page.evaluate(() => {
    (window as any).__lwTauriMock = {
      run_script: async () => ({ stdout: "", stderr: "Node not found", exit_code: 127 }),
      get_project_root: async () => "/mock/project/root",
    };
  });

  const regenBtn = page.getByTestId("graph-sources-regenerate-btn");
  await regenBtn.click();

  // Error testid should appear
  const errorDiv = page.getByTestId("graph-sources-regenerate-error");
  await expect(errorDiv).toBeVisible();
  await expect(errorDiv).toContainText("Node not found");

  // Button should now say "Retry"
  await expect(regenBtn).toHaveText("Retry");
});

test("Graph Sources Regenerate button disabled during running state", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openGraphSources(page);

  // Inject mock: run_script resolves after a short delay
  await page.evaluate(() => {
    (window as any).__lwTauriMock = {
      run_script: () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ stdout: "", stderr: "", exit_code: 0 }), 500),
        ),
      get_project_root: async () => "/mock/project/root",
    };
  });

  const regenBtn = page.getByTestId("graph-sources-regenerate-btn");
  await regenBtn.click();

  // During the 500ms delay the button should be disabled with status text
  await expect(regenBtn).toBeDisabled();
  const status = page.getByTestId("graph-sources-regenerate-status");
  await expect(status).toBeVisible();
});
