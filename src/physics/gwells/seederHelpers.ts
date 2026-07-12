// SPDX-License-Identifier: Apache-2.0
/**
 * GWells — Shared Seeder Helpers
 *
 * Utility functions used by multiple seeders.
 */

import type Graph from "graphology";
import { analyzeGraphStructure, type GWStructuralNodeInfo } from "./structuralResolver";

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

const HUB_RING_THRESHOLD = 4;

export function shouldUseHubRing(topLevelCount: number, spineCount: number): boolean {
  return topLevelCount >= HUB_RING_THRESHOLD || spineCount >= HUB_RING_THRESHOLD;
}

export function computeHubRingRadius(count: number, baseSpacing: number): number {
  if (count <= 1) return 0;
  const safeSpacing = Math.max(1, baseSpacing);
  return Math.max(safeSpacing, (safeSpacing * count) / Math.PI);
}

export function computeHubRingPosition(
  index: number,
  count: number,
  radius: number,
): { x: number; y: number; z: number } {
  if (count <= 1 || radius === 0) return { x: 0, y: 0, z: 0 };
  const angle = (index / count) * Math.PI * 2;
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
    z: 0,
  };
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
 * Maps raw content size (line count or byte count) to a visual node RADIUS.
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
 * L-019 — THE UNITS, which is the whole point:
 *
 * Sigma is configured with `itemSizesReference: "positions"`, so a node's `size` is a **radius in
 * graph units** — the same units as x/y — not in pixels. The value returned here is therefore
 * directly comparable to the seeders' spacing constants, and it has to be read that way.
 *
 * It was not. MIN/MAX were 48/360, giving a median radius of ~219 against a `directoryOffset` of
 * **220**: a node's radius equalled the entire distance to its parent, so its DIAMETER was twice
 * the spacing. Every node overlapped its neighbours by construction, at every zoom level, no
 * matter how correct the seed positions were. (The docblock above this function still described
 * an output range of 4.5–40 — the constants had been inflated ~9x and the doc left behind, which
 * is how a node radius and a node gap ended up as the same number without anyone noticing.)
 *
 * The constants below are the old ones scaled by 1/4, which preserves the log curve and the
 * dynamic range (max/min stays 7.5) and simply moves the whole scale into a sane relationship
 * with the spacing:
 *
 *   median radius ~55 vs directoryOffset 220  ->  two adjacent nodes need 110 of the 220 available
 *   largest radius  90 vs directoryOffset 220  ->  even two maximal nodes clear each other
 *
 * If you change these, change them against the spacing constants in the seeders, not by eye.
 * A node radius is only meaningful relative to the distance to the next node.
 */
export const NODE_RADIUS_MIN = 12;
export const NODE_RADIUS_MAX = 90;

export function computeNodeSize(rawSize: number): number {
  const SCALE_REF = 6000;

  if (rawSize <= 0) return NODE_RADIUS_MIN;

  const scaled =
    NODE_RADIUS_MIN +
    (NODE_RADIUS_MAX - NODE_RADIUS_MIN) * Math.log(1 + rawSize) / Math.log(1 + SCALE_REF);
  return Math.max(NODE_RADIUS_MIN, Math.min(NODE_RADIUS_MAX, scaled));
}

/**
 * L-001: the narrowest wedge a subtree may be given. Without a floor, a subtree with one leaf
 * sitting beside one with hundreds gets an arc so thin its own descendants re-collapse onto a
 * line — trading one pile-up for another.
 */
export const MIN_FAN_ARC_RAD = (12 * Math.PI) / 180;

/**
 * L-001: leaf count of a directory subtree.
 *
 * WEIGHTS a subtree's angular budget, so a directory holding 200 files gets proportionally more
 * arc than one holding 2. Memoized — the tree is re-entered constantly during placement.
 *
 * `isDirectory` is injected because the two seeders resolve node type from slightly different
 * attribute shapes.
 */
export function makeLeafCounter(
  parentToChildren: Map<string, Set<string>>,
  isDirectory: (id: string) => boolean,
): (dirId: string) => number {
  const cache = new Map<string, number>();
  function countLeaves(dirId: string): number {
    const cached = cache.get(dirId);
    if (cached !== undefined) return cached;
    const children = parentToChildren.get(dirId);
    if (!children || children.size === 0) {
      cache.set(dirId, 1);
      return 1;
    }
    let total = 0;
    for (const cid of children) {
      total += isDirectory(cid) ? countLeaves(cid) : 1;
    }
    const n = Math.max(1, total);
    cache.set(dirId, n);
    return n;
  }
  return countLeaves;
}

