# GWells v0.1.5 — Polish-to-Ship Implementation Brief

**Status:** Draft implementation brief  
**Purpose:** Convert the GWells realignment discussion into a tightly sequenced, ship-oriented implementation plan.  
**Intended location:** `lumaweave/docs/prototypes/gwells-refine/GWELLS_V0_1_5_POLISH_TO_SHIP_IMPLEMENTATION_BRIEF.md`  
**Supersedes for immediate implementation:** broad v0.2 planning as the next action item.  
**Does not supersede:** the v0.2 profile/family/macro-control design library.  
**Primary decision:** Ship-polish v0.1 first, while preserving seams for v0.2 profiles and future event-sourced layout history.

---

## 1. Executive summary

GWells should not begin with a full v0.2 profile-system implementation right now.

The immediate work should be a **v0.1.5 polish-to-ship arc**:

```txt
Make the current GWells engine stable, general enough, and visually reliable
for LumaWeave v1.0 / public demo use.
```

The v0.2 design remains valid, but it should be treated as the next architecture arc, not the current ship blocker.

The recommended path is:

```txt
Path A+:
  Polish GWells v0.1 to ship quality,
  but make every v0.1.5 pass create clean seams for v0.2 and ES-backed layout history.
```

This is neither a pure bugfix sprint nor a full architecture migration.

It is an orchestrated bridge.

---

## 2. Why this brief exists

The planning surface has become large:

```txt
v0.2 profile system docs
node family docs
layout matrix docs
seed layout docs
runtime docs
macro control docs
event sourcing toolkit roadmap
Claude realignment prompt
committee review
canonical GWells physics doc
```

All of that is useful, but not all of it belongs on the immediate critical path.

The immediate public-facing problem is:

```txt
GWells works acceptably on the current LumaWeave self-graph,
but it is buggy and weak on larger or more varied graph bodies.
```

That means the current arc should prioritize:

```txt
1. Better structural generality
2. Better opening seed layouts
3. Runtime correctness
4. Measured performance improvement
5. Minimal tuning hooks
6. Clean handoff into future v0.2 and ES integration
```

---

## 3. Non-negotiable goals

GWells v0.1.5 should ship when:

```txt
Existing radial-backbone still works.
Existing parallel-spines still works.
The engine handles non-filesystem-shaped graphs more gracefully.
Large top-level graph bodies do not collapse into an origin/crowding failure.
Orphan leaves do not sit at (0, 0) by accident.
Pause/stop/resume behavior is safe.
Seed-param overrides do not leave stale pair ideal distances.
Production console noise is removed.
Performance has at least a measured baseline and one low-risk optimization pass.
LumaWeave can expose minimal safe tuning controls.
```

---

## 4. Explicit non-goals for this arc

Do **not** implement these during v0.1.5 unless the plan is intentionally reopened:

```txt
Full v0.2 profile registry
Full node family map registry
Full recommendation matrix
Full composer UI
Full macro-control system
Event-sourcing toolkit integration
Barnes-Hut unless measurement proves it is required immediately
True 3D runtime activation
New speculative force families
Mutable public registration API
Standalone npm packaging pass
```

Some of those are valuable. They are simply not required for this polish-to-ship arc.

---

## 5. Architecture stance

### 5.1 Current model

Current GWells is built around:

```txt
wellTypes.ts
interactions.ts
seedFunctions.ts
dialects.ts
applyDialect(graph, dialectId, options)
```

A dialect currently bundles:

```txt
seed function
well assignment
active interactions
config overrides
```

That remains the immediate runtime model.

### 5.2 v0.1.5 model

v0.1.5 should add only the minimum generality needed to make existing dialects less hardcoded and more robust:

```txt
structural classification
seed layout polish
runtime lifecycle safety
performance baselines
minimal config/tuning seams
```

### 5.3 v0.2 model preserved

v0.2 remains the future system:

```txt
Profile
  -> Seed Layout
  -> Node Family Map
  -> Well Assignment Resolver
  -> Interaction Set
  -> Parameter Preset
  -> User Overrides
  -> applyDialect-compatible runtime
```

v0.1.5 should not implement this whole stack, but it should avoid decisions that fight it.

### 5.4 Event sourcing stance

The event-sourcing toolkit should eventually serve GWells as a **control-plane history layer**, not as the physics backend.

Event-source these later:

```txt
GraphLoaded
DialectApplied
SeedParamsChanged
WellOverridesChanged
InteractionOverridesChanged
NodePinned
NodeUnpinned
LayoutSettled
ProfileApplied
MacroControlChanged
```

Do **not** event-source these:

```txt
NodeMovedEveryFrame
VelocityUpdated
RepulsionApplied
SpringForceCalculated
```

v0.1.5 should keep ES integration out of scope but name meaningful action boundaries so future event streams are obvious.

---

## 6. Overall build sequence

The build should be sequenced as small, independently reviewable passes.

```txt
Pass C10A — Structural Resolver
Pass C10B — Legacy Well Assignment via Resolver
Pass C11A — Seed Layout Polish: Orphans + Root Handling
Pass C11B — Seed Layout Polish: Hub Ring for N >= 4
Pass C14A — Runtime Lifecycle Hygiene
Pass C14B — Reseed Cache Correctness + Debug Cleanup
Pass C12A — Benchmark Harness
Pass C12B — Cheap Performance Optimizations
Pass C13 — Parallel-Spines Inward Branching
Pass C15-lite — Minimal UI Tuning Hooks
Pass C16 — Merge Readiness + Documentation Closeout
```

The numbering intentionally keeps compatibility with the existing C10-C16 realignment language.

---

## 7. Pass C10A — Structural Resolver

### Goal

Replace fragile direct reliance on filesystem-style `nodeType` strings with a small structural classification layer.

This does **not** mean implementing the full v0.2 node-family taxonomy.

It means adding a v0.1.5 structural role resolver that can classify arbitrary Graphology nodes using topology and optional adapter hints.

### Motivation

Current well assignment relies heavily on values like:

```txt
spine
directory
file
doc
code
config
fixture
```

That works for LumaWeave’s current filesystem-shaped graph, but it does not generalize cleanly to Obsidian/Cerebra/Cypher/custom-JSON graph bodies.

### Proposed structural roles

```ts
export type GWStructuralRole =
  | "root"
  | "spine"
  | "container"
  | "leaf"
  | "orphan"
  | "hub"
  | "bridge"
  | "unknown";
```

### Proposed analysis shape

```ts
export interface GWStructuralNodeInfo {
  nodeId: string;
  explicitKind?: string;
  role: GWStructuralRole;
  depth: number | null;
  parentId?: string;
  childCount: number;
  inDegree: number;
  outDegree: number;
  totalDegree: number;
  hasContainsParent: boolean;
  hasContainsChildren: boolean;
  isEndpoint: boolean;
  confidence: number;
}
```

### New file

```txt
structuralResolver.ts
```

### Functions

```ts
export function analyzeGraphStructure(graph: Graph): GWStructuralGraphInfo;

export function classifyNodeStructurally(
  graph: Graph,
  nodeId: string,
  context: GWStructuralGraphInfo
): GWStructuralNodeInfo;

export function getStructuralRole(
  graph: Graph,
  nodeId: string,
  context?: GWStructuralGraphInfo
): GWStructuralRole;
```

### Classification rules

Start conservative:

```txt
If attrs.nodeType === "spine": role = spine
If node has no contains parent and has contains children: role = root/container
If node has contains children: role = container
If node has contains parent and no contains children: role = leaf
If node has no contains parent and no contains children: role = orphan
If node degree is unusually high: add hub flag or role = hub, depending on confidence
If node connects otherwise distant clusters: role = bridge, future refinement only
Else: unknown
```

