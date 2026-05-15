/**
 * GWells — Dialect Registry
 *
 * v0 — Skeleton. Entry added in Pass C.
 *
 * A dialect bundles a seed function, well assignment, active
 * interactions, and config overrides into a single named layout
 * configuration. Picking a dialect is the user-facing way to choose
 * a layout.
 *
 * No engine logic here. Pure data + lookup helpers.
 */

import type { GWDialectEntry, GWStatus } from "./types";

export const GW_DIALECT_REGISTRY: readonly GWDialectEntry[] = [
  // Entry added in Pass C. Initial planned entry:
  //   - "gwells.dialect.end-to-end-spine" (variation B from sketches)
  //     isDefault: true (only dialect carrying the default flag)
] as const;

export function getDialectById(id: string): GWDialectEntry | undefined {
  return GW_DIALECT_REGISTRY.find((e) => e.id === id);
}

export function listDialects(): readonly GWDialectEntry[] {
  return GW_DIALECT_REGISTRY;
}

export function listDialectsByStatus(status: GWStatus): GWDialectEntry[] {
  return GW_DIALECT_REGISTRY.filter((e) => e.status === status);
}

export function getDefaultDialect(): GWDialectEntry | undefined {
  return GW_DIALECT_REGISTRY.find((e) => e.isDefault);
}
