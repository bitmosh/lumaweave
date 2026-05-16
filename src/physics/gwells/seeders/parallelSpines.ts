/**
 * GWells — Parallel Spines Seeder
 *
 * N vertical spines distributed evenly around a central y-axis.
 *
 * In 3D, each spine sits at:
 *   x = R × cos(i × 360°/N)
 *   y = j × spineSpacing  (j is the node index along the spine)
 *   z = R × sin(i × 360°/N)
 *
 * where R = axisOffsetForN(offsetFromHub, N).
 *
 * Sigma currently renders only (x, y). The z attribute is stored on every
 * node for forward-compatibility with future 3D camera support.
 *
 * For N=2: spines at x=±R, z=0. Pure 2D layout. Default for Parallel-Spines.
 * For N=3+: spines distribute around the central axis; some will overlap in
 * the 2D projection until the camera supports rotation.
 *
 * Algorithm and parameter spec: docs/physics/GWELLS_DIALECT_PARALLEL_SPINES.md
 *
 * Writes node x/y/z positions and __seededSpinePositions graph attr.
 * Deterministic: same input → same output.
 */

import type { GWSeedFunctionContext, GWHelixTwistRecord } from "../types";
import { axisOffsetForN, resolveHelixTwist, buildContainsMap, flattenSpinesFromRoot, assignSpinesToAxes } from "../seederHelpers";

interface ParallelSpinesParams {
  spineCount: number;
  offsetFromHub: number; // base; actual axis radius = axisOffsetForN(this, spineCount)
  spineSpacing: number;
  directoryOffset: number;
  directoryAlternation: "above-below" | "above-only" | "below-only";
  helixTwist: GWHelixTwistRecord;
  fileOrbitRadius: number;
  endpointFanArc: number;
  endpointFanCount: number;
}

const DEFAULTS: ParallelSpinesParams = {
  spineCount: 2,
  offsetFromHub: 1000, // gives 2000-unit gap for N=2 (matches FA2 layout)
  spineSpacing: 150,
  directoryOffset: 220,
  directoryAlternation: "above-below",
  helixTwist: {}, // all zeros
  fileOrbitRadius: 90,
  endpointFanArc: 100,
  endpointFanCount: 6,
};

