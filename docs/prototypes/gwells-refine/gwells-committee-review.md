# Gwells Physics Engine — Committee Review

**Synthesized:** 2026-06-03  
**Replaces:** `gwells-proposal.md` as working design reference for the generalization effort  
**Status:** Actionable — pre-implementation

---

## 1. Committee Verdict

The proposal is technically coherent in its direction but systematically underestimates the depth of the portability gap. The engine layer (`engine.ts`) is genuinely extensible and the additions proposed are largely additive — that part of the proposal earns its "additive, nothing breaks" framing. The proposal fails, however, on the two layers beneath the engine: the registries are sealed static arrays with no external registration API, and the seed functions are monolithic domain-coupled algorithms that encode the LumaWeave codebase model at every call site. A consumer with any other graph domain cannot use either. The claim in Section 6 that "existing dialects, interactions, and seeders are untouched" and "the registry structure is already correct" is accurate only as a description of backward compatibility — it is not a description of forward portability. Standalone-module quality requires three foundational structural changes (injectable scheduler, mutable registration API, configurable hierarchy traversal) before any of the new force kinds or scope system have standalone value. The proposal's recommended sequencing does not reflect this — it leads with additive engine work while leaving the portability blockers unaddressed.

---

## 2. Panel Score Summary

| Panelist | Role | Score | One-line verdict |
|---|---|---|---|
| Physics Engine Architect | Force law correctness, integration quality | 5/10 | Solid NaN hygiene and registry architecture; three showstopper physics flaws (no dt, O(N²), constant-magnitude attraction) block standalone credibility |
| API & Developer Experience Architect | API surface, portability, DX | 3/10 | GWController lifecycle is clean but the module is browser-only, registries are closed, seeders are LumaWeave-specific — not a drop-in package |
| 3D Graphics & Rendering Engineer | 3D forward-compatibility | 5/10 | Seeder geometry is already 3D-correct but the integrator is 2D-only; the perpendicular force has no 3D generalization and the z-axis is a false affordance |
| Graph Layout Theory Specialist | Force vocabulary, layout theory | 5/10 | Seed+simulation split is a genuine algorithmic win; edge-type blindness and domain-coupled well types are the primary barriers to standalone use |
| Devil's Advocate | Stress-testing every assumption | 3/10 | Proposal direction is right but seeds are irreversibly domain-coupled, registries are structurally closed, and the morphing sketch has a real runtime bug |

**Committee average: 4.2/10.** Direction approved. Sequencing and scope require revision.

---

## 3. Confirmed Strengths

These are non-trivial design decisions that held up under review from multiple angles. They are not obvious and should be preserved.

### 3.1 NaN propagation defense is production-grade

Three independent panelists (Physics, DX, Theory) called out the NaN guard discipline. The engine has three layered defenses: pre-integration `Number.isFinite` check on accumulated forces (skip integration for the frame), a `MAX_SAFE_VELOCITY = 10000` structural clamp that never engages during normal physics but prevents the `Infinity → NaN` cascade, and a post-integration `isFinite` check before writing position back to the graph. This is the correct approach — one bad node cannot corrupt the whole graph. No changes recommended here.

### 3.2 Registry composition is the right architecture — at the engine layer

The four-registry model (well types, interactions, seed functions, dialects) with runtime composition via `applyDialect()` is the right abstraction. The `applyDialect()` resolver merging interaction overrides at setup time (not per-frame) is correct. Force authors can iterate without touching layout logic; layout authors can swap dialects without touching force logic. **The architecture is right; the implementation (sealed static arrays) is wrong for standalone use.** Preserving the four-registry model while making registries mutable is the correct path — not abandoning it.

### 3.3 Per-pair seeded ideal distances for springs

Computing spring rest lengths from actual 3D seeded positions rather than a static well-type constant is elegant and physically correct. The seeder's intent and the physics engine's equilibrium agree by construction. This is the kind of refinement that only appears after real debugging cycles. It is the correct approach and should be extended to full 3D distance (`sqrt(dx²+dy²+dz²)`) when z-axis integration is added — not replaced.

### 3.4 Phyllotaxis orbit placement

Using the golden-angle (≈137.508°) phyllotaxis spiral for file placement around directory anchors guarantees non-overlap by construction without a collision-detection pass, produces organic distribution, and scales from 1 to 100+ children. The `computeOrbitRadius` `sqrt`-scaling (orbit area grows linearly with file count) is also correct and non-obvious — many DIY implementations get this wrong. This should be extracted into the seed primitive library as `placePhyllotaxis()`.

### 3.5 Seed + simulation split

Front-loading structural knowledge as initial conditions and using physics as a refinement pass — rather than relying on forces alone to find layout from random positions — is a genuine algorithmic advantage over pure force-directed engines. It produces faster convergence, avoids local minima for known-structure graphs, and makes layout intent explicit. This is the right model. The proposal correctly identifies the decomposition. The gap is making the seeder layer configurable rather than hard-coded.

### 3.6 `seedAdherence` as a continuous spring anchor

The seed-anchor force (pulling nodes toward their seeded positions each frame) is a first-class primitive, not a hack. It has direct analogs in Gephi's pin mechanism and D3's `forceX/forceY`. The gwells version is correctly continuous (a spring, not a lock), meaning it can be overridden by stronger forces. The infrastructure already exists. The two gaps are: (1) it ignores `z` and must be extended when z-axis integration lands, and (2) it needs a "free physics" opt-out mode so consumers who want classic force-directed convergence can disable it globally.

---

## 4. Consensus Gaps

Gaps independently identified by two or more panelists. These are the real problems. They are ordered by how many panelists raised them, then by severity within ties.

### 4.1 requestAnimationFrame hard-dependency — browser-only

**Severity: Critical** | **Panelists: Physics, DX, 3D, Devil's Advocate (4/5)**

