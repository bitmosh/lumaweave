# Graph Display Map — everything that decides what you see on the canvas

**Purpose.** One place to see every subsystem that touches graph rendering, the contract each one speaks, and — critically — which parts are **live**, which are **dead**, and which are **lying**. Written as the reference for importing external work (a physics engine, a three.js renderer, custom GLSL node shaders, a real z-axis) without landing it on a seam that isn't there.

> **This document is narrative, and narrative goes stale.** It is a snapshot taken **2026-07-12**.
>
> The things that do *not* go stale live elsewhere, and they are the authority:
> - **`docs/ledger/GRAPH_DISPLAY.md`** — the append-only findings ledger (`GD-###`). Items are closed by appending a dated line, never by rewriting.
> - **`tests/e2e/graph-contract.spec.ts`** — executable guards. These are **characterization tests**: they assert what is *currently true*, including several known defects, on purpose. When a guard fails, a documented fact has changed — go close the ledger entry.
>
> If this document and a guard disagree, **the guard is right**. Fix the document.
>
> (This is not theoretical: the attribute-contract guard found GD-050 on its first run — `isSun` is computed by the builder and deleted by the renderer on the next line — a bug that reading the code did not surface, because both halves look correct in isolation.)

Verified against the tree, not against older docs. Every claim below is `file:line`-checkable.

---

## 0. The five-second version

- **Graphology is the scene model, and it is renderer-neutral.** Physics, style policy, labels, neighborhood, and dimming all operate on graphology attributes and never import Sigma. This is the single biggest asset in the codebase. **Keep it. Swap only the view.**
- **There is no renderer abstraction.** A `GraphRenderer` interface exists with **zero importers**; `src/renderers/` is an **empty directory**. The de-facto renderer API is the global **`window.__lwSigma`**, read by 7 files outside the renderer.
- **`z` is write-only.** Six writers, one reader — and that reader only round-trips it back into settings so a pin doesn't destroy it. Nothing renders it. No force touches it.
- **The physics is strictly 2D, `dt` is implicit = 1 frame, and force evaluation is brute-force all-pairs.**
- **Several visual features write into the void.** Edge colours, node/edge `alpha` (i.e. all of dim mode), and per-edge shader phase are computed and then discarded. See §6.

---

## 1. The pipeline, end to end

```
source adapter
  └─► LumaWeaveNodeDraft[] / LumaWeaveEdgeDraft[]        (untyped `raw` bag)
        └─► buildGraphologyGraph()                        ← the ONLY builder
              └─► graphology Graph({ multi: true })       ← THE SCENE MODEL (renderer-neutral)
                    ├─► gwells applyDialect()             ← seeds, then mutates x/y every frame
                    ├─► graphStylePolicy                  ← rewrites color/size/labelColor/alpha
                    ├─► graphLabelPolicy                  ← rewrites `label`
                    ├─► dimmingPolicy                     ← writes `alpha` (NOTHING READS IT)
                    └─► SigmaGraphView                    ← the ONLY renderer
                          ├─ nodeProgramClasses  (5 WebGL programs)
                          ├─ PlasmaEdgeProgram   (1 WebGL program)
                          └─ window.__lwSigma    ← the real, unofficial API surface
```

Everything above the `SigmaGraphView` line is portable. Everything at or below it is Sigma.

---

## 2. Node attribute contract

`size`/`baseSize` are **radii in graph units**, not pixels — Sigma runs with `itemSizesReference: "positions"` (`SigmaGraphView.tsx:430`), so they live in the same coordinate space as `x`/`y` and scale with the camera. **Any renderer or physics engine that assumes pixels will be wrong by the camera ratio.** (This exact confusion produced nodes as wide as the gaps between them; see `LAYOUT_AND_PHYSICS.md` L-019.)