### Keep explicit hints

Explicit adapter hints still matter.

Do not throw away:

```txt
attrs.nodeType
attrs.raw?.type
attrs.isEndpoint
attrs.rawSize
attrs.size
```

Instead, use them as hints, not the only source of truth.

### Acceptance criteria

```txt
Filesystem graph produces same or near-same assignments as before.
Non-filesystem fixture gets non-null roles.
Orphans are detected explicitly.
Unknowns are safe, not skipped silently.
No engine loop behavior changes yet.
```

### Tests

```txt
classifies explicit spine node as spine
classifies node with children as container
classifies node with parent and no children as leaf
classifies disconnected node as orphan
classifies high-degree node as hub candidate
empty graph does not crash
single-node graph becomes orphan or root safely
```

---

## 8. Pass C10B — Legacy Well Assignment via Resolver

### Goal

Route current dialect well assignment through the new structural resolver while preserving existing behavior.

### Current behavior

Current dialect assignment does approximately:

```txt
spine -> spine-linear
isEndpoint -> endpoint-fan
directory -> directory-anchor
file/doc/code/config/fixture -> file-orbit
else -> null
```

### New behavior

Use structural role first, explicit kind as fallback.

```ts
export function assignLegacyWellTypeFromStructure(
  info: GWStructuralNodeInfo,
  attrs: Record<string, unknown>
): string | null {
  if (info.role === "spine") return "gwells.well.spine-linear";
  if (info.isEndpoint) return "gwells.well.endpoint-fan";
  if (info.role === "container" || info.role === "root") return "gwells.well.directory-anchor";
  if (info.role === "leaf" || info.role === "orphan") return "gwells.well.file-orbit";
  return null;
}
```

### Important nuance

Orphan leaves should not be skipped. They should either:

```txt
A. attach to a synthetic/root anchor, or
B. receive file-orbit behavior with a fallback seed position.
```

For v0.1.5, option A is cleaner if implemented in the seeder. Option B is acceptable as a bridge.

### Files likely touched

```txt
structuralResolver.ts
dialects.ts
seederHelpers.ts
```

### Acceptance criteria

```txt
radial-backbone visual output remains recognizable.
parallel-spines visual output remains recognizable.
No broad visual regression on current self-graph.
Unknown/non-filesystem nodes no longer disappear by default.
```

### Tests

```txt
legacy filesystem nodeType mapping still resolves as before
structural-only graph resolves containers and leaves
orphan leaf receives a valid well type
well assignment does not throw on missing attrs.raw
```

---

## 9. Pass C11A — Seed Layout Polish: Orphans + Root Handling

### Goal

Fix accidental visual failure cases before adding more advanced layout features.

### Problems addressed

```txt
Orphan leaves at repo root can land at (0,0).
Graphs without spine roots can skip seeding.
Large mixed graphs can have unseeded nodes.
```

### Proposed behavior

Every active node should receive a finite seed position.

Add helper:

```ts
export function placeOrphanNodes(
  graph: Graph,
  orphanNodeIds: string[],
  options: GWOrphanPlacementOptions
): void;
```

### Placement strategy

For v0.1.5:

```txt
Place orphans in a small phyllotaxis/ring cloud near the graph perimeter,
not at origin.
```

Suggested default:

```txt
orphanAnchorRadius = max(existingGraphRadius * 1.15, 800)
orphanSpacing = based on node count and visual size
orphanAngleOffset = golden angle
```

### If no spine roots exist

Fallback:

```txt
Create virtual seed anchors internally.
Do not mutate graph with fake visible nodes unless deliberately chosen.
Place containers in a ring and leaves around nearest inferred container.
```

For v0.1.5, this can be simple:

```txt
If no spine roots:
  treat high-degree/root/container nodes as pseudo-spines for seeding.
```

### Acceptance criteria

