# LumaWeave — Polish Debt (running, V3)

Continuation of V1/V2. Volume 3 collects items found during v100.0.7–.8 and the closer scoping. Status key: OPEN · ACCEPTED · WONTFIX · DONE.

---

## Volume 3 — found during v100.0.7–.8 + closer scoping

### 11. Canonical v100 docs lack structural frontmatter → invisible to self-graph
**Where:** `docs/canonical/*.md` (all 10 new canonical docs)
**Found:** v100.0.8 landing. The self-graph generator (`scripts/generate-self-graph.mjs`) is a directory walker using gray-matter; it includes any doc where `include_in_self_graph !== false` and derives node id from `frontmatter.id`, edges from `references:` (explicit-reference, weight 1.0) and `tag-overlap`. The new docs have NO frontmatter, so after .7/.8 archive the old docs, the self-graph LOSES those topic nodes instead of re-mapping to the canonical docs.
**Why it matters:** the self-graph (LumaWeave's own dogfood fixture) will shrink/misrepresent the doc structure until fixed. Not a runtime break (fixture self-heals on Vite restart), but the graph is wrong in the interim.
**Resolution (CLOSER task, v100.0.9):** add minimal STRUCTURAL frontmatter to each canonical doc. This does NOT violate the no-volatile-frontmatter rule — `include_in_self_graph`/`id`/`title`/`domain`/`cluster`/`references`/`tags` are timeless classification metadata (true in 20 passes); the banned fields are the volatile ones (`status`, `last_updated`, `last_pass`, `version`). Refine DOC_ARCHITECTURE.md to state this two-category distinction explicitly.
**Exact frontmatter block per canonical doc (closer):**
```
---
id: <stable.dotted.id>            # e.g. system.registry.and.link.network
title: <Doc Title>
type: manual                      # these are operating-manual domain docs
domain: <domain>                  # registry | theme | graph | physics | source-adapter | control-plane | tile-layout | deferred-vision | doc-architecture | versioning
cluster: <color>                  # pick from in-use palette: purple/teal/slate/gold/lime/azure/blue/violet/ember/stone
agent_readable: true
include_in_self_graph: true
references:                       # dotted ids of related canonical docs → drives self-graph edges
  - <other.canonical.id>
tags: [<domain>, manual, v100]
---
```
NOTE: omit `status`/`last_updated`/`last_pass`/`version` — those stay banned. Map each doc to a cluster color (suggest: registry=slate, theme=gold, graph=azure, physics=lime, source-adapter=teal, control-plane=blue, tile-layout=violet, deferred-vision=purple, doc-architecture/versioning=stone). Wire `references:` between the canonical docs so they form a connected cluster in the self-graph (e.g. graph→physics, theme→graph, control-plane→registry, etc.). Status: OPEN (closer).

### 12. Registries hardcode doc paths (docPath / Contract: JSDoc) → break on archive
**Where:** `controlPlaneModeRegistry.ts`, `systemIndexRegistry.ts`, `qa-registry.ts`, `advisory-registry.ts`, `sourceAdapterRegistry.ts` (JSDoc `Contract:` headers + `docPath`/`location` fields)
**Found:** v100.0.5/.6 landings — Bandit had to repoint several to canonical docs; one had a `00_` prefix mismatch that pointed at a nonexistent path.
**Why it matters:** registry entries carrying literal doc paths are fragile — every doc move requires hunting these down, and they silently rot (the `00_` mismatch proves it). Same class as the trace-matrix hard dependency.
**Suggested fix (closer or later):** decide whether registry entries should carry doc paths at all. Options: drop them, or reference canonical docs through a single indirection (a doc-id → path map) so moves touch one place. Status: OPEN.

### 13. CONTRACT_TO_CODE_TRACE_MATRIX.md is a live validator input (held from archive)
**Where:** `docs/control-plane/contracts/CONTRACT_TO_CODE_TRACE_MATRIX.md`, read by `scripts/validate-contract-trace.mjs` (+ docPath refs in 2 registries)
**Found:** v100.0.6. Hard-held — can't archive without rewriting the validator.
**Why it matters:** a doc functioning as a code input couples docs↔CI; it's outside the static/live doc model entirely.
**Resolution (CLOSER, judgment call):** either (a) rewrite `validate-contract-trace.mjs` to derive the trace from code/registries instead of parsing a markdown matrix, then archive the doc; or (b) formally classify it as a machine-read data file (not a doc) and move it to a data location. Status: OPEN (closer .9b).

### 14. SELF_GRAPH_SCHEMA.md held — needs a home
**Where:** `docs/graph/contracts/SELF_GRAPH_SCHEMA.md`
**Found:** v100.0.5. Held (graph-domain, documents the live v0/v1 self-graph schema). No runtime file dep, but documents a real contract.
**Resolution (CLOSER):** fold its schema content into either the Graph/Sigma/Rendering doc or the Source Adapter doc (whichever owns the self-graph fixture schema), then archive. Status: OPEN (closer).

### 15. include_in_self_graph default is "absent = included" — silent inclusion risk
**Where:** `scripts/generate-self-graph.mjs` (`include_in_self_graph !== false`)
**Found:** v100.0.8. Any new doc without the flag is included by default. Combined with item 11, this means frontmatter-less docs are excluded by node-id derivation but the policy is "include unless opted out" — slightly contradictory; worth making the policy explicit.
**Why it matters:** ambiguous default makes it easy to accidentally include scratch/wip docs or exclude intended ones.
**Suggested fix:** decide the default explicitly (opt-in vs opt-out) and document it in DOC_ARCHITECTURE.md alongside the structural-frontmatter rule. Status: OPEN (low priority).

---

## Volume 4 — found during v101 (Tile Migration)

### 16. bumper non-FF guard trips auto-push → needs manual rescue
**Where:** blog.bumper / bitmosh-website repo (not LumaWeave source)
**Found:** v101.0.6. When another commit lands in the blog repo between `bumper bump --dry` and the live bump, the git push guard fires and the bump exits 1 with the post written-but-not-pushed. Recovery: `git pull --ff-only` + manual `git add/commit/push` in the blog repo. Ryan is tracking bumper polish separately. Status: OPEN (bumper issue — see blog.bumper repo).

### 17. Redundant `stylelint-use-logical` package installed alongside configured `stylelint-plugin-logical-css`
**Where:** `package.json` devDependencies
**Found:** v101.0.2b. `stylelint-use-logical` is installed but not configured; `stylelint-plugin-logical-css` is the one actually wired in `.stylelintrc.json`. Unused dependency — uninstall candidate.
**Suggested fix:** `npm uninstall stylelint-use-logical` (with Ryan approval per package safeguard). Status: OPEN.

### 18. `chromium` → `tmp` high-severity advisory (path traversal)
**Where:** npm dependency tree
**Found:** surfaced during v101.0.2b stylelint install. Pre-existing; `chromium@3.0.3` may be a transitive dep of a legacy tool now redundant with Playwright. Do NOT `npm audit fix` blind.
**Suggested fix:** determine if `chromium@3.0.3` is still needed; if redundant, remove the dep that pulls it in; if needed, await a patch. Slated for v106+ security pass. Status: OPEN.

### 19. 5 deferred stylelint logical-property warnings in StatusBar.css
**Where:** `src/control-plane/StatusBar.css` (bottom, left, right, max-width×2)
**Found:** v101.0.2b. Physical CSS properties flagged at warning severity per `stylelint-plugin-logical-css` config. Ignored this pass to avoid a large CSS rewrite.
**Suggested fix:** replace with logical equivalents (`inset-block-end`, `inset-inline-start`, `end`, `max-inline-size`), then tighten stylelint rule from `warning` → `error`. Status: OPEN.

### 20. SNAP_TOL / BREAK_TOL feel-tuning
**Where:** `src/control-plane/panels/tileUtils.ts` (lines 45-47)
**Found:** v101. `SNAP_TOL = 15px`, `BREAK_TOL = SNAP_TOL * 2 = 30px`. Ryan noted SNAP_TOL may want bumping to 20-25px once lived-in; BREAK_TOL multiplier may also need feel-tuning.
**Suggested fix:** tune after real-world use. Both are exported constants — change in one place. Status: OPEN (tunable, low urgency).
