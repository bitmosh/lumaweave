---
id: physics.gwells.dialect.parallel.spines
title: Gwells Dialect — Parallel Spines
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
  - physics.gwells.dialect.radial.backbone
tags: [physics, gwells, dialect, parallel-spines, v0.1, layout]
---

# Gwells Dialect — Parallel Spines

N vertical spines distributed evenly around a central y-axis in 3D.
Each spine runs vertically; spines are arranged in a ring around the
central axis. The z attribute is stored on every node for forward-compatibility
with future 3D camera support.

**Dialect id:** `gwells.dialect.parallel-spines`
**Default:** No
**Seeder id:** `gwells.seed.parallel-spines`

For N=2 (default), spines sit at x=±2000, z=0 — a pure 2D layout that
matches the visual appearance of the former FA2 dual-vertical layout.

## Seed function: gwells.seed.parallel-spines

The parallel-spines seeder computes initial positions for all nodes in a
graph. It reads from `ctx.config.seedParams`:

| Parameter | Type | Description |
|-----------|------|-------------|
| `spineCount` | number | Number of spines distributed around the central y-axis (N). |
| `offsetFromHub` | number | Base offset; actual axis radius = `axisOffsetForN(this, spineCount)`. |
| `spineSpacing` | number | Distance between consecutive directories along each spine (y-axis). |
| `directoryOffset` | number | Perpendicular distance from spine to directory anchor (horizontal fan). |
| `directoryAlternation` | string | How directories alternate around the spine: `"above-below"`, `"above-only"`, or `"below-only"`. |
| `helixTwist` | `GWHelixTwistRecord` | Per-well-type twist configuration. Keys: `all`, `spine`, `directory`, `file`. Values are degrees per 100 units. |
| `fileOrbitRadius` | number | Distance from directory to initial file position (in x-z plane). |
| `endpointFanArc` | number | Angular width of the endpoint fan (in degrees, in x-z plane). |
| `endpointFanCount` | number | Target files per endpoint fan, used for angle spacing. |

**3D coordinate system:**

- **y-axis**: Vertical direction (spines run along y)
- **x-z plane**: Horizontal plane (spines distributed in a ring around y-axis)
- **x = R × cos(angle)**, **z = R × sin(angle)**, **y = node index × spineSpacing**

where `R = axisOffsetForN(offsetFromHub, spineCount) = offsetFromHub × max(1, spineCount/2)`.

**Algorithm steps:**

1. **Identify spine nodes** (`attrs.nodeType === "spine"`).
2. **Build parent-child maps** from contains edges.
3. **Assign spines to axes** using `assignSpinesToAxes(rootSpineIds, spineCount)`.
4. **Place spine nodes** along their assigned axes:
   - For spine at angle θ around central y-axis:
   - `x = R × cos(θ)`, `y = nodeIndex × spineSpacing`, `z = R × sin(θ)`
   - Apply optional spine twist via `resolveHelixTwist(helixTwist, "spine")`
5. **For each directory node**, position it perpendicular to the spine in the x-z plane.
6. **For each file node**, position it in orbit around the directory in the x-z plane.
7. **Write all positions** via `graph.setNodeAttribute(nodeId, "x" | "y" | "z", value)`.
8. **For every spine node**, additionally write the position to
   `__seededSpinePositions[nodeId] = { x, y }` for Sigma's nodeReducer.

The seeder is pure: same graph + same `seedParams` produces the same
position output. No `Math.random()`. No I/O. No external state.

## Helix twist (v0.1)

The `helixTwist` parameter is a `GWHelixTwistRecord` object with keys
`all`, `spine`, `directory`, and `file`. Values are degrees per 100 units
of distance along the spine. The seeder uses `resolveHelixTwist(record, wellType)`
to extract the specific value for each well type, falling back to `all`, then to 0.

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

## Pass C8 Amendment — Dynamic Scaling & Spacing Tune

The initial Pass C8 implementation had correct algorithm but compressed visual
spacing. This amendment tunes scaling parameters and adds dynamic file orbit sizing.

**Parameter changes:**

- `spineSpacing`: 150 → 450 (triple — spine nodes visibly separated)
- `directoryOffset`: 220 → 400 (double — successive depths visually distinct)
- `fileOrbitRadius`: 80 → 80 (now serves as base for dynamic computation)

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

## Parallel-Spines dialect configuration

```typescript
{
  id: "gwells.dialect.parallel-spines",
  label: "Parallel Spines",
  description: "Two vertical spines at x=±2000, z=0. Directories fan horizontally.",
  status: "active",
  isDefault: false,
  seedFunctionId: "gwells.seed.parallel-spines",
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
      offsetFromHub: 1000,  // R = 2000 for N=2 (unchanged)
      spineSpacing: 450,       // CHANGED from 150 (Pass C8 tune: matches radial-backbone)
      directoryOffset: 400,    // CHANGED from 220 (Pass C8 tune: matches radial-backbone)
      directoryAlternation: "above-below",
      helixTwist: {},
      fileOrbitRadius: 80,     // Base for dynamic computation (Pass C8 tune: matches radial-backbone)
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
      ...sharedInteractionOverrides,
      "gwells.interaction.directory-anchor.repels.directory-anchor": {
        strength: 80,
        range: 200,
      },
    },
  },
}
```

**Interaction override note:**

Parallel-spines softens the `directory-anchor.repels.directory-anchor` interaction
to `strength: 80, range: 200`. This allows directories from different spines
to branch inward without violent rejection, which is important for the
side-by-side vertical spine layout.

## Visual outcome (N=2 default)

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

In 2D projection (x, y only), this looks like the former FA2 dual-vertical
layout. The z coordinate is stored for future 3D camera support.

## axisOffsetForN helper

```typescript
export function axisOffsetForN(baseOffset: number, N: number): number {
  return baseOffset * Math.max(1, N / 2);
}
```

This helper computes the ring radius for N spines. For the default
`offsetFromHub = 1000` and `spineCount = 2`, the radius is `1000 × max(1, 1) = 2000`,
giving spines at x=±2000, z=0.

## Success criteria

1. **Spines are vertical.** All spine nodes have x and z positions consistent
   with their assigned angle around the y-axis.
2. **Spines are distributed in a ring.** For N=2, spines are at x=±2000, z=0.
3. **Directories fan horizontally.** Directories branch left/right from their
   parent spine in the x-z plane.
4. **No NaN or Infinity positions.** Every node's `x`, `y`, and `z` is finite.
5. **`__gwellsState` is populated.** The graph attribute exists and contains
   an entry for every non-null-assigned node.

## References

- [Gravity Well System Contract](physics.gwells.contract)
- [Gwells README](physics.gwells.readme)
- [Gwells Registry Patterns](physics.gwells.registry.patterns)
- [Radial Backbone Dialect](physics.gwells.dialect.radial.backbone)