```txt
No seeded active node remains at default (0,0) unless intentionally seeded there.
No active node lacks finite x/y after seeding.
Graphs with no explicit spine roots still get a sane fallback layout.
Orphan count is reported in debug diagnostics.
```

### Tests

```txt
repo-root orphan fixture receives finite non-origin position
single-node graph receives finite position
no-spine graph still seeds containers/leaves
orphan positions are deterministic
```

---

## 10. Pass C11B — Seed Layout Polish: Hub Ring for N >= 4

### Goal

Improve large-data display when many top-level subsystems exist.

### Problem

When there are many root spines/top-level subsystems, current layouts can crowd at or near a common origin/axis.

### Proposed behavior

When root/top-level group count is high:

```txt
Distribute top-level group origins on a ring.
Place each group’s internal spine/branch layout relative to its ring anchor.
Scale ring radius by group count and estimated group size.
```

### New helper

```ts
export function placeHubRing(
  groupIds: string[],
  options: GWHubRingOptions
): Map<string, { x: number; y: number; z?: number }>;
```

### Suggested options

```ts
export interface GWHubRingOptions {
  baseRadius: number;
  minRadius: number;
  maxRadius?: number;
  groupCount: number;
  averageGroupSize?: number;
  startAngleDeg?: number;
  useGoldenAngle?: boolean;
}
```

### Suggested formula

```txt
radius = clamp(
  baseRadius * sqrt(max(groupCount, 1) / 4) * groupSizeScale,
  minRadius,
  maxRadius
)
```

### Trigger

```txt
if topLevelGroupCount >= 4:
  use hub-ring mode
else:
  keep current radial/parallel behavior
```

### Important constraint

Do not destroy the two existing dialect identities.

```txt
radial-backbone should still feel radial.
parallel-spines should still feel parallel.
```

Hub-ring should improve their root distribution, not replace them with a totally new layout profile.

### Acceptance criteria

```txt
4+ top-level groups distribute around a ring.
30 top-level groups no longer crowd at origin.
400-node current graph remains visually acceptable.
1000-node synthetic graph is legible enough for smoke testing.
```

### Tests

```txt
hub ring returns deterministic positions
radius increases with group count
N=1/2/3 preserve legacy-ish behavior
N>=4 uses ring distribution
positions are finite
```

---

## 11. Pass C14A — Runtime Lifecycle Hygiene

### Goal

Make the current runtime safe before adding heavier tuning/control surfaces.

### Problems addressed

```txt
Paused loop still consumes requestAnimationFrame slots.
Resume can risk duplicate loops if not guarded.
Stop must be idempotent.
There is no runtime state introspection.
requestAnimationFrame is hardcoded.
```

### Recommended v0.1.5 scope

Do these now:

```txt
pause cancels RAF
resume schedules RAF only if needed
stop cancels RAF and is idempotent
runtime state is exposed
production console.log removed
```

Defer these unless easy:

```txt
full injectable scheduler
manual step API
headless Node execution
convergence detection
```

However, design the implementation so those later additions are easy.

### Runtime state

```ts
export type GWRuntimeState =
  | "running"
  | "paused"
  | "stopped"
  | "error";
```

### Controller additions

```ts
export interface GWController {
  stop(): void;
  pause(): void;
  resume(): void;
  getRuntimeState(): GWRuntimeState;
  getDialectId(): string;
  getResolvedConfig(): GWDialectConfig;
  applyConfigOverride(partialConfig: Partial<GWDialectConfig>): void;
  applyPins(pinMap: Record<string, { x: number; y: number; z?: number }>): void;
}
```

### Optional debug callback

```ts
export interface GWDebugEvent {
  type:
    | "applied"
    | "paused"
    | "resumed"
    | "stopped"
    | "seed-rerun"
    | "cache-rebuild"
    | "warning";
  message: string;
  data?: Record<string, unknown>;
}
```