/**
 * L-001: split an angular wedge among children, weighted by leaf count. THE fix for the pile-up.
 *
 * Previously every sibling was handed the SAME direction vector — no per-sibling term existed
 * anywhere — so siblings computed byte-identical coordinates. The physics could never recover:
 * for two coincident nodes the repulsion DIRECTION is the zero vector, so the applied force is
 * exactly zero no matter how large its magnitude. A perfect stack was a stable fixed point.
 *
 * Because the sub-wedges TILE the parent's wedge without overlapping, siblings own disjoint
 * angular ranges — overlap becomes impossible by construction rather than something the
 * simulation has to win.
 *
 * Deterministic: no randomness; ordering comes from the caller's already-sorted array.
 */
export function subdivideWedge(
  childIds: string[],
  centerAngle: number,
  angularExtent: number,
  countLeaves: (id: string) => number,
  /**
   * Floor on each child's arc. Defaults to MIN_FAN_ARC_RAD, which keeps a one-leaf subtree from
   * being squeezed to nothing beside a hundred-leaf one.
   *
   * Pass 0 when the wedge being divided must be TILED EXACTLY — above all when subdividing the
   * full circle among roots. The floor is a deliberate over-allocation: it hands a child more arc
   * than its weight earned, so the children's extents can sum to more than the parent's. Inside a
   * parent's wedge that is harmless slack. Across the whole circle it is not: 41 roots each
   * floored to 12 degrees claim 492 degrees of a 360 degree circle, and the sectors overlap again
   * — which is precisely the bug this parameter exists to avoid re-introducing.
   */
  minArc: number = MIN_FAN_ARC_RAD,
): Array<{ id: string; centerAngle: number; angularExtent: number }> {
  const weights = childIds.map((id) => countLeaves(id));
  const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
  let cursor = centerAngle - angularExtent / 2;
  return childIds.map((id, i) => {
    const share = (weights[i] / totalWeight) * angularExtent;
    const mid = cursor + share / 2;
    cursor += share;
    return {
      id,
      centerAngle: mid,
      angularExtent: Math.max(share, minArc),
    };
  });
}

/**
 * Phyllotaxis spiral file placement.
 *
 * Returns the radial distance from parent and the angular position for
 * a file, given:
 * - fileIndex: position in size-sorted file list (0 = smallest, N-1 = largest)
 * - fileCount: total files in this directory
 * - parentVisualSize: the directory parent's radius, so orbits scale up for larger parents and
 *   files clear the parent's disc instead of landing inside it. Callers must pass **`baseSize`**,
 *   NOT `size`. `size` is `baseSize x settings.nodeSize`, and it is further rewritten on hover and
 *   selection by graphStylePolicy — so feeding it in here made the node-size slider silently
 *   change the LAYOUT on the next reseed, and made file orbits depend on what happened to be
 *   selected. `baseSize` is the structural radius and the only one geometry may read.
 *
 * Uses φ-angle (137.508°) between successive files for natural non-overlap.
 * Radial position scales log-linearly with index (smallest closest, largest
 * farthest) within [MIN, MAX] envelope.
 *
 * The MIN clamp keeps even the smallest file visibly separated from the parent.
 * The MAX clamp prevents the largest files from drifting absurdly far.
 *
 * NOTE: the returned angleRad is RELATIVE to the parent — callers must add their own
 * frame's base angle. (L-005: one caller shadowed the variable and added the base angle
 * to itself, discarding the orbit angle entirely and stacking every file on one ray.)
 */
