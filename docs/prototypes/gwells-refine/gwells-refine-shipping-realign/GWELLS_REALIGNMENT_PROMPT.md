# Gwells Realignment & Polish-to-Ship Brief

**For:** the next Claude conversation that picks up gwells work · **Output:** a synthesized understanding of where gwells is, where it's going, and what "polished and shippable alongside LumaWeave" requires.

This document is a corrective + realignment prompt. It exists because gwells has 26 planning docs (~430KB of design material) developed across LumaWeave-side Claude + ChatGPT collaboration, and the current planning surface is wider than the immediate ship-path requires. The goal here: separate **what must ship for LumaWeave v1.0** from **what's design for post-v1.0**, then sequence the must-ship work.

---

## §1 — Context (read first)

Ryan is solo-developing the LumaWeave ecosystem. **LumaWeave is the consumer; gwells is the upstream physics engine dependency.** LumaWeave is in its home-stretch arcs (currently v113 of v107-v115 → v1.0.0). Gwells must be polished to shippable quality "a day or two behind LumaWeave" per Ryan's sequencing intent.

**Key constraint:** gwells currently renders the LumaWeave self-graph (~400 nodes) acceptably, but Ryan reports it's **"kinda buggy and doesn't display large bodies of data well."** First impressions on public release will be dominated by the layout engine — if it can't handle larger graphs cleanly, the demo experience is broken.

**Ryan's working pattern:**
- High velocity (1-2 weeks of typical team work per day)
- Investigation-brief-then-implement loop (terminal Claude audits → planning Claude synthesizes → Bandit executes via Discord MCP)
- Direct recommendations over option trees
- "5% expertise" framing = division of labor, not deference signal
- Background in warehouse RCA at multi-billion-dollar scale — strong systems thinking, lived practice of zero-downtime architecture work

**Current gwells branch:** `feat/gwells-physics-migration` — sits at ~24 commits, currently on a substantial feature branch parallel to main. Recently completed Pass C9.5 (NaN guards) and post-gwells hygiene passes. **The branch is intended to merge to LumaWeave's main as a single coherent feature once polish completes.**

---

## §2 — What gwells IS, technically

Gwells is LumaWeave's physics engine, designed as a **standalone npm-extractable module** at `src/physics/gwells/`. Architectural properties:

- **Zero LumaWeave-specific imports.** Only `graphology` and `graphology-types`. Validator (`scripts/validate-gwells.mjs`) enforces this.
- **Renderer-agnostic.** Knows nothing about Sigma, React, theme tokens, or any LumaWeave concerns. Integration happens in `SigmaGraphView.tsx`, *outside* the module.
- **Four registries** following the project's standard registry contract pattern:
  - `wellTypes.ts` (gravity well types with default physics params)
  - `interactions.ts` (typed force interactions between well types — attraction, repulsion, spring, linear-alignment, perpendicular)
  - `seedFunctions.ts` (initial position layouts)
  - `dialects.ts` (named layouts that bundle seed + assignment + interactions + overrides)
- **One runtime entry point:** `applyDialect(graph, dialectId, options)`. Returns a controller with `.stop()`. Pure-data registries + one stateful engine loop.
- **Two dialects ship today:** `gwells.dialect.radial-backbone` (default, horizontal) and `gwells.dialect.parallel-spines` (vertical).
- **Determinism:** seed function pure → output deterministic. Optional `decoration` callback (typically wired to audio reactivity in LumaWeave) is the "aliveness" hook.

---

## §3 — Where gwells is HEADING (the v0.2 vision)

The 26 docs collectively describe a **v0.2 architecture migration** that adds a higher-level "profile" layer on top of the current dialect system. **This is design, not yet implemented.**

The v0.2 design:

```
Profile (user-facing)
  → Seed Layout
  → Node Family Map
  → Well Assignment Resolver
  → Interaction Set
  → Parameter Preset
  → User Overrides
  → existing applyDialect-compatible runtime
```

The core insight: current dialects bundle too much (seed + assignment + interactions + params) into a single user-facing unit. The v0.2 model decomposes this into composable pieces (profiles, families, presets, macro controls) so users can swap layouts, remap node families, adjust physics, and override selected nodes without replacing the whole system.

**Planned v0.2 profile catalog** includes: `universal-balanced`, `hierarchical-containment`, `knowledge-garden`, `document-library`, `web-domain-map`, `semantic-constellation`, `imported-position-preserve`, plus legacy wrappers for `radial-backbone` and `parallel-spines`.

The v0.2 migration roadmap is **11 phases** (M0-M10), explicitly designed as a staged migration that preserves current behavior. Stop points are defined at Phases 1, 3, 4, and 5.

