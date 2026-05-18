---
id: physics.gwells.current-state
title: Gwells Physics — Current State
status: active
last-updated: 2026-05-17
---

# Gwells Physics — Current State

## Migration arc

The gwells migration began with Pass A on a `feat/gwells-physics-migration`
branch. Each pass is a single git commit. As of 2026-05-17, the branch is at
24 commits — the most recent being Pass C8.4, the comprehensive handoff
documentation, and a C-hygiene cleanup of stale `end-to-end-spine`
references.

```
[Pass A]       Setup, repo conventions, validator stubs
[Pass B]       Validator script — 12 structural checks
[Pass C1]      Engine + types + initial registry entries
[Pass C2]      Radial-backbone seeder + three dialect entries
[Pass C3]      Visual integration — FA2 retired, gwells live in Sigma
[Pass C3.1]    Parallel-spines seeder + helix-twist record refactor
[Pass C3.1.1]  Cleanup — typecheck, migrations, test wiring
[Pass C3.1.2]  Remove FA2 cleanup debt
[Pass C4]      Live tuning sliders for helixTwist (per-well-type)
[Pass C5]      Seed-position retention via seedAdherence
[Pass C6]      Synthesize directory nodes (the now-retired "flatten" approach)
[Pass C7]      Edge-aware interactions (requireEdge: "contains-parent")
[Pass C8]      Fern-frond hierarchical layout + dynamic spine enumeration
                (commit abf775f)
[Pass C8.2]    Per-pair spring distance (commit f92f5a7)
[Pass C8.3]    Size-aware phyllotaxis layout (commit 7a435bd)
[Pass C8.4]    Spine bucketing + static alternation + root-spine far-end
                + sizing model fix (itemSizesReference: positions)
                (commit c537ea6)
[Pass C9.0]    Default drift-back drag; spine-drag gated
                (commit 613009d)
[Pass C9.1]    Scoped drag with modifier-held pin gesture + per-dialect pin storage
                (this commit)
[Pass C9.2]    Pin management UI: Reset Pinned button, Ctrl+RightClick per-node reset,
                pinned bookmark dim-on-select highlight mode
                (this commit)
[Pass C9.3]    Hardens dim-on-pinned test and adds render bug regression test
                (this commit)
[Pass C9.4]    Fixes pinned-highlight wiring and adds v84→v85 migration
                (this commit)
[Pass C9.4b]   Closed two latent wiring issues exposed by the
               C9.4 audit: drag-handler refs from C9.1 were dead
               code (drag handlers were reading dialectId/
               activePins from stale mount-effect closures), and
               activePins was missing from Effect B's dep array
               (causing dim mode to not refresh when pins were
               added/removed mid-session). Two regression tests
               added. (this commit)
[Pass C9.5 c1] Added defensive NaN guards across the drag-pin
               pipeline (PlasmaOverlayEdge, engine integration
               and position writes, applyPins, drag handlers).
               Tightened the C9.3 regression test to assert
               every node has finite x/y post-mouseup, not just
               a probe. Diagnostic logs left in place for
               commit 2 to identify root cause. (this commit)
[Pass C9.5 c2] Promoted C9.5 commit 1 NaN guards to permanent.
               Removed diagnostic logs. Added Ctrl-drag
               regression test 'Pass C9.5: Ctrl-drag does not
               produce NaN positions'. Pre-existing
               graph-blanks-on-mouseup render bug is resolved.
               (this commit)
[Post-gwells hygiene 1] Gitignored self-graph fixtures (they
               regenerate automatically via Vite plugin).
               Resolved duplicate vP-backbone-spacing
               emit in generate-self-graph.mjs. Added
               fresh-clone setup note to README. (this
               commit)
```

Each pass commits cleanly with passing tests. The branch is intended to be
merged to main as a single coherent feature once Pass C9 completes.

## What works

### Architecture

- Gwells module is standalone (no `@/` imports). Validator enforces.
- Four registries (well types, interactions, seed functions, dialects) follow
  the project's registry contract pattern.
- Two dialects ship: `gwells.dialect.radial-backbone` (default) and
  `gwells.dialect.parallel-spines`.
- Settings store v85 with migration chain from FA2-era v80.

### Layout

- Hierarchical fern-frond placement: directories branch outward in chains
  matching filesystem depth.
- 41 dynamically-enumerated spines for the self-graph (8 src + 31 docs + 2
  root-spines).
- Phyllotaxis file orbits: files sorted by size, smallest near parent, largest
  far. Phi-angle (137.508°) between consecutive files.
- Content-driven node sizing: log-mapped from raw size to visual range
  [48, 360] in graph coordinates. Directories and spines aggregate
  recursively.
- Spine bucketing by first path segment: src spines and docs spines on
  different axes.
- Static per-axis alternation: each spine consumes one alternation slot;
  subtree extends in the spine's assigned direction.
- Root-spines (`spine.src-root`, `spine.docs-root`) at the far end of their
  respective axis.

### Physics

