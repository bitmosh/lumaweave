---
id: physics.gwells.future-vision
title: Gwells Physics — Future Vision
status: vision
last-updated: 2026-05-17
---

# Gwells Physics — Future Vision

This doc captures the longer-term direction for gwells beyond the immediate
pass queue. It is intentionally aspirational and may evolve. Anything
load-bearing for current passes lives in other docs; this is the horizon.

## The trajectory

Gwells started as "replace FA2 with something deterministic." It is becoming
a general-purpose graph-physics layout system that can ingest any structured
data and produce intentional, content-responsive visualizations. The
trajectory has three broad phases:

1. **Phase 1 — Filesystem-shaped layouts (where we are now).** The system
   handles hierarchical filesystem data well. Two dialects ship. The pass
   queue completes the basic features (drag-pin, larger N support).

2. **Phase 2 — Multi-source universality.** The system handles Cypher
   graphs, Obsidian vaults, custom JSON, and other structured data via
   pluggable source adapters. The engine works against graph topology, not
   string-typed nodes. Layout rules generalize.

3. **Phase 3 — Interactive composition.** Users compose layouts from
   primitive rules via UI. Add a spine, branch a frond, choose phyllotaxis
   vs spiral vs grid, all without writing code. Gwells becomes a layout
   language users speak through a control panel.

Each phase enables the next. None requires the next; each is independently
useful.

## Near-term arc — completing Phase 1

These items round out the basic filesystem-shaped layout.

### Pass C9 — Drag-pin redesign

Current state: dragging a node permanently updates its seed position. The
node stays where dropped, forever.

Design intent: drag is temporary. Press-and-hold pins the node to the cursor.
Release lets the node drift back toward its natural position (its parent's
orbit). For nodes the user wants permanently moved, an explicit "pin" toggle
locks position; toggling "unpin" releases it.

Pinned positions need per-dialect storage. If the user pins a node in
radial-backbone and switches to parallel-spines, the pin doesn't apply
(different geometry). Switching back to radial-backbone restores the pin.

A "reset" button under the dialect dropdown clears all per-dialect pins for
the current dialect. The dialect's seed function re-runs as if from scratch.

Test rework: Pass C5's drag-seed test expects "drag stays forever." Pass C9
changes that contract; the test rewrites to reflect "drag held while held,
release returns."

### Hub-ring scaling for N ≥ 4

Current state: all spines emanate from a single hub at origin. With N=2
this is two arms; with N=3 it's three arms at 120°; both work. With N=10
or N=40 (future source adapters with many top-level buckets), spines
crowd unbearably.

Design: distribute spine origins along a circle of radius R(N) around
origin. R grows with N so spines don't crowd. Each spine starts at a
different point on the ring and grows radially outward.

```
            spine.A
             ▲
             │
spine.B ◄────●────► spine.D     N=4, ring radius R₄
             │
             ▼
            spine.C
```

For low N (N=2, N=3), R(N) is small or zero — current behavior preserved.
For high N, R(N) scales so adjacent spines have adequate angular and
radial separation.

The ring-radius growth interacts with how content is sized — bigger spines
need more circumferential room. A formula like `R = baseRing + spineCount × spineWidthEstimate`
is plausible. Final formula gets designed against concrete data.

### Parallel-spines inward branching

Current state: parallel-spines puts spines at distinct x positions; their
directories branch outward (away from central axis).

Design intent: directories branch inward, toward the central axis,
producing helical or interweaving fronds. Combined with a gravity pull,
fronds from opposite spines balance against each other through repulsion.
The result: a 3D-feeling helix or DNA-like structure in 2D projection.

A toggle "flip files outside" mirrors this — files fan outward from the
helix while directories branch inward, creating a layered effect.

Interacts with:
- Repulsion between sibling directories (must be tuned to allow
  interweaving without buckling)
- Center-gravity force (needs to be strong enough to keep fronds balanced
  without crushing them)

