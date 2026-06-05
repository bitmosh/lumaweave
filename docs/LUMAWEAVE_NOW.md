---
id: system.lumaweave.now
title: "LumaWeave — NOW"
cluster: slate
include_in_self_graph: true
references:
  - system.doc.architecture
  - system.versioning.arcs
  - system.registry.link.network
  - domain.theme.token.system
  - domain.graph.sigma.rendering
  - domain.physics.gwells
  - domain.source.adapter
  - domain.control.plane.system.index
  - domain.tile.layout.workspace
  - domain.deferred.post.v1.vision
tags: [live-state, now, canonical, v107-closed]
---

# LumaWeave — NOW

**The single live-state doc.** This is the only doc that changes every pass and the only one that carries a date. Everything here is volatile by design. Concepts and architecture live in the static domain docs (see `DOC_ARCHITECTURE.md`); history lives in the dev-blog / #changelog feed. This doc holds only: where we are, what's next, what's broken.

**Updated:** 2026-06-05 · **Production version:** 0.14.0 · **Internal arc:** v108 (TBD) · **Last closed:** v107 (Source Adapters — Tier 0)

---

## Closed arc — v107: Source Adapters Tier 0 — CLOSED (0.13.0 → 0.14.0)

Repair the broken source-adapter plumbing without adding new adapters. Establishes the settings-driven routing infrastructure so Tier 1+ can plug in live adapters.

| Pass | Work | Commit |
|---|---|---|
| v107.0.1 | Settings schema: `SourcesSettings` interface + `sources` field added to `StarmapSettings`; `CURRENT_SCHEMA_VERSION` 90 → 91; migration 91 backfills `defaultSources`; default `active: "self-graph-yaml-frontmatter"` | `4b4815c` |
| v107.0.2 | `loadSource(adapterId, inputPath)` replaces `loadGraphifySource()`; adapter-routed: null guard → error, unknown → error, candidate → error, self-graph → existing fixture-fetch logic; `useGraphSourceSummary` reads `sources.active` from settings, re-triggers on change; neutral idle initial state | `8a796ac` |
| v107.0.3 | `SourceAdapterPanel` set-active selector: "Set as active" button on registered entries, disabled when already active, `data-testid` per button + indicator; E2E spec rewritten (full flow: button visibility, click → store update → active indicator); arc close 0.13.0 → 0.14.0 | _(this commit)_ |

**Tier 1+ remaining** (Source Adapter program continues):
- **Tier 1** — Self-graph live mode: `read_file` + `run_script` Tauri commands, "Regenerate" button in GraphSourcesTileContent
- **Tier 2+** — New adapters (markdown-vault, package-dependency, etc.)
- Registry `registerSourceAdapter()` API deferred to when Tier 2 needs dynamic registration

**Arc closed** — v107 closer: 0.13.0 → 0.14.0 · 2026-06-05. Next: v108 (TBD).

---

## Closed arc — v106: Radial Inspector Redesign — CLOSED (0.12.0 → 0.13.0)

Replace the SVG+physics radial inspector with a fixed-position HTML/CSS ring. Spoke buttons are CSS-positioned; the ring stays visible when a spoke opens; tab content renders in a viewport-clamped submenu alongside the ring rather than replacing it. Aurora gradient background, `:focus-visible` rings, submenu pop-in animation. Geometry scope picker adds target-vs-global override routing.

Note: v106.0.4 went broader than typical polish — also included CLAUDE.md restructuring (generic rules moved to `~/Projects/CLAUDE.md`) and the v91 prototype deletion alongside the announced radial items. All intentional; recorded here.

| Pass | Work | Commit |
|---|---|---|
| v106.0.1 | MiniGraphRenderer SVG+physics → HTML/CSS rewrite; RootNode.tsx + SpokeNode.tsx deleted; inspectorSpokeRegistry.ts interface stripped (5 unused fields removed, iconPath/iconFill/beta added); all 8 register*.ts gain iconPath SVG paths, lose legacy icon emoji; registerHistorySpoke.ts order 8→7 | `9c3f26d` |
| v106.0.2 | CSS variable fixes (--lw-glow → --lw-app-glow, --lw-app-bg → --lw-app-background, --lw-panel-bg-solid → --lw-panel-background); aurora gradient on stage; :focus-visible rings on spokes + center button; submenu pop-in animation with prefers-reduced-motion guard | `9c28e0c` |
| v106.0.3 | GeometryTab scope picker: This → setTargetOverride / All → setGlobalOverride; loadOverrides() migration block removed (was silently stripping target-scope geometry entries on every load); 3 test.fixme → test; all 7 geometry tests pass | `f04b985` |
| v106.0.4 | CategoryInspector RadialPreviewWidget (settings preview ring); IdeTab.tsx deleted (deprecated since v105.0.1); themeTargetRegistry topbar subtargets committed; CLAUDE.md trimmed to project-specific; v91 prototype deleted | `22ddd2b` |
| v106.0.5 | Arc closer — semver 0.12.0 → 0.13.0; NOW.md reconcile; landed-state audit | _(this commit)_ |

