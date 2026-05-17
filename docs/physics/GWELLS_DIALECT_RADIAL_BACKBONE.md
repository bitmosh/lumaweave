---
id: physics.gwells.dialect.radial.backbone
title: Gwells Dialect — Radial Backbone
type: reference
status: current
version: v0.1
cluster: azure
domain: physics
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-16
references:
  - physics.gwells.contract
  - physics.gwells.readme
  - physics.gwells.registry.patterns
  - physics.gwells.dialect.parallel.spines
tags: [physics, gwells, dialect, radial-backbone, v0.1, layout]
---

# Gwells Dialect — Radial Backbone

Two spines emanating from a central hub at 0° and 180°. Directories sit
perpendicular above/below each spine. Files orbit their parent directory.

**Dialect id:** `gwells.dialect.radial-backbone`
**Default:** Yes (registry default)
**Seeder id:** `gwells.seed.radial-backbone`

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
| `helixTwist` | `GWHelixTwistRecord` | Per-well-type twist configuration. Keys: `all`, `spine`, `directory`, `file`. Values are degrees per 100 units. |
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
4. **Place spine nodes** along their assigned axes. Position is computed as:
   - Distance from hub: `d = i * spineSpacing + offsetFromHub`
   - Position: `x = d * cos(θ)`, `y = d * sin(θ)`, `z = 0`
5. **Identify endpoint spine nodes** (the outermost node on each axis)
   and set `attrs.isEndpoint = true` on them if not already set by the
   adapter.
6. **For each directory node**, locate its parent spine node via the
   contains-edge. Position the directory at the spine's location offset by
   `directoryOffset` on the perpendicular axis with optional helix twist.
   Set `z = 0`.
7. **For each file node**, locate its parent directory. Position the file
   at the directory's location offset by `fileOrbitRadius` at a
   sibling-distributed angle with optional helix twist. Set `z = 0`.
8. **For endpoint files**, fan outward from the spine endpoint. Angle
   range is the `endpointFanArc` value centered on the perpendicular axis;
   distribute `endpointFanCount` files within that arc. Set `z = 0`.
9. **Write all positions** via `graph.setNodeAttribute(nodeId, "x" | "y" | "z", value)`.
10. **For every spine node**, additionally write the position to
    `__seededSpinePositions[nodeId] = { x, y }` for Sigma's nodeReducer.

The seeder is pure: same graph + same `seedParams` produces the same
position output. No `Math.random()`. No I/O. No external state.

**Spine count:** The number of spine nodes is determined by the source adapter (how many top-level subsystems the data has). The dialect's `spineCount` parameter controls how many radial axes the spines are distributed across; if there are more spines than axes, spines are round-robin distributed and each axis carries a chain of multiple spines. For example, with 41 spines and `spineCount: 2`, each of the 2 axes (0° and 180°) carries a chain of ~20 spine nodes.

## Helix twist record (v0.1)

In v0.1, `helixTwist` is an object instead of a number:

```typescript
interface GWHelixTwistRecord {
  all?: number;      // Baseline twist for all well types
  spine?: number;    // Twist for spine nodes
  directory?: number; // Twist for directory anchors
  file?: number;     // Twist for file orbits
}
```

This allows per-well-type control of helical twist. For example, you can twist
directories but keep files upright, or twist spines while keeping directories
fixed. Missing keys default to 0 (no twist).

The seeder uses `resolveHelixTwist(record, wellType)` to extract the specific
value for each well type, falling back to `all`, then to 0.

## Live tuning (Pass C4)

As of Pass C4 (v0.1), the `helixTwist` parameter is tunable via UI sliders in
the ControlDock. Users can adjust spine, directory, and file twist values in
real-time without restarting the physics engine. The sliders write to
`settings.physics.seedParamOverrides[activeDialectId].helixTwist`, which is
picked up by the controller's `applyConfigOverride` method and triggers a
seed function re-run with the merged config. Each dialect maintains independent
slider positions (per-dialect persistence).

## Seed Position Retention (Pass C5)

As of Pass C5 (v0.1), non-pinned wells (directory-anchor, file-orbit, endpoint-fan)
retain their seeded positions via a per-frame spring force toward the seed
position. The seeder writes all node positions to the `__gwellsSeedPositions`
graph attribute, and the engine applies a force `f = seedAdherence × (seedPos - currentPos)`
each frame. This preserves seeded layout intent (e.g., helix-twisted directories
stay twisted) while still allowing physics-driven refinement. Default adherence
values: directory-anchor 0.15 (strong), file-orbit 0.05 (light), endpoint-fan 0.08
(moderate).

