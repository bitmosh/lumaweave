---
id: inbox.future.ideas
title: Future Ideas Inbox
type: manual
status: current
version: v86b
domain: roadmap
cluster: violet
agent_readable: true
include_in_self_graph: false
last_updated: 2026-05-15
tags:
  - future
  - ideas
  - inbox
  - backlog
  - concept
---

# Future Ideas Inbox

A holding area for ideas that are not yet roadmap items. Not a commitment. Not a backlog. A place to put things so they don't get lost.

Items here are promoted to the roadmap only when:
- A contract is written for them
- The user explicitly schedules them
- They become a dependency for active work

---

## Graph Intelligence

- **PLANNED SETTINGS — removed from registry (P1·S9 cleanup)**
  These were commented-out Planned entries from settings.registry.ts.
  Implement when renderer supports them:

  zoomLabelThreshold: slider 0.5-3.0
    Min zoom level to show labels
    Requires Sigma camera zoom hook

  hoverLabelColor: color picker
    Per-node hover label text color
    Requires Sigma per-node label color support

  selectedNodeColor: color picker
    Override selected node highlight color
    Wire to graphVisualTokens.nodeColor.selected

  defaultNodeColor: color picker
    Override default node fill color
    Wire to theme nodeColorScale[0]

  selectedEdgeColor: color picker
    Override selected edge stroke color
    Wire to graphVisualTokens.edgeColor.selected

- **SOLAR ORBIT DIALECT (gwells)**
  Future gwells dialect. Cluster sun nodes act as gravity anchors;
  cluster members orbit at radii driven by importance. Inter-cluster
  repulsion keeps systems separated. Phase 1: orbital placement.
  Phase 2: animated orbital drift. Phase 3: cluster boundary
  repulsion walls. Phase 4: Kepler-accurate orbital mechanics.
  Implementation path: gwells well types (cluster-sun, cluster-orbit)
  + interactions (gravity, sibling-repulsion, inter-cluster-repulsion)
  + new seed function. See docs/physics/GALAXY_MODE_DIALECT.md for
  the visual target.
  Pre-req: gwells v0 ships. Priority: after the horizontal-linear dialect
  is stable.

- **CLUSTER DEPTH SLIDER**
  Replace neighborhood depth dropdown with a slider from
  1.0 → 4.0 at 0.1 increments. Fractional depth: 1.4 shows
  direct neighbors at 40% opacity fade. 2.7 shows depth-2 at
  full and depth-3 at 70% opacity. Hold key combo (Alt+scroll)
  to adjust live. 4th depth level: tertiary neighbors of
  tertiary neighbors — shows the full extended neighborhood.
  This was discussed with user and never made it to docs.
  Capture it now. Priority: medium — high UX value.

- **YAML GRAPH PARSER — PRE-BUILD SCRIPT APPROACH**
  Fix for self-split: use Node.js build script instead of Vite glob at runtime.
  Script: scripts/generate-self-graph.mjs
  Reads docs/ with fs, parses frontmatter, writes src/fixtures/self-graph-generated.json
  Import JSON statically in AppShell.tsx.
  Add to package.json scripts:
    "generate:graph": "node scripts/generate-self-graph.mjs"
  Run before dev/build to keep graph fresh.
  108 docs with include_in_self_graph:true = 131+ nodes.

- **GRAPHOLOGY ECOSYSTEM — REMAINING CANDIDATES**
  Of three previously-listed candidate packages, only one remains
  relevant after the gwells migration:

  **graphology-metrics** (installed)
    Degree centrality → auto node size by connections
    Betweenness centrality → identify bridge nodes
    PageRank → identify influential nodes
    Already in use for centrality-based sizing.

  Retired: graphology-layout-forceatlas2 and graphology-layout-noverlap
  were removed during the gwells migration. graphology-communities-louvain
  remains in package.json but is no longer load-bearing for any active
  dialect; verify usage and retire if confirmed orphaned.

- **USEFIXTURE SMART SWITCHING**
  AppShell.tsx useFixture is hardcoded true.
  Smart switching (derive from summary.normalizedNodes)
  was attempted but broke theme-target-inspector.spec.ts.
  Testid selectors updated (lines 199, 708) to accept either
  testid, but layout assertions (lines 211-212) expect
  fixture-specific graph dimensions (panelBox.x + width <= 861).
  Real source (AI Lab: 233 nodes, 313 edges) has different
  dimensions causing assertion failures.
  Fix requires:
  1. Update layout assertions to handle both fixture and real source
  2. Either remove dimension checks or use relative positioning
  3. Then: const hasRealSource = summary.normalizedNodes &&
           summary.normalizedNodes.length > 0 && !summaryError;
     const useFixture = !hasRealSource;
  Priority: medium — affects demo experience
  Constraint: 2 layout assertions need updating first

