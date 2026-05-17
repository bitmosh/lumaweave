---
id: physics.gwells.contract
title: Gravity Well System Contract (gwells)
type: contract
status: current
version: v0.1
cluster: azure
domain: physics
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-16
references:
  - graph.contracts.sigma.lifecycle
  - contract.graph.first.runtime.mutation
  - contract.graph.runtime.boundary
  - graph.self.schema.v1
  - system.physics.dialects
  - concept.graph.cluster.gravity
  - physics.gwells.readme
  - physics.gwells.registry.patterns
  - physics.gwells.dialect.radial.backbone
  - physics.gwells.dialect.parallel.spines
tags: [physics, gwells, gravity-wells, contract, v0.1, layout]
---

# Gravity Well System Contract (gwells)

A typed gravity-well physics engine for structured graphology graph
layouts. This contract governs v0.1 — the second stable iteration.

## Purpose

Gwells is a force-based layout engine for graphology graphs. Unlike
generic force-directed algorithms (ForceAtlas2, force-directed graph
drawing), gwells treats nodes as instances of typed *wells* with
declared *interactions* between well types. Each well type carries
default physics parameters (attraction, repulsion, spring stiffness,
damping, ideal distance, and optionally centerGravity) and rules about which
other well types it perceives. A *dialect* bundles a seed function, a
node→well assignment, a subset of active interactions, and parameter
overrides into a single named layout configuration. Picking a dialect is what
a user does when they pick a layout.

The module is designed to be extracted as a standalone package
(`gwells`) with a single runtime dependency: `graphology`. All inputs
and outputs flow through the graphology graph API. The module has no
React, no Sigma, no theme tokens, no LumaWeave-specific awareness.

v0.1 ships with two dialects: `gwells.dialect.radial-backbone` (default,
horizontal layout) and `gwells.dialect.parallel-spines` (vertical side-by-side
layout matching the former FA2 dual-vertical visual).

## Allowed Behavior

Gwells implementations may:

1. Read all node and edge attributes from a graphology graph.
2. Mutate node `x`, `y`, and `z` attributes via
   `graph.setNodeAttribute(id, "x" | "y" | "z", value)`. The `z` coordinate
   is stored for forward-compatibility with 3D camera support; Sigma currently
   renders only x and y.
3. Read and write graph-level attributes scoped to gwells:
   `__gwellsState` (inspectable engine state, see Schema § Physics State)
   and `__seededSpinePositions` (seed-function output, read by Sigma's
   `nodeReducer` for spine pinning — this is a stable cross-system
   contract; the name does not change).
