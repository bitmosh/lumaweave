---
id: physics.gwells.design-conversations
title: Gwells Physics — Design Conversations
status: active
last-updated: 2026-05-17
---

# Gwells Physics — Design Conversations

This doc captures the reasoning behind load-bearing decisions in gwells. It
exists because the *what* (specs, rules, code) is easy to read but the *why*
is easy to lose. When a future change conflicts with an existing rule, this
doc explains what we already considered and rejected, so we don't redo the
same exploration.

## Why fern-frond, not tree-with-perpendicular-branches-at-every-level

Multiple layout shapes were considered for hierarchical directories
branching off a spine.

**Option A (rejected): perpendicular branching at every level.** A
sub-directory branches perpendicular to its parent directory, the way the
first-level directory branched perpendicular to the spine. Visually:
sub-trees zigzag perpendicular at each depth, like a fractal cross-pattern.

**Option B (rejected): tree-layout with width-proportional spreads.** Each
directory's children fan out in an arc proportional to the subtree's total
width. Looks like a binary tree drawn in the visual graph layout style.

**Option C (selected): fern-frond.** First level branches perpendicular,
deeper levels continue along the same outward axis. Sub-trees grow as
chains extending outward, not as branched fans.

The fern-frond rule was selected because:

- **Predictable depth orientation.** At any depth, a node's outward direction
  is constant across its whole subtree. You can read "this branch goes
  outward in this direction" without tracing the path back.
- **Visually distinct branches.** Different subtrees of different spines
  occupy different angular regions and don't overlap. Trees would put deep
  subtrees in narrow angular wedges where they'd collide.
- **Physical sympathy.** A fern frond's physics-stable shape — long linear
  extension with sibling repulsion settling the angular spread — is exactly
  what graph-physics naturally produces. Trees would require manual angle
  computation per depth.
- **Z-axis composability.** When N ≥ 3 dialects ship and we subdivide along
  z, fronds extending outward give clean z-axis "stripes" parallel to the
  spine. Trees would have z-stripes cutting across the tree at angles.

The fern-frond rule was codified in Pass C8 and is currently implemented in
`placeBranchRecursive` with the `outwardDir` inheritance pattern.

## Why static alternation, not content-aware

When a spine has multiple directories, the directories alternate between
positive perpendicular ("up" for horizontal spines) and negative
perpendicular ("down"). Whose responsibility is it to alternate? Three
options were considered.

**Option A (rejected): per-spine independent.** Each spine alternates its
own children: spine A's first child up, A's second child down, A's third
child up. Spine B's first child *also* up (independent counter). Across an
axis, the pattern from-spine-to-spine is unpredictable: ABBA, ABAB, BAAB
depending on which spine has how many children.

**Option B (rejected): content-aware.** Look at the size or content
distribution and balance up-vs-down to minimize visual asymmetry. Skip
alternation slots if the next spine has no content.

**Option C (selected): static per-axis.** Every spine consumes exactly one
alternation slot regardless of content. Sign determined by spine's position
in the axis. Empty spines still consume their slot — the direction is
"reserved" even if no branch renders.

The static rule was selected because:

- **Z-axis subdivision composability (load-bearing).** When N ≥ 3 dialects
  arrive, each spine's subtree will be subdivided along z. A static
  alternation pattern means the z-subdivision algorithm always knows
  "spine k extends in direction Y_sign(k), so its z-stripes lay out
  predictably." Content-aware alternation would shift z-stripe positions
  whenever content changed.
- **Deterministic layout.** Same data should always produce the same
  layout. Content-aware alternation would shift the entire visual when a
  single file is added or removed.
- **Visual stability through edits.** A user editing files shouldn't watch
  their layout reshuffle. Static alternation makes layout change only when
  structure (spine count, depth) changes.

The static rule was codified in Pass C8.4 after observing that Pass C8's
per-spine-independent alternation (Option A inherited from earlier work)
produced visually chaotic results.

## Why per-pair spring distance, not static idealDistance

