# Graph Display Ledger

Append-only. Rules: `docs/ledger/README.md`. Narrative map: `docs/canonical/GRAPH_DISPLAY_MAP.md`.
Guards: `tests/e2e/graph-contract.spec.ts`.

Opened 2026-07-12 from a five-way sweep of the tree (renderer seam, attribute contract, physics boundary, style/theme pipeline, registries/settings). Every entry below was verified against on-disk code, not against older docs.

---

## Renderer seam

### GD-001 · There is no renderer abstraction
Opened: 2026-07-12
Status: OPEN
Area: renderer
Evidence: `src/graph/rendering/graphRendererInterface.ts` declares `GraphRenderer` and has **zero importers** (grepped across `src`, `tests`, `scripts`). `src/renderers/` is an **empty directory**. `AppShell` constructs `<SigmaGraphView>` directly.
Impact: nothing to implement a three.js view against. The stub is also too thin to be the real seam — no hit-testing, no viewport projection, no per-item hover, no program registration.
Guard: none
Amended: 2026-07-12 · the stub and `src/renderers/` are deleted (RM-001). The FINDING STANDS AND STAYS OPEN: there is still no renderer abstraction. Deleting the stub removes a false seam that would have attracted an implementation with the wrong shape; the real one is RM-005.

### GD-002 · `window.__lwSigma` is the de-facto renderer API
Opened: 2026-07-12
Status: OPEN
Area: renderer
Evidence: set at `SigmaGraphView.tsx:444` (unconditionally, not dev-gated). Read by 7 files **outside** the renderer directory: `AppShell.tsx`, all four minimap hooks/components, plus test helpers.
Impact: the seam is a global variable, not the props interface. "Swap the renderer" currently also means "rewrite the minimap." **This is the single biggest blocker to a clean swap.**
Guard: `tests/e2e/graph-contract.spec.ts` › "seam ratchet: __lwSigma consumers outside the renderer do not increase"

### GD-003 · The minimap reimplements Sigma's internal coordinate normalization
Opened: 2026-07-12
Status: OPEN
Area: renderer
Evidence: `useMinimapNavigation.ts` derives `ratio_norm` from "sigma's `normalizationFunction` source" and encodes Sigma's Y-up axis convention in comments. `useMinimapCamera.ts` polls for `window.__lwSigma` on a 200ms `setInterval`.
Impact: would silently produce wrong pans under any other camera model. Not a compile error — a correctness one.
Guard: none

### GD-004 · The theme contract names the renderer
Opened: 2026-07-12
Status: OPEN
Area: renderer
Evidence: `ResolvedGraphVisualTokens.sigmaConfig` (`labelRenderedSizeThreshold`, `labelFont`, `edgeLabelFont`) — `graphVisualTokens.ts`, threaded through `SigmaGraphViewProps`.
Impact: `labelRenderedSizeThreshold` is a Sigma concept with no three.js analogue. Must be dropped or generalized before a swap.
Guard: none

### GD-005 · The visual policy layer imports *up* from the renderer directory
Opened: 2026-07-12
Status: OPEN
Area: renderer
Evidence: `src/graph/visual/graphStylePolicy.ts` and `graphLabelPolicy.ts` both import `selectionNeighborhood` from `src/graph/renderers/sigma2d/`.
Impact: the directory boundary is inverted — the renderer-neutral layer depends on the renderer directory. `selectionNeighborhood` is itself pure graphology and should move up.
Guard: none

### GD-006 · Seven orphaned `.glsl` files; no GLSL loader exists
Opened: 2026-07-12
Status: OPEN
Area: renderer
Evidence: `src/graph/edgePrograms/shaders/plasma.{vert,frag}.glsl` and `src/graph/nodePrograms/shaders/{crystal,glass-sphere,orb,pip,sun}.frag.glsl` — **none imported by anything**. No GLSL plugin in `vite.config.ts`. Every shader that actually runs is an inline template literal in the corresponding `.ts`.
Impact: **they are stale duplicates and may have drifted from the live shaders.** Anyone importing GLSL will assume these are the source of truth. Decide on one source before importing more shaders.
Guard: none

