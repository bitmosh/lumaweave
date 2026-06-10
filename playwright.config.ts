import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: "http://localhost:1420",
    trace: "on-first-retry",
    screenshot: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: process.env.CI
      ? "npm run build && npx vite preview --port 1420"
      : "npm run dev",
    url: "http://localhost:1420",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Load-bearing: sets __PLAYWRIGHT__ build-time define (vite.config.ts) → isTestEnv=true in bundle.
      PLAYWRIGHT: "true",
    },
  },
});