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
  // Entries added in Pass C. Initial planned entries:
  //   - "gwells.well.spine-linear"       (pinned, arranges with siblings)
  //   - "gwells.well.directory-anchor"   (perpendicular from spine)
  //   - "gwells.well.file-orbit"         (radial around directory)
  //   - "gwells.well.endpoint-fan"       (loose files at spine tips)
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
