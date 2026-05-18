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
 * Group spine roots into N spines per spineCount, bucketed by first path segment.
 * Returns: spineCount-length array of root-id arrays
 * 
 * Pass C8.4: replaces alphabetical round-robin with category bucketing so
 * src and docs spines don't interleave across axes.
 */
export function assignSpinesToAxes(
  rootSpineIds: string[],
  spineCount: number,
): string[][] {
  const axes: string[][] = Array.from({ length: spineCount }, () => []);

  // Bucket spines by first path segment. For spine.src.* and spine.src-root,
  // the bucket key is "src". For spine.docs.* and spine.docs-root, the bucket
  // key is "docs". For other patterns (future source adapters), use whatever
  // string follows "spine." up to the first dot or hyphen.
  
  function bucketKey(spineId: string): string {
    // Strip "spine." prefix, then split on "." or "-" to get first segment
    const stripped = spineId.replace(/^spine\./, "");
    // For "src-root" or "docs-root", treat as same bucket as "src" or "docs"
    const firstSeg = stripped.split(/[.-]/)[0];
    return firstSeg;
  }
  
  // Group spines by bucket key
  const buckets = new Map<string, string[]>();
  for (const spineId of rootSpineIds) {
    const key = bucketKey(spineId);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(spineId);
  }
  
  // Sort each bucket alphabetically for deterministic order within axis
  for (const [, list] of buckets) {
    list.sort();
  }
  
  // Pass C8.4: move root-spines (spine.src-root, spine.docs-root) to the end
  // of their bucket so they get the outermost position on their axis.
  const rootSpineSuffix = "-root";
  for (const [, list] of buckets) {
    const rootSpines = list.filter(id => id.endsWith(rootSpineSuffix));
    const nonRootSpines = list.filter(id => !id.endsWith(rootSpineSuffix));
    list.length = 0;
    list.push(...nonRootSpines, ...rootSpines);
  }
  
  // Assign buckets to axes in deterministic order.
  // First sort bucket keys alphabetically so axis assignment is reproducible.
  const sortedKeys = Array.from(buckets.keys()).sort();
  sortedKeys.forEach((key, bucketIndex) => {
    const axisIndex = bucketIndex % spineCount;
    axes[axisIndex].push(...buckets.get(key)!);
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
  const MIN_RADIUS = 120;
  const MAX_RADIUS = 480;
  const REFERENCE_COUNT = 6;

  if (fileCount <= 0) return MIN_RADIUS;

  const scaled = baseRadius * Math.sqrt(fileCount / REFERENCE_COUNT);
  return Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, scaled));
}

/**
 * Maps raw content size (line count or byte count) to a visual node size.
 * 
 * Uses logarithmic scaling because raw sizes span 4+ orders of magnitude
 * (1 line to 10000+ lines), and linear mapping would crush most files
 * into the minimum visual size while outliers dominate.
 * 
 * Formula: clamp(MIN + (MAX - MIN) * log(1 + size) / log(1 + SCALE_REF), MIN, MAX)
 * 
 * - size = 0 returns MIN
 * - size = SCALE_REF returns MAX
 * - sizes between scale log-linearly
 * 
 * Defaults give:
 *   size=1   -> 4.5
 *   size=10  -> 10.4
 *   size=100 -> 19.0
 *   size=1000 -> 30.0
 *   size=11000 (max in our data) -> 40
 */
export function computeNodeSize(rawSize: number): number {
  const MIN = 48;
  const MAX = 360;
  const SCALE_REF = 6000;
  
  if (rawSize <= 0) return MIN;
  
  const scaled = MIN + (MAX - MIN) * Math.log(1 + rawSize) / Math.log(1 + SCALE_REF);
  return Math.max(MIN, Math.min(MAX, scaled));
}

/**
 * Phyllotaxis spiral file placement.
 * 
 * Returns the radial distance from parent and the angular position for
 * a file, given:
 * - fileIndex: position in size-sorted file list (0 = smallest, N-1 = largest)
 * - fileCount: total files in this directory
 * - parentVisualSize: the directory parent's visual size (orbits scale up
 *   for larger parents so files don't crowd them)
 * 
 * Uses φ-angle (137.508°) between successive files for natural non-overlap.
 * Radial position scales log-linearly with index (smallest closest, largest
 * farthest) within [MIN, MAX] envelope.
 * 
 * The MIN clamp keeps even the smallest file visibly separated from the parent.
 * The MAX clamp prevents the largest files from drifting absurdly far.
 */
export function computeFileOrbit(
  fileIndex: number,
  fileCount: number,
  parentVisualSize: number,
): { radius: number; angleRad: number } {
  // φ angle in radians: 137.508° = (3 - √5) * π
  const PHYLLOTAXIS_ANGLE = (3 - Math.sqrt(5)) * Math.PI;
  
  // Envelope. Scales modestly with parent size — bigger parents push files farther.
  const MIN_ORBIT = 30 + parentVisualSize * 1;
  const MAX_ORBIT = 120 + parentVisualSize * 3;
  
  // Radial position: index 0 -> MIN, index N-1 -> MAX
  // Linear in index. Could be log-linear if we wanted heavier weighting near MIN.
  const t = fileCount <= 1 ? 0 : fileIndex / (fileCount - 1);
  const radius = MIN_ORBIT + (MAX_ORBIT - MIN_ORBIT) * t;
  
  // Angular position: φ-angle accumulation
  const angleRad = fileIndex * PHYLLOTAXIS_ANGLE;
  
  return { radius, angleRad };
}

/**
 * Computes the aggregated content size of a node by recursively summing
 * the raw sizes of all descendants (via contains-edges).
 * 
 * Used to derive directory and spine visual sizes: a directory containing
 * many large files visually larger than a directory with few small files.
 * 
 * Returns 0 if node has no descendants.
 */
export function computeAggregateSize(
  graph: Graph,
  nodeId: string,
): number {
  let total = 0;
  const visited = new Set<string>();
  
  function visit(id: string): void {
    if (visited.has(id)) return;
    visited.add(id);
    
    graph.forEachOutEdge(id, (_eid, attrs, _src, tgt) => {
      const type = attrs.relationship || attrs.raw?.type;
      if (type !== "contains") return;
      
      const childAttrs = graph.getNodeAttributes(tgt);
      const childType = childAttrs.nodeType || childAttrs.raw?.type;
      
      if (childType === "doc" || childType === "code" || childType === "config" || childType === "fixture") {
        // Leaf — add its raw size from rawSize attribute
        const rawSize = (childAttrs as any).rawSize ?? 0;
        total += rawSize;
      } else if (childType === "directory" || childType === "spine") {
        // Recursive
        visit(tgt);
      }
    });
  }
  
  visit(nodeId);
  return total;
}



