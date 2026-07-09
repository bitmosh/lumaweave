// SPDX-License-Identifier: Apache-2.0
/**
 * useResolvedTargetColor Hook (v86d.3b)
 *
 * Resolves color overrides for a target token. Uses useSyncExternalStore
 * with a window custom event — immune to Vite HMR module-boundary splits
 * and React 18 Strict Mode double-invoke edge cases.
 */

import { useSyncExternalStore } from "react";
import { resolveForTarget } from "./themeOverrideStorage";
import type { ThemeTokenPath } from "./themeTokenPaths";

const EVENT = "lw:override-change";

declare global {
  interface Window { __lwOverrideVersion?: number; }
}

export function notifyOverrideChange(): void {
  window.__lwOverrideVersion = (window.__lwOverrideVersion ?? 0) + 1;
  window.dispatchEvent(new CustomEvent(EVENT));
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}

function getSnapshot(): number {
  return window.__lwOverrideVersion ?? 0;
}

export function useResolvedTargetColor(
  targetId: string,
  tokenPath: ThemeTokenPath,
  fallback: string,
): string {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const resolved = resolveForTarget(tokenPath, targetId);
  return typeof resolved === "string" ? resolved : fallback;
}