## Source Adapter Integration (Pass C6)

As of Pass C6 (v0.1), the self-graph source adapter synthesizes `directory` nodes
for every unique directory path. The radial-backbone seeder traverses spine →
directory → file via contains edges, producing the layered visual structure this
dialect was designed for. The wellAssignment maps `nodeType: "directory"` to
`directory-anchor` and `nodeType: "doc" | "code" | "config" | "fixture"` to `file-orbit`.

## Radial-Backbone dialect configuration

```typescript
{
  id: "gwells.dialect.radial-backbone",
  label: "Radial Backbone",
  description: "Two spines emanating from a central hub at 0° and 180°. Directories perpendicular above/below.",
  status: "active",
  isDefault: true,
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
      spineCount: 2,
      spineAngles: [0, 180],
      offsetFromHub: 0,
      spineSpacing: 150,
      directoryOffset: 220,
      directoryAlternation: "above-below",
      helixTwist: {},  // Empty record = no twist
      fileOrbitRadius: 90,
      endpointFanArc: 100,
      endpointFanCount: 6,
    },
    wellOverrides: {
      "gwells.well.directory-anchor": {
        siblingRepulsion: 280,
        damping: 0.85,
        centerGravity: 0.05,
      },
      "gwells.well.file-orbit": {
        attractionStrength: 0.6,
        siblingRepulsion: 120,
        springStiffness: 0.08,
        damping: 0.9,
        idealDistance: 90,
        centerGravity: 0.02,
      },
      "gwells.well.endpoint-fan": {
        attractionStrength: 0.5,
        siblingRepulsion: 90,
        springStiffness: 0.06,
        damping: 0.9,
        idealDistance: 100,
        centerGravity: 0,
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

## Visual outcome

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

## Well types and interactions

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
    centerGravity: 0.05,  // NEW in v0.1
  },
}
```

The `idealDistance` of 220 is the seeded perpendicular offset from
the spine. Damping is moderately high (0.85) to prevent oscillation.
`centerGravity` applies a gentle pull toward the origin to prevent drift.

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
    centerGravity: 0.02,  // NEW in v0.1
  },
}
```

**Note (Pass C8.2):** For the standard radial-backbone usage, the `idealDistance: 90` is a fallback only. The engine computes per-pair ideal distances from seed positions at applyDialect time for edge-aware spring interactions (those with `requireEdge: "contains-parent"`). A file seeded at orbit radius 900 has a spring target distance of 900, not this static default. The static default applies only for non-edge-aware springs or dialects without contains-edge structure.

**Note (Pass C8.3):** File placement uses phyllotaxis spiral (φ-angle 137.508°) sorted by raw size ascending. Smaller files are placed closer to the parent directory, larger files farther away. Orbit radii scale with parent visual size. This replaces the previous evenly-spaced circular orbit placement. Helix twist is still applied on top of the phyllotaxis angle.

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
    centerGravity: 0,  // NEW in v0.1
  },
}
```

## Interactions

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
requireEdge: "contains-parent"

Pulls directory anchors perpendicular to their parent spine axis. The seed
function provides the initial above/below assignment; this interaction
maintains the perpendicular alignment as the directory anchor moves to
balance sibling repulsion. The `requireEdge: "contains-parent"` filter
ensures directories only feel this force from their actual parent spine.

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
requireEdge: "contains-parent"

The primary attractive force: files spring toward their parent
directory. The `requireEdge: "contains-parent"` filter ensures files only
spring to *their own* parent via the contains-edge from the source adapter.

### `gwells.interaction.file-orbit.repels.file-orbit`
source:  gwells.well.file-orbit
target:  gwells.well.file-orbit
kind:    repulsion
strength: 0.6
range:    140
requireEdge: "shared-parent"

Sibling repulsion between files. Spreads files angularly around their
parent directory. The `requireEdge: "shared-parent"` filter ensures files
only repel from siblings (files sharing the same parent directory).

### `gwells.interaction.file-orbit.repels.directory-anchor-other`
source:  gwells.well.file-orbit
target:  gwells.well.directory-anchor
kind:    repulsion
strength: 1.4
range:    180
requireEdge: "no-contains-parent"

Anti-overlap force: files are repelled from directory anchors that
are *not* their parent. The `requireEdge: "no-contains-parent"` filter
excludes the file's own parent — only *other* directory anchors apply
repulsion. The strength is higher than file-sibling repulsion because
the failure mode is more visually damaging.