### GD-007 · The three.js runway is already installed and entirely unused
Opened: 2026-07-12
Status: OPEN
Area: renderer
Evidence: `three`, `@react-three/fiber`, `@react-three/drei` in `package.json`, **zero imports in `src`**. `feature-flags.ts` has `three3d` hardcoded `false`. `settings.schema.ts` types `graphView.defaultRenderer` as `"sigma2d" | "cosmograph2d" | "three3d"` — and it selects nothing (only consumer prints it as a debug string in `StatusBar`).
Impact: good news — the dependency and the settings *shape* already exist and are migrated. No new packages needed to start.
Guard: none

### GD-008 · `PlasmaEdgeProgram` depends on undocumented Sigma internals
Opened: 2026-07-12
Status: OPEN
Area: renderer
Evidence: `PlasmaEdgeProgram.ts` `setUniforms` detects Sigma's picking pass by reading `gl.getParameter(gl.FRAMEBUFFER_BINDING)`, then swaps `gl.blendFunc` between premultiplied-alpha (picking) and additive `ONE, ONE` (visual). 552 lines total: from-scratch vertex+fragment pair, subdivided quadratic-bezier ribbon (12 segments, 72 verts/edge), hand-packed attributes, ~30 uniforms.
Impact: **the hardest single artifact to port.** The picking hack has no three.js analogue — needs a raycaster or GPU-picking pass. By contrast the five node *fragment* shaders are portable nearly verbatim (distance-field circle math).
Guard: none

### GD-009 · Dead: `@sigma/node-image` dependency
Opened: 2026-07-12
Status: OPEN
Area: renderer
Evidence: in `package.json`, never imported anywhere in `src`, `tests`, or `scripts`.
Impact: free to drop.
Guard: none
Note: 2026-07-12 · NOT dropped in RM-001. Removing a dependency touches the lockfile, so it needs a deliberate `npm uninstall @sigma/node-image` run by the developer. Still open.

### GD-010 · Dead: `renderers/sigma2d/labelPolicy.ts` (331 lines)
Opened: 2026-07-12
Status: CLOSED
Area: renderer
Evidence: zero importers. Superseded by `src/graph/visual/graphLabelPolicy.ts`.
Impact: dead weight that looks live. Delete.
Guard: none
Closed: 2026-07-12 · deleted in RM-001.

---

## Attribute contract

### GD-011 · `z` is write-only
Opened: 2026-07-12
Status: OPEN
Area: attributes
Evidence: six writers (both seeders ×4 sites each, `seederHelpers.applySeedPosition`, `engine.applyPins`). **One reader**: `SigmaGraphView.tsx:733`, inside drag-to-pin, which reads `z` only to round-trip it back into the settings pin map so pinning doesn't destroy it. `applyPins` reads it back out. A closed loop feeding nothing. The Sigma `nodeReducer` returns `{...base, x, y}`; no node or edge program consumes `z`.
Impact: the 3D work inherits a plumbed-but-never-pressure-tested axis. It has never been *wrong* in a way anyone would notice.
Guard: `tests/e2e/graph-contract.spec.ts` › "z is not consumed by the renderer or the physics"

### GD-012 · `z` is never initialized by the graph builder
Opened: 2026-07-12
Status: OPEN
Area: attributes
Evidence: `buildGraphologyGraph.ts:83-84` sets `x: 0, y: 0` only. Nodes the seeders never touch have **no `z` attribute at all** — `undefined`, not `0`.
Impact: a 3D renderer must default defensively or it will read `undefined` into a float.
Guard: `tests/e2e/graph-contract.spec.ts` › "z is not consumed by the renderer or the physics"

### GD-013 · `z` is constant 0 under the default dialect
Opened: 2026-07-12
Status: OPEN
Area: attributes
Evidence: `radialBackbone` sets `myZ = parentPos.z` — z is inherited unchanged down the whole tree from a zero root. Only `parallelSpines` produces genuine azimuthal depth (`myZ = parentPos.z + sin(axis)·cosPhi·directoryOffset`).
Impact: turning on a 3D camera against the default dialect shows a flat plane. Depth exists only in parallel-spines today.
Guard: `tests/e2e/graph-contract.spec.ts` › "radial-backbone seeds a planar graph (z === 0)"