**Deferred to v107+ (from `docs/prototypes/radial-outstanding-work.md`):**
- **Q1** ColorTab disabled scope buttons — signal deferred state
- **Q2** Geometry scope picker label + i18n keys
- **Q3** CodeTab `.lw-ide-tab` → `.lw-code-tab` class rename
- **M1** Keyboard navigation — arrow-key ring rotation, focus trap in submenu
- **M2** ApplyTab 3 skipped tests — DOM fixture needed for candidate rows
- **M3** HistoryTab global-scope gap — global overrides don't appear per-target
- **D1–D3** Type / Motion / Layout spokes — blocked on Typography, Audio Reactivity, Physics Dialect arcs

**Arc closed** — v106 closer: 0.12.0 → 0.13.0 · 2026-06-04. Next: v107 (Source Adapters).

---

## Closed arc — v105: Code Spoke — CLOSED (0.11.0 → 0.12.0)

Rename IDE spoke → Code spoke, establish baseline with provenance-manifest sync, fix regressions (history spoke + open-in-IDE), reconcile E2E suite. Spoke is **functional and demoable** (inspect → Code spoke → source code display + snippet highlighting + file:line preview + "Open in editor" → VS Code with correct path & line). Enrichments (registration site, token bindings, cross-file reference list) **deferred to post-radial-redesign** — the enrichment UI should be built into the new radial wheel design, not the current one.

**Landed state (verified audit):**
- Code spoke merged: registerCodeSpoke exists, id="code"; registerIdeSpoke.ts deleted; 8 spokes total; no orphaned "ide" label/i18n.
- Resolver: validates registration (walks to nearest REGISTERED target).
- Topbar subtargets: all 3 (wordmark/statusPill/statusCluster) registered + inspectable + parent display working.
- HistoryTab: derives overrides via useSyncExternalStore (matches useResolvedTargetColor pattern), no useState-mirror race.
- Open-in-IDE: get_project_root pops src-tauri CWD to project root; listener resolves relative→absolute + builds URL; error visibility (console.error); editor picker UI (10 editors + custom).
- No diagnostic console.logs remain. E2E baseline maintained (v105.0.2 reconciled: only quarantined flaky + pre-existing skips; open-in-IDE manual-smoke-only, Tauri invoke no-ops in Playwright).

| Pass | Work | Commit |
|---|---|---|
| v105.0.0 | Provenance manifest sync: 4 minimap targets (minimap.root/header/footer/viewport-rect) added; 3 topbar targets (statusCluster, statusPill, wordmark) also picked up; parity spec GREEN (18 entries); arc baseline established | `ba85948` |
| v105.0.1 | Merge IDE spoke → Code spoke: registerIdeSpoke.ts deleted, registerCodeSpoke.ts now the real feature (CodeTab, order 5, </> icon); placeholder Code spoke removed; i18n "ide" block merged into "code"; 9→8 spokes; graph node-type "code" fence held; manual smoke required | `1808f62` |
| v105.0.2 | E2E reconciliation: stale tests updated (spoke rename, pill removal, migration chain); flaky physics/timing quarantined (test.fixme); 26→9 failures; 3 real regressions flagged (history spoke override-display broken — seeding via __lwThemeOverrideStorage not surfacing in HistoryTab, likely targetId mismatch after new topbar subtargets) | `130c9c3` |
| v105.0.3 | History spoke regression FIXED — course correction: replace useState-mirror with useSyncExternalStore (matches useResolvedTargetColor pattern). Root cause: useState([]) + useEffect race left first render empty. Fix: derive overrides synchronously in render (lw:override-change fires snapshot change → re-derive). All 7 specs pass (override visible on open, live-updates on reset). Diagnostic logs removed (10 scaffolding tags verified clean). | `e4906ea` |
| v105.0.4 | Open-in-IDE fixed (hybrid approach): Rust adds get_project_root() command (returns CWD); frontend caches root + resolves relative→absolute paths before buildEditorUrl (keeps URL logic in TS, one source). Relative paths stay portable in manifest, absolute at runtime. Error visibility: catch {} → console.error. Editor picker UI added to debug popover (select for developer.preferredEditor, 10 editors + custom). All paths now absolute. | `34c2860` |
| v105.0.5 | get_project_root CWD fix: under tauri dev, Rust process CWD is src-tauri/ (not project root). Fix: detect "src-tauri" component, pop to parent if present. Result: absolute paths now correct (/home/boop/Projects/lumaweave/src/..., not .../src-tauri/src/...). Portable (derives dynamically, no hardcoded paths). Rust compiles. Manual smoke: open-in-IDE now opens correct files at correct lines. | `4d00dc5` |

