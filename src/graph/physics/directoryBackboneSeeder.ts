/**
 * Directory Backbone Seeder
 *
 * Deterministic layout for directory spine nodes.
 * Places two backbones (src, docs) side-by-side, spines stacked alphabetically,
 * file children orbiting parent spines.
 *
 * Uses Sigma nodeReducer for pinning: stores seeded positions in graph-level
 * attribute `__seededSpinePositions` for the reducer to read at render time.
 * This works around FA2 worker overwriting graphology attributes.
 */

import type Graph from "graphology";

export interface SeedFunctionContext {
  graph: Graph;
  settings?: {
    nodeSize?: number;
    linkDistance?: number;
    repelForce?: number;
    centerForce?: number;
    physicsDialect?: "default" | "helix" | "solar-orbit";
  };
}

/**
 * Backbone configuration tunables.
 */
const BACKBONE_CONFIG = {
  // Horizontal spacing between the two backbones
  backboneSpacing: 2000,
  // Vertical spacing between spines along the backbone
  spineSpacing: 150,
  // Radius of file children orbit around parent spine
  childOrbitRadius: 80,
  // Vertical offset for root spines (to center layout vertically)
  rootOffsetY: 0,
} as const;

/**
 * Simple hash function for deterministic position perturbation.
 */
function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Build parent-child maps from contains edges.
 * Returns:
 * - parentToChildren: Map<parentId, Set<childId>>
 * - rootIds: Array of node IDs with no parent
 */
function buildContainsMap(graph: Graph): {
  parentToChildren: Map<string, Set<string>>;
  rootIds: string[];
} {
  const parentToChildren = new Map<string, Set<string>>();
  const childToParent = new Map<string, string>();
  const rootIds: string[] = [];

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

      // Only track contains where source is a spine
      if (sourceType === "spine") {
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
      rootIds.push(spineId);
    }
  });

  return { parentToChildren, rootIds };
}

/**
 * Flatten spine hierarchy into depth-first traversal order.
 * Returns array of spine IDs in DFS order, with depth annotation.
 */
function flattenSpines(
  rootId: string,
  parentToChildren: Map<string, Set<string>>,
  graph: Graph,
  depth: number = 0
): Array<{ spineId: string; depth: number }> {
  const result: Array<{ spineId: string; depth: number }> = [
    { spineId: rootId, depth },
  ];

  const children = parentToChildren.get(rootId);
  if (children) {
    const sortedChildren = Array.from(children).sort();
    for (const childId of sortedChildren) {
      const childAttrs = graph.getNodeAttributes(childId);
      const childType = childAttrs.nodeType || childAttrs.raw?.type;
      if (childType === "spine") {
        result.push(...flattenSpines(childId, parentToChildren, graph, depth + 1));
      }
    }
  }

  return result;
}

/**
 * Seed directory backbone layout.
 *
 * Algorithm:
 * 1. Find root spines (expected: "src", "docs")
 * 2. Sort roots alphabetically
 * 3. Place roots on parallel vertical axes
 * 4. For each root, DFS traverse spine children, place along axis
 * 5. Set spine positions (x, y) and fixed: true
 * 6. Store seeded positions in graph-level Map for nodeReducer
 * 7. Place file children in arc around parent spine, alternating sides by depth
 */
export function seedDirectoryBackboneN2(ctx: SeedFunctionContext): void {
  const graph = ctx.graph;

  // Build contains map
  const { parentToChildren, rootIds } = buildContainsMap(graph);

  if (rootIds.length === 0) {
    console.warn("[directoryBackboneSeeder] No root spines found, skipping seeding");
    return;
  }

  // Sort roots alphabetically (src before docs)
  const sortedRoots = rootIds.sort();

  // Store seeded positions for nodeReducer
  const seededPositions = new Map<string, { x: number; y: number }>();

  // Place each root's spine hierarchy
  sortedRoots.forEach((rootId, rootIndex) => {
    // Root X position: left backbone for first root, right for second
    const rootX = rootIndex === 0
      ? -BACKBONE_CONFIG.backboneSpacing / 2
      : BACKBONE_CONFIG.backboneSpacing / 2;

    // DFS flatten with depth
    const spines = flattenSpines(rootId, parentToChildren, graph, 0);

    // Place spines along vertical axis, stacked alphabetically
    spines.forEach(({ spineId }, spineIdx) => {       // ← note spineIdx added here
      const spineAttrs = graph.getNodeAttributes(spineId);
      const label = spineAttrs.label || spineId;
    
      const hash = hashId(label);
      const yOffset = (hash % 1000) / 1000 * 50 - 25;
      const y = (spineIdx - spines.length / 2) * BACKBONE_CONFIG.spineSpacing + yOffset + BACKBONE_CONFIG.rootOffsetY;
    
      const x = rootX;
    
      graph.setNodeAttribute(spineId, "x", x);
      graph.setNodeAttribute(spineId, "y", y);
      graph.setNodeAttribute(spineId, "fixed", true);
    
      seededPositions.set(spineId, { x, y });
    });

    // Place file children in orbit around parent spines
    spines.forEach(({ spineId }) => {
      const children = parentToChildren.get(spineId);
      if (!children) return;

      const childArray = Array.from(children).sort();
      const spineX = graph.getNodeAttribute(spineId, "x") as number;
      const spineY = graph.getNodeAttribute(spineId, "y") as number;

      childArray.forEach((childId, childIndex) => {
        const childAttrs = graph.getNodeAttributes(childId);
        const childType = childAttrs.nodeType || childAttrs.raw?.type;

        // Only place non-spine children (files)
        if (childType !== "spine") {
          // Orbit outward from backbone axis (left backbone → left, right backbone → right)
          const side = rootX < 0 ? -1 : 1;

          // Orbit angle: distribute children evenly around parent
          const angle = (childIndex / childArray.length) * Math.PI * 0.8 + Math.PI * 0.1;

          const orbitX = spineX + side * BACKBONE_CONFIG.childOrbitRadius * Math.cos(angle);
          const orbitY = spineY + BACKBONE_CONFIG.childOrbitRadius * Math.sin(angle);

          graph.setNodeAttribute(childId, "x", orbitX);
          graph.setNodeAttribute(childId, "y", orbitY);
          // Do NOT set fixed on children - let FA2 arrange them
        }
      });
    });
  });

  // Store seeded positions as graph-level attribute for nodeReducer
  graph.setAttribute("__seededSpinePositions", seededPositions);

  console.log("[directoryBackboneSeeder] Seeded", seededPositions.size, "spine positions");
}