Add to options:

```ts
onDebug?: (event: GWDebugEvent) => void;
```

### Acceptance criteria

```txt
pause() cancels pending RAF.
resume() creates one RAF loop, not many.
stop() can be called repeatedly without throwing.
resume() after stop() does not restart.
getRuntimeState() reports accurately.
No unconditional console.log in production path.
```

### Tests

```txt
pause cancels scheduled frame
resume after pause schedules one frame
stop cancels frame and clears gwells state
stop is idempotent
resume after stop is no-op
onDebug receives lifecycle event if provided
```

---

## 12. Pass C14B — Reseed Cache Correctness + Debug Cleanup

### Goal

Fix correctness issues around live config changes.

### Known issue

`pairIdealDistance` is built after initial seeding. When `applyConfigOverride({ seedParams })` re-runs the seed function, the pair ideal distances must be rebuilt too.

### Proposed change

Extract cache build helpers:

```ts
function buildParentOfNode(graph: Graph): Map<string, string>;

function buildPairIdealDistance(
  nodeStates: Map<string, GWNodeState>,
  parentOfNode: Map<string, string>,
  seedPositions: Map<string, { x: number; y: number; z?: number }> | null
): Map<string, number>;
```

Then, on seed-param override:

```txt
1. merge seed params
2. rerun seed function
3. rebuild parentOfNode if graph topology may have changed
4. rebuild pairIdealDistance
5. optionally zero velocities or damp them
6. emit debug event
```

### Velocity handling

For v0.1.5:

```txt
After seed-param override, multiply velocities by 0.25 or zero them.
```

Safer default:

```txt
zero velocities
```

Rationale: a seed-param override can move equilibrium positions drastically. Keeping old velocity can create a noisy jump.

### Acceptance criteria

```txt
Changing seedParams updates seed positions and pair ideal distances.
Springs settle around new seeded distances.
No stale pair distances after reseed.
No production console logs.
Debug events are optional and quiet by default.
```

### Tests

```txt
seed-param override rebuilds pairIdealDistance
seed-param override does not leave old ideal distances
velocity reset/damping happens after reseed
onDebug receives seed-rerun/cache-rebuild events
```

---

## 13. Pass C12A — Benchmark Harness

### Goal

Measure before optimizing.

### Why

GWells has known O(N²)-style pressure in the force loop. The first performance step should create a repeatable benchmark harness rather than jumping directly to Barnes-Hut.

### New benchmark fixtures

```txt
400-node current-like graph
1000-node synthetic hierarchy
2000-node synthetic hierarchy
5000-node stress graph
non-filesystem mixed graph
wide-root graph with 30 top-level groups
orphan-heavy graph
```

### Metrics

```txt
seed time
setup/cache build time
average stepPhysics time
p95 stepPhysics time
frames until visually settled, if convergence added later
nodes positioned
nodes skipped
non-finite force skips
interaction pair checks
force applications
```

### Suggested output

```txt
benchmarks/gwells-baseline.json
benchmarks/gwells-latest.json
```

### Acceptance criteria

```txt
Benchmark can run locally.
Benchmark does not require browser UI if possible.
At minimum, benchmark can be triggered from a dev/test command.
Numbers are stable enough to compare before/after.
```

### Tests/checks

```txt
benchmark fixtures build valid graphs
benchmark run does not crash
benchmark writes JSON summary
summary includes node count, edge count, seed time, average step time
```

---

## 14. Pass C12B — Cheap Performance Optimizations

### Goal

Take low-risk performance wins before deeper spatial indexing.

### Do first

```txt
Bucket nodes by wellTypeId per frame or per setup.
Avoid scanning all nodes for interactions whose target well type has no nodes.
Cache x/y positions for active nodes at frame start.
Avoid repeated graph.getNodeAttribute in inner loops where possible.
Track interaction pair-check counts in debug/benchmark mode only.
```

