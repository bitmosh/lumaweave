---
id: roadmap.dev.v86.through.v92
title: Dev Roadmap — vP-Registry-1 → v86 → v92
type: roadmap
status: current
cluster: slate
domain: roadmap
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-10
references:
  - mission.control.overview
  - bandit.changelog
  - registries.link.network.overview
  - v86.index
  - v86.roadmap
tags: [roadmap, dev, v86, v87, v88, v89, v90, v91, v92, vp-registry, fluff-dates, scaffolding]
---

# Dev Roadmap — vP-Registry-1 Phase Y → v86 → v92

## Purpose

The active development plan from current state through v92 (Audio Reactivity centerpiece). Each arc has a single mission, a list of scaffold items that fold in additive types/registries from the post-v86 brainstorm, references to the visual "fluff-date" demos that share its arc tag, and explicit out-of-scope notes.

This document is **operational** — it directs the next pass and the one after that. It is not a vision doc (see `docs/_archive/brainstorm/` for the long-form brainstorm bundle) and not a contract doc (each arc has its own phase packet for surgical scope).

Refresh: at every arc completion. The "Current State" section updates after each accepted pass.

---

## Section 0 — Current State

```
Bandit:        P1·S9 Level 142.0
               Living Graph Architect, Keeper of the Forensic Codex,
               Slayer of Playwright Failures
Last accepted: vP-Forensics-2 (2026-05-08, 361 passed, 6 skipped)
In progress:   vP-Registry-1 Phase Y (resumption from A.2 onward)
Test baseline: 361 passed / 6 skipped / 0 failing
Product:       0.6.0 → 0.7.0 (on v86e completion)
QA Spine:      v86a accepted; v86b PARTIAL accepted
QA Key:        v74b (governance-only)

v86 Sub-Arcs:
  v86a Foundations              ✅ ACCEPTED
  v86b Visual Treatment         ⚠️  PARTIAL (test infrastructure deferred to vP-Tests)
  v86c Tile System              ⏳ pending
  v86d Inspector Mini-Graph     ⏳ pending
  v86e Cosmetic Polish          ⏳ pending (depends on a + c)

Recent meta:
  Doc rehaul complete  155 docs, 0 warnings, 0 errors at validate
  9-color palette + 10th indigo locked
  5-value status vocabulary locked
  normalize-frontmatter.mjs + frontmatter-rules.yaml in place
```

---

## Section 1 — vP-Registry-1 Phase Y Resumption (IN FLIGHT)

**Mission.** Close vP-Registry-1 by shipping the per-layer documentation, registry inventory, and four gap-identification docs that Phase Y A.1 (`LINK_NETWORK_OVERVIEW.md`) forward-referenced. No code changes; pure documentation.

**Pass type:** docs.
**Risk:** low. Pure additive documentation. No runtime impact.
**Bandit's wake-up status:** report accepted, all circles high-confidence, Q1-Q6 answered.

### Deliverables (in order)

1. **A.2** — `docs/registries/LAYER_1_HANDLE_REGISTRY.md`
2. **A.3** — `docs/registries/LAYER_2_CONTROL_SURFACE_CONTRACT.md`
3. **A.4** — `docs/registries/LAYER_3_GRAPH_VISUAL_THEME_MAPPING.md`
4. **A.5** — `docs/registries/LAYER_4_GRAPH_VIEW_ELEMENT.md`
5. **A.6** — `docs/registries/REGISTRY_INVENTORY.md`
6. **B.1** — `docs/registries/LAYER_3_TOKEN_COVERAGE_GAP.md`
7. **B.2** — `docs/registries/LAYER_4_OVERLAY_ELEMENT_GAP.md`
8. **B.3** — `docs/registries/LAYER_2_OVERLAY_SURFACE_QUESTION.md`
9. **B.4** — `docs/registries/NAMING_CONVENTION_DRIFT.md`

After each commit, update `LINK_NETWORK_OVERVIEW.md`'s cross-references (single-line edits).

### Side-fix during A.2

