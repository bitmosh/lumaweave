/**
 * useResolvedTargetColor Hook (v86d.3b)
 *
 * Resolves color overrides for a target token. Uses a window custom event
 * for cross-module notification — immune to Vite HMR module-boundary splits.
 */

import { useReducer, useEffect } from "react";
import { resolveForTarget } from "./themeOverrideStorage";
import type { ThemeTokenPath } from "./themeTokenPaths";

const EVENT = "lw:override-change";

export function notifyOverrideChange(): void {
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useResolvedTargetColor(
  targetId: string,
  tokenPath: ThemeTokenPath,
  fallback: string,
): string {
  const [, forceUpdate] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    const handler = () => forceUpdate();
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  const resolved = resolveForTarget(tokenPath, targetId);
  return typeof resolved === "string" ? resolved : fallback;
}