`engine.ts` calls `requestAnimationFrame` unconditionally at three call sites with no guard, no fallback, no injectable alternative. Any consumer running gwells in Node.js (server-side layout pre-computation, CLI tools, CI layout validators, test runners without jsdom, Electron main process) gets `ReferenceError: requestAnimationFrame is not defined` immediately. There is no `step()` function, no `setInterval` fallback, and no `globalThis.requestAnimationFrame` guard. This is not an edge case — server-side and headless layout are core use cases for a standalone physics module. Without an injectable scheduler, gwells is a browser-only library regardless of what it claims.

### 4.2 Registries are sealed static arrays — no external registration API

**Severity: Critical** | **Panelists: DX, Devil's Advocate, Theory (3/5)**

`GW_WELL_TYPE_REGISTRY`, `GW_INTERACTION_REGISTRY`, `GW_SEED_FUNCTION_REGISTRY`, and `GW_DIALECT_REGISTRY` are `const readonly` arrays. There is no `registerWellType()`, `registerInteraction()`, `registerSeedFunction()`, or `registerDialect()` function. An external adopter who wants to define their own layout domain must either fork the source files or patch the arrays at runtime via type coercion. The lookup helpers (`getWellTypeById`, `getInteractionById`) are linear scans over the static arrays — they cannot find externally registered entries. The proposal's claim that "the registry structure is already correct" mistakes the architectural model (correct) for the implementation (closed). Making the registries mutable `Map`-based structures with `register/unregister` APIs is a breaking refactor, not an additive one.

### 4.3 Seed functions are irreversibly domain-coupled

**Severity: Critical** | **Panelists: DX, Devil's Advocate, Theory (3/5)**

Both seeders (`radialBackbone.ts`, `parallelSpines.ts`, 691 lines combined) hard-code the LumaWeave domain model throughout: `nodeType === 'spine'`, `nodeType === 'directory'`, `nodeType === 'doc'/'code'/'config'/'fixture'`, `attrs.raw?.type`, `attrs.isEndpoint`, `attrs.rawSize`, `attrs.relationship`. The helper functions in `seederHelpers.ts` (`buildContainsMap`, `flattenSpinesFromRoot`, `assignSpinesToAxes`) embed the same assumptions. A consumer with a dependency graph, git history, org chart, or architecture diagram cannot use any of these seeders — they must write their own from scratch with no reusable base. The proposal's "seed primitive library" (Section 3.6) does not fix this because the seeders do not call primitives — they are their own monolithic algorithms. The harder and more valuable fix is making `buildContainsMap()` and the hierarchy traversal configurable, not just adding `placeRing()`.

### 4.4 O(N²) pair evaluation with no spatial partitioning

**Severity: Critical** | **Panelists: Physics, 3D, Theory, Devil's Advocate (4/5)**

The inner loop in `stepPhysics()` iterates every `(nodeId, otherId)` pair for every active interaction — O(I × N²) per frame. For the current graph (~100–300 nodes) this is acceptable. At 500 nodes with 8 interactions: ~2M pair-checks per frame at 60fps. At 2000 nodes: ~32B checks/second — unworkable. The proposal's "adaptive frame rate" (every other frame above 500 nodes) halves throughput, not the O(N²) factor. The proposal's "interaction scope with radius cutoff" applies a range check inside the inner loop — this reduces force application but not iteration count; every pair is still visited. For a standalone module claiming general-purpose applicability, the performance envelope is invisible to consumers until they hit it empirically. Barnes-Hut quadtree for repulsion (O(N log N)) is the standard fix and the approach used by d3-force, ForceAtlas2, and Gephi.

### 4.5 Missing dt timestep — physics is display-refresh-rate dependent

**Severity: Critical** | **Panelists: Physics (1/5, but the gap is structural)**

`engine.ts` line 382: `state.vx = (state.vx + fx) * params.damping`. There is no `dt` multiplier anywhere. Force is accumulated as raw pixels/frame; velocity is raw pixels/frame; position steps by raw pixels. On a 144Hz display, the same force produces 2.4× faster apparent motion than on 60Hz. Damping coefficients, spring stiffness, and convergence thresholds all become display-hardware-dependent. The fix is one function argument (`DOMHighResTimeStamp` from `requestAnimationFrame`) and a normalization multiplier (`dt / 16.67` before accumulation), capped at ~33ms to prevent spiral-of-death on tab-blur wakeup. All existing strength values remain valid because the scale factor normalizes to 60fps. This is the foundational fix that makes every other physics parameter physically meaningful.

### 4.6 No convergence detection — engine runs indefinitely

**Severity: Major** | **Panelists: Physics, Theory, Devil's Advocate (3/5)**

`stepPhysics()` runs every `requestAnimationFrame` until `stop()` is called. There is no velocity-threshold check, no auto-pause on settlement. For a standalone module used in unfamiliar environments, this means the engine burns CPU continuously even after layout fully stabilizes. Consumers must manage engine lifecycle manually. This is both a correctness gap and a standalone-module usability gap.

### 4.7 Edge types are invisible to physics

**Severity: Major** | **Panelists: Theory, Devil's Advocate (2/5)**

The engine builds one adjacency map: `parentOfNode` from `contains` edges. All other edge types (`imports`, `depends-on`, `calls`, `references`, `co-changes`) are ignored by the force loop. For architecture visualization — the stated purpose of LumaWeave — the most important layout signal is typically dependency direction and coupling strength, not containment hierarchy. A module with 30 import edges should be pulled toward its dependents. This is impossible without edge-type discrimination. The proposal correctly identifies this gap in Section 3.2 and the fix is contained (building per-edge-type adjacency maps at setup time, not per-frame).

### 4.8 Well types are domain-coupled with no shared behavioral primitives

**Severity: Major** | **Panelists: Theory, DX (2/5)**

All four well types encode codebase graph concepts in their names, descriptions, and `wellAssignment` predicates. A consumer with a different graph schema must re-implement the entire well type layer from scratch. The proposed `baseKind` taxonomy (`anchor/attractor/orbiter/repeller/free/cluster`) is the right fix but is not yet in the type system or engine. Until it exists, gwells is a codebase-graph layout engine with a configurable interface, not a standalone module.

