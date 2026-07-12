// SPDX-License-Identifier: Apache-2.0
//
// The GraphSourcePicker createPortals to document.body. CSS custom properties inherit
// DOWNWARD, so tokens declared as an inline style on <main> — a *descendant* of body — were
// invisible to it: every var(--lw-*) in GraphSourcePicker.css silently resolved to its
// hardcoded cyan/slate fallback, and the busiest new surface in the app was the one surface
// no theme could reach. AppShell now mirrors the token block onto documentElement.
//
// These assert the portal actually sees the live theme, and follows a theme change.
import { test, expect } from "@playwright/test";
import { openGraphSources } from "./helpers/tiles";

async function openPicker(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    (window as any).__lwStore?.getState().setSetting("sources.active", null);
  });
  await openGraphSources(page);
  await page.getByTestId("graph-sources-open-picker-btn").click();
  await expect(page.getByTestId("graph-source-picker-backdrop")).toBeVisible({ timeout: 3000 });
}

/** Resolve --lw-accent as the portaled modal actually sees it. */
const modalAccent = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const modal = document.querySelector(".lw-picker__modal");
    if (!modal) throw new Error("picker modal not found");
    return {
      onModal: getComputedStyle(modal).getPropertyValue("--lw-accent").trim(),
      onRoot: getComputedStyle(document.documentElement)
        .getPropertyValue("--lw-accent")
        .trim(),
      // Proves the modal really is outside the element that used to own the tokens.
      insideMain: !!modal.closest("main"),
    };
  });

test("the portaled picker inherits the app's theme tokens", async ({ page }) => {
  await openPicker(page);

  const { onModal, onRoot, insideMain } = await modalAccent(page);

  // Precondition: the modal is genuinely outside <main>. If this ever becomes false the
  // bug is masked rather than fixed, and this spec would pass for the wrong reason.
  expect(insideMain).toBe(false);

  expect(onRoot).not.toBe("");
  expect(onModal).toBe(onRoot);
});

test("changing the theme changes what the picker resolves", async ({ page }) => {
  await openPicker(page);

  const before = (await modalAccent(page)).onModal;

  await page.evaluate(() => {
    (window as any).__lwStore.getState().setSetting("appearance.theme", "midnight-loom");
  });
  // Token crossfade settles well within this.
  await expect
    .poll(async () => (await modalAccent(page)).onModal, { timeout: 5000 })
    .not.toBe(before);

  const after = await modalAccent(page);
  expect(after.onModal).toBe(after.onRoot);
});
