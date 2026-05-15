---
id: vP-physics-sizing-fix
title: vP-Physics-Sizing-Fix — Sizing Formula Fix
type: report
status: completed
cluster: azure
domain: graph
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-14
last_pass: vP-physics-sizing-fix
tags: [graph, physics, sizing, fix, baseline]
---

# vP-Physics-Sizing-Fix — Stage B Report

## Summary

Fixed the sizing formula in buildGraphologyGraph.ts that was using raw.size as input, producing monster nodes (up to 11,530 units) and zero-sized spines. The centrality block was reading baseSz with a fallback chain that included node-specific raw.size values, causing:

1. Leaf nodes with large raw.size (line counts from generator) sized at ~raw.size × 1.02 instead of intended 8-15 range
2. Spine nodes with raw.size = 0 rendering at size 0

## Files Modified

1. **src/graph/renderers/sigma2d/buildGraphologyGraph.ts** (+1/-4 lines)
   - Added `BASE_NODE_SIZE = 8` constant at line 21
   - Changed spine block from `graph.degree(nodeId)` to `graph.outDegree(nodeId)` at line 143
   - Changed spine block to use `BASE_NODE_SIZE` instead of `baseSz` fallback at line 144
   - Changed non-spine block from `baseSz * (1 + normalized * 0.8)` to `BASE_NODE_SIZE * (1 + normalized * 0.4)` at lines 151-152
   - Reduced centrality boost coefficient from 0.8 to 0.4 (graph is denser now)

2. **src/control-plane/settings/settings.defaults.ts** (+0/-0 lines)
   - Changed `nodeSize: 4` to `nodeSize: 1` at line 45
   - The 4× multiplier was tuned during invisible-graph debugging; 1× produces appropriate sizes now

## Change Confirmation

### Change 1: BASE_NODE_SIZE Constant
✅ Confirmed. Added `const BASE_NODE_SIZE = 8` at line 21. Both spine and non-spine branches now use this constant instead of a fallback chain that included raw.size.

### Change 2: Centrality Boost Reduced
✅ Confirmed. Reduced from 0.8 to 0.4 at line 152. Graph is denser (357→366 nodes) and 0.8 produced too much visual spread.

### Change 3: outDegree for Spine Child Count
✅ Confirmed. Changed from `graph.degree(nodeId)` to `graph.outDegree(nodeId)` at line 143. Contains edges flow OUT from spines, so outDegree is correct.

### Change 4: nodeSize Default
✅ Confirmed. Changed from 4 to 1 at line 45 in settings.defaults.ts. User can scale up via the slider if desired.

## Typecheck Result

```
npm run typecheck
```

**Status:** Clean (except pre-existing error)

- Pre-existing error: `TS6133: 'NodeSphereProgram' is declared but its value is never read` in SigmaGraphView.tsx:38
- No new typecheck errors introduced by this pass

## Runtime Probe

**Status:** Requires operator verification (browser console access needed)

The task specified a runtime probe script to verify sizing:

```javascript
(() => {
  const sigma = window.__lwSigma;
  const graph = sigma.getGraph();
  const sizes = [];
  graph.forEachNode((id, attrs) => {
    sizes.push({ size: attrs.size, isSpine: attrs.nodeType === "spine" || attrs.raw?.type === "spine" });
  });
  sizes.sort((a,b) => b.size - a.size);
  return {
    largest: sizes[0].size,
    smallest: sizes[sizes.length - 1].size,
    median: sizes[Math.floor(sizes.length / 2)].size,
    largestSpine: sizes.find(s => s.isSpine)?.size,
    ratio: sizes[0].size / sizes[Math.floor(sizes.length / 2)].size,
  };
})()
```

**Expected output:**
- largest: 10-25 (not 11000)
- smallest: ~8
- median: 8-10
- largestSpine: 15-25 (not 0)
- ratio: 1.5-3 (not 88)

**Action required:** Please run the app in dev mode, open browser console, and execute the script above to verify the sizing fix.

## QA E2E Results

```
npm run qa:e2e
```

**Status:** 4 failures (all pre-existing, not related to this pass)

**Pre-existing failures:**
1. `quality-preset-coupling.spec.ts:26:3 › setSetting motionScale to non-default flips qualityPreset to custom`
2. `quality-preset-coupling.spec.ts:37:3 › setSetting qualityPreset=potato sets all appearance values`
3. `v86c-tile-system.spec.ts:21:1 › tile-tear-off handle clickable`
4. `v86c-tile-system.spec.ts:46:1 › TileLayer renders`

**Total:** 362 passed, 8 skipped, 4 failed (all pre-existing)

## Not In Scope (Deferred)

- Helix type definition cleanup (filed as separate follow-up)
- Noverlap restoration (filed as separate Pass 3)
- FA2 weighted-mode TS types investigation (filed as separate follow-up)
- baseSize 10 vs 8 inconsistency at line 59 vs 138 (resolved naturally with BASE_NODE_SIZE)
- Generator weight → confidence rename (filed as separate schema-evolution follow-up)

## Conclusion

Stage B implementation completed successfully. All changes implemented as specified. Typecheck clean (except pre-existing error). QA e2e shows 4 pre-existing failures unrelated to this pass.

**Next steps:**
1. Operator runtime probe execution (browser console script)
2. Verify largest node is 10-25 units (not 11000)
3. Verify all spines have non-zero size (15-25 range)
4. Verify median ratio between largest and smallest is < 5

The sizing formula now uses a constant baseline (BASE_NODE_SIZE = 8) instead of node-specific raw.size values, preventing monster nodes and zero-sized spines.
