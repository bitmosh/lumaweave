// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";
import { clearTiles } from "./helpers/tiles";
import { defaultSettings } from "../../src/control-plane/settings/settings.defaults";

async function openAgentChatTile(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await clearTiles(page);
  // Enable the agent chat tile via the tiles popover
  await page.getByTestId("status-bar-tiles-button").click();
  await expect(page.getByTestId("tiles-popover-content")).toBeVisible({ timeout: 5000 });
  const checkbox = page.getByTestId("tiles-popover-checkbox-agent-chat-section");
  const isChecked = await checkbox.isChecked();
  if (!isChecked) {
    await checkbox.click();
  }
  // Close the popover
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("agent-chat-tile")).toBeVisible({ timeout: 5000 });
}

async function openAgentsSettings(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await clearTiles(page);
  await page.locator('[data-testid="topbar-settings-button"]').click();
  await expect(page.getByTestId("settings-panel-root")).toBeVisible({ timeout: 5000 });
  await page.getByTestId("settings-category-nav-agents").click();
  await expect(page.getByTestId("settings-category-content-agents")).toBeVisible();
}

test.describe("Agent Chat tile", () => {
  test("tile renders empty state initially", async ({ page }) => {
    await openAgentChatTile(page);
    await expect(page.getByTestId("agent-chat-empty")).toBeVisible();
  });

  test("input and send button are present", async ({ page }) => {
    await openAgentChatTile(page);
    await expect(page.getByTestId("agent-chat-input")).toBeVisible();
    await expect(page.getByTestId("agent-chat-send")).toBeVisible();
  });

  test("send button is disabled when input is empty", async ({ page }) => {
    await openAgentChatTile(page);
    await expect(page.getByTestId("agent-chat-send")).toBeDisabled();
  });

  test("send button enables when input has text", async ({ page }) => {
    await openAgentChatTile(page);
    await page.getByTestId("agent-chat-input").fill("Hello");
    await expect(page.getByTestId("agent-chat-send")).toBeEnabled();
  });
});

test.describe("Agents settings", () => {
  test("Agents category appears in settings sidebar", async ({ page }) => {
    await openAgentsSettings(page);
    await expect(page.getByTestId("settings-category-nav-agents")).toBeVisible();
  });

  test("Agents settings show endpoint, model, and API key fields", async ({ page }) => {
    await openAgentsSettings(page);
    await expect(page.getByTestId("settings-agents-endpoint")).toBeVisible();
    await expect(page.getByTestId("settings-agents-model")).toBeVisible();
    await expect(page.getByTestId("settings-agents-apikey")).toBeVisible();
  });

  test("API key warning is visible", async ({ page }) => {
    await openAgentsSettings(page);
    await expect(page.getByTestId("settings-agents-warning")).toBeVisible();
  });

  test("default endpoint is Ollama localhost", async ({ page }) => {
    await openAgentsSettings(page);
    const value = await page.getByTestId("settings-agents-endpoint").inputValue();
    expect(value).toBe("http://localhost:11434/v1");
  });

  test("Test Connection button is present", async ({ page }) => {
    await openAgentsSettings(page);
    await expect(page.getByTestId("settings-agents-test")).toBeVisible();
  });

  test("settings schema version matches the current schema", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const version = await page.evaluate(
      () => (window as any).__lwStore?.getState().settings.version,
    );
    expect(version).toBe(defaultSettings.version);
  });

  test("agents.inference defaults are set", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const inference = await page.evaluate(
      () => (window as any).__lwStore?.getState().settings.agents?.inference,
    );
    expect(inference).toBeDefined();
    expect(inference.endpoint).toBe("http://localhost:11434/v1");
    expect(inference.model).toBe("llama3.1");
    expect(inference.byokKey).toBe("");
  });
});
