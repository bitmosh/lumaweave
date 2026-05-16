---
id: physics.gwells.dialect.radial.backbone
title: Gwells Dialect — Radial Backbone Family
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
tags: [physics, gwells, dialect, radial-backbone, helix, v0, layout]
---

# Gwells Dialect — Radial Backbone Family

A family of dialects sharing one generalized seeder. Seeder id:
`gwells.seed.radial-backbone`. Initial dialects: `horizontal-linear`,
`vertical-parallel`, `helix-dual`. Future dialects (`triple-spine-y`,
`quad-spine-cross`, `helix-triple`, etc.) become new entries in the
dialect registry without algorithm changes.

This is the seeder family that ships in Pass C2 of the gwells migration.

## Core concept — radial backbone

A radial backbone is N spines (vectors) emanating from a single hub at
the canvas origin. Each spine has an angle, a length, and an optional
helical twist. Directories sit along each spine at regular spacing,
optionally rotating around the spine axis as they get farther from the
hub. Files orbit their parent directory.

The "single horizontal spine" layout and the "two parallel vertical
spines" layout are instances of the same algorithm with different
parameter sets. N=2 horizontal angles=[0°, 180°] gives the first.
N=2 vertical angles=[90°, 270°] with `offsetFromHub > 0` gives the
second. N=3 angles=[0°, 120°, 240°] gives a Y-shape. N=4 angles=[0°,
90°, 180°, 270°] gives a cross. Any N is supported.

## Seed function: gwells.seed.radial-backbone

The radial-backbone seeder computes initial positions for all nodes in a
graph. It reads from `ctx.config.seedParams`:

| Parameter | Type | Description |
|-----------|------|-------------|
| `spineCount` | number | Number of spines emanating from the hub (N). |
| `spineAngles` | number[] | Array of N angles in degrees (0° = east, 90° = north, etc.). |
| `offsetFromHub` | number | Distance each spine is offset from the hub along its angle. 0 means spines meet at origin. |
| `spineSpacing` | number | Distance between consecutive directories along each spine. |
| `directoryOffset` | number | Perpendicular distance from spine to directory anchor. |
| `directoryAlternation` | string | How directories alternate around the spine: `"above-below"`, `"above-only"`, or `"below-only"`. |
| `helixTwist` | number | Degrees of rotation per 100 units of distance from the hub. 0 means no twist. |
| `fileOrbitRadius` | number | Distance from directory to initial file position. |
| `endpointFanArc` | number | Angular width of the endpoint fan (in degrees). |
| `endpointFanCount` | number | Target files per endpoint fan, used for angle spacing. |

**Algorithm steps:**

1. **Identify spine nodes** (`attrs.nodeType === "spine"`).
2. **Sort spine nodes** by their canonical order (provided by the source
   adapter — typically alphabetic by path).
3. **Assign spines to axes** based on `spineCount` and `spineAngles`. Each
   spine gets a direction vector computed from its angle. The hub is at
   `(0, 0)`.
4. **Place spine nodes** along their assigned axes. For spine at index `i`
   on axis with angle `θ`:
   - Distance from hub: `d = i * spineSpacing + offsetFromHub`
   - Position: `x = d * cos(θ)`, `y = d * sin(θ)`
   - If `helixTwist` is non-zero, rotate the position around the axis
     perpendicular to the spine direction by `helixTwist * d / 100` degrees.
5. **Identify endpoint spine nodes** (the outermost node on each axis)
   and set `attrs.isEndpoint = true` on them if not already set by the
   adapter.
6. **For each directory node**, locate its parent spine node via the
   contains-edge. Position the directory at the spine's location offset by
   `directoryOffset` on the perpendicular axis. If `directoryAlternation`
   is `"above-below"`, alternate above/below for adjacent directories
   along the same spine.
7. **For each file node**, locate its parent directory. Position the file
   at the directory's location offset by `fileOrbitRadius` at a
   sibling-distributed angle (evenly spaced around the directory).
8. **For endpoint files**, fan outward from the spine endpoint. Angle
   range is the `endpointFanArc` value centered on the perpendicular axis;
   distribute `endpointFanCount` files within that arc.
9. **Write all positions** via `graph.setNodeAttribute(nodeId, "x" | "y", value)`.
10. **For every spine node**, additionally write the position to
    `__seededSpinePositions[nodeId] = { x, y }` so Sigma's nodeReducer
    can enforce the pin at render time.

