---
id: physics.gwells.overview
title: Gwells Physics — Overview
status: active
last-updated: 2026-05-17
---

# Gwells Physics — Overview

**Gwells** is the physics and layout engine that LumaWeave uses to position nodes
in graph visualizations. It replaces FA2 (ForceAtlas2), which was the previous
physics engine. The migration occurred across Passes C1 through C8.4 on the
`feat/gwells-physics-migration` branch.

## What it is

Gwells is a typed gravity-well physics system. Every node belongs to a
**well type** that defines how the node interacts with other nodes. Forces
between nodes are defined by **interactions** — pairings of source well type
and target well type with a force kind (spring, attraction, repulsion,
perpendicular). **Seed functions** lay out initial positions deterministically.
**Dialects** package well types, interactions, seed function, and seed
parameters into a named arrangement (e.g., "Radial Backbone", "Parallel
Spines") that the user picks via a dropdown.

A graph is rendered by:
1. The source adapter emits typed nodes and edges
2. `buildGraphologyGraph` translates them into a `graphology` graph
3. The active dialect runs its seed function to assign initial positions
4. The gwells engine runs a per-frame force-integration loop that produces
   the layout's animation and equilibrium
5. Sigma renders the graphology graph to canvas

## Why it exists

FA2 was a black-box global force-directed layout. It produced unpredictable
layouts that fought against the data's structure — file hierarchies looked
like blobs, the layout flailed during interaction, parameters were unintuitive
to tune. Gwells inverts the design: instead of treating nodes uniformly and
hoping good structure emerges, the source adapter classifies nodes by role
(spine, directory, file) and gwells applies role-specific forces and
seed placement that produce intentional, predictable structure.

The result is layouts that look like what they *are* — a filesystem looks like
a directory tree with fronds, a knowledge base looks like clustered topics, a
narrative graph looks like a timeline. The shape of the layout reflects the
shape of the data.

## Design philosophy

**Determinism over emergence.** Seed functions place every node at a precise
known location. Physics handles small drift and interaction; it does not
determine the macro shape. If two runs of the same data should look the same,
they do.

**Forces agree with placement.** The engine's spring `idealDistance` for any
two connected nodes is derived from the seeded distance between them, not from
a static well-type default. The spring's target equals the seeder's intent.

**Content-driven sizing.** A node's visual size derives from the content it
represents (line count, byte count). A directory's size aggregates its
descendants recursively. Spacing scales with size — smaller files cluster
closer to parents, larger files orbit farther. The whole layout breathes with
the data.

**The data shape determines the layout.** N spines emanate from a hub; their
count is whatever the source adapter produces. The seeder does not hardcode
"src" or "docs" — it groups by whatever first-path-segment appears in the data.
Future source adapters (Cypher, Obsidian, custom JSON) feed the same engine
without modification.

**The engine is dialect-agnostic.** Engine code is generic. Dialect-specific
behavior lives in well-type defaults, interaction parameters, seed function
choice, and seed parameters. Two dialects with the same data produce
different-looking layouts using the same engine.

## The shape of "what's done"

After Pass C8.4 (and pending Pass C9 + future work), gwells is feature-complete
for the radial-backbone dialect family with N=2:

- Fern-frond hierarchical layout where directories branch outward, sub-directories
  continue along the same axis, files orbit their immediate parent in phyllotaxis
  spirals
- Node visual sizes derived from content via logarithmic scaling, with directory
  and spine sizes aggregated recursively from descendants
- Static per-axis alternation: each spine consumes one alternation slot along its
  axis, sign determined by position, applied to the spine's whole subtree
- Spines bucketed by first path segment so similar subsystems group on the same axis
- Per-pair spring distance: the spring force agrees with seeded placement instead
  of fighting it
- Edge-aware interactions: forces only apply between nodes that share specific
  edge relationships (e.g., spring from file to its parent directory, not to
  random directories)
- 41 dynamically-enumerated spines for the LumaWeave self-graph (8 src spines +
  31 docs spines + 2 root-spines)
- Two dialects: `radial-backbone` (default) and `parallel-spines`

## The shape of "what's next"

Major future work:

- **Pass C9** — drag-pin redesign. Drag is currently permanent; design intent is
  "drag temporarily, drift back on release". Pinned positions need per-dialect
  storage so they persist across dialect switches. A "reset" button under the
  dialect dropdown.
- **Pass C10 candidate** — universal structural classification. Replace
  string-matching `nodeType === "directory"` with graph-structural queries (depth,
  has-children, is-leaf) so future source adapters work without engine changes.
- **Hub-ring scaling for N ≥ 4.** When the source data has many top-level
  subsystems (10, 30, 40+), spines crowd at the origin. A hub-ring distributes
  spine origins along a growing circle.
- **Parallel-spines inward branching.** Subdirectory trees branch toward the
  central axis (with a gravity pull) instead of outward, with a future option to
  flip files outside the helical structure.
- **UI tuning controls** for spacing, sizing, alternation, and helix parameters
  so the user doesn't tune in code.
- **Larger-graph performance.** Current dataset is ~400 nodes; some interaction
  loops are O(N²) over certain well-type pairs. Needs revisit when 10K-node
  datasets arrive.

## Where to read more

- `GWELLS_ARCHITECTURE.md` — registry pattern, module structure, file layout
- `GWELLS_PIPELINES.md` — data flow, engine frame loop, seeding flow
- `GWELLS_LAYOUT_RULES.md` — fern-frond, phyllotaxis, alternation, per-pair springs
- `GWELLS_CURRENT_STATE.md` — pass-by-pass timeline with commit hashes
- `GWELLS_PROBES_AND_DIAGNOSTICS.md` — browser probes and diagnostic patterns
