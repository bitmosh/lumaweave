---
id: physics.gwells.architecture
title: Gwells Physics — Architecture
status: active
last-updated: 2026-05-17
---

# Gwells Physics — Architecture

## Module structure

Gwells lives at `src/physics/gwells/`. The module is **standalone**: it has no
imports from elsewhere in the project (no `@/...` imports). A validator script
(`scripts/validate-gwells.mjs`) enforces this discipline. The reason is that
gwells could be extracted into its own npm package, and the architecture is
designed to make that extraction painless when the time comes.

File layout:

```
src/physics/gwells/
├── types.ts              Type definitions (well types, interactions, dialects)
├── engine.ts             applyDialect + stepPhysics + force resolution
├── wellTypes.ts          GW_WELL_TYPE_REGISTRY (4 entries)
├── interactions.ts       GW_INTERACTION_REGISTRY (8 entries)
├── seedFunctions.ts      GW_SEED_FUNCTION_REGISTRY (2 entries)
├── dialects.ts           GW_DIALECT_REGISTRY (2 entries)
├── seederHelpers.ts      Shared helpers: buildContainsMap, axisOffsetForN,
│                          resolveHelixTwist, computeOrbitRadius (legacy),
│                          computeNodeSize, computeFileOrbit,
│                          computeAggregateSize, flattenSpinesFromRoot,
│                          assignSpinesToAxes
└── seeders/
    ├── radialBackbone.ts  N-spine radial layout (default dialect's seeder)
    └── parallelSpines.ts  N parallel vertical spines layout
```

External integration points:

```
src/graph/renderers/sigma2d/
├── buildGraphologyGraph.ts  Translates source-adapter output to graphology
│                            graph; assigns visual sizes (Pass C8.3)
├── SigmaGraphView.tsx       React component; mounts gwells controller; handles
│                            drag, dialect switching, sigma camera lifecycle.
│                            Sigma's itemSizesReference is set to "positions"
│                            so node visual sizes live in graph coordinates
│                            rather than screen pixels (Pass C8.4).
└── gwellsProbe.ts          Installs window.__lwGetGwellsState in DEV/Playwright
```

Settings:

```
src/control-plane/settings/
├── settings.defaults.ts    physics.dialectId default
├── settings.schema.ts      physics block shape
├── settings.migrations.ts  v82 maps legacy FA2 dialect ids to gwells dialect ids
└── settings.registry.ts    UI dropdown for dialect selection
```

Validator:

```
scripts/validate-gwells.mjs    12 structural checks. Run via npm run physics:gwells
```

Tests:

```
tests/e2e/gwells-physics.spec.ts  10 e2e tests via Playwright. Run via
                                  npm run qa:e2e -- tests/e2e/gwells-physics.spec.ts
```

## The four registries

Every system concept has a typed registry — an `as const` array of entries
with a defined shape. The registries are the source of truth for everything
gwells does.

### Well Types (`wellTypes.ts`)

A well type defines how a node interacts with forces. Four are currently
defined:

- **`gwells.well.spine-linear`** — spine nodes (the radial backbone). Pinned.
  Position is set by the seed function and never moved by the engine.
- **`gwells.well.directory-anchor`** — directory nodes. Non-pinned. Subject to
  attraction toward parent (via spring), repulsion from sibling directories,
  optional center gravity pulling toward origin.
- **`gwells.well.file-orbit`** — file nodes (doc/code/config/fixture).
  Non-pinned. Springs to parent directory, repels from siblings sharing the
  same parent.
- **`gwells.well.endpoint-fan`** — loose files at the root of a spine (e.g.,
  files directly in `src/`, attached to `spine.src-root`). Fans out from the
  spine endpoint with a wider arc and softer spring than file-orbit.

Each well type has defaults: `attractionStrength`, `siblingRepulsion`,
`springStiffness`, `damping`, `idealDistance`, `centerGravity`, `seedAdherence`.
Dialects can override these via `wellOverrides`.

The `seedAdherence` field is a per-frame pull toward each node's seeded
position, balancing against the spring force. Higher values keep nodes near
where the seeder placed them; lower values let the spring dominate. Tuning
this is part of how dialects feel different.

### Interactions (`interactions.ts`)

An interaction is a directed pair of well types with a force kind:

```typescript
{
  id: "gwells.interaction.file-orbit.springs.directory-anchor",
  source: "gwells.well.file-orbit",
  target: "gwells.well.directory-anchor",
  kind: "spring",
  strength: 1.0,
  range: 2000,
  idealDistance: 90,
  requireEdge: "contains-parent",  // edge-aware filter
  status: "active",
}
```

Six of the 8 interactions have `requireEdge: "contains-parent"`. This means the
force only applies between nodes that are connected by a `contains` edge where
the target is the source's immediate parent. Without this filter, every file
would be attracted to every directory — chaos. With it, every file attracts
only to its actual parent.

The other two interactions are sibling-repulsion (no edge required) and
perpendicular (linear-alignment force on the spine itself).

### Seed Functions (`seedFunctions.ts`)

Two seed functions. Each takes a `GWSeedFunctionContext` (graph + seedParams)
and writes initial positions:

- **`gwells.seed.radial-backbone`** — N-spine radial. For N=2, two horizontal
  arms emanating from origin. Each spine carries a fern-frond subtree.