### UI tuning controls

Current state: all spacing, sizing, alternation, and helix parameters live
in `dialects.ts` seedParams or hardcoded helper constants. Tuning requires
code edits + hot reload (or hard reload for some).

Design intent: expose key parameters as sliders in the control panel:

- `spineSpacing` (slider 200 to 5000)
- `directoryOffset` (slider 500 to 10000)
- `physics.nodeSize` (slider 0.2 to 5.0, multiplier on content-derived base)
- File orbit MIN/MAX/scale-with-parent (three sliders)
- Helix twist per well type (three sliders: spine, directory, file)
- Center gravity per well type (sliders)
- Seed adherence per well type (sliders)
- "Reset to dialect defaults" button per dialect

Each slider's value persists in the settings store, scoped to the current
dialect. Hot-applied to the running engine via the existing
`applyConfigOverride` mechanism.

### Larger-graph performance

Current state: ~400 nodes runs smoothly. Some interaction loops are O(N²).

Design intent: when the typical dataset hits ~10K nodes, the engine needs
spatial partitioning. Quad-tree or simple bucket grid for neighbor queries.
Interaction loops only consider candidates within range cutoff.

Not blocking until concrete larger datasets arrive. Performance pass when
the need is real, not speculative.

## Mid-term arc — Phase 2 universality

### Universal structural classification

Replace string-based wellAssignment matching (`nodeType === "directory"`)
with graph-structural queries:

```typescript
wellAssignment: (nodeId, attrs, graphContext) => {
  const inDegree = graphContext.containsInDegree(nodeId);
  const outDegree = graphContext.containsOutDegree(nodeId);
  const depth = graphContext.depthFromRoot(nodeId);
  
  if (inDegree === 0 && outDegree > 0) return "gwells.well.spine-linear";
  if (outDegree > 0) return "gwells.well.directory-anchor";
  if (outDegree === 0 && inDegree === 1) return "gwells.well.file-orbit";
  return "gwells.well.file-orbit"; // default
}
```

The engine pre-computes structural properties at applyDialect time and
exposes them via a graphContext object. Source adapters emit nodes with
arbitrary types and contains-edges; the engine derives well assignment
from topology.

Backward compatible: existing dialects continue to work because the new
helper still respects explicit nodeType when both are available. New
dialects can opt into pure-structural classification.

### Source adapters beyond filesystem

Phase 2 ships at least three new source adapters:

**Cypher source adapter.** Reads a Cypher (Neo4j-style) graph. Nodes have
labels (e.g., "Person", "Place"); edges have types ("KNOWS", "LIVES_IN").
The adapter chooses one label or edge type as the hierarchy backbone for
gwells; other relationships render as styled non-contains edges.

**Obsidian vault adapter.** Reads `.md` files in an Obsidian vault. Folders
become spines. Backlinks become contains relationships (or styled edges,
depending on user preference). Tags get rendered as cluster groupings.

**Custom JSON adapter.** Reads a generic JSON file conforming to a schema:
nodes have type + label + optional parent reference; edges have type +
optional weight. Provides escape hatch for any structured data without
needing a dedicated adapter.

Each adapter goes through `normalizeGraphifyGraph` (the existing pre-engine
normalization step) so the rest of the pipeline doesn't care which adapter
loaded the data.

### Layout rule library

Phase 2 grows the rule set beyond fern-frond and phyllotaxis. Candidate
rules:

- **Cluster gravity.** Nodes with matching tag/label attract each other
  to form visual clusters within a parent's region.
- **Edge bundling.** Multiple parallel edges between the same node pair
  render as a single thick edge; edges from clusters bundle along common
  paths.
- **Z-axis subdivision.** A spine's subtree subdivides along z based on
  some attribute (date modified, file type, custom user grouping). Each
  z-stripe contains a phyllotactic fan.