| Attribute | Type | Meaning | Written by | Read by |
|---|---|---|---|---|
| `x`, `y` | number | graph-space position | builder (init 0), **seeders**, **engine** (per tick), **drag handler** | engine, Sigma, drag |
| **`z`** | number | depth | seeders, `applyPins` | **drag-pin round-trip only — see §3** |
| `fixed` | boolean | engine skips this node | engine, drag handler | engine |
| `rawSize` | number | source content size (aggregate for dirs) | builder | seeders (child sort order) |
| `baseSize` | number | **structural radius**, pre-user-multiplier | builder | style policy, seeders, renderer |
| `size` | number | **rendered radius** = `baseSize × settings.nodeSize`, then restyled | builder, **style policy**, renderer | Sigma |
| `color` | string | fill | builder (from `raw.color`), style policy, path highlight | Sigma / node programs |
| `label` | string | **truncated, mutable, may be `""`** | builder, label policy, hover | Sigma |
| `fullLabel` | string | **the real text** — immutable | builder | label policy, hover |
| `originalLabel` | string | duplicate of `fullLabel` (legacy) | builder | label policy fallback |
| `labelColor` | string? | per-node label tint (hover only) | style policy | Sigma (`labelColor: { attribute }`) |
| `type` | `NodeProgramId` | **Sigma render program** — `glass-sphere \| sun \| crystal \| orb \| pip` | builder, override listener | Sigma |
| `nodeType` | string | **semantic kind** — `directory \| code \| doc \| config \| fixture \| file \| spine \| …` | builder | engine, seeders, structural resolver, renderer |
| `raw` | object | full source payload (`color`, `cluster`, `size`, `path`, …) | builder | style policy (`raw.color`), resolver, inspector |
| `isSun` | boolean | highest-degree node in cluster | builder | style policy (×1.8 size) |
| `isIsolated` | boolean | singleton component | builder | style policy (×0.75 size) |
| `isEndpoint` | boolean | terminal spine node | **seeders** | dialect well-assignment |
| `alpha` | number | dim opacity | dimming policy | **NOBODY — see §6** |

### Two traps

**`type` vs `nodeType`.** `type` is the *renderer program id*. `nodeType` is the *semantic kind*. A new renderer keying geometry off `type` gets Sigma program names. Rename deliberately if you import a different geometry system.

**Anything you write to `color` or `size` will be clobbered.** `resetGraphStyles()` rewrites both on **every** node and edge on **every** interaction change, sourcing colour from `raw.color` and size from `baseSize`. Renderer-owned writes to these do not survive the next hover.

### Written but never read (safe to delete)
`cluster`, `componentIndex`, `isInLargestComponent` (nodes); `id`, `weight` (edges). Graph-level diagnostics `clusterSunCount`, `componentCount`, `isolatedNodeCount`, `largestComponentSize`.

### Does not exist
`hidden`, `forceLabel`, `zIndex` are **not graph attributes** anywhere in this tree, despite appearing in older notes.

---

## 3. The z-axis — exact current state

**Verdict: computed, stored, persisted, and dropped on the floor at the render boundary.**

**Writers (6):** both seeders (directories, files, spine nodes, fronds), `seederHelpers.applySeedPosition`, and `engine.applyPins` (pass-through only).

**Readers (1):** `SigmaGraphView.tsx:733`, inside drag-to-pin — it reads `z` purely to write it back into the settings pin map so pinning doesn't destroy it. `applyPins` then reads it back out and re-writes it to the graph. **A closed loop that feeds nothing.**

**Provably unused:** the Sigma `nodeReducer` returns `{...base, x, y}` and never touches z. The integrator reads only `x`/`y`; `GWNodeState` has `vx`/`vy` and **no `vz`**. No node or edge program consumes z. Spring rest-lengths are computed 2D, ignoring z.

**Three caveats for the 3D work:**
1. `buildGraphologyGraph` **never initializes `z`** — un-seeded nodes have **no `z` attribute at all** (`undefined`, not `0`). Default defensively.
2. Under **radial-backbone** (the default dialect) `z` is a constant **0** — the seeder inherits it unchanged down the tree. Only **parallel-spines** produces genuine azimuthal depth.
3. **Physics will never update `z`.** It is a frozen seed value.

There is a hard-won lesson attached to it (`GWELLS_PHYSICS.md`): parallel-spines once fanned its branches in the **x/z plane**, which Sigma projects to a *line* — the structure was invisible and the nodes rendered as a pile. **Structure that must be visible today has to live in the plane the camera actually renders.** `z` is for data that is waiting, not for structure that is load-bearing now.

---

## 4. Physics ↔ graph boundary

