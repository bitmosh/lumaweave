/**
 * Minimal ambient type declarations for culori 4.0.2.
 *
 * culori ships as pure JavaScript with no bundled TypeScript types.
 * This file declares only the subset of the culori API used by colorMath.ts.
 * If culori usage expands, add declarations here rather than installing @types/culori.
 */

declare module "culori" {
  export interface Oklch {
    mode: "oklch";
    l: number;
    c: number;
    h: number;
    alpha?: number;
  }

  export interface Rgb {
    mode: "rgb";
    r: number;
    g: number;
    b: number;
    alpha?: number;
  }

  export type Color =
    | Oklch
    | Rgb
    | { mode: string; [key: string]: number | string | undefined };

  /** Convert any CSS color string to OKLCH. Returns undefined if unparseable. */
  export function oklch(color: string | Color): Oklch | undefined;
  export function oklch(color: null | undefined): undefined;

  /** Convert any CSS color string or Color object to a hex string (#rrggbb). */
  export function formatHex(color: string | Color): string;

  /**
   * Create an interpolator function between two or more colors in the given
   * color space. Returns a function that takes t in [0, 1] and returns a Color.
   */
  export function interpolate(
    colors: (string | Color)[],
    mode?: string,
    options?: Record<string, unknown>,
  ): (t: number) => Color;

  /**
   * WCAG 2.1 relative luminance of a CSS color string or Color object.
   * Returns a value in [0, 1]. Returns NaN for unparseable input.
   */
  export function wcagLuminance(color: string | Color): number;

  /**
   * WCAG 2.1 contrast ratio between two colors.
   * Returns (L1+0.05)/(L2+0.05) where L1 is the lighter luminance.
   * Returns NaN if either color is unparseable.
   */
  export function wcagContrast(a: string | Color, b: string | Color): number;
}
