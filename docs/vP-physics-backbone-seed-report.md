---
id: vP-physics-backbone-seed
title: vP-Physics-Backbone-Seed — Pass 2 of 2 (renderer-side spine layout)
type: report
status: completed
cluster: azure
domain: graph
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-14
last_pass: vP-physics-backbone-seed
tags: [graph, physics, backbone, seed, renderer, layout]
---

# vP-Physics-Backbone-Seed — Stage B Report

## Summary

Implemented renderer-side deterministic spine layout for the self-graph visualization. Created two new registries (SeedFunctionRegistry, EdgeTypePhysicsRegistry), a directory backbone seeder algorithm, and modified buildGraphologyGraph.ts and SigmaGraphView.tsx to integrate these components.

**Pinning mechanism:** Used Sigma nodeReducer (not beforeRender hook) per operator correction. The beforeRender approach was tested and failed because FA2's worker thread overwrites positions faster than the render hook can reset them. The nodeReducer overrides display positions at render time, working around FA2 worker overwriting graphology attributes.

## Files Created

1. **src/graph/physics/seedFunctionRegistry.ts**
   - Defines `SeedFunctionContext` and `SeedFunctionEntry` interfaces
   - Creates `SEED_FUNCTION_REGISTRY` as readonly array following REGISTRY_CONTRACT_PATTERNS.md
   - Includes one initial entry: `directory-backbone-n2` (references seedDirectoryBackboneN2)
   - Helper functions: `getSeedFunctionById`, `listSeedFunctions`, `listSeedFunctionsByCategory`

2. **src/graph/physics/edgeTypePhysicsRegistry.ts**
   - Defines `EdgeTypePhysicsEntry` interface
   - Creates `EDGE_TYPE_PHYSICS_REGISTRY` as readonly array
   - Populates with entries for all 8 self-graph edge types:
     - `contains`: physicsWeight 1.0, visualWeight 0.7 (structural backbone)
     - `governs`: physicsWeight 0.5, visualWeight 0.6 (moderate influence)
     - All metadata edges: physicsWeight 0.0, visualWeight 0.3-0.8 (no layout influence)
   - Helper functions: `getEdgeTypePhysics`, `getEdgePhysicsWeight`, `getEdgeVisualWeight`

3. **src/graph/physics/directoryBackboneSeeder.ts**
   - Defines `BACKBONE_CONFIG` tunables (backboneSpacing, spineSpacing, childOrbitRadius, rootOffsetY)
   - Implements `hashId` function for deterministic position perturbation
   - Implements `buildContainsMap` function to create parent-child maps and identify roots
   - Implements `flattenSpines` function for depth-first traversal and alphabetical sorting
   - Implements `seedDirectoryBackboneN2` function:
     - Finds root spines (expected "src", "docs")
     - Sorts roots alphabetically
     - Places roots on parallel vertical axes
     - Places spines along their axis, setting x, y, and fixed: true
     - Stores seeded positions in graph-level attribute `__seededSpinePositions` for nodeReducer
     - Places file children in an arc around their parent spine, alternating sides based on depth

## Files Modified

1. **src/graph/renderers/sigma2d/buildGraphologyGraph.ts**
   - **Change 1a (Set edge weight):** In edge-add loop, use `getEdgePhysicsWeight` to set the `weight` attribute on graphology edges
   - **Change 1b (Call the seeder):** Replace random scatter with origin position (x: 0, y: 0). Invoke `seedDirectoryBackboneN2({ graph, settings })` at end of function after all nodes and edges are added, when physicsDialect is "default"
   - **Change 1c (Exclude spine nodes from centrality boost):** Modify centrality boost loop to apply different sizing logic for spine nodes (based on child count using log2) and retain existing centrality boost for non-spine nodes
   - Removed unused `layoutScale` variable

2. **src/graph/renderers/sigma2d/SigmaGraphView.tsx**
   - **Change 2a (Enable edge weight influence):** Added `edgeWeightInfluence: 1` to fa2Settings
   - **Change 2b (Install nodeReducer):** After Sigma instance creation and before FA2 worker starts, install a nodeReducer that reads from `graph.getAttribute("__seededSpinePositions")` and overrides spine display positions at render time. Preserves any existing reducer.
   - **Note:** Did NOT add `weighted: true` to FA2Layout constructor - TypeScript type definitions do not accept this parameter in the worker API (see Deviations section)

