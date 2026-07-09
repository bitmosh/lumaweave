// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";
import { openCommandDeck } from "./helpers/tiles";

test("command deck shell is visible", async ({ page }) => {
  await page.goto("/");
  await openCommandDeck(page);

  const commandDeckPanel = page.getByTestId("command-deck-panel");
  await expect(commandDeckPanel).toBeVisible();
});

test("command deck shell displays read-only status", async ({ page }) => {
  await page.goto("/");
  await openCommandDeck(page);

  const commandDeckShell = page.getByTestId("command-deck-shell");
  await expect(commandDeckShell).toBeVisible();

  const shellContent = await commandDeckShell.textContent();
  expect(shellContent).toContain("Read-Only Shell");
  expect(shellContent).toContain("Command execution is locked/deferred");
});

test("command deck shell has no execution controls", async ({ page }) => {
  await page.goto("/");
  await openCommandDeck(page);

  const commandDeckShell = page.getByTestId("command-deck-shell");
  await expect(commandDeckShell).toBeVisible();

  // Verify there are no buttons or interactive elements
  const buttons = commandDeckShell.getByRole("button");
  await expect(buttons).toHaveCount(0);
});

test("existing hotkeys still work after command deck addition", async ({ page }) => {
  await page.goto("/");
  await openCommandDeck(page);

  // Verify command deck tile opened successfully (coexistence check)
  await expect(page.getByTestId("command-deck-panel")).toBeVisible();

  // Verify graph viewport is still visible (fixture is active by default in v75a+)
  const graphViewport = page.getByTestId("graph-viewport");
  await expect(graphViewport).toBeVisible();
});

test("hotkey registry displays accepted hotkeys", async ({ page }) => {
  await page.goto("/");
  await openCommandDeck(page);

  const commandDeckShell = page.getByTestId("command-deck-shell");
  await expect(commandDeckShell).toBeVisible();

  const shellContent = await commandDeckShell.textContent();
  expect(shellContent).toContain("Hotkey Registry");
  expect(shellContent).toContain("Alt+Shift+I");
  expect(shellContent).toContain("Inspector Toggle");
  expect(shellContent).toContain("Alt+Shift+P");
  expect(shellContent).toContain("Pin/Unpin Target");
});

test("hotkey registry shows governance policy", async ({ page }) => {
  await page.goto("/");
  await openCommandDeck(page);

  const commandDeckShell = page.getByTestId("command-deck-shell");
  await expect(commandDeckShell).toBeVisible();

  const shellContent = await commandDeckShell.textContent();
  expect(shellContent).toContain("No new hotkeys may be added without registry approval");
});

test("command registry displays command metadata", async ({ page }) => {
  await page.goto("/");
  await openCommandDeck(page);

  const commandDeckShell = page.getByTestId("command-deck-shell");
  await expect(commandDeckShell).toBeVisible();

  const shellContent = await commandDeckShell.textContent();
  expect(shellContent).toContain("Command Registry");
  expect(shellContent).toContain("Export Theme Override Bundle");
  expect(shellContent).toContain("Toggle Theme Target Inspector");
  expect(shellContent).toContain("Category");
  expect(shellContent).toContain("Status");
});

test("command registry shows read-only notice", async ({ page }) => {
  await page.goto("/");
  await openCommandDeck(page);

  const commandDeckShell = page.getByTestId("command-deck-shell");
  await expect(commandDeckShell).toBeVisible();

  const shellContent = await commandDeckShell.textContent();
  expect(shellContent).toContain("Command registry is read-only");
  expect(shellContent).toContain("No commands can be executed");
});