- **`gwells.seed.parallel-spines`** — N vertical spines at distinct x positions.
  For N=2, two vertical lines at x = ±offsetFromHub.

Each seed function recursively walks the contains-edge hierarchy via the
shared `placeBranchRecursive` helper to lay out every directory at every depth.

### Dialects (`dialects.ts`)

A dialect bundles everything into a named arrangement:

```typescript
{
  id: "gwells.dialect.radial-backbone",
  label: "Radial Backbone",
  description: "...",
  status: "active",
  isDefault: true,
  seedFunctionId: "gwells.seed.radial-backbone",
  wellAssignment: { /* function classifying graph nodes into well types */ },
  activeInteractions: [...],
  config: {
    seedParams: { spineCount: 2, spineSpacing: 1200, directoryOffset: 2400, ... },
    wellOverrides: { ... },         // override well-type defaults per dialect
    interactionOverrides: { ... },  // tune interaction strength/range per dialect
  },
}
```

The two current dialects are `gwells.dialect.radial-backbone` (default) and
`gwells.dialect.parallel-spines`.

## Dependency stack

```
        ┌────────────────────────────────────────┐
        │  Application code (AppShell, settings) │
        └────────────────┬───────────────────────┘
                         │
        ┌────────────────▼───────────────────────┐
        │  Sigma rendering pipeline              │
        │  (SigmaGraphView, buildGraphologyGraph)│
        └────────────────┬───────────────────────┘
                         │
        ┌────────────────▼───────────────────────┐
        │  Gwells engine (applyDialect, step)    │
        └────────────────┬───────────────────────┘
                         │
        ┌────────────────▼───────────────────────┐
        │  Dialects → SeedFunctions → Seeders    │
        └────────────────┬───────────────────────┘
                         │
        ┌────────────────▼───────────────────────┐
        │  WellTypes + Interactions registries   │
        └────────────────┬───────────────────────┘
                         │
        ┌────────────────▼───────────────────────┐
        │  Types + seederHelpers                 │
        └────────────────────────────────────────┘
```

Higher layers import lower ones. Lower layers do not import higher ones. Within
the gwells module, types is the lowest layer and dialects is the highest. The
engine sits at the same level as seeders — both consume types but neither
imports the other.

## The registry-contract pattern

LumaWeave uses this pattern across many systems beyond gwells: settings,
handle-sets, theme targets, source adapters, perspectives, command deck,
system index. Every registry has:

1. A typed entry shape exported from a `types.ts`
2. A registry constant exported as `readonly TYPE[]` with `as const`
3. A validator script enforcing the entry shape, cross-references, status
   discipline, and standalone import rules
4. Documentation in `docs/` with cross-reference IDs (frontmatter `id` matches
   what other docs reference)

The pattern means future systems should follow the same shape. Fresh additions
to gwells should land in the existing registries, not as one-off code.

## Sigma integration contract

Sigma is the canvas-based graph renderer. Gwells writes positions to a
`graphology` Graph instance; Sigma observes the graph and renders it. Three
important rules:

**ACTIVE → ACTIVE mutate path.** When the user switches dialects, do NOT
recreate the Sigma instance. Instead: call `controller.stop()` on the current
gwells controller, then call `applyDialect(graph, newDialectId)` again. The
graph instance survives; new positions get written; Sigma observes the changes
and re-renders. The lifecycle contract for this is in
`docs/graph/contracts/SIGMA_LIFECYCLE_CONTRACT.md`.

**`itemSizesReference: "positions"` is set at instantiation.** Sigma's default
is to measure node sizes in screen pixels regardless of graph coordinate scale.
With `"positions"`, sizes live in graph coordinates instead. This is
load-bearing for the post-Pass-C8.4 sizing model: coordinate-space spacing
changes (e.g., to `spineSpacing` or `directoryOffset`) actually affect visual
layout because node sizes scale with the coordinate space rather than fighting
it. If this setting is reverted, the entire content-driven sizing model
becomes inert — coordinate tuning has no visible effect. See
`GWELLS_LAYOUT_RULES.md` Rule 5 and `GWELLS_DESIGN_CONVERSATIONS.md` for the
full reasoning.

**Node visual size is read by Sigma at render time.** Pass C8.3 made node
visual sizes content-driven via `computeNodeSize`. Sigma reads `node.size` to
determine rendered radius. With `itemSizesReference: "positions"`, that
radius is in graph coordinates. The `physics.nodeSize` setting becomes a
multiplier on the content-derived base.

## Settings + migrations

The `physics.dialectId` setting determines which dialect is active. The
settings store is versioned (currently v82) with a migration chain. Pass C3's
v81 migration mapped legacy FA2 dialect ids to gwells dialect ids. Pass C3.1's
v82 migration renamed `horizontal-linear` to `radial-backbone` and removed
helix-dual / vertical-parallel.

Future changes to settings need new migration entries. The pattern is:

```typescript
// In settings.migrations.ts
83: (s) => {
  // ... transform s to new shape ...
  return { ...s, /* new fields */ };
},
```

Then bump `settings.defaults.ts` to version 83 and `settings.store.ts`
`CURRENT_SCHEMA_VERSION` to 83.
