import { test, expect } from "@playwright/test";

test("System Index Panel renders", async ({ page }) => {
  await page.goto("/");

  const systemIndexPanel = page.getByTestId("system-index-panel");
  await expect(systemIndexPanel).toBeVisible();
});

test("System Index entry count is visible", async ({ page }) => {
  await page.goto("/");

  const entryCount = page.getByTestId("system-index-entry-count");
  await expect(entryCount).toBeVisible();
  await expect(entryCount).toHaveText("16");
});

test("System Index future docs-only entries render", async ({ page }) => {
  await page.goto("/");

  const visualGrammarEngine = page.getByTestId("system-index-entry-visual-grammar-engine");
  await expect(visualGrammarEngine).toBeVisible();

  const signalLoomRouting = page.getByTestId("system-index-entry-signal-loom-routing");
  await expect(signalLoomRouting).toBeVisible();

  const lumaweaveArenaConcept = page.getByTestId("system-index-entry-lumaweave-arena-concept");
  await expect(lumaweaveArenaConcept).toBeVisible();

  const selfGraphFixture = page.getByTestId("system-index-entry-self-graph-fixture");
  await expect(selfGraphFixture).toBeVisible();
});

test("System Index forbidden boundaries render for critical entries", async ({ page }) => {
  await page.goto("/");

  const graphThemeMapping = page.getByTestId(
    "system-index-entry-forbidden-boundaries-graph-theme-mapping-registry",
  );
  await expect(graphThemeMapping).toBeVisible();

  const audioMusicReactiveMapping = page.getByTestId(
    "system-index-entry-forbidden-boundaries-audio-music-reactive-mapping-registry",
  );
  await expect(audioMusicReactiveMapping).toBeVisible();

  const audioSourceRegistry = page.getByTestId(
    "system-index-entry-forbidden-boundaries-audio-source-registry",
  );
  await expect(audioSourceRegistry).toBeVisible();

  const lumaweaveArenaConcept = page.getByTestId(
    "system-index-entry-forbidden-boundaries-lumaweave-arena-concept",
  );
  await expect(lumaweaveArenaConcept).toBeVisible();
});

test("System Index Panel has no dead active controls", async ({ page }) => {
  await page.goto("/");

  const systemIndexPanel = page.getByTestId("system-index-panel");

  // Check for enabled buttons inside system-index-panel
  const buttons = systemIndexPanel.getByRole("button");
  const buttonCount = await buttons.count();

  // If buttons exist, verify they are not enabled without clear purpose
  if (buttonCount > 0) {
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const isEnabled = await button.isEnabled();
      if (isEnabled) {
        const text = await button.textContent();
        // This test will fail if there are enabled buttons without clear purpose
        // Adjust this check if SystemIndexPanel intentionally adds functional buttons
        throw new Error(`Found enabled button with text: "${text}" - SystemIndexPanel should be read-only`);
      }
    }
  }

  // Check for links with href="#" or empty action
  const links = systemIndexPanel.getByRole("link");
  const linkCount = await links.count();

  if (linkCount > 0) {
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const href = await link.getAttribute("href");
      if (href === "#" || href === "") {
        const text = await link.textContent();
        throw new Error(`Found link with empty href: "${text}" - SystemIndexPanel should not have dead links`);
      }
    }
  }
});