- Per-frame `stepPhysics` loop with force dispatch by interaction kind.
- Spring force agrees with seeder via `pairIdealDistance` map (Pass C8.2).
- Edge-aware interactions via `requireEdge` filter (Pass C7).
- Seed-adherence force pulls toward seeded position (Pass C5).
- Center gravity force pulls toward origin (Pass C3.1).
- Damping integration for stability.

### Tests

- Validator (`npm run physics:gwells`): 12/12 passing.
- Gwells Playwright spec (`tests/e2e/gwells-physics.spec.ts`): 18/18 passing
  as of Pass C9.5. The Pass C5 drag-seed test threshold was bumped from 800
  to 1100 in Pass C8.4 to accommodate the per-pair-spring behavior change
  introduced in Pass C8.2 plus the layout-scale changes from C8.4. Pass C9
  reworked the drag-pin tests and added pinned-highlight tests. Pass C9.5
  added NaN guards and a Ctrl-drag regression test.

## Sample current values

For radial-backbone dialect with the LumaWeave self-graph (~400 nodes):

- `spineSpacing: 1200` (units between consecutive spine nodes along an axis)
- `directoryOffset: 2400` (units between consecutive directory levels along
  an outward fern frond)
- `fileOrbitRadius` base: 360 (legacy fallback; phyllotaxis uses its own
  `MIN_ORBIT` / `MAX_ORBIT` computed in `computeFileOrbit` instead)
- Phyllotaxis `MIN_ORBIT` / `MAX_ORBIT`: defined in `computeFileOrbit` in
  `seederHelpers.ts`, tuned for the current sizing model
- `computeNodeSize`: MIN 48, MAX 360, SCALE_REF 6000 (logarithmic)

Sigma's `itemSizesReference` is set to `"positions"` (Pass C8.4), so node
visual sizes live in graph coordinates rather than screen pixels. The graph
extent at these values is approximately 48,000 × 16,000 units (~3:1 ratio).
At the default camera ratio (~1.0), the full graph fits the viewport. Node
sizes scale proportionally with the coordinate space, so tuning spacing
values has visible effect — a key design rule established in Pass C8.4. See
`GWELLS_LAYOUT_RULES.md` Rule 5 (Content-Driven Sizing) and
`GWELLS_DESIGN_CONVERSATIONS.md` for the rationale.

## Known issues

### Not blocking, filed for future passes

- **8 pre-existing e2e failures** unrelated to gwells:
  contract-registry-spec, quality-preset-coupling, settings-migrations,
  theme-target-inspector (3 tests), v86c-tile-system (2 tests). These existed
  before gwells migration began and are not affected by gwells work. Filed
  for separate cleanup pass.
- **6 orphan leaves at repo root** (`package.json`, `tsconfig.json`,
  `tsconfig.node.json`, `vite.config.ts`, `playwright.config.ts`,
  `src/App.tsx`). The source adapter logs these as orphans; they end up at
  position (0, 0) because they don't have a parent spine. A future pass could
  add a `spine.repo-root` for them OR explicitly mark them as orphans by
  design.
- **HMR doesn't retrigger seeder on `dialects.ts` edits.** Editing dialect
  parameters in dev requires a hard reload (Ctrl+Shift+R) or a dialect-switch
  toggle to re-run the seed function. This is a workflow papercut, not a
  correctness issue. Low priority.
- **[Resolved in post-gwells hygiene pass] Pre-existing duplicate-node bug**
  in `src/graph/renderers/sigma2d/buildGraphologyGraph.ts:75` for a node id
  "vP-backbone-spacing". Root cause: two docs (`vP-backbone-spacing-report.md`
  and `vP-backbone-spacing-investigation.md`) had the same frontmatter
  `id: vP-backbone-spacing`. Fix: added dedup guards in
  `scripts/generate-self-graph.mjs` that skip node emission if the id
  already exists in nodeMap, with console.warn logging the collision.
- **Drag-on-mouseup makes the graph view go blank.** Pre-existing render bug
  in SigmaGraphView, separate from physics. Filed separately. Will be
  addressed when Pass C9 redesigns drag handling.
- **Pass C5 drag-seed test was reworked in Pass C9.0** to assert drift-back
  instead of stay-put. The new test name is "Pass C9.0: Dragging a node
  without modifier drifts back toward seed."

### Queued for upcoming passes

- **Pass C9.0 (completed) makes default drag temporary** — mouseup no longer
  updates `__gwellsSeedPositions`, and the seed-anchor force pulls dragged
  nodes back toward their seeded position. Spine nodes can no longer be
  dragged.

- **Pass C9.1 (completed) adds modifier-held scoped drag** (single
  node / node+children / node+subtree) and per-dialect pin storage in
  `settings.physics.pins`.

- **Pass C9.2 (completed) adds pin management UI** — Reset Pinned button
  clears pins for active dialect, Ctrl+RightClick on pinned nodes removes
  individual pins, and the pinned bookmark toggles dim-on-pinned highlight
  mode for visual focus.

