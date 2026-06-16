# GWells v0.2 — Migration Roadmap and Implementation Sequence

**Status:** Draft  
**Purpose:** Define the staged migration path from the current GWells dialect-based engine to the v0.2 profile/family/matrix system, while preserving current behavior and keeping implementation passes small.  
**Intended location:** `lumaweave/docs/prototypes/gwells-refine/GWELLS_V0_2_MIGRATION_ROADMAP.md`  
**Replaces:** Nothing yet. New roadmap/handoff doc.  
**Related:**
- `GWELLS_V0_2_IMPLEMENTATION_BRIDGE.md`
- `GWELLS_PROFILE_REGISTRY_CONTRACT.md`
- `GWELLS_SEED_LAYOUTS_V0_2.md`
- `GWELLS_PROFILE_APPLY_MODES_AND_OVERRIDE_SEMANTICS.md`
- `GWELLS_RUNTIME_LIFECYCLE_AND_SAFETY_SEMANTICS.md`
- `GWELLS_V0_2_TESTING_AND_VALIDATION_PLAN.md`

---

## 1. Summary

GWells v0.2 should be implemented as a staged migration, not a rewrite.

The current system already has a useful core:

```txt
well types
interactions
seed functions
dialects
applyDialect()
```

The v0.2 system adds a product-facing layer:

```txt
profiles
seed layouts
node families
family maps
interaction sets
parameter presets
layout recommendations
macro controls
override semantics
```

The safest path is to add this new layer around the existing engine first, then gradually refactor engine internals after the profile model is stable.

---

## 2. Migration principles

### 2.1 Preserve current behavior

Existing layouts must continue to work:

```txt
gwells.dialect.radial-backbone
gwells.dialect.parallel-spines
```

Do not remove or rename existing dialect IDs during the first migration phase.

### 2.2 Add before replacing

Add new files and registries first.

Avoid touching `engine.ts` until the profile registry and resolution layers exist.

### 2.3 Make legacy behavior profile-compatible

Represent current dialects as legacy profiles.

This lets the UI switch from “dialect picker” to “profile picker” without losing current layouts.

### 2.4 Keep profiles user-facing

Profiles should describe intent.

Dialects should remain engine-facing/internal until the engine is ready to consume resolved profile runtime directly.

### 2.5 Test each layer before adding the next

Do not move to recommendation UI before registry validation and profile resolution are deterministic.

---

## 3. Current system baseline

Before starting migration, confirm baseline health:

```txt
typecheck passes
existing GWells exports work
radial-backbone layout applies
parallel-spines layout applies
current demo graph still renders
no current runtime console errors
```

Capture current behavior as the baseline.

---

## 4. Target module layout

Recommended new files:

```txt
nodeFamilies.ts
universalWellTypes.ts
familyMaps.ts
seedLayouts.ts
interactionSets.ts
parameterPresets.ts
profiles.ts
profileResolution.ts
registryValidation.ts
layoutAnalysis.ts
layoutMatrix.ts
macroControls.ts
profileApply.ts
```

Existing files retained:

```txt
types.ts
wellTypes.ts
interactions.ts
seedFunctions.ts
dialects.ts
engine.ts
seederHelpers.ts
seeders/radialBackbone.ts
seeders/parallelSpines.ts
index.ts
```

---

## 5. Phase 0 — Baseline protection

### 5.1 Goal

Protect current behavior before adding v0.2 layers.

### 5.2 Work items

```txt
Add minimal smoke tests for current dialect lookup.
Add minimal applyDialect smoke test if test harness exists.
Document current known behavior.
Confirm index exports remain stable.
```

### 5.3 Deliverables

```txt
baseline test/checklist
legacy dialect IDs confirmed
current graph fixture identified
```

### 5.4 Do not touch

```txt
engine loop
seeders
interaction behavior
well type defaults
```

---

## 6. Phase 1 — Types and static registries

### 6.1 Goal

Add the v0.2 vocabulary without changing runtime behavior.

### 6.2 Files to add

```txt
nodeFamilies.ts
universalWellTypes.ts
familyMaps.ts
seedLayouts.ts
interactionSets.ts
parameterPresets.ts
profiles.ts
```

### 6.3 Types to add

```txt
GWSourceKind
GWNodeFamily
GWApplyMode
GWSeedLayoutEntry
GWNodeFamilyMetadata
GWNodeFamilyMap
GWInteractionSetEntry
GWParameterPresetEntry
GWPhysicsProfile
GWProfileOverrideState
```

