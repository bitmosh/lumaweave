/**
 * Playwright test helpers for accessing LumaWeave app state
 * 
 * These helpers provide controlled access to the settings store and Sigma
 * instance from Playwright tests. They are gated behind DEV or PLAYWRIGHT
 * environment flags to avoid exposing internals in production builds.
 */

/**
 * Read the current settings from the Zustand store
 */
export async function getSettings(page: any) {
  return page.evaluate(() => {
    // Read from the Zustand store exposed on window
    const store = (window as any).__lwStore;
    if (!store) {
      throw new Error(
        "App state not exposed. Add window.__lwStore = useSettingsStore in dev mode or behind PLAYWRIGHT env flag."
      );
    }
    return store.getState().settings;
  });
}

/**
 * Write to the settings store using nested path notation
 * Example: setSetting(page, "appearance.reduceMotion", true)
 */
export async function setSetting(page: any, path: string, value: unknown) {
  return page.evaluate(
    ({ path: p, value: v }: { path: string; value: unknown }) => {
      const store = (window as any).__lwStore;
      if (!store) {
        throw new Error(
          "App state not exposed. Add window.__lwStore = useSettingsStore in dev mode or behind PLAYWRIGHT env flag."
        );
      }
      // Use the store's setSetting method
      store.getState().setSetting(p, v);
    },
    { path, value }
  );
}

/**
 * Read a Sigma setting (e.g., v86bUniforms)
 */
export async function getSigmaSetting(page: any, key: string) {
  return page.evaluate((k: string) => {
    const sigma = (window as any).__lwSigma;
    if (!sigma) {
      throw new Error(
        "Sigma instance not exposed. Add window.__lwSigma = sigmaRef.current when Sigma mounts in dev mode or behind PLAYWRIGHT env flag."
      );
    }
    return sigma.getSetting?.(k);
  }, key);
}

/**
 * Read Sigma camera state (via camera controller if available)
 */
export async function getSigmaCameraState(page: any) {
  return page.evaluate(() => {
    const sigma = (window as any).__lwSigma;
    if (!sigma) {
      throw new Error(
        "Sigma instance not exposed. Add window.__lwSigma = sigmaRef.current when Sigma mounts in dev mode or behind PLAYWRIGHT env flag."
      );
    }
    // Try camera controller first (v86b), fall back to Sigma's camera
    const cameraController = (window as any).__lwCameraController;
    if (cameraController) {
      return cameraController.getState();
    }
    return sigma.getCamera().getState();
  });
}
