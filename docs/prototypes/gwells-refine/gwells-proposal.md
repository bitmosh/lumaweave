# Gwells Physics System — Generalization Proposal

Maps the current gwells architecture, identifies capability gaps, and proposes a generalized recomposable physics engine that scales from the current 2D codebase layouts to multi-dialect 3D rendering.

**Audited:** 2026-06-03  
**Status:** Proposal — pre-implementation

---

## 1. What the Current System Does

Gwells is a registry-driven force-simulation engine layered over Graphology/Sigma.js. It is not ForceAtlas2 or any packaged force layout — it is a custom composable system where well types, interaction forces, seed positions, and layout dialects are all registered independently and composed at runtime.

### Registry stack

| Registry | Role | Current count |
|---|---|---|
| **Well types** | Force profiles — defines how a node participates in physics | 4 |
| **Interactions** | Directional force rules between well types | 8 |
| **Seed functions** | Initial position algorithms (run once at startup or on override) | 2 |
| **Dialects** | Named bundles: seed function + well assignment + active interactions + config | 2 |

### Current well types

| ID | Role | Behavior |
|---|---|---|
| `spine-linear` | Backbone nodes | Pinned by seed; nodeReducer enforces position at render time |
| `directory-anchor` | Directory branches | Perpendicular to spine; sibling repulsion |
| `file-orbit` | Leaf files | Spring-attracts to parent directory; phyllotaxis orbit |
| `endpoint-fan` | Root-level files | Fan from spine endpoints; softer spring |

### Current force kinds

| Kind | Law | Notes |
|---|---|---|
| `attraction` | Constant pull | No distance decay |
| `repulsion` | Inverse-square | `strength / max(distSq × 0.01, 0.01)` |
| `spring` | Hooke (toward ideal distance) | Per-pair ideal distances, `requires` edge filter |
| `perpendicular` | Lateral deflection | Pushes node sideways relative to target; creates branching |
| `linear-alignment` | Documentary | Registered, strength=0, not used |

### Special per-frame forces

| Force | Parameter | Effect |
|---|---|---|
| Center gravity | `centerGravity` on well type | Pulls toward graph origin each frame; prevents drift |
| Seed-anchor | `seedAdherence` on well type | Spring toward seeded position; the "gravity well" that gives the system its name |

### Edge filters (relationship behavior)

| Filter | Meaning |
|---|---|
| `undefined` | Apply to all nodes of target well type |
| `"contains-parent"` | Target must be the node's direct parent |
| `"no-contains-parent"` | Target must NOT be the node's parent |
| `"shared-parent"` | Both nodes share the same parent |

### Coordinate system

The engine operates in 2D (x, y). The `parallel-spines` seed function computes and stores a `z` coordinate in `__gwellsSeedPositions` and graph node attributes, but `stepPhysics()` ignores it — z is never integrated, never force-accumulated. Sigma renders x, y only.

---

## 2. Current Capability Gaps

### 2.1 Well types are domain-coupled

The four well types encode the codebase graph structure — `spine-linear`, `directory-anchor`, `file-orbit`, `endpoint-fan`. A second graph domain (dependency graph, architecture diagram, git history, any non-filesystem source) must re-invent new well types from scratch with no shared primitives.

**What's missing:** Abstract base behaviors (`attractor`, `repeller`, `orbit-child`, `spine`, `free`) that domain-specific types can extend or compose.

### 2.2 Global scope only — no locality

All interactions apply everywhere in the graph, filtered only by edge structure. There is no radius-of-influence system. Repulsion with a `range` field exists in the interaction registry but `range` is used only as a soft falloff cap, not a hard locality boundary.

**What's missing:** True local scope — interactions that activate only within a radius, within a cluster boundary, or between nodes on the same "layer." The system has no concept of physics clusters, bounding regions, or spatial partitioning.

### 2.3 Relationship behavior is structurally limited

Edge filters recognize only the `contains` edge type (parent-child) and three structural patterns. All other edge types — `imports`, `calls`, `depends-on`, `references`, `co-changes` — are invisible to the physics engine.

**What's missing:**
- Edge-type discrimination (`requireEdgeType: "imports"`)
- Edge-weight forces (heavier import weight → stronger spring)
- Multi-hop relationship forces (attract nodes that are 2 hops apart more than 3+)
- Bidirectional vs. unidirectional force asymmetry

### 2.4 Force vocabulary is thin

Only five force kinds; three are actively used. Several force families common in physics layout engines are absent:

| Missing force | What it would enable |
|---|---|
| **Vortex / angular** | Nodes orbit an attractor at a target angular velocity (spiraling layouts, galaxy mode) |
| **Magnetic / field-line** | Nodes align along a field vector regardless of position |
| **Elastic collision** | Hard non-overlap guarantee; current system relies on repulsion alone |
| **Drag / viscosity** | Velocity damping proportional to speed (rather than per-well-type constant damping) |
| **Layer-plane constraint** | Attract node toward a specific z-plane (critical for 3D layered layouts) |
| **Charge accumulation** | Node's effective charge scales with descendant count or edge degree |
| **Temporal decay** | Force strength decays over simulation time (settle-and-release behavior) |

### 2.5 No mass or charge attributes on nodes

Every node participates in forces equally. A node with 500 descendants and a node with 0 are treated identically by the force accumulation loop. The visual size scaling in `computeNodeSize()` is computed but not fed back into physics as influence weighting.

**What's missing:** Per-node `mass` (inertia) and `charge` (influence strength) attributes, derived from `aggregateSize` or explicit metadata.

### 2.6 Seed functions are monolithic

Each seeder is one large pure function (~300 lines). There are no composable seed primitives — e.g., "place N nodes in a ring," "place N nodes in a grid," "scatter N nodes randomly within a bounding box" — that dialects could mix freely.

**What's missing:** A seed primitive library (`ring`, `grid`, `scatter`, `line`, `sphere`, `helix`) that seeders call, rather than reimplementing placement geometry from scratch.

### 2.7 No convergence detection or adaptive stepping

The engine runs `stepPhysics()` continuously via `requestAnimationFrame` until `stop()` is called. It never detects when the layout has settled (velocity below threshold) and does not reduce step rate for large graphs.

**What's missing:**
- Velocity-threshold convergence detection → auto-pause, resume on perturbation
- Adaptive step rate (large graphs: fewer fps, small graphs: full fps)
- Node-count LOD (limit force pair evaluations above a threshold)

### 2.8 Dialect transitions are abrupt

Switching dialects calls `stop()` on the old controller and `applyDialect()` fresh. Nodes jump to new seed positions immediately. There is no interpolation between states.

**What's missing:** Morphing mode — run old and new positions as a lerp for N frames before switching control to the new dialect's forces.

### 2.9 No soft-pin / elastic-pin tier

Pins are binary: pinned (fixed, no movement) or not pinned (full physics). There is no "sticky" middle tier where a node resists movement but can still be displaced by strong forces.

**What's missing:** `elasticPin` — a strong seed-adherence coefficient applied to user-pinned nodes rather than locking `fixed: true`. This lets the layout breathe around pinned nodes.

### 2.10 z-axis is dead weight

`parallelSpines` computes z; `engine.ts` never touches it. The `GWNodeState` type has no `vz`, no `fz`. If z is written into seed positions but not simulated, 3D layouts will be static along z — no force can adjust depth.

---

## 3. Generalization Strategy

The goal is to expand gwells from a codebase-graph layout engine into a general recomposable physics substrate that:

- Serves any graph domain through configuration, not code changes
- Supports global, local, and relationship-scoped behaviors independently
- Is forward-compatible with 3D rendering without breaking 2D dialects

The registry structure is already correct — the fix is extending what each registry entry can express, and filling in the engine's missing capabilities.

### 3.1 Behavior scopes (new concept)

Every interaction should declare a `scope` alongside its `requireEdge` filter:

```typescript
export type GWInteractionScope =
  | { kind: "global" }                            // current default — no locality
  | { kind: "radius"; r: number }                 // only activate within r units
  | { kind: "cluster"; clusterAttr: string }      // only between nodes sharing an attribute value
  | { kind: "layer"; layerAttr: string }          // only between nodes on the same layer
  | { kind: "cross-layer"; fromLayer: string; toLayer: string }  // only cross-layer, directional
```

This adds locality to every interaction without changing the engine loop structure — the loop checks scope before accumulating force.

### 3.2 Relationship behavior — edge-type and weight awareness

Extend `GWInteractionEntry` with:

```typescript
requireEdgeType?: string | string[];   // e.g., "imports" | ["imports","depends-on"]
edgeWeightAttr?: string;               // graph attribute to read as force multiplier
hopDepth?: number;                     // max graph distance to consider (default: 1)
directionality?: "both" | "source-to-target" | "target-to-source";
```

The engine loop already builds a `parentOfNode` map from edge traversal. Extending it to build per-edge-type adjacency maps (once at setup time) would enable this with minimal per-frame cost.

### 3.3 Abstract well type primitives

Introduce a `baseKind` field on `GWWellTypeEntry`:

```typescript
export type GWWellBaseKind =
  | "anchor"      // fixed/pinned — never moved by forces (current: spine-linear)
  | "attractor"   // pulls others toward it; itself moves freely
  | "orbiter"     // springs toward a parent attractor
  | "repeller"    // pushes others away; itself may be fixed or free
  | "free"        // no inherent role; only moved by explicit interactions
  | "cluster"     // group center — attracts its members, repels other clusters
```

