// SPDX-License-Identifier: Apache-2.0
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
 * Algorithm and parameter spec: docs/canonical/GWELLS_PHYSICS.md (supersedes GWELLS_DIALECT_PARALLEL_SPINES.md)
 *
 * Writes node x/y/z positions and __seededSpinePositions graph attr.
 * Deterministic: same input → same output.
 */

import type { GWSeedFunctionContext, GWHelixTwistRecord } from "../types";
import { axisOffsetForN, resolveHelixTwist, buildContainsMap, flattenSpinesFromRoot, assignSpinesToAxes, computeFileOrbit, seedGenericFallbackLayout, placeUnseededNodesWithFallback, shouldUseHubRing, computeHubRingRadius, computeHubRingPosition, makeLeafCounter, subdivideWedge } from "../seederHelpers";

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
  /**
   * L-001: total angular width, in degrees, of the wedge a directory's children fan into,
   * measured within that spine's vertical plane (see placeBranchRecursive).
   *
   * Narrower than radial-backbone's 150° because this wedge is bounded by the spine itself:
   * at ±90° a branch would run straight along the spine axis and collide with the run it hangs
   * off. 120° keeps the extremes 30° clear.
   */
  directoryFanArc: number; // degrees
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
  directoryFanArc: 120,
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
    directoryFanArc:
      typeof raw.directoryFanArc === "number" ? raw.directoryFanArc : DEFAULTS.directoryFanArc,
  };
}

