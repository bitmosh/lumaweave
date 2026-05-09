/**
 * vP-Forensics-1: useEffect diagnostic
 *
 * Checks if the v86bUniforms useEffect runs when reduceMotion changes.
 */

import { test, expect } from "@playwright/test";
import { setSetting, getSigmaSetting } from "../helpers/app-state";

test("v86bUniforms diagnostic - check useEffect reactivity", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("canvas");

  // Get initial v86bUniforms
  const u1 = await getSigmaSetting(page, "v86bUniforms");
  console.log("Initial v86bUniforms:", u1);

  // Set reduceMotion to true
  await setSetting(page, "appearance.reduceMotion", true);
  await page.waitForTimeout(200);

  // Get v86bUniforms after reduceMotion change
  const u2 = await getSigmaSetting(page, "v86bUniforms");
  console.log("After reduceMotion=true:", u2);

  // Check if reduceMotion prop actually changed in the component
  const reduceMotionProp = await page.evaluate(() => {
    // We can't directly access component props, but we can check the store
    const store = (window as any).__lwStore;
    return store.getState().settings.appearance.reduceMotion;
  });
  console.log("Store reduceMotion:", reduceMotionProp);

  // Force a page refresh to see if that triggers the useEffect
  await page.reload();
  await page.waitForSelector("canvas");
  await page.waitForTimeout(200);

  const u3 = await getSigmaSetting(page, "v86bUniforms");
  console.log("After reload with reduceMotion=true:", u3);
});