Domain-specific types (`file-orbit`, `directory-anchor`, etc.) keep their IDs but declare a `baseKind`. The engine can use `baseKind` for default force fallbacks and future LOD optimizations.

### 3.4 New force kinds

Add to `GWForcekind`:

```typescript
| "vortex"            // angular force around a pivot node: perpendicular to (node→pivot)
| "layer-plane"       // attract toward z=targetZ (3D only; no-op in 2D)
| "charge-repulsion"  // repulsion scaled by node's effective charge attribute
| "elastic-drag"      // velocity damping proportional to speed² (not constant)
| "collision"         // minimum separation enforcement (hard floor on distance)
```

Each is a pure `(dx, dy, dz, params) → {fx, fy, fz}` function added to the force dispatch table in `stepPhysics()`. Existing force kinds are unchanged.

### 3.5 Per-node mass and charge

Add to graph node attributes (written by `buildGraphologyGraph`):

```typescript
__gwellsMass: number;    // inertia — defaults to 1.0, scales with aggregateSize
__gwellsCharge: number;  // force influence — defaults to 1.0, scales with degree
```

In `stepPhysics()`, scale acceleration by `1 / mass` (heavier nodes move less) and scale emitted force by `charge` (high-charge nodes push harder). Both are opt-in per dialect via a `useMassCharge: boolean` config flag so existing dialects are unaffected.

### 3.6 Seed primitive library

Create `src/physics/gwells/seedPrimitives.ts`:

```typescript
// Geometric placement primitives — seeders call these
export function placeRing(n, radius, cx, cy, cz?): {x,y,z}[]
export function placeGrid(n, cols, spacing, origin): {x,y,z}[]
export function placeHelix(n, radius, pitch, turns): {x,y,z}[]
export function placeLine(n, spacing, axis, origin): {x,y,z}[]
export function placeSphere(n, radius, center): {x,y,z}[]   // 3D
export function placePhyllotaxis(n, baseRadius, parent): {x,y,z}[]  // already implemented inline
```

Current seeders call these instead of embedding the geometry. New dialects (3D, grid, hierarchical-tree) compose from the same building blocks.

### 3.7 Convergence detection and adaptive stepping

In `engine.ts`, track max velocity per frame:

```typescript
const maxV = Math.max(...nodeStates.map(s => Math.hypot(s.vx, s.vy, s.vz ?? 0)));
if (maxV < config.convergenceThreshold ?? 0.5) {
  controller.pause();         // auto-settle
  graph.emit("gwells:settled");  // consumers can react
}
```

Resume on: node added/removed, dialect change, pin change, any `applyConfigOverride()` call.

Adaptive frame rate: if `nodeCount > 500`, run stepPhysics every other frame. If `> 2000`, every fourth frame.

### 3.8 Dialect morphing

Add to `GWController`:

```typescript
morphTo(targetDialectId: string, durationMs?: number): Promise<void>
```

Implementation: interpolate `__gwellsSeedPositions` from current to target dialect's seed output over `durationMs` frames, then hand off to the target dialect's forces. Uses the existing `applyConfigOverride()` mechanism, called once per frame with lerped seed params.

---

## 4. 3D Rendering — Stubs and Considerations

The `parallel-spines` dialect already stores `z` in seed positions — this is the right forward-compatibility move. The work to make 3D physics real is contained to `engine.ts` and a new renderer integration point.

### 4.1 Engine: add z-axis to stepPhysics

In `GWNodeState`, add:

```typescript
vz: number;   // z-velocity (0.0 by default in 2D dialects)
```

In `stepPhysics()`, extend force accumulation to include `fz` where the force kind supports it. Force functions that are inherently 2D (e.g., `perpendicular`) zero out `fz`. Force functions that are 3D-aware (`spring`, `repulsion`, `charge-repulsion`, `layer-plane`) compute full 3D vectors.

Distance computation becomes:

```typescript
const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);  // currently: Math.sqrt(dx*dx + dy*dy)
```

This is the single highest-impact change — it makes all force calculations aware of depth without restructuring the loop.

Position integration extends to:

```typescript
node.z = (node.z ?? 0) + state.vz;
```

Sigma's 2D renderer ignores `z`. The 3D renderer reads it.

### 4.2 New seed primitives needed for 3D

| Primitive | Use case |
|---|---|
| `placeSphere(n, r, center)` | Node clouds in 3D space |
| `placeHelix(n, r, pitch, turns)` | Spiral spine layouts |
| `placeCylinder(n, r, height)` | Column-based groupings |
| `placeLayer(n, z, arrangement)` | Flat planes at discrete z depths |