### `gwells.interaction.endpoint-fan.springs.spine-linear-endpoint`
source:  gwells.well.endpoint-fan
target:  gwells.well.spine-linear
kind:    spring
strength: 0.8
idealDistance: 100
requireEdge: "contains-parent"

Endpoint fans spring toward the spine *endpoint* nodes — the
outermost nodes on each axis. The `requireEdge: "contains-parent"` filter
ensures fans only spring to their parent spine endpoint. Target
identification uses the `isEndpoint` attribute on the spine node.

### `gwells.interaction.endpoint-fan.repels.endpoint-fan`
source:  gwells.well.endpoint-fan
target:  gwells.well.endpoint-fan
kind:    repulsion
strength: 0.7
range:    130
requireEdge: "shared-parent"

Sibling repulsion within the fan, controlling the angular distribution
of root-level files at each endpoint. The `requireEdge: "shared-parent"`
filter ensures files only repel from siblings (files sharing the same
parent spine endpoint).

## Fern-Frond Layout (Pass C8)

Pass C8 restored real filesystem hierarchy in the self-graph `contains` edges
and updated the seeder to use recursive directory placement, creating a
fern-frond visual structure.

**Key changes:**

- **Self-graph hierarchy:** Directories now have true filesystem parent-child
  relationships instead of the flattened Pass C6 model. A directory at
  `src/graph/renderers` is contained by `src/graph`, which is contained by
  `spine.graph`.

- **Recursive placement:** The seeder now recursively places directories.
  At depth 0 (first-level directories off a spine), directories are placed
  perpendicular to the spine axis with alternation. At depth > 0, directories
  continue along the same outward direction as their parent, creating the
  characteristic fern-frond shape where sub-branches extend outward along the
  same axis as their parent branch.

- **Helix twist:** Helix twist is applied only at depth 0. Deeper levels do
  not receive additional twist, maintaining the coherent fern-frond structure.

This change enables visualization of deeper directory nesting levels that
were previously flattened into a single level. The fern-frond shape makes the
directory hierarchy visually apparent in the graph layout.

### Pass C8 Amendment — Dynamic Scaling & Spacing Tune

The initial Pass C8 implementation had correct algorithm but compressed visual
spacing. This amendment tunes scaling parameters and adds dynamic file orbit sizing.

**Parameter changes:**

- `spineSpacing`: 150 → 450 (triple — spine nodes visibly separated)
- `directoryOffset`: 220 → 400 (double — successive depths visually distinct)
- `fileOrbitRadius`: 90 → 80 (now serves as base for dynamic computation)

**Dynamic file orbit radius:**

Replaces static orbit radius with per-directory computation based on file count:

```
orbitRadius = clamp(baseRadius × sqrt(fileCount / 6), 40, 200)
```

- Base radius: 80 units (for ~6 files)
- Min radius: 40 units (floor for 1-2 files)
- Max radius: 200 units (ceiling for 96+ files)

Square-root scaling ensures orbit area grows linearly with file count, so each
file gets roughly the same angular share regardless of total count. Low-count
directories get tight clusters; high-count directories get wider orbits to avoid
overlap.

**Result:** Extent increased from ~1500×1500 to ~3000-4500×3000-4500 units. Deep nodes
reach 2000+ from origin. Fern fronds visible as distinct chains with varying
file orbit radii based on directory size.

## Success criteria

When the radial-backbone dialect is applied, the implementer should observe:

1. **Spine is horizontal and continuous.** All spine nodes line up at `y ≈ 0`.
2. **Directories alternate above and below.** Adjacent directories on the same spine should not stack on the same side.
3. **Files orbit their parents.** Files cluster around their parent directory at roughly `fileOrbitRadius`.
4. **No NaN or Infinity positions.** Every node's `x`, `y`, and `z` is finite.
5. **`__gwellsState` is populated.** The graph attribute exists and contains an entry for every non-null-assigned node.

## centerGravity (v0.1)

`centerGravity` applies a per-frame pull toward the origin (0, 0, 0). This
helps keep non-spine nodes from drifting outward indefinitely. Typical values
are small (0–0.1). The radial-backbone dialect uses:
- `directory-anchor.centerGravity = 0.05` (gentle pull inward)
- `file-orbit.centerGravity = 0.02` (very gentle pull)
- `endpoint-fan.centerGravity = 0` (no pull)

## References

- [Gravity Well System Contract](physics.gwells.contract)
- [Gwells README](physics.gwells.readme)
- [Gwells Registry Patterns](physics.gwells.registry.patterns)
- [Parallel Spines Dialect](physics.gwells.dialect.parallel.spines)
