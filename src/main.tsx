// SPDX-License-Identifier: Apache-2.0
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import * as ThemeOverrideStorage from "./themes/themeOverrideStorage";

// Expose theme override storage to window for Playwright tests
declare global {
  interface Window {
    __LUMAWEAVE_THEME_OVERRIDE_STORAGE__: typeof ThemeOverrideStorage;
    PLAYWRIGHT: boolean;
  }
}

window.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__ = ThemeOverrideStorage;

// Set PLAYWRIGHT flag for test helpers
(window as any).PLAYWRIGHT = true;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