The seeder is pure: same graph + same `seedParams` produces the same
position output. No `Math.random()`. No I/O. No external state.

## Initial dialect presets

### Horizontal-Linear

**Dialect id:** `gwells.dialect.horizontal-linear`
**Default:** Yes (this is the registry default; `isDefault: true`)
**Description:** Single horizontal spine, two halves running left-to-right.
Directories perpendicular above/below.

This is the original end-to-end-spine design. The spine runs through the
canvas center at `y = 0`. The left half holds documentation directories
and files; the right half holds source code directories and files.

**seedParams:**
```typescript
{
  spineCount: 2,
  spineAngles: [0, 180],      // 0° = east, 180° = west
  offsetFromHub: 0,           // spines meet at the canvas center
  spineSpacing: 150,
  directoryOffset: 220,
  directoryAlternation: "above-below",
  helixTwist: 0,
  fileOrbitRadius: 90,
  endpointFanArc: 100,
  endpointFanCount: 6,
}
```

**Visual outcome:**
```
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
```

### Vertical-Parallel

**Dialect id:** `gwells.dialect.vertical-parallel`
**Default:** No
**Description:** Two parallel vertical spines with a gap between them.
Preserves the visual layout of the existing FA2-pipeline
directoryBackboneSeeder.ts.

This layout matches the existing dual-backbone seeder: two vertical
axes separated by 2000 units (each offset 1000 from the hub). Spines are
stacked vertically along each axis. Files orbit outward from the
backbone axis.

**seedParams:**
```typescript
{
  spineCount: 2,
  spineAngles: [90, 270],     // 90° = north, 270° = south
  offsetFromHub: 1000,       // each spine offset 1000 units → 2000-unit gap
  spineSpacing: 150,
  directoryOffset: 220,
  directoryAlternation: "above-below",
  helixTwist: 0,
  fileOrbitRadius: 80,
  endpointFanArc: 100,
  endpointFanCount: 6,
}
```

**Visual outcome:**
```
┌─────────┐                    ┌─────────┐
│ docs    │                    │ src     │
│ spine   │                    │ spine   │
└─────────┘                    └─────────┘
    │                              │
    ●                              ●
    │                              │
  files                         files
    │                              │
    ●                              ●
    │                              │
  dir-A                         dir-X
    │                              │
    ●                              ●
    │                              │
  files                         files
```

### Helix-Dual

**Dialect id:** `gwells.dialect.helix-dual`
**Default:** No
**Description:** Two strands meeting at hub, twisted around each other.
Demonstrates helix-twist math; foundation for future helix-triple,
helix-quad, etc.

This layout uses the same vertical-parallel configuration but adds a
helical twist. As directories get farther from the hub, they rotate
around their spine axis. The twist parameter (5° per 100 units) produces
a gentle corkscrew effect.

**seedParams:**
```typescript
{
  spineCount: 2,
  spineAngles: [90, 270],
  offsetFromHub: 0,            // spines meet at the hub
  spineSpacing: 150,
  directoryOffset: 220,
  directoryAlternation: "above-below",
  helixTwist: 5,               // degrees per 100 units distance from hub
  fileOrbitRadius: 90,
  endpointFanArc: 100,
  endpointFanCount: 6,
}
```

**Visual outcome:**
```
    ○ (twisted)
     \
      ●
       \
        ○
         \
          ● (hub)
         /
        ○
       /
      ●
     /
    ○ (twisted)
```

The helix twist is subtle at 5° per 100 units. A directory at distance
1500 from the hub will have rotated 75° around its spine axis compared
to a directory at distance 0.

## Helix twist units

`helixTwist` is degrees per 100 units of distance from the hub along
the spine axis. The formula for rotation angle at distance `d` is:

```
rotation = helixTwist * (d / 100)
```

A value of 5 means a directory at distance 1500 from hub will have
rotated 75° around its spine axis (compared to a directory at distance
0). Value 0 means no twist (straight spine). Negative values rotate
in the opposite direction.

The helix twist is applied as a rotation around the axis perpendicular
to the spine direction. For a vertical spine (angle 90°), the twist
axis is horizontal. For a horizontal spine (angle 0°), the twist axis
is vertical.

## Well types and interactions (shared across all presets)

Four well types power these dialects. Each registers in
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
    "A directory node. Seeded perpendicular to the spine axis, alternating " +
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

