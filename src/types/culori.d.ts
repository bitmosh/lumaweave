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
}