### 4.9 Undocumented magic-string graph attributes

**Severity: Major** | **Panelists: Physics, DX, 3D (3/5)**

The engine writes `__gwellsState`, `__gwellsSeedPositions`, `__gwellsPinnedSet`, `__seededSpinePositions`, and `isEndpoint` onto the caller's Graphology graph object. These are not documented in the public API, not exported as constants, and two of them (`seedPositions`, `pinnedSet`) are not cleaned up by `stop()`. An adopter who serializes the graph or passes it to other graphology tools will encounter undocumented pollution. For standalone use, these must be exported as named constants (`GWELLS_STATE_ATTR`, `GWELLS_SEED_POSITIONS_ATTR`, etc.) so consumers can handle them in serialization/deserialization without string literals.

### 4.10 Unconditional console.log in production path

**Severity: Major** | **Panelists: Physics, DX (2/5)**

`applyDialect` has an unconditional `console.log('[gwells] applied dialect ...')` that fires in every consumer's production console on every dialect application. This is an instrumentation artifact from development that signals the module was not hardened for library use. Replace with an optional `onDebug` callback in `GWApplyDialectOptions`.

### 4.11 pairIdealDistance stale-cache bug after applyConfigOverride

**Severity: Major** | **Panelists: Physics (1/5, but verified against code)**

`pairIdealDistance` is built once at `applyDialect()` time from seed positions. When `applyConfigOverride()` re-runs the seed function (lines 496–505), `pairIdealDistance` is NOT rebuilt. After a `seedParams` override, springs pull toward pre-override positions — the stale seeded distances, not the new ones. In standalone use where consumers call `applyConfigOverride()` to animate layout changes, this is a silent correctness bug.

### 4.12 Paused loop still consumes requestAnimationFrame slots

**Severity: Minor** | **Panelists: Physics (1/5)**

In `tick()`, when `paused === true`, the function returns early — but not before scheduling the next `requestAnimationFrame`. A paused engine burns one RAF slot every ~16ms indefinitely. At pause time, cancel the RAF ID; restart it in `resume()`.

---

## 5. Dissenting Findings

Gaps or proposals raised by only one panelist but compelling enough to retain.

### 5.1 Repulsion law has a hidden non-physical scale inflection (Physics)

`engine.ts` line 316: `force = strength / Math.max(distSq * 0.01, 0.01)`. The `0.01` multiplier means the effective law is `F = 100 × strength / r²` — a Coulomb law with 100× amplification built in. The clamping floor creates a flat-force plateau for all nodes within 1 unit of each other. `strength` values therefore have no physical interpretation; any scene with a different coordinate scale must retune this constant. The canonical formulation is `F = k * q1 * q2 / r²` with separate charge and softening constant. **Committee position: accept and fix** — replace the magic `0.01` with an explicit named constant (`REPULSION_SOFTENING = 0.01`) exported from types as a tunable with documented semantics. Low effort, high credibility signal.

### 5.2 Constant-magnitude attraction has no stable equilibrium (Physics)

`engine.ts` lines 308–312: attraction applies `force = strength` as a constant regardless of distance, only normalizing direction. A node 10 units away and a node 10000 units away feel the same attraction magnitude. This produces logarithmically growing cluster radii rather than stable equilibrium shells. **Committee position: accept and fix** — replace with Hookean attraction toward a virtual anchor point (linear falloff with distance). Two-line change in the switch case; significant correctness improvement.

### 5.3 Perpendicular force has no 3D generalization (3D)

In 2D, perpendicular to a vector is `(-dy, dx)`. In 3D, perpendicular to a vector is a plane — infinitely many directions. The proposal says "force functions that are inherently 2D (e.g., perpendicular) zero out fz" but zeroing `fz` is not a 3D generalization — it is a suppression. For the `parallelSpines` dialect's directory branching to work in 3D, the perpendicular force must become an axis-deflection primitive: `deflect = normalize(V - (V·S)S) × strength`, where `S` is the spine axis direction and `V` is the spine-to-branch vector. **Committee position: accept** — register as a new force kind `axis-deflection` with an `axisVector` parameter. The old `perpendicular` kind stays for 2D dialects.

### 5.4 Convergence detection sketch has a runtime bug (Devil's Advocate)

The proposal's convergence detection (Section 3.7) reads: `Math.max(...nodeStates.map(s => ...))`. `nodeStates` is a `Map<string, GWNodeState>` — `Map` has no `.map()` method. The correct form iterates `nodeStates.values()`. Additionally, the proposed dialect morphing implementation calls `applyConfigOverride()` once per frame with lerped seed params — but `applyConfigOverride()` with `seedParams` re-runs the full seed function (lines 496–505), producing visual chaos at 60fps. **Committee position: accept the critique** — convergence detection must track `maxV` as a running variable inside the existing node iteration loop (no allocation, no spread operator), and morphing must interpolate node positions directly rather than re-running the seed function each frame.

### 5.5 package.json main/types points to raw .ts source (DX)

`package.json` declares `"main": "./index.ts"` and `"types": "./index.ts"`. This only works inside LumaWeave's Vite build which resolves `.ts` imports via path aliases. An npm consumer gets a TypeScript source file when they `require('gwells')`. **Committee position: accept** — a `tsconfig.lib.json` targeting ESM with declaration emit and a `dist/` output directory is prerequisite for npm publication. Low effort; high portability signal.

### 5.6 Interaction force asymmetry is undocumented (Theory)

Interactions are directional: source accumulates force, target does not. This is a deliberate design choice — pinned and semi-pinned nodes should not be moved by their children — but Newton's third law does not hold and the system can produce non-equilibrium drift states. This is not documented in the type system or interaction registry. **Committee position: accept** — add a JSDoc comment on `GWInteractionEntry` explaining the asymmetry is intentional, and add a `symmetric?: boolean` optional field that, when true, applies equal and opposite force to the target node.