**Arc closed** — v105 closer: 0.11.0 → 0.12.0 · 2026-06-04. Next: radial wheel visual redesign (v106 — pending).

**Deferred (post-radial-redesign):**
- **Code spoke enrichments:** registration site (LOW), token bindings (LOW — already inline in registry metadata), cross-file reference list (MEDIUM — multi-select files + line-ranges → open in IDE; needs source-adapter ref-grep).

**Standing deferred items (not lost):**
- Minimap E2E coverage (test debt — snapshot/nav/rect correctness not automated).
- Inspectable-Coverage + Token-Hygiene arc (css-handle-report findings: --lw-glow silent failure, orphaned CSS vars, --lw-visual-* static layer, typography vars disconnected, minimap hardcoded node/edge colors, AppShell vars on \<main\> not :root).
- Tile-content theming + token coverage.
- 5 mis-homed tile sections → settings advanced-tabs relocation.

---

## Closed arc — v104: Minimap — CLOSED (0.10.0 → 0.11.0)

Ported the prototype into src/ and iterated through 7 passes to correctness. Final shipped state (confirmed in v104 closer audit):
- **Snapshot**: structural-event + afterRender-settle subscription; delta-stability bounds tracking; Y-flipped canvas (offsetY + (maxY-y)*scale matches sigma Y↑).
- **Viewport rect**: viewportToGraph on sigma canvas corners; shared projection (same scale/offsets/pad=10 as snapshot); Y-flip consistent with snapshot.
- **Navigation**: click-to-pan (animated initial jump), drag-scrub (instant), wheel-zoom; invertToGraph Y-flipped; pan delta in normalized camera space via ratioNorm = max(gW,gH).
- **Test debt (v106)**: no automated E2E for minimap correctness (snapshot renders, nav pans, rect tracks) — all manual smoke. graph-visual-inventory.spec.ts covers registry status only.

| Pass | Work | Commit |
|---|---|---|
| v104.0.0 | Port minimap prototype: 8 new files (MinimapShell, MinimapSnapshotCanvas, MinimapViewportRect, MinimapChrome, useMinimapSnapshot, useMinimapCamera, useMinimapNavigation stub, Minimap top-level); settings migration 89→90 adds minimap slice; AppShell wired; 4 theme targets added; design doc version numbers corrected | `e95b158` |
| v104.0.1 | Minimap navigation: click-to-pan (animated), drag-scrub (instant), wheel-zoom; UNIFORM CENTERED projection inversion (pad=10, same as canvas); window-level drag listeners removed on mouseup; OKLCH audit — already clean | `c36c49a` |
| v104.0.2 | Minimap snapshot N0/E0 fix: sigma readiness poll + afterRender count-change detection; stale UI Inspector pill removed from ThemeTargetInspectorOverlay | `0b5c90e` |
| v104.0.3 | Minimap viewport rect: rewrite to viewportToGraph + shared projection (was cam.ratio in normalized space); areaSize passed from Minimap.tsx | `2b00429` |
| v104.0.4 | Minimap bounds frozen at origin frame: afterRender drives bounds recompute during settle; delta-stability stop (5 ticks ≈ 750ms) | `4184736` |
| v104.0.5 | Minimap rect 3-bug fix: Math.min/max for Y-inversion; sigma.getDimensions(); effect deps [] with refs (no cleanup thrash during settle) | `e4ccbd3` |
| v104.0.6 | Minimap Y-flip consistent across snapshot/rect/nav: sigma Y↑ flip in all 3 files; pan delta fixed (ratioNorm conversion — was raw-graph minus normalized-camera = fly-off) | `eeb9013` |

