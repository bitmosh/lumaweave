/**
 * vP-Forensics-1: v86bUniforms diagnostic
 *
 * Diagnoses why v86bUniforms is undefined in reduce-motion-halt tests.
 */

import { test, expect } from "@playwright/test";
import { setSetting, getSigmaSetting } from "../helpers/app-state";

test("v86bUniforms diagnostic - check sigma exposure and settings", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("canvas");

  // Check 1: Is sigma exposed?
  const sigmaExposed = await page.evaluate(() => {
    return typeof (window as any).__lwSigma !== "undefined";
  });
  console.log(`Sigma exposed: ${sigmaExposed}`);
  expect(sigmaExposed).toBe(true);

  // Check 2: Does sigma have getSetting?
  const hasGetSetting = await page.evaluate(() => {
    const sigma = (window as any).__lwSigma;
    return typeof sigma?.getSetting === "function";
  });
  console.log(`Sigma has getSetting: ${hasGetSetting}`);
  expect(hasGetSetting).toBe(true);

  // Check 3: Does sigma have __settings?
  const hasSettings = await page.evaluate(() => {
    const sigma = (window as any).__lwSigma;
    return typeof sigma?.__settings === "object";
  });
  console.log(`Sigma has __settings: ${hasSettings}`);

  // Check 4: Is v86bUniforms in __settings?
  const hasV86bUniforms = await page.evaluate(() => {
    const sigma = (window as any).__lwSigma;
    return typeof sigma?.__settings?.v86bUniforms === "object";
  });
  console.log(`v86bUniforms in __settings: ${hasV86bUniforms}`);

  // Check 5: Try getSigmaSetting
  try {
    const v86bUniforms = await getSigmaSetting(page, "v86bUniforms");
    console.log(`getSigmaSetting result:`, v86bUniforms);
  } catch (e) {
    console.log(`getSigmaSetting error:`, e);
  }

  // Check 6: Set reduceMotion and check if v86bUniforms updates
  await setSetting(page, "appearance.reduceMotion", true);
  await page.waitForTimeout(200);

  const v86bUniformsAfter = await page.evaluate(() => {
    const sigma = (window as any).__lwSigma;
    return sigma?.__settings?.v86bUniforms;
  });
  console.log(`v86bUniforms after reduceMotion=true:`, v86bUniformsAfter);
});