### 5.7 Mass attribute improves realism at near-zero cost (Physics, Theory)

`computeAggregateSize` is already implemented and correct. Adding `__gwellsMass` as a graph node attribute (written at seed time, read by the engine as a `1/mass` acceleration divisor) takes two lines in `engine.ts`. Hub nodes resist displacement; leaf nodes respond quickly. **Committee position: accept** — opt-in via `useMassCharge: boolean` in dialect config so existing dialects are unaffected.

---

## 6. Proposed Additions — Reconciled

De-duplicated, merged across all five panelists. Items that appeared in multiple panel verdicts are noted.

| # | Addition | Why it matters | Effort | Panelists |
|---|---|---|---|---|
| A1 | **Injectable tick scheduler** — `applyDialect` accepts `scheduler?: GWTicker` option; engine exposes `controller.step()` for manual advancement; rAF is the default | Unblocks Node.js, test harnesses, server-side layout, deterministic testing. Without this, gwells cannot be called standalone | Low | Physics, DX, 3D, Devil's Advocate |
| A2 | **Mutable registration API** — replace static readonly arrays with `Map`-based registries; add `registerWellType()`, `registerInteraction()`, `registerSeedFunction()`, `registerDialect()`; built-in entries become clearable defaults | Converts the registry from a closed LumaWeave subsystem to a genuine plugin substrate. Without this, no external domain can define its own vocabulary | Medium | DX, Theory, Devil's Advocate |
| A3 | **Normalized dt timestep** — pass `DOMHighResTimeStamp` from rAF into `stepPhysics`; compute `dt = clamp(ts - lastTs, 1, 33)`; multiply force accumulation by `dt / 16.67`; cap at 33ms | Makes all force parameters display-hardware-independent. Foundation for every other physics parameter being physically meaningful | Low | Physics |
| A4 | **Configurable hierarchy traversal** — replace hard-coded `'contains'`/`'spine'`/`'directory'` strings in `buildContainsMap()` and related helpers with injectable config: `{ edgeTypeAttr, edgeTypeValue, parentValues }` | This is what actually makes existing seeders reusable across domains. More impactful than the geometric seed primitive library | Medium | Devil's Advocate, DX |
| A5 | **Fix pairIdealDistance stale cache** — rebuild `pairIdealDistance` whenever `applyConfigOverride()` re-runs the seed function | Silent correctness bug: springs pull toward pre-override positions after any seedParams change | Low | Physics |
| A6 | **Convergence detection — running maxV accumulator** — track `maxV` as a single float inside the existing node loop (no allocation); emit `gwells:settled` when `maxV < threshold` for N consecutive frames; cancel rAF on settle; restart on perturbation | Makes the engine usable as a standalone npm package without callers managing lifecycle manually. Eliminates idle CPU burn | Low | Physics, Theory, Devil's Advocate |
| A7 | **Cancel rAF on pause; restart on resume** — paused loop currently burns one RAF slot every 16ms indefinitely | Eliminates idle CPU burn when convergence parks most graphs | Low | Physics |
| A8 | **Build output** — `tsconfig.lib.json` targeting ESM with `declaration: true`; `dist/` directory; `exports` field in `package.json` | Prerequisite for npm publication and use by non-Vite consumers | Low | DX, Devil's Advocate |
| A9 | **Export graph attribute constants** — `GWELLS_STATE_ATTR`, `GWELLS_SEED_POSITIONS_ATTR`, `GWELLS_PINNED_SET_ATTR` etc. from `index.ts`; clean up `stop()` to remove seed positions and pin sets | Eliminates hidden graph pollution; gives adopters a way to handle engine attributes in serialization without string literals | Low | Physics, DX, 3D |
| A10 | **Remove unconditional console.log from applyDialect** — replace with optional `onDebug` callback | Library anti-pattern; one-line fix; high credibility signal for external consumers | Low | Physics, DX |
| A11 | **Fix constant-magnitude attraction** — replace `force = strength` with Hookean decay toward anchor point | Gives attraction a stable equilibrium radius; correct physics primitive | Low | Physics |
| A12 | **Replace repulsion magic 0.01** — export `REPULSION_SOFTENING` constant; document charge semantics | Makes strength values physically interpretable; eliminates hidden 100× scale factor | Low | Physics |
| A13 | **`baseKind` taxonomy on GWWellTypeEntry** — `anchor | attractor | orbiter | repeller | free | cluster` | Prerequisite for engine-level LOD optimization and the first step toward domain-agnostic well types | Medium | Theory, DX |
| A14 | **Schema adapter — GWNodeAttributeAdapter interface** — seed functions call `adapter.getNodeKind(attrs)`, `adapter.getNodeSize(attrs)` instead of literal strings; built-in adapter handles LumaWeave schema | Makes seed functions usable by consumers with different attribute names. Without this, adopters must rewrite all seeder logic | High | DX, Theory |
| A15 | **Edge-type discrimination in GWInteractionEntry** — add `requireEdgeType?: string | string[]`, `edgeWeightAttr?: string`, `directionality?: 'both' | 'source-to-target' | 'target-to-source'` | Unlocks relationship-driven layouts; builds per-edge-type adjacency maps at setup time (zero per-frame cost increase for common case) | Medium | Theory, DX |
| A16 | **Extend z-axis atomically** — add `vz` to `GWNodeState`; integrate `fz` in `stepPhysics`; extend `pairIdealDistance` to `dist3d`; extend `seedAdherence` to include `fz`; extend `centerGravity` to z-component; extend velocity safety clamps to 3D speed | These must land in one commit — partial z integration produces worse behavior than no z integration | Low | 3D, Theory |
| A17 | **Axis-deflection force kind** — `deflect = normalize(V - (V·S)S) × strength` where S is spine axis direction; register as new `axis-deflection` force kind with `axisVector` parameter | Generalize the perpendicular force for 3D dialects; without it, directory branching degrades when z is live | Medium | 3D |
| A18 | **Local position cache in stepPhysics** — collect `(x, y, z, wellTypeId)` for all active nodes into a `Float32Array` at frame start; iterate pairs from that array; batch-write back at end | Eliminates per-interaction Graphology hash-map lookups in the inner loop; critical for 3D performance where more force kinds are active | Medium | 3D |
| A19 | **Seed primitive library** — `placeRing`, `placeGrid`, `placeHelix`, `placeLine`, `placeSphere`, `placePhyllotaxis` as pure functions in `seedPrimitives.ts` | Enables new dialects without duplicating geometry; prerequisite for deferred 3D dialect stubs | Low | Theory, Proposal |
| A20 | **Per-node mass and charge** — `__gwellsMass` and `__gwellsCharge` written at seed time from `aggregateSize`/degree; `1/mass` divisor on acceleration; `charge` multiplier on emitted force; opt-in via `useMassCharge: boolean` | Hub nodes resist displacement, leaf nodes respond quickly; two lines in `engine.ts` after mass is seeded | Low | Physics, Theory |
| A21 | **Widen GWHelixTwistRecord** — change `{ spine?: number; directory?: number; file?: number }` to `{ all?: number } & Record<string, number | undefined>` | Removes LumaWeave domain names from a public exported type; no runtime impact | Low | Physics, DX |
| A22 | **Barnes-Hut spatial index for repulsion** — O(N log N) quadtree approximation for long-range repulsion; slot in for the `repulsion` case in `stepPhysics` only | Required for graphs above ~500 nodes; the single hardest performance ceiling; prerequisite for the module to be credibly general-purpose | High | Physics, 3D, Theory |
| A23 | **Remove graphology-types from peerDependencies** — it is imported nowhere in gwells source | Reduces installation friction with no downside | Low | Physics, DX |
| A24 | **Interaction scope system** — `GWInteractionScope`: `global | radius | cluster | layer | cross-layer`; scope as a pre-condition check inside the force loop; radius scope backed by the spatial index when A22 lands | Adds locality without restructuring the engine loop; radius cutoff is only meaningful performance-wise when backed by the spatial index | Medium | Theory, Proposal |
| A25 | **Elastic pin tier** — per-node `seedAdherence` override in `applyPins`; high seedAdherence without `fixed: true` for soft pins | Softer pinning UX; infrastructure already exists; two-line change to `applyPins` | Low | Theory, Proposal |
| A26 | **Free-physics mode** — `config.freePhysics: boolean` disables seedAdherence globally; convergence detection auto-stops the loop when kinetic energy drops below threshold | Without this, consumers who want classic force-directed behavior must remember to zero every well type's seedAdherence manually | Low | Devil's Advocate |
| A27 | **QUICK_START.md and JSDoc on all exported types** — self-contained 4-step example (create graph, register or use built-in dialect, call applyDialect, attach to render loop); table of graph attributes the engine writes | Minimum viable documentation for npm adoption | Medium | DX |
| A28 | **Deferred 3D dialect stubs** — `gwells.dialect.galaxy`, `gwells.dialect.layer-cake`, `gwells.dialect.helix-spine`, `gwells.dialect.constellation`, `gwells.dialect.dependency-gravity` with `status: 'deferred'` | Zero-risk; makes roadmap visible in the registry; reserves IDs before consumers build against them | Low | 3D, Proposal |

