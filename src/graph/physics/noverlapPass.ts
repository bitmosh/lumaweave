/**
 * Noverlap Anti-Collision Pass
 *
 * One-shot anti-collision layout pass to spread overlapping nodes apart.
 * Intended to run AFTER FA2 has converged to polish the layout.
 */

import type Graph from "graphology";
import noverlap from "graphology-layout-noverlap";

/**
 * Configuration tunables for the noverlap pass.
 */
export const NOVERLAP_CONFIG = {
  /** Maximum number of iterations to run */
  maxIterations: 50,
  /** Padding multiplier on node size (1.0 = no extra space) */
  margin: 5,
  /** Maximum distance a single node can be moved per iteration */
  ratio: 1.0,
  /** Speed at which nodes spread (lower = slower, less aggressive) */
  speed: 3,
} as const;

/**
 * Run a one-shot noverlap pass to anti-collide overlapping nodes.
 *
 * IMPORTANT: This is intended to run AFTER FA2 has converged.
 * Spines are pinned via Sigma's nodeReducer (display-only override),
 * so noverlap may move spine graphology attributes — but the reducer
 * snaps display back to seeded positions every frame, so this is OK.
 *
 * To preserve seeded spine positions in the graphology data layer
 * (for any code that reads attributes directly), we save and restore
 * spine positions around the noverlap call.
 */
export function applyNoverlap(graph: Graph): void {
  // Save spine positions before noverlap
  const spinePositions = new Map<string, { x: number; y: number }>();
  graph.forEachNode((id, attrs) => {
    const isSpine = (attrs.nodeType === "spine") || (attrs.raw?.type === "spine");
    if (isSpine) {
      spinePositions.set(id, { x: attrs.x as number, y: attrs.y as number });
    }
  });

  // Run noverlap
  noverlap.assign(graph, {
    maxIterations: NOVERLAP_CONFIG.maxIterations,
    settings: {
      margin: NOVERLAP_CONFIG.margin,
      ratio: NOVERLAP_CONFIG.ratio,
      speed: NOVERLAP_CONFIG.speed,
    },
  });

  // Restore spine positions
  spinePositions.forEach((pos, spineId) => {
    if (graph.hasNode(spineId)) {
      graph.setNodeAttribute(spineId, "x", pos.x);
      graph.setNodeAttribute(spineId, "y", pos.y);
    }
  });

  console.log("[noverlapPass] applied; restored", spinePositions.size, "spine positions");
}