4. Run a per-frame physics loop via `requestAnimationFrame`.
5. Apply seed function output as initial positions.
6. Skip nodes marked pinned via well-type metadata, and additionally
   skip nodes carrying `fixed: true` (Sigma's drag-handler convention).
7. Layer additional forces (audio reactivity, idle jitter) on top of
   the base force loop via the `decoration` callback hook on
   `GWApplyDialectOptions`.
8. Expose lifecycle control via the returned `GWController` interface
   (`stop()`, `pause()`, `resume()`, `getDialectId()`,
   `getResolvedConfig()`).
9. Validate dialect configurations at startup and report invalid
   configurations via the `onError` callback. Fall back to a known
   default dialect (see Forbidden Behavior § dialect resolution) rather
   than crashing.
10. Write the resolved configuration (merged dialect defaults + runtime
    overrides) to `__gwellsState.config` on engine start so external
    consumers can inspect it.

## Forbidden Behavior

Gwells implementations must not:

1. Import any package other than `graphology` and its type packages
   (`graphology-types`).
2. Reference React, Sigma, theme tokens, or any LumaWeave-specific
   module, type, or constant.
3. Mutate any node attribute other than `x`, `y`, and `z`.
4. Mutate edges in any way (create, delete, set attributes).
5. Read or write `localStorage`, `sessionStorage`, IndexedDB, or any
   other browser storage.
6. Perform any network I/O (`fetch`, WebSocket, XHR, etc.).
7. Use `Math.random()` without a seed parameter. Deterministic jitter
   uses a hash of node ID; non-deterministic jitter is forbidden in v0.
8. Spawn workers or Web Workers in v0. Deferred to v1+ for performance.
9. Maintain hidden mutable singletons. All cross-frame state must live
   either in the per-controller closure or in the `__gwellsState`
   graph-level attribute.
10. Touch DOM, canvas, or any rendering API.
11. Throw uncaught errors during the physics loop. All errors must be
    caught and reported via the `onError` callback (or `console.warn`
    if no `onError` is provided).
12. Mutate `__gwellsState` from any caller other than the engine. The
    engine has exclusive write authority. External consumers (Graph
    Inspector Panel, debug overlays, validators) treat it as read-only.

### Dialect Resolution

When `applyDialect` is called with a `dialectId` that does not exist in
`GW_DIALECT_REGISTRY`, the engine must not crash. It must:

1. Log a warning via the `onError` callback (or `console.warn` if no
   callback is provided): `[gwells] unknown dialect '{id}', falling
   back to '{defaultId}'`.
2. Apply the registry-declared default dialect (the entry where
   `isDefault === true`; exactly one entry carries this flag).
3. Proceed with normal operation.

## Schema

### Well Type

A well type defines how a class of nodes participates in the physics
system. Each node in a graph is mapped to exactly one well type at
graph-build time (or `null`, which means the node is unaffected by
gwells).

```typescript
export type GWStatus =
  | "active"
  | "partial"
  | "planned"
  | "experimental";

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
  /** Per-frame pull toward the origin (0–0.1, optional). Added in v0.1. */
  centerGravity?: number;
}

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
```

### Interaction

An interaction declares how two well types influence each other.
Interactions are directional: `source → target`. Symmetric interactions
require two registry entries (one for each direction).

```typescript
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
```

**On composed forces.** Some intuitive concepts like "radial spread"
are deliberately not first-class force kinds. They are composed from
existing kinds:

- Radial spread = `spring` with a fixed ideal distance + `repulsion`
  between siblings of the same well type.

This keeps the force kind enumeration minimal and prevents semantic
overlap between named forces. Future versions may add new kinds only
when they cannot be expressed as compositions of existing ones.

### Seed Function

A seed function takes a graph and produces initial positions for all
nodes. Seed functions are pure (same input → same output) and run once
before the physics loop starts.

```typescript
export interface GWSeedFunctionContext {
  graph: Graph;
  /** Resolved configuration for this dialect. */
  config: GWDialectConfig;
}

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
```

Seed functions are also responsible for writing to
`__seededSpinePositions` for any node that should be pinned at the
seeded position. This is the stable cross-system contract that
Sigma's `nodeReducer` reads.

### Dialect

A dialect is the user-facing concept: a named bundle that says "use
this seed function, assign these node types to these wells, run these
interactions, with these parameter overrides."

```typescript
/** Predicate function that assigns a well type ID to a node. */
export type GWWellAssignmentFn = (
  nodeId: string,
  attrs: Record<string, unknown>
) => string | null;

export interface GWWellAssignment {
  /**
   * Given a node, returns the well type ID to assign.
   * Returning null skips the node (engine treats it as static).
   */
  assign: GWWellAssignmentFn;
}

export interface GWDialectConfig {
  /** Parameter overrides applied on top of well-type defaults. */
  wellOverrides?: Record<string, Partial<GWWellTypeDefaults>>;
  /** Strength/range/distance overrides for specific interactions. */
  interactionOverrides?: Record
    string,
    { strength?: number; range?: number; idealDistance?: number }
  >;
  /** Custom config values used by the seed function. */
  seedParams?: Record<string, unknown>;
  /** Note: In v0.1, seeders may include helixTwist as a GWHelixTwistRecord
   * object with keys {all, spine, directory, file} instead of a number.
   * See dialect documentation for details. */
}

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
```

### Physics State

The engine maintains live state under the graph-level attribute
`__gwellsState`. This attribute is intentionally inspectable: external
tools (Graph Inspector Panel, debug overlays, validators) may read it
to display physics state without touching engine internals.

```typescript
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
```

**Read access pattern:**

```typescript
const state = graph.getAttribute("__gwellsState") as GWPhysicsState | undefined;
const nodeState = state?.nodes.get(nodeId);
```

The engine resets `activeInteractions` to an empty array at the start
of each node's per-frame computation, then appends the interaction ID
whenever an interaction contributes force. Pinned nodes always have an
empty `activeInteractions` array.

External consumers must not mutate `__gwellsState`. Engine ownership
is exclusive.

### Engine API

The engine is the runtime entry point. It accepts a graph and a
dialect ID, validates the configuration, applies the seed function,
then starts the physics loop. Returns a `GWController`.

```typescript
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

export const GW_ENGINE_DEFAULTS: GWEngineConfig = {
  maxVelocity: 50,
};

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
   *
   * Added in v0.1 (Pass C4: Live Tuning Sliders).
   */
  applyConfigOverride: (partialConfig: Partial<GWDialectConfig>) => void;
}

export function applyDialect(
  graph: Graph,
  dialectId: string,
  options?: GWApplyDialectOptions
): GWController;
```

## Physics Loop Semantics

The engine runs continuously via `requestAnimationFrame`. There are no
phases — the same force equation applies from frame 1 to frame N.
Convergence emerges from damping, not from mode switching.

Per frame, for each non-pinned node:

1. Resolve the node's well type via the dialect's `wellAssignment`.
2. Reset the node's `activeInteractions` array to `[]`.
3. For each active interaction where this well type is `source`:
   a. Identify target nodes (via well type, parent relationship, or
      siblings — depending on interaction kind).
   b. Compute force contribution per target.
   c. Apply force to the node's accumulated velocity.
   d. Append the interaction ID to `activeInteractions`.
4. Apply damping to velocity.
5. Clamp velocity to `engineConfig.maxVelocity`.
6. Update position: `x += vx; y += vy`.
7. Update `lastSpeed = sqrt(vx² + vy²)`.

After all non-pinned nodes are updated:

8. Apply the `decoration` callback if provided.
9. Increment `__gwellsState.frame`.
10. Schedule the next frame.

Pinned nodes are skipped entirely in step 1. Their positions are set
by the seed function and never modified by the engine. Their
`__gwellsState` entry has `pinned: true`, `vx: 0`, `vy: 0`,
`lastSpeed: 0`, and `activeInteractions: []`.

Nodes carrying `fixed: true` (the Sigma drag-handler convention) are
also skipped, even if their well type is not pinned. This lets the
drag handler temporarily disable physics for the dragged node without
modifying gwells state.

## Seed Position Retention (v0.1, Pass C5)

Non-pinned wells (directory-anchor, file-orbit, endpoint-fan) now retain
layout intent via seed-position retention. This addresses the limitation
that seeded positions were previously treated as initial conditions only,
causing nodes to drift from their seeded layout within a few physics frames.

### Mechanism

Each seed function writes a graph-level attribute `__gwellsSeedPositions`
containing a `Map<nodeId, {x, y, z}>` of all node positions at seed time.
The engine reads this map in `stepPhysics` and applies a spring force:

```
f = seedAdherence × (seedPos - currentPos)
```

Where `seedAdherence` is a per-well-type parameter (default 0.05–0.20 for
non-pinned wells, 0 for pinned wells). The force pulls nodes toward their
seeded positions while still allowing other forces (repulsion, attraction,
centerGravity) to adjust positions. This preserves seeded layout intent
without preventing physics-driven refinement.

### Well Type Defaults Extension

`GWWellTypeDefaults` gains an optional field:

```typescript
export interface GWWellTypeDefaults {
  // ... existing fields ...
  /**
   * Per-frame spring force toward the node's seed position.
   * Values 0.05–0.20 are typical. 0 means no adherence.
   * Defaults to 0 if not specified.
   * Ignored for pinned well types.
   */
  seedAdherence?: number;
}
```

Default values (v0.1):
- `spine-linear` (pinned): 0
- `directory-anchor`: 0.15 (strong — retains helix twist)
- `file-orbit`: 0.05 (light — files spread freely)
- `endpoint-fan`: 0.08 (moderate)

### Graph Attribute Contract

Seed functions MUST write `__gwellsSeedPositions` as a graph-level attribute
with type `Map<string, {x: number, y: number, z: number}>`. This is
separate from `__seededSpinePositions` (which contains only pinned spine
nodes for Sigma's nodeReducer). `__gwellsSeedPositions` contains ALL
nodes and is used by the engine's seed-anchor force.

### Drag Handler Integration

When a user drags a node, the drag handler SHOULD update the node's seed
position in `__gwellsSeedPositions` on mouseup. This prevents the seed-
anchor force from pulling the node back to its original seeded position,
allowing the user's placement to become the new layout intent. The
integration point is in `SigmaGraphView.tsx`'s drag mouseup handler.

### Dialect Switching

When switching dialects, the seed function re-runs and overwrites
`__gwellsSeedPositions` with the new layout's seeded positions. The
seed-anchor force then pulls nodes toward the new seed positions,
enabling smooth dialect transitions while respecting each dialect's
layout intent.

## Edge-aware Interactions (Pass C7)

Interactions can declare structural requirements via the optional
`requireEdge` field on GWInteractionEntry. The engine builds a
`parentOfNode` lookup at applyDialect time from `contains` edges in
the graph, then filters target nodes in the force loop before
applying force.

Three filter values:

- `"contains-parent"`: the interaction only fires when the target
  has a `contains` edge to the source. In radial-backbone semantics:
  "this is the source's parent." Used for `file → its parent
  directory` spring force.

- `"no-contains-parent"`: the interaction only fires when the target
  does NOT have a `contains` edge to the source. Used for
  `file → all other directories` repulsion.

- `"shared-parent"`: the interaction only fires when source and
  target both have the same `contains`-parent. Used for sibling
  repulsion (`file → its siblings`).

If `requireEdge` is omitted (or undefined), the interaction fires
for all source-target well-type matches regardless of structural
relationship (legacy behavior, backward compatible).

The parent lookup is built once per applyDialect call. The filter
adds O(1) lookups per (source, target) pair in the per-frame force
loop.

## Per-pair Spring Distance (Pass C8.2)

For spring interactions with `requireEdge: "contains-parent"`, the engine
computes the spring's ideal distance from the source and target's seed
positions at applyDialect time rather than reading from the well-type
default. This ensures the spring agrees with the seeder's placement —
a file seeded at orbit radius 900 has a spring target distance of 900,
not the static well-type default.

The lookup map (`pairIdealDistance`) is built once per dialect application
from `__gwellsSeedPositions`. The spring force evaluation checks this map
first, falls back to interaction's static `idealDistance`, then to the
well-type default.

For dialects without contains-edge structure (e.g., non-radial dialects
in future work), the static defaults apply unchanged. Backward compatible.

## Evidence Required

For v0 acceptance:

### 1. Validation Script

`scripts/validate-gwells.mjs` exits 0 when:

- All registry entries have required fields.
- All interaction `source` and `target` IDs reference existing well-type IDs.
- All dialect `seedFunctionId` IDs reference existing seed-function IDs.
- All dialect `activeInteractions` IDs reference existing interaction IDs.
- No duplicate IDs in any registry.
- Exactly one dialect has `isDefault: true`.
- `damping` values are in `[0, 1]`.
- `springStiffness` values are in `[0, 1]`.
- `status` values are valid (`active | partial | planned | experimental`).
- `maxVelocity` is positive.

Exits 1 otherwise, with a clear failure report.

### 2. Smoke Test

`src/physics/gwells/__tests__/smoke.test.ts` covers:

- `applyDialect(graph, "gwells.dialect.end-to-end-spine")` runs without
  error on a fixture graph containing the LumaWeave self-graph data shape.
- After 60 frames, all non-pinned node positions are finite (no NaN, no
  Infinity).
- All pinned node positions exactly match what the seed function produced.
- `applyDialect(graph, "gwells.dialect.does-not-exist")` falls back to
  the default dialect without throwing.

### 3. Settings Migration Test

`tests/unit/settings-migrations.test.ts` (or equivalent) covers the
legacy-to-gwells settings migration:

- Legacy `physicsDialect: "helix"` → `dialectId:
  "gwells.dialect.end-to-end-spine"`.
- Legacy `physicsDialect: "solar-orbit"` → fallback default.
- Legacy `physicsDialect` field is removed from migrated state.
- Legacy FA2 slider fields (`linkDistance`, `repelForce`, etc.) are
  removed from migrated state.

### 4. Pre-Flight Standalone Typecheck

Before gwells is integrated into `SigmaGraphView`, the module must
typecheck cleanly in isolation:

```bash
cd src/physics/gwells
npx tsc --noEmit
```

If this fails, the module has acquired a LumaWeave dependency that
breaks its standalone-extractable property. The integration pass
(Pass D) does not begin until this passes.

### 5. Runtime Probe

In the browser after integration:

- Spines have non-zero, deterministic positions.
- Files orbit their parent spine within the configured distance range.
- Cross-cluster file separation is observable.
- The engine logs `[gwells] applied dialect '{id}'` to console on start.

### 6. Documentation Evidence

- This contract document exists and is referenced from
  `docs/operating-policies/SOURCE_OF_TRUTH.md`.
- `docs/physics/GWELLS_README.md` exists and orients new agents.
- `docs/physics/GWELLS_REGISTRY_PATTERNS.md` documents how the four
  registries compose.
- `docs/physics/GWELLS_DIALECT_RADIAL_BACKBONE.md` describes the
  radial-backbone seeder family and its initial dialects.
- A row for "Gwells Physics Engine" exists in
  `docs/control-plane/contracts/CONTRACT_TO_CODE_TRACE_MATRIX.md`.

## Forbidden Boundaries

Gwells must not cross these boundaries:

1. **No Sigma awareness.** Gwells does not import Sigma, does not
   reference Sigma types, and does not assume nodeReducer or any
   other Sigma feature exists. The integration layer (outside gwells)
   wires Sigma's nodeReducer to gwells' pinned-well declarations.

2. **No theme awareness.** Gwells does not read or write theme tokens,
   color values, or any visual properties beyond position.

3. **No edge mutation.** Gwells reads edges to discover relationships
   but never modifies them.

4. **No node creation or deletion.** Gwells only updates `x` and `y`
   attributes of existing nodes.

5. **No coupling between dialects.** Each dialect works without any
   other dialect being loaded. The runtime switches dialects
   atomically by calling `controller.stop()` then
   `applyDialect(graph, newId)`.

6. **No state leak outside `__gwellsState` and `__seededSpinePositions`.**
   All cross-frame state lives in `__gwellsState`. Seed-pinned positions
   for Sigma to consume live in `__seededSpinePositions`. No other graph
   attributes are touched.

7. **No audio coupling inside the module.** Audio reactivity reaches
   gwells only through the `decoration` callback. The module itself has
   zero audio awareness.

## Acceptance Criteria

v0 is "accepted" when:

1. The contract document exists and is referenced from source-of-truth.
2. All four registries (well types, interactions, seed functions,
   dialects) exist with at least the entries needed for the
   `end-to-end-spine` dialect.
3. `applyDialect(graph, "gwells.dialect.end-to-end-spine")` produces
   a visible two-half spine layout matching the variation B sketch
   (docs left half, src right half, single continuous spine axis,
   directories alternating perpendicular, files orbiting parents,
   endpoint fans at spine tips).
4. The validator script passes.
5. The smoke test passes.
6. The settings migration test passes.
7. The standalone typecheck passes.
8. The runtime probe (browser console + visual inspection) confirms
   finite positions and the expected console message.
9. The directory backbone seeder from prior work is migrated into
   gwells as a registered seed function and produces equivalent
   initial positions to its pre-migration form.
10. The legacy `edgeTypePhysicsRegistry` is removed from active code
    paths; its expressive role is now filled by gwells interactions.
11. No new TypeScript errors introduced anywhere in the codebase.
12. No regressions in unrelated Playwright tests.

## Non-Goals for v0

v0 deliberately does not include:

- **Helix dialects** (`spine-helical`, N=4+ rotation). Planned v0.2+.
- **Continuous-rotation helix** (`N=∞`). Planned v1+.
- **3D coordinates.** v0 uses only `x` and `y`. Adding `z` is a v2+
  schema change.
- **User-defined dialects.** v0 dialects are registry-only.
- **UI for dialect switching beyond a dropdown** or for parameter
  tweaking. v0 ships engine + registries; tunable-handle UI is a
  follow-up integration concern.
- **Web Worker performance optimization.** v0 runs on the main thread.
- **Force-graph layout algorithms** beyond what gwells provides
  (no FA2, no D3-force, no noverlap).
- **Cluster gravity / color-coded neighborhoods as a built-in
  dialect.** This is a future *consumer* of gwells, not a feature of
  gwells itself. See `docs/graph/intelligence/CLUSTER_GRAVITY_AND_COLOR_CODED_NEIGHBORHOODS.md`.
- **Standalone package extraction.** v0 lives inside LumaWeave at
  `src/physics/gwells/`. Package extraction is a v1 deliverable.
- **`frameBudgetMs` implementation.** Type is declared as experimental;
  engine behavior is unimplemented. Activated in v0.1+ only if
  frame-rate issues are observed.

## Module Boundary

src/physics/gwells/
├── package.json              [stub — for future extraction]
├── README.md                 [module-level README]
├── index.ts                  [public API surface]
├── types.ts                  [shared TypeScript types]
├── wellTypes.ts              [GW_WELL_TYPE_REGISTRY + helpers]
├── interactions.ts           [GW_INTERACTION_REGISTRY + helpers]
├── seedFunctions.ts          [GW_SEED_FUNCTION_REGISTRY + helpers]
├── dialects.ts               [GW_DIALECT_REGISTRY + helpers]
├── engine.ts                 [applyDialect, physics loop]
├── seeders/
│   └── directoryBackboneN2.ts  [migrated from src/graph/physics/directoryBackboneSeeder.ts]
└── tests/
└── smoke.test.ts         [smoke test]

The module's only external imports are `graphology` and `graphology-types`.
Pre-flight standalone typecheck (Evidence § 4) enforces this property.

## References

- [Registry Contract Patterns](protocol.registry.contract.patterns) — the
  standard ladder this module follows.
- [Self-Graph Schema](graph.self.schema.v1) — the data model gwells
  operates on.
- [Sigma Lifecycle Contract](graph.contracts.sigma.lifecycle) — gwells
  slots into the ACTIVE-to-ACTIVE mutate path; never recreates Sigma.
- [First Graph Runtime Mutation Contract](contract.graph.first.runtime.mutation)
  — the broader runtime mutation boundary gwells lives within.
- [Cluster Gravity and Color-Coded Neighborhoods](concept.graph.cluster.gravity)
  — future consumer of gwells.
- [Physics Dialect System](system.physics.dialects) — the dialect
  concept gwells implements.
- [Gwells README](physics.gwells.readme) — module orientation.
- [Gwells Registry Patterns](physics.gwells.registry.patterns) — how
  the four registries compose.
- [Radial Backbone Dialect Family](physics.gwells.dialect.radial.backbone)
  — the v0 seeder family spec.

## v0 Sign-Off Note

This contract reflects design decisions locked through the v86b/gwells
planning sessions of 2026-05-14 and 2026-05-15:

- Predicate-function well assignment (chose over declarative map for
  flexibility).
- Reading B continuous physics (same equation always; convergence from
  damping, not phase switching).
- Decoration callback for audio (audio stays outside the module).
- Level 2 inspector diagnostics (`activeInteractions` tracked per node
  per frame).
- Five force kinds, no `radial-spread` (composed from `spring` +
  `repulsion`).
- Global `maxVelocity` in engine config (not per-well-type).
- `__gwellsState` as the canonical inspectable state attribute.
- `__seededSpinePositions` preserved as the stable Sigma-facing
  attribute name.
- Dialect-not-found fallback (engine never crashes on unknown ID).
- Pre-flight standalone typecheck (Pass C does not advance to Pass D
  until module typechecks in isolation).
- `frameBudgetMs` kept as experimental type declaration, unimplemented
  in v0.

Acceptance requires operator review. No registries, engine, or seeders
should advance past Pass A scaffolding until this contract is signed
off.