**The graph is the interface.** No position-buffer handoff — `applyDialect(graph, dialectId, opts) => GWController` takes a live graphology `Graph` and mutates it in place. An imported engine must speak graphology.

| Direction | Surface |
|---|---|
| **In** | node `x`, `y`, `fixed`, `nodeType`/`raw.type`/`raw.kind`, `isEndpoint`, `baseSize`; edge `relationship`/`raw.type === "contains"` |
| **Out** | node `x`, `y` per tick; graph attrs `__gwellsState`, `__gwellsSeedPositions`, `__seededSpinePositions`, `__gwellsPinnedSet` |
| **Control** | `GWController`: `stop/pause/resume/step/getRuntimeState/getDialectId/getResolvedConfig/applyConfigOverride/applyPins` |
| **Drive** | self-scheduling rAF; injectable `GWScheduler`; `step()` for headless |

### Properties an imported engine must match (or deliberately break)
- **Strictly 2D.** No `vz`, no 3-vectors, no z force.
- **`dt` is implicit = 1 frame.** Position update is literally `x + vx`. Damping is a per-frame multiplier, *not* exponential in dt. A lab that assumes a timestep will not drop in.
- **Brute-force all-pairs.** Interactions bucket by source well type, then O(|source| × |target|). No quadtree, no Barnes-Hut. **This is the scaling wall — the most valuable thing to replace.**
- **Vocabulary is small and fixed:** 4 well types, 8 interactions, 5 force kinds (**2 inert** — `attraction` is registered by nothing; `linear-alignment` is a documented no-op), 3 `requireEdge` filters, **5 per-well parameters**.

> **The parameter trap.** Any parameter name the force loop doesn't read does nothing, silently. `siblingRepulsion` was tuned across four well types and overridden per-dialect and **read by nothing** — anyone tuning the layout reached for the parameter *named after the problem* and watched it do nothing. It has been deleted. Don't reintroduce the shape.

### The seed handshake — easy to miss, breaks silently
A seeder must write **two graph-level maps**, not just `x`/`y`:

- **`__gwellsSeedPositions`** — `Map<id, {x,y,z}>`, **every** node. Feeds the `seedAdherence` restoring force **and** the per-pair spring rest lengths. The spring's ideal length for a parent/child pair is *the distance the seeder chose*, not the well-type default.
- **`__seededSpinePositions`** — `Map<id, {x,y}>`, spine nodes only. Read by the Sigma `nodeReducer`, which **overrides x/y at render time**. Spines are pinned twice: by `wellType.pinned` and again at the renderer.

An imported seeder that writes only x/y silently disables seed adherence, collapses springs to a static default, and breaks spine pinning — **with no error.**

### Well assignment
Runs **once**, at `applyDialect` (not on config override). Two-tier: explicit attribute tags (`nodeType`, `isEndpoint`) first, then structural inference from `analyzeGraphStructure` (roles: `root/spine/container/leaf/orphan/hub/bridge/unknown`, via BFS depth + Tarjan articulation points). **The `contains` edge is the load-bearing structural fact** across the entire system — roles, parent map, `requireEdge` filters, seeder trees, aggregate sizing.

### Observability that already exists
`GWStepResult` carries `stepsRun, movedNodeCount, maxVelocity, averageVelocity, warnings` plus `GWStepTimings { totalMs, resetMs, seedLookupMs, forceInteractionsMs, auxForcesMs, integrationMs }` — **ready-made for benchmarking an imported engine against this one.** `GWNodeState.activeInteractions` tells you which forces pulled on a node this frame.

⚠️ **Gap:** `GWStepResult.warnings` (non-finite force/position guards) is **discarded by the rAF loop** — it only surfaces if you call `step()` yourself. NaN guards fire silently in the animated path.

---

## 5. Visual / style / theme pipeline

```
settings.appearance.theme ──► getThemeRuntimeTokens ──► themeTokens
   ├─► app.*      ──► rAF crossfade (300ms) ──► --lw-* CSS vars ──► DOM chrome + overlays
   ├─► backdrop.* ──► React props ──► SolarBackdrop (DOM)
   ├─► graph.*    ──► resolveGraphVisualTokens ──► resolvedTokens prop
   │                    └─► applyGraphStylePolicy ──► graphology attrs
   │                          ├─ node color/size ──► RENDERED
   │                          ├─ edge color      ──► DISCARDED  (§6)
   │                          ├─ edge size       ──► RENDERED
   │                          └─ alpha           ──► DISCARDED  (§6)
   ├─► node.geometry.preset ──► node `type` attr ──► program select ──► RENDERED
   └─► themeId ──(read from store INSIDE the shader)──► PLASMA_THEME_DEFAULTS ──► edge colors ──► RENDERED
```

