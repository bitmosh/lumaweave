/**
 * GWells — Radial Backbone Seeder
 *
 * Computes initial positions for the radial-backbone dialect family.
 * N spines emanate from a central hub at configurable angles, with
 * optional helical twist along each spine.
 *
 * Used by: horizontal-linear, vertical-parallel, helix-dual, and
 * future radial dialects (triple-spine-y, quad-spine-cross,
 * helix-triple, helix-quad).
 *
 * Algorithm and parameter spec: docs/physics/GWELLS_DIALECT_RADIAL_BACKBONE.md
 *
 * Writes node x/y positions and __seededSpinePositions graph attr.
 * Deterministic: same input → same output.
 */

import type Graph from "graphology";
import type { GWSeedFunctionContext } from "../types";

interface RadialBackboneParams {
  spineCount: number;
  spineAngles: number[]; // degrees, length === spineCount
  offsetFromHub: number;
  spineSpacing: number;
  directoryOffset: number;
  directoryAlternation: "above-below" | "above-only" | "below-only";
  helixTwist: number; // degrees per 100 units distance
  fileOrbitRadius: number;
  endpointFanArc: number; // degrees
  endpointFanCount: number;
}

const DEFAULTS: RadialBackboneParams = {
  spineCount: 2,
  spineAngles: [0, 180],
  offsetFromHub: 0,
  spineSpacing: 150,
  directoryOffset: 220,
  directoryAlternation: "above-below",
  helixTwist: 0,
  fileOrbitRadius: 90,
  endpointFanArc: 100,
  endpointFanCount: 6,
};

function resolveParams(raw: Record<string, unknown>): RadialBackboneParams {
  return {
    spineCount: typeof raw.spineCount === "number" ? raw.spineCount : DEFAULTS.spineCount,
    spineAngles: Array.isArray(raw.spineAngles) ? raw.spineAngles as number[] : DEFAULTS.spineAngles,
    offsetFromHub: typeof raw.offsetFromHub === "number" ? raw.offsetFromHub : DEFAULTS.offsetFromHub,
    spineSpacing: typeof raw.spineSpacing === "number" ? raw.spineSpacing : DEFAULTS.spineSpacing,
    directoryOffset: typeof raw.directoryOffset === "number" ? raw.directoryOffset : DEFAULTS.directoryOffset,
    directoryAlternation:
      raw.directoryAlternation === "above-only" || raw.directoryAlternation === "below-only"
        ? raw.directoryAlternation
        : "above-below",
    helixTwist: typeof raw.helixTwist === "number" ? raw.helixTwist : DEFAULTS.helixTwist,
    fileOrbitRadius: typeof raw.fileOrbitRadius === "number" ? raw.fileOrbitRadius : DEFAULTS.fileOrbitRadius,
    endpointFanArc: typeof raw.endpointFanArc === "number" ? raw.endpointFanArc : DEFAULTS.endpointFanArc,
    endpointFanCount: typeof raw.endpointFanCount === "number" ? raw.endpointFanCount : DEFAULTS.endpointFanCount,
  };
}

/**
 * Build parent-child maps from contains edges.
 * Returns:
 * - parentToChildren: Map<parentId, Set<childId>>
 * - rootSpineIds: Array of spine node IDs with no parent
 */
function buildContainsMap(graph: Graph): {
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
      rootSpineIds.push(spineId);
    }
  });

  return { parentToChildren, rootSpineIds };
}

/**
 * DFS-flatten spine nodes from a root into stable iteration order.
 * Returns array of spine IDs in DFS order, sorted alphabetically at each level.
 */
