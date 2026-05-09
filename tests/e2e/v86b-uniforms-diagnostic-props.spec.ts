/**
 * vP-Forensics-1: v86bUniforms props diagnostic
 *
 * Checks if the v86b uniform props are being passed to SigmaGraphView.
 */

import { test, expect } from "@playwright/test";

test("v86bUniforms diagnostic - check props passed to SigmaGraphView", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("canvas");

  // Check if the settings have the v86b uniform props
  const settings = await page.evaluate(() => {
    const store = (window as any).__lwStore;
    return store.getState().settings.appearance;
  });

  console.log("Appearance settings:", {
    nodeHum: settings.nodeHum,
    nodeFlowSpeed: settings.nodeFlowSpeed,
    nodeGlow: settings.nodeGlow,
    reduceMotion: settings.reduceMotion,
  });

  // Check if these props are being used by checking window.__lwSigma
  const sigmaInfo = await page.evaluate(() => {
    const sigma = (window as any).__lwSigma;
    return {
      hasSigma: !!sigma,
      hasSettings: !!sigma?.__settings,
      settingsKeys: sigma?.__settings ? Object.keys(sigma.__settings) : [],
    };
  });

  console.log("Sigma info:", sigmaInfo);

  // Try to manually trigger the useEffect by setting reduceMotion
  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    store.getState().setSetting("appearance.reduceMotion", true);
  });

  await page.waitForTimeout(300);

  const sigmaInfoAfter = await page.evaluate(() => {
    const sigma = (window as any).__lwSigma;
    return {
      hasSettings: !!sigma?.__settings,
      settingsKeys: sigma?.__settings ? Object.keys(sigma.__settings) : [],
      v86bUniforms: sigma?.__settings?.v86bUniforms,
    };
  });

  console.log("Sigma info after reduceMotion=true:", sigmaInfoAfter);
});