---

## 7. Standalone Module Checklist

What gwells needs before it is genuinely portable. Items marked `[x]` are already done; `[ ]` requires work.

### Portability — Hard Blockers

- [ ] Injectable tick scheduler (no unconditional `requestAnimationFrame` in library code)
- [ ] `controller.step()` method for manual advancement (headless and test use)
- [ ] Mutable registration API: `registerWellType`, `registerInteraction`, `registerSeedFunction`, `registerDialect`
- [ ] Build output: `tsconfig.lib.json`, `dist/` with ESM + declaration emit, `exports` field in `package.json`
- [ ] Remove `private: true` from `package.json`

### Physics Correctness — Foundational

- [ ] Normalized `dt` timestep in `stepPhysics` (display-hardware-independent force parameters)
- [ ] Fix `pairIdealDistance` stale-cache bug (rebuild after `applyConfigOverride` with `seedParams`)
- [ ] Fix constant-magnitude attraction (replace with distance-decaying Hookean)
- [ ] Fix `repulsion` magic `0.01` (export as named `REPULSION_SOFTENING` constant with documented semantics)
- [ ] Cancel RAF on pause; restart on resume (eliminate idle CPU burn)

### API Surface — Public Contract

- [x] `GWController` lifecycle API (`stop`, `pause`, `resume`, `applyConfigOverride`, `applyPins`)
- [x] `onError` callback in `GWApplyDialectOptions` (errors surface to caller, not swallowed)
- [x] All types re-exported from `index.ts`
- [ ] Export `GWELLS_STATE_ATTR`, `GWELLS_SEED_POSITIONS_ATTR`, `GWELLS_PINNED_SET_ATTR` as named constants
- [ ] `stop()` cleans up seed positions and pin sets from graph (not just `__gwellsState`)
- [ ] Remove unconditional `console.log` from `applyDialect`; add optional `onDebug` callback
- [ ] Remove `graphology-types` from `peerDependencies` (unused)
- [ ] Widen `GWHelixTwistRecord` to string-indexed map (remove domain-specific field names)

### Domain Portability — Seeder Layer

- [ ] Configurable hierarchy traversal in `seederHelpers.ts` (replace hard-coded `'contains'`/`'spine'`/`'directory'` string literals with injectable config)
- [ ] `GWNodeAttributeAdapter` interface (seed functions call adapter methods, not literal string attribute names)
- [ ] Built-in seeders (`radialBackbone`, `parallelSpines`) labeled as "LumaWeave reference implementations" in documentation
- [ ] Seed primitive library: `placeRing`, `placeGrid`, `placeHelix`, `placeLine`, `placeSphere`, `placePhyllotaxis` in `seedPrimitives.ts`

### Domain Portability — Registry Layer

