---
id: vP-physics-backbone-seed-fix
title: vP-Physics-Backbone-Seed-Fix — Micro-pass following vP-physics-backbone-seed
type: report
status: completed
cluster: azure
domain: graph
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-14
last_pass: vP-physics-backbone-seed-fix
tags: [graph, physics, backbone, seed, fix, migration]
---

# vP-Physics-Backbone-Seed-Fix — Stage B Report

## Summary

Micro-pass fixing two critical issues from vP-physics-backbone-seed:

1. **CRITICAL:** Seeder was gated on `physicsDialect === "default"`, but the active dialect was "helix" (stale default). Result: seeder never ran, all 64 spines remained at (0, 0), graph rendered as single stack.

2. **RELATED:** Physics dialect dropdown had stale "Helix (Brand Shape)" option (implementation deleted earlier today). Default value was "helix" which is dead.

This micro-pass removes the dialect gate, fixes the default value to "default", removes the helix option from the dropdown, and adds a storage migration to rewrite persisted "helix" values to "default".

## Files Modified

1. **src/graph/renderers/sigma2d/buildGraphologyGraph.ts** (+1/-7 lines)
   - Removed dialect gate on seeder call
   - Changed from: `if (settings.physicsDialect === "default") { seedDirectoryBackboneN2({ graph, settings }); }`
   - Changed to: `seedDirectoryBackboneN2({ graph, settings });`

2. **src/control-plane/settings/settings.defaults.ts** (+1/-1 lines)
   - Changed `physicsDialect: "helix" as const` to `physicsDialect: "default" as const`
   - Bumped version from 80 to 81

3. **src/control-plane/settings/settings.schema.ts** (+1/-1 lines)
   - Changed `physicsDialect: "default" | "helix" | "solar-orbit"` to `physicsDialect: "default" | "solar-orbit"`
   - Bumped version from 80 to 81

4. **src/control-plane/settings/settings.registry.ts** (+0/-1 lines)
   - Removed `{ value: "helix", label: "Helix (Brand Shape)" }` from options array
   - Kept: "Default (Force-Directed)", "Solar Orbit"

5. **src/control-plane/settings/settings.migrations.ts** (+8/-1 lines)
   - Added migration 80 → 81: rewrites `physicsDialect: "helix"` → `"default"`

6. **src/control-plane/settings/settings.store.ts** (+1/-1 lines)
   - Bumped `CURRENT_SCHEMA_VERSION` from 80 to 81

7. **tests/e2e/settings-migrations.spec.ts** (+4/-1 lines)
   - Updated test from "v76 → v80 chain" to "v76 → v81 chain"
   - Added `physicsDialect: "helix"` to synthetic v76 input
   - Added assertion: `expect(result.physics.physicsDialect).toBe("default")`

## Change Confirmation

### Change 1: Seeder Gate Removed
✅ Confirmed. Seeder now runs unconditionally in buildGraphologyGraph.ts line 217.

### Change 2: Default Value Changed
✅ Confirmed. `physicsDialect` default changed from "helix" to "default" in settings.defaults.ts line 50.

### Change 3: Helix Option Removed
✅ Confirmed. "Helix (Brand Shape)" removed from dropdown options in settings.registry.ts line 59. Removed from schema type union in settings.schema.ts line 89.

### Change 4: Storage Migration Added
✅ Confirmed. Migration 80 → 81 added in settings.migrations.ts lines 92-99. Rewrites `physicsDialect: "helix"` → `"default"` on load.

## Typecheck Result

```
npm run typecheck
```

**Status:** Clean (except pre-existing error)

- Pre-existing error: `TS6133: 'NodeSphereProgram' is declared but its value is never read` in SigmaGraphView.tsx:38
- No new typecheck errors introduced by this pass

## Runtime Probe

**Status:** Requires operator verification (browser console access needed)

The task specified a runtime probe script to verify the seeder ran:

```javascript
(() => {
  const sigma = window.__lwSigma;
  const graph = sigma.getGraph();
  const seededMap = graph.getAttribute("__seededSpinePositions");
  const xs = [], ys = [];
  graph.forEachNode((id, attrs) => {
    if (attrs.nodeType === "spine" || attrs.raw?.type === "spine") {
      xs.push(attrs.x);
      ys.push(attrs.y);
    }
  });
  return {
    seederRan: seededMap && seededMap.size > 0,
    seededCount: seededMap ? seededMap.size : 0,
    spineXRange: xs.length ? [Math.min(...xs), Math.max(...xs)] : null,
    spineYRange: ys.length ? [Math.min(...ys), Math.max(...ys)] : null,
  };
})()
```

**Expected output:**
- seederRan: true
- seededCount: 64
- spineXRange: meaningful range (non-zero spread)
- spineYRange: meaningful range (non-zero spread)

**Action required:** Please run the app in dev mode, open browser console, and execute the script above to verify the seeder ran and spines are not all at (0, 0).

## Visual Check

**Status:** Requires operator verification

**Expected:**
- Physics dialect dropdown no longer shows "Helix (Brand Shape)"
- Default selected value is "Default (Force-Directed)"
- Graph shows two clear vertical backbones (src and docs) with file clusters
- Spines remain pinned in position while file children move under FA2 physics

**Action required:** Please visually verify the dropdown options and graph layout.

## QA E2E Results

```
npm run qa:e2e
```

**Status:** 6 failures (1 fixed, 5 pre-existing)

**Fixed failure:**
- `settings-migrations.spec.ts:12:3 › v76 → v80 chain produces correct endpoint` - Fixed by updating test to expect version 81 and testing helix → default migration

**Pre-existing failures (not related to this pass):**
1. `contract-registry.spec.ts:305:1 › v48 checklist includes detail mode checks`
2. `quality-preset-coupling.spec.ts:26:3 › setSetting motionScale to non-default flips qualityPreset to custom`
3. `quality-preset-coupling.spec.ts:37:3 › setSetting qualityPreset=potato sets all appearance values`
4. `theme-target-inspector.spec.ts:620:3 › inspector OFF clears pinned state`
5. `v86c-tile-system.spec.ts:21:1 › tile-tear-off handle clickable`
6. `v86c-tile-system.spec.ts:46:1 › TileLayer renders`

**Total:** 359 passed, 8 skipped, 6 failed (all pre-existing except the one fixed)

## Conclusion

Stage B implementation completed successfully. All changes implemented as specified. Typecheck clean (except pre-existing error). Migration test fixed. QA e2e shows 6 pre-existing failures unrelated to this pass.

**Next steps:**
1. Operator runtime probe execution (browser console script)
2. Operator visual verification of dropdown and graph layout
3. The seeder should now run unconditionally, placing spines in deterministic backbone layout
4. Persisted "helix" values will be migrated to "default" on next app load

**Note:** The seeder now runs for all physics dialects, not just "default". Dialect-aware seeder selection is future work (the SeedFunctionRegistry's category field is built for it).
