---
id: physics.gwells.readme
title: Gwells Module README
type: readme
status: current
version: v0
cluster: azure
domain: physics
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-15
references:
  - physics.gwells.contract
  - physics.gwells.registry.patterns
  - physics.gwells.dialect.end.to.end.spine
  - graph.contracts.sigma.lifecycle
  - protocol.registry.contract.patterns
tags: [physics, gwells, readme, orientation, v0]
---

# Gwells — Module README

Orientation guide for `src/physics/gwells/`. Read this first when you
land in the module for the first time, when you're returning after a
gap, or when you're about to add a well type, interaction, seed
function, or dialect.

This README does not replace the contract. The
[Gravity Well System Contract](physics.gwells.contract) is authoritative
for what gwells does, doesn't do, and how it behaves. This README is
hospitality — what is this thing, where do I start, what shouldn't I
touch.

## What gwells is

Gwells is LumaWeave's physics engine. It takes a graphology graph and
arranges its nodes into a structured 2D layout by simulating typed
gravity wells with declared interactions between them. Each node is
assigned to a well type, each well type has default physics parameters,
and each pair of well types has declared interactions (attraction,
repulsion, spring, alignment, perpendicular). A *dialect* bundles a
seed function, a node-to-well assignment, a subset of active
interactions, and parameter overrides into a single named layout.
Picking a dialect is what a user does when they pick a layout.

Gwells replaced the previous ForceAtlas2-based physics layer in the
gwells migration. Unlike FA2, which is a generic force-directed graph
drawing algorithm, gwells expresses *intent* — "spine nodes arrange
linearly, files orbit their parent directory, directories repel each
other" — as typed structure rather than tuned parameters.

The module is designed to be extracted as a standalone npm package
named `gwells`. Its only runtime dependency is `graphology`. It has
no React, no Sigma, no theme tokens, and no LumaWeave-specific
awareness. Everything flows through the graphology graph API.

## When to use gwells

You're touching gwells if you're:

- Adjusting the visible layout of the graph (changing which dialect is
  active, or tuning a dialect's parameters)
- Adding a new layout style (new well type, new seed function, new
  dialect)
- Debugging "why is this node here" (read `__gwellsState` from the
  graph attribute; see Schema § Physics State in the contract)
- Investigating physics performance (frame timing, force computation)

You're *not* touching gwells if you're:

- Changing how nodes are rendered (that's Sigma + the theme system)
- Changing what data is in the graph (that's the source adapter
  pipeline)
- Adding a UI control (that's the Handle Registry + ControlDock; gwells
  exposes the underlying capability via its dialect/config schema, but
  the UI lives outside the module)
- Adding audio reactivity (that's the audio system, which reaches gwells
  through the `decoration` callback hook in `GWApplyDialectOptions` —
  audio code itself never lives inside gwells)

## Quickstart

The minimum runtime use case — apply the v0 dialect to a graph:

```typescript
import Graph from "graphology";
import { applyDialect } from "@/physics/gwells";

// graph is a graphology Graph built by buildGraphologyGraph
const controller = applyDialect(graph, "gwells.dialect.end-to-end-spine", {
  onError: (err) => console.warn("[gwells]", err),
});

// later, when switching dialects:
controller.stop();
const next = applyDialect(graph, "gwells.dialect.some-future-dialect");

// on unmount:
controller.stop();
```

That's it. The engine reads node attributes (including the `cluster`,
`nodeType`, and `directoryPath` fields that the LumaWeave self-graph
provides), assigns each node to a well type via the dialect's
`wellAssignment` predicate, applies the seed function for initial
positions, then runs a continuous force loop. Sigma renders the
positions; the engine never touches Sigma.

To read live physics state for an inspector or debug overlay:

```typescript
const state = graph.getAttribute("__gwellsState") as GWPhysicsState | undefined;
if (state) {
  const nodeState = state.nodes.get(selectedNodeId);
  // nodeState contains: wellTypeId, pinned, vx, vy, lastSpeed, activeInteractions[]
}
```

External consumers read `__gwellsState` but never mutate it. The engine
has exclusive write authority.

## Module structure
src/physics/gwells/
├── package.json              [stub — for future standalone extraction]
├── README.md                 [in-source README; points here]
├── index.ts                  [public API surface]
├── types.ts                  [shared TypeScript types — GW* type definitions]
├── wellTypes.ts              [GW_WELL_TYPE_REGISTRY + lookup helpers]
├── interactions.ts           [GW_INTERACTION_REGISTRY + lookup helpers]
├── seedFunctions.ts          [GW_SEED_FUNCTION_REGISTRY + lookup helpers]
├── dialects.ts               [GW_DIALECT_REGISTRY + lookup helpers]
├── engine.ts                 [applyDialect, the physics loop]
├── seeders/
│   └── directoryBackboneN2.ts  [v0 spine seeder]
└── tests/
└── smoke.test.ts         [the standalone smoke test]

Each registry file is small and read-only: a `const` array of typed
entries plus a handful of pure lookup functions. The shape follows the
project's standard
[Registry Contract Patterns](protocol.registry.contract.patterns).

`engine.ts` is the only file with real runtime behavior. Everything
else is typed data.

## Where to read what

Read in this order when you arrive:

1. **This README** — you're here.
2. **[Gravity Well System Contract](physics.gwells.contract)** — what
   gwells does and doesn't do. Authoritative for every behavior
   question. Re-read on every gwells-touching pass.
3. **[Registry Patterns](physics.gwells.registry.patterns)** — how the
   four registries (well types, interactions, seed functions, dialects)
   compose and how data flows between them. Read this before adding any
   registry entry.
4. **[End-to-End Spine Dialect](physics.gwells.dialect.end.to.end.spine)**
   — the v0 dialect's visual target and parameter spec. Read this when
   working on the v0 seeder, well-type defaults, or interaction tuning.
5. **`src/physics/gwells/types.ts`** — the type definitions. The fastest
   way to see "what shape does this thing take" without reading prose.
6. **`src/physics/gwells/engine.ts`** — read when you need to understand
   *what actually happens* on a given frame. Stick to the contract for
   *what should* happen; engine.ts is the *how*.

Read situationally:

- **[Sigma Lifecycle Contract](graph.contracts.sigma.lifecycle)** — when
  you're touching the integration point in `SigmaGraphView.tsx`. Gwells
  is invoked from there; the lifecycle contract governs how.
- **The retired files in `src/graph/physics/`** — only if you need to
  understand what was replaced. After Pass H, these files are gone.

## Extension points

The four registries are open in one direction (you can add entries) and
closed in the other (you cannot remove entries that are still
referenced from other registries). Each addition follows the standard
contract → registry → validator → integration ladder.

### Adding a well type

Add an entry to `GW_WELL_TYPE_REGISTRY` in `wellTypes.ts`. Give it a
stable id (`gwells.well.<name>`), defaults (attractionStrength,
siblingRepulsion, springStiffness, damping, idealDistance), a pinning
flag, and a lifecycle status. Run the validator
(`node scripts/validate-gwells.mjs`) to confirm shape. A new well type
is dead code until a dialect references it.

### Adding an interaction

Add an entry to `GW_INTERACTION_REGISTRY` in `interactions.ts`.
Interactions are directional (source → target); symmetric behaviors
need two entries. Pick one of the five force kinds (`attraction`,
`repulsion`, `spring`, `linear-alignment`, `perpendicular`). The
validator confirms that both `source` and `target` reference existing
well-type ids and that the kind is valid.

If you find yourself wanting a sixth force kind, stop and check whether
the behavior can be composed from existing kinds (e.g., radial spread =
`spring` + sibling `repulsion`). Composition is preferred over named
forces; the contract explicitly forbids redundant kinds.

### Adding a seed function

Two files: the seeder implementation in `seeders/<name>.ts`, and the
registry entry in `seedFunctions.ts` that points at it. Seed functions
must be pure (same input → same output) and write only `x` and `y`
attributes (plus `__seededSpinePositions` for nodes that should be
pinned at the seeded position for Sigma's nodeReducer).

The migration of `directoryBackboneSeeder.ts` from `src/graph/physics/`
into `seeders/directoryBackboneN2.ts` is the reference example.

### Adding a dialect

Add an entry to `GW_DIALECT_REGISTRY` in `dialects.ts`. A dialect
specifies:

- The seed function id to run for initial positions
- A `wellAssignment` predicate function — given a node id and attrs,
  returns the well-type id to assign (or `null` to skip)
- The list of active interaction ids (a subset of the full registry)
- Parameter overrides (per-well-type and per-interaction)

If your dialect should be the registry default (the fallback when an
unknown dialect id is requested), set `isDefault: true`. Exactly one
dialect can carry this flag.

## What you must not do

The contract is authoritative for the full list. The short version:

- Don't import anything other than `graphology` and `graphology-types`
  from inside the module. Pre-flight standalone typecheck enforces this.
- Don't mutate any node attribute other than `x` and `y`.
- Don't mutate edges at all.
- Don't touch `localStorage`, `sessionStorage`, network I/O, DOM, or
  canvas.
- Don't use `Math.random()` without a seed.
- Don't write to `__gwellsState` from outside the engine. External
  consumers read only.

If you're tempted to add a Sigma import to gwells, stop. The integration
layer in `SigmaGraphView.tsx` is where gwells meets Sigma. Gwells itself
stays renderer-agnostic.

## Determinism and aliveness

Gwells runs a single continuous force loop via `requestAnimationFrame`.
There are no phases — the same equation applies frame 1 through frame N.
"Settling" emerges from damping; "aliveness" emerges from the optional
decoration callback (typically wired to audio reactivity in LumaWeave's
audio system, but the audio code lives outside gwells).

This means: gwells output is deterministic if the seed function is
deterministic and no decoration callback is supplied. With a decoration
callback that does non-deterministic work (audio, real-time jitter),
the running layout will move continuously while remaining within the
basin defined by the dialect's wells and interactions.

## Future direction

v0 ships with one dialect (`end-to-end-spine`) and the well types,
interactions, and seed function needed to make that dialect work.
Future versions:

- **v0.1+** — per-dialect tunable handles, exposed via Layer 1 of the
  Handle Registry. UI surfaces them in the Physics panel only when
  their owning dialect is active.
- **v0.2+** — additional dialects (helix, constellation, galaxy — these
  exist as concept docs today; see `docs/physics/` siblings).
- **v1+** — standalone package extraction. The module moves out of
  `src/physics/gwells/` into its own repository and gets published to
  npm. LumaWeave imports it as an external dependency.
- **v2+** — 3D coordinates (`z` axis). The current schema is 2D-only.
- **v2+** — Web Worker offload for large graphs.

The non-goals list in the contract is the canonical source for "what
is deliberately not v0."

## References

- [Gravity Well System Contract](physics.gwells.contract) — the
  authoritative behavior contract.
- [Registry Patterns](physics.gwells.registry.patterns) — how the four
  registries compose.
- [End-to-End Spine Dialect](physics.gwells.dialect.end.to.end.spine)
  — the v0 dialect spec.
- [Sigma Lifecycle Contract](graph.contracts.sigma.lifecycle) — the
  integration layer's lifecycle rules.
- [Registry Contract Patterns](protocol.registry.contract.patterns)
  — the standard ladder this module follows.