- [ ] `baseKind` field on `GWWellTypeEntry` (`anchor | attractor | orbiter | repeller | free | cluster`)
- [ ] `createWellAssignment(schemaMap)` helper for mapping consumer attribute names to well type IDs
- [ ] `requireEdgeType`, `edgeWeightAttr`, `directionality` on `GWInteractionEntry`

### Convergence and Lifecycle

- [ ] Convergence detection: running `maxV` accumulator inside node loop (no allocations)
- [ ] `graph.emit('gwells:settled')` and `graph.emit('gwells:perturbed')` with typed payloads
- [ ] Auto-pause on settle; auto-resume on perturbation (graph mutation, pin change, dialect change)
- [ ] `freePhysics: boolean` mode — disables seedAdherence globally, convergence-stops the loop

### Performance

- [ ] Barnes-Hut spatial index for repulsion (O(N log N); prerequisite for >500 nodes)
- [ ] Local position cache in `stepPhysics` (Float32Array; eliminates per-interaction attribute lookups)
- [ ] Interaction scope system with radius cutoff (backed by spatial index)

### 3D

- [ ] `vz` in `GWNodeState`; `fz` integration in `stepPhysics` (atomic with seedAdherence, centerGravity, pairIdealDistance, velocity clamps)
- [ ] `axis-deflection` force kind (3D generalization of perpendicular)
- [x] `z` stored in `__gwellsSeedPositions` by `parallelSpines` seeder
- [ ] Stated coordinate system contract exported as `GW_COORDINATE_SYSTEM` constant

### Documentation

- [ ] `QUICK_START.md` in package root with self-contained 4-step example
- [ ] JSDoc on all exported types and functions
- [ ] Table of graph attributes the engine writes (`__gwells*`, `isEndpoint`, `fixed`)
- [ ] Documented performance envelope (node count vs. expected frame budget)
- [ ] Interaction asymmetry documented on `GWInteractionEntry` with `symmetric?: boolean` option

---

## 8. Revised Sequencing

The committee's recommended implementation order, reconciling panelist priority lists. Items within a tier can be done in parallel; the tier itself must precede the next.

### Tier 0 — Structural Portability (do before anything else)

These are the changes that convert gwells from a closed LumaWeave subsystem to a module that a non-LumaWeave project can import. Without these, all additive work lands in a module that cannot be adopted.

| # | Change | Effort | Notes |
|---|---|---|---|
| 0.1 | Injectable tick scheduler + `controller.step()` | Low | Unblocks Node.js, tests, SSR |
| 0.2 | Mutable registration API (Map-based registries, register/unregister) | Medium | Breaking refactor — do first to minimize churn |
| 0.3 | Remove unconditional `console.log`; add `onDebug` | Low | One-line change |
| 0.4 | Export `GWELLS_*_ATTR` constants; `stop()` cleanup | Low | |
| 0.5 | Remove `graphology-types` from peerDeps; widen `GWHelixTwistRecord` | Low | |
| 0.6 | Build output (`tsconfig.lib.json`, `dist/`, `exports` field, remove `private: true`) | Low | |

**Why before physics fixes:** There is no point hardening the physics loop for a module that cannot be imported. Structural portability unlocks every subsequent improvement for external consumers.

### Tier 1 — Physics Correctness Foundations

These fixes make the engine's physics parameters physically meaningful and eliminate silent bugs. They are independent of each other and can land in separate commits.

| # | Change | Effort | Notes |
|---|---|---|---|
| 1.1 | Normalized `dt` timestep in `stepPhysics` | Low | Foundation for all force parameters |
| 1.2 | Fix `pairIdealDistance` stale-cache bug | Low | High-severity silent bug |
| 1.3 | Cancel RAF on pause; restart on resume | Low | Eliminates idle CPU burn |
| 1.4 | Fix constant-magnitude attraction → Hookean | Low | |
| 1.5 | Replace repulsion magic `0.01` with `REPULSION_SOFTENING` | Low | |

**Why before convergence:** Convergence detection depends on velocity thresholds being physically meaningful. If `dt` is missing, the threshold is display-hardware-dependent.

### Tier 2 — Convergence and Lifecycle

| # | Change | Effort | Notes |
|---|---|---|---|
| 2.1 | Convergence detection (running `maxV` accumulator, no allocations) | Low | |
| 2.2 | `gwells:settled` and `gwells:perturbed` events with typed payloads | Low | |
| 2.3 | Auto-pause on settle; auto-resume on perturbation | Low | Depends on 2.1 |
| 2.4 | `freePhysics: boolean` mode | Low | |

### Tier 3 — Domain Portability

These changes are what make gwells usable by a non-codebase-graph consumer. They are more work but are the prerequisite for adoption outside LumaWeave.

| # | Change | Effort | Notes |
|---|---|---|---|
| 3.1 | Configurable hierarchy traversal in `seederHelpers.ts` | Medium | Most impactful seeder change |
| 3.2 | `baseKind` on `GWWellTypeEntry` | Medium | Prerequisite for 3.3 |
| 3.3 | `GWNodeAttributeAdapter` interface | High | Required for truly domain-agnostic seeding |
| 3.4 | `requireEdgeType`, `edgeWeightAttr`, `directionality` on interactions | Medium | Edge-type discrimination |
| 3.5 | Seed primitive library (`seedPrimitives.ts`) | Low | Prerequisite for new dialects |

### Tier 4 — Performance

| # | Change | Effort | Notes |
|---|---|---|---|
| 4.1 | Local position cache in `stepPhysics` (Float32Array) | Medium | Critical for 3D |
| 4.2 | Interaction scope system with radius cutoff | Medium | Only meaningful with spatial index |
| 4.3 | Barnes-Hut spatial index for repulsion | High | Prerequisite for >500 nodes |

**Why Barnes-Hut last in performance tier:** It is the single hardest implementation item and the one with the highest minimum competence bar. Local position cache (4.1) has immediate impact with lower risk and is a prerequisite for 3D anyway. Scope system (4.2) enables the new dialect vocabulary independent of the spatial index.

