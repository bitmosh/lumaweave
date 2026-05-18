---
id: physics.gwells.layout-rules
title: Gwells Physics — Layout Rules
status: active
last-updated: 2026-05-17
---

# Gwells Physics — Layout Rules

These are the rules that the seeders and engine implement. They were
established across Passes C5 through C8.4 and represent the design intent
for current and future work.

## Rule 1 — Fern-Frond Hierarchical Branching

For radial-backbone (and parallel-spines mirrored):

- A spine has directory children that branch off at depth 0
- A depth-0 directory's position is **perpendicular** to the spine axis
- Deeper sub-directories (depth ≥ 1) continue along the **same outward axis**
  as their parent's first branch — they do NOT branch perpendicular again
- This produces a "fern frond" shape: branches start perpendicular, then
  extend outward in straight chains, never branching perpendicular at deeper
  levels
- Each directory at any depth has files orbiting around it (see Rule 4)

```
                                                       ⋮
                                              ┌── leaf-file
                                              │
                                              ▼
spine ─────────► dirA(depth 0) ─►  dirA1(depth 1) ─► dirA1a(depth 2) ─► ...
       ▲          (perpendicular)    (continues outward)
       │
   spine axis
```

The fern-frond rule is implemented in `placeBranchRecursive`: depth 0
computes a fresh perpendicular direction; depth ≥ 1 inherits the parent's
`outwardDir` unchanged. The rule was established in Pass C8 after extended
design discussion (the alternative — perpendicular at every level — produces
visually-stacked sub-trees that were rejected).

## Rule 2 — Static Per-Axis Alternation

Each spine node along an axis consumes one **alternation slot**. The
alternation sign is determined by the spine node's position in the axis:

- Index 0 → sign +1 (subtree extends in the perpendicular-positive direction,
  e.g., "up" for a horizontal spine)
- Index 1 → sign -1 ("down")
- Index 2 → sign +1
- Index 3 → sign -1
- ...

A spine's alternation sign is applied to its **entire subtree at depth 0**. All
of a spine's directory children, their files, their sub-directories, and so
on, extend in the spine's sign direction.

**Empty spines still consume their slot.** A spine with no directory children
(only loose files, or nothing at all) still reserves its alternation position.
The next spine's sign flips even though no visible branch fills the empty
spine's reserved direction.

This rule is critical for future z-axis subdivision when N ≥ 3 dialects ship.
A predictable, static alternation pattern lets z-axis layering compose cleanly:
each spine's subtree occupies a known direction, so adding z-depth layers
doesn't shuffle the x-y layout.

The rule was established in Pass C8.4 after observing that per-child
alternation (each spine alternating its own children independently) produced
chaotic, inconsistent visual results that didn't compose into a coherent axis.

## Rule 3 — Per-Pair Spring Distance

For spring interactions with `requireEdge: "contains-parent"`, the spring's
ideal distance is the **seeded distance between source and target**, not a
static well-type default.

The mechanism:

1. After the seed function runs, build a `pairIdealDistance: Map<string, number>`
2. For every (node, parent) pair where parent is in `parentOfNode`, compute
   `|nodeSeed - parentSeed|` and store at `"nodeId|parentId"` (and the reverse
   direction for bidirectional lookup)
3. The spring force evaluation in `stepPhysics` reads from this map first,
   falls back to interaction's static `idealDistance`, then to well-type default

The rule was established in Pass C8.2 to resolve the issue that file-orbit's
static `idealDistance: 120` was fighting the seeder's dynamic placement at
radii up to 900. Pre-C8.2: files compressed to ~402 from parent. Post-C8.2:
files settle near their seeded positions (~900) with low drift.

The rule has an important implication for drag handling (Pass C9): when a user
drags a node, the new position should ideally update `pairIdealDistance` so
the spring's target follows the user's intent rather than continuously pulling
the node back to its original seed.

## Rule 4 — Phyllotaxis File Orbits

