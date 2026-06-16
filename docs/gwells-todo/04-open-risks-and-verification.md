# 04 - Open Risks and Verification Notes

Date: 2026-06-15

## High Priority Verification

### 1. Circle layout fix path

Known:

- Active self-graph has 46 root spines.
- Hub-ring branch is active.
- Hub-ring radius is about 35141.
- Generic fallback is not active.

Need verify before changing behavior:

- Whether self-graph generation should parent category spines under `spine.src-root` and `spine.docs-root`.
- Whether `buildContainsMap()` should treat only explicit spine nodes as root spines, or whether root directories are intentionally included in some cases.
- Whether hub-ring should operate on buckets rather than raw root count.
- Whether wide-root stress fixtures still need large ring behavior.

Risk:

- A quick radius clamp may make the current graph look better but break the original reason hub-ring was added: avoiding root crowding in genuinely wide graphs.

### 2. Radial direct-file angle bug candidate

Observed code candidate:

```txt
radialBackbone direct file placement uses finalAngle = angleRad + angleRad
```

Need verify:

- Is this intentional doubling for visual spread, or a mistake from a prior refactor?
- Should it instead include file twist, spine angle, or no extra offset?
- Are direct spine file children common enough in current fixtures to affect visuals?

Risk:

- Small math fix could alter tests/screenshots if existing expectations accidentally depend on it.

### 3. Current UI says less than backend can do

Known:

- Engine can apply seed, well, and interaction overrides.
- UI only exposes dialect and helix twist seed overrides.

Need verify:

- Where settings migrations should add new override fields.
- Whether settings persistence supports nested raw objects safely.
- Whether existing settings export/import or validation paths need updates.
- Whether graph control panels and tiled physics panel share one render path for new controls.

Risk:

- Adding raw control state without a careful schema could create migration or localStorage compatibility issues.

### 4. Duplicate registry confusion

Known:

- Active GWells dialects live under `src/physics/gwells/dialects.ts`.
- There is also `src/graph/physics/physicsDialectRegistry.ts`, used by inventory/control-plane surfaces.

Need verify:

- Whether any user-facing UI reads the older registry for actual layout selection.
- Whether docs should explicitly mark the older registry as inventory/legacy/control-plane only.
- Whether future profile work should replace or bridge this registry.

Risk:

- Future agents may add profiles/dialects to the wrong registry.

## Medium Priority Verification

### 5. Headless diagnostic should become a committed tool or test

The read-only diagnostic used a disposable `/tmp` transpile based on the benchmark script pattern.

Need decide:

- Add `scripts/diagnose-gwells-seed.mjs`, or
- Add a focused test under existing GWells validation, or
- Extend benchmark output with seed-shape diagnostics.

Preferred near-term:

- Add a script or validation helper that reports branch decisions and position summaries for the active self-graph and synthetic fixtures.

### 6. Benchmark baselines after layout changes

Any hub-ring or seeder change should update or compare:

- step timings
- seeded position count
- position bounds
- max radius
- pair ideal distance count
- runtime events

Risk:

- A visual fix can accidentally increase force cost or create larger pair-distance caches.

### 7. Pin behavior after profile/dialect/tuning changes

Known:

- Pins survive current dialect lifecycle through graph-level pin state.

Need verify when adding new controls:

- Seed override should not wipe pins.
- Well/interaction override should not wipe pins.
- Profile apply should preserve pins by default or clearly ask/reset.
- Reset tuning should not reset pins unless explicitly requested.

### 8. Scheduler and runtime state in UI

Engine supports runtime state and debug events. UI currently uses these mostly for tests/probes.

Potential future UI:

- running/paused/stopped/error state indicator
- pause/resume physics button
- settle/reheat action
- debug event drawer in dev mode

Risk:

- Too much runtime UI could distract from layout controls unless gated behind developer/advanced mode.

## Product/Architecture Risks

### 9. Treating radial-backbone as the universal seed

Current radial/parallel layouts are useful but too specific. They should not become the forced basis for every graph type.

Risk:

- Trying to tune radial-backbone into knowledge garden, semantic constellation, document library, and web map layouts will produce brittle code and confusing controls.

Better path:

- Keep radial/parallel as legacy/hierarchical profiles.
- Add `universal-balanced` as the safe mixed-graph default.
- Add specialized profiles with their own seed layouts over time.

### 10. Raw controls before macro controls

The user wants unrestricted control, but raw-only controls can make the product harder to use.

Preferred layering:

```txt
Guided recommendation
  -> profile selection
  -> macro controls
  -> family/well remapping
  -> selected-node overrides
  -> advanced raw physics
```

Risk:

- Building only raw controls exposes power but does not create a good default user experience.

### 11. Profile system scope creep

The v0.2 docs describe a large architecture. Implementing everything at once would be risky.

Safe stop points:

1. Legacy profiles only.
2. Profile resolution into current dialect-compatible runtime.
3. Universal Balanced profile.
4. Macro controls.
5. Recommendation scoring.
6. Composer/advanced mode.

## Known Dirty Worktree Context

At the time this docs packet was created, the repository had unrelated modified and untracked files outside GWells, including Tauri/app/control-plane/docs/theme/source-adapter areas. These docs were intentionally isolated to:

```txt
docs/gwells-todo/
```

No source code changes were intended in this pass.

## Suggested Next Coding Prompt

```txt
Read-only first: add or run a headless GWells seed diagnostic for the active self-graph and the synthetic benchmark wide-root fixtures. Compare current hub-ring branch behavior, root grouping, radius, seeded bounds, and position summaries. Then propose the smallest code change that makes the active self-graph coherent without breaking genuine wide-root layouts. Do not change behavior until the comparison is reported.
```
