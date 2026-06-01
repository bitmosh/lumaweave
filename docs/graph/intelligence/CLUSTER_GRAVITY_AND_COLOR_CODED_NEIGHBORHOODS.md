---
id: concept.graph.cluster.gravity
title: Cluster Gravity and Color-Coded Neighborhoods
type: concept
status: concept
version: v73c
domain: graph
subdomain: intelligence
cluster: azure
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-15
references:
  - physics.gwells.contract
  - dialect.physics.galaxy
  - policy.graph.visual
  - handleset.concept
  - theme.system.overview
tags:
  - cluster
  - gravity
  - neighborhoods
  - color
  - graph
  - intelligence
  - concept
---

# Cluster Gravity and Color-Coded Neighborhoods

> **Status (v86b):** This concept describes a *visual and behavioral
> target*, not an implementation plan. The runtime substrate is the
> **gwells** engine (see `docs/physics/GRAVITY_WELL_SYSTEM_CONTRACT.md`).
> Cluster-gravity physics will eventually be expressed as a gwells dialect
> with well types for cluster anchors and orbit members, plus typed
> interactions for gravity and inter-cluster repulsion. The closest
> existing dialect concept is Galaxy Mode (see `docs/canonical/DEFERRED_AND_POST_V1_VISION.md`, supersedes GALAXY_MODE_DIALECT.md).
>
> The visual aspects (color-coding, overlap modes, cluster labels) are
> independent of physics and remain on their own track.

---

## Concept

Important nodes/edges act as gravity centers. Graph distance, relationship strength, degree, weight, confidence, or importance score define boundaries. Clusters/neighborhoods receive color identities. Overlaps can blend, stripe, prioritize strongest gravity, or show mixed halos.

**Core idea:** Visualize graph structure through color-coded neighborhoods centered around important entities, making it easier to understand relationship clusters and community boundaries.

---

## Brand Cluster Colors (Canonical)

```
Blue   #4fa3e0  → core/primary systems
Purple #a67de8  → governance/contracts
Gold   #e0a84f  → active work/current
Teal   #4fd9c8  → future/planned
Green  #64d9a4  → accepted/stable
Gray   #6a7485  → archive/logs
```

These colors are also the helix physics dialect's neighborhood colors. The cluster identity is consistent across physics dialects, rendering layers, and the theme system.

---

## Dependencies

- **Importantness/weighting model:** Need a way to identify which nodes/edges are important (degree, centrality, confidence, or explicit importance data from graph artifacts)
- **Handleset registry:** Machine-readable handleset for cluster gravity controls
- **Theme token system:** Cluster color tokens must be part of the theme system
- **Stable depth/neighborhood traversal:** Must have stable integer depth/neighborhood traversal before adding cluster gravity
- **Cluster color tokens:** Theme tokens for cluster colors (primary, secondary, tertiary, etc.)
- **Gwells physics engine:** The cluster-gravity *physics* requires gwells dialect support. Gwells v0 ships with the radial-backbone family (horizontal-linear, vertical-parallel, helix-dual); cluster-gravity is a future dialect built on gwells well types and typed interactions. See `docs/physics/GRAVITY_WELL_SYSTEM_CONTRACT.md`.

## Possible Data Model

```typescript
type ClusterId = string;
type ClusterAnchor = string; // Node ID acting as gravity center
type ClusterMembership = Map<NodeId, ClusterId>; // Which cluster each node belongs to
type ClusterBoundary = number; // Distance threshold for cluster membership
type ClusterOverlapMode = "blend" | "stripe" | "prioritize-strongest" | "mixed-halo";

interface Cluster {
  id: ClusterId;
  anchor: ClusterAnchor;
  members: Set<NodeId>;
  boundary: ClusterBoundary;
  colorToken: string;
  importanceScore: number;
}

interface ClusterConfig {
  showColorCodedNeighborhoods: boolean;
  clusterGravityStrength: number;
  maxClusterRadius: number;
  clusterColorPalette: string[];
  overlapMode: ClusterOverlapMode;
  minClusterImportance: number;
  clusterLabelVisibility: boolean;
}
```

## Possible Future Controls

- **show color-coded neighborhoods** - Toggle cluster visualization on/off
- **cluster gravity strength** - How strongly important nodes pull neighbors into their cluster
- **max cluster radius** - Maximum distance from anchor for cluster membership
- **cluster color palette** - Color palette for cluster identities
- **overlap mode** - How to handle nodes in multiple clusters (blend, stripe, prioritize strongest, mixed halo)
- **minimum cluster importance** - Minimum importance score for a node to be a cluster anchor
- **cluster label visibility** - Show/hide cluster labels

## Phase Plan

**Phase 1: Docs/Types Only (Current)**
- Document concept and data model
- Define TypeScript types
- Add to Future Ideas Inbox

**Phase 2: Computed Clusters**
- Implement cluster computation algorithm
- Use degree or centrality as importance metric
- Compute cluster membership based on graph distance
- No visual rendering yet
- Feeds into gwells well-assignment predicate function (which node belongs to which well type) for any cluster-aware dialect

**Phase 3: Visual Overlay**
- Render cluster colors on nodes/edges
- Implement overlap modes
- Add cluster labels
- Wire to handleset controls

**Phase 4: Controls**
- Add cluster gravity controls to handleset
- Add cluster controls to UI
- Implement cluster color palette selector
- Implement overlap mode selector
- Note: physics-affecting controls (gravity strength, max cluster radius) become gwells dialect tunable handles; visual-only controls (color palette, overlap mode, label visibility) are independent

**Phase 5: Theme Integration**
- Integrate cluster colors into theme token system
- Support custom cluster color palettes
- Wire cluster colors to theme presets

**Phase 6: Advanced Semantic Clusters**
- Use explicit importance data from graph artifacts
- Use relationship strength/confidence for boundaries
- Implement semantic cluster detection (e.g., by file type, module, function)
- Add cluster-based layout algorithms (implemented as gwells dialects — e.g., Galaxy Mode; see `docs/canonical/DEFERRED_AND_POST_V1_VISION.md`)

## Explicit Non-Goals for Now

- **No runtime cluster computation** - This is documentation/types concept only
- **No graph recoloring** - Do not modify existing graph color logic
- **No new UI controls** - Do not add cluster controls to UI
- **No cluster-gravity physics yet** - The gwells engine is now the active physics substrate (replacing FA2), but cluster-gravity is a *future* gwells dialect. Do not add a cluster-gravity dialect to gwells until the prerequisites (computed clusters from Phase 2, importance scoring, gwells stability) are met.
- **No theme token changes** - Do not modify existing theme token system

## Notes

- This is a future concept for graph intelligence visualization
- Implementation should wait until stable integer depth/neighborhood traversal is proven
- Theme system should be implemented before cluster color integration
- Handleset registry should be used for cluster controls when implemented
- Gwells is the engine that will host any cluster-gravity physics; the data model in this doc is a *concept-level* spec that maps to gwells primitives (well types, interactions) at implementation time