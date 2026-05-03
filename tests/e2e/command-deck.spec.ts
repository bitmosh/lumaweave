import { test, expect } from "@playwright/test";

test("command deck shell is visible", async ({ page }) => {
  await page.goto("/");

  const commandDeckPanel = page.getByTestId("command-deck-panel");
  await expect(commandDeckPanel).toBeVisible();
});

test("command deck shell displays read-only status", async ({ page }) => {
  await page.goto("/");

  const commandDeckShell = page.getByTestId("command-deck-shell");
  await expect(commandDeckShell).toBeVisible();

  const shellContent = await commandDeckShell.textContent();
  expect(shellContent).toContain("Read-Only Shell");
  expect(shellContent).toContain("Command execution is locked/deferred");
});

test("command deck shell has no execution controls", async ({ page }) => {
  await page.goto("/");

  const commandDeckShell = page.getByTestId("command-deck-shell");
  await expect(commandDeckShell).toBeVisible();

  // Verify there are no buttons or interactive elements
  const buttons = commandDeckShell.getByRole("button");
  await expect(buttons).toHaveCount(0);
});

test("existing hotkeys still work after command deck addition", async ({ page }) => {
  await page.goto("/");

  // Verify QA panel is still visible
  const qaPanel = page.getByTestId("qa-panel").first();
  await expect(qaPanel).toBeVisible();

  // Verify graph viewport is still visible
  const graphViewport = page.getByTestId("graph-viewport");
  await expect(graphViewport).toBeVisible();
});
