---
id: physics.gwells.dialect.end.to.end.spine
title: Gwells Dialect — End-to-End Spine
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
  - physics.gwells.registry.patterns
  - dialect.physics.helix
  - dialect.physics.galaxy
  - dialect.physics.constellation
  - concept.graph.cluster.gravity
tags: [physics, gwells, dialect, end-to-end-spine, v0, layout]
---

# Gwells Dialect — End-to-End Spine

The v0 dialect for gwells. Dialect id: `gwells.dialect.end-to-end-spine`.
This is the layout that ships when the physics migration is accepted.

This document describes what the dialect *looks like*, what the
parameter values *are*, and what success *looks like* when the implementer
runs it for the first time. It is the visual target for Pass C
(initial implementation) and the reference for Pass D (integration).

The starting parameter values in this document are *starting points,
not contracts*. Visual tuning during Pass C will adjust them. The
parameters that need to remain stable (the well type ids, the
interaction ids, the seed function id, the assignment rules) are
called out explicitly.

## Visual target

The dialect arranges the LumaWeave self-graph as two halves of a
continuous spine running left-to-right across the canvas. The
left half holds documentation directories and files; the right
half holds source code directories and files. The transition
between halves happens at the geometric center of the spine.
                                    ┌─ src half ─┐
          ┌─ docs half ─┐
                            │       │
files            files      │       │     files          files
·   files       ·         │       │      ·       files   ·
\   ·  files  /          │       │       \      ·      /
\   \   ·   /            │       │        \    /     /
dir-A   dir-B  dir-C         │       │       dir-X  dir-Y
│      │     │     │       │       │         │     │       │
│      │     │     │       │       │         │     │       │
═════●══════●═════●═════●═══════●═══════●═════════●═════●═══════●═════
spine spine spine spine spine spine spine    spine spine spine spine
│      │     │     │       │       │         │     │       │
│      │     │     │       │       │         │     │       │
dir-D   dir-E  dir-F         │       │       dir-Z  dir-W
/   /  ·   \            │       │        /     \    
/   ·  files  \          │       │       /       \   ·
·  files       ·         │       │      ·  files   ·
files            files     │       │     files          files
│       │
└─ docs half ─┘
└─ src half ─┘

Key visual properties:

- **Single continuous spine axis** running left to right across the
  full canvas width. Spine nodes are pinned at their seeded positions
  and form a straight horizontal line.
- **Directory anchors** emerge perpendicular to the spine — alternating
  above and below to avoid stacking. Each directory anchor is repelled
  from its neighbors along the spine direction.
- **File orbits** cluster around each directory anchor at radial
  distance with angular distribution from sibling repulsion.
- **Endpoint fans** at the leftmost and rightmost spine tips — files
  that belong to the root rather than to a specific directory get
  fanned outward from the spine endpoints rather than orbiting a
  directory.
- **Docs half vs src half** is determined by the spine node's position
  along the axis. The transition is geometric, not topological — the
  same well types and interactions apply on both halves; only the
  initial seed positions differ.

This layout is variation B from the planning-session sketches. The
visual difference from a generic force-directed layout is that the
spine is *structurally pinned* rather than emerging from forces, and
the directory orientation (above vs. below the spine) is *seeded
deterministically* rather than randomly settled.

## Dialect entry

The dialect registers in `src/physics/gwells/dialects.ts`:

```typescript
{
  id: "gwells.dialect.end-to-end-spine",
  label: "End-to-End Spine",
  description:
    "Two halves of a continuous spine (docs left, src right) with " +
    "alternating perpendicular directory anchors and file orbits. " +
    "The v0 LumaWeave layout.",
  status: "active",
  isDefault: true,
  seedFunctionId: "gwells.seed.directory-backbone-n2",
  wellAssignment: {
    assign: (nodeId, attrs) => {
      if (attrs.nodeType === "spine")     return "gwells.well.spine-linear";
      if (attrs.isEndpoint === true)      return "gwells.well.endpoint-fan";
      if (attrs.nodeType === "directory") return "gwells.well.directory-anchor";
      if (attrs.nodeType === "file")      return "gwells.well.file-orbit";
      return null;
    },
  },
  activeInteractions: [
    "gwells.interaction.spine-linear.aligns.spine-linear",
    "gwells.interaction.directory-anchor.perpendicular.spine-linear",
    "gwells.interaction.directory-anchor.repels.directory-anchor",
    "gwells.interaction.file-orbit.springs.directory-anchor",
    "gwells.interaction.file-orbit.repels.file-orbit",
    "gwells.interaction.file-orbit.repels.directory-anchor-other",
    "gwells.interaction.endpoint-fan.springs.spine-linear-endpoint",
    "gwells.interaction.endpoint-fan.repels.endpoint-fan",
  ],
  config: {
    seedParams: {
      spineSpacing: 150,
      directoryOffset: 220,
      directoryAlternation: "above-below",
      fileOrbitRadius: 90,
      endpointFanArc: 100,
      endpointFanCount: 6,
    },
    wellOverrides: {
      "gwells.well.spine-linear": {
        // pinned; physics params don't apply
      },
      "gwells.well.directory-anchor": {
        siblingRepulsion: 280,
        damping: 0.85,
      },
      "gwells.well.file-orbit": {
        attractionStrength: 0.6,
        siblingRepulsion: 120,
        springStiffness: 0.08,
        damping: 0.9,
        idealDistance: 90,
      },
      "gwells.well.endpoint-fan": {
        attractionStrength: 0.5,
        siblingRepulsion: 90,
        springStiffness: 0.06,
        damping: 0.9,
        idealDistance: 100,
      },
    },
    interactionOverrides: {
      "gwells.interaction.file-orbit.repels.directory-anchor-other": {
        strength: 1.4,
        range: 180,
      },
    },
  },
}
```

The `isDefault: true` flag makes this the registry-wide default. When
`applyDialect` is called with an unknown dialect id, the engine falls
back to this dialect.

## Well types referenced

Four well types power this dialect. Each registers in
`src/physics/gwells/wellTypes.ts`.

### `gwells.well.spine-linear`

Pinned. Represents nodes that form the spine backbone.

```typescript
{
  id: "gwells.well.spine-linear",
  label: "Spine (linear, pinned)",
  description:
    "A node on the spine backbone. Position is set by the seed function " +
    "and never moved by the engine. The nodeReducer in Sigma reads " +
    "__seededSpinePositions to enforce the pin at render time.",
  status: "active",
  pinned: true,
  defaults: {
    attractionStrength: 0,
    siblingRepulsion: 0,
    springStiffness: 0,
    damping: 1,
    idealDistance: 0,
  },
}
```

The defaults are all-zero because pinned wells don't have physics
applied. The fields are present because the schema requires them; the
values are documentation that the well is inert.

### `gwells.well.directory-anchor`

Active. Represents directory nodes that anchor file orbits.

```typescript
{
  id: "gwells.well.directory-anchor",
  label: "Directory Anchor",
  description:
    "A directory node. Seeded perpendicular to the spine, alternating " +
    "above and below. Subject to sibling repulsion from other directory " +
    "anchors to prevent stacking along the spine axis.",
  status: "active",
  pinned: false,
  defaults: {
    attractionStrength: 0.4,
    siblingRepulsion: 250,
    springStiffness: 0.05,
    damping: 0.85,
    idealDistance: 220,
  },
}
```

The `idealDistance` of 220 is the seeded perpendicular offset from
the spine. Damping is moderately high (0.85) to prevent oscillation
once the directories settle into their alternating pattern.

### `gwells.well.file-orbit`

Active. Represents file nodes that orbit their parent directory.

