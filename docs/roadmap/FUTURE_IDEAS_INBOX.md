---
id: inbox.future.ideas
title: Future Ideas Inbox
type: manual
status: active
version: v73c
domain: roadmap
cluster: teal
agent_readable: true
include_in_self_graph: false
last_updated: v73c
tags: [future, ideas, inbox, backlog, concept]
---

# Future Ideas Inbox

A holding area for ideas that are not yet roadmap items. Not a commitment. Not a backlog. A place to put things so they don't get lost.

Items here are promoted to the roadmap only when:
- A contract is written for them
- The user explicitly schedules them
- They become a dependency for active work

---

## Graph Intelligence

- **Cluster gravity** — hard gravity walls between neighborhoods, nodes orbit within cluster (proto-Galaxy mode)
- **Color-coded neighborhoods** — community detection driving brand cluster colors in graph
- **Edge confidence visualization** — edge thickness or opacity encodes confidence class (observed / inferred / ai-inferred)
- **Node importance rings** — high-weight nodes rendered with a subtle ring/corona to indicate weight
- **Graph diff view** — highlight nodes/edges that changed between two history slider positions
- **Cluster drag interaction** — Hold modifier key (Alt or Shift) + drag node → node and all directly connected neighbors move as a rigid unit with proportions locked, external edges stretch/compress naturally, on key release: force simulation resumes from new positions. Priority: after basic node dragging works. Relevant for: Helix dialect (moving constellation branches without breaking the backbone). Physics wiring order: 1. Fix static sunflower / force layout, 2. Wire repel + gravity controls, 3. Individual node drag, 4. Cluster drag with modifier key, 5. Physics dialect selection.
- **GRAPH ROTATION + PSEUDO-3D PROJECTION** — Right-click drag → rotate 2D graph coord space. Store helix node positions as true 3D (x, y, z). Project 3D → 2D with rotation matrix on Sigma. Animate projection angle on node selection. Auto-rotate to selected cluster centroid. No Three.js needed — pure projection math on existing Sigma 2D renderer. Three3d renderer (src/renderers/three3d/) is the future path for true 3D graphs. Priority: after cluster colors + graph density.
- **Advanced Physics Controls** — Add direct FA2 parameter controls to settings.schema.ts physics section: gravityStrength (0.001–1.0), fa2Iterations (10–500), fa2SlowDown (1–20), adjustSizes (boolean), strongGravityMode (boolean), linLogMode (boolean). These give users fine-grained control over ForceAtlas2 behavior beyond the current 3 sliders (nodeSize, linkDistance, repelForce, centerForce). Priority: after helix dialect stabilization.

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
