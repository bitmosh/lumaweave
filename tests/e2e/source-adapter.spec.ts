import { test, expect } from "@playwright/test";

test("Source Adapter Panel renders", async ({ page }) => {
  await page.goto("/");

  const sourceAdapterPanel = page.getByTestId("source-adapter-panel");
  await expect(sourceAdapterPanel).toBeVisible();
});

test("Source Adapter entry count is visible", async ({ page }) => {
  await page.goto("/");

  const entryCount = page.getByTestId("source-adapter-entry-count");
  await expect(entryCount).toBeVisible();
  await expect(entryCount).toHaveText("9");
});

test("Source Adapter self-graph entry renders", async ({ page }) => {
  await page.goto("/");

  const selfGraphEntry = page.getByTestId("source-adapter-entry-self-graph-yaml-frontmatter");
  await expect(selfGraphEntry).toBeVisible();
});

test("Source Adapter git-codebase entry renders", async ({ page }) => {
  await page.goto("/");

  const gitCodebaseEntry = page.getByTestId("source-adapter-entry-git-codebase");
  await expect(gitCodebaseEntry).toBeVisible();
});

test("Source Adapter website-url entry renders", async ({ page }) => {
  await page.goto("/");

  const websiteUrlEntry = page.getByTestId("source-adapter-entry-website-url");
  await expect(websiteUrlEntry).toBeVisible();
});

test("Source Adapter Panel has no dead active controls", async ({ page }) => {
  await page.goto("/");

  const sourceAdapterPanel = page.getByTestId("source-adapter-panel");

  // Check for enabled buttons inside source-adapter-panel
  const buttons = sourceAdapterPanel.getByRole("button");
  const buttonCount = await buttons.count();

  // If buttons exist, verify they are not enabled without clear purpose
  if (buttonCount > 0) {
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const isEnabled = await button.isEnabled();
      if (isEnabled) {
        const text = await button.textContent();
        throw new Error(`Found enabled button with text: "${text}" - SourceAdapterPanel should be read-only`);
      }
    }
  }

  // Check for links with href="#" or empty action
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
