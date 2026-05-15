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
  // Entries added in Pass C. Initial planned entries form the
  // directory backbone layout for end-to-end-spine dialect:
  //   - spine-linear ↔ spine-linear: linear-alignment
  //   - directory-anchor → spine-linear: perpendicular
  //   - directory-anchor ↔ directory-anchor: repulsion
  //   - file-orbit → directory-anchor: spring + attraction
  //   - file-orbit ↔ file-orbit (same parent): repulsion
  //   - file-orbit ↔ directory-anchor (non-parent): repulsion
  //   - endpoint-fan → spine-linear (endpoint): spring
  //   - endpoint-fan ↔ endpoint-fan: repulsion
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