---

## §4 — CRITICAL: separate ship-path from full-vision

The full v0.2 vision is **larger than what LumaWeave v1.0 needs**. The migration roadmap correctly identifies stop points; the question is which stop point ships with LumaWeave v1.0.

**Ryan's reported problem statement:** "kinda buggy, doesn't display large data well."

**That's a v0.1 polish problem, not a v0.2 architecture problem.** The current dialects work; they just need to handle larger graphs more gracefully and fix known bugs. The v0.2 profile system is genuinely valuable BUT it's a bigger lift than "make the existing dialects production-quality."

**Two paths to consider:**

**Path A — Ship v0.1 polished, defer v0.2 to post-LumaWeave-v1.0.**
- Fix known v0.1 issues (large-graph display, performance, the documented "queued" items)
- Make the two existing dialects production-quality
- Polish observable quality (visual smoothness, layout stability, drift behavior)
- v0.2 migration becomes a post-LumaWeave-v1.0 arc; current users see two working dialects with a "more layouts coming" framing

**Path B — Ship v0.2 Phase 1-4 with LumaWeave-v1.0, defer Phase 5-10 to post-v1.0.**
- Add the profile/family/registry scaffolding (Phases 1-3, ~types and resolution only, no engine changes)
- Implement `applyProfile` bridge (Phase 4) — both legacy dialects expressible as profiles
- v1.0 ships with the profile system in place but minimal UI integration
- Post-v1.0 arcs add recommendation scoring, macro controls, full UI, new profile behaviors

**Investigator's recommendation (from this realignment):** **Path A.** Reasoning:

1. Ryan's stated problem is v0.1 polish, not v0.2 architecture. Solving the wrong problem first risks shipping v0.2 scaffolding that still has the underlying v0.1 issues.
2. v0.2 is a substantial design with 26 docs of detail. Implementing even Phase 1-4 is multi-arc work; the LumaWeave home stretch is v113-v115. Stacking gwells v0.2 onto that schedule is risky.
3. Path A produces a clean public-shippable v0.1 that's a strong foundation. Path B produces v0.2 partial implementation that's harder to reason about.
4. The v0.2 vision doesn't go away — it becomes the gwells-v0.2 arc that ships post-LumaWeave-v1.0, with full design depth.

**But this recommendation must be validated by Ryan.** He may have specific v0.2 features that are critical for v1.0 demo quality (e.g., the universal-balanced profile as a "never-awful fallback" for unknown graphs). If so, scope tightens.

---

## §5 — What v0.1 polish actually needs (concrete list)

From the gwells docs, here's the inventory of v0.1 known-issues and queued work that should be evaluated for ship-readiness:

### From `GWELLS_CURRENT_STATE.md`'s "Design intent not yet implemented" section:

1. **Hub-ring for N ≥ 4.** When source data has many top-level subsystems (e.g., 30 genre directories), spines crowd at origin. Design: distribute spine origins along a circle of radius scaling with N. **This directly addresses large-graph display.**

2. **Parallel-spines inward branching.** Subdirectory trees should branch toward the central axis with gravity pull, with optional flip-files-outside toggle. Currently they branch outward, which contributes to visual crowding.

3. **UI tuning controls** for spacing, sizing, alternation, helix parameters. Currently all hardcoded or in dialect seedParams. Exposing as sliders is genuinely user-facing polish.

4. **Performance pass for larger graphs.** Current implementation is O(N²) in some interaction loops. ~400 nodes is fine; 10K+ needs revisit. **This is the load-bearing item for "doesn't display large data well."**

### From "Queued for upcoming passes":

5. **Pass C10 — universal structural classification.** Current `wellAssignment` matches on `nodeType === "directory"` / `nodeType === "file"` string literals. Doesn't generalize to Cypher/Obsidian/custom-JSON adapters. Fix: derive structural properties (depth-from-root, has-children, is-leaf) from graph topology. **Important for LumaWeave's source adapter platform — without this, gwells only works with the filesystem adapter cleanly.**

### From "Not blocking, filed for future passes":

6. **6 orphan leaves at repo root** end up at position (0,0) because they don't have a parent spine. Fix: add `spine.repo-root` OR mark as orphans by design.

7. **HMR doesn't retrigger seeder on `dialects.ts` edits.** Workflow papercut, low priority.

### From the v0.2 docs (Phase 5 — Runtime lifecycle safety):

8. **Cancel RAF on pause/stop, prevent duplicate loops, add runtime state.** These are real lifecycle issues regardless of v0.2; current engine likely has them as latent bugs.

