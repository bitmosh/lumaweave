/**
 * Theme Crossfade
 *
 * React hook that interpolates ThemeRuntimeTokens.app color values over
 * 300ms when the target tokens change. Drives the interpolation via rAF
 * so React re-renders at each frame with the correct interpolated values.
 *
 * v87.4: linear RGB hex math via colorInterpolation. v93 swaps for OKLCH.
 *
 * Also writes --lw-app-background to document.documentElement during
 * crossfade for testability (dev/PLAYWRIGHT probe).
 */

import { useState, useEffect, useRef } from "react";
import { interpolateColor } from "./colorInterpolation";
import type { ThemeRuntimeTokens } from "./theme.types";

type AppTokens = ThemeRuntimeTokens["app"];

const CROSSFADE_DURATION = 300;

/** Keys in ThemeRuntimeTokens.app that are color strings (interpolatable). */
const COLOR_KEYS: (keyof AppTokens)[] = [
  "background",
  "panelBackground",
  "panelBorder",
  "textPrimary",
  "textMuted",
  "accent",
  "glow",
];

function interpolateAppTokens(from: AppTokens, to: AppTokens, t: number): AppTokens {
  const result = { ...to };
  for (const key of COLOR_KEYS) {
    const f = from[key] as string;
    const tgt = to[key] as string;
    (result as any)[key] = interpolateColor(f, tgt, t);
  }
  return result;
}

/**
 * Returns interpolated `app` tokens, animating over CROSSFADE_DURATION ms
 * when targetTokens changes. Snaps instantly when reduceMotion is true.
 */
export function useCrossfadeAppTokens(
  targetTokens: ThemeRuntimeTokens,
  reduceMotion: boolean,
): ThemeRuntimeTokens {
  const [activeTokens, setActiveTokens] = useState<ThemeRuntimeTokens>(targetTokens);
  const prevTokensRef = useRef<ThemeRuntimeTokens>(targetTokens);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = prevTokensRef.current;

    // Cancel any in-flight crossfade
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (reduceMotion || prev.app.background === targetTokens.app.background) {
      // Snap path
      prevTokensRef.current = targetTokens;
      setActiveTokens(targetTokens);
      writeCrossfadeProbe(targetTokens.app.background);
      return;
    }

    const startTime = performance.now();
    const fromApp = prev.app;
    const toApp = targetTokens.app;

    function tick() {
      const elapsed = performance.now() - startTime;
      const t = Math.min(1, elapsed / CROSSFADE_DURATION);
      const interpolated = interpolateAppTokens(fromApp, toApp, t);

      writeCrossfadeProbe(interpolated.background);
      setActiveTokens({ ...targetTokens, app: interpolated });

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        prevTokensRef.current = targetTokens;
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [targetTokens, reduceMotion]);

  return activeTokens;
}

function writeCrossfadeProbe(background: string) {
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--lw-app-background", background);
  }
}

if (
  typeof window !== "undefined" &&
  (import.meta.env.DEV || (window as any).PLAYWRIGHT)
) {
  (window as any).__lwThemeCrossfade = {
    interpolateColor,
    CROSSFADE_DURATION,
  };
}