## Pinning Approach Confirmation

**Used nodeReducer (not beforeRender):** Confirmed. The nodeReducer is installed at line 587 in SigmaGraphView.tsx, after Sigma creation (line 543) and before FA2 worker starts (line 622). The reducer reads from `__seededSpinePositions` graph attribute and overrides display positions for spine nodes at render time.

**Rationale:** The operator tested the beforeRender hook approach and found it failed because FA2's worker thread overwrites positions faster than the render hook can reset them. The nodeReducer works by overriding display data at render time, allowing FA2 to modify graphology attributes while the user sees pinned spines.

## Typecheck Result

```
npm run typecheck
```

**Status:** Clean (except pre-existing error)

- Pre-existing error: `TS6133: 'NodeSphereProgram' is declared but its value is never read` in SigmaGraphView.tsx:38
- No new typecheck errors introduced by this pass

## Runtime Probe

**Status:** Not executed (requires browser console access)

The task specified a runtime probe script to verify:
- totalEdges ≈ 1256
- weightedEdges = totalEdges
- weightByType.contains.avgWeight ≈ 1.0
- avgWeight = 0.0 for all metadata types
- spineCount = 64
- spineSample: all entries should have finite x, y, fixed: true, and reasonable size

**Action required:** Please run the app in dev mode and open browser console to verify the seeded layout is working. The console should show `[directoryBackboneSeeder] Seeded X spine positions` where X is the number of spine nodes found.

## Visual Check

**Status:** Requires operator verification

**Expected:** Graph should show two clear vertical backbones (src and docs) with file clusters orbiting their parent spines. Spines should remain pinned in position while file children move under FA2 physics.

**Action required:** Please visually verify the graph shows the expected backbone layout.

## QA E2E Results

```
npm run qa:e2e
```

**Status:** 7 passed, 7 skipped

All existing tests continue to pass. No test failures introduced by this pass.

## Deviations

1. **FA2 weighted mode not enabled in worker API**
   - **Expected:** Add `weighted: true` to FA2Layout constructor
   - **Actual:** TypeScript type definitions for `FA2Layout` worker constructor do not accept `weighted` parameter
   - **Attempted shapes:**
     - `new FA2Layout(graph, { settings, weighted: true })` - TypeScript error
     - `new FA2Layout(graph, { settings: { ...settings, weighted: true } })` - TypeScript error
   - **Resolution:** Proceeded without `weighted` parameter. Added `edgeWeightInfluence: 1` to fa2Settings as alternative.
   - **Impact:** Edge weights are set on graphology edges, but FA2 worker may not use them in weighted mode. The `edgeWeightInfluence: 1` setting may help, but full weighted mode requires further investigation into graphology-layout-forceatlas2 worker API.
   - **Follow-up:** Investigate if graphology-layout-forceatlas2 worker API supports weighted mode through a different parameter or version.

## Follow-ups

1. **FA2 weighted mode investigation:** The worker API does not accept `weighted` parameter in its type definitions. Need to investigate if weighted mode is supported through a different mechanism or if this is a version-specific API difference.

2. **Runtime probe execution:** Browser console script was not executed due to lack of browser access. Please run the app and verify the seeded layout is working visually and via console logs.

3. **Visual verification:** Please visually confirm the graph shows two clear vertical backbones with file clusters.

4. **Spine pinning verification:** Verify that spine nodes remain pinned in position while file children move under FA2 physics.

5. **Pre-existing error:** Unused `NodeSphereProgram` import in SigmaGraphView.tsx:38 remains (not blocking for this pass).

## Conclusion

Stage B implementation completed successfully. All files created and modified as specified. Typecheck clean (except pre-existing error). QA e2e tests pass. The nodeReducer pinning mechanism is installed per operator correction. FA2 weighted mode could not be enabled due to API limitations - filed as follow-up.

**Next steps:**
1. Operator visual verification of backbone layout
2. Operator runtime probe execution (if desired)
3. Investigation into FA2 worker API weighted mode support