### GD-014 · Node `size` is a RADIUS IN GRAPH UNITS, not pixels
Opened: 2026-07-12
Status: OPEN
Area: attributes
Evidence: Sigma is constructed with `itemSizesReference: "positions"` (`SigmaGraphView.tsx:430`). `size`/`baseSize` therefore share the coordinate space of `x`/`y` and scale with the camera.
Impact: **any imported renderer or physics engine that assumes screen-space pixels will be wrong by the camera ratio.** This exact confusion already cost us once — `computeNodeSize` was inflated until a node's radius equalled the gap to its neighbour (see `LAYOUT_AND_PHYSICS.md` L-019).
Guard: `tests/e2e/gwells-seed-separation.spec.ts` › "node scale › no node is so large it cannot fit between a directory and its parent"

### GD-015 · `type` and `nodeType` mean different things
Opened: 2026-07-12
Status: OPEN
Area: attributes
Evidence: `type` is the **Sigma render program id** (`glass-sphere | sun | crystal | orb | pip`); `nodeType` is the **semantic kind** (`directory | code | doc | config | fixture | file | spine | …`).
Impact: a renderer keying geometry off `type` gets Sigma program names. The most confusable pair in the model — rename deliberately when importing a different geometry system.
Guard: `tests/e2e/graph-contract.spec.ts` › "node attribute contract is exactly this set"

### GD-016 · `x`/`y` and `size` each have three independent writers
Opened: 2026-07-12
Status: OPEN
Area: attributes
Evidence: `x`/`y` ← builder (init), gwells (seeders + per-tick integrator), renderer drag handler. `size` ← builder, `graphStylePolicy`, renderer live `nodeSize` effect.
Impact: **anything a new renderer writes to `color` or `size` is clobbered on the next hover** — `resetGraphStyles()` rewrites both on every node and edge on every interaction change, sourcing colour from `raw.color` and size from `baseSize`.
Guard: none

### GD-017 · `alpha` is written by dimming policy and read by nobody — all of dim mode is inert
Opened: 2026-07-12
Status: OPEN
Area: attributes
Evidence: `dimmingPolicy.ts` writes `alpha` on every node and edge. Sigma has no `alpha` attribute. No `nodeReducer` maps it to colour alpha (the only reducer handles spine pinning). `PlasmaEdgeProgram` ignores colour entirely. The shaders' local `float alpha` is anti-aliasing falloff, unrelated.
Impact: **the entire focus/context dimming feature writes into the void.** A renderer that honours `alpha` would fix it for free — this is a genuine win available during the port.
Guard: `tests/e2e/graph-contract.spec.ts` › "alpha is written but not consumed"

### GD-018 · `_phase` and `_midStop` are read by the edge shader and written by nobody
Opened: 2026-07-12
Status: OPEN
Area: attributes
Evidence: `PlasmaEdgeProgram.processVisibleItem` reads `data._phase` and `data._midStop`; no writer exists anywhere. They fall back to `0` and `0.5` forever.
Impact: every edge pulses **identically and in phase**. Likely a large part of why the edges read as one undifferentiated animated mass.
Guard: none

### GD-019 · Edge colour is discarded by the GPU
Opened: 2026-07-12
Status: OPEN
Area: attributes
Evidence: `PlasmaEdgeProgram.processVisibleItem` reads `size`, `_phase`, `_midStop`, `_hoverFactor` — **never `data.color`**. `defaultEdgeType: "plasma"` and `plasma` is the only registered edge program.
Impact: every edge-colour write in `graphStylePolicy` (default, selected, hovered, secondary, tertiary) is thrown away. `themeTokens.graph.edge*` and `edgeColorScale` are effectively unused. Only edge *size* survives to the GPU.
Guard: none