export function seedParallelSpines(ctx: GWSeedFunctionContext): void {
  const { graph, config } = ctx;
  const params = resolveParams(config.seedParams ?? {});

  const { parentToChildren, rootSpineIds } = buildContainsMap(graph);

  if (rootSpineIds.length === 0) {
    seedGenericFallbackLayout(graph);
    return;
  }

  const sortedRoots = rootSpineIds.sort();
  const axes = assignSpinesToAxes(sortedRoots, params.spineCount);
  const seededPositions = new Map();

  // NEW: Stored for engine's seed-anchor force — ALL nodes
  const allSeedPositions = new Map<string, { x: number; y: number; z: number }>();

  // L-001: shared with radialBackbone via seederHelpers — one implementation, not two.
  const countLeaves = makeLeafCounter(parentToChildren, (id) => {
    const t = graph.getNodeAttributes(id).nodeType || graph.getNodeAttributes(id).raw?.type;
    return t === "directory";
  });
  const fanOut = (ids: string[], centerAngle: number, extent: number) =>
    subdivideWedge(ids, centerAngle, extent, countLeaves);

  // Recursive directory placement (Pass C8 fern-frond, reworked by L-001).
  //
  // Every position here is expressed in the SPINE'S VERTICAL PLANE: the plane spanned by that
  // spine's outward radial direction, outward(α) = (cos α, 0, sin α), and the y axis. A direction
  // in that plane is one angle φ (an elevation, 0 = straight out horizontally):
  //
  //   dir(φ) = outward(α)·cos φ + ŷ·sin φ = (cos α · cos φ,  sin φ,  sin α · cos φ)
  //
  // The old code instead fanned in x/z — the HORIZONTAL plane — and Sigma renders only (x, y).
  // That fan was therefore projected away in its entirety: two siblings differing only in azimuth
  // landed on the same rendered pixel, and azimuths symmetric about the axis collapsed onto each
  // other exactly. It was worse than that, though: siblings never got distinct azimuths in the
  // first place. Every child of a directory was handed the same `myDir`, so they were coincident
  // in 3D too, and coincidence is the one thing the simulation cannot undo (for two nodes at
  // identical coordinates the repulsion direction is the zero vector, so the force is exactly
  // zero regardless of its magnitude — a perfect stack is a stable fixed point).
  //
  // Fanning in the spine's own vertical plane varies both x and y, so the fan survives the 2D
  // projection, while z keeps carrying the spine's azimuth for the eventual 3D camera.
  function placeBranchRecursive(
    dirId: string,
    parentPos: { x: number; y: number; z: number },
    centerAngle: number,      // φ — the direction THIS directory extends from its parent
    angularExtent: number,    // the wedge THIS directory's own children may fan into
    depth: number,
    alternationSign: number,  // Pass C8.4: +1 or -1; still biases first-level branches off the run
    axisAngleRad: number,     // α — twist-adjusted azimuth of the spine this branch hangs off
    yAlongSpine: number,      // y position along spine, for helix twist
  ): void {
    // Directory helix twist rotates the plane itself, once, where the frond leaves the spine.
    // Applying it at depth 0 and then handing the twisted axis down means the whole subtree
    // stays in ONE plane — a frond that twists is still a flat frond, just aimed elsewhere.
    const directoryTwist = resolveHelixTwist(params.helixTwist, "directory");
    const twistRad =
      depth === 0 && directoryTwist !== 0
        ? (directoryTwist * (yAlongSpine / 100) * Math.PI) / 180
        : 0;
    const axis = axisAngleRad + twistRad;

    const cosPhi = Math.cos(centerAngle);
    const sinPhi = Math.sin(centerAngle);

    const myX = parentPos.x + Math.cos(axis) * cosPhi * params.directoryOffset;
    const myZ = parentPos.z + Math.sin(axis) * cosPhi * params.directoryOffset;
    let myY = parentPos.y + sinPhi * params.directoryOffset;

    if (depth === 0) {
      // Preserved from Pass C8.4: consecutive spine nodes push their first-level branches to
      // opposite sides, so adjacent runs' fronds interleave rather than stack. This is a nudge
      // between DIFFERENT parents — a density problem the simulation can actually solve — not
      // the sibling coincidence the wedge above fixes.
      myY += alternationSign * params.directoryOffset * 0.25;
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

    // L-001: children split MY wedge between them, weighted by leaf count, so each owns a
    // disjoint angular range within the frond's plane. Siblings cannot coincide by construction.
    fanOut(childDirs, centerAngle, angularExtent).forEach((child) => {
      placeBranchRecursive(
        child.id,
        { x: myX, y: myY, z: myZ },
        child.centerAngle,    // the child's own direction, its share of my wedge
        child.angularExtent,  // the sub-wedge its own children will split
        depth + 1,
        alternationSign,      // Pass C8.4: inherited — child uses parent's sign
        axis,                 // twisted axis, so the subtree stays in one plane
        yAlongSpine,
      );
    });

    // Place my file children in orbit around me using phyllotaxis spiral (Pass C8.3).
    // Sort files by raw size ascending — smaller files closer to parent, larger farther.
    const sortedFiles = childFiles.slice().sort((a, b) => {
      const sa = (graph.getNodeAttributes(a) as any).rawSize ?? 0;
      const sb = (graph.getNodeAttributes(b) as any).rawSize ?? 0;
      return sa - sb;
    });

    // Parent's visual size for orbit scaling
    const parentVisualSize = (graph.getNodeAttributes(dirId) as any).size ?? 10;

    sortedFiles.forEach((fid, fi) => {
      const { radius, angleRad: orbitAngle } = computeFileOrbit(fi, sortedFiles.length, parentVisualSize);

      // Apply helix twist if present (preserves existing twist behavior)
      const fileTwist = resolveHelixTwist(params.helixTwist, "file");
      const dDir = Math.sqrt(myX * myX + myZ * myZ);
      const fileTwistRad = fileTwist === 0 ? 0 : (fileTwist * (dDir / 100) * Math.PI) / 180;
      const theta = orbitAngle + fileTwistRad;

      // Orbit in the same vertical plane as the frond, for the same reason the frond fans there:
      // the old x/z orbit was a horizontal ring seen exactly edge-on, so it projected to a line
      // segment and every pair of files at ±θ rendered on top of each other.
      const fx = myX + radius * Math.cos(axis) * Math.cos(theta);
      const fy = myY + radius * Math.sin(theta);
      const fz = myZ + radius * Math.sin(axis) * Math.cos(theta);

      graph.setNodeAttribute(fid, "x", fx);
      graph.setNodeAttribute(fid, "y", fy);
      graph.setNodeAttribute(fid, "z", fz);
      allSeedPositions.set(fid, { x: fx, y: fy, z: fz });
    });
  }

  const R = axisOffsetForN(params.offsetFromHub, params.spineCount);
  const spineTwist = resolveHelixTwist(params.helixTwist, "spine");
  const useHubRing = shouldUseHubRing(sortedRoots.length, params.spineCount);
  const hubRingRadius = computeHubRingRadius(
    sortedRoots.length,
    params.spineSpacing / 2,
  );
  const rootIndexById = new Map(sortedRoots.map((id, index) => [id, index]));

  function placeParallelSpineRun(
    spineNodes: string[],
    angleRad: number,
    rootOffset: { x: number; y: number; z: number },
  ): void {
    spineNodes.forEach((spineNodeId, nodeIndex) => {
      const yAlongSpine = nodeIndex * params.spineSpacing;

      let spineAngleAtThisHeight = angleRad;
      if (spineTwist !== 0) {
        const twistRad = (spineTwist * (yAlongSpine / 100) * Math.PI) / 180;
        spineAngleAtThisHeight = angleRad + twistRad;
      }

      const x = useHubRing
        ? rootOffset.x
        : R * Math.cos(spineAngleAtThisHeight);
      const y = rootOffset.y + yAlongSpine;
      const z = useHubRing
        ? rootOffset.z + R * Math.sin(spineAngleAtThisHeight)
        : R * Math.sin(spineAngleAtThisHeight);

      graph.setNodeAttribute(spineNodeId, "x", x);
      graph.setNodeAttribute(spineNodeId, "y", y);
      graph.setNodeAttribute(spineNodeId, "z", z);
      seededPositions.set(spineNodeId, { x, y, z });
      allSeedPositions.set(spineNodeId, { x, y, z });

      if (nodeIndex === spineNodes.length - 1) {
        graph.setNodeAttribute(spineNodeId, "isEndpoint", true);
      }
    });

    spineNodes.forEach((spineNodeId, nodeIndex) => {
      const yAlongSpine = nodeIndex * params.spineSpacing;
      let spineAngleAtThisHeight = angleRad;
      if (spineTwist !== 0) {
        const twistRad = (spineTwist * (yAlongSpine / 100) * Math.PI) / 180;
        spineAngleAtThisHeight = angleRad + twistRad;
      }

      const spinePos = allSeedPositions.get(spineNodeId);
      if (!spinePos) return;

      const children = parentToChildren.get(spineNodeId);
      if (!children) return;

      const childArray = Array.from(children).sort();
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

      const axisAlternationSign = (nodeIndex % 2 === 0) ? +1 : -1;

      // L-001: the fronds hanging off THIS spine node split a wedge centred on straight-out
      // (φ=0). Bounded well clear of ±90°, where a branch would run along the spine itself.
      const fanArcRad = (params.directoryFanArc * Math.PI) / 180;

      fanOut(dirChildren, 0, fanArcRad).forEach((child) => {
        placeBranchRecursive(
          child.id,
          spinePos,
          child.centerAngle,
          child.angularExtent,
          0,
          axisAlternationSign,
          spineAngleAtThisHeight,
          yAlongSpine,
        );
      });

      if (fileChildren.length > 0) {
        const sortedFiles = fileChildren.slice().sort((a, b) => {
          const sa = (graph.getNodeAttributes(a) as any).rawSize ?? 0;
          const sb = (graph.getNodeAttributes(b) as any).rawSize ?? 0;
          return sa - sb;
        });

        const parentVisualSize = (graph.getNodeAttributes(spineNodeId) as any).size ?? 10;

        sortedFiles.forEach((fileId, fileIdx) => {
          const { radius, angleRad: theta } = computeFileOrbit(fileIdx, sortedFiles.length, parentVisualSize);
          // Same vertical-plane orbit as the frond files above — an x/z ring is edge-on to the
          // camera and collapses to a line. `theta` is an elevation now, not an azimuth, so the
          // spine's azimuth enters through cos/sin(spineAngleAtThisHeight), not by being added
          // to the orbit angle.
          const fileX = spinePos.x + radius * Math.cos(spineAngleAtThisHeight) * Math.cos(theta);
          const fileY = spinePos.y + radius * Math.sin(theta);
          const fileZ = spinePos.z + radius * Math.sin(spineAngleAtThisHeight) * Math.cos(theta);

          graph.setNodeAttribute(fileId, "x", fileX);
          graph.setNodeAttribute(fileId, "y", fileY);
          graph.setNodeAttribute(fileId, "z", fileZ);
          allSeedPositions.set(fileId, { x: fileX, y: fileY, z: fileZ });
        });
      }
    });
  }

  // Process each spine. Small/default graphs keep the legacy central-axis
  // placement; larger top-level sets offset each root run onto a deterministic ring.
  for (let spineIndex = 0; spineIndex < params.spineCount; spineIndex++) {
    const angleDeg = (spineIndex * 360) / params.spineCount;
    const angleRad = (angleDeg * Math.PI) / 180;
    const rootsForThisAxis = axes[spineIndex];

    if (useHubRing) {
      for (const rootId of rootsForThisAxis) {
        const allSpineNodes = flattenSpinesFromRoot(rootId, parentToChildren, graph);
        const rootIndex = rootIndexById.get(rootId) ?? 0;
        const rootOffset = computeHubRingPosition(rootIndex, sortedRoots.length, hubRingRadius);
        placeParallelSpineRun(allSpineNodes, angleRad, rootOffset);
      }
    } else {
      const allSpineNodes: string[] = [];
      for (const rootId of rootsForThisAxis) {
        allSpineNodes.push(...flattenSpinesFromRoot(rootId, parentToChildren, graph));
      }
      placeParallelSpineRun(allSpineNodes, angleRad, { x: 0, y: 0, z: 0 });
    }
  }

  placeUnseededNodesWithFallback(graph, allSeedPositions, seededPositions);

  // Store seeded positions for nodeReducer
  // Note: nodeReducer currently expects { x, y }; the z is dropped silently for now.
  // Future 3D camera will use a different interface.
  const positionsForReducer = new Map();
  seededPositions.forEach((pos, id) => {
    positionsForReducer.set(id, { x: pos.x, y: pos.y });
  });
  graph.setAttribute("__seededSpinePositions", positionsForReducer);
  graph.setAttribute("__gwellsSeedPositions", allSeedPositions);

}
