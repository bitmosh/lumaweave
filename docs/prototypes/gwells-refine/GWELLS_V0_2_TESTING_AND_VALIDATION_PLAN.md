# GWells v0.2 — Testing and Validation Plan

**Status:** Draft  
**Purpose:** Define the test strategy, validation checkpoints, fixture graphs, smoke checks, and regression guardrails needed to implement GWells v0.2 safely without breaking existing dialect behavior.  
**Intended location:** `lumaweave/docs/prototypes/gwells-refine/GWELLS_V0_2_TESTING_AND_VALIDATION_PLAN.md`  
**Replaces:** Nothing yet. New implementation/QA planning doc.  
**Related:**
- `GWELLS_V0_2_IMPLEMENTATION_BRIDGE.md`
- `GWELLS_PROFILE_REGISTRY_CONTRACT.md`
- `GWELLS_PROFILE_APPLY_MODES_AND_OVERRIDE_SEMANTICS.md`
- `GWELLS_GRAPH_ANALYSIS_AND_RECOMMENDATION_SCORING.md`
- `GWELLS_RUNTIME_LIFECYCLE_AND_SAFETY_SEMANTICS.md`

---

## 1. Summary

GWells v0.2 adds a higher-level profile system on top of the current dialect-driven engine.

That makes the system more powerful, but it also creates more ways to accidentally break layout behavior.

The v0.2 testing strategy should protect four things:

```txt
1. Current radial-backbone and parallel-spines behavior still works.
2. New profile/family/registry layers resolve deterministically.
3. Recommendation logic produces explainable, stable output.
4. Runtime lifecycle changes do not leak animation loops or stale caches.
```

The testing plan should prioritize deterministic unit tests first, then fixture-based integration tests, then visual smoke checks.

---

## 2. Testing goals

GWells v0.2 tests should prove:

- registries are complete
- profiles reference valid parts
- family maps cover all node families
- node/well resolution order is deterministic
- legacy dialects can be represented as profiles
- apply modes preserve and clear the right layers
- recommendation scoring is stable
- runtime lifecycle is controllable
- reseeding rebuilds required caches
- no NaN/Infinity positions or velocities leak into graph state

---

## 3. Test categories

Recommended categories:

```txt
Registry validation tests
Family map tests
Profile resolution tests
Apply mode tests
Recommendation tests
Runtime lifecycle tests
Seeder tests
Physics safety tests
Legacy compatibility tests
Fixture graph integration tests
Visual smoke checklist
```

---

## 4. Registry validation tests

### 4.1 Purpose

Ensure static registries are internally consistent.

### 4.2 Required tests

```txt
listProfiles() returns built-in profiles.
getProfileById() resolves known profiles.
unknown profile ID returns undefined or controlled error.
all active profiles validate.
all active family maps validate.
all active interaction sets validate.
all active parameter presets validate.
Universal Balanced profile exists.
Universal Balanced family map exists.
```

### 4.3 Profile reference tests

Every profile must reference:

```txt
existing seed layout
existing family map
existing interaction set
existing parameter preset
```

### 4.4 Failure behavior

Registry validation failures should produce useful messages.

Bad:

```txt
Invalid profile.
```

Good:

```txt
Profile gwells.profile.knowledge-garden references missing family map gwells.family-map.knowledge-garden.
```

---

## 5. Family map tests

### 5.1 Purpose

Ensure every node family resolves to a valid well type.

### 5.2 Required tests

For each active family map:

```txt
root resolves
collection resolves
container resolves
document resolves
section resolves
fragment resolves
concept resolves
entity resolves
reference resolves
annotation resolves
asset resolves
bridge resolves
unknown resolves
```

### 5.3 Unknown fallback test

`unknown` must resolve safely.

Expected default:

```txt
unknown → gwells.well.document-orbit
```

Unless a specific profile intentionally maps unknown differently and documents why.

### 5.4 Well type existence

Each well type ID referenced by active maps must either:

```txt
exist in the well type registry
```

or be marked:

```txt
planned placeholder
```

Active profiles should not rely on unresolved planned placeholders unless the runtime has a safe fallback.

