// SPDX-License-Identifier: Apache-2.0
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
 * Algorithm and parameter spec: docs/canonical/GWELLS_PHYSICS.md (supersedes GWELLS_DIALECT_RADIAL_BACKBONE.md)
 *
 * Writes node x/y positions and __seededSpinePositions graph attr.
 * Deterministic: same input → same output.
 */

import type { GWSeedFunctionContext, GWHelixTwistRecord } from "../types";
import { resolveHelixTwist, buildContainsMap, flattenSpinesFromRoot, assignSpinesToAxes, computeFileOrbit, seedGenericFallbackLayout, placeUnseededNodesWithFallback, shouldUseHubRing, computeHubRingRadius, computeHubRingPosition } from "../seederHelpers";

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
    seedGenericFallbackLayout(graph);
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

  // NEW: Recursive directory placement (Pass C8 fern-frond)
  //
  // Places a directory and recursively all its descendants in the fern-frond shape.
  // depth=0 means this directory is a first-level branch off a spine — it gets
  // placed perpendicular to the spine axis. depth>0 means this directory is a
  // deeper descendant — it continues along the same outwardDir as its parent.
  function placeBranchRecursive(
    dirId: string,
    parentPos: { x: number; y: number; z: number },
    outwardDir: { dx: number; dy: number; dz: number },
    depth: number,
    alternationSign: number,   // Pass C8.4: renamed from siblingIndex; values +1 or -1
    spineAxisAngle: number,   // angle of the spine this branch belongs to
    dHub: number,             // distance from hub for helix twist calculation
  ): void {
    // Compute this directory's position.
    let myDir: { dx: number; dy: number; dz: number };
    if (depth === 0) {
      // First-level branch: alternate perpendicular up/down (or left/right for vertical spines).
      // Perpendicular to spine axis is spineAxisAngle + 90°.
      // Apply helix twist for depth=0 only.
      const perpAngleBase = spineAxisAngle + Math.PI / 2;
      const directoryTwist = resolveHelixTwist(params.helixTwist, "directory");
      const twistRad = directoryTwist * (dHub / 100) * Math.PI / 180;
      const perpAngle = perpAngleBase + twistRad;

      // Pass C8.4: use the passed alternation sign directly instead of computing from index
      myDir = {
        dx: Math.cos(perpAngle) * alternationSign,
        dy: Math.sin(perpAngle) * alternationSign,
        dz: 0,
      };
    } else {
      // Deeper level: continue along parent's outwardDir
      myDir = outwardDir;
    }

    const myX = parentPos.x + myDir.dx * params.directoryOffset;
    const myY = parentPos.y + myDir.dy * params.directoryOffset;
    const myZ = parentPos.z + myDir.dz * params.directoryOffset;

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
    // Pass C8.4: children inherit parent's alternation sign
    childDirs.forEach((cid) => {
      placeBranchRecursive(
        cid,
        { x: myX, y: myY, z: myZ },
        myDir,           // children continue along my direction
        depth + 1,       // depth advances
        alternationSign, // Pass C8.4: inherited — child uses parent's sign
        spineAxisAngle,  // unchanged
        dHub,            // unchanged (helix twist only at depth=0)
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
      const { radius, angleRad } = computeFileOrbit(fi, sortedFiles.length, parentVisualSize);
      
      // Apply helix twist if present (preserves existing twist behavior)
      const fileTwist = resolveHelixTwist(params.helixTwist, "file");
      const dDirectory = Math.sqrt(myX * myX + myY * myY);
      const fileTwistRad = fileTwist * (dDirectory / 100) * Math.PI / 180;
      const finalAngle = angleRad + fileTwistRad;
      
      const fx = myX + radius * Math.cos(finalAngle);
      const fy = myY + radius * Math.sin(finalAngle);
      const fz = myZ;
      graph.setNodeAttribute(fid, "x", fx);
      graph.setNodeAttribute(fid, "y", fy);
      graph.setNodeAttribute(fid, "z", fz);
      allSeedPositions.set(fid, { x: fx, y: fy, z: fz });
    });
  }

  const useHubRing = shouldUseHubRing(sortedRoots.length, params.spineCount);
  const hubRingRadius = computeHubRingRadius(
    sortedRoots.length,
    params.spineSpacing / 2,
  );
  const rootIndexById = new Map(sortedRoots.map((id, index) => [id, index]));

  function placeSpineRun(
    spineNodes: string[],
    angleRad: number,
    rootOffset: { x: number; y: number; z: number },
  ): void {
    const spineDirX = Math.cos(angleRad);
    const spineDirY = Math.sin(angleRad);

    spineNodes.forEach((spineNodeId, nodeIndex) => {
      const dHub = params.offsetFromHub + nodeIndex * params.spineSpacing;
      const spineX = rootOffset.x + dHub * spineDirX;
      const spineY = rootOffset.y + dHub * spineDirY;
      const spineZ = rootOffset.z;

      graph.setNodeAttribute(spineNodeId, "x", spineX);
      graph.setNodeAttribute(spineNodeId, "y", spineY);
      graph.setNodeAttribute(spineNodeId, "z", spineZ);
      seededPositions.set(spineNodeId, { x: spineX, y: spineY });
      allSeedPositions.set(spineNodeId, { x: spineX, y: spineY, z: spineZ });

      if (nodeIndex === spineNodes.length - 1) {
        graph.setNodeAttribute(spineNodeId, "isEndpoint", true);
      }
    });

    spineNodes.forEach((spineNodeId, nodeIndex) => {
      const dHub = params.offsetFromHub + nodeIndex * params.spineSpacing;
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
        if (childType === "directory") {
          dirChildren.push(childId);
        } else if (
          childType === "file" ||
          childType === "doc" ||
          childType === "code" ||
          childType === "config" ||
          childType === "fixture"
        ) {
          fileChildren.push(childId);
        }
      });

      const axisAlternationSign = (nodeIndex % 2 === 0) ? +1 : -1;

      dirChildren.forEach((childId) => {
        placeBranchRecursive(
          childId,
          spinePos,
          { dx: 0, dy: 0, dz: 0 },
          0,
          axisAlternationSign,
          angleRad,
          dHub,
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
          const { radius, angleRad } = computeFileOrbit(fileIdx, sortedFiles.length, parentVisualSize);
          const finalAngle = angleRad + angleRad;
          const fileX = spinePos.x + radius * Math.cos(finalAngle);
          const fileY = spinePos.y + radius * Math.sin(finalAngle);

          graph.setNodeAttribute(fileId, "x", fileX);
          graph.setNodeAttribute(fileId, "y", fileY);
          graph.setNodeAttribute(fileId, "z", spinePos.z);
          allSeedPositions.set(fileId, { x: fileX, y: fileY, z: spinePos.z });
        });
      }
    });
  }

  // Process each spine axis. Small/default graphs keep the legacy origin-based
  // placement; larger top-level sets offset each root run onto a deterministic ring.
  for (let spineIndex = 0; spineIndex < params.spineCount; spineIndex++) {
    const angleDeg = params.spineAngles[spineIndex];
    const angleRad = angleDeg * Math.PI / 180;
    const rootsForThisAxis = axes[spineIndex];

    if (useHubRing) {
      for (const rootId of rootsForThisAxis) {
        const allSpineNodes = flattenSpinesFromRoot(rootId, parentToChildren, graph);
        const rootIndex = rootIndexById.get(rootId) ?? 0;
        const rootOffset = computeHubRingPosition(rootIndex, sortedRoots.length, hubRingRadius);
        placeSpineRun(allSpineNodes, angleRad, rootOffset);
      }
    } else {
      const allSpineNodes: string[] = [];
      for (const rootId of rootsForThisAxis) {
        allSpineNodes.push(...flattenSpinesFromRoot(rootId, parentToChildren, graph));
      }
      placeSpineRun(allSpineNodes, angleRad, { x: 0, y: 0, z: 0 });
    }
  }

  placeUnseededNodesWithFallback(graph, allSeedPositions, seededPositions);

  // Store seeded positions as graph-level attribute for nodeReducer
  graph.setAttribute("__seededSpinePositions", seededPositions);
  graph.setAttribute("__gwellsSeedPositions", allSeedPositions);

}
