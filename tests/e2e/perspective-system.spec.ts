// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";
import { openCommandDeck } from "./helpers/tiles";

test.describe("Perspective System v0", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await openCommandDeck(page);
  });

  test("Perspective System section is visible in Command Deck Shell", async ({ page }) => {
    // Command Deck Shell is rendered in AppShell, verify it exists
    const commandDeckShell = page.getByTestId("command-deck-shell");
    await expect(commandDeckShell).toBeVisible();

    // Verify Perspective System heading exists (use heading role to avoid QA selector conflict)
    const perspectiveSystemHeading = page.getByRole("heading", { name: "Perspective System" });
    await expect(perspectiveSystemHeading).toBeVisible();
  });

  test("Built-in perspectives are listed with data-testid attributes", async ({ page }) => {
    // Verify perspective rows exist by their data-testid attributes
    const defaultArchitectureRow = page.getByTestId("perspective-row-default-architecture");
    await expect(defaultArchitectureRow).toBeVisible();

    const themeMappingRow = page.getByTestId("perspective-row-theme-mapping");
    await expect(themeMappingRow).toBeVisible();

    const commandDeckRow = page.getByTestId("perspective-row-command-deck");
    await expect(commandDeckRow).toBeVisible();

    const qaEvidenceRow = page.getByTestId("perspective-row-qa-evidence");
    await expect(qaEvidenceRow).toBeVisible();
  });

  test("Future perspectives have future status and locked labels", async ({ page }) => {
    // Verify graph physics perspective has future status and locked label
    const graphPhysicsRow = page.getByTestId("perspective-row-graph-physics");
    await expect(graphPhysicsRow).toBeVisible();
    await expect(graphPhysicsRow).toContainText("Status: future");
    await expect(graphPhysicsRow).toContainText("Locked in v38");

    // Verify source adapter perspective has future status and locked label
    const sourceAdapterRow = page.getByTestId("perspective-row-source-adapter");
    await expect(sourceAdapterRow).toBeVisible();
    await expect(sourceAdapterRow).toContainText("Status: future");
    await expect(sourceAdapterRow).toContainText("Locked in v38");
  });

  test("v38 badge exists in Command Deck Shell", async ({ page }) => {
    // Verify v38 badge exists
    const v38Badge = page.getByText("v38:");
    await expect(v38Badge).toBeVisible();
  });
});