### Suggested internal structures

```ts
const nodesByWellType = new Map<string, string[]>();
```

Or, for larger optimization:

```ts
interface GWFrameNodeCache {
  nodeIds: string[];
  wellTypeIds: string[];
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  fixed: Uint8Array;
}
```

For v0.1.5, the safer first step is `nodesByWellType` plus limited local x/y caching. Full typed arrays can follow after tests.

### Avoid for now

```txt
Barnes-Hut implementation
quadtree approximation
worker-thread physics
full 3D typed array conversion
```

Unless benchmark results show that cheap optimizations cannot hit the target.

### Acceptance criteria

```txt
No visual behavior regression.
Step time improves or remains neutral.
Benchmark pair scans drop for typed interactions.
Code remains readable.
```

### Tests

```txt
node buckets include all active nodes
bucket rebuild happens after well assignment changes
missing target bucket skips interaction safely
physics positions remain finite after optimization
```

---

## 15. Pass C13 — Parallel-Spines Inward Branching

### Goal

Improve the second dialect’s visual behavior without turning it into a new layout system.

### Problem

Parallel-spines currently tends to branch outward, which can contribute to crowding and visual sprawl.

### Proposed params

```ts
export interface ParallelSpinesParams {
  branchDirection?: "outward" | "inward";
  flipFilesOutside?: boolean;
}
```

### Default recommendation

```txt
branchDirection: "inward"
flipFilesOutside: false initially
```

### Behavior

```txt
For first-level directories:
  inward = point branch direction toward central axis
  outward = current behavior

For files:
  either orbit around parent as today,
  or optionally flip outward away from central axis if enabled.
```

### Acceptance criteria

```txt
parallel-spines remains recognizable.
Inward branching reduces horizontal sprawl.
Existing default can be preserved if visual regression is too high.
Option is configurable via seedParams.
```

### Tests

```txt
inward branch direction moves directories toward central axis
outward branch direction preserves old behavior
flipFilesOutside is deterministic
positions finite for N=2 and N>=3
```

---

## 16. Pass C15-lite — Minimal UI Tuning Hooks

### Goal

Expose enough control in LumaWeave to tune ship visuals without building full v0.2 Composer Mode.

### Important boundary

This is mostly LumaWeave-side UI work, not a deep GWells internal refactor.

### Suggested controls

```txt
Spacing
Branch Distance
Seed Pull
Repulsion
Stability
Max Velocity
```

### Mapping to current config

```txt
Spacing:
  seedParams.spineSpacing
  seedParams.directoryOffset
  wellOverrides.file-orbit.idealDistance

Branch Distance:
  seedParams.directoryOffset

Seed Pull:
  wellOverrides.directory-anchor.seedAdherence
  wellOverrides.file-orbit.seedAdherence
  wellOverrides.endpoint-fan.seedAdherence

Repulsion:
  wellOverrides.directory-anchor.siblingRepulsion
  wellOverrides.file-orbit.siblingRepulsion
  interactionOverrides.*.strength for repulsion interactions

Stability:
  wellOverrides.*.damping
  engineConfig.maxVelocity

Max Velocity:
  engineConfig.maxVelocity
```

### UI philosophy

```txt
Expose 4-6 calm sliders.
Do not show raw registry IDs by default.
Use reset-to-default.
Do not call this the full profile system.
```

### Acceptance criteria

```txt
User can improve spacing without editing code.
Controls call applyConfigOverride or controlled dialect reapply.
Pins still work after tuning.
No duplicate physics loops from slider changes.
Reset restores defaults.
```

---

## 17. Pass C16 — Merge Readiness + Arc Close

### Goal

Close the GWells v0.1.5 polish arc cleanly.

### Required checks

```txt
typecheck passes
unit tests pass
GWells-specific tests pass
benchmark command runs
visual smoke checklist complete
current self-graph acceptable
wide-root graph acceptable
orphan-heavy graph acceptable
non-filesystem fixture acceptable
runtime pause/stop smoke pass
no production console spam
```