**Arc closed** — v104 closer: 0.10.0 → 0.11.0 · 2026-06-03.

---

## Closed arc — v103: Graph Theming + Tile Docking — CLOSED (0.9.0 → 0.10.0)

Graph theming (.0.x): wired the cluster-color resolver into node render, themed edges and graph recolor on theme switch, WCAG correctness (single-source badge, non-text criterion).
Tile docking (.1.x): slot-anchor schema, resolution layer, state consistency (close=hide, group-reconcile, drag-flip), resize reflow, entry reconcile, unified tile creation, slot migration (engine now live), chrome + body theming.

**Deferred (noted, not lost):**
- Tile-content theming + token coverage: promote unmapped paths incl. nodeColorScale/edgeColorScale, unify `--lw-visual-*` CSS → pre-3D arc.
- 5 mis-homed tile sections (qa-feedback, graph-visual-inventory, system-index, command-deck, source-adapter) → candidates for settings advanced-tabs relocation (future pass).

**Design decisions locked:** absolute cluster colors (stable across themes), mode-based resolver (semantic/mono-shades/custom), cluster color at `raw.color` layer per ownership contract.

| Pass | Work | Commit |
|---|---|---|
| v103.0.0 | Arc opener — design only: re-derive + author `GRAPH_COLOR_OWNERSHIP.md` contract, lock cluster-color mapping abstraction, phase plan. D1-D4 signed off | `b85a004` |
| v103.0.1 | Cluster-color resolver: `loadClusterColors()` + `resolveClusterColor()` (semantic mode), pure/theme-independent, direct docs/_meta JSON import, 4 Playwright unit tests, NO render wiring | `412eb2e` |
| v103.0.2 | Wire cluster color into node render — replaces colorSuggestionEngine rotation with resolveClusterColor; raw.color set per ownership contract; rainbow fixed (manual smoke required) | `ae098a3` |

| v103.0.3 | Edges from theme edgeDefault — replace hardcoded `rgba(100,130,180,0.55)` literal with `themeTokens.graph.edgeDefault`; style layer was already theme-derived | `1ee1e6a` |

| v103.0.4 | Live recolor on theme change — new useEffect keyed to resolvedTokens; re-applies style policy in-place; cluster colors stay absolute (D2); all 4 disconnects fixed | `13cbf50` |

| v103.0.5 | WCAG single source of truth — card badge reads getAccessibilityProfile (4-pair, same source as top bar); lw-wcag-* CSS reused; card + top bar cannot drift | `efab098` |
| v103.0.5b | Accent uses WCAG 1.4.11 non-text criterion (3:1); per-criterion aggregation (aa/aaa); void-circuit + agartha-dream correctly upgrade | `8e1406f` |
| v103.1.0 | Tile docking schema + resolution layer: `mode: "docked"\|"floating"`, `slot` on TileAnchor, `clampToViewport` + `resolveDockedPosition` + `resolveLivePosition` (pure, viewport-relative, unwired); 9 unit tests including the off-viewport bug proof | `d188038` |
| v103.1.1 | Wire resolveLivePosition into render + snap/group + resize: resolvedTilesArray upstream in TileLayer, getLiveTiles resolves, debounced resize listener, docked→floating flip on drag; stranded tiles now visible | `79c9636` |
| v103.1.2 | Tile state consistency: close=hide (visible:false, entry kept), Bug 1 popover toggle fixed, Bug 2 visible:false excluded from deriveGroups/GroupOutline (no ghost), Bug 3 drag-flip seeds resolved x/y; 3 new E2E interaction tests | `8978d17` |
| v103.1.3 | Group neighbors reflow flush on resize release — resized tile anchors, neighbors slide to close gap; clampToViewport guards against growth pushing neighbor off-screen; 1 E2E flush-assertion | `c31061c` |
| v103.1.4 | Unified tile creation (createDefaultTile helper) + reconcile missing default-visible tiles each load; graph-sources + graph-inspector now appear and toggle correctly; tileOut well-formed (mode/anchor/visible) | `0582ed1` |
| v103.1.5 | Tile header UX: GripVertical lucide handle (replaces ⠿/⤴), RotateCcw return-to-dock (replaces broken anchor menu), title\|divider\|handle layout, popover z-index 10100 (was 200, buried under tiles); manual smoke required | `0165db5` |
| v103.1.6 | Activate docking engine: registry→slot-anchors (6 canvas tiles), settings migration v88→v89 stamps mode:docked+slot-anchor on stored tiles, deferred sections (qa-feedback/visual-inventory/system-index/command-deck/source-adapter) stay floating with deferred comment; createDefaultTile now mode:docked for slot-anchored sections | `ab03f4e` |
| v103.1.7 | Theme tile chrome + body: all hardcoded rgba/hex literals → --lw tokens; .tile-body gets color:--lw-text-primary + font:--lw-font-body (fixes bland content text); tiles now follow theme switches; hover backgrounds use color-mix; group-outline uses --lw-accent | `c9c39d2` |

