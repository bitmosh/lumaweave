// SPDX-License-Identifier: Apache-2.0
/**
 * Palette Generation
 *
 * Generates a TokenPrimitives object from a single hex hue anchor.
 * HSL-based in v88a. v93 swaps for OKLCH via culori (same signature).
 * Color family naming mirrors built-in themes for drop-in compatibility.
 */

import type { TokenPrimitives } from "./tokenPrimitives";

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ln - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function generatePaletteFromHue(hueAnchor: string): TokenPrimitives {
  if (!/^#[0-9a-f]{6}$/i.test(hueAnchor)) {
    throw new Error(`Invalid hex hue anchor: ${hueAnchor}`);
  }

  const { h, s, l } = hexToHSL(hueAnchor);
  const compH = (h + 180) % 360;
  const triH = (h + 120) % 360;

  // Map generated palette onto actual TokenPrimitives color families
  return {
    color: {
      // void: dark neutrals derived from hue (desaturated)
      void: {
        900: hslToHex(h, Math.min(s * 0.2, 10), Math.max(4, l * 0.1)),
        800: hslToHex(h, Math.min(s * 0.2, 12), Math.max(8, l * 0.15)),
        700: hslToHex(h, Math.min(s * 0.3, 16), Math.max(14, l * 0.22)),
        600: hslToHex(h, Math.min(s * 0.3, 18), Math.max(18, l * 0.28)),
      },
      // gold: the primary hue anchor tints
      gold: {
        500: hueAnchor,
        400: hslToHex(h, Math.min(s, 85), Math.min(88, l + 22)),
      },
      // flare: slightly shifted version of anchor
      flare: { 500: hslToHex((h + 20) % 360, s, l) },
      // magenta: triadic
      magenta: { 500: hslToHex(triH, s, l) },
      // fuchsia: between anchor and triadic
      fuchsia: { 500: hslToHex((h + 60) % 360, s, l) },
      // purple: shifted toward cool
      purple: { 500: hslToHex((h + 40) % 360, s, Math.max(30, l - 10)) },
      // corona: complementary accent
      corona: {
        500: hslToHex(compH, s, l),
        400: hslToHex(compH, s, Math.min(85, l + 15)),
      },
      // cream: near-white tints of the anchor
      cream: {
        100: hslToHex(h, Math.min(s * 0.3, 20), Math.min(96, l + 40)),
        200: hslToHex(h, Math.min(s * 0.4, 30), Math.min(90, l + 30)),
      },
      green: { 500: "#00ff88" },
      red: { 500: "#ff4757" },
    },
    space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 8: 48, 12: 96 },
    radius: { sm: 4, md: 8, lg: 12, full: 9999 },
    shadow: { sm: "0 1px 2px rgba(0,0,0,.4)", lg: "0 25px 50px -12px rgba(0,0,0,.5)" },
    duration: { fast: 150, base: 220, slow: 380 },
    easing: { standard: "cubic-bezier(.4,0,.2,1)", out: "cubic-bezier(0,0,.2,1)" },
  };
}

if (
  typeof window !== "undefined" &&
  (import.meta.env.DEV || (window as any).PLAYWRIGHT)
) {
  (window as any).__lwPaletteGeneration = { generatePaletteFromHue };
}