```typescript
{
  id: "gwells.well.file-orbit",
  label: "File Orbit",
  description:
    "A file node orbiting its parent directory-anchor. Identifies the " +
    "parent through the contains-edge from the source adapter. Subject " +
    "to spring attraction to the parent and repulsion from siblings " +
    "(same parent) and from other directory anchors (anti-overlap).",
  status: "active",
  pinned: false,
  defaults: {
    attractionStrength: 0.5,
    siblingRepulsion: 100,
    springStiffness: 0.07,
    damping: 0.9,
    idealDistance: 90,
  },
}
```

### `gwells.well.endpoint-fan`

Active. Represents files that belong to the root of a half rather than
to a specific directory.

```typescript
{
  id: "gwells.well.endpoint-fan",
  label: "Endpoint Fan",
  description:
    "A root-level file fanning outward from a spine endpoint. Identified " +
    "via attrs.isEndpoint set by the source adapter. Springs toward the " +
    "endpoint spine node with a wider ideal distance and lower stiffness " +
    "than file-orbit, producing a softer fan rather than tight orbit.",
  status: "active",
  pinned: false,
  defaults: {
    attractionStrength: 0.4,
    siblingRepulsion: 80,
    springStiffness: 0.05,
    damping: 0.9,
    idealDistance: 100,
  },
}
```

## Interactions referenced

Eight interactions are active in this dialect. They register in
`src/physics/gwells/interactions.ts`.

### `gwells.interaction.spine-linear.aligns.spine-linear`
source:  gwells.well.spine-linear
target:  gwells.well.spine-linear
kind:    linear-alignment

Declares that spine nodes arrange linearly with each other. In v0,
this interaction is effectively documentary — the seed function pins
the spine, and the engine doesn't move pinned wells. The interaction
is registered so that future variants of the dialect (e.g., a slight
spine wobble for aliveness) can activate it without a registry change.

### `gwells.interaction.directory-anchor.perpendicular.spine-linear`
source:  gwells.well.directory-anchor
target:  gwells.well.spine-linear
kind:    perpendicular
strength: 0.3
range:    180

Pulls directory anchors perpendicular to the spine axis (vertical, in
the canonical orientation). The seed function provides the initial
above/below assignment; this interaction maintains the perpendicular
alignment as the directory anchor moves to balance sibling repulsion.

### `gwells.interaction.directory-anchor.repels.directory-anchor`
source:  gwells.well.directory-anchor
target:  gwells.well.directory-anchor
kind:    repulsion
strength: 1.0
range:    320

Sibling repulsion between directory anchors. The 320-unit range is
roughly 1.5× the perpendicular offset, ensuring repulsion is felt
even when two anchors are on opposite sides of the spine. Combined
with the `perpendicular` interaction above, directories settle into
an alternating above-below pattern.

### `gwells.interaction.file-orbit.springs.directory-anchor`
source:  gwells.well.file-orbit
target:  gwells.well.directory-anchor
kind:    spring
strength: 1.0
idealDistance: 90

The primary attractive force: files spring toward their parent
directory. The target identification uses the parent relationship
from the contains-edge, not a generic well-type match. Files only
spring to *their own* parent.

### `gwells.interaction.file-orbit.repels.file-orbit`
source:  gwells.well.file-orbit
target:  gwells.well.file-orbit
kind:    repulsion
strength: 0.6
range:    140

Sibling repulsion between files. Spreads files angularly around their
parent directory. The 140-unit range is wider than the orbit radius so
files in adjacent orbits also influence each other slightly.

### `gwells.interaction.file-orbit.repels.directory-anchor-other`
source:  gwells.well.file-orbit
target:  gwells.well.directory-anchor
kind:    repulsion
strength: 1.4
range:    180

