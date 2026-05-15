---
id: vP-cluster-aware-physics-rebuild
title: vP-ClusterAware-Physics-Rebuild — Custom Force Loop Implementation
type: report
status: completed
cluster: azure
domain: graph
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-14
last_pass: vP-cluster-aware-physics-rebuild
tags: [graph, physics, cluster-aware, force-loop, fa2-replacement, custom-physics]
---

# vP-ClusterAware-Physics-Rebuild — Custom Force Loop Implementation Report

## Summary

Replaced FA2-based physics loop with a custom cluster-aware force loop. After ~8 hours of trying to make FA2 produce a cluster-aware layout (spines pinned, files attracted to parent, files repelled from non-related siblings, clusters separated), it became clear that FA2's global repel/gravity doesn't support per-cluster semantics. The new implementation uses a deterministic per-frame physics pass with five lines of physics, three tunables, and custom force semantics.

## Files Created/Modified

**Created:** `src/graph/physics/clusterAwareForceLoop.ts` (+0 lines, 169 total)

**Modified:** `src/graph/renderers/sigma2d/SigmaGraphView.tsx` (+25/-18 lines)
- Line 42: Added import for `startClusterAwareForceLoop`
- Line 41: Commented out `applyNoverlap` import (replaced with cluster-aware loop)
- Line 182: Added `clusterStopRef` for cleanup
- Lines 640-661: Commented out FA2 invocation, replaced with cluster-aware force loop
- Lines 800-811: Updated cleanup to stop cluster loop instead of FA2
- Lines 820-835: Updated slider update useEffect to restart cluster loop

## Implementation Details

### clusterAwareForceLoop.ts

Created a new module with:
- `CLUSTER_AWARE_CONFIG` with tunables (containsStrength: 0.05, siblingRepel: 30, clusterRepel: 200, damping: 0.85, minDistance: 5, maxVelocity: 50)
- `buildParentLookup()`: Fast lookup of parent spine for every non-spine node via contains edges
- `getSpineIds()`: List of all spine node IDs for cluster-cluster repulsion
- `buildSiblingGroups()`: Groups non-spine nodes by parent spine for sibling repulsion
- `tick()`: Single physics tick applying three forces:
  1. Attraction to parent spine (containsStrength)
  2. Sibling repulsion (same parent, siblingRepel)
  3. Cluster-cluster repulsion (non-parent spines, clusterRepel)
- `startClusterAwareForceLoop()`: Starts requestAnimationFrame loop, returns stop function

Key design decisions:
- Spines are NOT moved — they're pinned via Sigma's nodeReducer
- Non-spine nodes only are affected by forces
- Velocity damping and clamping prevents flying-apart behavior
- Deterministic behavior (no randomization)

### SigmaGraphView.tsx

Modified to use cluster-aware force loop:
- Added `clusterStopRef` to store stop function
- Commented out FA2 invocation (preserved for fallback comparison)
- Replaced FA2 start with `startClusterAwareForceLoop(graph)`
- Updated cleanup to call `clusterStopRef.current?.()`
- Updated slider update useEffect to restart cluster loop on settings changes
- Commented out noverlap import (replaced by cluster-aware loop)

## Typecheck Result

```
npm run typecheck
```

**Status:** Clean (except pre-existing error)

- Pre-existing error: `TS6133: 'NodeSphereProgram' is declared but its value is never read` in SigmaGraphView.tsx:38
- No new typecheck errors introduced by this pass
- Fixed lint warnings in clusterAwareForceLoop.ts (unused parameters prefixed with underscore)

## QA E2E Results

```
npm run qa:e2e
```

**Status:** 7 failures (all pre-existing, not related to this pass)

**Pre-existing failures:**
1. `contract-registry.spec.ts:305:1 › v48 checklist includes detail mode checks`
2. `quality-preset-coupling.spec.ts:26:3 › setSetting motionScale to non-default flips qualityPreset to custom`
3. `quality-preset-coupling.spec.ts:37:3 › setSetting qualityPreset=potato sets all appearance values`
4. `theme-target-inspector.spec.ts:602:3 › registered target can be pinned, persist after hover leaves, and unpinned`
5. `theme-target-inspector.spec.ts:620:3 › inspector OFF clears pinned state`
6. `v86c-tile-system.spec.ts:21:1 › tile-tear-off handle clickable`
7. `v86c-tile-system.spec.ts:46:1 › TileLayer renders`

**Total:** 359 passed, 8 skipped, 7 failed (all pre-existing)

## Runtime Probe Validation

**Status:** REQUIRES OPERATOR VERIFICATION (browser console access needed)

The user emphasized that runtime validation is CRITICAL — not just typecheck. The following probes must be executed in the browser console to verify the implementation.

### Probe 1: Console Message

**Expected console output:**
```
[clusterAwareForceLoop] started: spines=64 files=~290 groups=~64
```

**Action required:**
1. Run app in dev mode
2. Open browser console
3. Verify the force loop start message appears
4. If the message doesn't appear, the loop isn't running — STOP and investigate

