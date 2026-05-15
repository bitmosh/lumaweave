---
id: vP-physics-code-audit
title: vP-Physics-Code-Audit — Investigation Report
type: report
status: investigation
cluster: azure
domain: graph
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-14
last_pass: vP-physics-code-audit
tags: [graph, physics, audit, investigation, multipliers]
---

# vP-Physics-Code-Audit — Investigation Report

## Part A: Today's Git Log (Physics Code Changes)

**Command:** `git log --oneline --since="2026-05-14 00:00" -- src/graph/renderers/sigma2d/ src/graph/`

**Result:** No commits on 2026-05-14 (date may be in future or no commits today)

**Alternative (last 20 commits to sigma2d):**
```
cd1796e vP-Render-Pipeline-Refactor: enable multi-graph mode in buildGraphologyGraph
c9c6496 vP-Render-Pipeline-Refactor R5a + R5b: component memo + effect deps narrowing
e1c72d9 vP-Render-Pipeline-Refactor R5a: Consumer-layer memoization of theme tokens
54e11a8 vP-Render-Pipeline-Refactor R1 + R2: ResizeObserver guard + v86b ref pattern
c3d7928 vP-Render-Pipeline-Refactor R1: ResizeObserver zero-width guard
b7faeab vP-Self-Graph-Regen Phase 2: SELF_GRAPH_SCHEMA.md v1 contract
6ee4b1e chore: v86b cleanup + test stability
7533447 feat: vP-Forensics-1 — Test Failure Forensics skill + 6 forensics files + 2 production bugs filed
3890f82 chore: v86b partial accept cleanup — remove diagnostic logs, update brain docs
be0a0f8 feat: v86b Visual Treatment (partial) — sphere uniforms, overlays, schema v80
d4cb8e4 chore: architecture cleanup — console purge + token cleanup + registry
7d99389 feat: custom Sigma node renderer — sphere illusion
e2d29bc feat: Solar Orbit dialect Phase 1
2a6831e feat: theme-driven node color scale by centrality rank
cfa787c feat: graphology-components — disconnected subgraph detection
8c455ad feat: physics cleanup — community gravity + preset sync + registry
5c835ca fix: physics preset slider sync — prestige pass streak 28
826b503 chore: dead file purge + App.css scaffold cleanup
11f9a9c fix: edge visibility + Sigma lifecycle stability
```

## Part B: buildGraphologyGraph.ts Recent History

**Command:** `git log --oneline -10 -- src/graph/renderers/sigma2d/buildGraphologyGraph.ts`

**Result:**
```
cd1796e vP-Render-Pipeline-Refactor: enable multi-graph mode in buildGraphologyGraph
d4cb8e4 chore: architecture cleanup — console purge + token cleanup + registry
e2d29bc feat: Solar Orbit dialect Phase 1
2a6831e feat: theme-driven node color scale by centrality rank
cfa787c feat: graphology-components — disconnected subgraph detection
826b503 chore: dead file purge + App.css scaffold cleanup
8529648 feat: continuous FA2 physics loop via Web Worker
d79a911 feat: degree centrality node sizing via graphology-metrics
78f5c20 feat: noverlap anti-collision pass after ForceAtlas2
be18b56 feat: Louvain community detection for helix dialect
```

**Key deletions (from git diff HEAD~10):**
- noverlap import deleted
- louvain import deleted
- getSunflowerPosition function deleted (~30 lines)
- groupByCluster function deleted (~15 lines)
- mapCommunityToCluster function deleted (~15 lines)
- assignLouvainCommunities function deleted (~20 lines)
- getHelixPosition function deleted (~20 lines)
- getBranchPosition function deleted (~15 lines)
- applyHelixLayout function deleted (~40 lines)

## Part C: Multipliers / Coefficients / Hardcoded Numbers

### buildGraphologyGraph.ts

| File:Line | Variable / Formula | Current Value | Best Guess at "Sane Default" |
|-----------|--------------------|--------------|------------------------------|
| 59 | baseSize = 10 | 10 | Unsure - was this always 10? |
| 72 | size = ((node.raw?.size as number) ?? baseSize) * settings.nodeSize | Multiplier: settings.nodeSize | settings.nodeSize currently 4 (too high?) |
| 98 | layoutScale: Math.sqrt(nodes.length) * 50 | 50 multiplier | Instrumentation only, not physics |
| 120 | edge size: (edge.raw?.size as number) ?? 1.5 | 1.5 | Seems reasonable |
| 138 | baseSz = (attrs.baseSize as number) ?? 8 | 8 | Why two different baseSize values (10 vs 8)? |
| 143 | spineSize = baseSz * (1 + Math.log2(childCount + 1) * 0.3) | 0.3 boost coefficient | Possibly 0.2 or 0.15 |
| 151 | newSize = baseSz * (1 + normalized * 0.8) | 0.8 boost coefficient | Possibly 0.5 or 0.3 |

### SigmaGraphView.tsx (FA2 Settings Block)

| File:Line | Variable / Formula | Current Value | Best Guess at "Sane Default" |
|-----------|--------------------|--------------|------------------------------|
| 610 | gravity = Math.max(0.001, centerForce * 0.05) | 0.05 multiplier | Unsure - was this always 0.05? |
| 611 | scalingRatio = Math.max(0.1, repelForce * 0.1) | 0.1 multiplier | Unsure - was this always 0.1? |
| 612 | slowDown = Math.max(1, linkDistance * 1) | 1.0 multiplier | Seems reasonable (no change) |
| 618 | edgeWeightInfluence: 1 | 1 | Added in Pass 2 for weighted FA2 mode |

