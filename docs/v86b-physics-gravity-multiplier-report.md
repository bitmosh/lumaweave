# DRAFT — vP-physics-gravity-multiplier: Strengthen gravity to balance repulsion

**Status:** DRAFT — Awaiting operator visual validation
**Date:** 2026-05-13
**Pass:** vP-physics-gravity-multiplier

---

## Summary

Increased the centerForce multiplier from 0.005 to 0.05 (10×) in both FA2 construction sites to fix runaway expansion. Instrumentation revealed FA2 was producing a 160× explosion in 3 seconds (seed spread 848 → post-FA2 spread 136,533). The cause was multiplier imbalance: gravity was 1.0 at balanced preset while scalingRatio was 10, making repulsion 10× stronger than gravity. With no inward pull, the graph continuously expanded. This fix strengthens gravity to balance repulsion.

---

## Changes Made

### File: src/graph/renderers/sigma2d/SigmaGraphView.tsx

**Change 1: fa2Settings construction (line 590):**
```typescript
// Before:
gravity: Math.max(0.001, centerForce * 0.005),

// After:
gravity: Math.max(0.001, centerForce * 0.05),
```

**Change 2: live-update FA2 reconstruction (line 787):**
```typescript
// Before:
gravity: Math.max(0.001, centerForce * 0.005),

// After:
gravity: Math.max(0.001, centerForce * 0.05),
```

**Multiplier change:** 0.005 → 0.05 (10× increase)

**Other constants:** Unchanged
- scalingRatio multiplier: 0.1 (unchanged)
- slowDown multiplier: 1 (unchanged)
- Math.max() floor values: unchanged (0.001 for gravity, 0.1 for scalingRatio, 1 for slowDown)

---

## Validation

### Typecheck
```
> lumaweave@0.6.0 typecheck
> tsc --noEmit
```

**Status:** ✅ Clean exit, zero errors

### Instrumentation Logs
**Status:** ✅ Left in place — no changes to console.logs

The three instrumentation logs added in vP-physics-instrument-positions remain in place:
- `[LW-INSTR seed]` in buildGraphologyGraph.ts (lines 102-124)
- `[LW-INSTR fa2-init]` in SigmaGraphView.tsx (lines 600-610)
- `[LW-INSTR post-fa2 +3s]` in SigmaGraphView.tsx (lines 624-644)

---

## Expected Changes

Operator should reload the app and confirm:

1. **Graph is contained:** The `[LW-INSTR post-fa2 +3s]` log should show spread in the hundreds-to-thousands range, not 100,000s. With gravity now 10× stronger (10.0 at balanced preset vs 1.0 before), it should balance repulsion (10.0 at balanced preset) and reach equilibrium.

2. **Slider adjustments visible:** Moving Center Force and Repel Force sliders should produce visible layout changes. With balanced multipliers, the physics should now respond predictably to slider input.

3. **Stable settling:** The simulation should reach some kind of stable settling point instead of continuously expanding. The graph may oscillate briefly but should converge to a bounded layout.

---

## Files Modified

- `src/graph/renderers/sigma2d/SigmaGraphView.tsx` — Changed gravity multiplier from 0.005 to 0.05 in TWO locations:
  - Line 590: fa2Settings construction
  - Line 787: live-update FA2 reconstruction

---

## Files Not Modified

- `src/graph/renderers/sigma2d/buildGraphologyGraph.ts` — instrumentation logs left in place
- `src/control-plane/settings/settings.registry.ts` — slider ranges unchanged
- `src/control-plane/settings/settings.defaults.ts` — preset values unchanged
- Any other file — no changes

---

## Out of Scope

Per prompt instructions, the following were NOT touched:
- repelForce / scalingRatio multiplier — left at × 0.1
- slowDown / linkDistance multiplier — left at × 1
- Math.max() floor values — left unchanged
- Slider min/max ranges in settings.registry.ts — left unchanged
- Settings defaults or preset values — left unchanged
- Instrumentation logs — left in place

---

## XP

After hours of diagnosis, this is the fix the instrumentation finally pointed us to. The earlier passes (seed scale, helix removal, defaults reconcile, container fix) were all real improvements that were being masked by the runaway expansion. With gravity balanced, all those fixes should now produce the visually correct graph we've been aiming for.

The instrumentation logs from vP-physics-instrument-positions were crucial — without seeing the 160× expansion in the console, we would have continued tuning the wrong knobs. The diagnostic value of those logs proved the hypothesis that the data layer was healthy but the physics multipliers were unbalanced.

This pass stayed surgical and only touched the gravity multiplier in both construction sites. The live-update path was updated to keep it consistent with the initial construction path, ensuring slider changes continue to work correctly.