### GD-020 · `label` is destructively truncated; `fullLabel` is the real text
Opened: 2026-07-12
Status: OPEN
Area: attributes
Evidence: `label` is rewritten (and set to `""` to hide) by the label policy on every pass. `getStoredLabel` reads `fullLabel ?? originalLabel`.
Impact: an imported renderer must read `fullLabel` for real text. Reading `label` gets you a truncated, possibly empty, display string.
Guard: `tests/e2e/graph-contract.spec.ts` › "node attribute contract is exactly this set"

### GD-021 · Attributes written and never read
Opened: 2026-07-12
Status: OPEN
Area: attributes
Evidence: nodes — `cluster` (everyone reads `raw.cluster` instead), `componentIndex`, `isInLargestComponent`. Edges — `id` (the key is authoritative), `weight` (hardcoded `1`, never varies).
Impact: dead payload. Safe to delete; do it before adding more.
Guard: none

### GD-022 · `nodeType` and `relationship` are free-form strings with no validation
Opened: 2026-07-12
Status: OPEN
Area: attributes
Evidence: draft types are `type?: string` / `relationship?: string`. No central enum. Values are recognized by string comparison at ~8 sites; unrecognized values fall through to structural inference. The only real union in the tree (`fixtures/types.ts`) applies solely to the bundled self-graph fixture.
Impact: **`"contains"` is the single relationship with structural meaning** — it defines the tree that drives all seeding, roles, `requireEdge` filters, and aggregate sizing. Everything else is decoration. An imported adapter that misspells it silently loses the hierarchy.
Guard: none

---

## Physics boundary

### GD-023 · The simulation is strictly 2D and `dt` is implicit = 1 frame
Opened: 2026-07-12
Status: OPEN
Area: physics
Evidence: `GWNodeState` has `vx`/`vy` and **no `vz`**. Every force is a 2-vector. Integration is `newX = x + state.vx` — no timestep term. Damping is a per-frame multiplier, not exponential in dt.
Impact: **an imported engine that assumes a `dt` parameter or 3-vectors will not drop in.** Also means physics is framerate-dependent.
Guard: `tests/e2e/graph-contract.spec.ts` › "z is not consumed by the renderer or the physics"

### GD-024 · Force evaluation is brute-force all-pairs
Opened: 2026-07-12
Status: OPEN
Area: physics
Evidence: interactions bucket by source well type, then O(|source nodes| × |target nodes|) per interaction. No quadtree, no Barnes-Hut anywhere.
Impact: **the scaling wall.** Probably the single most valuable thing an imported physics engine replaces.
Guard: none

### GD-025 · Two of the five force kinds are inert
Opened: 2026-07-12
Status: OPEN
Area: physics
Evidence: `attraction` is registered by **no** interaction. `linear-alignment` is a documented no-op in the force loop ("Documentary force for C1") — it only marks `interactionFired`. Live kinds: `repulsion`, `spring`, `perpendicular`.
Impact: the vocabulary is smaller than the type union advertises.
Guard: none

### GD-026 · The seed handshake fails silently
Opened: 2026-07-12
Status: OPEN
Area: physics
Evidence: a seeder must write **two graph-level maps**, not just `x`/`y`. `__gwellsSeedPositions` (`Map<id,{x,y,z}>`, every node) feeds the `seedAdherence` restoring force **and** the per-pair spring rest lengths — a parent/child spring's ideal length is *the distance the seeder chose*, not the well-type default. `__seededSpinePositions` (spine nodes only) is read by the Sigma `nodeReducer` and **overrides x/y at render time**.
Impact: an imported seeder that writes only x/y silently disables seed adherence, collapses springs to a static default, and breaks spine pinning — **with no error**. Highest-risk contract for the import.
Guard: `tests/e2e/graph-contract.spec.ts` › "the seed handshake maps exist and are populated"

### GD-027 · Non-finite guard warnings are discarded in the animated path
Opened: 2026-07-12
Status: OPEN
Area: physics
Evidence: `GWStepResult.warnings` accumulates non-finite force/position events, and the rAF `tick()` throws the result away. Warnings surface only if you call `controller.step()` yourself. The `"warning"` `GWDebugEvent` type is declared but **never emitted**.
Impact: NaN guards fire silently in the normal path. A physics import that destabilizes would look like "the graph is a bit weird" rather than an error.
Guard: none