### 6.4 Registry entries to add

Initial profiles:

```txt
gwells.profile.universal-balanced
gwells.profile.hierarchical-containment
gwells.profile.knowledge-garden
gwells.profile.document-library
gwells.profile.web-domain-map
gwells.profile.semantic-constellation
gwells.profile.imported-position-preserve
gwells.profile.legacy-radial-backbone
gwells.profile.legacy-parallel-spines
```

Initial seed layouts:

```txt
gwells.seed-layout.universal-balanced
gwells.seed-layout.hierarchical-containment
gwells.seed-layout.radial-backbone
gwells.seed-layout.parallel-spines
gwells.seed-layout.knowledge-garden
gwells.seed-layout.document-library
gwells.seed-layout.web-domain-map
gwells.seed-layout.semantic-constellation
gwells.seed-layout.imported-position-preserve
```

### 6.5 Exports

Update `index.ts` to export:

```txt
new types
new registries
lookup helpers
```

### 6.6 Tests

```txt
profile lookup
seed layout lookup
family map completeness
Universal Balanced exists
legacy profiles exist
```

### 6.7 Acceptance criteria

```txt
Typecheck passes.
Current applyDialect behavior unchanged.
New registries can be imported.
All active family maps cover every GWNodeFamily.
```

---

## 7. Phase 2 — Registry validation

### 7.1 Goal

Add validation helpers before runtime resolution.

### 7.2 Files to add

```txt
registryValidation.ts
```

### 7.3 Functions to add

```ts
validateFamilyMap()
validateInteractionSet()
validateProfile()
validateProfileRegistry()
```

### 7.4 Validation checks

```txt
Every profile references existing seed layout.
Every profile references existing family map.
Every profile references existing interaction set.
Every profile references existing parameter preset.
Every family map assigns every node family.
Every active well type ID exists or is explicitly planned.
Every active interaction ID exists or is explicitly planned.
Universal Balanced exists.
```

### 7.5 Acceptance criteria

```txt
validateProfileRegistry().valid === true
Validation errors are readable.
No runtime behavior changed.
```

---

## 8. Phase 3 — Profile resolution

### 8.1 Goal

Convert profile + overrides into runtime ingredients.

### 8.2 Files to add

```txt
profileResolution.ts
```

### 8.3 Functions to add

```ts
resolveNodeFamily()
resolveNodeWellType()
resolveProfileRuntime()
```

### 8.4 Resolution order

```txt
1. selected-node override
2. detected source type override
3. node family override
4. active profile family map
5. universal fallback family map
6. unknown → gwells.well.document-orbit
```

### 8.5 Runtime output

```ts
GWResolvedProfileRuntime {
  profileId
  seedLayoutId
  nodeFamilyMapId
  interactionSetId
  parameterPresetId
  assignWellType()
  activeInteractions
  config
  engineConfig
  diagnostics
}
```

### 8.6 Tests

```txt
selected-node override wins
detected-type override wins
family override wins
profile map wins
unknown fallback works
legacy radial profile resolves
legacy parallel profile resolves
```

### 8.7 Acceptance criteria

```txt
Profile resolution is deterministic.
No engine changes required.
Legacy profiles resolve into current-compatible ingredients.
```

---

## 9. Phase 4 — applyProfile bridge

### 9.1 Goal

Allow consumers to apply profiles while still using the current engine path.

### 9.2 Files to add

```txt
profileApply.ts
```

### 9.3 Function to add

```ts
applyProfile(graph, profileId, options)
```

### 9.4 Bridge strategy

Initial behavior:

```txt
applyProfile()
  → resolveProfileRuntime()
  → construct dialect-compatible runtime/config
  → delegate to current applyDialect-compatible path
```

If constructing an actual temporary dialect is awkward, use an internal shared function extracted from `applyDialect()` later.

### 9.5 Important constraint

Do not break:

```ts
applyDialect(graph, dialectId, options)
```

### 9.6 Tests

```txt
applyProfile(legacy-radial-backbone) works
applyProfile(legacy-parallel-spines) works
applyDialect(radial-backbone) still works
applyDialect(parallel-spines) still works
```

### 9.7 Acceptance criteria

```txt
LumaWeave can call applyProfile() for legacy profiles.
Existing layout behavior remains available.
No duplicate runtime loops introduced.
```