Active. Represents files that belong to the root of a spine rather than
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

## Interactions (shared across all presets)

Eight interactions are active in these dialects. They register in
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

Pulls directory anchors perpendicular to the spine axis. The seed
function provides the initial above/below assignment; this interaction
maintains the perpendicular alignment as the directory anchor moves to
balance sibling repulsion.

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
outermost nodes on each axis. Target identification uses the
`isEndpoint` attribute on the spine node, not just the well type. The
fan attaches to a specific endpoint based on which spine the fan node
was seeded near.

### `gwells.interaction.endpoint-fan.repels.endpoint-fan`
source:  gwells.well.endpoint-fan
target:  gwells.well.endpoint-fan
kind:    repulsion
strength: 0.7
range:    130

Sibling repulsion within the fan, controlling the angular distribution
of root-level files at each endpoint.

## Success criteria

When the horizontal-linear dialect is applied for the first time in
Pass D integration, the implementer should observe:

1. **Spine is horizontal and continuous.** All spine nodes line up at
   `y ≈ 0` (within a few pixels of the seed position; pinned wells
   should be exactly at seed position).
2. **Spine spans the canvas.** Leftmost spine node sits in the
   docs-cluster side; rightmost in the src-cluster side. The geometric
   center of the spine is roughly the canvas center.
3. **Directories alternate above and below.** Adjacent directories on
   the same spine should not stack on the same side. The alternation may
   bend slightly due to sibling repulsion but the alternating pattern
   should be visually clear.
4. **Files orbit their parents.** Files cluster around their parent
   directory at roughly the configured `fileOrbitRadius`. The orbit
   may not be circular — sibling repulsion and cross-directory
   repulsion will deform it — but each file is visibly closer to its
   parent than to any other directory.
5. **Endpoint fans appear at spine tips.** Files marked `isEndpoint`
   appear in fans extending outward from the outermost spine nodes
   rather than orbiting a directory.
6. **Cross-cluster separation is observable.** Looking at the docs half
   vs. the src half, the two halves should be visually distinguishable
   as separate clusters of activity, with the spine as the connecting
   backbone.
7. **No NaN or Infinity positions.** After 60 frames of physics,
   every node's `x` and `y` is finite. The smoke test asserts this
   programmatically; the runtime probe confirms visually (no nodes
   flying off to the canvas edge or disappearing).
8. **`__gwellsState` is populated.** After applying the dialect, the
   graph attribute `__gwellsState` exists and contains an entry for
   every non-null-assigned node. Spine nodes show `pinned: true`,
   `vx: 0`, `vy: 0`. Other nodes show finite velocity values and a
   non-empty `activeInteractions` array on most frames.

For vertical-parallel, the success criteria are similar but the spine
is vertical and there are two parallel axes with a gap between them.

For helix-dual, the success criteria include observing the helical
twist: directories farther from the hub should show progressive
rotation around their spine axis.

## What stays stable across tuning

These are the *invariants* of the radial-backbone family. Tuning the
parameter values is expected during Pass C; changing any of these is
a dialect rewrite, not a tuning pass:

- **Seeder id**: `gwells.seed.radial-backbone`. Stable string reference;
  never rename without a migration.
- **Three initial dialect ids**: `gwells.dialect.horizontal-linear`,
  `gwells.dialect.vertical-parallel`, `gwells.dialect.helix-dual`.
  Stable.
- **Four well types**: spine-linear, directory-anchor, file-orbit,
  endpoint-fan. Adding a fifth is a separate change.
- **Eight active interactions**: the list above. Adding more interactions
  to a dialect is allowed; removing one is a redesign.
- **Assignment rule**: the four `attrs.nodeType` / `attrs.isEndpoint`
  predicates. These are the contract between the source adapter and
  the dialect; changing them means the adapter has to change too.
- **Pin semantic**: spine nodes are pinned. Files and directories are
  not. Changing this changes the layout fundamentally.

The parameter values (`spineSpacing`, `directoryOffset`, force
strengths, ranges, damping) are *all* tunable. Don't preserve their
specific numbers if visual judgment demands different ones.

## Future presets (not in v0)

These are paste-ready dialect entries demonstrating how the algorithm
extends to higher N. They become new dialect entries in Pass C2+ without
algorithm changes.

