# Renderer Migration Ledger — preparing to receive three.js, GLSL, and a real z-axis

Append-only. Rules: `docs/ledger/README.md`.
Findings this plan is built on: `docs/ledger/GRAPH_DISPLAY.md` (GD-###).
Guards: `tests/e2e/graph-contract.spec.ts`.

Opened 2026-07-12.

---

## The thesis

**Graphology is the scene model, and it is renderer-neutral.** Physics, style policy, labels, neighborhood, and dimming all operate on graphology attributes and never import Sigma. Of the five files in `renderers/sigma2d/`, only `SigmaGraphView.tsx` touches Sigma at all. That is the asset this whole plan is built on: **keep graphology, swap only the view.**

**The blocker is not the renderer — it is that there is no seam.** `window.__lwSigma` is the de-facto renderer API, read by 7 files outside the renderer (GD-002), and the minimap goes so far as to reimplement Sigma's internal coordinate normalization (GD-003). So "swap the renderer" today secretly means "also rewrite the minimap, and hope the camera maths agrees."

Therefore: **build the facade first, against Sigma, with the suite green.** A swap is only cheap once there is something to swap *at*. Everything in R0–R2 exists to make R4 a replacement rather than an excavation.

**The sequencing rule:** do not port a bug. Several visual features currently compute values and throw them away (GD-017 alpha, GD-019 edge colour, GD-018 edge phase, GD-050 isSun). Porting them as-is means reimplementing dead code in a new renderer and inheriting the confusion. Make the payload honest **before** the swap, not after.

---

## Phase R0 — Clear the ground

Cheap, low-risk, no behaviour change. Do these first so nothing imported lands on rot.

### RM-001 · Delete the dead renderer scaffolding
Opened: 2026-07-12
Status: CLOSED
Blocks: nothing
Scope: `src/renderers/` (empty dir) · `src/graph/rendering/graphRendererInterface.ts` (zero importers, GD-001) · `src/graph/renderers/sigma2d/labelPolicy.ts` (331 lines, zero importers, GD-010) · `src/graph/edges/edgeStyleRegistry.ts` (empty stub, GD-048) · `src/control-plane/features/feature-registry.ts` (0-byte, GD-048) · `@sigma/node-image` dependency (GD-009).
Why: every one of these looks like a seam and is not. The `GraphRenderer` interface in particular will attract an implementation that then doesn't fit — it has no hit-testing, no viewport projection, no program registration. Delete it and design the real one (RM-005) rather than inheriting a bad shape.
Acceptance: typecheck clean, suite green, `grep -r "graphRendererInterface" src/` empty.
Closed: 2026-07-12 · deleted `src/renderers/` (empty dir), `graphRendererInterface.ts`, `renderers/sigma2d/labelPolicy.ts` (331 lines), `edges/edgeStyleRegistry.ts`, `features/feature-registry.ts`, and the three now-empty directories. Retired the two contract docs that described the deleted modules (`GRAPH_RENDERER_INTERFACE_CONTRACT.md`, `EDGE_STYLE_REGISTRY_CONTRACT.md`) and updated every doc that pointed at them, so the deletion does not leave a trail of dangling references. `@sigma/node-image` was NOT removed — that touches the lockfile and needs a developer-run `npm uninstall`. Typecheck clean; 35 passed / 2 skipped across the guard + physics blast radius.

### RM-002 · Resolve the GLSL source of truth — BEFORE importing any shaders
Opened: 2026-07-12
Status: OPEN
Blocks: RM-020, and any shader import
Scope: 7 orphaned `.glsl` files (GD-006). No GLSL loader exists in Vite; every shader that actually runs is an inline template literal in its `.ts`.
Decision required: **(a)** add a `?raw` / glsl-loader path and make the `.glsl` files authoritative, deleting the inline copies; or **(b)** delete the `.glsl` files and keep shaders inline.
Why this is urgent: the orphaned files **may already have drifted** from the live shaders, and anyone importing GLSL will naturally assume they are the source of truth. Importing custom node shaders into a tree that already has a *fake* shader directory is how you get two divergent sets.
Recommendation: **(a)** — external GLSL is what an imported shader pack will look like, and `.glsl` files get syntax highlighting and can be linted. But it needs a Vite plugin, which is a **dependency request**.
Acceptance: exactly one source of truth for every shader; a test that the live shader text comes from where the docs say it does.

### RM-003 · Kill the fake dialect taxonomy
Opened: 2026-07-12
Status: OPEN
Blocks: RM-024 (physics import)
Scope: `physicsDialectRegistry` (GD-042 — stale duplicate in an **incompatible** id namespace: `dialect.gwells.*` vs the engine's `gwells.dialect.*`) · `lensRegistry` (GD-043 — dispatches nothing) · the **three unsynchronized copies** of the layout tuning numbers (GD-044).
Why: an imported physics lab will look for the dialect registry and find the wrong one. Two of the three copies of the tuning numbers are already wrong and nothing notices.
Decision required: delete both, or make `physicsDialectRegistry` a *view* over the real gwells registry (single source, derived).
Acceptance: one dialect taxonomy. The guard `"the real dialect registry is the one the engine reads"` gets deleted, and GD-042 closes.

### RM-004 · Remove the knobs that lie
Opened: 2026-07-12
Status: OPEN
Scope: `graphView.defaultLayout` (7 layouts that do not exist, zero readers — GD-045) · `showArrows`, `showIsolatedNodes`, `showLowConfidenceEdges` (dead/write-only — GD-046) · stale settings paths in `handleset.registry` and `controlSurfaceContract.registry` (GD-047).
Keep: `defaultRenderer` — its union already reads `"sigma2d" | "cosmograph2d" | "three3d"` and is already migrated. **It is the right shape and we will wire it in R4.**
Why: four user-visible knobs that do nothing, and a control-plane registry asserting a contract the schema doesn't honour.
Acceptance: settings migration; the removed fields have no readers left; suite green.

---

## Phase R1 — Build the seam (the load-bearing phase)

This is the phase that makes a swap possible. **Nothing in R4 should start before this is done.**

### RM-005 · Design the real renderer facade
Opened: 2026-07-12
Status: OPEN
Blocks: RM-006, RM-007, RM-019
Scope: a new interface — **not** the deleted `GraphRenderer` stub, which was too thin.
It must cover what consumers actually reach for through `window.__lwSigma`:
- **viewport projection** — `graphToViewport` / `viewportToGraph`, `getDimensions`
- **camera** — get/set state, animate, enable/disable (drag freezes it), reset
- **hit-testing** — node/edge under pointer; this is what `clickNode`/`enterNode`/`downNode` really are
- **per-item hover/pick** state
- **program/material registration** — the node-geometry preset system
- **lifecycle** — mount, unmount, refresh, scheduleRender, `afterRender` (gwells start ordering depends on it)
Note the camera vocabulary must be chosen deliberately: `cameraController` speaks Sigma's `{x, y, ratio, angle}` while the dead stub spoke `{x, y, zoom, rotation}`. **Two incompatible camera types coexist today.** Pick one.
Acceptance: interface lands with a Sigma implementation behind it. No behaviour change. Suite green.

### RM-006 · Route the minimap through the facade
Opened: 2026-07-12
Status: OPEN
Blocks: RM-019
Scope: `useMinimapCamera`, `useMinimapNavigation`, `useMinimapSnapshot`, `MinimapSnapshotCanvas` — all four read `window.__lwSigma` directly (GD-002). `useMinimapCamera` polls for it on a 200ms `setInterval`; `useMinimapNavigation` reimplements Sigma's internal normalization and encodes its Y-up convention (GD-003).
Why: **this is the single biggest blocker to a clean swap.** Under any other camera model the minimap silently produces wrong pans — not a compile error, a correctness one.
Acceptance: zero `__lwSigma` references in `src/graph/overlay/minimap*`; the seam ratchet guard drops.

### RM-007 · Route AppShell through the facade
Opened: 2026-07-12
Status: OPEN
Blocks: RM-019
Scope: theme-thumbnail capture (`sigma.getCanvases()`) and GlitterField positioning (`getNodeDisplayData` + `graphToViewport`). Fold in **GD-039** while here: GlitterField projects during React render, not on camera move, so it **desyncs from its node while panning/zooming** — the facade should expose a camera-change subscription.
Acceptance: `AppShell` has no `__lwSigma` references. Seam ratchet → **0**. Update `MAX_EXTERNAL_LWSIGMA_FILES` and close GD-002.

### RM-008 · Get the renderer's name out of the theme contract
Opened: 2026-07-12
Status: OPEN
Scope: `ResolvedGraphVisualTokens.sigmaConfig` (`labelRenderedSizeThreshold`, `labelFont`, `edgeLabelFont`) — GD-004. `labelRenderedSizeThreshold` is a Sigma concept with no three.js analogue.
Acceptance: theme tokens describe *intent* (e.g. "hide labels below this rendered size"), and each renderer maps it.

### RM-009 · Un-invert the visual/renderer dependency
Opened: 2026-07-12
Status: OPEN
Scope: `graphStylePolicy` and `graphLabelPolicy` import `selectionNeighborhood` **up** from `renderers/sigma2d/` (GD-005). It is pure graphology and belongs in `src/graph/visual/` or `src/graph/query/`.
Acceptance: nothing in `src/graph/visual/` imports from `src/graph/renderers/`.

---

## Phase R2 — Make the payload honest

An imported renderer must consume **truth**, not four features that compute values and discard them. Do this before the swap so the bugs aren't reimplemented in three.js.

### RM-010 · Edge colour reaches the GPU, or is honestly declared uniform-driven
Opened: 2026-07-12
Status: OPEN
Scope: `PlasmaEdgeProgram` never reads `data.color` (GD-019), so **every** edge-colour write in the style policy is discarded. Meanwhile edge colour actually comes from `PLASMA_THEME_DEFAULTS`, read from the settings store **inside the shader** (GD-032) — a second, parallel theme system.
Decision required: either the edge program consumes `data.color` (making the style policy real), or per-edge colour is deleted and edge appearance is declared uniform-driven. **Right now both exist and one is a lie.**
Note: this lands squarely on the Phase 3 edge-semantics work (`LAYOUT_AND_PHYSICS.md` L-010–L-014) — 866 of 1,278 edges are semantic and should render dimmed/dashed. **That work is impossible until edge colour is real.**

### RM-011 · Make `alpha` real, or delete it
Opened: 2026-07-12
Status: OPEN
Scope: `dimmingPolicy` writes `alpha` on every node and edge; nothing reads it (GD-017). `dimMode` never even reaches the style policy (GD-033), `dimOpacity` is hardcoded (GD-034), and the `outside-cluster` BFS is unbounded (GD-035).
Why it matters for the import: **a three.js renderer that honours `alpha` fixes focus/context for free.** This is the clearest win available in the port — the policy layer is already written and correct; only the consumer is missing.
Acceptance: either dimming visibly works, or `alpha` and `dimmingPolicy` are deleted. No third option.

### RM-012 · Wire `_phase` / `_midStop`, or drop them
Opened: 2026-07-12
Status: OPEN
Scope: read by the edge shader, **written by nobody** (GD-018) — so every edge pulses identically and in phase.
Why: this is likely a real part of why the edges read as one undifferentiated animated mass.

### RM-013 · Stop deleting `isSun` the instant it is computed
Opened: 2026-07-12
Status: OPEN
Scope: GD-050. The builder tags 11 cluster suns; `SigmaGraphView` removes the attribute from every node on the next line ("Clear solar orbit attributes on rebuild" — but it runs on **every** build). `graphStylePolicy`'s sun branch (×1.8 size + cluster colour) is unreachable.
Acceptance: decide whether suns are a concept. If yes, stop deleting them and the style branch comes alive. If no, delete the builder pass, the style branch, and the attribute.

### RM-014 · Declare the size units, loudly
Opened: 2026-07-12
Status: OPEN
Scope: Sigma runs `itemSizesReference: "positions"`, so `size`/`baseSize` are **radii in graph units**, not pixels (GD-014).
Why: this already cost us once — `computeNodeSize` was inflated until a node's radius equalled the gap to its neighbour (L-019). **Any imported renderer or physics engine that assumes screen-space pixels will be wrong by the camera ratio.** The three.js renderer must make an explicit, documented choice here, and the guard must be updated to hold it.

---

## Phase R3 — The z-axis fork

`z` is currently write-only: six writers, one round-trip reader, zero renderers, zero forces (GD-011). It is **constant 0 under the default dialect** (GD-013) and **never initialized by the builder** (GD-012).

### RM-015 · Initialize `z` in the builder
Opened: 2026-07-12
Status: OPEN
Scope: `buildGraphologyGraph` sets `x: 0, y: 0` and **never `z`** — un-seeded nodes have no `z` attribute at all (`undefined`, not `0`). A 3D renderer will read `undefined` into a float.
Acceptance: every node has a numeric `z` from the moment it exists.

### RM-016 · Give the default dialect real depth, or accept planar
Opened: 2026-07-12
Status: OPEN
Scope: `radialBackbone` inherits `z` unchanged from a zero root, so the whole tree is planar (GD-013). Only `parallelSpines` produces genuine azimuthal depth.
Why: **turning on a 3D camera against the default dialect today shows a flat plane.** That will read as "3D doesn't work."
Ties to: the user's stated goal of a flatter simulated-2D mode for some graph types *and* true 3D for others — which means **planar-vs-volumetric should be a property of the dialect/lens**, not an accident of which seeder ran.

### RM-017 · THE FORK — decide the physics dimensionality
Opened: 2026-07-12
Status: OPEN
Blocks: RM-025, and any physics import
Scope: the simulation is **strictly 2D** — `GWNodeState` has `vx`/`vy` and no `vz`; every force is a 2-vector (GD-023).
Decision required, and it is the biggest one in this plan:
- **(a) 2D sim, 3D render.** z stays a static seed value; depth is layout, not dynamics. Cheap. Keeps every existing force valid.
- **(b) 3D sim.** Add `vz`, make every force a 3-vector. Every tuned constant must be re-validated (repulsion in 3D falls off differently; the angular-budget seeders are 2D-planar by construction).
This choice determines what the imported physics lab must export. **Make it before importing, not after.**

### RM-018 · Carry `z` through the render path
Opened: 2026-07-12
Status: OPEN
Scope: the Sigma `nodeReducer` returns `{...base, x, y}` and drops z; `__seededSpinePositions` is `{x, y}` only, by explicit comment.
Acceptance: the facade's projection layer accepts and preserves z, whichever renderer is behind it.

---

## Phase R4 — The swap

Only once R1 is done and the seam ratchet is at 0.

### RM-019 · three.js view behind the facade
Opened: 2026-07-12
Status: OPEN
Scope: implement the RM-005 facade with three.js. Gate it on the **existing** `three3d` feature flag (currently hardcoded `false`) and the **existing** `graphView.defaultRenderer` setting (currently selects nothing, GD-007).
Good news: `three`, `@react-three/fiber`, `@react-three/drei` are **already installed and unused** — no dependency request needed to start.
Acceptance: both renderers run behind the setting. The full suite passes against **both**. That is the real test of the facade.

### RM-020 · Port the node fragment shaders
Opened: 2026-07-12
Status: OPEN
Blocked by: RM-002 (GLSL source of truth)
Scope: the five node programs (`glass-sphere`, `sun`, `crystal`, `orb`, `pip`). The **fragment shaders port nearly verbatim** — they are distance-field circle maths on `v_diffVector`/`v_radius`. The inherited `NodeCircleProgram` vertex path and attribute layout do not.
Note: the four animation uniforms (`u_time`, `u_hum`, `u_flowSpeed`, `u_glowStrength`) are currently **monkey-patched onto the Sigma instance** (`sigma.__uniformsRef`). The facade must expose a real uniform channel.

### RM-021 · Rebuild the edge program — the hardest single artifact
Opened: 2026-07-12
Status: OPEN
Scope: `PlasmaEdgeProgram`, 552 lines — from-scratch vertex+fragment pair, subdivided quadratic-bezier ribbon (12 segments, 72 verts/edge), hand-packed attributes, ~30 uniforms, **and it detects Sigma's picking pass by reading `gl.getParameter(gl.FRAMEBUFFER_BINDING)` and swapping blend modes** (GD-008).
The picking hack has **no three.js analogue** — it becomes a raycaster or a GPU-picking pass. Budget for this being the long pole.
Do RM-010 first, or you will faithfully port an edge program that ignores its own colour input.

### RM-022 · Camera, hit-testing, drag
Opened: 2026-07-12
Status: OPEN
Scope: pan/zoom/rotate input (free from Sigma today, must be rebuilt); `viewportToGraph`/`graphToViewport`; `getDimensions`; node/edge picking; the drag-to-move block (logic is portable — `resolveDragSet` BFS over `contains`, scope single/family/subtree — the coordinate conversion is not).

---

## Phase R5 — The physics import

### RM-023 · Benchmark harness before replacing anything
Opened: 2026-07-12
Status: OPEN
Scope: `GWStepResult` already carries `stepsRun, movedNodeCount, maxVelocity, averageVelocity` plus `GWStepTimings { totalMs, resetMs, seedLookupMs, forceInteractionsMs, auxForcesMs, integrationMs }` — **measured every step and ready-made for benchmarking an imported engine against this one.** Use it before swapping, so "faster" is a measurement rather than a feeling.
While here, fix GD-027: `GWStepResult.warnings` (the non-finite guards) is **discarded by the rAF loop**, so NaN guards fire silently in the normal path.

### RM-024 · Replace brute-force all-pairs
Opened: 2026-07-12
Status: OPEN
Blocked by: RM-003 (fake taxonomy), RM-017 (dimensionality)
Scope: force evaluation is O(|source| × |target|) per interaction, with no quadtree and no Barnes-Hut (GD-024). **This is the scaling wall and the most valuable thing an imported engine replaces.**

### RM-025 · Introduce a real timestep
Opened: 2026-07-12
Status: OPEN
Scope: `dt` is implicit = 1 frame — position update is literally `x + vx`, and damping is a per-frame multiplier rather than exponential in dt (GD-023). The physics is therefore framerate-dependent.
Warning: this re-scales **every** tuned constant in the engine. Do it deliberately, with the benchmark harness (RM-023) in place, not as a side-effect of an import.

### RM-026 · The imported seeder must satisfy the handshake
Opened: 2026-07-12
Status: OPEN
Scope: a seeder must write **two graph-level maps**, not just `x`/`y` (GD-026): `__gwellsSeedPositions` (every node, `{x,y,z}` — feeds the seed-anchor force **and** the per-pair spring rest lengths) and `__seededSpinePositions` (spine nodes — read by the render-time reducer).
An imported seeder that writes only x/y **silently** disables seed adherence, collapses springs to a static default, and breaks spine pinning. **No error is raised.** Guarded by `"the seed handshake maps exist and are populated"`.

---

## Recommended order

**R0 → R1 → R2 → R3(decide) → R4 → R5.**

If you only do one thing before the import lands: **R1**. The facade is what turns "swap the renderer" from an excavation into a replacement, and the seam ratchet in `graph-contract.spec.ts` will tell you honestly how far along it is — it is at **7** today and the target is **0**.