## Part D: Cluster-Sun Logic

**Location:** buildGraphologyGraph.ts lines 189-214

**What it does:**
- Iterates all nodes, finds highest-degree node per cluster (using centralityScores)
- Tags those nodes with `isSun: true` and `cluster: <cluster_name>` attributes
- Stores count in graph-level attribute `clusterSunCount`

**Does it apply size boost or attribute that results in larger rendering?**
- **NO** - This logic only sets metadata attributes (`isSun`, `cluster`)
- It does NOT directly mutate the `size` attribute
- The visual giants must be coming from the `settings.nodeSize = 4` multiplier applied to all sizes

## Part E: Size-Mutation Passes After Centrality-Exclusion Block

**Centrality-exclusion block (Pass 2's spine-sizing logic):** Lines 135-155

**Search results for `setNodeAttribute.*size`:**
- Line 72: Initial node size setting (before centrality block)
- Line 144: Spine node size (in centrality-exclusion block)
- Line 152: Non-spine node size (in centrality-exclusion block)
- No other size mutations found

**Conclusion:**
- There are NO size-mutation passes AFTER the centrality-exclusion block
- All size mutations occur within the centrality-exclusion block (lines 135-155)
- The cluster-sun logic (lines 189-214) does NOT mutate size

## Part F: Deleted Code References

### Louvain
- **Status:** Clean
- **References found:** Only in advisory-registry.ts as a future suggestion ("Install graphology-communities-louvain")
- **Dead code:** None - implementation was fully deleted
- **Dangling imports:** None

### Helix
- **Status:** Partially clean
- **References found:**
  - buildGraphologyGraph.ts:26: Type definition `physicsDialect: "default" | "helix" | "solar-orbit"`
  - SigmaGraphView.tsx:50: Type definition `physicsDialect: "default" | "helix" | "solar-orbit"`
  - seedFunctionRegistry.ts:19: Type definition `physicsDialect?: "default" | "helix" | "solar-orbit"`
  - directoryBackboneSeeder.ts:22: Type definition `physicsDialect?: "default" | "helix" | "solar-orbit"`
  - settings.schema.ts:26-27: LayoutLensId includes "helix" and "trihelix"
  - settings.schema.ts:43: Comment references helix removal
  - settings.migrations.ts:92-95: Migration that rewrites helix → default
  - feature-flags.ts:10,22: Feature flag "helixLayouts" set to false
  - advisory-registry.ts:1953: Advisory mentions helix dialect
- **Dead code:** Implementation functions deleted (getHelixPosition, applyHelixLayout)
- **Dangling imports:** None
- **Recommendation:** Remove "helix" from type definitions in LayoutLensId and physicsDialect unions (except settings.migrations.ts which needs it for the migration)

### Sunflower
- **Status:** Clean
- **References found:** AppShell.tsx:359,370: String value "layout: sunflower" (not dead code, just a string)
- **Dead code:** Implementation function getSunflowerPosition deleted
- **Dangling imports:** None

### Noverlap
- **Status:** Clean
- **References found:** None
- **Dead code:** Implementation deleted
- **Dangling imports:** None (import removed in commit cd1796e)

## Part G: Additional Findings

### Inconsistent baseSize Values
- Line 59: baseSize = 10
- Line 138: baseSz = (attrs.baseSize as number) ?? 8
- **Issue:** Two different base values used in different contexts
- **Recommendation:** Standardize on one value (likely 8 or 10)

### settings.nodeSize Multiplier Applied Everywhere
- Line 72: Initial size = baseSize * settings.nodeSize
- Line 144: Spine size = spineSize * settings.nodeSize
- Line 152: Non-spine size = newSize * settings.nodeSize
- **Current settings.nodeSize:** 4 (from settings.defaults.ts)
- **Impact:** With baseSize=8-10 and nodeSize=4, nodes are 32-40 units before any boost
- **Recommendation:** Reduce settings.nodeSize to 1 or 2

### Spine Sizing Formula
- Formula: baseSz * (1 + Math.log2(childCount + 1) * 0.3) * settings.nodeSize
- Example (src.themes with 19 children): 8 * (1 + log2(20) * 0.3) * 4 = 8 * (1 + 4.32 * 0.3) * 4 = 8 * 2.3 * 4 = 73.6
- **Issue:** 0.3 boost coefficient + nodeSize=4 multiplier = very large spines
- **Recommendation:** Reduce 0.3 to 0.15-0.2, and/or reduce settings.nodeSize

### Centrality Boost Formula
- Formula: baseSz * (1 + normalized * 0.8) * settings.nodeSize
- **Issue:** 0.8 boost coefficient + nodeSize=4 multiplier = very large connected nodes
- **Recommendation:** Reduce 0.8 to 0.3-0.5, and/or reduce settings.nodeSize

## AWAITING OPERATOR APPROVAL

Please review investigation findings and direct specific rollbacks/changes:

1. **settings.nodeSize default:** Reduce from 4 to 1 or 2?
2. **Spine boost coefficient (0.3):** Reduce to 0.15 or 0.2?
3. **Centrality boost coefficient (0.8):** Reduce to 0.3 or 0.5?
4. **FA2 multipliers (0.05, 0.1):** Leave as-is or adjust?
5. **baseSize inconsistency:** Standardize on 8 or 10?
6. **Helix type definitions:** Remove from LayoutLensId and physicsDialect unions?
7. **Any other rollbacks needed?**

**DO NOT CHANGE ANY CODE YET** - Investigation report is the deliverable. Awaiting operator direction.