Anti-overlap force: files are repelled from directory anchors that
are *not* their parent. The strength is higher than file-sibling
repulsion because the failure mode (a file drifting into the wrong
directory's orbit) is more visually damaging than tight file
clustering.

The target identification excludes the file's own parent — only
*other* directory anchors apply repulsion.

### `gwells.interaction.endpoint-fan.springs.spine-linear-endpoint`
source:  gwells.well.endpoint-fan
target:  gwells.well.spine-linear
kind:    spring
strength: 0.8
idealDistance: 100

Endpoint fans spring toward the spine *endpoint* nodes — the
leftmost and rightmost spine nodes specifically. Target identification
uses the `isEndpoint` attribute on the spine node, not just the well
type. The fan attaches to a specific endpoint based on which half
of the spine the fan node was seeded near.

### `gwells.interaction.endpoint-fan.repels.endpoint-fan`
source:  gwells.well.endpoint-fan
target:  gwells.well.endpoint-fan
kind:    repulsion
strength: 0.7
range:    130

Sibling repulsion within the fan, controlling the angular distribution
of root-level files at each endpoint.

## Seed function

The dialect references the seed function `gwells.seed.directory-backbone-n2`,
which lives in `src/physics/gwells/seeders/directoryBackboneN2.ts`.

This seeder is the migrated form of the existing `directoryBackboneSeeder.ts`
from `src/graph/physics/`. The algorithm survives intact; the migration
is structural (move into gwells, wrap in a registry entry, adapt the
context signature to `GWSeedFunctionContext`).

The seeder reads from `ctx.config.seedParams`:
spineSpacing          (px between consecutive spine nodes; default 150)
directoryOffset       (px perpendicular from spine to directory anchor; default 220)
directoryAlternation  ("above-below" | "above-only" | "below-only"; default "above-below")
fileOrbitRadius       (px from directory to initial file position; default 90)
endpointFanArc        (px width of the endpoint fan; default 100)
endpointFanCount      (target files per endpoint fan, used for angle spacing; default 6)

The seeder's responsibilities:

1. Identify spine nodes (`attrs.nodeType === "spine"`).
2. Sort spine nodes by their canonical order (provided by the source
   adapter — typically alphabetic by path).
3. Assign x positions evenly: `spineNode[i].x = (i - n/2) * spineSpacing`.
   The spine runs through `y = 0`, centered horizontally.
4. Identify endpoint spine nodes (leftmost and rightmost) and set
   `attrs.isEndpoint = true` on them if not already set by the adapter.
5. For each directory node, locate its parent spine node via the
   contains-edge. Position the directory at `spine.x ± directoryOffset`
   on the perpendicular axis, alternating above and below for adjacent
   directories.
6. For each file node, locate its parent directory. Position the file
   at the directory's location offset by `fileOrbitRadius` at a
   sibling-distributed angle (evenly spaced around the directory).
7. For endpoint files, fan outward from the spine endpoint. Angle range
   is the `endpointFanArc` value centered on the perpendicular axis;
   distribute `endpointFanCount` files within that arc.
8. Write all positions via `graph.setNodeAttribute(nodeId, "x" | "y", value)`.
9. For every spine node, additionally write the position to
   `__seededSpinePositions[nodeId] = { x, y }` so Sigma's nodeReducer
   can enforce the pin at render time.

The seeder is pure: same graph + same `seedParams` produces the same
position output. No `Math.random()`. No I/O. No external state.

## Success criteria

When this dialect is applied for the first time in Pass D integration,
the implementer should observe:

1. **Spine is horizontal and continuous.** All spine nodes line up at
   `y ≈ 0` (within a few pixels of the seed position; pinned wells
   should be exactly at seed position).
2. **Spine spans the canvas.** Leftmost spine node sits in the
   docs-cluster side; rightmost in the src-cluster side. The geometric
   center of the spine is roughly the canvas center.
3. **Directories alternate above and below.** Adjacent directories on
   the spine should not stack on the same side. The alternation may
   bend slightly due to sibling repulsion but the alternating pattern
   should be visually clear.
4. **Files orbit their parents.** Files cluster around their parent
   directory at roughly the configured `fileOrbitRadius`. The orbit
   may not be circular — sibling repulsion and cross-directory
   repulsion will deform it — but each file is visibly closer to its
   parent than to any other directory.
5. **Endpoint fans appear at spine tips.** Files marked `isEndpoint`
   appear in fans extending outward from the leftmost and rightmost
   spine nodes rather than orbiting a directory.
6. **Cross-cluster separation is observable.** Looking at the
   docs half vs. the src half, the two halves should be visually
   distinguishable as separate clusters of activity, with the spine
   as the connecting backbone.
7. **No NaN or Infinity positions.** After 60 frames of physics,
   every node's `x` and `y` is finite. The smoke test asserts this
   programmatically; the runtime probe confirms visually (no nodes
   flying off to the canvas edge or disappearing).
8. **`__gwellsState` is populated.** After applying the dialect, the
   graph attribute `__gwellsState` exists and contains an entry for
   every non-null-assigned node. Spine nodes show `pinned: true`,
   `vx: 0`, `vy: 0`. Other nodes show finite velocity values and a
   non-empty `activeInteractions` array on most frames.

If any of these criteria fail visually, the Pass C implementer tunes
the parameter values in the dialect's `config` block. The starting
values in this document are the baseline; visual judgment overrides
them.

## What stays stable across tuning

These are the *invariants* of the dialect. Tuning the parameter values
is expected during Pass C; changing any of these is a dialect rewrite,
not a tuning pass:

- **Dialect id**: `gwells.dialect.end-to-end-spine`. Stable string
  reference; never rename without a migration.
- **Four well types**: spine-linear, directory-anchor, file-orbit,
  endpoint-fan. Adding a fifth is a separate change.
- **Eight active interactions**: the list above. Adding more
  interactions to this dialect is allowed; removing one is a
  redesign.
- **Seed function id**: `gwells.seed.directory-backbone-n2`. Stable.
- **Assignment rule**: the four `attrs.nodeType` / `attrs.isEndpoint`
  predicates. These are the contract between the source adapter and
  the dialect; changing them means the adapter has to change too.
- **Pin semantic**: spine nodes are pinned. Files and directories
  are not. Changing this changes the layout fundamentally.

The parameter values (`spineSpacing`, `directoryOffset`, force
strengths, ranges, damping) are *all* tunable. Don't preserve their
specific numbers if visual judgment demands different ones.

## Relationship to future dialects

This dialect intentionally does *not* include:

- **Cluster gravity / Galaxy-style orbital systems.** Files don't
  orbit on circular paths around their parent; they hold a position
  with damping. See [Galaxy Mode Dialect](dialect.physics.galaxy)
  for a future dialect that adds orbital motion.
- **Helix backbone.** The spine is a straight line, not a helix.
  See [Helix Constellation Dialect](dialect.physics.helix) for a
  future dialect that arranges the spine on a helical path.
- **Spread starfield distribution.** Nodes cluster around their parents
  rather than spreading evenly across the canvas. See
  [Constellation Mode Dialect](dialect.physics.constellation) for
  a future dialect that emphasizes spread.
- **Color-coded neighborhoods.** This dialect doesn't drive visual
  color; that's the theme system's job. See
  [Cluster Gravity and Color-Coded Neighborhoods](concept.graph.cluster.gravity)
  for the future system that combines gwells with color-coded
  community detection.

This dialect is deliberately the *simplest* possible layout that
demonstrates structured-anchor physics. It's the proof-of-concept for
the gwells architecture, not a maximalist showcase. Future dialects
elaborate on the same substrate.

## References

- [Gravity Well System Contract](physics.gwells.contract) — the
  authoritative behavior contract.
- [Gwells README](physics.gwells.readme) — module orientation.
- [Gwells Registry Patterns](physics.gwells.registry.patterns) — how
  the four registries compose, with this dialect as the worked
  example.
- [Helix Constellation Dialect](dialect.physics.helix) — sibling
  future dialect, vision-only.
- [Galaxy Mode Dialect](dialect.physics.galaxy) — sibling future
  dialect, vision-only.
- [Constellation Mode Dialect](dialect.physics.constellation) —
  sibling future dialect, vision-only.
- [Cluster Gravity and Color-Coded Neighborhoods](concept.graph.cluster.gravity)
  — future consumer of gwells.