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
tags: [live-state, now, canonical, v103]
---

# LumaWeave — NOW

**The single live-state doc.** This is the only doc that changes every pass and the only one that carries a date. Everything here is volatile by design. Concepts and architecture live in the static domain docs (see `DOC_ARCHITECTURE.md`); history lives in the dev-blog / #changelog feed. This doc holds only: where we are, what's next, what's broken.

**Updated:** 2026-06-03 · **Production version:** 0.10.0 · **Internal arc:** v104 (Minimap) · **Last pass:** v103 closer

---

## Current arc — v104: Minimap

Port and activate the minimap overlay prototype. Non-interactive render first (.0.0); navigation second (.0.1).

| Pass | Work | Commit |
|---|---|---|
| v104.0.0 | Port minimap prototype: 8 new files (MinimapShell, MinimapSnapshotCanvas, MinimapViewportRect, MinimapChrome, useMinimapSnapshot, useMinimapCamera, useMinimapNavigation stub, Minimap top-level); settings migration 89→90 adds minimap slice; AppShell wired; 4 theme targets added; design doc version numbers corrected | `e95b158` |
| v104.0.1 | Minimap navigation: click-to-pan (animated), drag-scrub (instant), wheel-zoom; UNIFORM CENTERED projection inversion (pad=10, same as canvas); window-level drag listeners removed on mouseup; OKLCH audit — already clean; manual smoke required | `c36c49a` |
| v104.0.2 | Minimap snapshot N0/E0 fix: sigma readiness poll + afterRender count-change detection (only recomputes on structural change, not every frame); stale UI Inspector pill removed from ThemeTargetInspectorOverlay (was covering StatusBar pill); manual smoke required | `0b5c90e` |
| v104.0.3 | Minimap viewport rect fix: rewrite useMinimapCamera to use sigma.viewportToGraph on viewport corners (was cam.ratio in normalized space — wrong coordinate system); shared projection with snapshot (same scale/offsets/pad); areaSize passed from Minimap.tsx; manual smoke required | `2b00429` |
| v104.0.4 | Minimap bounds frozen at origin frame: afterRender now drives bounds recompute during layout settle (was count-change only — positions not structural events); delta-stability stop (5 stable ticks at BOUNDS_EPSILON=1.0 ≈ 750ms quiet period); structural events reset settle; manual smoke required | `4184736` |
| v104.0.5 | Minimap rect real fix: Math.min/max for visMinY/visMaxY (handles sigma Y↑ inversion); sigma.getDimensions() instead of clientWidth (never 0); effect deps [] with refs (no cleanup/setup during settle); manual smoke required | `e4ccbd3` |
| v104.0.6 | Minimap Y-flip consistent across snapshot/rect/nav: sigma Y↑ (large Y = top) → flip in MinimapSnapshotCanvas + useMinimapCamera projY; pan delta fixed (was raw-graph minus normalized-camera = garbage); invertToGraph Y-flip + ratioNorm conversion; manual smoke required | `eeb9013` |

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
| **v104** | Minimap |
| v105 | Code spoke (.0.0: live + diff editor) + History spoke (.1.0: deepening) |
| v106+ | Paperweight punch-list: source-adapter fix, tile-content theming + token coverage, v102 Workshop/History/Bookmarks/Export, settings advanced-tabs relocation (5 deferred tile sections), pre-1.0 cleanup incl. CI/security green |
| ~v115–v125 | `1.0.0` initial public release |

---

## Known bugs / paperweights

- **Source-adapter JSON-404** — Graph Sources live-refresh fetch returns HTML 404 instead of JSON; self-graph renders from fixture. High-priority; can't be on screen at launch.

## Security / dependency debt

- **`chromium` → `tmp` high-severity advisory** (path traversal) — pre-existing, surfaced during the stylelint install. Resolve deliberately (check whether `chromium@3.0.3` is still needed vs. redundant with Playwright; do NOT `npm audit fix` blind). Own pass, v106+.
- **Redundant `stylelint-use-logical`** installed alongside `stylelint-plugin-logical-css` (the one actually configured) — uninstall the unused one.
- **5 deferred stylelint logical-property warnings** in StatusBar.css — clean up, then tighten from `warning` → `error`.

## Recently resolved

- **Floating-tile click-interception** — `.tile-layer { pointer-events: none }` was already set; v101.0.6 added the click-through E2E test that formally closes this bug.
- **CI red on all branches** — FIXED in v101.0.2b. Both jobs (CSS lint + TypeScript) green on Node 22; generate:graph runs before typecheck; self-graph fixture gitignored.
- **CLAUDE.md context bloat** — split into generic `~/Projects/CLAUDE.md` + shared `DISCORD_PROTOCOL.md` and project-specific `~/Projects/lumaweave/CLAUDE.md`, with dense bodies extracted to `docs/agent/`. Cuts per-pass fixed context substantially.
