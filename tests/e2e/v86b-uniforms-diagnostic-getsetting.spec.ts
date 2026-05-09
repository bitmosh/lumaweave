/**
 * vP-Forensics-1: getSetting diagnostic
 *
 * Checks if sigma.getSetting is the custom method or Sigma's built-in method.
 */

import { test, expect } from "@playwright/test";

test("v86bUniforms diagnostic - check getSetting implementation", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("canvas");

  const getSettingInfo = await page.evaluate(() => {
    const sigma = (window as any).__lwSigma;
    const getSetting = sigma?.getSetting;
    return {
      hasGetSetting: typeof getSetting === "function",
      getSettingSource: getSetting?.toString().includes("__settings") ? "custom" : "sigma-built-in",
      getSettingString: getSetting?.toString().substring(0, 200),
      __settings: sigma?.__settings,
      __settingsKeys: sigma?.__settings ? Object.keys(sigma.__settings) : [],
    };
  });

  console.log("getSetting info:", getSettingInfo);

  // Try calling getSetting directly
  const directCall = await page.evaluate(() => {
    const sigma = (window as any).__lwSigma;
    return sigma?.getSetting?.("v86bUniforms");
  });

  console.log("Direct getSetting call result:", directCall);

  // Try accessing __settings directly
  const directAccess = await page.evaluate(() => {
    const sigma = (window as any).__lwSigma;
    return sigma?.__settings?.["v86bUniforms"];
  });

  console.log("Direct __settings access result:", directAccess);
});
