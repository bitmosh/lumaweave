/**
 * Color Interpolation
 *
 * v99: delegates to OKLCH-correct interpolation via colorMath.ts (culori).
 * Signature unchanged; callers (themeCrossfade.ts) require no updates.
 *
 * Handles: "#rrggbb", "#rgb", "rgba(r,g,b,a)", "rgb(r,g,b)", and any
 * CSS color string culori can parse. Pass-through (snap at t=0.5) for
 * unparseable values (CSS vars, keywords) — same behavior as before.
 */

import { interpolateOklch } from "./colorMath";

export function interpolateColor(from: string, to: string, t: number): string {
  return interpolateOklch(from, to, t);
}

// ---------------------------------------------------------------------------
// LEGACY — hex math implementation kept for rollback safety (v99).
// Remove in a future polish pass once OKLCH has baked in production.
// ---------------------------------------------------------------------------

interface _RGBA { r: number; g: number; b: number; a: number }

/** @deprecated v99: use interpolateOklch from colorMath.ts */
function _parseColorHex(color: string): _RGBA | null {
  const trimmed = color.trim();

  const hexMatch = trimmed.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      return { r: parseInt(hex[0] + hex[0], 16), g: parseInt(hex[1] + hex[1], 16), b: parseInt(hex[2] + hex[2], 16), a: 1 };
    }
    return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16), a: 1 };
  }

  const rgbaMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1], 10),
      g: parseInt(rgbaMatch[2], 10),
      b: parseInt(rgbaMatch[3], 10),
      a: rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1,
    };
  }

  return null;
}

/** @deprecated v99: use interpolateOklch from colorMath.ts */
function _formatColorHex(c: _RGBA): string {
  if (c.a >= 1) {
    return `#${Math.round(c.r).toString(16).padStart(2, "0")}${Math.round(c.g).toString(16).padStart(2, "0")}${Math.round(c.b).toString(16).padStart(2, "0")}`;
  }
  return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${c.a.toFixed(3)})`;
}

/** @deprecated v99: use interpolateOklch from colorMath.ts */
export function interpolateColorHex(from: string, to: string, t: number): string {
  const a = _parseColorHex(from);
  const b = _parseColorHex(to);
  if (!a || !b) return t < 0.5 ? from : to;
  return _formatColorHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
    a: a.a + (b.a - a.a) * t,
  });
}
