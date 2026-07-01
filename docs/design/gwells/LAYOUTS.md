---
id: design.gwells.layouts
title: GWells Layouts
type: design
status: concept
domain: physics
cluster: azure
agent_readable: true
include_in_self_graph: true
last_updated: 2026-06-30
references:
  - domain.physics.gwells
  - design.gwells.profiles-controls
  - design.gwells.runtime-validation
tags: [gwells, layouts, seeds, future]
---

# GWells Layouts

This document consolidates the seed-layout and layout-matrix direction. Radial-backbone and parallel-spines are implemented; the remaining layouts are planned.

## Current layouts

### Radial backbone

Containment roots/spines are distributed around the graph, directories branch outward, and leaf nodes orbit containers using deterministic angular placement. Root crowding uses hub-ring behavior; unseeded nodes receive structural fallback placement.

### Parallel spines

The same well/interaction model is seeded into parallel structural axes. It remains a compatibility layout for hierarchical graphs.

Both layouts currently derive most of their visual grammar from `contains` relationships and explicit/structural role classification.

## Planned layouts

### Universal Balanced

Default for mixed or weakly typed data:

- Does not require a spine node.
- Separates disconnected components.
- Places hubs and bridges before leaves.
- Avoids origin collapse.
- Produces bounded, deterministic initial positions.

### Hierarchical Containment

A more source-neutral replacement for filesystem-shaped assumptions:

- Supports multiple roots and deep containers.
- Makes containment direction legible.
- Separates sibling subtrees.
- Handles direct leaves and sparse branches.

### Knowledge Garden

For Markdown/knowledge graphs:

- Notes are primary bodies.
- Tags and aliases are secondary structures.
- Backlink hubs receive space without dominating.
- Orphans remain visible as a distinct outer group.

### Document Library

For long-form/document sources:

- Documents, sections, pages, citations, and references receive distinct roles.
- Cross-document references remain visible without collapsing section hierarchy.

### Web Domain Map

For crawled sites:

- Domains/subdomains anchor the graph.
- Pages form path-aware groups.
- Assets remain lightweight leaves.
- Cross-domain links remain visually distinct.

### Semantic Constellation

For inferred or embedding-derived structure:

- Cluster centers organize concepts.
- Bridge nodes expose cross-cluster relationships.
- Confidence can influence visual/physics strength without pretending inferred edges are observed.

### Imported Position Preserve

For formats such as Cytoscape JSON:

- Retain valid source coordinates.
- Fit/normalize without destroying relative geometry.
- Seed only missing or invalid positions.
- Make reseeding an explicit action.

## Analysis inputs

Future recommendation logic should use measurable graph properties:

- Node and edge counts.
- Connected-component distribution.
- Degree distribution and hub concentration.
- Containment coverage and depth.
- Directedness.
- Existing-position coverage.
- Orphan ratio.
- Adapter/source hints.
- Inferred-versus-observed edge ratio.

Recommendations must include reasons and warnings, not only a score.

## Seed invariants

Every layout must:

- Be deterministic for the same graph and parameters.
- Produce finite coordinates for every unpinned node.
- Avoid accidental placement at the origin.
- Handle empty, singleton, disconnected, and no-spine graphs.
- Preserve pins unless the caller explicitly clears them.
- Bound output scale relative to graph size.
- Record enough diagnostics to explain its branch decisions.

## 3D boundary

Seed layouts may produce `z`, but current physics and rendering are 2D. A future 3D layout must be evaluated with a real 3D integrator and renderer; storing `z` alone is not a 3D feature.
