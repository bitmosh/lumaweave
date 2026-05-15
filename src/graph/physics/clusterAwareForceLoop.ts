/**
 * Cluster-Aware Force Loop
 *
 * A deterministic per-frame physics pass that replaces FA2 for the
 * directory-backbone layout. Custom force semantics:
 *
 *   1. Files attract to their parent spine (via contains edge).
 *   2. Sibling files (same parent) repel each other for lateral spread.
 *   3. Cluster-cluster repulsion: each non-spine node weakly repels
 *      from OTHER spines (not its own), keeping clusters separated
 *      without breaking same-cluster cohesion.
 *
 * Spines are not moved — they're pinned via the nodeReducer in
 * SigmaGraphView, so this loop reads their positions but does not
 * write them.
 */

import type Graph from "graphology";

export const CLUSTER_AWARE_CONFIG = {
  /** Strength of attraction from file to its parent spine */
  containsStrength: 0.05,
  /** Strength of repulsion between siblings (same parent) */
  siblingRepel: 30,
  /** Strength of repulsion from non-parent spines */
  clusterRepel: 200,
  /** Damping factor applied to all motion per frame */
  damping: 0.85,
  /** Minimum distance for repulsion (avoid divide-by-zero) */
  minDistance: 5,
  /** Maximum velocity per frame (prevents flying-apart) */
  maxVelocity: 50,
} as const;

interface NodeKinematics {
  vx: number;
  vy: number;
  parentSpineId: string | null;
}

/**
 * Build a fast lookup of parent spine for every non-spine node.
 */
function buildParentLookup(graph: Graph): Map<string, string> {
  const parentOf = new Map<string, string>();
  graph.forEachEdge((_edgeId, attrs, source, target) => {
    const rel = attrs.relationship ?? attrs.type;
    if (rel !== "contains") return;
    const sourceAttrs = graph.getNodeAttributes(source);
    const isSourceSpine =
      sourceAttrs.nodeType === "spine" || sourceAttrs.raw?.type === "spine";
    if (!isSourceSpine) return;
    // Only set if target isn't already a spine (we don't track spine→spine)
    const targetAttrs = graph.getNodeAttributes(target);
    const isTargetSpine =
      targetAttrs.nodeType === "spine" || targetAttrs.raw?.type === "spine";
    if (isTargetSpine) return;
    parentOf.set(target, source);
  });
  return parentOf;
}

/**
 * Build a list of all spine node IDs for cluster-cluster repulsion.
 */
function getSpineIds(graph: Graph): string[] {
  const spines: string[] = [];
  graph.forEachNode((id, attrs) => {
    if (attrs.nodeType === "spine" || attrs.raw?.type === "spine") {
      spines.push(id);
    }
  });
  return spines;
}

/**
 * Group non-spine nodes by their parent spine for sibling repulsion.
 */
function buildSiblingGroups(
  _graph: Graph,
  parentOf: Map<string, string>
): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  parentOf.forEach((parentId, nodeId) => {
    if (!groups.has(parentId)) groups.set(parentId, []);
    groups.get(parentId)!.push(nodeId);
  });
  return groups;
}

/**
 * Run a single physics tick. Mutates graph node x/y for non-spine nodes.
 */
function tick(
  graph: Graph,
  kinematics: Map<string, NodeKinematics>,
  parentOf: Map<string, string>,
  siblingGroups: Map<string, string[]>,
  spineIds: string[]
): void {
  const { containsStrength, siblingRepel, clusterRepel, damping, minDistance, maxVelocity } =
    CLUSTER_AWARE_CONFIG;

  graph.forEachNode((nodeId, attrs) => {
    // Skip spines — they're pinned, don't move them
    const isSpine = attrs.nodeType === "spine" || attrs.raw?.type === "spine";
    if (isSpine) return;

    const parentId = parentOf.get(nodeId);
    if (!parentId) return; // orphan, skip

    const kin = kinematics.get(nodeId)!;
    let fx = 0;
    let fy = 0;

    // 1. Attraction to parent spine
    const parentAttrs = graph.getNodeAttributes(parentId);
    const dxParent = parentAttrs.x - attrs.x;
    const dyParent = parentAttrs.y - attrs.y;
    fx += dxParent * containsStrength;
    fy += dyParent * containsStrength;

    // 2. Sibling repulsion (same parent)
    const siblings = siblingGroups.get(parentId) ?? [];
    for (const sibId of siblings) {
      if (sibId === nodeId) continue;
      const sibAttrs = graph.getNodeAttributes(sibId);
      const dx = attrs.x - sibAttrs.x;
      const dy = attrs.y - sibAttrs.y;
      const distSq = Math.max(minDistance * minDistance, dx * dx + dy * dy);
      const force = siblingRepel / distSq;
      fx += (dx / Math.sqrt(distSq)) * force;
      fy += (dy / Math.sqrt(distSq)) * force;
    }

    // 3. Cluster-cluster repulsion (non-parent spines)
    for (const spineId of spineIds) {
      if (spineId === parentId) continue;
      const spineAttrs = graph.getNodeAttributes(spineId);
      const dx = attrs.x - spineAttrs.x;
      const dy = attrs.y - spineAttrs.y;
      const distSq = Math.max(minDistance * minDistance, dx * dx + dy * dy);
      const force = clusterRepel / distSq;
      fx += (dx / Math.sqrt(distSq)) * force;
      fy += (dy / Math.sqrt(distSq)) * force;
    }

    // Apply with damping and velocity clamp
    kin.vx = (kin.vx + fx) * damping;
    kin.vy = (kin.vy + fy) * damping;
    const speed = Math.hypot(kin.vx, kin.vy);
    if (speed > maxVelocity) {
      kin.vx = (kin.vx / speed) * maxVelocity;
      kin.vy = (kin.vy / speed) * maxVelocity;
    }

    graph.setNodeAttribute(nodeId, "x", attrs.x + kin.vx);
    graph.setNodeAttribute(nodeId, "y", attrs.y + kin.vy);
  });
}

/**
 * Start the cluster-aware force loop running on requestAnimationFrame.
 * Returns a stop function.
 */
export function startClusterAwareForceLoop(graph: Graph): () => void {
  const parentOf = buildParentLookup(graph);
  const siblingGroups = buildSiblingGroups(graph, parentOf);
  const spineIds = getSpineIds(graph);

  const kinematics = new Map<string, NodeKinematics>();
  graph.forEachNode((nodeId) => {
    kinematics.set(nodeId, {
      vx: 0,
      vy: 0,
      parentSpineId: parentOf.get(nodeId) ?? null,
    });
  });

  let running = true;
  let rafId: number | null = null;

  const loop = () => {
    if (!running) return;
    tick(graph, kinematics, parentOf, siblingGroups, spineIds);
    rafId = requestAnimationFrame(loop);
  };

  rafId = requestAnimationFrame(loop);

  console.log(
    "[clusterAwareForceLoop] started:",
    "spines=" + spineIds.length,
    "files=" + parentOf.size,
    "groups=" + siblingGroups.size
  );

  return () => {
    running = false;
    if (rafId !== null) cancelAnimationFrame(rafId);
    console.log("[clusterAwareForceLoop] stopped");
  };
}