---

## 10. Phase 5 — Runtime lifecycle safety

### 10.1 Goal

Fix core lifecycle issues before heavy UI integration.

### 10.2 Work items

```txt
cancel RAF on pause
cancel RAF on stop
prevent duplicate loops
add runtime state
add manual step()
add diagnostics
fix stale pairIdealDistance after reseed
remove unconditional console logging
```

### 10.3 Suggested order

```txt
1. pause/stop idempotency
2. no duplicate loop rule
3. manual step()
4. cache rebuild correctness
5. runtime diagnostics
6. convergence later
```

### 10.4 Tests

```txt
pause cancels scheduled frame
stop cancels scheduled frame
resume does not duplicate loops
step works without RAF
reseed rebuilds pair ideal distances
```

### 10.5 Acceptance criteria

```txt
Runtime can be controlled safely.
Profile reapply does not leak loops.
Manual tests can step physics deterministically.
```

---

## 11. Phase 6 — Graph analysis and recommendation scoring

### 11.1 Goal

Recommend profiles from graph shape and metadata.

### 11.2 Files to add

```txt
layoutAnalysis.ts
layoutMatrix.ts
```

### 11.3 Functions to add

```ts
analyzeGraphForLayout()
scoreProfileForGraph()
recommendProfilesForGraph()
```

### 11.4 Initial analysis dimensions

```txt
source kinds
node count
edge count
degree stats
component count
containment ratio
depth estimate
relationship densities
node family distribution
imported position ratio
metadata flags
```

### 11.5 Initial rules

```txt
Unknown graph → Universal Balanced
Containment-heavy graph → Hierarchical Containment
Backlink-heavy notes → Knowledge Garden
PDF/document graph → Document Library
Web graph → Web Domain Map
Positioned graph → Imported Position Preserve
Huge graph → stable/cheap profiles with warnings
```

### 11.6 Acceptance criteria

```txt
Recommendations are deterministic.
Every recommendation has reasons.
Warnings appear when appropriate.
Universal Balanced remains available.
```

---

## 12. Phase 7 — Macro controls

### 12.1 Goal

Translate simple UI sliders into GWells config overrides.

### 12.2 Files to add

```txt
macroControls.ts
```

### 12.3 Controls

```txt
Structure
Spacing
Clustering
Motion
Relationship Pull
Hierarchy Pull
Stability
```

### 12.4 Functions

```ts
resolveMacroControls()
mergeMacroConfig()
clampMacroValues()
applyScaleSafetyClamps()
```

### 12.5 Acceptance criteria

```txt
Macro values clamp 0–1.
Profile defaults exist.
Macro output merges with parameter preset.
Large graph clamps apply.
Advanced raw override can still win in debug mode.
```

---

## 13. Phase 8 — First new universal profile behavior

### 13.1 Goal

Add one genuinely new profile that proves the v0.2 model is useful.

Recommended first target:

```txt
Universal Balanced
```

Reason:

```txt
It is the default fallback and the "never awful" profile.
```

### 13.2 Universal Balanced requirements

```txt
works on unknown/mixed graphs
uses safe node family fallback
separates disconnected components
keeps high-degree nodes readable
respects imported positions when present or warns before replacing them
does not require source-specific metadata
```

### 13.3 Acceptance criteria

```txt
Universal Balanced is visually sane on mixed fixture.
Universal Balanced recommendation works.
Universal Balanced family map resolves all nodes.
```

---

## 14. Phase 9 — UI integration

### 14.1 Goal

Expose the profile system through calm LumaWeave UI.

### 14.2 UI sections

```txt
Guided Mode
Show Why panel
Matrix Mode
Composer Mode
Family Map table
Selected Node override card
Macro Controls
Reset/Undo controls
```

### 14.3 First UI slice

Recommended first slice:

```txt
Recommended layout cards
Apply profile
Show why
Universal Balanced fallback
```

Do not start with Composer Mode.

### 14.4 Acceptance criteria

```txt
User can apply a recommended profile.
User can see why it was recommended.
User can reset to Universal Balanced.
User is not forced to see raw physics IDs.
```

---

## 15. Phase 10 — Documentation cleanup

### 15.1 Goal

Turn prototype docs into canonical docs after implementation stabilizes.

### 15.2 Actions

```txt
Update GWELLS_PHYSICS.md
Mark older dialect-only docs as legacy/current-state
Create v0.2 canonical architecture doc
Create user-facing layout guide
Create developer registry guide
Create testing checklist
```