The spring force between a file and its parent directory used a static
`idealDistance: 120` from the file-orbit well type's defaults. After Pass
C8 placed files at dynamic orbit radii up to 900, the spring fought the
seeder — files settled at ~402 (midway between spring's 120 target and
seed-anchor's 900 target).

Three resolutions were considered.

**Option A (rejected): tune idealDistance to match the most common orbit.**
Pick 400 as the default, accept that small directories' files sit too far
and large directories' files sit too close. Loses content-correlation.

**Option B (rejected): crank up seedAdherence.** Make the seed-anchor force
overpower the spring. Files settle exactly where placed. Tested at Pass C7
with seedAdherence 0.4 — produced "frozen" feel where physics didn't
contribute anything visible.

**Option C (selected): per-pair idealDistance.** For spring interactions
with `requireEdge: "contains-parent"`, the spring's target distance equals
the seeded distance between source and target, looked up from a map built
once at applyDialect time.

The per-pair rule was selected because:

- **Forces agree with placement.** No tug-of-war. The spring's equilibrium
  point IS the seeded position.
- **Content-correlation preserved.** A 500-line file orbits farther than a
  50-line file, and the spring agrees that's where the file belongs.
- **Drift collapses to small values.** With both forces pointing the same
  place, files settle at their seed with minimal noise.
- **Architecturally honest.** The seeder is the source of truth for
  placement; the spring is the mechanism for maintaining it.

The per-pair rule was codified in Pass C8.2 via `pairIdealDistance` map and
the modified `stepPhysics` spring case.

A consequence worth flagging: when the user drags a node, the seed position
update mechanism (Pass C5) updates only the node's seed. Pass C9's drag-pin
redesign will need to consider whether dragging should also update
`pairIdealDistance` — otherwise the spring will pull the dragged node back
toward its original seeded distance from parent.

## Why phyllotaxis spirals, not even-spacing

Files in a directory orbit the directory in a ring. Three angular layouts
were considered.

**Option A (rejected): evenly-spaced angles.** Files at `angle = i / N × 2π`.
Visually: a perfect circle of files. Tested through Pass C8.2 — clean but
visually flat. Files appear as a uniform ring with no internal structure.
Hard to tell which file is which.

**Option B (rejected): sorted-by-name angular order.** Files alphabetically
ordered around the circle. Provides search-by-position but doesn't reflect
content meaning.

**Option C (selected): phyllotaxis spiral, sorted by content size.** Files
sorted ascending by raw size, then placed at `angle = i × 137.508°` (the
golden angle). Radial position scales with index — smallest closest to
parent, largest farthest.

The phyllotaxis rule was selected because:

- **Natural non-overlap.** The golden angle is the mathematical optimum
  for radial distribution without alignment. Used in nature for sunflower
  seeds and pinecones precisely because adjacent items never align radially.
- **Content-meaning conveyed by position.** Large files visibly orbit
  farther, small files cluster near parent. The position itself becomes a
  data dimension.
- **Visual texture.** Spiral structure breaks the uniformity of a flat ring.
  Eye can pick out a single file more easily than from an undifferentiated
  ring.
- **Scales gracefully.** Phyllotaxis works for 3 files and for 300 files
  without re-tuning. Even-spacing requires angular tuning per file count.

The phyllotaxis rule was codified in Pass C8.3 via `computeFileOrbit` in
`seederHelpers.ts`.

## Why log-mapped node sizes, not linear

Source file sizes range from 1 line to 11000+ lines — over 4 orders of
magnitude. Three mappings to visual size were considered.

**Option A (rejected): linear.** Multiply raw size by a constant. A 100-line
file gets 100×k visual size; an 11000-line file gets 11000×k. Result: most
files cluster at tiny visual sizes while outlier-large files dominate.

**Option B (rejected): square-root.** Compresses the range somewhat but
still produces an asymmetric distribution where large files dominate
visually.

**Option C (selected): logarithmic.** Map raw size to visual size via
`log(1 + rawSize) / log(1 + SCALE_REF)`. A 1-line file gets MIN size; an
11000-line file gets MAX. Mid-range files distribute evenly.

The log rule was selected because:

- **Human perception is logarithmic.** Doubling a file's size feels like
  "a little bigger," not "twice as big." Log mapping matches intuition.
- **Visual range stays manageable.** All files render at visually-distinct
  sizes within [4, 40] without runaway outliers.
- **Power-law content distributions** are common in source code (Zipf-like).
  Log mapping handles them gracefully without parameter tuning.

The log rule was codified in Pass C8.3 via `computeNodeSize`.

## Why two seeders, not one configurable seeder

Radial-backbone and parallel-spines are two distinct layout algorithms
sharing well types, interactions, and helpers. Two implementation
strategies were considered.

**Option A (rejected): one seeder with `mode` parameter.** Single
`seedRadialOrParallel(ctx)` function dispatches on a mode flag. Shared code
path with conditional branches for radial vs parallel geometry.

**Option B (selected): two seeders.** `seedRadialBackbone` and
`seedParallelSpines` as separate functions with separate logic. They share
helpers (`buildContainsMap`, `placeBranchRecursive`, etc.) but the
top-level structure is distinct.

The two-seeders rule was selected because:

- **The algorithms are fundamentally different.** Radial places spines on
  radial axes from a hub. Parallel places spines at distinct x positions
  growing in the same direction. Conditional code paths would multiply.
- **Future seeders compose cleanly.** Hub-ring for N ≥ 4 will be a new
  seeder. Cypher-style "force-directed but classified" will be another.
  Each gets its own file rather than another branch in a mega-function.
- **Each seeder's code is readable in isolation.** A reader doesn't have
  to mentally filter "this branch only applies in radial mode" when
  reading parallel code.

The two-seeders rule was codified in Pass C3.1 and is preserved through
all subsequent passes.

## Why we kept "spine.docs-root" and "spine.src-root" instead of orphaning loose files

Loose files at `docs/git-log.md` or `src/main.tsx` don't have a directory
parent in the typical sense — they live directly in `src/` or `docs/` which
are themselves the spine bucket. Two handlings were considered.

**Option A (rejected): orphan them.** Files with no synthesized parent
directory get placed at origin or fall back to some arbitrary location.
Practical result: a pile of files at (0, 0) or random positions, visually
noisy.

**Option B (selected): synthesize root-level spines.** Generate
`spine.src-root` and `spine.docs-root` as spine nodes (not directory nodes)
sitting at the outer end of their respective axis. Loose files attach to
these via `contains` edges and become endpoint-fans.

The root-spine rule was selected because:

- **Every leaf has a parent.** No special-case orphans in the source
  adapter or seeder.
- **Loose files visible.** Endpoint-fans at the axis far end keep loose
  files in the visual flow rather than dumping them at origin.
- **Future generalization.** Source adapters for non-filesystem data may
  have a similar "loose items not in a category" concept; the root-spine
  pattern generalizes.

The root-spine rule was codified in Pass C8.1.

## Why we deferred universal structural classification

Several passes have suggested replacing `nodeType === "directory"` string
matching with graph-structural queries (depth-from-root, has-children,
is-leaf). This was discussed multiple times during Passes C8 through C8.3.

Each time it was deferred. Reasons:

- **It's bigger than the immediate problem.** Fixing per-pair springs
  doesn't require structural classification. Fixing fern-frond doesn't
  require it. Doing it now means coupling two unrelated changes.
- **The current source adapter emits strings reliably.** For the
  filesystem case, string-typing works fine. Premature generalization
  for unknown future adapters adds complexity without immediate benefit.
- **The right time is when a second source adapter ships.** When a Cypher
  or Obsidian adapter is being built, the engine-side abstraction can be
  designed against concrete examples, not speculation.

The deferral is captured as Pass C10 candidate. Universal structural
classification is on the roadmap but not blocking Pass C9 or current
work.

## Why we deferred hub-ring for N ≥ 4

The current spine layout places all spines on radial axes emanating from a
single hub point at origin. For N=2 and N=3, this works. For N=10 or N=40
(future source adapters with many top-level buckets), spines crowd at the
hub.

A hub-ring approach was discussed: distribute spine origins around a
circle of growing radius. Deferred because:

- **No current dataset triggers it.** The LumaWeave self-graph has 41
  spines on 2 axes — but the user explicitly accepted this as a current
  limitation. Other datasets aren't loaded yet.
- **Implementation requires N-aware geometry.** Spine angle and radius
  both depend on N in non-trivial ways. Better to design when we have
  concrete data shapes to test against.
- **Z-axis subdivision interacts.** When N ≥ 3 dialects ship with z-axis
  subdivision, the hub-ring math needs to coordinate with the z-stripe
  math. Designing them together is cleaner than separately.

The hub-ring concept is captured in `FUTURE_VISION.md` as a near-future
design.

## Lessons from the migration

A few hard-won lessons from the C-series passes worth noting:

**Audit before tuning.** Multiple times during this migration, parameters
were adjusted with no visible effect because the data ground truth was
different than assumed. The fix was always: probe first, see what the
graph actually contains, then change code. Never tune without knowing
what's already there.

**Visible "wrong" can be rendering, not physics.** During Pass C8 we
spent significant time tuning physics to make fronds visible. The actual
issue was rendering scale: node visual sizes at 8 with camera ratio 0.046
rendered at ~174px radius — files inside the parent dot visually. Once we
checked the camera ratio, the physics turned out to be correct all along.
Always check rendering scale before assuming physics is wrong.

**Single-letter sign errors are easy.** Pass C8 had alternation working
per-spine but not per-axis. The bug was that the alternation index was
local to each spine's children iteration rather than indexed against the
axis-level spine position. Easy to miss; took a careful read of the seeder
loops to catch.

**Commit often.** Each pass landed as its own commit with a clear before/
after probe pair. When something broke unexpectedly, we always had a
known-good state to roll back to. Big-bang refactors would have been much
harder to recover from.

**Don't expand scope mid-pass.** Several times during the C-series, mid-
pass observations suggested a related fix. The discipline was always:
file it for the next pass, complete the current pass cleanly, commit.
Layered, focused passes shipped faster than ambitious combined passes.
