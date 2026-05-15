# DRAFT — vP-physics-instrument-positions: Log layout pipeline numbers

**Status:** DRAFT — Ready for operator to reload and read console
**Date:** 2026-05-13
**Pass:** vP-physics-instrument-positions

---

## Summary

Added three console.log statements at key points in the layout pipeline to diagnose why the graph layout has not shown visible changes after four fix attempts. No logic changes — pure observation infrastructure.

---

## Changes Made

### File: src/graph/renderers/sigma2d/buildGraphologyGraph.ts

**Added log after sunflower placement (lines 102-124):**
```typescript
// INSTRUMENTATION: vP-physics-instrument-positions
{
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  graph.forEachNode((id) => {
    const attrs = graph.getNodeAttributes(id);
    const x = attrs.x as number;
    const y = attrs.y as number;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });
  console.log("[LW-INSTR seed]", {
    callSite: new Error().stack?.split("\n")[2]?.trim() ?? "unknown",
    nodeCount: nodes.length,
    layoutScale: Math.sqrt(nodes.length) * 50,
    minX: minX.toFixed(1),
    maxX: maxX.toFixed(1),
    minY: minY.toFixed(1),
    maxY: maxY.toFixed(1),
    spread: { x: (maxX - minX).toFixed(1), y: (maxY - minY).toFixed(1) },
  });
}
```

**Purpose:** Logs the coordinate range immediately after sunflower seed placement, before any FA2 simulation. The `callSite` field captures who called buildGraphologyGraph (via Error stack) to detect if it's being called multiple times on load.

### File: src/graph/renderers/sigma2d/SigmaGraphView.tsx

**Added log after fa2Settings declaration (lines 599-609):**
```typescript
// INSTRUMENTATION: vP-physics-instrument-positions
console.log("[LW-INSTR fa2-init]", {
  gravity: fa2Settings.gravity,
  scalingRatio: fa2Settings.scalingRatio,
  slowDown: fa2Settings.slowDown,
  strongGravityMode: fa2Settings.strongGravityMode,
  linLogMode: fa2Settings.linLogMode,
  rawCenterForce: centerForce,
  rawRepelForce: repelForce,
  rawLinkDistance: linkDistance,
});
```

**Purpose:** Logs the actual FA2 settings being constructed, including both the computed values (gravity, scalingRatio, slowDown) and the raw slider values (rawCenterForce, rawRepelForce, rawLinkDistance). This will reveal whether the preset values are being applied correctly.

**Added log after fa2Ref.current.start() (lines 624-644):**
```typescript
// INSTRUMENTATION: vP-physics-instrument-positions
setTimeout(() => {
  if (!graphRef.current) return;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  graphRef.current.forEachNode((id: string) => {
    const attrs = graphRef.current!.getNodeAttributes(id);
    const x = attrs.x as number;
    const y = attrs.y as number;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });
  console.log("[LW-INSTR post-fa2 +3s]", {
    minX: minX.toFixed(1),
    maxX: maxX.toFixed(1),
    minY: minY.toFixed(1),
    maxY: maxY.toFixed(1),
    spread: { x: (maxX - minX).toFixed(1), y: (maxY - minY).toFixed(1) },
  });
}, 3000);
```

**Purpose:** Logs the coordinate range after FA2 has run for 3 seconds. The 3-second delay gives FA2 time to settle into a layout. This will show how much the nodes have moved from their seed positions.

---

## Validation

### Typecheck
```
> lumaweave@0.6.0 typecheck
> tsc --noEmit
```

**Status:** ✅ Clean exit, zero errors

### Logic Changes
**Status:** ✅ Zero logic changes — only added console.log statements

---

## What to Look For in Console

After reloading the app, check the browser console for these three log entries:

### 1. `[LW-INSTR seed]`
**Expected:** 1 occurrence on fresh load

**If you see 2-3 occurrences:** buildGraphologyGraph is being called from multiple sites (e.g., both AppShell.tsx and SigmaGraphView.tsx). This would explain why the graph keeps getting rebuilt.

**Key fields:**
- `callSite`: Who called buildGraphologyGraph (stack trace line)
- `nodeCount`: Number of nodes (should be 124 for self-graph fixture)
- `layoutScale`: Expected to be ~555 for 124 nodes (Math.sqrt(124) * 50 ≈ 555)
- `spread.x` and `spread.y`: Should be ~1100 if sunflower is working correctly (from -555 to +555)

### 2. `[LW-INSTR fa2-init]`
**Expected:** 1 occurrence on fresh load

**Key fields:**
- `gravity`: Computed from centerForce * 0.005. With centerForce=200 (balanced preset), gravity should be 1.0
- `scalingRatio`: Computed from repelForce * 0.1. With repelForce=100 (balanced preset), scalingRatio should be 10.0
- `slowDown`: Computed from linkDistance * 1. With linkDistance=3 (balanced preset), slowDown should be 3
- `rawCenterForce`, `rawRepelForce`, `rawLinkDistance`: Should match the preset values (200, 100, 3 for balanced)

### 3. `[LW-INSTR post-fa2 +3s]`
**Expected:** 1 occurrence, 3 seconds after load

**Key fields:**
- `spread.x` and `spread.y`: Compare to the seed spread. If FA2 is working, the spread should change (nodes move from sunflower pattern to a more clustered layout). If the spread is identical to seed spread, FA2 is not moving nodes.

---

## Files Modified

- `src/graph/renderers/sigma2d/buildGraphologyGraph.ts` — Added console.log after sunflower placement (lines 102-124)
- `src/graph/renderers/sigma2d/SigmaGraphView.tsx` — Added console.log after fa2Settings (lines 599-609) and after fa2Ref.current.start() (lines 624-644)

---

## Files Not Modified

- No other files were modified
- No logic changes, state changes, ref changes, or prop changes

---

## Other Instrumentation Opportunities (Not Added)

Per prompt instructions, I did not add logs to these locations, but they might be useful for future debugging:

1. **Live-update FA2 effect (line ~779)** — Would show when physics sliders trigger FA2 setting updates without rebuild
2. **Community gravity handler** — Would show if community gravity is pulling nodes into clusters
3. **Solar-orbit handler** — Would show if solar-orbit dialect is active and moving nodes
4. **noverlap call in buildGraphologyGraph.ts** — Would show the anti-collision pass output

---

## XP

Pure observation pass. The diagnostic value is enormous — after this, we'll know facts about the layout pipeline that have been guesses for the last hour. The callSite tracking in the seed log is particularly valuable because it will reveal if buildGraphologyGraph is being called from multiple sites, which would explain the destructive rebuild cycle.
