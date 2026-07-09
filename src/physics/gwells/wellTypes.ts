// SPDX-License-Identifier: Apache-2.0
/**
 * GWells — Well Type Registry
 *
 * v0 — Skeleton. Entries added in Pass C.
 *
 * Defines the catalog of well types available to dialects. Each
 * entry declares default physics parameters and pinning behavior.
 *
 * No engine logic here. Pure data + lookup helpers.
 */

import type { GWWellTypeEntry, GWStatus } from "./types";

export const GW_WELL_TYPE_REGISTRY: readonly GWWellTypeEntry[] = [
  {
    id: "gwells.well.spine-linear",
    label: "Spine (linear, pinned)",
    description:
      "A node on the spine backbone. Position is set by the seed function " +
      "and never moved by the engine. The nodeReducer in Sigma reads " +
      "__seededSpinePositions to enforce the pin at render time.",
    status: "active",
    pinned: true,
    defaults: {
      attractionStrength: 0,
      siblingRepulsion: 0,
      springStiffness: 0,
      damping: 1,
      idealDistance: 0,
      centerGravity: 0,
      seedAdherence: 0,
    },
  },
  {
    id: "gwells.well.directory-anchor",
    label: "Directory Anchor",
    description:
      "A directory node. Seeded perpendicular to the spine, alternating " +
      "above and below. Subject to sibling repulsion from other directory " +
      "anchors to prevent stacking along the spine axis.",
    status: "active",
    pinned: false,
    defaults: {
      attractionStrength: 0.15,
      siblingRepulsion: 250,
      springStiffness: 0.03,
      damping: 0.85,
      idealDistance: 460,
      centerGravity: 0.05,
      seedAdherence: 0.08,
    },
  },
  {
    id: "gwells.well.file-orbit",
    label: "File Orbit",
    description:
      "A file node orbiting its parent directory-anchor. Identifies the " +
      "parent through the contains-edge from the source adapter. Subject " +
      "to spring attraction to the parent and repulsion from siblings " +
      "(same parent) and from other directory anchors (anti-overlap).",
    status: "active",
    pinned: false,
    defaults: {
      attractionStrength: 0.15,
      siblingRepulsion: 100,
      springStiffness: 0.02,
      damping: 0.9,
      idealDistance: 360,
      centerGravity: 0.01,
      seedAdherence: 0.05,  // Tuned for Pass C7 drag-seed test (was 0.05)
    },
  },
  {
    id: "gwells.well.endpoint-fan",
    label: "Endpoint Fan",
    description:
      "A root-level file fanning outward from a spine endpoint. Identified " +
      "via attrs.isEndpoint set by the source adapter. Springs toward the " +
      "endpoint spine node with a wider ideal distance and lower stiffness " +
      "than file-orbit, producing a softer fan rather than tight orbit.",
    status: "active",
    pinned: false,
    defaults: {
      attractionStrength: 0.4,
      siblingRepulsion: 80,
      springStiffness: 0.05,
      damping: 0.9,
      idealDistance: 100,
      centerGravity: 0,
      seedAdherence: 0.08,
    },
  },
] as const;

export function getWellTypeById(id: string): GWWellTypeEntry | undefined {
  return GW_WELL_TYPE_REGISTRY.find((e) => e.id === id);
}

export function listWellTypes(): readonly GWWellTypeEntry[] {
  return GW_WELL_TYPE_REGISTRY;
}

export function listWellTypesByStatus(status: GWStatus): GWWellTypeEntry[] {
  return GW_WELL_TYPE_REGISTRY.filter((e) => e.status === status);
}

export function listPinnedWellTypes(): GWWellTypeEntry[] {
  return GW_WELL_TYPE_REGISTRY.filter((e) => e.pinned);
}
