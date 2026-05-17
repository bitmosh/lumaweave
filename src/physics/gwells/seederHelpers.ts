/**
 * GWells — Shared Seeder Helpers
 *
 * Utility functions used by multiple seeders.
 */

import type Graph from "graphology";

/**
 * Computes the axis offset for N spines.
 *
 * Used by Radial-Backbone (as the inner-end distance from hub for each spoke)
 * and by Parallel-Spines (as the radius of the ring of spines around the
 * central y-axis).
 *
 * Formula: baseOffset × max(1, N/2).
 *
 * | N | Multiplier | Example with baseOffset=1000 |
 * |---|---|---|
 * | 2 | 1.0   | 1000 |
 * | 3 | 1.5   | 1500 |
 * | 4 | 2.0   | 2000 |
 * | 5 | 2.5   | 2500 |
 * | 6 | 3.0   | 3000 |
 * | 8 | 4.0   | 4000 |
 */
export function axisOffsetForN(baseOffset: number, N: number): number {
  return baseOffset * Math.max(1, N / 2);
}

/**
 * Resolves the per-well-type twist value from a helix twist record.
 *
 * Returns the specific well-type's twist if set, else falls back to `all`,
 * else 0.
 */
export function resolveHelixTwist(
  record: { all?: number; spine?: number; directory?: number; file?: number } | undefined,
  wellType: "spine" | "directory" | "file",
): number {
  if (!record) return 0;
  const specific = record[wellType];
  if (typeof specific === "number") return specific;
  if (typeof record.all === "number") return record.all;
  return 0;
}

/**
 * Build parent-child maps from contains edges.
 * Returns:
 * - parentToChildren: Map<parentId, Set<childId>>
 * - rootSpineIds: Array of spine node IDs with no parent
 */
export function buildContainsMap(graph: Graph): {
  parentToChildren: Map<string, Set<string>>;
  rootSpineIds: string[];
} {
  const parentToChildren = new Map<string, Set<string>>();
  const childToParent = new Map<string, string>();
  const rootSpineIds: string[] = [];

  graph.forEachNode((nodeId) => {
    const attrs = graph.getNodeAttributes(nodeId);
    const nodeType = attrs.nodeType || attrs.raw?.type;

    // Initialize empty set for all spine nodes
    if (nodeType === "spine") {
      parentToChildren.set(nodeId, new Set());
    }
  });

  graph.forEachEdge((edgeId, attrs) => {
    const edgeType = attrs.relationship || attrs.raw?.type;
    if (edgeType === "contains") {
      const source = graph.source(edgeId);
      const target = graph.target(edgeId);
      const sourceAttrs = graph.getNodeAttributes(source);
      const sourceType = sourceAttrs.nodeType || sourceAttrs.raw?.type;

      // Track contains where source is a spine or directory
      if (sourceType === "spine" || sourceType === "directory") {
        if (!parentToChildren.has(source)) {
          parentToChildren.set(source, new Set());
        }
        parentToChildren.get(source)!.add(target);
        childToParent.set(target, source);
      }
    }
  });

  // Find roots: spine nodes with no parent
  parentToChildren.forEach((_, spineId) => {
    if (!childToParent.has(spineId)) {
      rootSpineIds.push(spineId);
    }
  });

  return { parentToChildren, rootSpineIds };
}

/**
 * DFS-flatten spine nodes from a root into stable iteration order.
 * Returns array of spine IDs in DFS order, sorted alphabetically at each level.
 */
export function flattenSpinesFromRoot(
  rootId: string,
  parentToChildren: Map<string, Set<string>>,
  graph: Graph,
): string[] {
  const result: string[] = [rootId];

  const children = parentToChildren.get(rootId);
  if (children) {
    const sortedChildren = Array.from(children).sort();
    for (const childId of sortedChildren) {
      const childAttrs = graph.getNodeAttributes(childId);
      const childType = childAttrs.nodeType || childAttrs.raw?.type;
      if (childType === "spine") {
        result.push(...flattenSpinesFromRoot(childId, parentToChildren, graph));
      }
    }
  }

  return result;
}

/**
 * Group spine roots into N spines per spineCount, in alphabetical order.
 * Returns: spineCount-length array of root-id arrays
 */
export function assignSpinesToAxes(
  rootSpineIds: string[],
  spineCount: number,
): string[][] {
  const axes: string[][] = Array.from({ length: spineCount }, () => []);

  // Round-robin assign roots to axes in reverse order
  // so that alphabetical "docs" goes to the last axis (e.g., 180° for horizontal-linear)
  // and "src" goes to the first axis (e.g., 0° for horizontal-linear)
  const sortedRoots = rootSpineIds.sort();
  sortedRoots.forEach((rootId, index) => {
    const axisIndex = (sortedRoots.length - 1 - index) % spineCount;
    axes[axisIndex].push(rootId);
  });

  return axes;
}

/**
 * Computes a dynamic orbit radius for a directory's file orbit.
 *
 * Files need more orbit radius when there are many of them (to spread out
 * and not overlap). Few files need tight orbits to avoid wasting space.
 *
 * Formula: clamp(baseRadius × sqrt(fileCount / 6), MIN, MAX)
 *
 * - 1-2 files:  hits the MIN_RADIUS (tight cluster)
 * - 6 files:    returns baseRadius (the reference point)
 * - 24 files:   returns 2× baseRadius
 * - 96+ files:  hits MAX_RADIUS (wide orbit, no overlap)
 *
 * Square-root scaling ensures the orbit area grows linearly with file count,
 * so each file gets roughly the same angular share regardless of total count.
 *
 * Pass C8 amendment.
 */
export function computeOrbitRadius(
  fileCount: number,
  baseRadius: number,
): number {
  const MIN_RADIUS = 300;
  const MAX_RADIUS = 1500;
  const REFERENCE_COUNT = 6;

  if (fileCount <= 0) return MIN_RADIUS;

  const scaled = baseRadius * Math.sqrt(fileCount / REFERENCE_COUNT);
  return Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, scaled));
}
