// SPDX-License-Identifier: Apache-2.0
/**
 * Cluster-color resolution layer (v103).
 *
 * Implements the D1-D4 design decisions locked in v103.0.0:
 *   D1: three modes — semantic (default) / mono-shades / custom
 *   D2: semantic mode uses absolute cluster-colors.json hex (theme-independent)
 *   D3: no-cluster / unknown cluster → null (caller applies theme fallback)
 *   D4: mode lives at settings.graph.clusterColorMode (deferred to .0.2)
 *
 * The resolver is PURE and theme-independent — it returns a hex string or null.
 * It never imports theme tokens; the caller decides the fallback (ownership contract).
 *
 * Source: docs/_meta/cluster-colors.json
 * Import works via Vite's native JSON transform + vite.config.ts server.fs.allow:[".."].
 */

import clusterColorsJson from "../../docs/_meta/cluster-colors.json" with { type: "json" };

// ─── Types ──────────────────────────────────────────────────────────────────

export type ClusterColorMode =
  | { kind: "semantic" }
  | { kind: "mono-shades"; baseHue: string; steps: number }  // v103.0.5
  | { kind: "custom"; map: Record<string, string> };          // v103.0.5

export interface ClusterColorEntry {
  hex: string;
  domain: string;
  description: string;
}

// ─── loadClusterColors ──────────────────────────────────────────────────────

/**
 * Returns the full cluster color palette from cluster-colors.json.
 * Keys are color names (gold, azure, violet, …) matching the `cluster:` frontmatter value.
 *
 * Returns {} if the JSON is unloadable — defensive, never throws at import time.
 */
export function loadClusterColors(): Record<string, ClusterColorEntry> {
  try {
    const palette = clusterColorsJson.palette as Record<string, ClusterColorEntry>;
    if (!palette || typeof palette !== "object") return {};
    return palette;
  } catch {
    return {};
  }
}

// ─── resolveClusterColor ────────────────────────────────────────────────────

/**
 * Resolves the display color for a node's cluster value.
 *
 * @param cluster - The node's `cluster` attribute (a color-name like "azure", "gold").
 *                  These are color-name keys, NOT domain names.
 * @param mode    - The color mode (semantic only implemented; others return null).
 * @param palette - The loaded cluster palette from loadClusterColors().
 * @returns Hex color string, or null if cluster is unknown/undefined.
 *          null means the CALLER applies the theme default (D3 — ownership contract).
 */
export function resolveClusterColor(
  cluster: string | undefined,
  mode: ClusterColorMode,
  palette: Record<string, ClusterColorEntry>,
): string | null {
  if (mode.kind === "mono-shades" || mode.kind === "custom") {
    // Not implemented until v103.0.5
    return null;
  }

  // semantic mode: direct lookup by color-name key
  if (!cluster) return null;
  const entry = palette[cluster];
  return entry?.hex ?? null;
}

// ─── Dev / Playwright probe ──────────────────────────────────────────────────

if (typeof window !== "undefined" && (import.meta.env.DEV || (window as any).PLAYWRIGHT)) {
  (window as any).__lwClusterColor = { loadClusterColors, resolveClusterColor };
}
