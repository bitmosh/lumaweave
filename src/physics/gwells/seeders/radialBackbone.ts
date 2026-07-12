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
import { resolveHelixTwist, buildContainsMap, flattenSpinesFromRoot, assignSpinesToAxes, computeFileOrbit, seedGenericFallbackLayout, placeUnseededNodesWithFallback, shouldUseHubRing, computeHubRingRadius, makeLeafCounter, subdivideWedge } from "../seederHelpers";

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
  /**
   * L-001: total angular width, in degrees, of the wedge a directory's children may fan into.
   * This is the "angular budget" — the thing whose absence caused every sibling directory to be
   * seeded at one identical point. Siblings split this wedge between them, weighted by leaf
   * count, so they occupy disjoint angular ranges and cannot overlap by construction.
   */
  directoryFanArc: number; // degrees
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
  directoryFanArc: 150,
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
    directoryFanArc:
      typeof raw.directoryFanArc === "number" ? raw.directoryFanArc : DEFAULTS.directoryFanArc,
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
  // L-001: shared with parallelSpines via seederHelpers — one implementation, not two.
  const countLeaves = makeLeafCounter(parentToChildren, (id) => {
    const t = graph.getNodeAttributes(id).nodeType || graph.getNodeAttributes(id).raw?.type;
    return t === "directory";
  });
  const fanOut = (ids: string[], centerAngle: number, extent: number) =>
    subdivideWedge(ids, centerAngle, extent, countLeaves);

  function placeBranchRecursive(
    dirId: string,
    parentPos: { x: number; y: number; z: number },
    centerAngle: number,      // L-001: the direction THIS directory extends from its parent
    angularExtent: number,    // L-001: the wedge this directory's own children may fan into
    depth: number,
    spineAxisAngle: number,   // angle of the spine this branch belongs to
    dHub: number,             // distance from hub for helix twist calculation
  ): void {
    // L-001: position is now a function of this node's OWN angle within its parent's wedge.
    //
    // It used to be a pure function of (parentPos, alternationSign, spineAxisAngle) with no
    // per-sibling term at all — so every sibling directory computed byte-identical coordinates
    // and 35 of them ended up in 4 coincident piles. Deeper levels were worse: a child inherited
    // its parent's direction verbatim, so a subtree was a straight ray, not a fan.
    const myX = parentPos.x + Math.cos(centerAngle) * params.directoryOffset;
    const myY = parentPos.y + Math.sin(centerAngle) * params.directoryOffset;
    const myZ = parentPos.z;

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

    // L-001: children split MY wedge between them, weighted by leaf count. Each gets its own
    // direction, so siblings fan out instead of collapsing onto one another. The wedge narrows
    // with depth (each child's share is a fraction of mine), which is what makes a subtree read
    // as a frond rather than a ray.
    fanOut(childDirs, centerAngle, angularExtent).forEach((child) => {
      placeBranchRecursive(
        child.id,
        { x: myX, y: myY, z: myZ },
        child.centerAngle,    // this child's own direction within my wedge
        child.angularExtent,  // the sub-wedge it may fan its own children into
        depth + 1,
        spineAxisAngle,
        dHub,
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
    const parentVisualSize = (graph.getNodeAttributes(dirId) as any).baseSize ?? 10;

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

  function placeSpineRun(
    spineNodes: string[],
    angleRad: number,
    rootOffset: { x: number; y: number; z: number },
    /**
     * L-001b: this root's slice of the GLOBAL angular budget — its own sector of the full circle,
     * and the direction it points away from the hub. Hub-ring mode only; undefined keeps the
     * legacy perpendicular frond used by the few-root spine layouts.
     */
    sector?: { centre: number; extent: number },
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

      // L-001: the root of the angular budget.
      //
      // A spine node's directory children fan into a wedge, and they subdivide it by leaf count so
      // they occupy disjoint arcs. Previously every child was handed one identical direction with
      // no wedge and no per-sibling term, which is what put 20 of src.control-plane's children on
      // a single point.
      //
      // L-001b — WHERE that wedge comes from, which is the half that was still wrong:
      //
      // The wedge used to be a flat `directoryFanArc` (150 degrees), centred perpendicular to the
      // spine, handed to EVERY root regardless of how many roots there were. The self-graph has 41
      // roots on the hub ring, so that allocated 41 x 150 = 6150 degrees of wedge out of a circle
      // that only has 360. The root wedges overlapped enormously and unrelated subtrees swept
      // straight through one another: `src.control-plane.system-index` and `src.graph` — different
      // subtrees entirely — were seeded 13 units apart, and their files collided at 7.
      //
      // The angular budget was only ever enforced WITHIN a parent. Across roots it was not
      // enforced at all, so sibling overlap was impossible while subtree overlap was routine.
      //
      // Now each root owns a disjoint sector of the full circle (leaf-count weighted, tiled
      // exactly — see subdivideWedge's minArc), and its descendants recursively subdivide only
      // that sector. Subtrees therefore cannot cross, for the same reason siblings cannot: they
      // own disjoint angular ranges by construction. The fan also points radially OUTWARD from the
      // hub rather than sideways across the ring, which is what makes the hierarchy read as
      // concentric rings of directories instead of a tangle.
      const axisAlternationSign = (nodeIndex % 2 === 0) ? +1 : -1;
      const directoryTwist = resolveHelixTwist(params.helixTwist, "directory");
      const twistRad = (directoryTwist * (dHub / 100) * Math.PI) / 180;

      let fanCentre: number;
      let fanArcRad: number;
      if (sector) {
        fanCentre = sector.centre + twistRad;
        // Never wider than the sector we own, and never wider than the configured fan.
        fanArcRad = Math.min(sector.extent, (params.directoryFanArc * Math.PI) / 180);
      } else {
        const perpAngle = angleRad + Math.PI / 2 + twistRad;
        // A negative sign means "fan out the other side of the spine" — i.e. rotate 180°.
        fanCentre = perpAngle + (axisAlternationSign < 0 ? Math.PI : 0);
        fanArcRad = (params.directoryFanArc * Math.PI) / 180;
      }

      fanOut(dirChildren, fanCentre, fanArcRad).forEach((child) => {
        placeBranchRecursive(
          child.id,
          spinePos,
          child.centerAngle,
          child.angularExtent,
          0,
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

        const parentVisualSize = (graph.getNodeAttributes(spineNodeId) as any).baseSize ?? 10;

        sortedFiles.forEach((fileId, fileIdx) => {
          // L-005: `angleRad` here is the orbit angle destructured from computeFileOrbit, which
          // SHADOWS placeSpineRun's `angleRad` (the spine's axis angle). The intent was to rotate
          // the orbit into the spine's frame — `orbitAngle + spineAxisAngle` — but shadowing made
          // it `orbitAngle + orbitAngle`, silently doubling the phyllotaxis angle. Renamed the
          // local so the two can no longer be confused. parallelSpines.ts:309 already did this
          // correctly.
          const { radius, angleRad: orbitAngle } = computeFileOrbit(
            fileIdx,
            sortedFiles.length,
            parentVisualSize,
          );
          const finalAngle = orbitAngle + angleRad;
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

  // L-001b: THE GLOBAL ANGULAR BUDGET.
  //
  // Divide the whole circle among the roots, weighted by leaf count, tiled exactly (minArc = 0 —
  // a floor here would over-allocate and reintroduce the very overlap this fixes). Each root then
  // owns one disjoint sector, sits on the hub ring at that sector's own bearing, and its entire
  // subtree recursively subdivides only what it owns. This is what makes subtree overlap
  // impossible by construction rather than something the simulation is expected to sort out.
  const rootSectors = new Map<string, { centre: number; extent: number }>();
  if (useHubRing) {
    subdivideWedge(sortedRoots, 0, Math.PI * 2, countLeaves, 0).forEach((s) => {
      rootSectors.set(s.id, { centre: s.centerAngle, extent: s.angularExtent });
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
        const sector = rootSectors.get(rootId);
        if (!sector) continue;

        // Sit the root on the ring at ITS OWN bearing, and run its spine radially outward along
        // the same bearing — so the root, its sector, and its subtree all point the same way.
        // (The ring position used to be evenly spaced by root INDEX while the subtree fanned
        // perpendicular to a shared axis, so a root's position and its children's direction had
        // nothing to do with each other.)
        const rootOffset = {
          x: hubRingRadius * Math.cos(sector.centre),
          y: hubRingRadius * Math.sin(sector.centre),
          z: 0,
        };
        placeSpineRun(allSpineNodes, sector.centre, rootOffset, sector);
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