### GD-028 · `seedParams` is `Record<string, unknown>` and unvalidated
Opened: 2026-07-12
Status: OPEN
Area: physics
Evidence: each seeder re-validates with its own `resolveParams`, defaulting unknown keys.
Impact: a typo in a seed param is a silent default, not an error. This is the escape hatch an imported lab will use, and the place its config will quietly not apply.
Guard: none

### GD-029 · Well assignment runs once, not on config override
Opened: 2026-07-12
Status: OPEN
Area: physics
Evidence: assignment happens at `applyDialect`; `applyConfigOverride` re-seeds and rebuilds caches but does **not** re-assign well types.
Impact: a config change that should move nodes between well types won't.
Guard: none

---

## Theme / style pipeline

### GD-030 · Cluster colour outranks the theme
Opened: 2026-07-12
Status: OPEN
Area: theme
Evidence: `resetGraphStyles` reads `attrs.raw.color` **before** `tokens.nodeColor.default`, and `raw.color` is written from a theme-independent cluster palette (`cluster-colors.json`, absolute hex, "decision D2").
Impact: on a clustered graph `nodeColor.default` is **never seen**. Theme switching only repaints unclustered nodes, selection states, and hover. This is by design — but it means "the theme controls node colour" is false.
Guard: none

### GD-031 · Sizes are not themeable
Opened: 2026-07-12
Status: OPEN
Area: theme
Evidence: all `nodeSizeMultiplier`, `edgeSize`, `labelFontSize`, `labelTruncation`, `sigmaConfig` values are **hardcoded** inside `resolveGraphVisualTokens`. Only colours flow from the theme. `relationshipEndpoint: "#2563eb"` is hardcoded too.
Impact: a theme cannot change geometry, only palette.
Guard: none

### GD-032 · Edge colours come from a second, parallel per-theme palette read from inside the shader
Opened: 2026-07-12
Status: OPEN
Area: theme
Evidence: `PlasmaEdgeProgram.setUniforms` calls `useSettingsStore.getState()` directly and looks up `PLASMA_THEME_DEFAULTS[themeId]` — ~24 uniform params + `colorIn`/`colorOut` hex pairs, entirely unrelated to `themeTokens.graph.edge*`.
Impact: the shader is coupled to global app state, and there are **two disconnected theme systems for edges**. Pairs with GD-019 (the attribute path is dead, so this is the *only* live path).
Guard: none

### GD-033 · `dimMode` never reaches the style policy
Opened: 2026-07-12
Status: OPEN
Area: theme
Evidence: `settings.graphView.dimMode` exists and is written by `InspectorMiniGraph`, but **all three** `applyGraphStylePolicy` call sites omit the `dimMode` argument, so it falls through to `"off"` unless `pinnedHighlightActive` forces `"outside-pinned"`.
Impact: inert on the main canvas. Compounds GD-017 (even if passed, nothing reads `alpha`).
Guard: none

### GD-034 · `dimOpacity` is hardcoded, ignoring the per-theme token
Opened: 2026-07-12
Status: OPEN
Area: theme
Evidence: hardcoded `0.18` at the call site; `themeTokens.selection.dimOpacity` varies 0.12–0.22 per theme and is not read.
Impact: minor, but it means a theme token exists that does nothing.
Guard: none

### GD-035 · The `outside-cluster` dim BFS is unbounded
Opened: 2026-07-12
Status: OPEN
Area: theme
Evidence: `DimPolicyState.clusterDepth` is **never used**; the comment `// Stop at cluster depth` describes intent only. The BFS floods the entire connected component.
Impact: on a connected graph it dims nothing except other components.
Guard: none

### GD-036 · `zoomLabelThreshold` is dead
Opened: 2026-07-12
Status: OPEN
Area: theme
Evidence: declared in props, defaulted `1.15`, in settings, in the memo comparator — its **only consumer is the debug StatusBar**. No camera-ratio gate exists. Sigma's own `labelRenderedSizeThreshold: 6` (a *size*, not a *zoom*, threshold) is the de-facto behaviour.
Impact: a knob that looks like it controls label zoom behaviour and does not.
Guard: none