**Arc closed** — v103 closer: `package.json` 0.9.0 → 0.10.0 · 2026-06-03.

---

## Closed arc — v102: Theme Menu Integration — PARTIAL (Browse + Active shipped; Workshop/History/Bookmarks/Export deferred to v106+)

Wire the Claude Design settings UI into the product as a usable theme panel.

| Pass | Work | Commit |
|---|---|---|
| v102.0.0 | Arc opener: Lucide icon migration (sidebar), rich Theme category with Browse + Active sub-areas, Model-1 drill-collapse sidebar, 4 stub sub-areas | `1846906` |
| v102.0.1 | Missing stylesheet for theme menu — Browse card grid, sub-nav tabs, Active token rows, stub placeholder, all Solar Plasma tokens | `b7d8dde` |
| v102.0.2 | Browse card polish: themed graph thumbnail SVG (real graph tokens), 5-chip palette strip, wider grid (minmax 240px), stronger active sub-nav tab | `6e93401` |
| v102.0.3 | Theme card identity palette (accent/bg/surface/text/border tokens, not node scale) + WCAG contrast badge (textPrimary-on-bg, level-colored) | `29485c0` |
| v102.0.4 | WCAG correct-by-construction: culori-based parser, fail replaces AA-large, no silent-black; all 3 callers reconciled; reference-verified; Playwright E2E proof | `a714027` |

**Remaining v102 phases:** Workshop (edit), History, Bookmarks, Export (may interleave with v103).

---

## Closed arc — v101: Tile Migration — CLOSED (0.8.0 → 0.9.0)

Reworked the floating-tile system: per-axis snap engine, armed guide, explicit group membership (FORM/BREAK on drop), live group-bar preview, click-through fix, Solar Plasma restyle.

| Pass | Work | Commit |
|---|---|---|
| v101.0.0 | Snap & group design (arc opener) | — |
| v101.0.1 | Per-axis edge-snap engine (SNAP_TOL 15px; corner-hypot + weighting removed; dedupe) | `d1b9e3b` |
| v101.0.2 | Snap-on-release wired in FloatingTile (single tile + group bbox) | `a607a56` |
| v101.0.2a | Snap-back bug fix (drag handlers read live tile positions, not stale closure) | `1cdfaf3` |
| v101.0.2b | CI repair — stylelint logical-css (warn), generate:graph step, Node 22 | `09f0e95` |
| v101.0.3 | Armed-only gold snap guide; drop preview rect; BREAK_TOL = SNAP_TOL*2 | `3228a19` |
| v101.0.4a | Group-as-event engine: `groupId` on TileLayoutEntry, FORM/BREAK on drop, `deriveGroups` replaces `computeGroups`, `tileGrouping` flag removed | `617fc19` |
| v101.0.4b+c | Model-B drag: body-drag moves single tile (BREAK now reachable); GroupBar snap + reconcile on release; fix minEdgeGap (rectilinear hypot) | `4c92b3f` |
| v101.0.5 | Live group-bar preview during drag: bar drops excluded tile at BREAK_TOL threshold — visual-only, no groupId write during drag | `4827acb` |
| v101.0.6 | Click-through acceptance test — confirms `.tile-layer { pointer-events: none }` lets graph clicks fall through; closes the arc's named bug | `87d3b8d` |
| v101.0.7 | Solar Plasma tile restyle — purple gradient bg, gold-tinted borders/shadow, warm fonts; replaces all hardcoded slate hex with `--lw-*` tokens | `ed59266` |
| v101.0.8 | Arc closer — bump 0.8.0 → 0.9.0, recanon roadmap to v102, reconcile polish debt | (closed) |

