// SPDX-License-Identifier: Apache-2.0
/**
 * GWells — Interaction Registry
 *
 * v0 — Skeleton. Entries added in Pass C.
 *
 * Defines how well types influence each other. Each entry is a
 * directional relationship (source → target) with a force kind.
 *
 * No engine logic here. Pure data + lookup helpers.
 */

import type { GWInteractionEntry, GWForceKind } from "./types";

export const GW_INTERACTION_REGISTRY: readonly GWInteractionEntry[] = [
  {
    id: "gwells.interaction.spine-linear.aligns.spine-linear",
    source: "gwells.well.spine-linear",
    target: "gwells.well.spine-linear",
    kind: "linear-alignment",
    strength: 0,
    status: "active",
    description:
      "Declares that spine nodes arrange linearly with each other. In v0, " +
      "this interaction is effectively documentary — the seed function pins " +
      "the spine, and the engine doesn't move pinned wells.",
  },
  {
    id: "gwells.interaction.directory-anchor.perpendicular.spine-linear",
    source: "gwells.well.directory-anchor",
    target: "gwells.well.spine-linear",
    kind: "perpendicular",
    strength: 0.3,
    range: 180,
    status: "active",
    requireEdge: "contains-parent",
    description:
      "Pulls directory anchors perpendicular to the spine axis. The seed " +
      "function provides the initial above/below assignment; this interaction " +
      "maintains the perpendicular alignment as the directory anchor moves to " +
      "balance sibling repulsion.",
  },
  {
    id: "gwells.interaction.directory-anchor.repels.directory-anchor",
    source: "gwells.well.directory-anchor",
    target: "gwells.well.directory-anchor",
    kind: "repulsion",
    strength: 1.0,
    range: 320,
    status: "active",
    description:
      "Sibling repulsion between directory anchors. The 320-unit range is " +
      "roughly 1.5× the perpendicular offset, ensuring repulsion is felt " +
      "even when two anchors are on opposite sides of the spine.",
  },
  {
    id: "gwells.interaction.file-orbit.springs.directory-anchor",
    source: "gwells.well.file-orbit",
    target: "gwells.well.directory-anchor",
    kind: "spring",
    strength: 1.0,
    idealDistance: 90,
    status: "active",
    requireEdge: "contains-parent",
    description:
      "The primary attractive force: files spring toward their parent " +
      "directory. The target identification uses the contains-edge from " +
      "the source adapter — files only spring to their actual parent.",
  },
  {
    id: "gwells.interaction.file-orbit.repels.file-orbit",
    source: "gwells.well.file-orbit",
    target: "gwells.well.file-orbit",
    kind: "repulsion",
    strength: 0.6,
    range: 140,
    status: "active",
    requireEdge: "shared-parent",
    description:
      "Sibling repulsion between files. Spreads files angularly around their " +
      "parent directory. The 140-unit range is wider than the orbit radius so " +
      "files in adjacent orbits also influence each other slightly.",
  },
  {
    id: "gwells.interaction.file-orbit.repels.directory-anchor-other",
    source: "gwells.well.file-orbit",
    target: "gwells.well.directory-anchor",
    kind: "repulsion",
    strength: 1.4,
    range: 180,
    status: "active",
    requireEdge: "no-contains-parent",
    description:
      "Anti-overlap force: files are repelled from directory anchors that " +
      "are not their parent. The strength is higher than file-sibling " +
      "repulsion because the failure mode is more visually damaging.",
  },
  {
    id: "gwells.interaction.endpoint-fan.springs.spine-linear-endpoint",
    source: "gwells.well.endpoint-fan",
    target: "gwells.well.spine-linear",
    kind: "spring",
    strength: 0.8,
    idealDistance: 100,
    status: "active",
    requireEdge: "contains-parent",
    description:
      "Endpoint fans spring toward the spine endpoint nodes — the " +
      "leftmost and rightmost spine nodes specifically. Target identification " +
      "uses the isEndpoint attribute on the spine node.",
  },
  {
    id: "gwells.interaction.endpoint-fan.repels.endpoint-fan",
    source: "gwells.well.endpoint-fan",
    target: "gwells.well.endpoint-fan",
    kind: "repulsion",
    strength: 0.7,
    range: 130,
    status: "active",
    requireEdge: "shared-parent",
    description:
      "Sibling repulsion within the fan, controlling the angular distribution " +
      "of root-level files at each endpoint.",
  },
] as const;

export function getInteractionById(id: string): GWInteractionEntry | undefined {
  return GW_INTERACTION_REGISTRY.find((e) => e.id === id);
}

export function listInteractions(): readonly GWInteractionEntry[] {
  return GW_INTERACTION_REGISTRY;
}

export function listInteractionsBySource(source: string): GWInteractionEntry[] {
  return GW_INTERACTION_REGISTRY.filter((e) => e.source === source);
}

export function listInteractionsByTarget(target: string): GWInteractionEntry[] {
  return GW_INTERACTION_REGISTRY.filter((e) => e.target === target);
}

export function listInteractionsByKind(kind: GWForceKind): GWInteractionEntry[] {
  return GW_INTERACTION_REGISTRY.filter((e) => e.kind === kind);
}
