---
id: design.gwells.profiles-controls
title: GWells Profiles and Controls
type: design
status: concept
domain: physics
cluster: azure
agent_readable: true
include_in_self_graph: true
last_updated: 2026-06-30
references:
  - domain.physics.gwells
  - design.gwells.layouts
  - design.gwells.runtime-validation
tags: [gwells, profiles, controls, future]
---

# GWells Profiles and Controls

This document consolidates the planned profile, family, recommendation, and UI-control architecture. None of the profile API described here is implemented.

## Compatibility boundary

The current public path stays valid:

```ts
applyDialect(graph, dialectId, options)
```

A future profile layer should resolve into the existing engine rather than replace it first:

```txt
Profile
  -> seed layout
  -> node-family map
  -> well assignment
  -> interaction set
  -> parameter preset
  -> user overrides
  -> existing dialect-compatible runtime
```

Radial-backbone and parallel-spines become legacy-compatible profiles. They remain usable throughout migration.

## Concepts

- **Profile:** product-facing bundle describing an overall layout behavior.
- **Seed layout:** deterministic opening geometry.
- **Node family:** source-neutral category such as root, container, document, leaf, hub, bridge, or orphan.
- **Family map:** adapter hints plus structural fallback rules that map source nodes to families.
- **Well assignment:** resolved engine behavior for a family or node.
- **Parameter preset:** profile defaults for seed, wells, interactions, and engine configuration.
- **Override:** user-authored change layered over profile defaults.

## Resolution order

A deterministic resolver should apply values from broadest to narrowest:

1. Engine defaults.
2. Profile defaults.
3. Adapter/family mapping.
4. Detected source-type mapping.
5. Saved user profile overrides.
6. Family-specific overrides.
7. Selected-node overrides.
8. Runtime pins.

The resolver must emit both the effective configuration and diagnostics explaining where each value came from.

## First profile set

- **Legacy Radial Backbone:** compatibility wrapper for the current default.
- **Legacy Parallel Spines:** compatibility wrapper for the second current dialect.
- **Universal Balanced:** safe mixed/unknown graph fallback.
- **Hierarchical Containment:** explicit tree/container presentation.
- **Knowledge Garden:** notes, backlinks, tags, and concepts.
- **Document Library:** documents, sections, pages, and references.
- **Web Domain Map:** domains, pages, assets, and links.
- **Semantic Constellation:** clusters, concepts, bridges, and inferred similarity.
- **Imported Position Preserve:** retains source coordinates where supplied.

Only the two legacy behaviors exist today.

## UI layering

Controls should reveal complexity progressively:

1. Recommended profiles with reasons and warnings.
2. Profile picker.
3. Macro controls.
4. Family mapping.
5. Selected-node overrides.
6. Advanced raw well and interaction controls.

Initial macro controls should map to existing backend parameters rather than create a second physics model:

- Spacing.
- Branch distance.
- Seed pull.
- Repulsion.
- Stability/damping.
- Maximum velocity, if engine configuration is exposed.

Every control needs effective-value display, reset behavior, validation/clamping, and persistence scoped to the active profile/dialect.

## Apply modes

A later advanced surface may support:

- Full profile.
- Seed only.
- Family map only.
- One-family override.
- Detected-type override.
- Selected-node override.

Partial application must state whether it preserves velocities, pins, seed positions, and caches.

## Migration sequence

1. Protect current dialect behavior with tests and benchmark snapshots.
2. Add static profile/family types and validators without runtime wiring.
3. Resolve legacy profiles into current engine configuration.
4. Add `applyProfile()` as a bridge while retaining `applyDialect()`.
5. Add Universal Balanced and graph analysis.
6. Expose macro controls.
7. Add specialized profiles and advanced overrides.

## Non-goals for the first profile release

- Removing dialects.
- Public mutable registration before the static model is stable.
- Full composer UI.
- Event sourcing inside the physics core.
- Full 3D physics.