### GD-037 · Shortest-path highlight ignores the theme
Opened: 2026-07-12
Status: OPEN
Area: theme
Evidence: writes `graphVisualTokens.nodeColor.selected` — the **static module fallback**, not `resolvedTokens`. Always `#fbbf24`.
Impact: path highlight is the same colour in every theme.
Guard: none

### GD-038 · Neighborhood depth ≥ 4 styling is unreachable
Opened: 2026-07-12
Status: OPEN
Area: theme
Evidence: `NeighborhoodDepth = 1 | 2 | 3`, and every caller narrows to `1|2|3`. The quaternary block in `graphStylePolicy` never runs.
Impact: dead branch.
Guard: none

### GD-039 · GlitterField desyncs from its node on pan/zoom
Opened: 2026-07-12
Status: OPEN
Area: theme
Evidence: positioned by projecting the selected node through `sigma.graphToViewport()` inside an IIFE **in JSX**, recomputed on every AppShell render — not on camera move.
Impact: the selection sparkle drifts away from the node while panning or zooming.
Guard: none

### GD-040 · Target-scoped geometry overrides never reach the canvas
Opened: 2026-07-12
Status: OPEN
Area: theme
Evidence: the `lw:override-change` listener early-returns when the **global** override is `undefined`, so only `setGlobalOverride("node.geometry.preset")` takes effect. `GeometryTab` can write target-scoped overrides that do nothing.
Impact: a UI control that silently does nothing in one of its scopes.
Guard: none

### GD-041 · `SolarBackdrop` re-renders every 16ms and has a hardcoded base gradient
Opened: 2026-07-12
Status: OPEN
Area: theme
Evidence: starfield animated by `setInterval(…, 16)` driving React state — a component re-render per frame. Base `linear-gradient(135deg, #0a0a0f, #1a1025, #0f0a15)` is hardcoded, so the backdrop's base never changes with the theme.
Impact: avoidable per-frame React work behind the canvas, and a theme that can't fully theme its own background.
Guard: none

---

## Registries / settings

### GD-042 · `physicsDialectRegistry` is a stale duplicate in an incompatible ID namespace
Opened: 2026-07-12
Status: OPEN
Area: registries
Evidence: it registers `dialect.gwells.radial-backbone`; the engine's real registry uses `gwells.dialect.radial-backbone`. **The IDs cannot even be joined.** Its `paramSchema` is not what the engine accepts. Nothing in `src/physics/` imports it. Header still reads "v86e: contract stub. Empty registry; v93 implements."
Impact: **do not wire an imported engine into this.** It looks like the taxonomy and is not.
Guard: `tests/e2e/graph-contract.spec.ts` › "the real dialect registry is the one the engine reads"

### GD-043 · `lensRegistry` dispatches nothing
Opened: 2026-07-12
Status: OPEN
Area: registries
Evidence: `layoutFn` was explicitly dropped ("no dispatch yet"). Its ids (`lens.radial-backbone`, …) are **disjoint** from the `LayoutLensId` union in the schema. Sole consumer is the inventory panel.
Impact: a descriptive catalog masquerading as a dispatch table.
Guard: none

### GD-044 · Three unsynchronized copies of the layout tuning numbers
Opened: 2026-07-12
Status: OPEN
Area: registries
Evidence: gwells `seedParams` (real), `physicsDialectRegistry.defaultSettings` (hand-copied), `lensRegistry.suggestedSettings` (hand-copied again). No synchronization.
Impact: two of the three are already wrong and nothing notices. Consolidate or delete before importing a fourth.
Guard: none

### GD-045 · `graphView.defaultLayout` enumerates seven layouts that do not exist
Opened: 2026-07-12
Status: OPEN
Area: settings
Evidence: typed `LayoutLensId = "constellation" | "districts" | "solar-orbit" | "helix" | "trihelix" | "pipeline" | "impact-rings"`. **Zero readers** outside schema/defaults/migrations. None of the seven exist in `lensRegistry` or in the engine (which knows two dialects).
Impact: the single most misleading knob in the schema.
Guard: none