### Tier 5 — 3D Activation

All items in this tier must land atomically. Partial z integration is worse than no z integration — see Red Flag 5.3.

| # | Change | Effort | Notes |
|---|---|---|---|
| 5.1 | `vz` in `GWNodeState`; `fz` integration; `pairIdealDistance` dist3d; seedAdherence fz; centerGravity z; velocity clamps 3D | Low | Must be one commit |
| 5.2 | `axis-deflection` force kind | Medium | 3D perpendicular generalization |
| 5.3 | `GW_COORDINATE_SYSTEM` constant | Low | |

### Tier 6 — Enrichment

These are additive improvements that have no portability or correctness prerequisites beyond the tiers above.

| # | Change | Effort | Notes |
|---|---|---|---|
| 6.1 | Per-node mass and charge (`useMassCharge` opt-in) | Low | |
| 6.2 | Elastic pin tier (per-node seedAdherence override in `applyPins`) | Low | |
| 6.3 | Interaction asymmetry documentation + `symmetric?: boolean` | Low | |
| 6.4 | Deferred 3D dialect stubs with `status: 'deferred'` | Low | After Tier 3 primitives |
| 6.5 | Dialect morphing (`morphTo()`) | Medium | Requires corrected implementation (not seed re-run) |

### Where panelists disagreed and why the committee sided this way

**Proposal vs. Committee on sequencing:** The proposal leads with seed primitives and z-axis (`#1` and `#2`). The committee puts these in Tier 3 and Tier 5 respectively. Reason: without Tier 0 structural portability, no external consumer can import the module, making every subsequent improvement irrelevant to the standalone goal. Physics and geometry improvements are correct in themselves but do not advance portability.

**DX panelist vs. Physics panelist on priority of dt fix:** DX ranked registration API first; Physics ranked dt first. Committee verdict: registration API (Tier 0) before dt (Tier 1). Rationale: dt makes physics parameters meaningful; registration makes the module importable. Importability is the harder prerequisite because it requires a breaking refactor of the registry internals.

**3D panelist on atomic z activation:** 3D panelist correctly identified that all z-related force extensions must land together. The committee endorses this — Tier 5 is explicitly marked as "must be one commit." The proposal's sequencing (z-axis as item `#2`, layer-plane as a separate `#3`) would leave the system in the broken intermediate state the Devil's Advocate described.

**Theory panelist on convergence as first priority:** Theory ranked convergence `#1` (standalone safety). Committee placed it in Tier 2 after physics correctness foundations. Reason: convergence detection depends on velocity thresholds; velocity thresholds depend on dt normalization. The threshold value `0.5` in the proposal has no physical meaning without dt. Fix dt first, then convergence detection produces correct results.

---

## 9. Red Flags

The devil's advocate's most compelling challenges. For each: panel consensus on whether to accept the risk, mitigate it, or redesign.

### Red Flag 9.1 — The seeders are irreversibly domain-coupled and the proposal does not acknowledge it

The proposal's Section 6 states "both seed functions are untouched" as a feature of the generalization being "purely additive." The devil's advocate correctly identifies this as the hardest unsolved problem: the 691 combined lines of `radialBackbone.ts` and `parallelSpines.ts` hard-code the LumaWeave domain model at every call site. A consumer with any other graph schema cannot use either seeder.

**Panel consensus: redesign the framing, mitigate the implementation.** The full fix (A14, `GWNodeAttributeAdapter`) is High effort and should be deferred to Tier 3. The minimum-viable mitigation (A4, configurable hierarchy traversal) is Medium effort and blocks most other-domain seeders from having to re-implement the hierarchy logic from scratch. The built-in seeders should be explicitly labeled as LumaWeave reference implementations in documentation — not as general-purpose components. The seed primitive library (A19) gives new-domain consumers a composable geometry layer without copying seeder internals. The committee does not accept the proposal's claim that leaving the seeders unchanged is a portability-neutral decision.

### Red Flag 9.2 — The registry model is structurally wrong for standalone adoption

The devil's advocate's strongest technical point: the registries are sealed static arrays compiled into the module. An adopter gets LumaWeave's four well types, eight interactions, and two dialects baked into their bundle with no way to clear them. The lookup functions are linear scans over static arrays that cannot find externally registered entries.

**Panel consensus: redesign.** The mutable Map-based registry with `register/unregister` APIs (A2) is a breaking change to the registry internals, but it is the correct change. The existing built-in entries become clearable defaults. The lookup functions search the Map. This is Tier 0 work — it must happen before any other standalone work has value, because a consumer cannot define their own domain vocabulary until the registries are open.

### Red Flag 9.3 — The 3D z-axis plan is internally inconsistent and the hybrid state is actively dangerous

The devil's advocate correctly identified that `parallelSpines` seeds z coordinates, `radialBackbone` seeds z=0, but the engine never touches z. Adding `vz/fz` to `stepPhysics` without simultaneously extending `seedAdherence`, `centerGravity`, and `pairIdealDistance` to full 3D would produce nodes that drift freely in z with no correction force. The proposal's phased sequencing (z-axis as `#2`, `layer-plane` as `#3`) would leave the system in this broken intermediate state if `#3` were delayed or deprioritized.

**Panel consensus: mitigate via atomic commit constraint.** The committee's Tier 5 is explicitly an atomic patch: `vz`, `fz`, `pairIdealDistance dist3d`, `seedAdherence fz`, `centerGravity z-component`, and velocity clamp extension must all land in one commit. No partial z activation. The proposal's sequencing must be amended to reflect this constraint.

### Red Flag 9.4 — Dialect morphing implementation is concretely broken

The convergence detection sketch uses `nodeStates.map()` which does not exist on `Map<string, GWNodeState>`. More critically, the morphing proposal calls `applyConfigOverride()` once per frame with lerped `seedParams` — but `applyConfigOverride()` with `seedParams` re-runs the full seed function at 60fps, which produces visual chaos and defeats the purpose of interpolation.

