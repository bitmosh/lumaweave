---
id: physics.gwells.registry.patterns
title: Gwells Registry Patterns
type: reference
status: current
version: v0
cluster: azure
domain: physics
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-15
references:
  - physics.gwells.contract
  - physics.gwells.readme
  - physics.gwells.dialect.radial.backbone
  - protocol.registry.contract.patterns
tags: [physics, gwells, registry, patterns, reference, v0]
---

# Gwells Registry Patterns

How the four gwells registries compose into a working physics frame.
Read this before adding any entry to any of the four registries; the
patterns here govern what a valid addition looks like.

This document is reference material. The
[Gravity Well System Contract](physics.gwells.contract) is the
authoritative schema; this doc explains the *relationships between* the
registries and the *data flow* through them at runtime.

## The four registries

Gwells has four registries, each with a single concern:
wellTypes.ts      — what kinds of wells exist (intrinsic per-type physics defaults)
interactions.ts   — how pairs of well types influence each other
seedFunctions.ts  — how to compute initial positions before physics starts
dialects.ts       — which combinations of the above produce a named layout

Each registry is a `const readonly` array of typed entries, plus a few
pure lookup helpers (`getById`, `listX`, `listByStatus`). No mutation
at runtime. No I/O. No side effects in the registry files themselves.
This matches the project's
[Registry Contract Patterns](protocol.registry.contract.patterns)
exactly.

The registries are layered: well types are the substrate, interactions
operate over pairs of well types, dialects bundle a seed function with
a subset of well types and interactions. You can read this layering
from the dependency direction:
    dialects.ts
    /    |    \
   /     |     \
seedFns.ts  interactions.ts  wellTypes.ts
\           /
\         /
wellTypes.ts (referenced)

Dialects reference everything. Interactions reference well types. Seed
functions reference well types implicitly (through the node attributes
they read and the well assignment that follows). Well types reference
nothing — they are the leaves.

## The composition shape

Picking a dialect at runtime activates a slice through the registries:

applyDialect(graph, "gwells.dialect.radial-backbone")
│
▼
dialect entry
│
├─► seedFunctionId ──────────► seed function entry ──► seed.fn(graph, config)
│                                                              │
│                                                              ▼
│                                                       initial positions
│                                                       written to x/y +
│                                                       __gwellsSeedPositions
│
├─► wellAssignment.assign ────► (per node) returns well-type id
│                                          │
│                                          ▼
│                              well-type entry ──► defaults applied
│                                                  (or overridden by
│                                                   dialect.config.wellOverrides)
│
├─► activeInteractions ───────► (per interaction id) returns interaction entry
│                                                              │
│                                                              ▼
│                                                  source well type +
│                                                  target well type +
│                                                  force kind +
│                                                  strength (or overridden by
│                                                  dialect.config.interactionOverrides)
│
└─► pairIdealDistance map built ──► (per contained pair) seeded distance
│                                                              │
│                                                              ▼
│                                                  cached for spring force
│                                                  resolution in stepPhysics
│                                                  (Pass C8.2 mechanism)
│
└─► engine runs continuous force loop
    using resolved per-node parameters, per-interaction forces, and
    per-pair seeded distances.

The engine never reaches into a registry directly during the frame
loop. At dialect-apply time, it walks the dialect entry once, resolves
all referenced entries, merges any overrides, builds the
pairIdealDistance map from seed positions, and caches the resolved
configuration in the per-controller closure and in `__gwellsState`.
The frame loop then operates on the resolved configuration only.

This is important: **registries are looked up once, not every frame.**
The cost of dialect application is `O(n)` where n is the number of nodes
(for well assignment, seed function execution, and pairIdealDistance
construction) plus `O(|activeInteractions|)` (for interaction resolution).
The cost of a frame is `O(n × avg_targets_per_interaction)` where target
identification uses the resolved well-type mapping, edge-aware interactions
additionally filter by `parentOfNode` lookup (Pass C7), and spring
interactions use a `pairIdealDistance` map lookup (Pass C8.2) — all
constant-time operations per pair.

## How a node gets its well type