function resolveParams(raw: Record<string, unknown>): ParallelSpinesParams {
  return {
    spineCount: typeof raw.spineCount === "number" ? raw.spineCount : DEFAULTS.spineCount,
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

export function seedParallelSpines(ctx: GWSeedFunctionContext): void {
  const { graph, config } = ctx;
  const params = resolveParams(config.seedParams ?? {});

  const { parentToChildren, rootSpineIds } = buildContainsMap(graph);

  if (rootSpineIds.length === 0) {
    console.warn("[parallelSpines] No root spines found, skipping seeding");
    return;
  }

  const sortedRoots = rootSpineIds.sort();
  const axes = assignSpinesToAxes(sortedRoots, params.spineCount);
  const seededPositions = new Map();

  const R = axisOffsetForN(params.offsetFromHub, params.spineCount);
  const spineTwist = resolveHelixTwist(params.helixTwist, "spine");

  // Process each spine
  for (let spineIndex = 0; spineIndex < params.spineCount; spineIndex++) {
    const angleDeg = (spineIndex * 360) / params.spineCount;
    const angleRad = (angleDeg * Math.PI) / 180;

    const rootsForThisAxis = axes[spineIndex];

    // DFS-flatten spine nodes
    const allSpineNodes: string[] = [];
    for (const rootId of rootsForThisAxis) {
      allSpineNodes.push(...flattenSpinesFromRoot(rootId, parentToChildren, graph));
    }

    // Place spine nodes along the y-axis
    allSpineNodes.forEach((spineNodeId, nodeIndex) => {
      const yAlongSpine = nodeIndex * params.spineSpacing;

      // Apply spine twist: as we walk up the spine, the spine itself rotates around the central axis
      let spineAngleAtThisHeight = angleRad;
      if (spineTwist !== 0) {
        const twistRad = (spineTwist * (yAlongSpine / 100) * Math.PI) / 180;
        spineAngleAtThisHeight = angleRad + twistRad;
      }

      const x = R * Math.cos(spineAngleAtThisHeight);
      const y = yAlongSpine;
      const z = R * Math.sin(spineAngleAtThisHeight);

      graph.setNodeAttribute(spineNodeId, "x", x);
      graph.setNodeAttribute(spineNodeId, "y", y);
      graph.setNodeAttribute(spineNodeId, "z", z);
      seededPositions.set(spineNodeId, { x, y, z });

      // Mark outermost as endpoint
      if (nodeIndex === allSpineNodes.length - 1) {
        graph.setNodeAttribute(spineNodeId, "isEndpoint", true);
      }
    });

    // Place directories and files for each spine node
    allSpineNodes.forEach((spineNodeId, nodeIndex) => {
      const yAlongSpine = nodeIndex * params.spineSpacing;
      let spineAngleAtThisHeight = angleRad;
      if (spineTwist !== 0) {
        const twistRad = (spineTwist * (yAlongSpine / 100) * Math.PI) / 180;
        spineAngleAtThisHeight = angleRad + twistRad;
      }
      const spineX = R * Math.cos(spineAngleAtThisHeight);
      const spineZ = R * Math.sin(spineAngleAtThisHeight);
      const spineY = yAlongSpine;

      const children = parentToChildren.get(spineNodeId);
      if (!children) return;

      const childArray = Array.from(children).sort();
      let dirIndex = 0;
      const fileChildren: string[] = [];
      const dirChildren: string[] = [];

      childArray.forEach((childId) => {
        const childAttrs = graph.getNodeAttributes(childId);
        const childType = childAttrs.nodeType || childAttrs.raw?.type;
        if (childType === "directory") dirChildren.push(childId);
        else if (childType === "file") fileChildren.push(childId);
      });

      // Place directories perpendicular to the spine axis.
      // For parallel-spines, "perpendicular" means horizontal — perpendicular to the
      // vertical spine direction. Directories alternate left/right relative to the
      // spine's current x position. Helix twist on directory affects the angle.
      const directoryTwist = resolveHelixTwist(params.helixTwist, "directory");

      dirChildren.forEach((childId) => {
        // Perpendicular direction in the x-z plane, perpendicular to the radial direction
        // from central axis to spine. For a spine at angle θ around central axis,
        // perpendicular direction (in x-z plane) is (cos(θ+90°), sin(θ+90°)).
        const perpAngleBase = spineAngleAtThisHeight + Math.PI / 2;
        const twistRad = directoryTwist === 0 ? 0 : (directoryTwist * (yAlongSpine / 100) * Math.PI) / 180;
        const perpAngle = perpAngleBase + twistRad;

        let sign: number;
        switch (params.directoryAlternation) {
          case "above-only": sign = +1; break;
          case "below-only": sign = -1; break;
          case "above-below":
          default: sign = dirIndex % 2 === 0 ? +1 : -1; break;
        }

        const dirX = spineX + sign * params.directoryOffset * Math.cos(perpAngle);
        const dirY = spineY; // directories sit at same y as their spine node
        const dirZ = spineZ + sign * params.directoryOffset * Math.sin(perpAngle);

        graph.setNodeAttribute(childId, "x", dirX);
        graph.setNodeAttribute(childId, "y", dirY);
        graph.setNodeAttribute(childId, "z", dirZ);

        // Place file children in orbit around the directory (in the x-z plane, at constant y)
        const fileTwist = resolveHelixTwist(params.helixTwist, "file");
        const dirFiles = parentToChildren.get(childId);
        if (dirFiles) {
          const fileArray = Array.from(dirFiles).sort();
          fileArray.forEach((fileId, fileIndex) => {
            const fileAttrs = graph.getNodeAttributes(fileId);
            const fileType = fileAttrs.nodeType || fileAttrs.raw?.type;
            if (fileType === "file") {
              const fileCount = fileArray.length;
              const dDir = Math.sqrt(dirX * dirX + dirZ * dirZ);
              const fileTwistRad = fileTwist === 0 ? 0 : (fileTwist * (dDir / 100) * Math.PI) / 180;
              const orbitAngle = (fileIndex / fileCount) * 2 * Math.PI + fileTwistRad;

              const fileX = dirX + params.fileOrbitRadius * Math.cos(orbitAngle);
              const fileY = dirY;
              const fileZ = dirZ + params.fileOrbitRadius * Math.sin(orbitAngle);

              graph.setNodeAttribute(fileId, "x", fileX);
              graph.setNodeAttribute(fileId, "y", fileY);
              graph.setNodeAttribute(fileId, "z", fileZ);
            }
          });
        }

        dirIndex++;
      });

      // Endpoint / spine-attached files fan out from the spine node
      if (fileChildren.length > 0) {
        const fanArcRad = (params.endpointFanArc * Math.PI) / 180;
        const numEndpointFiles = fileChildren.length;
        fileChildren.forEach((fileId, fileIdx) => {
          const t = numEndpointFiles === 1 ? 0.5 : fileIdx / (numEndpointFiles - 1);
          // Fan opens outward from the central axis — in the spine's radial direction
          const fanAngle = spineAngleAtThisHeight + (t - 0.5) * fanArcRad;
          const fanDist = params.fileOrbitRadius * 1.5;

          const fileX = spineX + fanDist * Math.cos(fanAngle);
          const fileY = spineY;
          const fileZ = spineZ + fanDist * Math.sin(fanAngle);

          graph.setNodeAttribute(fileId, "x", fileX);
          graph.setNodeAttribute(fileId, "y", fileY);
          graph.setNodeAttribute(fileId, "z", fileZ);
        });
      }
    });
  }

  // Store seeded positions for nodeReducer
  // Note: nodeReducer currently expects { x, y }; the z is dropped silently for now.
  // Future 3D camera will use a different interface.
  const positionsForReducer = new Map();
  seededPositions.forEach((pos, id) => {
    positionsForReducer.set(id, { x: pos.x, y: pos.y });
  });
  graph.setAttribute("__seededSpinePositions", positionsForReducer);

  console.log(
    `[parallelSpines] Seeded ${seededPositions.size} spine positions across ${params.spineCount} parallel spines`
  );
}
