// SPDX-License-Identifier: Apache-2.0
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
import type { GWStructuralGraphInfo } from "./structuralResolver";

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
  /**
   * NEW (Pass C5): Per-frame spring force toward the node's seed position.
   *
   * Each non-pinned node remembers its last-seeded position in the
   * __gwellsSeedPositions graph attribute. Each frame, a spring force pulls
   * the node toward that seed: `f = seedAdherence × (seedPos - currentPos)`.
   *
   * Strength is the spring constant. Values 0.05–0.20 are typical: light
   * enough that other forces (repulsion, attraction) can still adjust
   * positions, strong enough to retain seeded layout intent.
   *
   * 0 means no adherence (pure physics, classical behavior).
   * Defaults to 0 if not specified.
   *
   * Ignored for pinned well types (the engine skips them entirely).
   */
  seedAdherence?: number;
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
  /**
   * Optional structural filter. If set, the engine only applies this
   * interaction between (source, target) node pairs that satisfy the
   * relationship:
   *
   * - "contains-parent": target has a `contains` edge to source
   *   (target is source's parent). E.g., file→its-parent-directory.
   * - "no-contains-parent": no `contains` edge from target to source
   *   (target is NOT source's parent). E.g., file→other-directories.
   * - "shared-parent": source and target both have the same
   *   `contains`-parent. E.g., sibling files.
   *
   * If omitted, the interaction fires for all well-type matches
   * (legacy behavior — backward compatible).
   *
   * Added in Pass C7.
   */
  requireEdge?: "contains-parent" | "no-contains-parent" | "shared-parent";
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
export interface GWWellAssignmentContext {
  graph: Graph;
  structure: GWStructuralGraphInfo;
}

export type GWWellAssignmentFn = (
  nodeId: string,
  attrs: Record<string, unknown>,
  context?: GWWellAssignmentContext
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
 * Current lifecycle state for a GWells controller.
 *
 * v0.1.5 keeps this intentionally small. Future profile/runtime work may add
 * idle, settled, or manual-step states without changing the existing meanings.
 */
export type GWRuntimeState = "running" | "paused" | "stopped" | "error";

/**
 * Optional diagnostic event emitted only when callers provide onDebug.
 */
export interface GWDebugEvent {
  type:
    | "applied"
    | "paused"
    | "resumed"
    | "stopped"
    | "seed-rerun"
    | "cache-rebuild"
    | "runtime-error"
    | "warning";
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Opaque handle returned by a GWells scheduler.
 *
 * Browser RAF returns a number, but headless/test schedulers may use strings or
 * objects. The engine only stores the handle and passes it back to cancel().
 */
export type GWFrameHandle = number | string | object;

/**
 * Scheduler used by the automatic GWells runtime loop.
 *
 * The browser default uses requestAnimationFrame when available. Headless
 * consumers can inject their own scheduler, or rely on manual controller.step()
 * calls when no browser scheduler exists.
 */
export interface GWScheduler {
  request: (callback: (timeMs: number) => void) => GWFrameHandle;
  cancel: (handle: GWFrameHandle) => void;
}

/**
 * Result from one synchronous physics step.
 */
export interface GWStepResult {
  stepsRun: number;
  movedNodeCount: number;
  maxVelocity: number;
  averageVelocity: number;
  warnings: string[];
  timings?: GWStepTimings;
}

/**
 * Coarse runtime attribution for one synchronous physics step.
 *
 * Values are milliseconds. These timings are intended for benchmark/debug
 * attribution, not stable performance assertions.
 */
export interface GWStepTimings {
  totalMs: number;
  resetMs: number;
  seedLookupMs: number;
  forceInteractionsMs: number;
  auxForcesMs: number;
  integrationMs: number;
}

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
  /** Optional quiet diagnostics for lifecycle/cache events. */
  onDebug?: (event: GWDebugEvent) => void;
  /** Optional scheduler for the automatic runtime loop. */
  scheduler?: GWScheduler;
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
  /** Run one synchronous physics step without scheduling animation frames. */
  step: () => GWStepResult;
  /** Get the current lifecycle state for this controller. */
  getRuntimeState: () => GWRuntimeState;
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
  /**
   * Apply pin overlay to the graph (Pass C9.1).
   *
   * Each entry in pinMap forces its node to fixed: true at the given
   * position; the position is also written into __gwellsSeedPositions
   * so the seed-anchor force won't pull it back. Nodes previously
   * pinned (tracked via graph attribute __gwellsPinnedSet, which
   * persists across controllers) but not in the new map are unfixed
   * and drift back via the existing seed-anchor force.
   *
   * Spine nodes are filtered out defensively — they cannot be pinned.
   *
   * Idempotent: calling with the same map twice is a no-op except for
   * redundant attribute writes.
   */
  applyPins: (pinMap: Record<string, { x: number; y: number; z?: number }>) => void;
}