### Documentation updates

Update or create:

```txt
GWELLS_PHYSICS.md
GWELLS_V0_1_5_RELEASE_NOTES.md
GWELLS_V0_2_DEFERRED_DESIGN_INDEX.md
```

### Merge note

Before merging the feature branch:

```txt
Summarize what shipped in v0.1.5.
Summarize what remains deferred to v0.2.
Confirm ES toolkit integration is deferred.
Confirm no public API claims exceed reality.
```

---

## 18. Carefully orchestrated stop points

### Stop Point A — After C10B

Safe state:

```txt
Structural resolver exists.
Legacy dialects use it or can use it.
No major seed/engine changes yet.
```

Useful if:

```txt
Implementation needs to pause before visual seed changes.
```

### Stop Point B — After C11B

Safe state:

```txt
Seed layouts are more robust.
Orphans are placed.
Wide roots distribute better.
Current visual quality should be improved.
```

Useful if:

```txt
Need a visual demo improvement quickly.
```

### Stop Point C — After C14B

Safe state:

```txt
Runtime lifecycle is safer.
Config tuning is less likely to break equilibrium.
```

Useful if:

```txt
UI tuning is about to begin.
```

### Stop Point D — After C12B

Safe state:

```txt
Performance is measured.
Cheap optimizations are done.
Deeper optimization decision can be made from data.
```

Useful if:

```txt
Need to decide whether Barnes-Hut is required before ship.
```

### Stop Point E — After C16

Safe state:

```txt
GWells v0.1.5 is ship-polished.
Ready to merge and defer full v0.2.
```

---

## 19. Recommended commit grouping

```txt
commit 1: feat(gwells): add structural resolver
commit 2: refactor(gwells): route legacy well assignment through structure
commit 3: fix(gwells): seed orphan and no-spine graph nodes safely
commit 4: feat(gwells): add hub-ring root distribution for wide graphs
commit 5: fix(gwells): harden runtime pause stop resume semantics
commit 6: fix(gwells): rebuild seeded pair distances after reseed
commit 7: test(gwells): add layout fixtures and benchmark harness
commit 8: perf(gwells): reduce inner-loop scans with well-type buckets
commit 9: feat(gwells): add parallel-spines inward branching option
commit 10: feat(ui): expose minimal gwells tuning controls
commit 11: docs(gwells): document v0.1.5 shipped scope and v0.2 deferral
```

If time gets tight, commits 1-8 are the core. Commit 9 is visual polish. Commit 10 can be LumaWeave-side. Commit 11 is required before public ship.

---

## 20. Test fixture plan

### Fixtures needed

```txt
fixtures/gwells-empty.ts
fixtures/gwells-single-node.ts
fixtures/gwells-current-self-graph-like.ts
fixtures/gwells-wide-roots-30.ts
fixtures/gwells-orphan-heavy.ts
fixtures/gwells-no-spine-hierarchy.ts
fixtures/gwells-obsidian-like.ts
fixtures/gwells-cerebra-like.ts
fixtures/gwells-large-1000.ts
fixtures/gwells-large-5000.ts
```

### Minimum properties every fixture should validate

```txt
all active nodes receive finite x/y after seed
no active node has NaN velocity after step
no active node accidentally remains at origin unless expected
applyDialect returns a valid controller
pause/stop works
```

---

## 21. Visual smoke checklist

Run against:

```txt
current LumaWeave self-graph
wide-root synthetic graph
orphan-heavy graph
non-filesystem fixture
large 1000-node graph
parallel-spines graph
```

Check:

```txt
nodes visible
no origin pile-up
groups readable
orphan cloud readable
major containers/hubs recognizable
no runaway drift
pause/resume works
pin/unpin works
slider/tuning controls do not duplicate loops
no production console spam
```

