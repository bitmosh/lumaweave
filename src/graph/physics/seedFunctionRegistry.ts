/**
 * Seed Function Registry
 *
 * Canonical registry for graph layout seed functions.
 * Seed functions provide deterministic initial node positions before FA2 runs.
 *
 * Follows REGISTRY_CONTRACT_PATTERNS.md: const array + helper functions, no classes.
 */

import type Graph from "graphology";

export interface SeedFunctionContext {
  graph: Graph;
  settings?: {
    nodeSize?: number;
    linkDistance?: number;
    repelForce?: number;
    centerForce?: number;
    physicsDialect?: "default" | "helix" | "solar-orbit";
  };
}

export interface SeedFunctionEntry {
  id: string;
  title: string;
  category: string;
  status: "active" | "experimental" | "deprecated";
  description: string;
  seed: (ctx: SeedFunctionContext) => void;
}

/**
 * Canonical registry of seed functions.
 * Read-only const array following registry contract pattern.
 */
export const SEED_FUNCTION_REGISTRY: readonly SeedFunctionEntry[] = [
  {
    id: "directory-backbone-n2",
    title: "Directory Backbone N2",
    category: "directory",
    status: "active",
    description: "Deterministic layout for directory spine nodes with two backbones (src, docs) side-by-side, spines stacked alphabetically along vertical axes, file children orbiting parent spines.",
    seed: () => {
      // Implemented in directoryBackboneSeeder.ts as seedDirectoryBackboneN2
      // Entry here for registry completeness; actual function imported and bound at call site
      throw new Error("seedDirectoryBackboneN2 must be imported from directoryBackboneSeeder.ts");
    },
  },
  // Future entries (planned):
  // - "circular-cluster": radial layout by cluster
  // - "grid-tiered": hierarchical grid layout
  // - "force-directed-approx": approximate force-directed seeding
] as const;

/**
 * Get seed function entry by ID.
 */
export function getSeedFunctionById(id: string): SeedFunctionEntry | undefined {
  return SEED_FUNCTION_REGISTRY.find((entry) => entry.id === id);
}

/**
 * List all seed functions.
 */
export function listSeedFunctions(): readonly SeedFunctionEntry[] {
  return SEED_FUNCTION_REGISTRY;
}

/**
 * List seed functions by category.
 */
export function listSeedFunctionsByCategory(category: string): readonly SeedFunctionEntry[] {
  return SEED_FUNCTION_REGISTRY.filter((entry) => entry.category === category);
}
