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

**Updated:** 2026-05-31 · **Production version:** 0.7.0 · **Internal arc:** v100 (Baseline Refocus) · **Last pass:** v100.0.1

---

## Current arc

**v100 — Baseline Refocus.** Square the codebase and rewrite docs into a clean, code-derived, static/live-separated baseline before the feature push to 1.0. Closer bumps production semver 0.7.0 → 0.8.0.

| Pass | Work | Status | Commit |
|---|---|---|---|
| v100.0.0a | Dead `commands/` hotkey dedup + PK↔code mirror | done | `130d619` |
| v100.0.1 | Registry & Link Network canonical doc + doc-architecture split | in flight | — |
| v100.0.2 | Theme & Token System canonical doc | queued | — |
| v100.0.3 | Graph, Sigma & Rendering | queued | — |
| v100.0.4 | Gwells Physics | queued | — |
| v100.0.5 | Source Adapter | queued | — |
| v100.0.6 | Control Plane & System Index | queued | — |
| v100.0.7 | Tile & Layout Workspace | queued | — |
| v100.0.8 | Deferred / Post-v1 Vision | queued | — |
| v100.0.9 | Closer — roadmap recanon, retire stale state docs, bump 0.7.0 → 0.8.0 | queued | — |

## Roadmap (post-v100)

v101 Tile migration (react-grid-layout + react-moveable; must fix floating-tile click-interception bug) · v102 Theme menu integration · v103 Minimap · v104 Code spoke · v105 History spoke · v106+ paperweight punch-list + pre-1.0 cleanup incl. CI green · ~v115–v125 → 1.0.0 public release.

## In flight

- v100.0.9 closer (arc close). Frontmatter normalized, stale state docs archived, refs repointed. .9b pending: arc table update, semver bump 0.7.0 → 0.8.0.

## Known bugs / paperweights

- **Floating-tile click-interception** — floating tiles intercept graph-canvas clicks. Must fix in v101 tile migration. (`docs/known-bugs/`)
- **Source-adapter JSON-404** — Graph Sources live-refresh fetch returns HTML 404 instead of JSON; self-graph renders from fixture. High-priority; can't be on screen at launch.
- **CI red on all branches incl. main** — must be green before public launch.

## Cleanup debt (v100.0.9b remaining)

- Strip `status/last_updated/last_pass` frontmatter from all surviving static docs (.9b).
- Dangling refs flagged during passes: `(NEW-V86+)V86_BANDIT_MASTER_INDEX.md`, `REHAUL_LEDGER.md` (.9b).
- Update arc table with all v100.0.1–v100.0.9a commits and real SHAs (.9b).
