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
tags: [live-state, now, canonical, v100]
---

# LumaWeave — NOW

**The single live-state doc.** This is the only doc that changes every pass and the only one that carries a date. Everything here is volatile by design. Concepts and architecture live in the static domain docs (see `DOC_ARCHITECTURE.md`); history lives in the dev-blog / #changelog feed. This doc holds only: where we are, what's next, what's broken.

**Updated:** 2026-06-01 · **Production version:** 0.8.0 · **Internal arc:** v101 (Tile Migration) · **Last pass:** v100.0.9b (arc close)

---

## v100 arc — CLOSED

**v100 — Baseline Refocus** — COMPLETE. Production semver bumped 0.7.0 → 0.8.0.

| Pass | Work | Commit |
|---|---|---|
| v100.0.0a | Dead `commands/` hotkey dedup + PK↔code mirror | `130d619` |
| v100.0.1 | Registry & Link Network canonical doc | `6b1c9ea` |
| v100.0.2 | Theme & Token System canonical doc | `a8ec5f8` |
| v100.0.3 | Graph, Sigma & Rendering canonical doc | `c0f3d5a` |
| v100.0.4 | Gwells Physics canonical doc | `a226b87` |
| v100.0.5 | Source Adapter canonical doc | `39a748c` |
| v100.0.6 | Control Plane & System Index canonical doc | `d0cdfc5` |
| v100.0.7 | Tile & Layout Workspace canonical doc | `b903727` |
| v100.0.8 | Deferred / Post-v1 Vision canonical doc | `26ffa69` |
| v100.0.9a | Closer part A — frontmatter, relocate canonical, archive stale state docs | `00d8829` |
| v100.0.9b | Closer part B — held docs resolved, registry cleanup, 0.7.0 → 0.8.0 | `10207e8` |

## Current arc — v101: Tile Migration

**Next:** v101 — Tile Migration. Replace the current floating-tile system with react-grid-layout + react-moveable. Must fix the floating-tile click-interception bug (docs/known-bugs/).

## Roadmap (post-v101)

v102 Theme menu integration · v103 Minimap · v104 Code spoke · v105 History spoke · v106+ paperweight punch-list + pre-1.0 cleanup incl. CI green · ~v115–v125 → 1.0.0 public release.

## In flight

- v100.0.9b landed at `10207e8`. Arc closed.

## Known bugs / paperweights

- **Floating-tile click-interception** — floating tiles intercept graph-canvas clicks. Must fix in v101 tile migration. (`docs/known-bugs/`)
- **Source-adapter JSON-404** — Graph Sources live-refresh fetch returns HTML 404 instead of JSON; self-graph renders from fixture. High-priority; can't be on screen at launch.
- **CI red on all branches incl. main** — must be green before public launch.