### GD-046 · Dead and write-only graphView knobs
Opened: 2026-07-12
Status: OPEN
Area: settings
Evidence: `showArrows` — zero references. `showIsolatedNodes`, `showLowConfidenceEdges` — written only by command-palette entries, **read by nobody**. `defaultRenderer` — only consumer prints it as a debug string.
Impact: four knobs a user can change that do nothing.
Guard: none

### GD-047 · Control-plane registries reference settings paths that no longer exist
Opened: 2026-07-12
Status: OPEN
Area: settings
Evidence: `handleset.registry` and `controlSurfaceContract.registry` declare `graphView.nodeSelectionStage` (superseded by `neighborhoodDepth`), `physics.nodeSize` (moved to `graphView` in the v81→v82 migration), and `graphIntelligence.*` (no such slice exists).
Impact: dangling handles. The registries assert a contract the schema does not honour.
Guard: none

### GD-048 · Dead registry files
Opened: 2026-07-12
Status: CLOSED
Area: registries
Evidence: `src/control-plane/features/feature-registry.ts` is a **0-byte file** with zero importers. `src/graph/edges/edgeStyleRegistry.ts` is an empty stub (`entries: EdgeStyleEntry[] = []`) with zero consumers — despite `themeTokens.edge.stylePreset` already carrying `"plasma" | "wire" | "ribbon"` per theme.
Impact: delete, or populate `edgeStyleRegistry` and make the theme token mean something.
Guard: none
Closed: 2026-07-12 · both deleted in RM-001, along with `EDGE_STYLE_REGISTRY_CONTRACT.md`. NOTE THE LOOSE END: `themeTokens.edge.stylePreset` still carries `"plasma" | "wire" | "ribbon"` per theme and now has no registry behind it at all — it was already inert (only `plasma` is registered with Sigma), so this changes nothing at runtime, but if edge style presets are wanted, they must be built fresh. Folded into RM-010.

### GD-049 · The Graph Visual Inventory renders fake registries with the same weight as real ones
Opened: 2026-07-12
Status: OPEN
Area: registries
Evidence: `GraphVisualInventoryPanel` displays eight registries — including the stale `physicsDialectRegistry` and inert `lensRegistry` — with no live/dead distinction. It does **not** display the three registries that actually drive the canvas (`nodeProgramRegistry`, `themeTargetRegistry`, gwells `dialects`/`seedFunctions`).
Impact: the one surface built to be "the place you observe the system" is actively misleading. Fixing it means **feeding it truth, not adding controls** — its e2e suite correctly asserts read-onlyness.
Guard: none

---

## Found by the guards

### GD-050 · `isSun` is computed by the builder and deleted by the renderer on the next line
Opened: 2026-07-12
Status: OPEN
Area: attributes
Evidence: `buildGraphologyGraph` finds the highest-degree node per cluster and tags them (`setNodeAttribute(sunNodeId, "isSun", true)`; `clusterSunCount` records **11** on the self-graph). `SigmaGraphView.tsx:347-350`, immediately after `buildGraphologyGraph` returns, does:
```ts
// Clear solar orbit attributes on rebuild
graph.forEachNode((nodeId) => { graph.removeNodeAttribute(nodeId, "isSun"); });
```
…on the freshly built graph. Measured: **0 nodes carry `isSun`; 11 carry `cluster`** — which is set on the adjacent line and survives. That asymmetry is what exposed it.
Impact: `graphStylePolicy`'s sun branch (`isSun` → cluster colour + **×1.8 size**) is **unreachable dead code**. The "sun" concept exists in the builder, the style policy, and the theme geometry preset — and never fires. Comment says "on rebuild", but it runs on **every** build, not only rebuilds.
Guard: `tests/e2e/graph-contract.spec.ts` › "isSun is deleted immediately after it is computed"
Note: found by the attribute-contract guard on its **first run** — no amount of reading the map would have caught it, because both halves look correct in isolation. This is the case for guards over prose.
