#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * Ensures Playwright's Chromium binary is installed before tests run.
 * Auto-installs if missing rather than failing with confusing errors.
 * Wired in via the qa:e2e:check npm script.
 */
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const cacheDir = join(homedir(), ".cache", "ms-playwright");

function hasChromium() {
  if (!existsSync(cacheDir)) return false;
  try {
    const entries = readdirSync(cacheDir);
    return entries.some((name) => name.startsWith("chromium-"));
  } catch {
    return false;
  }
}

if (hasChromium()) {
  // Already installed. Silent on success — don't pollute test output.
  process.exit(0);
}

console.log(
  "[playwright self-heal] Chromium not found in cache. Installing..."
);
const result = spawnSync(
  "npx",
  ["playwright", "install", "chromium"],
  { stdio: "inherit", shell: process.platform === "win32" }
);

if (result.status !== 0) {
  console.error(
    "[playwright self-heal] Install failed with exit code",
    result.status
  );
  process.exit(result.status ?? 1);
}

console.log("[playwright self-heal] Chromium installed.");
process.exit(0);
