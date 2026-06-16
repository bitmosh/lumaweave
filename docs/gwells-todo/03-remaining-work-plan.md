# 03 - Remaining Work Plan

Date: 2026-06-15

This plan separates immediate coherence fixes from the larger profile/control-system buildout.

## Phase 1 - Restore Current Self-Graph Coherence

Goal: make the current graph readable again without jumping into the full v0.2 profile system.

Recommended work:

1. Add or keep a headless seed diagnostic script/test for the active self-graph.
2. Assert the branch decision for radial and parallel seeders:
   - root count
   - generic fallback vs hub-ring
   - hub-ring radius
   - seeded position bounds
   - spine radius summary
3. Decide how the current self-graph should group roots:
   - likely `src` and `docs` as two major buckets/axes
   - not 46 independent peer roots around one huge ring
4. Adjust one of these, in the smallest safe way:
   - self-graph spine parenting
   - `buildContainsMap()` root detection
   - `assignSpinesToAxes()`/hub-ring grouping
   - hub-ring threshold/radius scaling
5. Verify radial and parallel remain valid for wide-root stress cases.

Acceptance criteria:

- Active self-graph no longer reads as one giant circle.
- Structure remains deterministic.
- No generic fallback is accidentally triggered for the self-graph.
- Existing radial/parallel behavior is not broken for tests and benchmarks.

## Phase 2 - Minimal User Tuning UI That Actually Uses Backend Capability

Goal: expose enough controls for users to improve graph readability without editing code.

Backend already supports:

```txt
seedParams
wellOverrides
interactionOverrides
```

UI currently only sends:

```txt
seedParams
```

Recommended work:

1. Extend settings schema for per-dialect tuning state:
   - `physics.wellOverrides`
   - `physics.interactionOverrides`
   - possibly `physics.engineConfigOverrides`
2. Pass active overrides through:
   - settings store
   - `AppShell`
   - `SigmaGraphView`
   - `controller.applyConfigOverride()`
3. Add a first macro-control panel rather than raw IDs by default.
4. Provide reset-to-default behavior.
5. Keep pins and dialect switching stable after slider changes.

Suggested first macro controls:

- Spacing
- Branch Distance
- Seed Pull
- Repulsion
- Stability
- Max Velocity if engine config is exposed

Acceptance criteria:

- User can improve spacing and reduce crowding from UI.
- Controls apply live without duplicate loops.
- Reset restores dialect defaults.
- Tests cover settings persistence and runtime override application.

## Phase 3 - Advanced Raw Physics Controls

Goal: support the user's desired full control without making the default UI overwhelming.

Recommended UI structure:

```txt
Guided controls
  -> macro controls
  -> advanced raw controls
```

Advanced raw controls should expose:

- Active dialect seed params.
- Well type defaults and per-dialect overrides.
- Interaction strengths, ranges, and ideal distances.
- Node gravity well assignment view.
- Selected-node well override where supported.
- Export/import of custom tuning presets.
- Reset one control, reset one section, reset all tuning.

Important implementation principle:

- Do not expose raw registry IDs as the only UI. Use labels and descriptions, with IDs available in advanced/debug detail.

Acceptance criteria:

- Every backend parameter that can safely be changed at runtime has some UI path.
- Advanced users can reproduce a layout by saving/exporting the effective override state.
- Invalid values are clamped or rejected before reaching the engine.

## Phase 4 - Introduce Profile Layer Without Deleting Dialects

Goal: start the v0.2 bridge safely.

Do not delete current dialects first. Add a product-facing profile layer above them.

Recommended new modules from the prototype docs:

```txt
nodeFamilies.ts
universalWellTypes.ts
familyMaps.ts
profiles.ts
profileRecommendations.ts
profileResolution.ts
profileController.ts
seedLayouts.ts
layoutAnalysis.ts
layoutMatrix.ts
```

First profile set:

- `gwells.profile.legacy-radial-backbone`
- `gwells.profile.legacy-parallel-spines`
- `gwells.profile.universal-balanced`
- `gwells.profile.hierarchical-containment`

Later profile set:

- `gwells.profile.knowledge-garden`
- `gwells.profile.document-library`
- `gwells.profile.web-domain-map`
- `gwells.profile.semantic-constellation`
- `gwells.profile.imported-position-preserve`

Acceptance criteria:

- Legacy radial and parallel behavior can be represented as profiles.
- `applyDialect()` remains available and unchanged for compatibility.
- A future `applyProfile()` can resolve into the existing engine path.
- LumaWeave UI can gradually move from raw dialect selection to profile selection.

## Phase 5 - New Seed Layouts and Data-Type-Aware Forms

Goal: move beyond one hierarchical seed family.

Needed seed/layout forms:

- Universal Balanced: safe fallback for mixed/unknown graphs.
- Hierarchical Containment: replacement for folder-first layouts.
- Knowledge Garden: notes, backlinks, tags, concepts.
- Document Library: documents, sections, pages, references.
- Web Domain Map: domains, pages, assets, links.
- Semantic Constellation: clusters, concepts, embeddings, bridge nodes.
- Imported Position Preserve: respect source positions if available.

Important point:

- Current radial/parallel seeds should become legacy/hierarchical profiles, not the universal basis for every future layout.

## Phase 6 - Recommendation and Feedback Loops

Goal: close the UX loop so users understand and control the layout.

Needed loops:

- Analyze loaded graph shape.
- Recommend profiles with reasons and warnings.
- Show what changed when applying a profile.
- Show runtime state and settle/motion feedback.
- Allow undo/reset.
- Preserve or explicitly clear pins by user choice.
- Warn before expensive/high-motion profiles on large graphs.

Acceptance criteria:

- User can tell why a layout was recommended.
- User can apply a layout and see an immediate, coherent shift.
- User can tune and reset without losing control.