- **Pass C9.3 (completed) hardens dim-on-pinned test and adds render bug regression test** —
  The dim-on-pinned test now has real assertions verifying alpha values. The
  design was changed to make `pinnedHighlightActive` a persisted setting for
  testability. A regression test for the pre-existing graph-blanks-on-mouseup bug
  was added but does not reproduce the issue in the test environment; the fix
  remains deferred.

- **Pass C9.4 (committed) fixed the broken pinned-highlight wiring**
  plus a separate toggle-off bug in graphStylePolicy (applyDimPolicy
  wasn't called when mode was "off", so dim couldn't clear).

- **Pass C9.4b (this commit) closed two more wiring issues from the**
  C9.4 audit: C9.1 drag-handler refs were declared but never used
  or synced, and activePins was missing from Effect B's deps.

- **[Resolved in Pass C9.5] Graph blanks on mouseup during Ctrl-drag**
  pin gestures. Symptom: 120k+ "Received NaN for x1/y1/x2/y2
  attribute" React errors from PlasmaOverlayEdge's SVG <line>
  elements. Cause: engine integration produced runaway velocity
  against the large position-vs-seed delta during the brief
  unfix window between mouseup and applyPins; Infinity→NaN
  cascade propagated through node interactions to siblings.

  Fix shape: defensive NaN guards at every layer of the drag-pin
  pipeline plus a velocity clamp in the engine integration step.
  The clamp structurally prevents the Infinity cascade; the other
  guards are defense in depth. Root cause force-resolution path
  not surgically identified — clamp made it unreachable.

  See docs/physics/GWELLS_ARCHITECTURE.md § NaN guards.

- **Pass C10 candidate — universal structural classification.** Current
  wellAssignment matches on string node types: `nodeType === "directory"`,
  `nodeType === "file"`. This works for the filesystem source adapter but
  doesn't generalize to Cypher/Obsidian/custom-JSON adapters. The fix is to
  derive structural properties (depth-from-root, has-children, is-leaf) from
  graph topology and match wellAssignment on those instead. The current
  string-matching becomes a special case of structural matching.

### Design intent not yet implemented

- **Hub-ring for N ≥ 4.** When the source data has many top-level subsystems
  (e.g., a book library with 30 genre directories), spines crowd at origin.
  The design is to distribute spine origins along a circle of radius scaling
  with N.
- **Parallel-spines inward branching.** Subdirectory trees should branch
  toward the central axis (with a gravity pull) instead of outward, with an
  optional flip-files-outside toggle for visual variety.
- **UI tuning controls** for spacing, sizing, alternation, and helix
  parameters. Currently all parameters live in dialect seedParams or
  hardcoded helper constants. Expose them as sliders/inputs in the control
  panel.
- **Performance pass for larger graphs.** Current implementation is fine for
  ~400 nodes; some interaction loops are O(N²). Needs revisit when 10K+ node
  datasets arrive.

## Branch state and commit hashes

Branch: `feat/gwells-physics-migration`

Most recent commits (top is newest):

```
[new]    docs(gwells): C-hygiene — remove stale end-to-end-spine references
85fac8a  docs(physics): gwells comprehensive handoff documentation
c537ea6  feat(gwells): Pass C8.4 — spine layout organization + sizing model fix
7a435bd  feat(gwells): Pass C8.3 — size-aware phyllotaxis layout
f92f5a7  feat(gwells): Pass C8.2 — per-pair spring distance, agrees with seeder
abf775f  feat(gwells): Pass C8 — fern-frond hierarchical layout + dynamic spine enumeration
f9d9557  feat(gwells): Pass C7 — edge-aware interactions, complete the physics architecture
c27b2fb  feat(self-graph): Pass C6 — synthesize directory nodes, complete gwells integration
6c06d06  feat(gwells): Pass C5 — seed-position retention for non-pinned wells
f9dac81  feat(gwells): Pass C4 — live tuning sliders for helixTwist
ba9f234  chore(gwells): Pass C3.1.2 — remove FA2 cleanup debt
[earlier]
```

When Pass C9 or future passes commit, update the "Migration arc" section
and the "Branch state and commit hashes" list. Keep "Sample current values"
synced with whatever the final pass values are, and keep the camera/scale
description accurate per the current sizing model.

## Where things live

- **Module:** `src/physics/gwells/`
- **Tests:** `tests/e2e/gwells-physics.spec.ts`
- **Validator:** `scripts/validate-gwells.mjs`
- **Source adapter:** `scripts/generate-self-graph.mjs`
- **Build-time graph translation:**
  `src/graph/renderers/sigma2d/buildGraphologyGraph.ts`
- **React mount:** `src/graph/renderers/sigma2d/SigmaGraphView.tsx`
- **Probe installer:** `src/graph/renderers/sigma2d/gwellsProbe.ts`
- **Settings:** `src/control-plane/settings/`
- **Docs:** `docs/physics/` (this file and siblings)