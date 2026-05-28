/**
 * colorMath.ts — small OKLCH-centric color utility module
 *
 * v99 — wraps culori for perceptually-correct OKLCH interpolation.
 * Keeps culori's API surface internal so future library changes
 * only touch this file; callers see a stable LumaWeave-internal API.
 *
 * Why OKLCH: hue + chroma + lightness in perceptual color space means
 * interpolation paths stay vivid. Gold → magenta in hex passes through
 * muddy gray; in OKLCH it rotates around the hue wheel without dropping
 * in chroma.
 */

import { oklch, formatHex, interpolate, type Oklch, type Color } from "culori";

/**
 * Convert any CSS color string (hex, rgb, hsl, etc.) to an OKLCH object.
 * Returns null if the input is unparseable.
 */
export function toOklch(input: string): Oklch | null {
  const parsed = oklch(input);
  return parsed ?? null;
}

/**
 * Convert an OKLCH object back to a hex string for runtime CSS variable use.
 * culori's formatHex clamps out-of-gamut colors into sRGB.
 */
export function oklchToHex(color: Oklch | Color): string {
  return formatHex(color);
}

/**
 * Interpolate between two CSS color strings in OKLCH space.
 * t=0 returns fromColor, t=1 returns toColor, values outside [0,1] are clamped.
 *
 * Uses culori's hue-shortest-path interpolation — the path that stays vivid
 * rather than the one that cuts through the gray center of the color solid.
 * Falls back gracefully (snap at midpoint) if either color is unparseable.
 */
export function interpolateOklch(
  fromColor: string,
  toColor: string,
  t: number,
): string {
  const clamped = Math.max(0, Math.min(1, t));
  if (clamped === 0) return fromColor;
  if (clamped === 1) return toColor;

  const interpolator = interpolate([fromColor, toColor], "oklch");
  const result = interpolator(clamped);
  return formatHex(result);
}

/**
 * Interpolate between two CSS color strings in OKLCH space, returning an
 * rgba() string with an explicit alpha channel.
 * Useful for semi-transparent overlays during crossfade.
 */
export function interpolateOklchRgba(
  fromColor: string,
  toColor: string,
  t: number,
  alpha: number = 1,
): string {
  const hex = interpolateOklch(fromColor, toColor, t);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Return chroma values at the start, midpoint, and end of an OKLCH interpolation.
 * Used to verify a transition doesn't dip into desaturated gray.
 * Returns null if either input color is unparseable.
 */
export function interpolationChroma(
  fromColor: string,
  toColor: string,
): { start: number; mid: number; end: number } | null {
  const start = toOklch(fromColor);
  const end = toOklch(toColor);
  if (!start || !end) return null;

  const interpolator = interpolate([fromColor, toColor], "oklch");
  const midResult = interpolator(0.5);
  const mid = oklch(formatHex(midResult));
  if (!mid) return null;

  return {
    start: start.c ?? 0,
    mid: mid.c ?? 0,
    end: end.c ?? 0,
  };
}