### Triple-Spine-Y (N=3)
```typescript
{
  id: "gwells.dialect.triple-spine-y",
  label: "Triple Spine Y",
  description: "Three spines in a Y-shape (0°, 120°, 240°).",
  status: "planned",
  isDefault: false,
  seedFunctionId: "gwells.seed.radial-backbone",
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
    // same eight interactions as above
  ],
  config: {
    seedParams: {
      spineCount: 3,
      spineAngles: [0, 120, 240],
      offsetFromHub: 0,
      spineSpacing: 150,
      directoryOffset: 220,
      directoryAlternation: "above-below",
      helixTwist: 0,
      fileOrbitRadius: 90,
      endpointFanArc: 100,
      endpointFanCount: 6,
    },
  },
}
```

### Quad-Spine-Cross (N=4)
```typescript
{
  id: "gwells.dialect.quad-spine-cross",
  label: "Quad Spine Cross",
  description: "Four spines in a cross shape (0°, 90°, 180°, 270°).",
  status: "planned",
  isDefault: false,
  seedFunctionId: "gwells.seed.radial-backbone",
  // ... same wellAssignment and activeInteractions as above
  config: {
    seedParams: {
      spineCount: 4,
      spineAngles: [0, 90, 180, 270],
      offsetFromHub: 0,
      spineSpacing: 150,
      directoryOffset: 220,
      directoryAlternation: "above-below",
      helixTwist: 0,
      fileOrbitRadius: 90,
      endpointFanArc: 100,
      endpointFanCount: 6,
    },
  },
}
```

### Helix-Triple (N=3 with twist)
```typescript
{
  id: "gwells.dialect.helix-triple",
  label: "Helix Triple",
  description: "Three strands meeting at hub, twisted around each other.",
  status: "planned",
  isDefault: false,
  seedFunctionId: "gwells.seed.radial-backbone",
  // ... same wellAssignment and activeInteractions as above
  config: {
    seedParams: {
      spineCount: 3,
      spineAngles: [0, 120, 240],
      offsetFromHub: 0,
      spineSpacing: 150,
      directoryOffset: 220,
      directoryAlternation: "above-below",
      helixTwist: 5,
      fileOrbitRadius: 90,
      endpointFanArc: 100,
      endpointFanCount: 6,
    },
  },
}
```

### Helix-Quad (N=4 with twist — produces a 4-strand braid)
```typescript
{
  id: "gwells.dialect.helix-quad",
  label: "Helix Quad",
  description: "Four strands meeting at hub, twisted into a braid.",
  status: "planned",
  isDefault: false,
  seedFunctionId: "gwells.seed.radial-backbone",
  // ... same wellAssignment and activeInteractions as above
  config: {
    seedParams: {
      spineCount: 4,
      spineAngles: [0, 90, 180, 270],
      offsetFromHub: 0,
      spineSpacing: 150,
      directoryOffset: 220,
      directoryAlternation: "above-below",
      helixTwist: 5,
      fileOrbitRadius: 90,
      endpointFanArc: 100,
      endpointFanCount: 6,
    },
  },
}
```

Each future preset is a new dialect entry referencing the same
`gwells.seed.radial-backbone` seeder. No algorithm work needed.

## Relationship to future visual features

The radial-backbone seeder produces *positions* only. Cross-link visuals
between adjacent spines (the "rungs" in a double-helix appearance) are
a separate rendering feature, planned for a future pass — they live in
the renderer or as an overlay layer, not in the seeder.

Galaxy-style orbital motion (continuous rotation along spine axes
during physics simulation) is similarly out of scope for the seeder;
that would be an engine feature, not a seeding feature.

## References

- [Gravity Well System Contract](physics.gwells.contract) — the
  authoritative behavior contract.
- [Gwells README](physics.gwells.readme) — module orientation.
- [Gwells Registry Patterns](physics.gwells.registry.patterns) — how
  the four registries compose, with radial-backbone as the worked
  example.
- [Helix Constellation Dialect](dialect.physics.helix) — sibling
  future dialect, vision-only.
- [Galaxy Mode Dialect](dialect.physics.galaxy) — sibling future
  dialect, vision-only.
- [Constellation Mode Dialect](dialect.physics.constellation) —
  sibling future dialect, vision-only.
- [Cluster Gravity and Color-Coded Neighborhoods](concept.graph.cluster.gravity)
  — future consumer of gwells.