export function computeFileOrbit(
  fileIndex: number,
  fileCount: number,
  parentVisualSize: number,
): { radius: number; angleRad: number } {
  // φ angle in radians: 137.508° = (3 - √5) * π
  const PHYLLOTAXIS_ANGLE = (3 - Math.sqrt(5)) * Math.PI;

  // Envelope. Scales with parent size — bigger parents push files farther out.
  //
  // L-019: the inner bound is a CLEARANCE, so it is derived from the radii rather than from a
  // magic number. A file orbiting its parent must clear the parent's disc (parentVisualSize) plus
  // its own radius — and a file can be as large as NODE_RADIUS_MAX, so that is what has to fit.
  //
  // It used to read `30 + parentVisualSize`, i.e. a flat 30 units of clearance. That was tuned
  // when node radii were 48–360 and 30 was a rounding error against them; once the scale was
  // corrected it became the binding constraint, and a file with a 90-unit radius sitting 30 units
  // off its parent's edge lands *inside* the parent. The constants and the radii have to move
  // together — which is the same lesson as the size/spacing coupling above.
  const MIN_ORBIT = parentVisualSize + NODE_RADIUS_MAX + 20;
  const MAX_ORBIT = MIN_ORBIT + parentVisualSize * 2 + 90;
  
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

export interface GWSeedPosition {
  x: number;
  y: number;
  z: number;
}

export interface GWFallbackSeedResult {
  seededPositions: Map<string, GWSeedPosition>;
  spinePositions: Map<string, { x: number; y: number }>;
}

const FALLBACK_COMPONENT_SPACING = 1200;
const FALLBACK_CONTAINER_RADIUS = 360;
const FALLBACK_LEAF_RADIUS = 180;
const FALLBACK_ORPHAN_RADIUS = 900;
const FALLBACK_GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function isFiniteSeedPosition(pos: { x: number; y: number; z?: number } | undefined): boolean {
  return !!pos && Number.isFinite(pos.x) && Number.isFinite(pos.y);
}

function writeSeedPosition(
  graph: Graph,
  nodeId: string,
  pos: GWSeedPosition,
  seededPositions: Map<string, GWSeedPosition>,
  spinePositions: Map<string, { x: number; y: number }>,
  info: GWStructuralNodeInfo | undefined,
): void {
  if (!Number.isFinite(pos.x) || !Number.isFinite(pos.y) || !Number.isFinite(pos.z)) return;

  graph.setNodeAttribute(nodeId, "x", pos.x);
  graph.setNodeAttribute(nodeId, "y", pos.y);
  graph.setNodeAttribute(nodeId, "z", pos.z);
  seededPositions.set(nodeId, pos);

  if (info?.explicitKind === "spine" || info?.role === "spine") {
    spinePositions.set(nodeId, { x: pos.x, y: pos.y });
  }
}

function componentCenter(index: number, count: number): GWSeedPosition {
  if (count <= 1) return { x: 0, y: 0, z: 0 };

  const radius = Math.max(
    FALLBACK_COMPONENT_SPACING,
    (FALLBACK_COMPONENT_SPACING * count) / Math.PI,
  );
  const angle = (index / count) * Math.PI * 2;

  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
    z: 0,
  };
}

function chooseFallbackAnchor(
  component: string[],
  nodes: Map<string, GWStructuralNodeInfo>,
): string {
  const byRole = (role: GWStructuralNodeInfo["role"]): string | undefined =>
    component.find((nodeId) => nodes.get(nodeId)?.role === role);

  const explicitSpine = component.find((nodeId) => nodes.get(nodeId)?.explicitKind === "spine");
  if (explicitSpine) return explicitSpine;

  return (
    byRole("spine") ??
    byRole("root") ??
    byRole("hub") ??
    byRole("bridge") ??
    component
      .slice()
      .sort((a, b) => {
        const da = nodes.get(a)?.totalDegree ?? 0;
        const db = nodes.get(b)?.totalDegree ?? 0;
        return db - da || a.localeCompare(b);
      })[0]
  );
}

function averageSeededComponentPosition(
  component: string[],
  seededPositions: Map<string, GWSeedPosition>,
): GWSeedPosition | null {
  let x = 0;
  let y = 0;
  let z = 0;
  let count = 0;

  for (const nodeId of component) {
    const pos = seededPositions.get(nodeId);
    if (!pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.y) || !Number.isFinite(pos.z)) {
      continue;
    }

    x += pos.x;
    y += pos.y;
    z += pos.z;
    count += 1;
  }

  if (count === 0) return null;
  return { x: x / count, y: y / count, z: z / count };
}

function offsetAround(
  center: GWSeedPosition,
  index: number,
  count: number,
  radius: number,
): GWSeedPosition {
  const angle = count <= 1 ? 0 : index * FALLBACK_GOLDEN_ANGLE;
  const scaledRadius = count <= 1
    ? radius
    : radius * Math.sqrt((index + 1) / Math.max(count, 1));

  return {
    x: center.x + scaledRadius * Math.cos(angle),
    y: center.y + scaledRadius * Math.sin(angle),
    z: center.z,
  };
}