### From `GWELLS_DESIGN_CONVERSATIONS.md` (read this for context on what's already been considered and rejected — prevents redoing that exploration).

---

## §6 — Recommended polish-to-ship arc shape

If Path A is selected (recommended), the gwells polish-to-ship arc looks like:

**Pass C10 — Universal structural classification** (high priority for source-adapter compatibility)
- Replace string-literal node type matching with structural property derivation
- Make wellAssignment work for arbitrary graph shapes, not just filesystem-adapter output
- Add a test fixture that's NOT filesystem-shaped (mock Cypher-style, mock Obsidian-style)

**Pass C11 — Hub-ring for N ≥ 4** (high priority for large-data display)
- When ≥4 top-level subsystems exist, distribute spine origins on a circle
- Tune radius scaling with N
- Visual test against ~400-node and ~1000-node fixtures

**Pass C12 — Performance pass** (high priority for large-data display)
- Identify O(N²) hot paths in the engine loop
- Apply spatial-partitioning optimizations (quadtree for repulsion, Barnes-Hut if needed)
- Benchmark before/after on 1K, 5K, 10K node fixtures
- Performance target: stable interactive frame rate on 5K nodes minimum

**Pass C13 — Parallel-spines inward branching** (medium priority — visual polish for the second dialect)
- Reorient subtree branching for parallel-spines dialect
- Add the flip-files-outside toggle as a dialect parameter

**Pass C14 — Runtime lifecycle hygiene** (must-do, latent-bug hardening)
- RAF cancellation on pause/stop
- Duplicate-loop prevention
- Runtime state introspection

**Pass C15 — UI tuning controls** (LumaWeave-side work, not gwells-internal)
- This is actually a LumaWeave UI arc that exposes gwells parameters via the Handle Registry
- Could happen during LumaWeave v113-v115 rather than as a gwells-branch commit

**Pass C16 — Merge to main + arc close** (the actual "gwells polished and shippable")
- Merge `feat/gwells-physics-migration` to LumaWeave's main
- Run full LumaWeave E2E suite against the merged branch
- Document gwells-v0.1 as shipped; v0.2 design preserved as deferred-to-post-v1.0

**Sequencing thoughts:**
- Passes C10, C11, C12 are the load-bearing polish for "production-quality v0.1." These three are the critical path.
- C13, C14 are polish-tier — important but not blocking ship.
- C15 belongs in LumaWeave arcs, not gwells-branch commits.
- Estimated 4-6 commits on the gwells branch + merge commit.

---

## §7 — How v0.2 docs become useful (later)

The 26 v0.2 docs are not wasted work even if Path A is selected. They become the **gwells-v0.2 arc** that ships post-LumaWeave-v1.0:

- The design depth means v0.2 implementation can move fast when it begins (no design churn)
- The Phase 1-4 implementation can happen even before LumaWeave v1.0 if Ryan has bandwidth, since those phases are additive-only (no behavior change)
- The committee review (`gwells-committee-review.md`) and design conversations (`GWELLS_DESIGN_CONVERSATIONS.md`) capture rationale that prevents future re-litigation

**The discipline:** treat the v0.2 docs as a design library, not a TODO list. Implementation happens when implementation is the right move; design quality is preserved regardless.

---

## §8 — Decision checklist for Ryan

Before any gwells-branch implementation work happens, Ryan should lock these:

1. **Path A vs Path B.** Polish v0.1 to ship (recommended) vs. partial v0.2 implementation with LumaWeave v1.0?

2. **Which v0.1 polish passes are critical for v1.0?**
   - C10 (universal structural classification) — recommended yes; needed for source-adapter compatibility
   - C11 (hub-ring for N ≥ 4) — recommended yes; addresses "large data display"
   - C12 (performance pass) — recommended yes; addresses "doesn't display well"
   - C13 (parallel-spines inward branching) — recommended optional
   - C14 (runtime lifecycle hygiene) — recommended yes; latent bugs
   - C15 (UI tuning controls) — recommended deferred to LumaWeave-side arc

3. **Performance target for "shippable."** What graph size must gwells handle smoothly?
   - 1K nodes? 5K? 10K? 50K?
   - This sets the bar for C12

4. **Cerebra data integration.** Ryan offered "I have data we could pull in from Cerebra for testing." This is exactly the kind of non-filesystem-shaped test fixture C10 needs. Should the gwells polish arc include "test against Cerebra-shaped data" as an explicit milestone?

5. **Sequencing relative to LumaWeave home stretch.** Parallel-develop on `feat/gwells-physics-migration` while LumaWeave continues v113-v115 on main? Or pause LumaWeave home stretch entirely until gwells polish lands?

