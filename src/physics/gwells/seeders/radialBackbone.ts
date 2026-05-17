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

import type { GWSeedFunctionContext, GWHelixTwistRecord } from "../types";
import { resolveHelixTwist, buildContainsMap, flattenSpinesFromRoot, assignSpinesToAxes } from "../seederHelpers";

interface RadialBackboneParams {
  spineCount: number;
  spineAngles: number[]; // degrees, length === spineCount
  offsetFromHub: number;
  spineSpacing: number;
  directoryOffset: number;
  directoryAlternation: "above-below" | "above-only" | "below-only";
  helixTwist: GWHelixTwistRecord; // CHANGED from number
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
  helixTwist: {}, // CHANGED — empty record means no twist
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
    helixTwist:
      raw.helixTwist && typeof raw.helixTwist === "object" && !Array.isArray(raw.helixTwist)
        ? raw.helixTwist as GWHelixTwistRecord
        : DEFAULTS.helixTwist,
    fileOrbitRadius: typeof raw.fileOrbitRadius === "number" ? raw.fileOrbitRadius : DEFAULTS.fileOrbitRadius,
    endpointFanArc: typeof raw.endpointFanArc === "number" ? raw.endpointFanArc : DEFAULTS.endpointFanArc,
    endpointFanCount: typeof raw.endpointFanCount === "number" ? raw.endpointFanCount : DEFAULTS.endpointFanCount,
  };
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

  // NEW: Stored for engine's seed-anchor force — ALL nodes
  const allSeedPositions = new Map<string, { x: number; y: number; z: number }>();

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
      graph.setNodeAttribute(spineNodeId, "z", 0);
      seededPositions.set(spineNodeId, { x: spineX, y: spineY });
      allSeedPositions.set(spineNodeId, { x: spineX, y: spineY, z: 0 });

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
        const directoryTwist = resolveHelixTwist(params.helixTwist, "directory");
        const twistRad = directoryTwist * (dHub / 100) * Math.PI / 180;
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
        graph.setNodeAttribute(childId, "z", 0);
        allSeedPositions.set(childId, { x: dirX, y: dirY, z: 0 });

        // Place file children in orbit around the directory
        const dirFiles = parentToChildren.get(childId);
        if (dirFiles) {
          const fileArray = Array.from(dirFiles).sort();
          fileArray.forEach((fileId, fileIndex) => {
            const fileAttrs = graph.getNodeAttributes(fileId);
            const fileType = fileAttrs.nodeType || fileAttrs.raw?.type;

            if (fileType === "file") {
              const fileCount = fileArray.length;
              const dDirectory = Math.sqrt(dirX * dirX + dirY * dirY);
              const fileTwist = resolveHelixTwist(params.helixTwist, "file");
              const fileTwistRad = fileTwist * (dDirectory / 100) * Math.PI / 180;
              const orbitAngle = (fileIndex / fileCount) * 2 * Math.PI + fileTwistRad;

              const fileX = dirX + params.fileOrbitRadius * Math.cos(orbitAngle);
              const fileY = dirY + params.fileOrbitRadius * Math.sin(orbitAngle);

              graph.setNodeAttribute(fileId, "x", fileX);
              graph.setNodeAttribute(fileId, "y", fileY);
              graph.setNodeAttribute(fileId, "z", 0);
              allSeedPositions.set(fileId, { x: fileX, y: fileY, z: 0 });
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
          graph.setNodeAttribute(fileId, "z", 0);
          allSeedPositions.set(fileId, { x: fileX, y: fileY, z: 0 });
        });
      }
    });
  }

  // Store seeded positions as graph-level attribute for nodeReducer
  graph.setAttribute("__seededSpinePositions", seededPositions);
  graph.setAttribute("__gwellsSeedPositions", allSeedPositions);

  console.log(
    `[radialBackbone] Seeded ${seededPositions.size} spine positions and ` +
    `${allSeedPositions.size} total node positions across ${params.spineCount} spines`
  );
}
