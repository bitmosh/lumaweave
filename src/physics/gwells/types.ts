/**
 * GWells — Shared Types
 *
 * v0 — Skeleton. Full contract types from GRAVITY_WELL_SYSTEM_CONTRACT.md.
 *
 * This file contains all shared TypeScript types used across the gwells module.
 * Types are exported for use by registry files and the engine.
 *
 * No engine logic lives in this file — only type definitions.
 */

// Default import for Graph from graphology (not named export)
import Graph from "graphology";

/**
 * Lifecycle status for registry entries.
 */
export type GWStatus =
  | "active"
  | "partial"
  | "planned"
  | "experimental";

/**
 * Force kind for interactions.
 */
export type GWForceKind =
  /** Pull source toward target (or its anchor). */
  | "attraction"
  /** Push source away from target. */
  | "repulsion"
  /** Hooke's law toward ideal distance. */
  | "spring"
  /** Arrange source nodes on a line with target. */
  | "linear-alignment"
  /** Source repelled along axis perpendicular to target. */
  | "perpendicular";

/**
 * Per-well-type helix twist record.
 *
 * Each key specifies twist in degrees per 100 units of distance from the hub
 * (or center axis for parallel-spines). All keys are optional. Missing keys
 * default to 0 (no twist).
 *
 * The `all` key, if set, applies to every well type as a baseline — individual
 * keys override `all` for their specific well type.
 *
 * Used as the `helixTwist` value in seedParams. Default value is `{}` (all zero).
 */
export interface GWHelixTwistRecord {
  /** Baseline twist applied to all well types if their specific key is not set. */
  all?: number;
  /** Twist applied to spine-linear nodes. Meaningful for parallel-spines seeder. */
  spine?: number;
  /** Twist applied to directory-anchor perpendicular angle. */
  directory?: number;
  /** Twist applied to file-orbit angle around parent. */
  file?: number;
}

/**
 * Default physics parameters for a well type.
 */
export interface GWWellTypeDefaults {
  /** Strength of attraction toward this well's anchor (0–10). */
  attractionStrength: number;
  /** Strength of repulsion from sibling wells of the same type (0–500). */
  siblingRepulsion: number;
  /** Spring stiffness for attraction force (0–1). */
  springStiffness: number;
  /** Per-frame damping factor (0–1, where 1 = no damping). */
  damping: number;
  /** Ideal distance from anchor (target distance for spring forces). */
  idealDistance: number;
  /**
   * Per-frame pull toward (0, 0, 0). Value is the strength of attraction
   * toward origin. 0 means no center gravity. Typical values: 0–0.1.
   * Useful for keeping non-spine nodes from drifting outward indefinitely.
   *
   * Defaults to 0 if not specified, for backward compatibility.
   */
  centerGravity?: number;
}

/**
 * Well type registry entry.
 */
export interface GWWellTypeEntry {
  /** Stable ID. Dot-path style: "gwells.well.<name>". */
  id: string;
  /** Human-readable label. */
  label: string;
  /** What this well type represents conceptually. */
  description: string;
  /** Lifecycle status. */
  status: GWStatus;
  /** Whether engine should skip moving nodes of this type. */
  pinned: boolean;
  /** Default physics parameters. May be overridden by dialect. */
  defaults: GWWellTypeDefaults;
}

/**
 * Interaction registry entry.
 */
export interface GWInteractionEntry {
  /** Stable ID. Dot-path style. */
  id: string;
  /** Source well type ID. */
  source: string;
  /** Target well type ID. */
  target: string;
  /** Force kind. */
  kind: GWForceKind;
  /** Force strength multiplier. */
  strength: number;
  /** Optional range cutoff (forces apply only within this distance). */
  range?: number;
  /** Optional ideal distance for spring/alignment forces. */
  idealDistance?: number;
  /** Lifecycle status. */
  status: GWStatus;
  /** Description of intent. */
  description: string;
}

/**
 * Context passed to seed functions.
 */
export interface GWSeedFunctionContext {
  graph: Graph;
  /** Resolved configuration for this dialect. */
  config: GWDialectConfig;
}

/**
 * Seed function registry entry.
 */
export interface GWSeedFunctionEntry {
  /** Stable ID. Dot-path style: "gwells.seed.<name>". */
  id: string;
  /** Human-readable label. */
  label: string;
  /** Description. */
  description: string;
  /** Lifecycle status. */
  status: GWStatus;
  /** Seed function. Mutates graph node x/y attributes. */
  seed: (ctx: GWSeedFunctionContext) => void;
}

/**
 * Predicate function that assigns a well type ID to a node.
 */
export type GWWellAssignmentFn = (
  nodeId: string,
  attrs: Record<string, unknown>
) => string | null;

/**
 * Well assignment bundle.
 */
export interface GWWellAssignment {
  /**
   * Given a node, returns the well type ID to assign.
   * Returning null skips the node (engine treats it as static).
   */
  assign: GWWellAssignmentFn;
}

