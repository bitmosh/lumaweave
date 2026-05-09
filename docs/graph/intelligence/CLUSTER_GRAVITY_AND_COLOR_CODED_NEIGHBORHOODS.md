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
last_updated: 2026-05-09
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

**Status:** Future concept — no implementation authorized

---

## Concept

Community detection (e.g. Graphology Louvain) assigns nodes to neighborhood clusters. Each cluster is assigned a brand color from the canonical cluster color system. Cluster gravity adds D3-force gravity wells that pull nodes toward their cluster center, creating visually distinct neighborhoods.

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

## Gravity Model (Concept)

```
Per cluster:
  - gravity center = centroid of cluster nodes
  - gravity strength = configurable (default: 0.3)
  - cluster repulsion = configurable (default: 200px radius)

Force simulation:
  - D3-force forceCluster() custom force per cluster
  - Each node pulled toward its cluster's centroid
  - Inter-cluster repulsion keeps clusters separated
  - Edge forces still apply within and between clusters
```

---

## Implementation Prerequisites

```
□ Community detection running reliably (Graphology louvain)
□ Cluster assignment stored in node attributes
□ Physics Dialect System contract accepted
□ D3-force custom force implementation tested on fixtures
□ Helix dialect implemented first (establishes the color system)
□ Galaxy mode prerequisite — cluster gravity is a simpler version
```

---

## Relationship to Physics Dialects

Cluster gravity is the foundational mechanism for both Constellation mode (loose gravity) and Galaxy mode (hard gravity). The cluster color system is shared across all physics dialects.

No implementation without explicit runtime contract.