Within a directory, file children arrange in a **phyllotaxis spiral** sorted
by content size:

- Files sorted ascending by `rawSize` (line count or byte count)
- Each file gets an angular position: `angle = fileIndex × 137.508°`
  (the golden angle; produces natural non-overlap)
- Each file gets a radial position: smallest file (index 0) at `MIN_ORBIT`,
  largest file (index N-1) at `MAX_ORBIT`, others linearly interpolated by
  index
- `MIN_ORBIT` and `MAX_ORBIT` scale with the parent directory's own visual
  size — larger directories have wider orbits
- Helix twist (if non-zero) composes additively with the phyllotaxis angle

The rule was established in Pass C8.3 after observing that evenly-spaced
circles of uniform radius produced visually-dense overlapping clusters,
and that file size correlation with orbit distance gives the layout
semantic meaning ("big files orbit farther").

The phyllotaxis angle (137.508°) is `(3 - √5) × π` radians. This angle is the
mathematical optimum for non-overlap, used in nature for sunflower seeds,
pinecones, etc.

## Rule 5 — Content-Driven Sizing

Every node's visual size derives from content via logarithmic scaling:

- **Leaves** (doc/code/config/fixture): size = `computeNodeSize(lineCount)`
- **Directories**: size = `computeNodeSize(aggregateSize)`, where
  `aggregateSize` is the recursive sum of descendant raw sizes
- **Spines**: size = `computeNodeSize(aggregateSize)` for the spine's whole
  subtree
- Result range: [48, 360] visual size, log-mapped from raw size [1, ~11000+]
  via `computeNodeSize` with `SCALE_REF: 6000`

**Sizes live in graph coordinates, not screen pixels.** Sigma's
`itemSizesReference` is set to `"positions"` (Pass C8.4). This is load-bearing:
without it, Sigma would measure sizes in screen pixels and every
content-driven sizing decision would be invisible because coordinate-space
spacing would have no proportional relationship to visual sizes. With it,
larger directories visibly occupy more space, file orbits are proportional to
node sizes, and spacing tuning in `dialects.ts` produces visible effects.

A directory with many large files becomes a visually larger directory node.
That directory's spine becomes correspondingly larger. The principle "ripples
out globally" — the visual scale at every level reflects the content scale
beneath it.

The `physics.nodeSize` setting is a global multiplier applied on top. The
default of 1 produces the content-derived base; users can scale up or down
without losing the content-relative differentiation.

The rule was established in Pass C8.3 (content-driven sizing) and completed
in Pass C8.4 (itemSizesReference fix that made the sizing model actually
take visual effect). See `GWELLS_DESIGN_CONVERSATIONS.md` for the
"Why itemSizesReference: positions" reasoning.

## Rule 6 — Spine Bucketing by First Path Segment

Spines are distributed across radial axes by grouping them into **buckets
keyed by first path segment**:

- `spine.src.*` and `spine.src-root` → bucket "src"
- `spine.docs.*` and `spine.docs-root` → bucket "docs"
- For future source adapters with other top-level segments, those become
  their own buckets

For radial-backbone with N=2 and src + docs data: one axis gets all "src"
bucket spines, the other gets all "docs" bucket spines.

For higher N or more buckets, the algorithm distributes buckets round-robin
across the available axes. For source data with 5 buckets and N=2, axis 0
gets buckets 0, 2, 4 and axis 1 gets buckets 1, 3 — round-robin assignment
in alphabetical bucket-key order for determinism.

Within each axis, the spines for each bucket are placed in alphabetical
order along the axis. Root-spines (e.g., `spine.src-root`) move to the
outermost position via post-flatten reorder (Rule 7).

The rule was established in Pass C8.4 after observing that the previous
alphabetical round-robin produced chaotic axes where src and docs spines
mixed randomly.

## Rule 7 — Root-Spines at Axis Far End

Root-level spines (`spine.src-root`, `spine.docs-root`) represent loose
files at the root of a top-level directory (e.g., `src/main.tsx` lives
in `src/`, not in any subdirectory). They sit at the **outermost position**
on their respective axis.