**Panel consensus: accept the critique, redesign the implementation.** Morphing should interpolate node positions directly via a lerp on graph attributes (from current `x,y,z` to target seed positions), running N frames before handing off to the new dialect's forces. The seed function runs once at the start of the morph to compute the target positions, not once per frame. Convergence detection must use a running `maxV` variable inside the existing loop, not a `map()` + spread on the `Map` object.

### Red Flag 9.5 — The performance envelope is invisible and will surprise consumers

The O(N²) loop has no documented ceiling. A consumer with 2000 nodes discovers the performance cliff empirically at production scale. The proposal's adaptive frame rate is a mitigation, not a solution; the scope system's radius cutoff reduces force application but not iteration. Barnes-Hut is deferred to Tier 4 because it is the highest-effort item, but the committee endorses deferring it only if the performance envelope is documented before the module is published.

**Panel consensus: mitigate with documentation, accept the deferred timeline for Barnes-Hut.** Before publication, add a documented performance table to the README: expected frame budget vs. node count on reference hardware. Mark the module as "validated for graphs up to 500 nodes without Barnes-Hut; 500–2000 nodes require Barnes-Hut (A22, planned)." This makes the ceiling visible without blocking publication.

---

## 10. Minimum Viable Standalone

The smallest set of changes that gets gwells to a state where a non-LumaWeave project could realistically adopt it. This is not "fully generalized" — it is the threshold for "actually usable by someone else."

A non-LumaWeave adopter needs to be able to: (1) import the package without a runtime error, (2) define their own well types and dialect without forking the source, (3) write a seeder for their own graph schema without re-implementing hierarchy traversal, (4) run the engine in a test environment without a browser, and (5) know when the layout has settled.

### MVS Change List

```
MVS-1  Injectable tick scheduler (Tier 0, item 0.1)
       — Eliminates browser-only hard dependency.
       — Enables: Node.js, test harnesses, headless layout.
       — Without this: ReferenceError on import in any non-browser context.

MVS-2  Mutable registration API (Tier 0, item 0.2)
       — Enables: consumer-defined well types, interactions, dialects.
       — Without this: consumer must fork source to define their domain.

MVS-3  Configurable hierarchy traversal (Tier 3, item 3.1)
       — Replace hard-coded 'contains'/'spine'/'directory' strings in
         seederHelpers.ts with injectable config.
       — Enables: consumer's seeder to use the existing hierarchy utilities
         with their own edge type names and node attribute names.
       — Without this: consumers must re-implement buildContainsMap from scratch.

MVS-4  Export GWELLS_*_ATTR constants; fix stop() cleanup (Tier 0, item 0.4)
       — Eliminates hidden graph attribute pollution.
       — Without this: serialization and multi-tool pipelines encounter
         undocumented __gwells* attributes.

MVS-5  Remove unconditional console.log; add onDebug (Tier 0, item 0.3)
       — Library anti-pattern that signals the module was not hardened.
       — One-line change.

MVS-6  Convergence detection (Tier 2, items 2.1–2.3)
       — Makes the engine safe to ship without requiring callers to
         manage lifecycle manually.
       — Without this: engine runs indefinitely; consumers must call stop()
         manually after an unknown number of frames.

MVS-7  Normalized dt timestep (Tier 1, item 1.1)
       — Makes strength/damping values hardware-independent.
       — Without this: behavior differs by display refresh rate; documented
         parameter values are meaningless to a consumer on different hardware.

MVS-8  Fix pairIdealDistance stale cache (Tier 1, item 1.2)
       — Silent correctness bug; low effort.

MVS-9  Build output (Tier 0, item 0.6)
       — Without compiled dist/, the package cannot be npm-published and used
         by a non-Vite bundler.

MVS-10 QUICK_START.md with 4-step example (partial A27)
       — Minimum viable documentation: create graph, register or use
         built-in dialect, call applyDialect, attach to render loop.
       — Table of graph attributes the engine writes.
```

### What MVS does NOT include

The following are important for full generalization but not required for the first external adopter:

- Barnes-Hut spatial index (A22) — deferred; document performance ceiling instead
- GWNodeAttributeAdapter full schema adapter (A14) — deferred; configurable hierarchy traversal (MVS-3) covers most cases
- baseKind taxonomy (A13) — deferred; additive once registries are open
- Edge-type discrimination (A15) — deferred; important for graph viz, not required for MVS
- 3D z-axis activation (Tier 5) — deferred; 2D standalone is a complete product
- Dialect morphing — deferred; UX enhancement
- Per-node mass and charge — deferred; enrichment

### MVS Effort Summary

| Item | Effort | Blocking? |
|---|---|---|
| MVS-1: Injectable scheduler | Low | Hard blocker |
| MVS-2: Mutable registration API | Medium | Hard blocker |
| MVS-3: Configurable hierarchy traversal | Medium | Hard blocker for most domains |
| MVS-4: Export GWELLS_* constants + stop() cleanup | Low | Important |
| MVS-5: Remove console.log | Low | Low risk, high signal |
| MVS-6: Convergence detection | Low | Safety |
| MVS-7: Normalized dt | Low | Correctness |
| MVS-8: pairIdealDistance stale cache | Low | Bug fix |
| MVS-9: Build output | Low | Publication prerequisite |
| MVS-10: QUICK_START.md | Medium | Adoption prerequisite |

**Estimated total MVS effort: 2–3 focused sessions.** MVS-2 (mutable registries) and MVS-3 (configurable hierarchy traversal) are the only Medium-effort items. Everything else is Low. This is achievable before any of the physics enrichment work begins.

---

*This document synthesizes the committee review as of 2026-06-03. It supersedes `gwells-proposal.md` as the working design reference. Implementation should proceed tier by tier, starting with Tier 0 structural portability. Each tier produces a shippable intermediate state; the Minimum Viable Standalone is reached at the completion of MVS items above, which span Tiers 0–2 plus one item from Tier 3.*
