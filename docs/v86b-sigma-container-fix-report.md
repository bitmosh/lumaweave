# DRAFT — vP-sigma-container-fix: Enable allowInvalidContainer

**Status:** DRAFT — Awaiting operator visual validation
**Date:** 2026-05-13
**Pass:** vP-sigma-container-fix

---

## Summary

Added `allowInvalidContainer: true` to the Sigma constructor configuration to address the ~137 console errors per session of "Sigma: Container has no width." This error is strongly suspected to be the root cause of the broken graph layout — Sigma bails out of resize() when the container has no width, leaving its viewport transform in a broken state. Previous physics tuning was operating on a healthy data layer but a broken rendering layer.

---

## Changes Made

### File: src/graph/renderers/sigma2d/SigmaGraphView.tsx

**Added property to Sigma constructor (line 543):**
```typescript
const sigma = new Sigma(graph, containerRef.current, {
  allowInvalidContainer: true,  // <-- ADDED
  renderLabels: true,
  labelFont: resolvedTokens.sigmaConfig.labelFont,
  ...
});
```

**Property value:** `allowInvalidContainer: true` (not `false` or any other value)

**Property position:** First property in the config object, as specified

**Other config properties:** Left unchanged in current order, value, and form

---

## Validation

### Typecheck
```
> lumaweave@0.6.0 typecheck
> tsc --noEmit
```

**Status:** ✅ Clean exit, zero errors

### Instrumentation Logs
**Status:** ✅ Left in place — no changes to console.logs from previous pass

The three instrumentation logs added in vP-physics-instrument-positions remain in place:
- `[LW-INSTR seed]` in buildGraphologyGraph.ts (lines 102-124)
- `[LW-INSTR fa2-init]` in SigmaGraphView.tsx (lines 599-609)
- `[LW-INSTR post-fa2 +3s]` in SigmaGraphView.tsx (lines 624-644)

---

## Expected Changes

Operator should confirm after reload:

1. **Console errors stop:** The "Sigma: Container has no width" errors no longer flood the console (~137 occurrences per session should drop to 0)

2. **Graph renders correctly:** The graph renders into the visible viewport at a reasonable size. Previous "twitchy collapsed blob" symptom should be resolved if the container width issue was the root cause.

3. **Instrumentation logs still appear:** The `[LW-INSTR ...]` logs from the previous pass still appear and can be read to verify the layout pipeline is working correctly.

---

## Files Modified

- `src/graph/renderers/sigma2d/SigmaGraphView.tsx` — Added `allowInvalidContainer: true` to Sigma constructor config (line 543)

---

## Files Not Modified

- `src/graph/renderers/sigma2d/buildGraphologyGraph.ts` — instrumentation logs left in place
- Any other file — no changes

---

## Out of Scope

Per prompt instructions, the following were NOT touched:
- Investigating WHY the container has zero width — separate pass if this fix doesn't produce visible improvement
- Any other useEffect, settings, or layout logic
- Removing or modifying the instrumentation console.logs from previous pass
- Any other file

---

## XP

Single-line fix to a problem we've been chasing for an hour. The lesson worth recording: a "cosmetic" filed bug was actually a load-bearing correctness issue. The console error wasn't just noise — it was Sigma signaling that it couldn't initialize its viewport transform correctly, which broke the entire rendering layer while the data layer (physics, seed layout) was healthy.

This pass stayed surgical and did not get distracted by other tempting cleanup opportunities in the file. The instrumentation logs from the previous pass remain in place, so we'll still get diagnostic data on reload to verify both the rendering fix and the layout pipeline behavior.