Mechanism: after `flattenSpinesFromRoot` produces the axis spine list,
post-process to move any spine ending in `-root` to the end of the list.
Then position calculation proceeds normally — index 0 at hub, index N-1 at
far end.

Loose files attached to a root-spine fan outward beyond the axis chain via
endpoint-fan placement, not alternation. No up/down branching — just an
arc opening away from the spine.

The rule was established in Pass C8.4. Pre-C8.4, root-spines collided with
other spines at origin because their placement defaulted to (0, 0).

## Rule 8 — Edge-Aware Force Filtering

Interactions can opt into edge-aware filtering via the `requireEdge` field:

- `requireEdge: "contains-parent"` — force only applies between source node
  and a target that is the source's immediate `contains` parent
- No `requireEdge` field — force applies between any source-target well-type
  pair within `range`

Six of the eight current interactions use `requireEdge: "contains-parent"`:

- file-orbit → directory-anchor (spring)
- directory-anchor → spine-linear (perpendicular)
- endpoint-fan → spine-linear (spring)
- (others as defined in `interactions.ts`)

Without this filter, every file would feel attraction toward every directory,
producing chaos. The filter ensures the spring force pulls a file toward its
actual parent, not a random other directory.

The rule was established in Pass C7.

## Composition note

Rules 1-9 compose. A radial-backbone layout with N=2:

- Rule 6 sorts spines into "src" vs "docs" axes
- Rule 7 places root-spines at the far end of each axis
- Rule 2 assigns alternation signs to each spine slot along the axis
- Rule 1 places depth-0 directories perpendicular, deeper levels along outward
- Rule 4 places files in phyllotaxis spirals around their directories
- Rule 5 sizes every node by content, in graph coordinates
- Rule 3 makes spring forces agree with seeded placement
- Rule 8 filters spring forces to only fire between contained pairs
- Rule 9 makes drag temporary by default (drift-back toward seed)

The result is a deterministic, content-responsive, hierarchically-correct
layout that the engine maintains via balanced forces.

## Rule 9 — Drag is temporary by default; pin is opt-in

A user dragging a non-spine node and releasing without a modifier held
sees the node drift back toward its seeded position via the seed-anchor
force (Rule 6 / Pass C5). The drag handler does not mutate
`__gwellsSeedPositions`. Spine nodes cannot be dragged at all — the
downNode handler refuses to start a drag if `attrs.nodeType === "spine"`.

Pass C9.1 layers opt-in pin behavior on top of this default: when the user
drags one or more nodes (with optional scope modifiers: Ctrl for single,
Ctrl+Shift for family, Ctrl+Alt for subtree) and releases while holding Ctrl,
the dragged nodes are "pinned" to their drop positions. The drag handler
writes the drop positions to `settings.physics.pins[activeDialectId]` (a
per-dialect pin map), not to `__gwellsSeedPositions`, preserving the
separation of layout authority (seeder) from manual authority (user pins).
The engine's `applyPins` method applies the pin overlay: it sets `fixed: true`
on pinned nodes, writes their positions to `__gwellsSeedPositions`, and
maintains a graph-level `__gwellsPinnedSet` attribute to track which nodes
are currently pinned. This set persists across controller instances, enabling
dialect-switch round-trips.

The default (drift-back) was established in Pass C9.0. The pin gesture
was added in Pass C9.1.

## Rules deferred to future work

- **Hub-ring for N ≥ 4.** When spines crowd at the origin (many top-level
  buckets), distribute spine origins along a growing circle rather than at a
  single hub point.
- **Inward branching for parallel-spines.** Subdirectory trees branch toward
  the central axis (with a gravity pull), instead of outward.
- **Universal structural classification.** Replace string-based
  `nodeType === "directory"` matching with graph-structural queries (depth,
  has-children, is-leaf) so future source adapters work without engine
  changes.

These rules are designed but not yet implemented.