function flattenSpinesFromRoot(
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
function assignSpinesToAxes(
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

export function seedRadialBackbone(ctx: GWSeedFunctionContext): void {
  const { graph, config } = ctx;
  const params = resolveParams(config.seedParams ?? {});

  // Validate spineAngles length
  if (params.spineAngles.length !== params.spineCount) {
    console.warn(
      `[radialBackbone] spineAngles length (${params.spineAngles.length}) ` +
      `does not match spineCount (${params.spineCount}). Using defaults.`
    );
    // Auto-distribute evenly
    params.spineAngles = Array.from({ length: params.spineCount }, (_, i) =>
      (i * 360) / params.spineCount
    );
  }

  // Build contains map
  const { parentToChildren, rootSpineIds } = buildContainsMap(graph);

  if (rootSpineIds.length === 0) {
    console.warn("[radialBackbone] No root spines found, skipping seeding");
    return;
  }

  // Sort roots alphabetically
  const sortedRoots = rootSpineIds.sort();

  // Assign roots to spines
  const axes = assignSpinesToAxes(sortedRoots, params.spineCount);

  // Store seeded positions for nodeReducer
  const seededPositions = new Map<string, { x: number; y: number }>();

  // Process each spine axis
  for (let spineIndex = 0; spineIndex < params.spineCount; spineIndex++) {
    const angleDeg = params.spineAngles[spineIndex];
    const angleRad = angleDeg * Math.PI / 180;
    const spineDirX = Math.cos(angleRad);
    const spineDirY = Math.sin(angleRad);

    const rootsForThisAxis = axes[spineIndex];

    // DFS-flatten all spine nodes for this axis
    const allSpineNodes: string[] = [];
    for (const rootId of rootsForThisAxis) {
      allSpineNodes.push(...flattenSpinesFromRoot(rootId, parentToChildren, graph));
    }

    // Place spine nodes along the axis
    allSpineNodes.forEach((spineNodeId, nodeIndex) => {
      const dHub = params.offsetFromHub + nodeIndex * params.spineSpacing;

      const spineX = dHub * spineDirX;
      const spineY = dHub * spineDirY;

      graph.setNodeAttribute(spineNodeId, "x", spineX);
      graph.setNodeAttribute(spineNodeId, "y", spineY);
      seededPositions.set(spineNodeId, { x: spineX, y: spineY });

      // Mark outermost node as endpoint
      if (nodeIndex === allSpineNodes.length - 1) {
        graph.setNodeAttribute(spineNodeId, "isEndpoint", true);
      }
    });

    // Place directory children and their file children
    allSpineNodes.forEach((spineNodeId, nodeIndex) => {
      const dHub = params.offsetFromHub + nodeIndex * params.spineSpacing;
      const spineX = dHub * spineDirX;
      const spineY = dHub * spineDirY;

      const children = parentToChildren.get(spineNodeId);
      if (!children) return;

      const childArray = Array.from(children).sort();
      let dirIndex = 0;

      // Separate files and directories
      const fileChildren: string[] = [];
      const dirChildren: string[] = [];

      childArray.forEach((childId) => {
        const childAttrs = graph.getNodeAttributes(childId);
        const childType = childAttrs.nodeType || childAttrs.raw?.type;
        if (childType === "directory") {
          dirChildren.push(childId);
        } else if (childType === "file") {
          fileChildren.push(childId);
        }
      });

      // Place directories
      dirChildren.forEach((childId) => {
        // Perpendicular angle (90° rotated from spine direction)
        const perpAngleBase = angleRad + Math.PI / 2;

        // Apply helix twist
        const twistRad = params.helixTwist * (dHub / 100) * Math.PI / 180;
        const perpAngle = perpAngleBase + twistRad;

        // Direction the directory sits relative to the spine node
        let sign: number;
        switch (params.directoryAlternation) {
          case "above-only":
            sign = +1;
            break;
          case "below-only":
            sign = -1;
            break;
          case "above-below":
          default:
            sign = dirIndex % 2 === 0 ? +1 : -1;
            break;
        }

        const dirX = spineX + sign * params.directoryOffset * Math.cos(perpAngle);
        const dirY = spineY + sign * params.directoryOffset * Math.sin(perpAngle);

        graph.setNodeAttribute(childId, "x", dirX);
        graph.setNodeAttribute(childId, "y", dirY);

        // Place file children in orbit around the directory
        const dirFiles = parentToChildren.get(childId);
        if (dirFiles) {
          const fileArray = Array.from(dirFiles).sort();
          fileArray.forEach((fileId, fileIndex) => {
            const fileAttrs = graph.getNodeAttributes(fileId);
            const fileType = fileAttrs.nodeType || fileAttrs.raw?.type;

            if (fileType === "file") {
              const fileCount = fileArray.length;
              const orbitAngle = (fileIndex / fileCount) * 2 * Math.PI;

              const fileX = dirX + params.fileOrbitRadius * Math.cos(orbitAngle);
              const fileY = dirY + params.fileOrbitRadius * Math.sin(orbitAngle);

              graph.setNodeAttribute(fileId, "x", fileX);
              graph.setNodeAttribute(fileId, "y", fileY);
            }
          });
        }

        dirIndex++;
      });

      // Place file children of spine nodes (endpoint files)
      // Also place file children of non-endpoint spine nodes (they fan from the spine node)
      if (fileChildren.length > 0) {
        const fanArcRad = params.endpointFanArc * Math.PI / 180;
        const numEndpointFiles = fileChildren.length;

        fileChildren.forEach((fileId, fileIdx) => {
          const t = numEndpointFiles === 1 ? 0.5 : fileIdx / (numEndpointFiles - 1);
          const fanAngle = angleRad + (t - 0.5) * fanArcRad;

          const fanDist = params.fileOrbitRadius * 1.5;
          const fileX = spineX + fanDist * Math.cos(fanAngle);
          const fileY = spineY + fanDist * Math.sin(fanAngle);

          graph.setNodeAttribute(fileId, "x", fileX);
          graph.setNodeAttribute(fileId, "y", fileY);
        });
      }
    });
  }

  // Store seeded positions as graph-level attribute for nodeReducer
  graph.setAttribute("__seededSpinePositions", seededPositions);

  console.log(
    `[radialBackbone] Seeded ${seededPositions.size} spine positions across ${params.spineCount} spines`
  );
}
