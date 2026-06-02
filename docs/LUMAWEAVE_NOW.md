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
tags: [live-state, now, canonical, v102]
---

# LumaWeave — NOW

**The single live-state doc.** This is the only doc that changes every pass and the only one that carries a date. Everything here is volatile by design. Concepts and architecture live in the static domain docs (see `DOC_ARCHITECTURE.md`); history lives in the dev-blog / #changelog feed. This doc holds only: where we are, what's next, what's broken.

**Updated:** 2026-06-02 · **Production version:** 0.9.0 · **Internal arc:** v103 (Graph Theming) · **Last pass:** v103.0.0

---

## Current arc — v103: Graph Theming

Connect the authored-but-unwired cluster-color system to node render. Fix the 4 confirmed disconnects: cluster colors drive node color (replacing rainbow scale-cycling), themes drive edges (replacing hardcoded literal), graphVisualTokens derives from active theme, and graph recolors live on theme switch.

**Design decisions locked (pending D1-D4 sign-off):** absolute cluster colors (stable across themes), mode-based resolver (semantic/mono-shades/custom), cluster color at `raw.color` layer per ownership contract.

| Pass | Work | Commit |
|---|---|---|
| v103.0.0 | Arc opener — design only: re-derive + author `GRAPH_COLOR_OWNERSHIP.md` contract, lock cluster-color mapping abstraction, phase plan. D1-D4 signed off | `b85a004` |
| v103.0.1 | Cluster-color resolver: `loadClusterColors()` + `resolveClusterColor()` (semantic mode), pure/theme-independent, direct docs/_meta JSON import, 4 Playwright unit tests, NO render wiring | `412eb2e` |
| v103.0.2 | Wire cluster color into node render — replaces colorSuggestionEngine rotation with resolveClusterColor; raw.color set per ownership contract; rainbow fixed (manual smoke required) | `ae098a3` |

| v103.0.3 | Edges from theme edgeDefault — replace hardcoded `rgba(100,130,180,0.55)` literal with `themeTokens.graph.edgeDefault`; style layer was already theme-derived | `1ee1e6a` |

| v103.0.4 | Live recolor on theme change — new useEffect keyed to resolvedTokens; re-applies style policy in-place; cluster colors stay absolute (D2); all 4 disconnects fixed | `13cbf50` |

| v103.0.5 | WCAG single source of truth — card badge reads getAccessibilityProfile (4-pair, same source as top bar); lw-wcag-* CSS reused; card + top bar cannot drift | `efab098` |
| v103.0.5b | Accent uses WCAG 1.4.11 non-text criterion (3:1); per-criterion aggregation (aa/aaa); void-circuit + agartha-dream correctly upgrade | `8e1406f` |

**Planned v103 phases:** .0.6 palette strip + WCAG graph label contrast · closer.

---

## Closed arc — v102: Theme Menu Integration — in progress (Workshop/History/Bookmarks/Export remain)

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
| v101.0.8 | Arc closer — bump 0.8.0 → 0.9.0, recanon roadmap to v102, reconcile polish debt | in-progress |

---

## Roadmap

| Arc | Work |
|---|---|
| **v102** | Theme menu integration (Claude Design settings → product) |
| v103 | Minimap |
| v104 | Code spoke (live + diff editor) |
| v105 | History spoke deepening |
| v106+ | Paperweight punch-list: source-adapter fix, tile CSS theming, pre-1.0 cleanup incl. CI/security green, polish band |
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