**CSS variables cannot reach WebGL.** The canvas is themed by three separate mechanisms:
1. **JS token props → graphology attributes** → Sigma packs colour strings into vertex buffers. *Node colours only.*
2. **Uniform refs** — `uniformsRef` (`time`, `hum`, `flowSpeed`, `glowStrength`) is monkey-patched onto the Sigma instance and read by every node program's `setUniforms`. Fed from `settings.appearance.*`, **not** from theme tokens.
3. **`PlasmaEdgeProgram` reads the settings store directly** and looks up a *second, parallel per-theme palette* (`PLASMA_THEME_DEFAULTS`) that has nothing to do with `themeTokens.graph.edge*`.

**Cluster colour outranks the theme.** `resetGraphStyles` reads `raw.color` *before* the token, and `raw.color` is written from a theme-independent cluster palette. So on a clustered graph, `nodeColor.default` is **never seen**; theme switching only repaints unclustered nodes, selection states, and hover.

**Sizes are not themeable.** All `nodeSizeMultiplier` / `edgeSize` / `labelFontSize` values are hardcoded in `resolveGraphVisualTokens`. Only colours flow from the theme.

### Node geometry presets (the shader seam you're importing into)
Five programs — `glass-sphere` (default), `sun`, `crystal`, `orb`, `pip` — all extending Sigma's `NodeCircleProgram` and overriding only the **fragment shader**. Selection: `getGlobalOverride("node.geometry.preset")` → theme token → `"glass-sphere"`. Result is written to each node's `type` attribute. All programs must be **pre-registered at construction**.

**The fragment shaders are portable nearly verbatim** — they're distance-field circle math on `v_diffVector`/`v_radius`. The inherited *vertex* path and attribute layout are not.

**`PlasmaEdgeProgram` is the hardest thing in the tree to port.** 552 lines: a from-scratch vertex+fragment pair, subdivided quadratic-bezier ribbon (12 segments, 72 verts/edge), hand-packed attributes, ~30 uniforms — and it detects Sigma's picking pass by reading `gl.getParameter(gl.FRAMEBUFFER_BINDING)` and swapping blend modes. That depends on undocumented Sigma internals.

---

## 6. Things that are computed and then thrown away

These are live bugs, and every one of them is on the seam you're importing across. **Fixing them may be free side-effects of the port.**

| What | Reality |
|---|---|
| **Edge colours** | `PlasmaEdgeProgram.processVisibleItem` reads `size`, `_phase`, `_midStop`, `_hoverFactor` — **never `data.color`.** Since `plasma` is the only registered edge program, *every* edge-colour write in the style policy (default, selected, hovered, secondary, tertiary) is discarded by the GPU. Only edge *size* survives. `themeTokens.graph.edge*` and `edgeColorScale` are effectively unused. |
| **Dim mode (all of it)** | `dimmingPolicy` faithfully computes and writes `alpha` on every node and edge, and **nothing reads it.** Sigma has no `alpha` attribute; there is no `nodeReducer` mapping it to colour alpha; the shaders' local `float alpha` is anti-aliasing falloff, unrelated. **A renderer that honours `alpha` would fix focus/context for free.** |
| **Per-edge shader variation** | `_phase` and `_midStop` are **read by the shader but written by nobody** — permanently `0` and `0.5`. Every edge pulses identically, in phase. |
| **`dimMode` setting** | Exists in the schema, written by the inspector — but **never passed** to `applyGraphStylePolicy`. Falls through to `"off"` unless `pinnedHighlightActive` forces it. |
| **`dimOpacity`** | Hardcoded `0.18`; the per-theme `selection.dimOpacity` (0.12–0.22) is ignored. |
| **`outside-cluster` BFS** | Unbounded — `clusterDepth` is never used, so it floods the whole connected component. |
| **`zoomLabelThreshold`** | In settings, in props, in the memo comparator — its **only consumer is the debug StatusBar.** No camera-ratio gate exists. |
| **Shortest-path highlight** | Writes the *static* module tokens, not `resolvedTokens` — so it's always `#fbbf24` regardless of theme. |
| **`depth >= 4` styling** | Unreachable: `NeighborhoodDepth = 1 | 2 | 3`. |
| **GlitterField** | Positioned by projecting through `sigma.graphToViewport()` during React render, not on camera move — **desyncs from the node while panning/zooming.** |

