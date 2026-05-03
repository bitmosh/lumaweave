import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import * as ThemeOverrideStorage from "./themes/themeOverrideStorage";

// Expose theme override storage to window for Playwright tests
declare global {
  interface Window {
    __LUMAWEAVE_THEME_OVERRIDE_STORAGE__: typeof ThemeOverrideStorage;
  }
}

window.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__ = ThemeOverrideStorage;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
