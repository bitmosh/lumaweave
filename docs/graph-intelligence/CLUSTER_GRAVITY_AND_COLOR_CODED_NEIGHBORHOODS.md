# Cluster Gravity / Color-Coded Neighborhoods

## Concept

Important nodes/edges act as gravity centers. Graph distance, relationship strength, degree, weight, confidence, or importance score define boundaries. Clusters/neighborhoods receive color identities. Overlaps can blend, stripe, prioritize strongest gravity, or show mixed halos.

**Core idea:** Visualize graph structure through color-coded neighborhoods centered around important entities, making it easier to understand relationship clusters and community boundaries.

## Dependencies

- **Importantness/weighting model:** Need a way to identify which nodes/edges are important (degree, centrality, confidence, or explicit importance data from graph artifacts)
- **Handleset registry:** Machine-readable handleset for cluster gravity controls
- **Theme token system:** Cluster color tokens must be part of the theme system
- **Stable depth/neighborhood traversal:** Must have stable integer depth/neighborhood traversal before adding cluster gravity
- **Cluster color tokens:** Theme tokens for cluster colors (primary, secondary, tertiary, etc.)

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

**Phase 5: Theme Integration**
- Integrate cluster colors into theme token system
- Support custom cluster color palettes
- Wire cluster colors to theme presets

**Phase 6: Advanced Semantic Clusters**
- Use explicit importance data from graph artifacts
- Use relationship strength/confidence for boundaries
- Implement semantic cluster detection (e.g., by file type, module, function)
- Add cluster-based layout algorithms

## Explicit Non-Goals for Now

- **No runtime cluster computation** - This is documentation/types concept only
- **No graph recoloring** - Do not modify existing graph color logic
- **No new UI controls** - Do not add cluster controls to UI
- **No physics changes** - Do not modify Sigma layout physics
- **No theme token changes** - Do not modify existing theme token system

## Notes

- This is a future concept for graph intelligence visualization
- Implementation should wait until stable integer depth/neighborhood traversal is proven
- Theme system should be implemented before cluster color integration
- Handleset registry should be used for cluster controls when implemented