---

## 7. Registries — which are real

**Only three registries actually drive the canvas:**

| Registry | Drives |
|---|---|
| `nodeProgramRegistry` | the 5 WebGL node programs → `nodeProgramClasses` |
| `themeTargetRegistry` | theme tokens → `resolvedTokens` → node colours |
| gwells `dialects.ts` + `GW_SEED_FUNCTION_REGISTRY` | **the actual layout engine** |

**Everything else is a catalog, and two of them actively mislead:**

- **`physicsDialectRegistry` is a stale duplicate of the real dialects — in a different ID namespace.** It says `dialect.gwells.radial-backbone`; the engine says `gwells.dialect.radial-backbone`. **The IDs cannot even be joined.** Its `paramSchema` is not what the engine accepts. Nothing in `src/physics/` imports it.
- **`lensRegistry` does nothing.** `layoutFn` was explicitly dropped ("no dispatch yet"); its IDs are disjoint from the `LayoutLensId` union in the schema. Nothing dispatches on a lens.
- Consequently there are **three unsynchronized copies of the layout tuning numbers** (gwells `seedParams`, `physicsDialectRegistry.defaultSettings`, `lensRegistry.suggestedSettings`).
- `graphViewElementRegistry`, `graphVisualThemeMappingRegistry`, `motionSafetyRegistry`, `audioSourceRegistry`, `musicReactiveMappingRegistry` — all **self-declaredly passive**. Zero canvas effect.

> **Do not wire an imported engine into `physicsDialectRegistry` or `lensRegistry`.** They look like the taxonomy. They are not.

### Adding to the real registries
- **Well type:** append to `GW_WELL_TYPE_REGISTRY` (5 params + `pinned`), then reference it from ≥1 interaction *and* a dialect's `wellAssignment` — otherwise no node ever gets it.
- **Interaction:** append to `GW_INTERACTION_REGISTRY`, then add its id to a dialect's `activeInteractions` — **unlisted interactions never fire.**
- **Dialect:** append to `GW_DIALECT_REGISTRY` **and widen `GwellsDialectId`** in `settings.schema.ts` (a hardcoded string union) or the UI cannot select it.

All four gwells registries are frozen `as const` arrays with linear-scan getters. No `register()`, no subscription. Adding = editing the literal and recompiling.

---

## 8. Settings that reach the canvas

Of nine `graphView` fields, **three** reach the renderer: `nodeSize`, `hoverNodeColor`, `neighborhoodDepth`.

**Dead knobs — parsed, defaulted, persisted, migrated, never read:**

| Knob | Status |
|---|---|
| `defaultLayout` | **Zero readers.** Typed as 7 layouts (`constellation`, `districts`, `solar-orbit`, `helix`, `trihelix`, `pipeline`, `impact-rings`) — **none of which exist.** The single most misleading knob in the schema. |
| `showArrows` | Zero references. |
| `showIsolatedNodes` / `showLowConfidenceEdges` | Write-only — toggled by command-palette entries, read by nobody. |
| `defaultRenderer` | Already typed `"sigma2d" \| "cosmograph2d" \| "three3d"` — **but selects nothing**; its only consumer prints it as a debug string. |
| `dimMode` | Inert on the main canvas (§6). |

Stale settings paths referenced by control-plane registries but **absent from the schema**: `graphView.nodeSelectionStage`, `physics.nodeSize` (moved to `graphView` in the v81→v82 migration), `graphIntelligence.*` (no such slice).

**Good news for the renderer swap:** `defaultRenderer` already has the right *shape* and is already migrated. It just isn't wired.

---

## 9. Dead code

**Swept 2026-07-12** (RM-001). Deleted, with their contract docs retired alongside them:

| Path | Was |
|---|---|
| `src/renderers/` | empty directory |
| `src/graph/rendering/graphRendererInterface.ts` | `GraphRenderer` interface — zero importers, and too thin to be the real seam (no hit-testing, no viewport projection, no program registration). Deleted rather than implemented against; the real seam is designed in `RENDERER_MIGRATION.md` (RM-005). |
| `src/graph/renderers/sigma2d/labelPolicy.ts` | 331 lines, zero importers (superseded by `visual/graphLabelPolicy.ts`) |
| `src/graph/edges/edgeStyleRegistry.ts` | empty stub, zero consumers |
| `src/control-plane/features/feature-registry.ts` | 0-byte file, zero importers (feature flags live in `feature-flags.ts`, which is config, not a registry) |
| `docs/graph/contracts/GRAPH_RENDERER_INTERFACE_CONTRACT.md` | contract for a module that no longer exists |
| `docs/graph/contracts/EDGE_STYLE_REGISTRY_CONTRACT.md` | ditto |

**Still outstanding:**

| Path | Note |
|---|---|
| `src/graph/edgePrograms/shaders/*.glsl` + `src/graph/nodePrograms/shaders/*.glsl` | **7 orphaned files.** No GLSL loader in Vite; every live shader is an inline template literal in its `.ts`. **Stale duplicates that may have drifted.** Not deleted yet because the decision is *which way* to resolve them — see RM-002, and resolve it **before importing any shaders**. |
| `@sigma/node-image` | in `package.json`, never imported. Removing it touches the lockfile, so it needs a deliberate `npm uninstall`. |

**Already installed, entirely unused:** `three`, `@react-three/fiber`, `@react-three/drei`. There is a `three3d` feature flag hardcoded to `false`, and `graphView.defaultRenderer` is already typed `"sigma2d" | "cosmograph2d" | "three3d"`. **The runway is built; nothing has taken off.**

---

## 10. What the import actually has to land on

### Portable as-is (do not rewrite)
`buildGraphologyGraph`, `selectionNeighborhood`, the whole `src/graph/visual/*` policy layer, all of `src/physics/gwells/*`, selection state in AppShell. **Graphology is load-bearing across physics + policy + neighborhood — keep it.**

### Must be rewritten for a renderer swap
1. `SigmaGraphView.tsx` (~1250 lines). The props interface survives nearly intact — drop `resolvedTokens.sigmaConfig`, which names the renderer inside the theme contract.
2. `PlasmaEdgeProgram` — the picking-pass framebuffer hack has no analogue; needs a raycaster or GPU-picking pass.
3. Node program **vertex** paths (fragment shaders port nearly verbatim).
4. Camera: pan/zoom/rotate input, `viewportToGraph`/`graphToViewport`, `getDimensions`.
5. Hit-testing: `clickNode`/`enterNode`/`enterEdge`/`downNode` have no three.js equivalent.
6. Node drag — the logic is portable, the coordinate conversion is not.

### Blocks a clean swap until fixed
**`window.__lwSigma` is the real seam, and it is a global.** The minimap (4 files) and AppShell (thumbnail capture, GlitterField positioning) bypass the props interface entirely. `useMinimapNavigation` **reimplements Sigma's internal coordinate normalization** and would silently produce wrong pans under any other camera model.

> **The honest sequencing.** The abstraction this repo needs is *not* the `GraphRenderer.mount()` stub — that's too thin (no hit-testing, no viewport projection, no per-item hover, no program registration). It's a **viewport-projection + hit-testing + camera facade** that the minimap and AppShell consume *instead of* `window.__lwSigma`. **Land that first, against Sigma, with the suite green. Only then is there a seam to swap at.**

---

## 11. Where to observe this at runtime

`GraphVisualInventoryPanel` (Evidence tab / Advanced / poppable tile) already renders eight registries and is the only surface with this ambition. To become authoritative it needs:
- the **three registries that actually drive the canvas** (`nodeProgramRegistry`, `themeTargetRegistry`, gwells `dialects`) — none of which it currently shows;
- a **live/dead column** — today it renders the fake `physicsDialectRegistry` and inert `lensRegistry` with **exactly the same visual weight as the real ones**, which actively misleads.

It is a *viewer*, and its e2e suite asserts read-onlyness. Making it authoritative means feeding it truth, not adding controls.