- **Cluster gravity** — hard gravity walls between neighborhoods, nodes orbit within cluster (proto-Galaxy mode). Implementation path: future gwells dialect. See docs/physics/GALAXY_MODE_DIALECT.md and docs/graph/intelligence/CLUSTER_GRAVITY_AND_COLOR_CODED_NEIGHBORHOODS.md.
- **Color-coded neighborhoods** — community detection driving brand cluster colors in graph
- **Edge confidence visualization** — edge thickness or opacity encodes confidence class (observed / inferred / ai-inferred)
- **Node importance rings** — high-weight nodes rendered with a subtle ring/corona to indicate weight
- **Graph diff view** — highlight nodes/edges that changed between two history slider positions
- **Cluster drag interaction** — Hold modifier key (Alt or Shift) + drag node → node and all directly connected neighbors move as a rigid unit with proportions locked, external edges stretch/compress naturally, on key release: physics resumes from new positions. Implementation path: respect gwells's `fixed: true` attribute for the entire cluster during drag, then release. Priority: after basic node dragging works in gwells. Relevant for: future gwells dialects (moving constellation branches without breaking the backbone).
- **GRAPH ROTATION + PSEUDO-3D PROJECTION** — Right-click drag → rotate 2D graph coord space. Store node positions as true 3D (x, y, z). Project 3D → 2D with rotation matrix on Sigma. Animate projection angle on node selection. Auto-rotate to selected cluster centroid. No Three.js needed — pure projection math on existing Sigma 2D renderer. The src/renderers/ subtree is the future path for true 3D graphs. Gwells v2+ may extend its schema to include z-coordinate. Priority: after cluster colors + graph density.
- **Gwells dialect-aware tunable handles** — Once gwells is stable, expose per-dialect tunables (spine spacing, fan arc width, repulsion strength, etc.) as Layer 1 handles with `status: planned`. UI surfaces them in the Advanced section of the Physics panel only when their owning dialect is active. Replaces the retired "Advanced Physics Controls" idea, which was FA2-specific.

---

## Visual Grammar Engine

- **Grammar handle autocomplete** — typing a handle path gets autocomplete from the handle registry
- **Dialect preview mode** — apply a `.lwgrammar.yaml` file to the live graph in preview-only mode
- **Signal Loom patch bay UI** — visual routing matrix for audio → handle subscriptions
- **Preset marketplace** — browse and apply community-submitted grammar presets (after security pipeline)

---

## Workspace and Layout

- **DEBUG STATUS BAR MERGE** — The Debug collapsible panel at the bottom of the left rail could be merged into the status bar. Status bar becomes an expandable debug surface: Click status bar → expands upward showing debug info, console output, system status. Collapses back to single line status bar. Removes need for Debug as a separate tab. Priority: UI polish pass.
- **Tile snap-to-group** — drag multiple tiles, snap them to a named group, move group together
- **Workspace version history** — undo/redo workspace layout changes independently of graph state
- **Lens-specific hotkeys** — different hotkey sets activate depending on active lens
- **Mini-map tile** — small overview tile showing where you are in a large graph

---

## QA and Testing

- **QA KEY AUTO-INCREMENT** — QA key should auto-increment on every accepted pass without requiring manual rotation. Passes without submitted reports: accepted-unverified (already in docs — needs code implementation). The qa-registry.ts CURRENT_QA_KEY constant and all five bundle files should update automatically as part of the commit acceptance workflow. Consider: a script that reads the last qaKey, increments it, and updates all five files atomically. Priority: medium — reduces manual rotation overhead.

---

## Source Adapters

- **Obsidian vault adapter** — wikilinks + backlinks + tags → graph
- **OpenAPI spec adapter** — endpoints, schemas, auth → graph
- **Git history adapter** — commit graph with author, file, and timing edges
- **Package.json dependency adapter** — npm dependency tree as a graph
- **Database schema adapter** — tables, columns, foreign keys → graph

---

## Audio and Signal

- **BPM detection from file metadata** — track.tempo from audio file tags drives physics tempo channel
- **Playlist-as-graph** — songs as nodes, artist/genre/mood edges
- **Signal Loom preset files** — save and share audio routing configurations as `.lwsignal.yaml`

---

## Agent and Familiar

- **Agent activity heatmap** — after a session, show which nodes were most touched as a heatmap overlay
- **Commit footprint** — each agent commit leaves a timestamped mark on the graph nodes it touched
- **Familiar appearance design** — visual design for Bandit and DeepSeek familiars in VR
- **Non-VR familiar card** — familiar appears as a card in Mission Control lens when VR is inactive

---

## Platform and Monetization

- **Patreon-exclusive themes** — premium visual dialect presets for Patreon supporters
- **Steam achievement system** — unlock titles, badges, and special node shapes for project milestones
- **One-click demo mode** — loads a curated self-graph fixture with animated flythrough for Steam page
- **Team sharing** — share workspace configurations and theme presets with collaborators

---

## Accessibility

- **High-contrast theme preset** — WCAG AAA compliant theme for low-vision users
- **Screen reader graph mode** — keyboard-navigable graph with ARIA labels derived from node metadata
- **Motion preference memory** — remember reduce-motion preference across sessions without storage contract being live

---

## Inbox Management

When an idea graduates to a real roadmap item, move it to BACKLOG_POLICY.md and delete it here. Do not duplicate items between the inbox and the backlog.
