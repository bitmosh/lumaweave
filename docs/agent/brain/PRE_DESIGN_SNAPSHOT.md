---
id: pre.design.snapshot.v85e
title: Pre-Design Snapshot — v85e
type: snapshot
status: archived
version: v85e
cluster: violet
domain: agent
subdomain: brain
agent_readable: true
include_in_self_graph: false
last_updated: 2026-05-09
references:
  - agent.brain.experience.ledger
  - agent.brain.current.title
tags: [snapshot, v85e, pre-v86, archive, theme, renderer, settings]
---


# Pre-Design Snapshot — v85e

Date: 2026-05-07
Product: 0.6.0
QA Spine: v85e
Tests: 345 passing, 8 skipped, 0 failing

## Theme System State
- 6 themes: solar-plasma, obsidian-aurora, midnight-loom, void-circuit, agartha-dream, agartha-dusk
- Each theme has: nodeColorScale[6], edgeColorScale[6], full ThemeRuntimeTokens
- Colors assigned by degree centrality rank
- resetGraphStyles reads raw.color (preserved)

## Renderer State
- Sigma 2D: active, continuous FA2 physics
- Node renderer: NodeSphereProgram (sphere illusion)
- Three.js 3D: scaffolded, empty
- Physics dialects: default | helix | solar-orbit
- Custom physics: community gravity, sun repulsion

## Settings System State
- Schema version: 2
- Migration system: version-aware, runs on load
- Registry: clean, no dead entries, no Planned
- All physics params wired to UI

## Layout State
- Top bar: theme selector, Glitter, Reduce Motion
- Left panel: tab strip + accordion sections
- Graph canvas: Sigma WebGL, full viewport
- Right dock: Control Dock with icon bar
- useFixture: smart switching active (build-time __PLAYWRIGHT__ detection)

## Known Design Gaps (for v86 arc)
- Panel visual treatment: flat, needs depth
- Typography: Inter/system fonts, needs upgrade
- Node labels: basic, needs hierarchy
- Color system: functional, not expressive
- No CSS custom property bridge yet
- Three.js renderer: empty scaffold

## Design Constraints (immutable)
- Sigma canvas cannot be CSS-styled directly
- Node colors flow through graphology attributes
- Edge colors must go through raw.color
- resetGraphStyles reads raw.color as truth
- Physics runs in Web Worker thread
- Theme tokens are TypeScript objects not CSS vars

## Uncommitted Changes (as of v85e)
- package.json: version 0.5.0 → 0.6.0 (from v85d settings migration)
- src/fixtures/self-graph-generated.json: timestamp update (auto-regen)
- src/graph/schema/graph.types.ts: component diagnostics added (graphology-components)
- Untracked: FUTURE_IDEAS_INBOX.md, sphere-nodes-screenshot.png

## Test Environment Detection
- Method: Vite define + playwright.config webServer.env
- Build-time injection of __PLAYWRIGHT__ boolean
- Reliable across all routing configurations
- Replaces fragile URL param / user agent approaches