/**
 * Dialect configuration overrides.
 */
export interface GWDialectConfig {
  /** Parameter overrides applied on top of well-type defaults. */
  wellOverrides?: Record<string, Partial<GWWellTypeDefaults>>;
  /** Strength/range/distance overrides for specific interactions. */
  interactionOverrides?: Record<
    string,
    { strength?: number; range?: number; idealDistance?: number }
  >;
  /** Custom config values used by the seed function. */
  seedParams?: Record<string, unknown>;
}

/**
 * Dialect registry entry.
 */
export interface GWDialectEntry {
  /** Stable ID. Dot-path style: "gwells.dialect.<name>". */
  id: string;
  /** Human-readable label. */
  label: string;
  /** Description. */
  description: string;
  /** Lifecycle status. */
  status: GWStatus;
  /**
   * Whether this dialect is the registry default. Exactly one entry
   * must carry isDefault: true. Used by dialect-not-found fallback.
   */
  isDefault: boolean;
  /** Seed function ID. */
  seedFunctionId: string;
  /** Maps nodes to well types. */
  wellAssignment: GWWellAssignment;
  /** Subset of interaction IDs that are active in this dialect. */
  activeInteractions: readonly string[];
  /** Parameter overrides. */
  config: GWDialectConfig;
}

/**
 * Per-node physics state.
 */
export interface GWNodeState {
  /** Resolved well type ID for this node. */
  wellTypeId: string;
  /** Whether this node is pinned (skipped by physics). */
  pinned: boolean;
  /** Current x velocity. */
  vx: number;
  /** Current y velocity. */
  vy: number;
  /** Magnitude of velocity from the previous frame. */
  lastSpeed: number;
  /**
   * Interaction IDs that contributed force to this node in the
   * previous frame. Reset and rebuilt each frame. Empty if no forces
   * fired. Used by the Graph Inspector Panel for Level 2 diagnostics
   * ("what's pulling this node where").
   */
  activeInteractions: string[];
}

/**
 * Engine physics state (stored in graph-level attribute __gwellsState).
 */
export interface GWPhysicsState {
  /** Currently running dialect ID. */
  dialectId: string;
  /** Frames elapsed since loop started (resets on stop/restart). */
  frame: number;
  /** Per-node physics state. */
  nodes: Map<string, GWNodeState>;
  /** Resolved configuration (dialect defaults merged with overrides). */
  config: GWDialectConfig;
}

/**
 * Engine configuration.
 */
export interface GWEngineConfig {
  /** Maximum velocity per node per frame. Prevents runaway motion. */
  maxVelocity: number;
  /**
   * Optional: frame-time budget for the engine. If a frame's physics
   * step takes longer than this many milliseconds, the next frame is
   * skipped. EXPERIMENTAL in v0: type is declared but engine behavior
   * is unimplemented. Promoted to active in v0.1+ if frame-rate
   * issues are observed.
   */
  frameBudgetMs?: number;
}

/**
 * Default engine configuration.
 */
export const GW_ENGINE_DEFAULTS: GWEngineConfig = {
  maxVelocity: 50,
};

/**
 * Options for applyDialect.
 */
export interface GWApplyDialectOptions {
  /** Global engine settings. Merged onto GW_ENGINE_DEFAULTS. */
  engineConfig?: Partial<GWEngineConfig>;
  /** Optional config overrides at runtime (layered on top of dialect config). */
  configOverride?: GWDialectConfig;
  /**
   * Optional decoration callback for audio/jitter forces.
   * Called once per frame, after the main physics step. Receives the
   * graph and the current frame number. May mutate node x/y.
   */
  decoration?: (graph: Graph, frame: number) => void;
  /** Error handler. Called for dialect-not-found and per-frame errors. */
  onError?: (error: Error) => void;
}

/**
 * Controller returned by applyDialect.
 */
export interface GWController {
  /** Stop the physics loop and clear __gwellsState. */
  stop: () => void;
  /** Pause the physics loop (positions held, __gwellsState retained). */
  pause: () => void;
  /** Resume after pause. */
  resume: () => void;
  /** Get the current dialect ID. */
  getDialectId: () => string;
  /** Get the current resolved config (dialect + overrides merged). */
  getResolvedConfig: () => GWDialectConfig;
  /**
   * Apply a runtime config override to the running dialect.
   *
   * Merges partialConfig into the controller's resolvedConfig in-place.
   * If partialConfig.seedParams is set, re-runs the seed function with the
   * merged config — node positions update visibly.
   * If partialConfig.wellOverrides is set, per-well-type parameters update on
   * the next frame.
   * If partialConfig.interactionOverrides is set, the interaction cache is
   * rebuilt and changes take effect on the next frame.
   *
   * Frame counter is NOT reset. Physics state is NOT recreated. This is the
   * ACTIVE → ACTIVE mutate path per the Sigma Lifecycle Contract.
   */
  applyConfigOverride: (partialConfig: Partial<GWDialectConfig>) => void;
}