- **Temporal layout.** Timestamped nodes lay out along a time axis;
  spatial constraints derived from time as an additional dimension.
- **Force fields.** Region-based forces that don't depend on individual
  node interactions (e.g., "files in this directory all feel a leftward
  drift").

Each rule lands as a registered interaction or seed-function extension.
The engine grows to support new force kinds as needed (currently:
attraction, repulsion, spring, perpendicular, linear-alignment).

### Multi-dialect blending

Currently the user picks one dialect at a time. Phase 2 might support
*blending* two dialects: 70% radial-backbone + 30% parallel-spines, with
the layout interpolating between the two seed positions. Visual transition
animation. Could enable smooth UX when the user wants to "see this layout
slightly differently."

## Long-term arc — Phase 3 composition

### User-composed layouts

Instead of picking a dialect, the user builds a layout from primitive
rules in a UI:

- Drag "spine bucketing" rule into the layout, pick "by first path segment"
- Drag "fern frond" rule below it, set depth-0 perpendicular angle
- Drag "phyllotaxis orbit" rule, set MIN/MAX
- Drag "static alternation" rule, set sign sequence
- Save as a custom dialect, share with others

Each rule is a self-contained module with parameters. The composer combines
them into a seed function pipeline. The user can preview interactively
and tweak parameter values in real time.

This is the long-term vision: gwells becomes a layout DSL spoken through
a graphical interface.

### Inter-graph navigation

A single workspace can show multiple graphs simultaneously, each in its
own region, with cross-graph edges showing relationships. Gwells layouts
extend to cover multi-graph configurations: each graph gets its own hub
ring, inter-graph edges route through a meta-layer.

### Constellation mode

Some dialects (already drafted in concept docs) explore *constellation*
metaphors: nodes as stars, clusters as constellations, edges as visual
connections traced through the space. Gwells provides the physics; a
constellation overlay system provides the visual treatment.

### VR / 3D camera

The seeders already write z coordinates. Sigma renders 2D, so z is
currently ignored. A future renderer could read z and provide camera
rotation. VR mode (already drafted in concept docs) puts the user inside
the graph, navigating in three dimensions.

The gwells engine itself doesn't need changes for this — its forces
already operate over 2D (with z optionally written) and could extend to
3D when the renderer supports it.

## Non-goals

Worth stating what gwells is NOT going to be:

- **Not a general-purpose physics engine.** Gwells is specifically about
  graph layout. It doesn't simulate cloth, fluids, rigid-body dynamics, etc.
- **Not a force-directed-layout library.** FA2 was that. Gwells is
  classified-force-with-deterministic-seeding. The classification matters.
- **Not a rendering system.** Sigma renders. Gwells positions. The two
  systems coordinate but stay distinct.
- **Not a graph-data system.** Graphology stores. Source adapters ingest.
  Gwells reads positions from and writes positions to a graph it doesn't
  own.

These boundaries keep gwells focused. Things outside the boundary live in
adjacent systems.

## Open questions

Things that aren't yet decided and will need design work when the time
comes:

- **How does gwells handle dynamic graph mutation?** If a user adds a node
  while gwells is running, what happens? Currently it's an
  open-it-and-see situation. Future passes should define the contract.
- **Should dialects be user-extensible?** Currently they're code constants.
  A user-writable dialect (via JSON or DSL) is on the Phase 3 vision but
  needs threat-model and constraint-design work.
- **Is multi-dialect blending actually useful or just visually interesting?**
  Open question for Phase 2.
- **What's the right perf model at 100K+ nodes?** Spatial partitioning,
  yes. But also frame budget management, level-of-detail rendering,
  off-screen culling. Phase 2 or 3 problem depending on when it surfaces.

## Closing note

This vision doc is aspirational. Don't treat it as a contract. The actual
work happens pass-by-pass with clear scope and visible verification. If
a future pass discovers that the vision was wrong, the vision adjusts.
The trajectory matters more than the destination.