---

## 22. Performance target

Recommended target for v0.1.5:

```txt
400 nodes:
  smooth and stable

1000 nodes:
  interactive enough for public demo

5000 nodes:
  measurable, not necessarily silky, but should not collapse or lock the app
```

If 5000 nodes is not achievable with cheap optimizations, document the honest envelope and defer Barnes-Hut/spatial indexing as v0.2/v0.3 performance work.

Do not claim 10K+ support unless benchmarks prove it.

---

## 23. Event-sourcing integration notes for later

Do not integrate the ES toolkit during this arc.

But make future integration easy by treating these as semantic actions:

```txt
apply dialect
change seed params
change well overrides
change interaction overrides
pin node
unpin node
pause runtime
resume runtime
settle layout
reset layout
```

Future adapter shape:

```txt
gwells-layout-history
  records semantic layout actions
  replays into GWController methods
  branches tuning experiments
  exports reproducible layout bug traces
```

The event-sourced state should be a **layout session**, not the graph’s per-frame physics state.

---

## 24. v0.2 seam preservation

v0.1.5 should avoid blocking these later v0.2 concepts:

```txt
profiles
seed layouts
node family maps
parameter presets
macro controls
recommendation scoring
selected-node overrides
detected-type overrides
family-wide remaps
```

Practical rules:

```txt
Use stable IDs for new options.
Do not hardcode UI labels into engine code.
Keep seed params serializable.
Keep structural classification separate from rendering.
Keep runtime actions replayable.
Do not make LumaWeave-specific imports inside gwells.
```

---

## 25. Implementation-agent instruction block

Use this when handing the work to Bandit/Claude:

```txt
You are implementing GWells v0.1.5 polish-to-ship.

Primary goal:
  Make current GWells ship-quality for LumaWeave v1.0 by improving structural generality,
  seed robustness, runtime lifecycle safety, and measured large-graph behavior.

Do not implement:
  Full v0.2 profile system.
  Full macro-control UI.
  Event-sourcing integration.
  3D runtime activation.
  Barnes-Hut unless benchmark results require it.

First pass:
  Add structuralResolver.ts.
  Add tests for root/container/leaf/orphan classification.
  Preserve current radial-backbone and parallel-spines behavior.
  Do not rewrite engine.ts in the first pass unless required by tests.

Second pass:
  Route legacy well assignment through structural classification.
  Keep explicit nodeType hints as compatibility inputs.
  Ensure orphan leaves receive a valid role and well assignment.

Third pass:
  Fix seed robustness: orphan placement, no-spine fallback, hub-ring for N >= 4.

Fourth pass:
  Runtime lifecycle hygiene: pause/stop/resume safety, no duplicate RAF, optional onDebug.

Fifth pass:
  Benchmark and cheap performance optimization.

Success criteria:
  Current layouts still work.
  Wide-root and orphan-heavy graphs display sanely.
  Runtime can be paused/stopped safely.
  Seed-param changes rebuild dependent caches.
  Performance envelope is measured and honestly documented.
```

---

## 26. Definition of done

GWells v0.1.5 is done when:

```txt
C10A complete
C10B complete
C11A complete
C11B complete
C14A complete
C14B complete
C12A complete
C12B complete or explicitly deferred with benchmark evidence
C13 complete or explicitly deferred
C15-lite complete or moved to LumaWeave UI arc
C16 docs/checks complete
```

And when the team can honestly say:

```txt
GWells is not finished forever,
but it is stable enough to carry LumaWeave's public first impression.
```

---

## 27. Guiding principle

Do not cross the river in one jump.

For v0.1.5:

```txt
Make the existing engine trustworthy.
Make the common bad layouts less bad.
Make tuning safe.
Measure before optimizing deeply.
Preserve the v0.2 runway.
```

For v0.2 later:

```txt
Turn the trustworthy engine into a profile-driven layout laboratory.
```
