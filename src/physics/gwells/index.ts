/**
 * GWells — Public API
 *
 * v0 — Skeleton. applyDialect added in Pass C.
 *
 * Re-exports the registries, lookup helpers, types, and (eventually)
 * the engine entry point.
 */

// Types
export type {
  GWStatus,
  GWForceKind,
  GWWellTypeDefaults,
  GWWellTypeEntry,
  GWInteractionEntry,
  GWSeedFunctionContext,
  GWSeedFunctionEntry,
  GWWellAssignmentFn,
  GWWellAssignmentContext,
  GWWellAssignment,
  GWDialectConfig,
  GWDialectEntry,
  GWNodeState,
  GWPhysicsState,
  GWEngineConfig,
  GWRuntimeState,
  GWDebugEvent,
  GWStepResult,
  GWStepTimings,
  GWApplyDialectOptions,
  GWController,
} from "./types";

export { GW_ENGINE_DEFAULTS } from "./types";

// Well types
export {
  GW_WELL_TYPE_REGISTRY,
  getWellTypeById,
  listWellTypes,
  listWellTypesByStatus,
  listPinnedWellTypes,
} from "./wellTypes";

// Interactions
export {
  GW_INTERACTION_REGISTRY,
  getInteractionById,
  listInteractions,
  listInteractionsBySource,
  listInteractionsByTarget,
  listInteractionsByKind,
} from "./interactions";

// Seed functions
export {
  GW_SEED_FUNCTION_REGISTRY,
  getSeedFunctionById,
  listSeedFunctions,
  listSeedFunctionsByStatus,
} from "./seedFunctions";

// Dialects
export {
  GW_DIALECT_REGISTRY,
  getDialectById,
  listDialects,
  listDialectsByStatus,
  getDefaultDialect,
} from "./dialects";

// Structural resolver — added in C10A
export type {
  GWStructuralRole,
  GWStructuralNodeInfo,
  GWStructuralGraphInfo,
} from "./structuralResolver";

export {
  analyzeGraphStructure,
  getStructuralRole,
} from "./structuralResolver";

// Engine — added in Pass C
export { applyDialect } from "./engine";
