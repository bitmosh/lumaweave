---
id: system.versioning.arcs
title: Versioning & Arcs
cluster: slate
references:
  - system.doc.architecture
tags:
  - versioning
  - arcs
  - canonical
  - v100
status: canonical
include_in_self_graph: true
type: manual
agent_readable: true
last_updated: 2026-05-31
---

# LumaWeave — Versioning & Arcs

**Status:** canonical · **Current arc:** v100 (Baseline Refocus) · **Production version:** 0.7.0

The single source of truth for how LumaWeave is versioned, how arcs and passes are numbered, and how a pass becomes a dev-log post. The dev-log pipeline (`blog.bumper`) parses the version tag and rolls passes up by hierarchy level, so strict, monotonic numbering is a hard requirement.

---

## The version schema: `v<arc>.<phase>.<pass>` (+ optional in-flight letter)

One number, three planned levels plus an in-flight escape hatch. Example: `v100.0.1`.

| Level | Position | Meaning |
|---|---|---|
| **Arc** | 1st (`100`) | The internal development arc. Monotonic. An arc closes one production-semver line. |
| **Phase** | 2nd | A **planned** sub-arc phase. `v100.x.0` marks each phase; increments per planned phase. |
| **Pass** | 3rd | A **planned** granular pass within a phase. The finest planned level. |
| **In-flight** | trailing letter | **Unplanned** work that surfaces mid-pass and must be squeezed in. Attaches to the pass it interrupts: `v100.2.3a`, `v100.2.3b`, … **Never used for planned work.** |

Rules:
- **Strictly monotonic at every level. Never regress, never jump.**
- Phase markers are `v<arc>.<phase>.0`. Passes increment the 3rd position within a phase. Letters stretch a single pass when the unplanned arrives.
- **This exact string goes in the `PASS COMPLETE` version field**; `blog.bumper` seeds the post tag from it (`tag_strategy = from-version`).

### Why the hierarchy matters (bumper rollup)

The levels let the bumper group posts. **Granular per-pass mode** (current): every pass gets its own dev-log post. **Arc-rollup mode** (enabled later): the bumper collects the passes under a phase/arc and compiles them into a single arc post. That rollup is only correct if numbering is clean and monotonic — a jumped or regressed version corrupts the grouping.

---

## Two axes (orthogonal)

- **The version tag** (`v100.0.1`) — the dev-log / bumper identity. Granular, per pass. The arc number lives here.
- **Production semver** in `package.json` — currently `0.7.0`. Bumps **at arc close**, not per pass. v100 closes the `0.7.0` line, so the v100 closer cuts `0.7.0 → 0.8.0`. `1.0.0` = initial public release (~arc v115–v125).

---

## The per-pass publish flow (commit → report → bump → push)

Ordering is deliberate: the bump happens **after the source commit, before any source push**, so a fully-local source repo (git only, no remote) still publishes. The blog push is independent of source hosting; the SHA is just a reference string.

1. **Work + verify** (typecheck, targeted specs foreground).
2. **Commit/merge** (local) — mints the 7-char SHA.
3. **Bandit posts `PASS COMPLETE` to #changelog** (Discord MCP) with the real SHA. Bandit can continue after posting.
4. **`bumper bump --dry`** — render + preview, writes nothing.
5. **Gate in #approve-this** — reviewable sample; approve / fix / reject.
6. **Live `bumper bump`** — reads the #changelog message, renders MDX, commits + pushes to the **blog repo** (Vercel deploys).
7. **Push source** — only if the source repo has a remote; separate and optional.

`blog.bumper` only ever pushes to the blog repo, never the source. **Dating:** the post date comes from the Discord message's server timestamp, not the header — post the report close to the commit so the dev-log date matches the work.

---

## Current arc — v100: Baseline Refocus

**Scope:** square the codebase and rewrite the docs into a clean, accurate, code-derived baseline before the feature push to 1.0. Phase 0 is the doc consolidation (≈40–50% doc reduction via canonical per-domain docs). The closer bumps production semver `0.7.0 → 0.8.0`.

| Pass | Work | Commit |
|---|---|---|
| **v100.0.0** | Opener — versioning scheme + consolidation plan + roadmap refocus | — |
| **v100.0.0a** | *In-flight:* dead `commands/` hotkey dedup + PK↔code mirror | `130d619` |
| **v100.0.1** | Registry & Link Network canonical doc | — |
| **v100.0.2** | Theme & Token System canonical doc | — |
| **v100.0.3** | Graph, Sigma & Rendering canonical doc | — |
| **v100.0.4** | Gwells Physics canonical doc | — |
| **v100.0.5** | Source Adapter canonical doc | — |
| **v100.0.6** | Control Plane & System Index canonical doc | — |
| **v100.0.7** | Tile & Layout Workspace canonical doc | — |
| **v100.0.8** | Deferred / Post-v1 Vision canonical doc (consolidate-and-keep) | — |
| **v100.0.9** | Closer — roadmap re-canon, `LUMAWEAVE_CURRENT_STATE` refresh, archive reconciliation, bump `0.7.0 → 0.8.0` | — |

A planned second sub-arc phase (if one arises) would be `v100.1.0+`. Unplanned mid-pass work gets a letter on the interrupted pass (e.g. `v100.0.2a`).

---

## Refocused roadmap (post-v100)

The feature work shifts to its own arcs after v100 closes:

| Arc | Work | (prior label) |
|---|---|---|
| **v100** | Baseline Refocus (code square + doc rewrites) · closes 0.7.0 → 0.8.0 | new |
| v101 | Tile migration — react-grid-layout + react-moveable; **must fix floating-tile click-interception bug** | v100 |
| v102 | Theme menu integration (Claude Design settings → product) | v101 |
| v103 | Minimap integration | v102 |
| v104 | Code spoke (live + diff editor) | v103 |
| v105 | History spoke deepening | v104 |
| v106+ | Paperweight punch-list (source-adapter fix, theme-workshop polish, tile CSS theming), pre-1.0 cleanup incl. **CI green**, then polish band | — |
| ~v115–v125 | `1.0.0` initial public release | — |

(Per-arc production-semver bumps and the exact later arc numbers finalize in the v100.0.9 closer.)
