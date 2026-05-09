/**
 * vP-Forensics-1: Listener Verification Diagnostic
 *
 * Verifies that page.on('console') captures browser logs correctly.
 * This is a prerequisite for investigating the reduce-motion-halt failures,
 * which depend on console.log diagnostics from the rAF loop.
 */

import { test, expect } from "@playwright/test";

test("console listener captures browser logs", async ({ page }) => {
  const logs: string[] = [];

  page.on("console", (msg) => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });

  await page.goto("/");

  // Emit a known log from the browser
  await page.evaluate(() => {
    console.log("LISTENER_TEST: This should be captured");
  });

  // Wait a moment for the event to fire
  await page.waitForTimeout(100);

  // Verify the log was captured
  expect(logs.some(log => log.includes("LISTENER_TEST: This should be captured"))).toBe(true);
});