function fallbackRadiusForRole(role: GWStructuralNodeInfo["role"] | undefined): number {
  if (role === "root" || role === "container" || role === "hub" || role === "bridge") {
    return FALLBACK_CONTAINER_RADIUS;
  }
  if (role === "leaf" || role === "orphan") return FALLBACK_LEAF_RADIUS;
  return 260;
}

export function placeUnseededNodesWithFallback(
  graph: Graph,
  seededPositions: Map<string, GWSeedPosition>,
  spinePositions: Map<string, { x: number; y: number }>,
): void {
  const structure = analyzeGraphStructure(graph);
  const targetIds = Array.from(structure.nodes.keys())
    .filter((nodeId) => !isFiniteSeedPosition(seededPositions.get(nodeId)))
    .sort();

  if (targetIds.length === 0) return;

  const targetSet = new Set(targetIds);
  const orphanTargets = targetIds.filter((nodeId) => {
    const info = structure.nodes.get(nodeId);
    return info?.role === "orphan" || info?.totalDegree === 0;
  });
  const orphanTargetSet = new Set(orphanTargets);
  const nonOrphanTargets = targetIds.filter((nodeId) => !orphanTargetSet.has(nodeId));

  const nonOrphanComponents = structure.components
    .map((component, index) => ({ component, index }))
    .filter(({ component }) =>
      component.some((nodeId) => targetSet.has(nodeId) && !orphanTargetSet.has(nodeId))
    );

  nonOrphanComponents.forEach(({ component }, componentPlacementIndex) => {
    const anchorId = chooseFallbackAnchor(component, structure.nodes);
    const anchorInfo = structure.nodes.get(anchorId);
    const center =
      seededPositions.get(anchorId) ??
      averageSeededComponentPosition(component, seededPositions) ??
      componentCenter(componentPlacementIndex, nonOrphanComponents.length);

    if (targetSet.has(anchorId) && !orphanTargetSet.has(anchorId)) {
      writeSeedPosition(graph, anchorId, center, seededPositions, spinePositions, anchorInfo);
    }

    const componentTargets = nonOrphanTargets
      .filter((nodeId) => component.includes(nodeId) && nodeId !== anchorId)
      .sort();
    const groupedByBase = new Map<string, string[]>();

    for (const nodeId of componentTargets) {
      const info = structure.nodes.get(nodeId);
      const baseId =
        info?.parentId && isFiniteSeedPosition(seededPositions.get(info.parentId))
          ? info.parentId
          : anchorId;

      const group = groupedByBase.get(baseId) ?? [];
      group.push(nodeId);
      groupedByBase.set(baseId, group);
    }

    Array.from(groupedByBase.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([baseId, group]) => {
        const basePos = seededPositions.get(baseId) ?? center;
        group.sort().forEach((nodeId, nodeIndex) => {
          const info = structure.nodes.get(nodeId);
          const radius = fallbackRadiusForRole(info?.role);
          const pos = offsetAround(basePos, nodeIndex, group.length, radius);
          writeSeedPosition(graph, nodeId, pos, seededPositions, spinePositions, info);
        });
      });
  });

  if (orphanTargets.length > 0) {
    const seededValues = Array.from(seededPositions.values());
    const maxSeedDistance = seededValues.reduce((max, pos) => {
      const distance = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
      return Math.max(max, distance);
    }, 0);
    const radius = Math.max(FALLBACK_ORPHAN_RADIUS, maxSeedDistance + FALLBACK_ORPHAN_RADIUS);

    orphanTargets.sort().forEach((nodeId, index) => {
      const info = structure.nodes.get(nodeId);
      const angle = orphanTargets.length === 1 ? 0 : index * FALLBACK_GOLDEN_ANGLE;
      const pos = orphanTargets.length === 1 && seededPositions.size === 0
        ? { x: 0, y: 0, z: 0 }
        : {
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle),
            z: 0,
          };
      writeSeedPosition(graph, nodeId, pos, seededPositions, spinePositions, info);
    });
  }
}

export function seedGenericFallbackLayout(graph: Graph): GWFallbackSeedResult {
  const seededPositions = new Map<string, GWSeedPosition>();
  const spinePositions = new Map<string, { x: number; y: number }>();

  placeUnseededNodesWithFallback(graph, seededPositions, spinePositions);

  graph.setAttribute("__seededSpinePositions", spinePositions);
  graph.setAttribute("__gwellsSeedPositions", seededPositions);

  return { seededPositions, spinePositions };
}