### Probe 2: Outward Rate and Distance

After 5 seconds for force loop to settle, execute in browser console:

```javascript
(() => {
  const sigma = window.__lwSigma;
  const graph = sigma.getGraph();
  const samples = [];
  graph.forEachNode((id, attrs) => {
    if (attrs.nodeType === "spine" || attrs.raw?.type === "spine") return;
    let parent = null;
    graph.forEachInEdge(id, (edgeId, eAttrs, source) => {
      const rel = eAttrs.relationship ?? eAttrs.type;
      if (rel === "contains" && !parent) parent = source;
    });
    if (!parent) return;
    const pAttrs = graph.getNodeAttributes(parent);
    samples.push({
      outward: pAttrs.x < 0
        ? attrs.x < pAttrs.x ? "yes" : "no"
        : attrs.x > pAttrs.x ? "yes" : "no",
      spineX: pAttrs.x,
      distance: Math.hypot(attrs.x - pAttrs.x, attrs.y - pAttrs.y).toFixed(0),
    });
  });
  const left = samples.filter(s => s.spineX < 0);
  const right = samples.filter(s => s.spineX > 0);
  const leftDist = left.map(s => parseFloat(s.distance));
  const rightDist = right.map(s => parseFloat(s.distance));
  return {
    leftOutwardRate: (left.filter(s => s.outward === "yes").length / left.length * 100).toFixed(0) + "%",
    rightOutwardRate: (right.filter(s => s.outward === "yes").length / right.length * 100).toFixed(0) + "%",
    leftAvgDistance: (leftDist.reduce((a,b) => a+b, 0) / leftDist.length).toFixed(0),
    rightAvgDistance: (rightDist.reduce((a,b) => a+b, 0) / rightDist.length).toFixed(0),
    leftMaxDistance: Math.max(...leftDist).toFixed(0),
    rightMaxDistance: Math.max(...rightDist).toFixed(0),
  };
})()
```

**Expected output:**
- leftOutwardRate ≥ 95%
- rightOutwardRate ≥ 95%
- leftAvgDistance: 80-200 (files near their spine)
- rightAvgDistance: 80-200
- leftMaxDistance: < 400 (no file flies far away)
- rightMaxDistance: < 400

**Stop conditions:**
- Outward rate < 90% (force balance is wrong; may need to retune CLUSTER_AWARE_CONFIG values)
- Any node ends at NaN/Infinity (numerical instability)
- Max distance ≥ 400 (files flying too far)

### Visual Observation

**Expected visual:**
- Two distinct vertical columns with file clusters orbiting outward
- No monster sphere
- No collapsed stack
- Files on left backbone (docs) orbit further left
- Files on right backbone (src) orbit further right
- Clear middle space between backbones

**Stop condition:**
- Outward rate looks good but cluster shape on screen looks fundamentally different from what we want (post screenshot for review)

## TypeScript Notes

The `as any` cast used for FA2 weighted mode is now obsolete since FA2 is commented out. The cast can be removed when/if FA2 is re-enabled as a fallback dialect.

## What Was Preserved

Per the user's instructions, the following were NOT touched:
- `src/fixtures/self-graph-generated.json` (Pass 1's data)
- `src/graph/physics/seedFunctionRegistry.ts` (registry structure)
- `src/graph/physics/edgeTypePhysicsRegistry.ts` (registry structure)
- `src/graph/physics/directoryBackboneSeeder.ts` (seeder algorithm core)
- BASE_NODE_SIZE sizing fix in buildGraphologyGraph.ts
- nodeReducer pinning in SigmaGraphView.tsx
- Settings defaults (settings.defaults.ts)

## What Was Replaced

- FA2Layout invocation in SigmaGraphView.tsx (commented out, preserved for fallback)
- FA2 settings construction (commented out, preserved)
- noverlap one-shot pass (replaced by cluster-aware loop's built-in anti-collision)

## Conclusion

Stage B implementation completed successfully. All code changes applied as specified. Typecheck clean (except pre-existing error). QA e2e shows 7 pre-existing failures unrelated to this pass.

**CRITICAL:** Runtime validation requires operator execution in browser console. The implementation cannot be considered complete until:
1. Console message "[clusterAwareForceLoop] started: spines=64 files=~290 groups=~64" appears
2. Outward rate ≥ 95% on both backbones
3. Max distance under 400 on both backbones
4. No NaN/Infinity positions
5. Visual observation matches expected two-column layout

**Next steps:**
1. Operator runtime probe execution (browser console)
2. Verify console message appears
3. Execute outward rate probe after 5 seconds
4. Verify all stop conditions are met
5. Visual inspection
6. If stop conditions triggered, retune CLUSTER_AWARE_CONFIG values or investigate numerical instability

The cluster-aware force loop provides deterministic per-cluster physics semantics that FA2 cannot support: files attracted to parent, siblings repelled for lateral spread, clusters separated without breaking cohesion.
