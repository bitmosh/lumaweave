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
import { axisOffsetForN, resolveHelixTwist, buildContainsMap, flattenSpinesFromRoot, assignSpinesToAxes, computeOrbitRadius } from "../seederHelpers";

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

  // NEW: Stored for engine's seed-anchor force — ALL nodes
  const allSeedPositions = new Map<string, { x: number; y: number; z: number }>();

  // NEW: Recursive directory placement (Pass C8 fern-frond)
  //
  // Places a directory and recursively all its descendants in the fern-frond shape.
  // depth=0 means this directory is a first-level branch off a spine — it gets
  // placed outward from the spine axis with y-offset for sibling alternation.
  // depth>0 means this directory is a deeper descendant — it continues along
  // the same outwardDir as its parent without further y-jitter.
  function placeBranchRecursive(
    dirId: string,
    parentPos: { x: number; y: number; z: number },
    outwardDir: { dx: number; dy: number; dz: number },
    depth: number,
    siblingIndex: number,
    spineAngleRad: number,   // angle of the spine this branch belongs to
    yAlongSpine: number,     // y position along spine for helix twist calculation
  ): void {
    // Compute this directory's position.
    let myDir: { dx: number; dy: number; dz: number };
    let myX: number, myY: number, myZ: number;

    if (depth === 0) {
      // First-level branch: outward from center with y-offset for sibling alternation
      // Outward direction is constant (away from central axis)
      myDir = {
        dx: Math.cos(spineAngleRad),
        dy: 0,
        dz: Math.sin(spineAngleRad),
      };

      // Apply small y-offset for sibling alternation (so siblings don't stack)
      const ySign = (siblingIndex % 2 === 0) ? 1 : -1;
      const ySpacing = params.directoryOffset * 0.25; // small vertical jitter
      myY = parentPos.y + ySign * Math.floor(siblingIndex / 2) * ySpacing;

      // Apply helix twist to outward direction
      const directoryTwist = resolveHelixTwist(params.helixTwist, "directory");
      const twistRad = directoryTwist === 0 ? 0 : (directoryTwist * (yAlongSpine / 100) * Math.PI) / 180;
      const twistedAngle = spineAngleRad + twistRad;

      myDir = {
        dx: Math.cos(twistedAngle),
        dy: 0,
        dz: Math.sin(twistedAngle),
      };

      myX = parentPos.x + myDir.dx * params.directoryOffset;
      myZ = parentPos.z + myDir.dz * params.directoryOffset;
    } else {
      // Deeper level: continue along parent's outwardDir without y-jitter
      myDir = outwardDir;
      myX = parentPos.x + myDir.dx * params.directoryOffset;
      myY = parentPos.y; // match parent's y
      myZ = parentPos.z + myDir.dz * params.directoryOffset;
    }

    graph.setNodeAttribute(dirId, "x", myX);
    graph.setNodeAttribute(dirId, "y", myY);
    graph.setNodeAttribute(dirId, "z", myZ);
    allSeedPositions.set(dirId, { x: myX, y: myY, z: myZ });

    // Recurse into children.
    const myChildren = parentToChildren.get(dirId);
    if (!myChildren) return;

    const childArr = Array.from(myChildren).sort();
    const childDirs: string[] = [];
    const childFiles: string[] = [];
    childArr.forEach((cid) => {
      const ct = graph.getNodeAttributes(cid).nodeType || graph.getNodeAttributes(cid).raw?.type;
      if (ct === "directory") childDirs.push(cid);
      else if (ct === "doc" || ct === "code" || ct === "config" || ct === "fixture" || ct === "file") {
        childFiles.push(cid);
      }
    });

    // Place each child directory recursively along myDir.
    childDirs.forEach((cid, ci) => {
      placeBranchRecursive(
        cid,
        { x: myX, y: myY, z: myZ },
        myDir,           // children continue along my direction
        depth + 1,       // depth advances
        ci,              // sibling index for this directory's children
        spineAngleRad,  // unchanged
        yAlongSpine,    // unchanged (helix twist only at depth=0)
      );
    });

    // Place my file children in orbit around me (in x-z plane, at constant y)
    const fileCount = childFiles.length;
    const orbitRadius = computeOrbitRadius(fileCount, params.fileOrbitRadius);  // NEW: dynamic
    childFiles.forEach((fid, fi) => {
      const fileTwist = resolveHelixTwist(params.helixTwist, "file");
      const dDir = Math.sqrt(myX * myX + myZ * myZ);
      const fileTwistRad = fileTwist === 0 ? 0 : (fileTwist * (dDir / 100) * Math.PI) / 180;
      const orbitAngle = (fi / Math.max(1, fileCount)) * 2 * Math.PI + fileTwistRad;

      const fx = myX + orbitRadius * Math.cos(orbitAngle);  // DYNAMIC
      const fy = myY;
      const fz = myZ + orbitRadius * Math.sin(orbitAngle);  // DYNAMIC

      graph.setNodeAttribute(fid, "x", fx);
      graph.setNodeAttribute(fid, "y", fy);
      graph.setNodeAttribute(fid, "z", fz);
      allSeedPositions.set(fid, { x: fx, y: fy, z: fz });
    });
  }

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
      allSeedPositions.set(spineNodeId, { x, y, z });

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

      // Separate files and directories
      const fileChildren: string[] = [];
      const dirChildren: string[] = [];

      childArray.forEach((childId) => {
        const childAttrs = graph.getNodeAttributes(childId);
        const childType = childAttrs.nodeType || childAttrs.raw?.type;
        if (childType === "directory") dirChildren.push(childId);
        else if (
          childType === "file" ||
          childType === "doc" ||
          childType === "code" ||
          childType === "config" ||
          childType === "fixture"
        ) fileChildren.push(childId);
      });

      // Recursive placement for each directory child of this spine node
      dirChildren.forEach((childId, dirIndex) => {
        placeBranchRecursive(
          childId,
          { x: spineX, y: spineY, z: spineZ },
          { dx: 0, dy: 0, dz: 0 },
          0,
          dirIndex,
          spineAngleAtThisHeight,
          yAlongSpine,
        );
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
          allSeedPositions.set(fileId, { x: fileX, y: fileY, z: fileZ });
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
  graph.setAttribute("__gwellsSeedPositions", allSeedPositions);

  console.log(
    `[parallelSpines] Seeded ${seededPositions.size} spine positions and ` +
    `${allSeedPositions.size} total node positions across ${params.spineCount} parallel spines`
  );
}