### 15.3 Avoid duplicate mess

When promoting docs:

```txt
move prototype docs to archive or keep as design history
do not leave multiple competing canonical docs
make one index doc that explains current truth
```

---

## 16. Recommended immediate next coding pass

The first coding pass should be intentionally small.

### 16.1 Scope

```txt
Add profile/family/seed layout registries.
Do not touch engine.ts.
Do not rewrite seeders.
Do not implement recommendation scoring yet.
```

### 16.2 Files

Add:

```txt
nodeFamilies.ts
universalWellTypes.ts
familyMaps.ts
seedLayouts.ts
interactionSets.ts
parameterPresets.ts
profiles.ts
registryValidation.ts
```

Update:

```txt
types.ts
index.ts
```

### 16.3 Tests

Add:

```txt
profile lookup tests
family map completeness tests
profile validation tests
legacy profile reference tests
```

### 16.4 Done when

```txt
npm/typecheck passes
registry validation passes
legacy dialects are untouched
new exports are usable
```

---

## 17. Risk register

### 17.1 Risk: too many abstractions before visual proof

Mitigation:

```txt
Keep Phase 1–4 mostly static/resolution-focused.
Prove with legacy profiles first.
Implement Universal Balanced as first new visual profile.
```

### 17.2 Risk: profile/dialect confusion

Mitigation:

```txt
Profiles are user-facing.
Dialects are engine-facing legacy/internal.
UI should prefer profiles.
Engine can still use dialects internally.
```

### 17.3 Risk: stale caches during profile changes

Mitigation:

```txt
Add cache rebuild tests.
Fix pairIdealDistance rebuild before UI-heavy profile switching.
```

### 17.4 Risk: recommendation feels wrong

Mitigation:

```txt
Keep recommendations explainable.
Always include Universal Balanced.
Allow easy switching.
Do not overclaim confidence.
```

### 17.5 Risk: UI overwhelms users

Mitigation:

```txt
Guided Mode first.
Matrix Mode optional.
Composer Mode later.
Hide raw IDs by default.
```

---

## 18. Milestone summary

```txt
M0 Baseline protection
M1 Types and static registries
M2 Registry validation
M3 Profile resolution
M4 applyProfile bridge
M5 Runtime lifecycle safety
M6 Graph analysis/recommendations
M7 Macro controls
M8 Universal Balanced visual behavior
M9 UI integration
M10 Documentation cleanup
```

---

## 19. Stop points

The migration should have safe stop points.

### Stop point A

After Phase 1:

```txt
New registries exist.
No runtime changes.
Safe to pause.
```

### Stop point B

After Phase 3:

```txt
Profiles resolve.
No engine changes.
Safe to pause.
```

### Stop point C

After Phase 4:

```txt
applyProfile works for legacy profiles.
UI can begin migrating to profiles.
Safe to pause.
```

### Stop point D

After Phase 5:

```txt
Runtime lifecycle safer.
Profile changes less risky.
Safe to expand UI.
```

---

## 20. Handoff checklist for coding agent

Before coding:

```txt
Read GWELLS_V0_2_IMPLEMENTATION_BRIDGE.md
Read GWELLS_PROFILE_REGISTRY_CONTRACT.md
Read GWELLS_V0_2_TESTING_AND_VALIDATION_PLAN.md
Inspect current types.ts, dialects.ts, wellTypes.ts, interactions.ts, seedFunctions.ts, engine.ts, index.ts
Do not edit engine.ts in first pass unless explicitly required
```

First pass goals:

```txt
Add v0.2 registry/type scaffolding.
Preserve current runtime.
Add validation helpers.
Add tests.
Export new symbols.
```

Do not do yet:

```txt
new physics force kinds
3D runtime
Barnes-Hut
UI implementation
recommendation scoring
engine loop rewrite
```

---

## 21. Success criteria for the migration

The migration is successful when:

```txt
existing dialects still work
legacy profiles wrap existing dialect behavior
profile registries validate
family maps are hot-swappable
applyProfile exists
recommendation scoring exists
macro controls map to config safely
runtime pause/stop/step behavior is safe
LumaWeave UI can use profiles instead of raw dialects
Universal Balanced is a reliable fallback
```

---

## 22. Guiding principle

Do not cross the river in one jump.

Build the bridge, walk the old system across it, then improve the road.
