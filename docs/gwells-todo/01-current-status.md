# 01 - Current GWells Status

Date: 2026-06-15

## Current Runtime Shape

Active path:

```txt
source adapter
  -> normalized LumaWeave nodes/edges
  -> buildGraphologyGraph()
  -> SigmaGraphView
  -> applyDialect()
  -> seed function
  -> well assignment
  -> interaction loop
  -> Sigma renders mutated graph positions
```

Current GWells core files:

```txt
src/physics/gwells/types.ts
src/physics/gwells/wellTypes.ts
src/physics/gwells/interactions.ts
src/physics/gwells/seedFunctions.ts
src/physics/gwells/dialects.ts
src/physics/gwells/engine.ts
src/physics/gwells/seederHelpers.ts
src/physics/gwells/structuralResolver.ts
src/physics/gwells/seeders/radialBackbone.ts
src/physics/gwells/seeders/parallelSpines.ts
src/physics/gwells/index.ts
```

## Active Dialects

Only two real runtime dialects are currently implemented:

- `gwells.dialect.radial-backbone`
- `gwells.dialect.parallel-spines`

Both are still variations of the same basic model:

```txt
spine roots -> directory/container branches -> orbiting leaves/files
```

They are not yet a full set of data-type-specific layout forms.

## Active Well Types

Current well types:

- `gwells.well.spine-linear`
- `gwells.well.directory-anchor`
- `gwells.well.file-orbit`
- `gwells.well.endpoint-fan`

Current tunable backend parameters include:

- `attractionStrength`
- `siblingRepulsion`
- `springStiffness`
- `damping`
- `idealDistance`
- `centerGravity`
- `seedAdherence`

Interaction-level tunables include:

- `strength`
- `range`
- `idealDistance`

## UI Coverage Right Now

Current UI support is minimal:

- Dialect dropdown for radial backbone vs parallel spines.
- Per-dialect helix twist sliders for spine, directory, and file.
- Pin persistence and reset pinned behavior.

Not currently exposed in normal UI:

- Well type editor.
- Per-well parameter controls.
- Interaction strength/range/distance controls.
- Full seed parameter editor.
- Engine/runtime controls such as max velocity, convergence, scheduler, or manual step.
- Custom dialect composition.
- Profile selection.
- Profile recommendations.
- Family map remapping.
- Macro controls like Structure, Spacing, Stability, Motion, Relationship Pull.
- Advanced raw physics mode.

The backend supports `applyConfigOverride({ seedParams })`, `applyConfigOverride({ wellOverrides })`, and `applyConfigOverride({ interactionOverrides })`, but the current LumaWeave UI only sends `seedParams`.

## Latest Layout Diagnosis

The current self-graph source is:

```txt
src/fixtures/self-graph-generated.json
```

Default source adapter:

```txt
self-graph-yaml-frontmatter
```

Default dialect:

```txt
gwells.dialect.radial-backbone
```

Read-only diagnostic result from the active self-graph:

```txt
nodes: 607
edges: 1726
node types:
  doc: 206
  code: 256
  config: 5
  spine: 46
  directory: 94

contains edges: 556
usable contains edges: 556
ignored contains edges: 0
duplicate parent targets: 0
rootSpineIds: 46
max contains depth from roots: 5
```

Both radial and parallel seeders therefore choose:

```txt
generic fallback: false
hub ring: true
```

The hub ring radius for the active graph is about:

```txt
35141.41
```

That is why the graph currently reads as a very large circle. The seeders are not failing to find structure. They are responding to 46 peer root spines by placing those roots around a huge ring.

## Current Completion Estimate

Against the recent polish arc:

```txt
engine hardening/performance/lifecycle: about 70-80 percent
minimal v0.1.5 tuning UI: about 15-25 percent
full reshaped/profile-driven physics system: about 10-15 percent
```

The engine foundation is better. The full product-facing physics control system is still mostly ahead.
