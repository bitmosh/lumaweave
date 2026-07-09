// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";
import { openSourceAdapter } from "./helpers/tiles";

test("Source Adapter Panel renders", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openSourceAdapter(page);

  const sourceAdapterPanel = page.getByTestId("source-adapter-panel");
  await expect(sourceAdapterPanel).toBeVisible();
});

test("Source Adapter entry count is visible", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openSourceAdapter(page);

  const entryCount = page.getByTestId("source-adapter-entry-count");
  await expect(entryCount).toBeVisible();
  await expect(entryCount).toHaveText("11");
});

test("Source Adapter self-graph entry renders", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openSourceAdapter(page);

  const selfGraphEntry = page.getByTestId("source-adapter-entry-self-graph-yaml-frontmatter");
  await expect(selfGraphEntry).toBeVisible();
});

test("Source Adapter git-codebase entry renders", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openSourceAdapter(page);

  const gitCodebaseEntry = page.getByTestId("source-adapter-entry-git-codebase");
  await expect(gitCodebaseEntry).toBeVisible();
});

test("Source Adapter website-url entry renders", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openSourceAdapter(page);

  const websiteUrlEntry = page.getByTestId("source-adapter-entry-website-url");
  await expect(websiteUrlEntry).toBeVisible();
});

test("Source Adapter registered entry has set-active button; candidate entries do not", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openSourceAdapter(page);

  // self-graph-yaml-frontmatter is the only registered adapter
  const setActiveBtn = page.getByTestId("source-adapter-set-active-self-graph-yaml-frontmatter");
  await expect(setActiveBtn).toBeVisible();

  // candidate adapters have no set-active button
  const gitCodebaseBtn = page.getByTestId("source-adapter-set-active-git-codebase");
  await expect(gitCodebaseBtn).not.toBeVisible();
});

test("Source Adapter self-graph is active by default; button is disabled", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openSourceAdapter(page);

  // Active indicator visible
  const activeIndicator = page.getByTestId("source-adapter-active-indicator-self-graph-yaml-frontmatter");
  await expect(activeIndicator).toBeVisible();

  // Button is disabled (it's already active)
  const setActiveBtn = page.getByTestId("source-adapter-set-active-self-graph-yaml-frontmatter");
  await expect(setActiveBtn).toBeDisabled();

  // Settings store reflects the default
  const activeId = await page.evaluate(
    () => (window as any).__lwStore?.getState().settings.sources.active,
  );
  expect(activeId).toBe("self-graph-yaml-frontmatter");
});

test("Source Adapter set-active click updates settings store and active indicator", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openSourceAdapter(page);

  // Force a state where self-graph is NOT active so we can test the click path.
  // Set active to null via the store, then click Set as active on self-graph.
  await page.evaluate(
    () => (window as any).__lwStore?.getState().setSetting("sources.active", null),
  );

  // Button should now be enabled (self-graph not active)
  const setActiveBtn = page.getByTestId("source-adapter-set-active-self-graph-yaml-frontmatter");
  await expect(setActiveBtn).toBeEnabled();

  // Active indicator should be gone
  const activeIndicator = page.getByTestId("source-adapter-active-indicator-self-graph-yaml-frontmatter");
  await expect(activeIndicator).not.toBeVisible();

  // Click to set active
  await setActiveBtn.click();

  // Settings store updated
  const activeId = await page.evaluate(
    () => (window as any).__lwStore?.getState().settings.sources.active,
  );
  expect(activeId).toBe("self-graph-yaml-frontmatter");

  // Active indicator now visible
  await expect(activeIndicator).toBeVisible();

  // Button is now disabled
  await expect(setActiveBtn).toBeDisabled();
});

test("Configuration section appears for active entry only", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openSourceAdapter(page);

  // Self-graph is active by default — its card should show the empty-state config section
  const activeEntry = page.getByTestId("source-adapter-entry-self-graph-yaml-frontmatter");
  await expect(activeEntry.getByTestId("adapter-config-empty")).toBeVisible();

  // A candidate entry should NOT have a config section
  const candidateEntry = page.getByTestId("source-adapter-entry-git-codebase");
  await expect(candidateEntry.getByTestId("adapter-config-empty")).not.toBeVisible();
});

test("Source Adapter no dead links in panel", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openSourceAdapter(page);

  const sourceAdapterPanel = page.getByTestId("source-adapter-panel");
  const links = sourceAdapterPanel.getByRole("link");
  const linkCount = await links.count();

  if (linkCount > 0) {
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const href = await link.getAttribute("href");
      if (href === "#" || href === "") {
        const text = await link.textContent();
        throw new Error(`Found link with empty href: "${text}" - SourceAdapterPanel should not have dead links`);
      }
    }
  }
});