Stale path in `controlSurfaceContract.registry.ts`:
- `docs/handleset/01_ACTIVE_HANDLES.md` → `docs/handleset/ACTIVE_HANDLES.md`
- One-line edit. Note in Phase Y completion report.

If additional stale references surface during A.3-A.5, fix as encountered, log in completion report.

### Validation gates

After each doc commits:
```bash
npm run typecheck
node scripts/normalize-frontmatter.mjs --validate-only
```

After all 9 docs ship:
```bash
npm run typecheck
npm run qa:e2e          # verify 361 passing baseline holds
node scripts/validate-contract-trace.mjs
node scripts/validate-system-index.mjs
node scripts/normalize-frontmatter.mjs --validate-only
```

### Out of scope

- Fixing the gaps identified in B.1-B.4 (those are Phase 2 territory, future vP-Registry-2)
- Re-validating Phase X (already accepted)
- Layer 3 token mapping additions (B.1 surfaces; doesn't fix)

### Acceptance criteria

- All 9 docs commit with passing frontmatter validate
- Test suite remains 361/6/0 baseline
- Forward references in `LINK_NETWORK_OVERVIEW.md` all resolved
- Phase Y entry added to `BANDIT_CHANGELOG.md`

---

## Section 2 — Pre-flight Playwright Validation (post Phase Y)

**Mission.** Confirm the 361/6/0 baseline still holds after the doc rehaul and Phase Y. Surface any drift before code work resumes.

**Pass type:** validator.
**Risk:** low if baseline holds; medium if drift surfaces (would block v86c until resolved).

### Procedure

```bash
cd ~/Projects/lumaweave
git status                    # clean tree
git log --oneline -5          # confirm Phase Y completed
npm run typecheck             # zero errors expected
npm run qa:e2e                # 361 passed / 6 skipped / 0 failed expected
```

### If baseline holds

Log a verification entry in `BANDIT_CHANGELOG.md`. Proceed to v86c.

### If drift surfaces

Stop. Report the drift. Two scenarios:
- **Test count changed** (e.g., 358/6/0): something was removed or renamed during the rehaul. Investigate, restore, re-run.
- **Failures appeared** (e.g., 359/6/2): a test broke. Forensics protocol kicks in (Bandit owns this — `BANDIT_QA_PROTOCOL.md`).

Don't move to v86c with red tests. Validation is gating.

### Out of scope

- New tests
- Test forensics on already-skipped tests (those are documented in `docs/_archive/test-forensics/`)
- Test infrastructure changes (deferred to vP-Tests)

---

## Section 3 — v86c Tile System

**Mission.** Replace the per-whole-tab tile model with per-section tear-off, snap grid, edge magnetism, group formation, and rectilinear-hull group outlines. Every accordion section grows a tear-off handle.

**Pass type:** feature.
**Risk:** medium. New UI primitive layer; lots of files; no rendering surface changes.
**Phase packet:** `docs/updates/v86+_updates/v86c_TILE_SYSTEM.md`

### Scaffold-NOW additions for v86c

Roll into v86c's "Allowed" list as additive scaffolding:

- **Tile section registry** — already in v86c scope as `tileSectionRegistry.ts`. Confirm registry contract pattern (`list / getById / filterByCategory / validateShape / register`).
- **Per-target override visibility indicator** — small CSS dot in discovery overlay when target has any non-global override. ~15 lines, additive. Lands here because the overlay is touched while wiring tile drag handles.

### Fluff-date references

None directly. Demo 03 (Inspector Mini-Graph) is v86d, not v86c. The HTML showcase has no v86c demo.

### Out of scope

- Inspector mini-graph → v86d
- Visual treatment changes → v86b
- Pin/dock zones (snap to viewport edges) → vP1 or v97
- Auto-restore tile to original panel slot → future polish

### Acceptance criteria

Per phase packet's Validation Ladder. Critical: the "BIG RULE" — group bar matches top-row width only, not bbox.

```bash
npm run typecheck
npm run qa:e2e
node scripts/validate-system-index.mjs
```

New tests: `tile-tear-off.spec.ts`, `tile-snap.spec.ts`, `tile-group-bar.spec.ts`, `tile-group-outline.spec.ts`, `tile-unsnap-grip.spec.ts`.

---

## Section 4 — v86d Inspector Mini-Graph

**Mission.** Replace the design's flat radial menu with a second-instance LumaWeave graph (SVG-based, Approach B). Four spokes ship: Color, Apply, IDE, History. Adds `target`-scope override runtime.

**Pass type:** feature.
**Risk:** medium-high. New runtime path (override resolution), new UI surface, integrates with multiple existing systems (eyedropper API, dim mode, theme heuristics).
**Phase packet:** `docs/updates/v86+_updates/v86d_INSPECTOR_MINI_GRAPH.md`

### Scaffold-NOW additions for v86d

Roll into v86d's "Allowed" list:

- **Inspector spoke registry runtime** — already in v86d scope. Confirm registry contract.
- **Reactivity primitive registry contract** — additive types/interface only. Audio mapping rules are the first concrete subset (ships v92). Land the abstract `ReactivityPrimitive` shape now since the inspector spokes touch related abstractions. ~30 lines.
- **Subscriber pattern in registry contract** — `subscribe(listener)` method on registry contract pattern. Required so mini-graph can react to spokes registered after mount. Add to `registryContract.types.ts` (extend, don't break existing).

### Fluff-date references

- **Demo 03 (Inspector Mini-Graph / Radial-as-Graph)** — arc tag `v86d · ships in keystone`. **This is the demo for this arc.** The HTML showcase shows the working interaction model: 4 corner targets, click any to summon mini-graph anchored to it, spoke physics (damped attraction + mutual repulsion), Esc to close. Reference for visual + interaction expectations.

### Out of scope

- Geometry / Type / Motion / Layout / Code spokes → v89
- Camera auto-frame to selected cluster → v89
- Live code editing in Code tab → v98
- Time-scrubbing history → v99
- `target-kind` and `cluster` scope writes → v89
- Mini-graph upgrade to second Sigma instance → v90

### Acceptance criteria

Per phase packet. Critical: target-scope override resolution honors specificity (`target` > `global`); main graph camera state preserved on inspector open; reduce-motion halts spoke physics.

```bash
npm run typecheck
npm run qa:e2e
```

New tests: spoke registry, override resolution, eyedropper integration, dim mode coupling.

---

## Section 5 — v86e Cosmetic Polish

**Mission.** Land the visible Solar Plasma identity. New TopBar (hex logo, wordmark, status pill, status cluster), new footer with command-palette hint, ControlDock rebuilt to render dock sections via the extended `settingsRegistry`. Font loading.

**Pass type:** feature.
**Risk:** low. Mostly value-consumer work. Tokens already landed in v86a.
**Phase packet:** `docs/updates/v86+_updates/v86e_COSMETIC_POLISH.md`
**Depends on:** v86a + v86c (needs the dock-section bodies the redesigned ControlDock renders).

### Scaffold-NOW additions for v86e

- **Variable font axis registry types** — additive types for variable font axis playgrounds (Demo 06). The actual playground UI is v87+. Land the `FontAxisRegistry` contract here since fonts are loaded in v86e. ~20 lines, additive.
- **Typography registry seed entries** — three entries for the three locked fonts (Space Grotesk display, IBM Plex Sans body, IBM Plex Mono mono). v86e populates; v87+ extends.
- **Decorative ⌘K hint integration with eventual hotkey registry** — keep the hint static in v86e (no runtime), but use the contract from `COMMAND_DECK_AND_HOTKEY_REGISTRY_CONTRACT.md` so the future v97 wiring is a one-line registration.

### Fluff-date references

- **Demo 06 (Variable Font Axis Playground)** — arc tag `v86e + v87 (typography system)`. v86e ships the font loading + display application; v87 adds the interactive playground UI.
- **Demo 08 (Data Viz Primitives Gallery)** — arc tag `v87 → v97 (incremental, registry-fed)`. v86e doesn't ship any primitives; just establishes the registry-driven dock that v87+ uses to add component-family entries.

### Out of scope

- Visual treatment changes → v86b
- Tile system changes → v86c
- Inspector mini-graph → v86d
- New token paths beyond what v86a added → consumer only
- Theme value changes beyond v86a
- Workshop UI of any kind → v88
- Command palette runtime → v97
- Hotkey registry → v97

### Acceptance criteria

Per phase packet. Critical: the dock is registry-driven (no hand-crafted sections), every setting reachable via the dock's category sections, fonts load via index.html preconnect.

After v86e: **Product 0.6.0 → 0.7.0. v86 arc complete.**

---

## Section 6 — v87 Theme Migration

**Mission.** Retrofit the five non-Solar-Plasma themes onto the tier model. Each theme gets thoughtful Tier 1 primitives + Tier 2 semantics, populates all 24 v86 paths, and gets a self-reported accessibility profile.

**Pass type:** feature (multi-sub-arc).
**Risk:** medium. Mostly value population, but the accessibility profile + thumbnail generation introduce real compute.
**Depends on:** v86a (token tier model), v86b (visual treatment surfaces consume the new values).

### Scaffold-NOW additions for v87

- **`ThemeAccessibilityProfile` interface** — full type from `BRAINSTORM_v87_v92.md`. Computed once at theme registration; `ARC-OWNED` UI lands later (per-theme card in picker).
- **`AssetType` enum extensions** — add `model-3d`, `environment-hdr`, `material-preset`. Three lines. Forward-compat for v94 / v101.
- **Theme thumbnail generation function** — `generateThumbnail(theme): SVGString`. ~40 lines on top of v93's culori (or hand-rolled in v87 if culori delays). Called at theme registration; result cached.
- **Variable font axis playground UI scaffolding** — types + empty registry. The interactive playground (Demo 06) lands here as a v87 deliverable.
- **Theme transition crossfade implementation** — Demo 07 lands here as a v87 deliverable. ~60 lines per the demo. Consumer of `culori` for OKLCH interpolation; if culori isn't in yet, use hex math fallback (replace later).

### Fluff-date references

- **Demo 05 (Theme Accessibility Profile)** — arc tag `v87 (Theme Migration) data shape · v93 (culori foundation) compute`. v87 lands the data shape + initial WCAG-only computation. v93 adds APCA + color-blindness simulation.
- **Demo 06 (Variable Font Axis Playground)** — arc tag `v86e + v87`. v86e shipped fonts; v87 ships the interactive playground.
- **Demo 07 (Theme Transition Crossfade)** — arc tag `v87 (Theme Migration) consumer`. **This is the demo for this arc.** Lands as part of theme switching.
- **Demo 08 (Data Viz Primitives Gallery)** — arc tag `v87 → v97`. v87 starts adding component-family entries to the new dock category.

### Out of scope

- Workshop UI → v88
- Theme inheritance → v88+
- APCA contrast computation → v93 (uses `apca-w3` library that v93 introduces)
- Color-blindness simulation matrices → v93
- 3D minimap → v94

### Acceptance criteria

- All six themes populate every canonical Tier 1 + Tier 2 token (no `// TODO(v87): review` survivors)
- `assertThemeTokenGovernanceClean()` passes for all themes
- Each theme's accessibility profile populates without errors
- Theme thumbnails render distinctly per theme (snapshot test)
- Theme transition crossfade lands and respects reduce-motion
- Variable font axis playground accessible via inspector spoke or settings

```bash
npm run typecheck
npm run qa:e2e
```

---

## Section 7 — v88 Workshop MVP

**Mission.** Theme assets become first-class authored artifacts. Users import textures/animations/shaders/fonts/sound packs; tag with families; remix existing assets; preview against any theme; publish to a local bank. Everything stays local until v100 hardening.

**Pass type:** feature (multi-sub-arc — likely v88a/b/c).
**Risk:** medium-high. Net-new UI surface (Workshop panel mode), new mutation surface (asset bank writes), introduces lineage tracking.
**Depends on:** v86a (asset bank schema), v87 (theme tier model populated).

### Scaffold-NOW additions for v88

- **Theme provenance trails schema** — `lineage` field on `ThemePreset`. Schema lands now; UI consumes it gradually.
- **Theme document model types** — content-addressed hashes (`hash`, `parentHash`), substrate for v100 signing/provenance. Land as types in v86 era; runtime in v100.
- **Credits panel data fields** — additive fields on `AssetEntry` and theme model. UI ships in v88.
- **Theme-as-code (TaC) types** — `defineTheme()` typed authoring path. Types in v86a era; runtime in v88.
- **Palette generation function** — `generatePaletteFromAnchor(anchor: OKLCH, mode)`. ~80 lines on top of culori. Workshop UI consumes; CLI or test fixture also valid consumers.

### Fluff-date references

- **Demo 01 (OKLCH Gradient Picker)** — arc tag `v88 (Workshop) · primitive consumer`. **This is the demo for this arc.** Lands as the core gradient editor inside Workshop. Depends on v93's culori for the OKLCH interpolation.

### Out of scope

- Sandbox / signing / threat model → v100
- Asset marketplace → v120+
- Asset payment integration → far future
- Cloud sync → never (local-first principle)

### Acceptance criteria

- Workshop is its own panel mode (control plane mode registry entry)
- Three Workshop tabs: Bank, Editor, Publish
- Importing 50 textures + 20 fonts + 10 shaders to the bank stays under 100ms p95 for list operations
- Theme remix produces correct lineage chain through 5+ generations
- Theme document hash is stable across reloads (deterministic serialization)
- Credits panel populates without missing attribution for any bundled asset
- OKLCH gradient picker (Demo 01) works against current palette

---

## Section 8 — v89 Inspector Full Radial

**Mission.** Add the remaining 5 spokes (Geometry, Type, Motion, Layout, Code) to the inspector mini-graph. Land `target-kind` and `cluster` scope runtime. Camera auto-frame to selected cluster on radial open.

**Pass type:** feature.
**Risk:** medium. Each spoke is a one-line registration but the supporting tabs are new UI.
**Depends on:** v86d (mini-graph + spoke registry), v90 (Geometry spoke needs node program registry).

### Scaffold-NOW additions for v89

Most v89 work is consumer-side; scaffolding mostly landed in v86d. New here:

- **Camera state controller** — for the auto-frame-to-cluster animation. Builds on v86b's `cameraController.ts`.
- **`target-kind` and `cluster` scope resolution runtime** — schema accepted these from v86a; v89 implements `resolveForTarget` for all four scope levels.

### Fluff-date references

None directly. v89 is consumer-side for v86d's foundation.

### Out of scope

- Live code editing in Code tab → v98
- Time-scrubbing history → v99
- Mini-graph upgrade to second Sigma instance → v90

### Acceptance criteria

- 9 total spokes in inspector (4 from v86d + 5 from v89)
- All four scope levels (target / target-kind / cluster / global) actionable in UI
- Camera auto-frames to selected cluster at 75% of frame on radial open

---

## Section 9 — v90 Node Program Registry + Geometry Presets

**Mission.** Make node visual style theme-driven. Sun, glass-sphere, crystal, orb, pip — each a custom Sigma node program selectable per-target or per-theme. Mini-graph upgrades to second Sigma instance (Approach A).

**Pass type:** feature.
**Risk:** medium. New WebGL programs; integration with theme tokens.
**Depends on:** v86b (`NodeSphereProgram.ts`), v89 (Geometry spoke).

### Scaffold-NOW additions for v90

- **Node program registry contract** — already scaffolded as a contract stub if v86c/d/e land it; v90 populates with five entries.
- **WebGPU readiness audit — abstract renderer layer** — `GraphRenderer` interface. Lands as a type in v86 era; v90 implements `webgl-sigma`; v94 adds `webgl-three` and possibly `webgpu-three`.

### Fluff-date references

None directly.

### Out of scope

- WebGPU implementation → v94 (interface ships in v90, impl deferred)
- 3D minimap → v94

---

## Section 10 — v91 Edge Plasma Full

**Mission.** Replace v86b's SVG overlay edge plasma with a full Sigma `EdgeProgram`. Edge style registry. Tile-group outline morphing.

**Pass type:** feature.
**Risk:** medium. GLSL work; performance-critical.
**Depends on:** v86b (overlay), v90 (node program registry pattern).

### Scaffold-NOW additions for v91

- **Edge style registry contract** — stub lands in v86 era (`SCAFFOLD-NOW`, XS effort). v91 populates with `plasma`, `solid`, `dashed`. `arc` and `energy` defer.
- **`flubber` library integration** — for tile-group outline morphing on hull changes. Replaces the v86c CSS-transition approach. ~30 lines.

### Fluff-date references

None directly. The audio reactivity demo (v92) is structurally adjacent — both produce shader-driven visual modulation.

### Out of scope

- `arc` (curved edges) edge style → later
- `energy` (animated electric-arc) edge style → later

---

## Section 11 — v92 Audio Reactivity (Centerpiece)

**Mission.** Build the visual patch bank. Audio reactivity is a global handle that routes audio frequency bands into visual handles. Users wire connections in an analog-modular-synth-style patch bay. **The feature that distinguishes Lattica from every other graph viz tool.**

**Pass type:** feature (multi-sub-arc — v92a/b/c/d).
**Risk:** high. Largest single piece of the v87-v92 horizon. Web Audio API integration, FFT analysis, custom UI surface.
**Depends on:** v86b (visual handles existing), v87 (theme tier model — for sonic identity).

### Sub-arc decomposition

- **v92a** — Registries + Web Audio integration + frequency analysis
- **v92b** — Strudel integration + Tone.js
- **v92c** — Patch bank UI + cable routing
- **v92d** — Patch presets + theme integration

### Scaffold-NOW additions for v92

Most of these land *before* v92 (in v86 era) so v92 just consumes them:

- **Audio source registry contract** — already exists in PK (`audioSourceRegistry.ts`). v92 populates with mic, system audio, file, Strudel, Tone.js, UI feedback.
- **Audio mapping rule registry contract** — already exists (`musicReactiveMappingRegistry.ts`). v92 populates.
- **Reactivity primitive registry contract** — additive types in v86 era. v92 wires runtime.
- **Sound design primitives library catalog** — types/catalog land in v86 era. Implementation in v92b.
- **`tone.js` library integration** — bundled in v92b for procedural sound design + UI feedback sounds.
- **Strudel engine wrapper** — `StrudelEngine` class. v92 audible mode; v98 silent timing mode for theme rhythm primitive.

### Fluff-date references

- **Demo 02 (Audio Reactivity Patch Bank)** — arc tag `v92 (Audio Reactivity) · centerpiece feature`. **This is the demo for this arc.** The patch bay UX, cable routing, intensity dials, real-time meters all directly visualized. Reference for the v92c UI implementation.

### Out of scope

- Strudel as theme rhythm primitive (silent mode driving visual pulses) → v98 / v100 era
- Strudel-driven generative themes via intent engine → v104+
- Per-familiar sound packs → v101
- Spatial audio in 3D space → v103 stretch

### Acceptance criteria

- All five audio sources registered and functional (mic, system, file, Strudel, Tone.js)
- Patch bank UI: drag a cable from any source jack to any target jack to wire reactivity
- Cable carries live signal (dash-pattern speed proportional to amplitude)
- Patch presets save/load to settings store
- Themes can declare default patch presets
- Performance: 60fps with 16 active reactivity rules at 1000-node graph

---

## Section 12 — v93+ Brief Horizon

Beyond v92, the system has its identity. The remaining arcs deepen and harden. **Brief sketches only — full content lives in `BRAINSTORM_v93_v97.md`, `BRAINSTORM_v98_v103.md`, `BRAINSTORM_v104_v120_PLATFORM.md`.**

### v93 — Lens / Physics Dialect / Culori Foundation

Three things converge. **`culori` color foundation** replaces ad-hoc color math throughout codebase (OKLCH everywhere, APCA contrast, color-blind simulation). **Lens registry** formalized (constellation, galaxy, helix, trihelix, solar-orbit, pipeline, impact-rings). **Physics dialect registry** formalized.

Bleeding-edge web platform consumption: `color-mix()` OKLCH in CSS, `@scope`, `accent-color`, `field-sizing: content`, container queries everywhere.

**Scaffold-NOW for v93 (lands in v86 era):** lens registry contract stub, physics dialect registry contract stub, animation primitive registry contract.

### v94 — 3D Minimap

Three.js companion renderer. Helix/galaxy/solar-orbit lenses gain true 3D rendering. WebGPU compute path for layout when `navigator.gpu` available (10k+ node performance unlock).

### v95 — Source Adapters + Theme Graph Viewer + Seed Library

Source adapters: Cypher (Neo4j), JSONL streaming, GraphQL. **Theme dependency graph viewer** — Lattica using its own graph engine to inspect its own design system (Demo 04 is for this arc). First-run seed graph library (5-7 starter graphs).

### v96 — IDE Integration

Wire up the file-open mechanism the inspector mini-graph's IDE spoke promised in v86d. Tauri-side handler that opens the user's preferred editor at file/line. Pairs with v98 provenance work.

### v97 — Hotkey Registry + Command Palette + i18n Scaffolding

Hotkey registry runtime (contract scaffolded earlier). Command palette (⌘K) becomes real. i18n + RTL scaffolding lands so future translations are content changes, not architecture changes.

**Scaffold-NOW for v97 (lands in v86 era):** decorative ⌘K hint contract (already in v86e), CSS logical properties enforcement (lint rule).

### v98 — Code Spoke + Provenance System Full

Build-time annotation tags every JSX element / styled rule / shader / config block with `{file, line, span}`. Runtime registry maps DOM elements to source. Multi-snippet view per element. Live + diff editor. Dev mode toggle.

The "design crack Linux has been waiting for" per the brainstorm.

### v99 — History Deepening

Branching theme history with time-scrubbing. Full undo/redo for theme overrides. Theme transition crossfade (already shipped in v87 — v99 deepens with branching). Theme-aware screenshot metadata.

### v100 — Workshop Hardening + State Machine + Collaboration Scaffolding

Sandbox + signing + threat model. **Theme as state machine** (XState-driven). Real-time collaboration primitives scaffolded (Yjs / Automerge data-shape audit in v86 era; runtime in v100). Web Locks API + Broadcast Channel API for multi-tab coordination. WASM hot-path audit.

### v101+ — Agent Familiars / Arena / VR

Graph-resident agent personas with persistent gravity wells. Tournament infrastructure. WebXR for graph-in-VR. **Significant scope; treat as separate arcs when their time comes.**

---

## Section 13 — Polish Arcs (Interleaved)

Polish arcs land between numbered arcs based on the right insertion point. Each is a focused single-mission session.

| Arc | Mission | Best inserted after |
|-----|---------|---------------------|
| **vP1** | Performance pass — large-graph mode, FPS guardrails, particle-cap tuning | v91 |
| **vP2** | Accessibility audit — WCAG AAA, color-blind palettes, reduce-motion completeness, larger hit targets, screen-reader labels | v87 |
| **vP3** | Documentation pass — user docs, contributor guide, theme authoring guide, **design specimen system** | v88 |
| **vP4** | Onboarding tour — first-run flow, **starter seed graph picker dialog**, tooltips, "What's this?" icons | v97 |
| **vP5** | Community features — theme sharing via Lattica bundle format, public asset marketplace prep | v100 |

**vP-Tests** (test infrastructure) is recurring — runs whenever Playwright drift accumulates. Not a numbered arc.

---

## Section 14 — Open Decisions (Surface, Don't Resolve)

Tracked here as a queue for future operator + Claude conversations.

1. **Should overlay components (v86b's 7) become a fifth Layer 2 surface?** — surfaced by Phase Y B.3. Decision: extend enum / accept non-controllable / distribute across existing surfaces.
2. **Layer 3 v86a token mapping** — vP-Registry-2 territory. After Phase Y surfaces the gap (B.1), prioritize the ~26 unmapped tokens before v92's audio reactivity wires more.
3. **Naming convention drift between layers** — surfaced by Phase Y B.4. Resolve before v89's full radial inspector (which navigates across layers and exposes drift to users).
4. **License + pricing + distribution decisions** — must land before beta release prep (v110+). Premature now; flag for v100-era brainstorm.
5. **Mobile / tablet ambitions** — read-only tablet for theme browsing is plausible. Decide before v100. Premature now.

---

## Section 15 — Refresh Schedule

This document refreshes at:
- **Every accepted pass** — update Section 0 (Current State) with new baseline
- **Every arc completion** — append to `BANDIT_CHANGELOG.md` and check off the arc here
- **Every brainstorm session** — incorporate new locked decisions; surface new fluff-dates if any
- **Every doc rehaul** — update cluster references, frontmatter, cross-doc IDs

When this document gets stale (e.g., v92 ships and we want to plan v93-v100 in detail), supersede with a new dev roadmap version (`docs/roadmap/v93_through_v100.md`) and archive this one.

---

## Appendix — Scaffold-NOW Items by Insertion Arc

For Bandit's reference when picking up code work. These are the additive types/registries/contract stubs that fold into v86 era without committing to feature implementation.

### Lands during v86c (Tile System)

- Per-target override visibility indicator (CSS dot, ~15 lines)
- Tile section registry (already in scope)

### Lands during v86d (Inspector Mini-Graph)

- Inspector spoke registry (already in scope)
- Reactivity primitive registry contract types (~30 lines)
- Subscriber pattern in registry contract (extension to `registryContract.types.ts`)

### Lands during v86e (Cosmetic Polish)

- Variable font axis registry types (~20 lines)
- Typography registry seed entries (3 entries)
- ⌘K hint contract reference (existing contract already in PK)
- Edge style registry contract stub (XS, additive)
- Lens registry contract stub
- Physics dialect registry contract stub
- Animation primitive registry contract
- Audio source registry contract verification (file already exists)
- Audio mapping rule registry contract verification (file already exists)
- WebGPU readiness — `GraphRenderer` interface (additive type)
- AssetType enum extensions (`model-3d`, `environment-hdr`, `material-preset`)
- Theme provenance trails schema field (`lineage` on ThemePreset)
- Theme document model types (`hash`, `parentHash`)
- Theme-as-code (TaC) types (`defineTheme()` signature)
- Credits panel data fields on AssetEntry

**Total scaffold-NOW work folded into v86 era: ~12 contract stubs + ~6 schema extensions + ~3 small UI additions.** None are feature implementations. All are additive — they fail safely if not consumed.

### Lands during v87 (Theme Migration)

- ThemeAccessibilityProfile interface (full type)
- Theme thumbnail generation function (~40 lines)
- Theme transition crossfade implementation (Demo 07, ~60 lines)
- Variable font axis playground UI (Demo 06)
- Initial Data Viz Primitives entries (Demo 08, incremental)

### Lands during v88 (Workshop)

- OKLCH gradient picker (Demo 01)
- Palette generation function (~80 lines)
- Theme document model runtime (consume v86 era types)
- Theme provenance trails runtime (consume v86 era schema)
- Credits panel UI (consume v86 era data fields)

### Lands during v92 (Audio Reactivity)

- Audio reactivity patch bank UI (Demo 02)
- Strudel engine wrapper
- Tone.js integration
- Sound design primitives library implementation
- Reactivity primitive registry runtime (consume v86d era types)

---

*End of dev roadmap.*
