---
id: vP-physics-baseline-reset
title: vP-Physics-Baseline-Reset — Investigation Report
type: report
status: investigation
cluster: azure
domain: graph
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-14
last_pass: vP-physics-baseline-reset
tags: [graph, physics, baseline, reset, investigation]
---

# vP-Physics-Baseline-Reset — Investigation Report

## Part A: Current Physics Default Values

File: `src/control-plane/settings/settings.defaults.ts`

**Lines 42-56:**
```typescript
physics: {
  physicsPreset: "balanced",
  qualityPreset: "balanced",
  nodeSize: 4,
  linkDistance: 3,
  repelForce: 100,
  centerForce: 200,
  communityGravity: 0.5,
  physicsDialect: "default" as const,
  // ForceAtlas2 advanced parameters
  strongGravityMode: false,
  linLogMode: false,
  adjustSizes: false,
  barnesHutTheta: 0.5,
}
```

**Summary:**
- nodeSize: 4
- linkDistance: 3
- repelForce: 100
- centerForce: 200
- communityGravity: 0.5
- simulationSpeed: Not present in settings
- physicsPreset: "balanced"

## Part B: Cluster-Sun Logic in buildGraphologyGraph.ts

File: `src/graph/renderers/sigma2d/buildGraphologyGraph.ts`

**Lines 189-214:**

```typescript
// Find the highest-degree node per cluster (the sun)
const clusterSuns = new Map<string, string>();
const clusterMaxDegree = new Map<string, number>();

graph.forEachNode((nodeId, attrs) => {
  const cluster =
    (attrs.raw as any)?.cluster ?? "gray";
  const deg =
    (centralityScores[nodeId] ?? 0) as number;
  if (!clusterSuns.has(cluster) ||
      deg > (clusterMaxDegree.get(cluster) ?? 0)) {
    clusterSuns.set(cluster, nodeId);
    clusterMaxDegree.set(cluster, deg);
  }
});

// Tag cluster suns as node attribute
clusterSuns.forEach((sunNodeId, cluster) => {
  graph.setNodeAttribute(sunNodeId, "isSun", true);
  graph.setNodeAttribute(sunNodeId, "cluster", cluster);
});

// Add suns to diagnostics/graph attributes
graph.setAttribute(
  "clusterSunCount", clusterSuns.size
);
```

**What it does:**
- Iterates all nodes, finds highest-degree node per cluster (using centralityScores)
- Tags those nodes with `isSun: true` and `cluster: <cluster_name>` attributes
- Stores count in graph-level attribute `clusterSunCount`

**Does it apply size boost or attribute that results in larger rendering?**
- **NO** - This logic only sets metadata attributes (`isSun`, `cluster`)
- It does NOT directly mutate the `size` attribute
- The visual giants must be coming from elsewhere

## Part C: Other Size-Mutation Passes After Centrality-Exclusion Block

File: `src/graph/renderers/sigma2d/buildGraphologyGraph.ts`

**Centrality-exclusion block (Pass 2's spine-sizing logic): Lines 135-155**

```typescript
graph.forEachNode((nodeId) => {
  const attrs = graph.getNodeAttributes(nodeId);
  const nodeType = attrs.nodeType || attrs.raw?.type;
  const baseSz = (attrs.baseSize as number) ?? 8;
  
  // Spine nodes: size based on child count (not centrality)
  if (nodeType === "spine") {
    const childCount = graph.degree(nodeId);
    const spineSize = baseSz * (1 + Math.log2(childCount + 1) * 0.3);
    graph.setNodeAttribute(nodeId, "size", spineSize * settings.nodeSize);
    graph.setNodeAttribute(nodeId, "baseSize", spineSize);
  } else {
    // Non-spine nodes: centrality boost
    const c = (centralityScores[nodeId] ?? 0) as number;
    const normalized = c / maxCentrality;
    // Blend: base size + up to 80% boost for most connected
    const newSize = baseSz * (1 + normalized * 0.8);
    graph.setNodeAttribute(nodeId, "size", newSize * settings.nodeSize);
    graph.setNodeAttribute(nodeId, "baseSize", newSize);
  }
});
```

**Search results for `setNodeAttribute.*size`:**
- Line 72: Initial node size setting (before centrality block)
- Line 144: Spine node size (in centrality-exclusion block)
- Line 152: Non-spine node size (in centrality-exclusion block)
- No other size mutations found

**Conclusion:**
- There are NO size-mutation passes AFTER the centrality-exclusion block
- All size mutations occur within the centrality-exclusion block (lines 135-155)
- The cluster-sun logic (lines 189-214) does NOT mutate size

## Root Cause Analysis

The visual giants are NOT caused by:
- Cluster-sun logic (only sets metadata)
- Additional size-mutation passes after centrality-exclusion (none exist)

Likely causes:
1. **settings.physics.nodeSize = 4** - This multiplier is applied to ALL sizes (lines 72, 144, 152). If base size is 8-10, nodeSize=4 multiplies to 32-40.
2. **Spine sizing formula** - `baseSz * (1 + Math.log2(childCount + 1) * 0.3) * settings.nodeSize` - For a spine with 19 children (like src.themes), this could be: 8 * (1 + log2(20) * 0.3) * 4 = 8 * (1 + 4.32 * 0.3) * 4 = 8 * 2.3 * 4 = 73.6

## AWAITING OPERATOR APPROVAL

Please review investigation findings and specify:
1. New default value for nodeSize (likely 1 instead of 4)
2. New default values for centerForce, repelForce, linkDistance (if needed)
3. Whether cluster-sun logic should be disabled or left as-is (it only sets metadata)
4. Any other changes to apply
