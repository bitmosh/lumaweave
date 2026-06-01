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
tags: [live-state, now, canonical, v101]
---

# LumaWeave — NOW

**The single live-state doc.** This is the only doc that changes every pass and the only one that carries a date. Everything here is volatile by design. Concepts and architecture live in the static domain docs (see `DOC_ARCHITECTURE.md`); history lives in the dev-blog / #changelog feed. This doc holds only: where we are, what's next, what's broken.

**Updated:** 2026-06-01 · **Production version:** 0.8.0 · **Internal arc:** v101 (Tile Migration) · **Last pass:** v101.0.4a

---

## Current arc — v101: Tile Migration

Rework the floating-tile system into a clean, discoverable, snappable workspace. **Approach (revised):** a bespoke per-axis edge-snap engine — NOT react-grid-layout / react-moveable (evaluated and set aside; dockview studied for technique but not adopted as a dependency). Free-floating tiles, no recursive grid, edges snap flush, snapped adjacency forms groups. Design locked in the arc opener.

| Pass | Work | Commit |
|---|---|---|
| v101.0.0 | Snap & group design (arc opener) | — |
| v101.0.1 | Per-axis edge-snap engine (SNAP_TOL 15px; corner-hypot + weighting removed; dedupe) | landed |
| v101.0.2 | Snap-on-release wired in FloatingTile (single tile + group bbox) | landed |
| v101.0.2a | Snap-back bug fix (drag handlers read live tile positions, not stale closure) | landed |
| v101.0.2b | CI repair — stylelint logical-css (warn), generate:graph step, Node 22 | `f434447` / `09f0e95` |
| v101.0.3 | Armed-only gold snap guide; drop preview rect; BREAK_TOL = SNAP_TOL*2 | `cdff96c` / `3228a19` |
| v101.0.4a | Group-as-event engine: `groupId` on TileLayoutEntry, FORM/BREAK on drop, `deriveGroups` replaces `computeGroups`, `tileGrouping` flag removed | `617fc19` |
| v101.0.4b+c | Model-B drag: body-drag moves single tile (BREAK now reachable); GroupBar snap + reconcile on release; fix minEdgeGap (rectilinear hypot — groups now break when dragged far) | `4c92b3f` |
| v101.0.5 | Live group-bar preview during drag: bar drops excluded tile at BREAK_TOL threshold while dragging, same geometry as commit — visual-only, no groupId write during drag | `4827acb` |
| v101.0.6 | Click-through acceptance test — confirms `.tile-layer { pointer-events: none }` (already set) lets graph clicks fall through; closes the arc's named bug | in-progress |

**Snap feel: functional baseline reached** — tiles snap per-axis, don't stick, show gold guide only when armed, and group/break by explicit gesture with live preview. Graph clicks now fall through the tile layer correctly.

**Still open in v101:** broader Solar Plasma tile CSS restyle; logical-property warning cleanup (5 deferred in StatusBar.css); tighten stylelint logical rules warn→error after cleanup.

## Roadmap (post-v101)

v102 Theme menu integration · v103 Minimap · v104 Code spoke · v105 History spoke · v106+ paperweight punch-list + pre-1.0 cleanup · ~v115–v125 → 1.0.0 public release.

## Known bugs / paperweights

- **Source-adapter JSON-404** — Graph Sources live-refresh fetch returns HTML 404 instead of JSON; self-graph renders from fixture. High-priority; can't be on screen at launch.

## Recently resolved

- **Floating-tile click-interception** — `.tile-layer { pointer-events: none }` was already set; v101.0.6 added the click-through E2E test that formally closes this bug.

## Security / dependency debt

- **`chromium` → `tmp` high-severity advisory** (path traversal) — pre-existing, surfaced during the stylelint install. Resolve deliberately (check whether `chromium@3.0.3` is still needed vs. redundant with Playwright; do NOT `npm audit fix` blind). Own pass.
- **Redundant `stylelint-use-logical`** installed alongside `stylelint-plugin-logical-css` (the one actually configured) — uninstall the unused one.

## Recently resolved

- **CI red on all branches** — FIXED in v101.0.2b. Both jobs (CSS lint + TypeScript) green on Node 22; generate:graph runs before typecheck; self-graph fixture gitignored.
- **CLAUDE.md context bloat** — split into a generic `~/Projects/CLAUDE.md` + shared `DISCORD_PROTOCOL.md` (parent level) and a project-specific `~/Projects/lumaweave/CLAUDE.md`, with dense bodies extracted to `docs/agent/`. Cuts per-pass fixed context substantially.
