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
import { seedRadialBackbone } from "./seeders/radialBackbone";

export const GW_SEED_FUNCTION_REGISTRY: readonly GWSeedFunctionEntry[] = [
  {
    id: "gwells.seed.radial-backbone",
    label: "Radial Backbone",
    description:
      "Generalized N-spine radial layout. Spines emanate from a hub " +
      "at configurable angles with optional helical twist. Used by " +
      "horizontal-linear, vertical-parallel, helix-dual, and future " +
      "radial dialects.",
    status: "active",
    seed: (ctx) => seedRadialBackbone(ctx),
  },
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