6. **Branch merge timing.** Merge gwells polish to main:
   - Before LumaWeave v113 starts? (gwells fixes available to LumaWeave during home stretch)
   - During LumaWeave v113-v114? (gwells polishes in parallel; merges during a quiet arc-close moment)
   - After LumaWeave v115 closes but before v1.0.0 tag? (final integration before ship)

---

## §9 — How to use this document

This is a realignment prompt for **the next gwells planning conversation.** When Ryan brings it up to a fresh Claude (or returns to it himself):

1. Start by reading this document end-to-end (§1-§8)
2. Walk through §8 decision checklist with Ryan to lock the path
3. Once Path A or B is locked, scope the first investigation brief (likely "audit current gwells code against §5's known-issue list")
4. From there, the normal LumaWeave-pattern workflow applies: investigation brief → decision synthesis → Bandit implementation prompt → commit

**Key reminder for the next Claude:** Ryan's 26 docs represent design depth, not blocker work. Don't get pulled into v0.2 implementation just because the docs are there. The question is always: *what does LumaWeave v1.0 need from gwells, and what does that require?* Everything else is post-v1.0.

---

## §10 — Quick-reference: which doc covers what

For when the next Claude needs to look something up:

**Orientation:**
- `GWELLS_README.md` — module overview, what gwells is, when to touch it
- `GWELLS_OVERVIEW.md` — terser summary
- `GWELLS_CURRENT_STATE.md` — migration arc history, what works, known issues
- `GWELLS_PHYSICS.md` — the physics model

**Architecture:**
- `GWELLS_ARCHITECTURE.md` — internal structure
- `GWELLS_REGISTRY_PATTERNS.md` — how the four registries compose
- `GWELLS_PIPELINES.md` — data flow
- `GWELLS_LAYOUT_RULES.md` — layout invariants

**The two shipped dialects:**
- `GWELLS_DIALECT_RADIAL_BACKBONE.md` — the default horizontal dialect
- `GWELLS_DIALECT_PARALLEL_SPINES.md` — the vertical dialect

**Why decisions were made (read for context):**
- `GWELLS_DESIGN_CONVERSATIONS.md` — load-bearing decision rationale
- `gwells-committee-review.md` — committee perspective on the design
- `gwells-proposal.md` — original proposal

**v0.2 vision (the future architecture):**
- `GWELLS_V0_2_LAYOUT_PROFILE_SYSTEM.md` — profile system overview
- `GWELLS_V0_2_IMPLEMENTATION_BRIDGE.md` — code-level migration path
- `GWELLS_V0_2_MIGRATION_ROADMAP.md` — 11-phase staged migration
- `GWELLS_V0_2_TESTING_AND_VALIDATION_PLAN.md` — what verification needs to happen
- `GWELLS_PROFILE_REGISTRY_CONTRACT.md` — the profile contract
- `GWELLS_NODE_FAMILIES_AND_WELL_TYPES.md` — node family taxonomy
- `GWELLS_PROFILE_APPLY_MODES_AND_OVERRIDE_SEMANTICS.md` — how overrides cascade
- `GWELLS_RUNTIME_LIFECYCLE_AND_SAFETY_SEMANTICS.md` — lifecycle rules
- `GWELLS_SEED_LAYOUTS_V0_2.md` — the planned seed layouts catalog
- `GWELLS_LAYOUT_MATRIX_AND_GUIDE.md` — recommendation matrix
- `GWELLS_GRAPH_ANALYSIS_AND_RECOMMENDATION_SCORING.md` — scoring algorithms
- `GWELLS_MACRO_CONTROLS_AND_PARAMETER_MAPPING.md` — UI macro controls
- `GWELLS_UI_CONTROL_MODEL.md` — UI integration model
- `GWELLS_FUTURE_VISION.md` — speculative future direction
- `GWELLS_PROBES_AND_DIAGNOSTICS.md` — observability surface

The v0.2 catalog is substantial. The next Claude should NOT read all of these before working; read what's needed for the immediate question and reference the rest situationally.

---

## §11 — One more thing about scope discipline

Ryan caught a category error in v112's framing ("remove placeholders" → "substitute honest content") that significantly improved the arc's quality. The same discipline applies here: the existing 26-doc plan is impressively designed, but **the question isn't "should we implement the design?" The question is "what does LumaWeave v1.0 ship need, and what's the minimum gwells work that delivers it?"**

If the answer is "v0.1 polished," the v0.2 docs are preserved design depth for later. If the answer is "v0.2 Phase 1-4," scope accordingly. Don't let the design's depth pull the scope wider than the shipping need.

The next Claude's first job is helping Ryan answer §8.1 clearly. Everything else cascades from that decision.
