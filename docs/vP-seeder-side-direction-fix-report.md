---
id: vP-seeder-side-direction-fix
title: vP-Seeder-Side-Direction-Fix — File Orbit Direction Fix
type: report
status: completed
cluster: azure
domain: graph
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-14
last_pass: vP-seeder-side-direction-fix
tags: [graph, physics, seeder, backbone, orbit, direction, fix]
---

# vP-Seeder-Side-Direction-Fix — File Orbit Direction Fix Report

## Summary

Fixed file orbit logic in directoryBackboneSeeder.ts to orbit outward from backbone axis instead of alternating by tree depth. Previously, files used `depth % 2 === 0 ? 1 : -1` which caused files on the left backbone (docs at x=-1000) to sometimes orbit left (outward) and sometimes right (inward toward the right backbone). Same issue on the right backbone. Now files always orbit outward: left backbone files go further left, right backbone files go further right. This leaves clear middle space for cross-backbone edges and creates clean cluster halos on the outside.

## Files Modified

**src/graph/physics/directoryBackboneSeeder.ts** (+0/-2 lines)

Changes made:
1. Line 208: Changed side calculation from `depth % 2 === 0 ? 1 : -1` to `rootX < 0 ? -1 : 1`
2. Line 175: Removed unused `depth` variable from spine placement loop
3. Line 193: Removed unused `depth` variable from file orbit loop
4. Line 35: Reduced childOrbitRadius from 120 to 80 in BACKBONE_CONFIG

## Change Details

### Change 1: File Orbit Side Calculation

**Before:**
```typescript
// Alternate sides based on depth parity
const side = depth % 2 === 0 ? 1 : -1;
```

**After:**
```typescript
// Orbit outward from backbone axis (left backbone → left, right backbone → right)
const side = rootX < 0 ? -1 : 1;
```

This ensures files always orbit outward from their backbone axis:
- Files on left backbone (rootX < 0) orbit further left (side = -1)
- Files on right backbone (rootX > 0) orbit further right (side = 1)

### Change 2: Reduce childOrbitRadius

**Before:**
```typescript
childOrbitRadius: 120,
```

**After:**
```typescript
childOrbitRadius: 80,
```

With files now orbiting outward consistently, they have more vertical breathing room. Reducing the orbit radius keeps file clusters tighter and prevents vertical overlap with neighboring spines' files.

### Change 3: Remove Unused Variables

Removed `depth` variable from:
- Line 175: Spine placement loop (no longer uses depth for Y calculation)
- Line 193: File orbit loop (no longer uses depth for side calculation)

## Typecheck Result

```
npm run typecheck
```

**Status:** Clean (except pre-existing error)

- Pre-existing error: `TS6133: 'NodeSphereProgram' is declared but its value is never read` in SigmaGraphView.tsx:38
- No new typecheck errors introduced by this pass

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

## Runtime Probe

**Status:** Requires operator verification (browser console access needed)

The task specified a runtime probe script to verify file orbit direction:

```javascript
(() => {
  const sigma = window.__lwSigma;
  const graph = sigma.getGraph();
  // Sample 5 files from each backbone, verify they orbit outward
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
      file: id,
      spineX: pAttrs.x,
      fileX: attrs.x,
      delta: (attrs.x - pAttrs.x).toFixed(1),
      outward: pAttrs.x < 0
        ? attrs.x < pAttrs.x ? "yes" : "no"
        : attrs.x > pAttrs.x ? "yes" : "no",
    });
  });
  // Group by backbone
  const left = samples.filter(s => s.spineX < 0);
  const right = samples.filter(s => s.spineX > 0);
  return {
    leftBackboneOutwardCount: left.filter(s => s.outward === "yes").length,
    leftBackboneTotalFiles: left.length,
    rightBackboneOutwardCount: right.filter(s => s.outward === "yes").length,
    rightBackboneTotalFiles: right.length,
    leftSample: left.slice(0, 3),
    rightSample: right.slice(0, 3),
  };
})()
```

**Expected output:**
- leftBackboneOutwardCount === leftBackboneTotalFiles (every file on left backbone is to the left of its spine)
- rightBackboneOutwardCount === rightBackboneTotalFiles (every file on right backbone is to the right of its spine)

**Action required:** Please run the app in dev mode, open browser console, and execute the script above to verify the file orbit direction changes.

## Visual Observations

**Status:** Requires operator verification

Expected visual outcome:
- Files on left backbone (docs) orbit further left, creating a clean cluster halo on the left side
- Files on right backbone (src) orbit further right, creating a clean cluster halo on the right side
- Clear middle space between the two backbones for cross-backbone edges
- File clusters at ~80-unit radius (reduced from 120) are tighter and don't overlap vertically with neighboring spines' files

## Conclusion

Stage B implementation completed successfully. All changes applied as specified. Typecheck clean (except pre-existing error). QA e2e shows 4 pre-existing failures unrelated to this pass. Runtime probe and visual verification require operator execution in browser console.

**Next steps:**
1. Operator runtime probe execution (browser console script)
2. Verify leftBackboneOutwardCount === leftBackboneTotalFiles
3. Verify rightBackboneOutwardCount === rightBackboneTotalFiles
4. Visual inspection: files orbit outward from backbone axis, clear middle space, tight file clusters

The file orbit direction fix ensures files always orbit outward from their backbone axis, creating clean cluster halos on the outside and leaving clear middle space for cross-backbone edges.
