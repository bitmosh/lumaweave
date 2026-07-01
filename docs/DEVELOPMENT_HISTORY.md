---
id: system.lumaweave.development-history
title: LumaWeave Development History
type: history
status: complete
domain: overview
cluster: stone
agent_readable: true
include_in_self_graph: true
last_updated: 2026-06-30
references:
  - system.lumaweave.current-status
  - system.lumaweave.roadmap
tags: [history, architecture, milestones]
---

# LumaWeave Development History

This is a compressed engineering narrative. Git history remains the detailed record.

## Foundation

LumaWeave began as a Tauri/React graph workspace and progressively separated product concerns into typed domains: graph rendering, themes, settings, commands, tiles, source adapters, and physics. The project moved from fixed panels and ad hoc state toward registries, persistent settings migrations, and explicit runtime boundaries.

## Visual and interaction system

The graph renderer standardized on Graphology and Sigma 3. Custom WebGL node programs introduced glass-sphere, sun, crystal, orb, and pip materials, with a custom plasma edge program. Theme work established primitive, semantic, and component token tiers alongside runtime tokens, scoped overrides, accessibility checks, and OKLCH transition support.

The workspace evolved into draggable, resizable, snapping, grouped tiles. A minimap added snapshot rendering, viewport projection, click/drag navigation, and zoom. The inspector evolved from an SVG/physics experiment into a fixed HTML/CSS radial wheel with eight registry-driven spokes. Color, geometry, provenance, override application, and override history became working surfaces; Type and Motion added honest read-only/reference functionality.

## Source-adapter platform

The initial self-graph fixture was followed by a registry-driven loader platform:

- Settings gained active-source and per-adapter configuration.
- Tauri gained bounded project reads, directory traversal, user-file reads, and allowlisted script dispatch.
- The loader path became `loadSource(adapterId)` plus registry lookup and saved configuration.
- Markdown vault, Cytoscape JSON, package.json dependency, and CSV edge-list adapters gained loaders, forms, fixtures, and targeted Playwright tests.

Candidate catalog entries remain intentionally separate from registered loaders.

## Reliability and product boundaries

The application added an error boundary, identity cleanup, settings migrations, developer-mode gating for internal surfaces, theme export, inference-backend seams, and a remote agent-chat client. Test work split large specifications and replaced some fixed waits, but attempts to run the whole E2E suite in GitHub Actions exposed unresolved Vite/Playwright cold-start and timeout behavior. CI currently enforces CSS linting and typechecking.

## GWells

GWells replaced the previous graph layout path with a standalone registry-based engine. Its core model combines well types, interactions, seed functions, and dialects behind `applyDialect()`.

Subsequent work added:

- Edge-aware interactions and seed adherence.
- Pinning and per-dialect tuning state.
- Structural, source-agnostic fallback classification.
- Orphan and root-placement safety.
- Pause, resume, stop, manual step, scheduler injection, runtime state, and debug events.
- Interaction indexing and deterministic benchmark fixtures.

The current engine remains two-dimensional and biased toward containment layouts. Profiles, recommendations, universal layouts, and full 3D integration remain future work.

## Documentation consolidation

Early development produced detailed per-pass prompts, reports, forensic notes, and internal agent process records. They were useful during rapid iteration but obscured the stable architecture. The current documentation set now favors a public README, one status document, a short roadmap, durable domain docs, and this compressed history.