---

## 6. Node well resolution tests

### 6.1 Purpose

Verify override precedence.

Resolution order:

```txt
1. selected-node override
2. detected source type override
3. node family override
4. active profile family map
5. universal fallback family map
6. unknown → document-orbit
```

### 6.2 Required tests

```txt
selected-node override wins over all other layers
detected-type override wins over family override
family override wins over profile family map
profile family map wins over universal fallback
unmapped/unknown node resolves to safe fallback
missing detected type does not crash
missing family does not crash
```

### 6.3 Example test fixture

```ts
const overrideState = {
  profileId: "gwells.profile.knowledge-garden",
  familyWellOverrides: {
    document: "gwells.well.semantic-cluster",
  },
  detectedTypeWellOverrides: {
    "markdown-note": "gwells.well.document-orbit",
  },
  nodeWellOverrides: {
    "note.important": "gwells.well.topic-hub",
  },
};
```

Expected:

```txt
note.important → topic-hub
any markdown-note document → document-orbit
other document → semantic-cluster
other concept → profile map
unknown → universal fallback
```

---

## 7. Profile resolution tests

### 7.1 Purpose

Ensure profiles resolve into runtime-ready ingredients.

### 7.2 Required tests

```txt
resolveProfileRuntime() resolves profile ID
resolved runtime includes seedLayoutId
resolved runtime includes familyMapId
resolved runtime includes interactionSetId
resolved runtime includes parameterPresetId
resolved runtime includes assignWellType()
resolved runtime includes activeInteractions
resolved runtime includes config
resolved runtime includes diagnostics
```

### 7.3 Diagnostic tests

Resolution should warn when:

```txt
profile references planned layout
well type ID is missing
interaction ID is missing
family classification is low confidence
fallback assignment is used many times
```

Resolution should not silently hide missing critical registry entries.

---

## 8. Apply mode tests

### 8.1 Purpose

Ensure each apply mode changes only the intended layers.

### 8.2 Full profile

Expected:

```txt
profileId changes
seed layout changes
family map changes
interaction set changes
parameter preset changes
reseed defaults true
pins preserved by default
broad overrides cleared unless requested
```

### 8.3 Seed-layout-only

Expected:

```txt
seed layout changes
family map preserved
interaction set preserved
parameter preset preserved
node/family overrides preserved
pins preserved
reseed true
```

### 8.4 Family-map-only

Expected:

```txt
family map changes
seed layout preserved
interaction set preserved
parameter preset preserved
selected-node overrides preserved
reseed optional
```

### 8.5 Single-family override

Expected:

```txt
only one familyWellOverrides entry changes
no reseed by default
selected-node overrides preserved
pins preserved
```

### 8.6 Detected-node-type override

Expected:

```txt
only one detectedTypeWellOverrides entry changes
no reseed by default
family overrides preserved
selected-node overrides preserved
```

### 8.7 Selected-node override

Expected:

```txt
only one nodeWellOverrides entry changes
no reseed
no other layer changes
```

### 8.8 Reset overrides

Expected:

```txt
selected-node reset clears selected node only
family reset clears family override layer only
detected-type reset clears detected type layer only
all reset clears all override layers
pin reset clears pins only
layout reset restores profile seed layout
```

---

## 9. Recommendation tests

### 9.1 Purpose

Ensure analysis and scoring produce stable, explainable recommendations.

### 9.2 Required graph cases

```txt
unknown graph
single-node graph
containment-heavy graph
link-heavy note graph
PDF/document-library graph
web/domain graph
Cytoscape positioned graph
large graph
huge graph
mixed graph
```

### 9.3 Expected recommendations

Unknown graph:

```txt
Universal Balanced should be top or pinned fallback.
```

Containment-heavy graph:

```txt
Hierarchical Containment should score highly.
```

Link-heavy note graph:

```txt
Knowledge Garden should score highly.
```

PDF/document graph:

```txt
Document Library should score highly.
```

Web graph:

```txt
Web Domain Map should score highly.
```

Positioned graph:

```txt
Imported Position Preserve should score highly.
```

Huge graph:

```txt
expensive profiles should be penalized or warned.
```

### 9.4 Explanation tests

Every recommended profile should include:

```txt
at least one reason
warnings when applicable
stable score
stable sort order
```

---

## 10. Runtime lifecycle tests

### 10.1 Purpose

Ensure runtime control is safe and deterministic.

### 10.2 Required tests

```txt
stop cancels scheduled frame
stop is idempotent
pause cancels scheduled frame
pause is idempotent
resume does not duplicate loops
resume does not restart stopped runtime
step works while paused
step works without requestAnimationFrame
manual scheduler can flush frames
runtime exposes state
runtime exposes diagnostics
```

### 10.3 Settled/convergence tests

```txt
runtime enters settled state after stable frames
settled runtime stops or reduces scheduling
profile change wakes settled runtime
pin/reseed wakes settled runtime
drag/user movement wakes settled runtime
```

---

## 11. Cache rebuild tests

### 11.1 Purpose

Prevent stale runtime caches after profile changes.

### 11.2 Required rebuild cases

Caches must rebuild when:

```txt
seed layout changes
seed params change
profile changes
family map changes
node well assignments change
interaction set changes
graph topology changes
contains/parent edges change
```

### 11.3 Pair ideal distance test

Specific regression test:

```txt
When seed params change and reseed runs, pairIdealDistance must rebuild.
```

Expected:

```txt
old ideal distances are not reused after reseed
parent-child springs use new seeded distances
```

---

## 12. Seeder tests

### 12.1 Purpose

Ensure seeders produce safe positions.

### 12.2 Required tests

For every active seed layout:

```txt
empty graph does not crash
single-node graph does not crash
disconnected graph does not crash
all positioned nodes have finite x/y
z is finite when emitted
no NaN positions
no Infinity positions
pins can be restored after reseed
```

### 12.3 Layout-specific tests

Radial Backbone:

```txt
spine nodes placed radially
directory/container nodes offset from spine
file/document nodes orbit parent
```

Parallel Spines:

```txt
spines are separated
2D projection is stable for current UI
z values are finite when present
```

Universal Balanced:

```txt
unknown/mixed graph receives sane positions
disconnected components separate
high-degree nodes do not all overlap
```

---

## 13. Physics safety tests

### 13.1 Purpose

Prevent unsafe numeric behavior.

### 13.2 Required tests

```txt
positions stay finite
velocities stay finite
maxVelocity clamps movement
invalid force values do not produce NaN
zero-distance node pairs do not explode
missing node attributes do not crash
missing edge attributes do not crash
empty interaction set does not crash
```

### 13.3 NaN guard rule

If invalid numeric state is detected:

```txt
skip unsafe force
emit warning or diagnostic
preserve prior finite position when possible
```

---

## 14. Legacy compatibility tests

### 14.1 Purpose

Ensure v0.2 does not break current layouts.

### 14.2 Required tests

```txt
applyDialect(radial-backbone) still works
applyDialect(parallel-spines) still works
legacy radial profile resolves to radial seed layout
legacy parallel profile resolves to parallel seed layout
legacy profiles use current interaction IDs
legacy profiles use current parameter overrides
old public exports remain available
```

### 14.3 Behavior comparison

For bridge profiles:

```txt
applyProfile(legacy-radial-backbone)
```

should be equivalent enough to:

```txt
applyDialect(radial-backbone)
```

Exact visual identity may not be required if runtime internals change, but major structural behavior must match.

---

## 15. Fixture graph set

Create fixture graphs for repeatable tests.

Recommended fixtures:

```txt
fixtures/emptyGraph.ts
fixtures/singleNodeGraph.ts
fixtures/simpleTreeGraph.ts
fixtures/deepTreeGraph.ts
fixtures/obsidianLikeGraph.ts
fixtures/pdfLibraryGraph.ts
fixtures/webDomainGraph.ts
fixtures/cytoscapePositionedGraph.ts
fixtures/mixedUnknownGraph.ts
fixtures/largeSyntheticGraph.ts
```

### 15.1 Simple tree graph

Purpose:

```txt
test hierarchy, containment, parent map, depth
```

### 15.2 Obsidian-like graph

Purpose:

```txt
test links, concepts/tags, knowledge garden recommendations
```

### 15.3 PDF library graph

Purpose:

```txt
test document/section/fragment/reference families
```

### 15.4 Web domain graph

Purpose:

```txt
test domain/page/asset/link relationships
```

### 15.5 Cytoscape positioned graph

Purpose:

```txt
test imported position preserve recommendation
```

### 15.6 Large synthetic graph

Purpose:

```txt
test large graph warnings, scale clamps, no all-pairs analysis
```

---

## 16. Visual smoke checklist

Automated tests should be primary, but layout systems also need human visual smoke checks.

For each active profile, manually verify:

```txt
graph loads
nodes are visible
nodes are not all stacked
major groups are recognizable
labels are not impossibly dense at default zoom
dragging/pinning works
pause/resume works
reset works
no console spam
no obvious runaway motion
```

### 16.1 Visual smoke cases

```txt
Universal Balanced on mixed graph
Hierarchical Containment on simple tree
Knowledge Garden on note graph
Document Library on PDF fixture
Web Domain Map on web fixture
Imported Position Preserve on positioned fixture
Legacy Radial Backbone on current folder fixture
Legacy Parallel Spines on current folder fixture
```

---

## 17. CI/check command target

Eventually add a focused GWells check command.

Example:

```txt
npm run test:gwells
```

Should run:

```txt
typecheck
registry validation tests
resolution tests
recommendation tests
runtime lifecycle tests
legacy compatibility tests
```

Optional later:

```txt
npm run smoke:gwells
```

for visual/manual checklist support.

---

## 18. Test naming convention

Use clear names.

Good:

```txt
resolves selected-node override before family override
rebuilds pair ideal distances after reseed
recommends universal balanced for unknown graph
does not schedule frames while paused
```

Avoid:

```txt
works
handles layout
profile test
```

---

## 19. Failure severity

Classify failures by severity.

### 19.1 Blocker

```txt
NaN positions
crash on common graph
legacy dialect broken
profile registry invalid
duplicate runtime loops
```

### 19.2 High

```txt
wrong recommendation for obvious graph
override precedence incorrect
pins lost unexpectedly
imported positions overwritten without warning
```

### 19.3 Medium

```txt
missing explanation string
warning text unclear
advanced diagnostics incomplete
```

### 19.4 Low

```txt
minor label mismatch
non-critical UI hint missing
```

---

## 20. Implementation sequence

### Pass 1 — Registry and family tests

Add tests for:

```txt
profile registry
family maps
well ID references
Universal Balanced existence
```

### Pass 2 — Resolution and override tests

Add tests for:

```txt
resolveNodeWellType()
resolveProfileRuntime()
override order
fallback order
```

### Pass 3 — Legacy compatibility tests

Add tests for:

```txt
legacy radial profile
legacy parallel profile
applyDialect still available
```

### Pass 4 — Recommendation tests

Add tests for:

```txt
analyzeGraphForLayout()
recommendProfilesForGraph()
reason/warning output
```

### Pass 5 — Runtime lifecycle tests

Add tests for:

```txt
pause/stop/resume/step
manual scheduler
convergence
cache rebuild
```

### Pass 6 — Visual smoke docs

Add:

```txt
manual smoke checklist
fixture graph gallery
known acceptable visual quirks
```

---

## 21. Non-goals

This testing plan does not require:

- pixel-perfect layout snapshots
- exact coordinate matching across every runtime
- screenshot diff automation
- exhaustive performance benchmarking
- browser E2E testing for every profile
- full visual regression system

Those can come later.

---

## 22. Success criteria

This testing plan is successful when:

- v0.2 can be implemented in small passes
- regressions are caught early
- current layouts remain protected
- profile resolution is deterministic
- recommendation output is stable
- runtime lifecycle bugs are testable
- visual smoke checks stay lightweight but useful

---

## 23. Guiding principle

GWells is visual, but its safety should not depend only on looking at it.

Test the contracts.

Smoke-check the feeling.