---

## Roadmap

| Arc | Work |
|---|---|
| **v108** | TBD — Source Adapters Tier 1 (self-graph live mode) is the logical next; or a deferred punch-list pass |
| v108+ | Paperweight punch-list: Source Adapters Tier 1+ (live mode, new adapters), radial deferred (Q1–Q3, M1–M3), v102 Workshop/History/Bookmarks/Export, tile-content theming + token coverage, settings advanced-tabs relocation (5 deferred tile sections), minimap E2E coverage (test debt from v104), pre-1.0 cleanup incl. CI/security green |
| ~v115–v125 | `1.0.0` initial public release |

---

## Known bugs / paperweights

## Security / dependency debt

- **`chromium` → `tmp` high-severity advisory** (path traversal) — pre-existing, surfaced during the stylelint install. Resolve deliberately (check whether `chromium@3.0.3` is still needed vs. redundant with Playwright; do NOT `npm audit fix` blind). Own pass, v106+.
- **Redundant `stylelint-use-logical`** installed alongside `stylelint-plugin-logical-css` (the one actually configured) — uninstall the unused one.
- **5 deferred stylelint logical-property warnings** in StatusBar.css — clean up, then tighten from `warning` → `error`.

## Architectural notes — v106 drift risks

Three known fragility points introduced or surfaced during v106. No action required yet; record so they're visible at the next relevant pass.

- **`InspectorMiniGraph.tsx:50–63` direct settings mutation** — on inspector open, `useSettingsStore.setState(...)` directly sets `graphView.dimMode = "outside-cluster"`, bypassing the normal `setSetting` path. On close, previous value restores from `previousDimModeRef`. If the `graphView.dimMode` schema shape changes, this mutation drifts silently.
- **`tests/e2e/helpers/inspector.ts:12` click fragility** — `openInspectorOnTopbar` clicks at `(x:8, y:16)`, the far-left logo region. If topbar padding or HexLogo width changes, the helper may start hitting an interactive child and inspector open stops working.
- **`RadialPreviewWidget` constants duplicated** — `CategoryInspector.tsx:9–13` re-declares STAGE, CENTER, RING_R, RING_BTN, SUB_OFFSET from `MiniGraphRenderer.tsx`. If the layout constants change in the renderer, the settings preview silently drifts out of sync (Q6 — no shared import).

## Architectural notes — v107 contracts

- **`loadSource` null-guard contract** — `sources.active = null` returns `{ status: "error", error: "No active source configured" }`. Never silent idle. `hasRealSource` evaluates to false → app falls back to fixture as expected.
- **`useGraphSourceSummary` reactive dependency** — effect fires on `sources.active` and `configurations[id].inputPath` changes. Source switch from the panel retriggers the load immediately.
- **Self-graph still uses fixture URL (Tier 0)** — `SELF_GRAPH_PUBLIC_BASE = "/examples/ai-lab/graphify-out"` is preserved in `loadSource.ts`. The routing infrastructure is correct; the live path fix is Tier 1.

## Recently resolved

- **Source-adapter JSON-404** — cleared by v107 Tier 0: `loadGraphifySource` replaced with `loadSource` (adapter-routed, settings-driven); active adapter selectable from `SourceAdapterPanel`.
- **Radial inspector SVG+physics** — replaced in v106 with HTML/CSS ring; RootNode.tsx + SpokeNode.tsx deleted; viewport-clamped submenu; aurora gradient; geometry scope picker.
- **Floating-tile click-interception** — `.tile-layer { pointer-events: none }` was already set; v101.0.6 added the click-through E2E test that formally closes this bug.
- **CI red on all branches** — FIXED in v101.0.2b. Both jobs (CSS lint + TypeScript) green on Node 22; generate:graph runs before typecheck; self-graph fixture gitignored.
- **CLAUDE.md context bloat** — split into generic `~/Projects/CLAUDE.md` + shared `DISCORD_PROTOCOL.md` and project-specific `~/Projects/lumaweave/CLAUDE.md`, with dense bodies extracted to `docs/agent/`. Cuts per-pass fixed context substantially.
