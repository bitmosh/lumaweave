/**
 * GWells — Seed Function Registry
 *
 * v0 — Skeleton. Entry added in Pass C.
 *
 * Catalog of initial-position computation functions. Seed functions
 * are pure (same input → same output) and run once before the
 * physics loop starts.
 *
 * Engine logic lives in engine.ts. This file is registry only.
 * Actual seed implementations live in ./seeders/<name>.ts.
 */

import type { GWSeedFunctionEntry, GWStatus } from "./types";

export const GW_SEED_FUNCTION_REGISTRY: readonly GWSeedFunctionEntry[] = [
  // Entries added in Pass C. Initial planned entry:
  //   - "gwells.seed.directory-backbone-n2" (variation B — end-to-end spine)
  //   Migrated from src/graph/physics/directoryBackboneSeeder.ts
] as const;

export function getSeedFunctionById(id: string): GWSeedFunctionEntry | undefined {
  return GW_SEED_FUNCTION_REGISTRY.find((e) => e.id === id);
}

export function listSeedFunctions(): readonly GWSeedFunctionEntry[] {
  return GW_SEED_FUNCTION_REGISTRY;
}

export function listSeedFunctionsByStatus(status: GWStatus): GWSeedFunctionEntry[] {
  return GW_SEED_FUNCTION_REGISTRY.filter((e) => e.status === status);
}