A node's well type is determined by the dialect's `wellAssignment.assign`
predicate. This is a function — not declarative data — by deliberate
choice (see Contract § Schema → Dialect, "Predicate function vs.
declarative map" discussion).

```typescript
type GWWellAssignmentFn = (
  nodeId: string,
  attrs: Record<string, unknown>
) => string | null;
```

Returning `null` means the engine treats the node as static. Pinned
wells are *not* the same as null assignment: pinned wells have a well
type (so they get an inspector display and an `activeInteractions`
field), they just don't accept force application.

A simple assignment function for the radial-backbone dialect looks like:

```typescript
const assign: GWWellAssignmentFn = (nodeId, attrs) => {
  if (attrs.nodeType === "spine")     return "gwells.well.spine-linear";
  if (attrs.nodeType === "directory") return "gwells.well.directory-anchor";
  if (attrs.nodeType === "doc")       return "gwells.well.file-orbit";
  if (attrs.nodeType === "code")      return "gwells.well.file-orbit";
  if (attrs.nodeType === "config")    return "gwells.well.file-orbit";
  if (attrs.nodeType === "fixture")   return "gwells.well.file-orbit";
  if (attrs.isEndpoint === true)      return "gwells.well.endpoint-fan";
  return null;
};
```

The function reads from `attrs`, which is the node's full attribute
record from graphology (not a curated subset). Anything the source
adapter set on the node is visible here. Don't add new attributes from
inside gwells — the assignment function reads what's already there.

Note that the four leaf types (`doc`, `code`, `config`, `fixture`) all
map to `file-orbit`. This is the current concrete-string approach; a
future Pass C10 (universal structural classification) may replace these
matches with topology-based queries (e.g., `out-degree === 0` for
file-orbit) so source adapters with different naming conventions plug in
without engine changes.

## Parameter resolution order

When the engine needs the `attractionStrength` for node N in interaction
I, it resolves in this order:

Interaction override:       dialect.config.interactionOverrides[I.id]?.strength
Well-type override:         dialect.config.wellOverrides[N.wellTypeId]?.attractionStrength
Interaction default:        I.strength (registry value)
Well-type default:          wellTypeEntry.defaults.attractionStrength


The first value found wins. Interaction-level overrides are the
most specific (they apply to one source-target pair); well-type
overrides apply to all instances of a well type within the dialect;
registry defaults apply when no override is specified.

For other parameters (`siblingRepulsion`, `springStiffness`, `damping`,
`idealDistance`):

Interaction override:       dialect.config.interactionOverrides[I.id]?.<param>
Well-type override:         dialect.config.wellOverrides[N.wellTypeId]?.<param>
Well-type default:          wellTypeEntry.defaults.<param>


Note: `siblingRepulsion`, `damping`, etc. only meaningfully exist on
the well type; interactions have `strength`, `range`, `idealDistance`
as overridable. `idealDistance` overlaps both — interactions can carry
their own `idealDistance` (e.g., for `spring` and `linear-alignment`
forces), and well types carry one as a default for forces that don't
specify.

The engine performs this resolution once at apply time, builds a
flattened per-node force table, and reads from the table during the
frame loop. Per-frame resolution would be too slow at scale.

## The seed function's role

Seed functions run *once*, before the physics loop starts. They
compute initial positions for every node and write them via
`graph.setNodeAttribute(nodeId, "x" | "y", value)`. Nodes that should
be pinned (i.e., not moved by the physics engine) get their seed
position duplicated to `__seededSpinePositions` for Sigma's
`nodeReducer` to consume.

The contract requires seed functions to be pure: same input graph +
same config → same output positions. Determinism is non-negotiable
because:

- Re-applying the same dialect should produce the same layout.
- Layout changes during a session (dialect switch, tunable change)
  should not surprise the user with arbitrary repositioning of
  unchanged nodes.
- Smoke tests assert exact positions for pinned nodes; non-determinism
  would break the test pattern.

Inside a seed function, do not call `Math.random()` without a seed. If
deterministic jitter is needed, hash the node id and derive the jitter
from the hash. The `seedParams` field on `GWDialectConfig` is a free-
form bag for dialect-specific seed parameters (e.g., spine spacing,
fan arc width); seed functions read from `ctx.config.seedParams`.

## How interactions select targets

An interaction's `source` and `target` are well-type ids. At each frame,
for each non-pinned node N (which has resolved well type W_N), the
engine asks: "which interactions have W_N as their source?" For each
such interaction I:

Identify target node set T based on I.target:

If I.target is a well-type id, T = all nodes assigned to that type
The dialect can refine this further via the assignment function
(e.g., "only files whose parent is the same directory-anchor")
In v0, the refinement happens inside the engine via well-type-
specific target rules (e.g., file-orbit's interactions consult the
parent relationship from edge data)


For each t in T:
a. Compute force vector based on I.kind, I.strength, distance,
and any range/idealDistance constraints
b. Add force vector to N's accumulated velocity
c. Append I.id to N's __gwellsState.nodes[N].activeInteractions


The contract reserves the right for v0.1+ to expose the target-
selection rule as a configurable per-interaction property. In v0, target
rules are hardcoded per force kind (e.g., `linear-alignment` between
same-typed wells uses sibling ordering; `perpendicular` from a directory
to its anchor spine uses the parent relationship).

## Status semantics

Every registry entry carries a `status` field with one of four values:
active        — Wired and used in at least one current dialect
partial       — Defined but not fully wired (some dialects use it,
others reference it but don't yet activate it)
planned       — Registered for future use; no active dialect uses it
experimental  — Under active development; may change shape

The validator script (`scripts/validate-gwells.mjs`) does *not* enforce
that every entry must be `active`. The reverse — `planned` and
`experimental` entries are encouraged when the design intent is known
but the implementation is deferred. This is how the registry
communicates "we know this is coming" without forcing premature
implementation.

What the validator does enforce:

- Every interaction's `source` and `target` reference existing well
  types, regardless of status.
- Every dialect's `seedFunctionId` references an existing seed function,
  regardless of status.
- Every dialect's `activeInteractions` ids reference existing
  interactions, regardless of status.
- A dialect cannot reference an entry that has status `experimental`
  unless the dialect itself is also `experimental` or `planned`.

This last rule prevents `active` dialects from depending on entries
that may still change shape.

## Adding entries — the operational pattern

The standard ladder applies. For each addition:

Update the contract if the new entry exercises a previously
undocumented behavior (e.g., a new force kind, a new well-type field).
Most additions don't trigger this — they're new instances of
existing types, not new types.
Add the entry to the appropriate registry file:

wellTypes.ts for a new well type
interactions.ts for a new interaction
seedFunctions.ts for a new seed function (plus a new file in
seeders/<name>.ts for the implementation)
dialects.ts for a new dialect


Run scripts/validate-gwells.mjs. It must exit 0.
Run the standalone typecheck:
cd src/physics/gwells && npx tsc --noEmit
It must pass without errors.
If the addition is a new dialect, add a smoke-test case in
tests/smoke.test.ts that applies the dialect to a fixture graph
and asserts the post-60-frame state is finite.
If the addition is a new well type, interaction, or seed function,
no smoke test addition is required unless a dialect activates it.
Untested entries with status: planned are allowed and don't fail
the validator.
If the new entry is user-visible (a new dialect that should appear
in the Physics panel dropdown), update the Layer 1 Handle Registry
to surface it via the gwells.dialectId handle's option list.
This is a separate file outside gwells.


This sequence is identical for all four registry types. The validator
catches shape and reference errors; the typecheck catches type errors;
the smoke test catches runtime errors. Each layer has a single
responsibility.

## Common pitfalls

A few patterns that have bitten previous physics work and are
specifically prevented in gwells:

**Per-frame registry lookup.** Don't `getWellTypeById(id)` inside the
frame loop. The engine resolves all lookups at apply time and caches
them. Adding a lookup inside the loop is an N× regression.

**Mutating registry entries.** The registries are `readonly` and
declared `as const`. TypeScript will complain about direct mutation;
runtime tampering (via casts or `Object.assign`) is a contract violation.
Treat registry entries as immutable across the entire application
lifecycle.

**Side effects in seed functions.** Seed functions write `x`, `y`, and
`__seededSpinePositions`. Nothing else. They do not log, do not call
external services, do not touch the DOM, do not mutate edges. Pure
function over (graph, config).

**Cross-dialect coupling.** A dialect must work without any other
dialect being loaded. Don't write a dialect that assumes "the helix
dialect already ran first" or "the cluster gravity dialect will follow."
Each dialect is self-contained from cold start.

**Forgetting `isDefault`.** Exactly one dialect carries `isDefault: true`.
This is the fallback when an unknown dialect id is requested. The
validator enforces "exactly one" — adding a second `isDefault` dialect
fails validation; removing the only one also fails. The current default
is `gwells.dialect.radial-backbone`.

**Composing forces inside the engine instead of declaring two
interactions.** If a behavior needs both attraction and repulsion, that's
two interaction registry entries (one of each kind), not a single
interaction that composes them internally. Composition lives at the
registry level, not in engine code. This keeps the contract surface
honest about what's being applied.

## References

- [Gravity Well System Contract](physics.gwells.contract) — the
  authoritative schema for all four registries.
- [Gwells README](physics.gwells.readme) — module orientation and
  quickstart.
- [Radial Backbone Dialect Family](physics.gwells.dialect.radial.backbone)
  — the v0 seeder family, used as the worked example throughout this doc.
- [Registry Contract Patterns](protocol.registry.contract.patterns)
  — the project-wide standard ladder gwells's registries follow.