These stub into `seedPrimitives.ts` (section 3.6) alongside the 2D primitives.

### 4.3 New dialects for 3D

These can be registered now as placeholders with `status: "deferred"`:

| Dialect ID | Description | Seed primitive |
|---|---|---|
| `gwells.dialect.galaxy` | Nodes in a flattened sphere, cluster anchors as center masses | `placeSphere` + `placePhyllotaxis` |
| `gwells.dialect.layer-cake` | Nodes sorted into discrete horizontal planes by type/depth | `placeLayer` |
| `gwells.dialect.helix-spine` | Single spine as a helix; directories orbit along the helix's surface | `placeHelix` |
| `gwells.dialect.constellation` | Free-floating clusters, each a mini-galaxy; clusters repel | `placeSphere` per cluster |
| `gwells.dialect.dependency-gravity` | Nodes pulled toward dependents; cycles form rings | `placeRing` for detected cycles |

### 4.4 New force kind: layer-plane

Critical for layered 3D layouts — prevents nodes from drifting out of their assigned plane:

```typescript
// In stepPhysics() force dispatch:
case "layer-plane": {
  const targetZ = interaction.targetZ ?? 0;
  const dz = targetZ - (node.z ?? 0);
  fz += interaction.strength * dz;   // pulls node back to its layer's z
  break;
}
```

A 2D dialect sets `targetZ = 0` for all nodes — effectively a gravity-well into the z=0 plane. A layered 3D dialect assigns different `targetZ` per well type.

### 4.5 Camera and projection (renderer boundary)

Physics produces `(x, y, z)` per node. The 3D renderer owns:

- Camera position, look-at, FOV
- Projection transform (perspective or orthographic)
- Screen `(sx, sy)` from `(x, y, z)` + camera

Physics does **not** own camera or projection. The boundary is `graph.getNodeAttribute(id, "z")` — physics writes it, renderer reads it.

For the transition period: the existing Sigma 2D renderer reads only `x, y`. A 3D renderer (WebGL, Three.js, or Sigma's own 3D mode if it ships) would read all three. The engine produces all three regardless of renderer.

### 4.6 Depth-of-influence locality in 3D

In 3D, interaction radius (`scope.kind === "radius"`) should compute 3D distance:

```typescript
const dist3d = Math.sqrt(dx*dx + dy*dy + dz*dz);
if (dist3d > scope.r) continue;  // skip — outside influence radius
```

This naturally gives rise to "local physics clusters" — a node only feels forces from nearby neighbors, not from the entire graph. This is essential for performance in 3D with large node counts.

---

## 5. Recommended Sequencing

Ordered by impact vs. risk. Each row is independently shippable.

| # | Change | Scope | Impact | Prerequisite |
|---|---|---|---|---|
| **1** | Seed primitive library | New file, no engine change | Unlocks all new dialects | None |
| **2** | z-axis in stepPhysics (vz, fz, dist3d) | Engine only | Enables true 3D layouts | None |
| **3** | `layer-plane` force kind | Engine + wellTypes | 3D layered dialects work | #2 |
| **4** | Convergence detection | Engine only | Layout settles cleanly; no jank | None |
| **5** | Interaction scope system | Engine + interaction type | Locality, cluster physics | None |
| **6** | Edge-type and weight awareness | Engine setup + interaction type | Relationship-driven layouts | None |
| **7** | Per-node mass and charge | buildGraphologyGraph + engine | Realistic node weighting | None |
| **8** | Elastic-pin tier | Engine (applyPins) | Softer pinning UX | None |
| **9** | Deferred 3D dialect stubs | dialects.ts only | Nothing breaks; roadmap visible | #1, #2 |
| **10** | Dialect morphing | GWController | Smooth layout transitions | Convergence (#4) |

Items 1–4 are lowest risk (additive or self-contained), highest leverage, and are prerequisites for the rest. They can be done in a single pass without touching any existing dialect or consumer.

---

## 6. What Stays the Same

The generalization is purely additive — existing dialects, interactions, and seeders are untouched. The registry structure is already the right abstraction; the changes extend what entries can express, not how the registry works.

**Unchanged:**
- `applyDialect()` signature and return type (`GWController`)
- All four existing well types and their current behavior
- All eight existing interactions
- Both seed functions (radialBackbone, parallelSpines)
- Both active dialects
- `SigmaGraphView.tsx` integration points (no prop changes)
- Settings store schema for physics (extends naturally)
- `buildGraphologyGraph.ts` (z attribute addition is the only touch)
- Playwright probes and E2E test infrastructure

The engine's `stepPhysics()` loop gains new dispatch cases and the z-integration line; existing cases are unchanged. All existing dialects set `layer-plane` strength to 0 implicitly — new force kinds are opt-in via interaction entries.
