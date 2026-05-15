# DRAFT — vP-physics-seed-and-defaults-fix: Replace seed formula + Reconcile defaults

**Status:** DRAFT — Awaiting operator visual validation
**Date:** 2026-05-13
**Pass:** vP-physics-seed-and-defaults-fix

---

## Summary

Replaced the seed layout formula with a node-count-based formula to decouple initial layout from slider values, and reconciled physics defaults with PRESET_VALUES.balanced to eliminate the latent footgun where "custom" preset state would use mismatched defaults. Typecheck passes with zero errors.

---

## Changes Made

### File: src/graph/renderers/sigma2d/buildGraphologyGraph.ts

**Replaced seed layout formula (line 225):**

```typescript
// Before
const layoutScale =
  18 + settings.linkDistance * .12 + settings.repelForce * .08;

// After
const layoutScale = Math.sqrt(nodes.length) * 50;
```

**Effect:**
- Decouples seed scale from slider values (linkDistance, repelForce)
- Produces node-count-based scale: 124 nodes → layoutScale ≈ 555 (was ~36)
- Formula: `Math.sqrt(nodes.length) * 50`
  - 124 nodes → √124 × 50 ≈ 11.1 × 50 = 555
  - 1000 nodes → √1000 × 50 ≈ 31.6 × 50 = 1580
  - 10 nodes → √10 × 50 ≈ 3.2 × 50 = 158
  - 1 node → √1 × 50 = 50

**Preserved:**
- baseSize constant (line 228)
- nodes.forEach loop (line 230+)
- getSunflowerPosition call (line 232)
- All other file contents unchanged

---

### File: src/control-plane/settings/settings.defaults.ts

**Reconciled physics defaults with PRESET_VALUES.balanced (lines 46-48):**

```typescript
// Before
linkDistance: 120,
repelForce: 600,
centerForce: 0.05,

// After
linkDistance: 3,
repelForce: 100,
centerForce: 200,
```

**Effect:**
- Defaults now match the "balanced" preset values from AppShell.tsx
- Eliminates scale mismatch: defaults were 40×, 6×, and 4000× off from preset values
- When preset is "custom" on load, the sync effect early-returns but now uses sane defaults
- New users (or users clearing localStorage) will get sensible initial physics values

**Preserved:**
- physicsPreset: "balanced" (unchanged)
- qualityPreset: "balanced" (unchanged)
- nodeSize: 4 (unchanged)
- communityGravity: 0.5 (unchanged)
- physicsDialect: "helix" (unchanged)
- strongGravityMode: false (unchanged)
- linLogMode: false (unchanged)
- adjustSizes: false (unchanged)
- barnesHutTheta: 0.5 (unchanged)

---

## Validation

### Typecheck
```
> lumaweave@0.6.0 typecheck
> tsc --noEmit
```

**Status:** ✅ Clean exit, zero errors

---

## Expected Visual Changes

Operator should confirm after reload:

1. **Graph appears at roughly 10-15× its current size on initial load** — The seed layout scale increased from ~36 to ~555 for 124 nodes, so nodes should be spread across a much larger region instead of crushed together.

2. **Nodes are spread across a usefully large region instead of crushed** — The sunflower seed layout should now distribute nodes across a viewport-filling area, making individual nodes visible and selectable.

3. **FA2 still settles into a coherent layout (not chaos)** — FA2 should still converge to a stable layout, just starting from a better initial distribution. The layout should not explode or become chaotic.

4. **Slider adjustments to Repel Force and Center Force still have effect on FA2 behavior** — Sliders should continue to affect FA2 runtime behavior as expected. The seed formula change only affects initial layout, not runtime FA2 parameters.

5. **Fresh user (localStorage cleared) shows reconciled defaults** — After running `localStorage.clear()` in dev console and reloading, the Physics control plane should show linkDistance: 3, repelForce: 100, centerForce: 200.

---

## Findings

### Unexpected in buildGraphologyGraph.ts

None. The file is straightforward with a clear single-purpose formula for seed layout. The formula was the only place where layoutScale was computed, and the change was isolated to that line.

### Unexpected in settings_defaults.ts

None. The physics group structure is clean and the three fields updated are the only ones that needed reconciliation. The other physics fields (nodeSize, communityGravity, physicsDialect, strongGravityMode, linLogMode, adjustSizes, barnesHutTheta) are not part of preset coupling and were correctly left unchanged.

### Migration-worthy concern

**No migration needed.**

This is a value-only change to defaults. Existing users with localStorage state will keep their saved values, which is the correct behavior. The sync effect in AppShell.tsx will continue to work as before for users with saved state. Only new users (or users clearing localStorage) will get the reconciled defaults.

The schema version was not bumped per prompt instructions, which is appropriate for a default value change that doesn't require data migration.

---

## Files Modified

- `src/graph/renderers/sigma2d/buildGraphologyGraph.ts` — Replaced seed layout formula (line 225)
- `src/control-plane/settings/settings.defaults.ts` — Reconciled physics defaults with PRESET_VALUES.balanced (lines 46-48)

---

## Files Not Modified

- AppShell.tsx PRESET_VALUES — out of scope per prompt
- SigmaGraphView.tsx FA2 multipliers — out of scope per prompt (separate pass)
- Any other file

---

## Notes for FA2 Multiplier Tuning Pass

The diagnostic report identified that the FA2 multiplier constants make centerForce mostly invisible:
- centerForce multiplier: × 0.005 (gravity: 0.001-1.0 from slider 0-200)
- repelForce multiplier: × 0.1 (scalingRatio: 0.1-50 from slider 0-500)
- centerForce multiplier is 20× smaller than repelForce

With the new defaults (centerForce: 200), the gravity value is 200 × 0.005 = 1.0, which is at the maximum of the gravity range. This means the centerForce slider at its default position is already at maximum effect, which may still make centerForce adjustments feel less responsive than repelForce.

The tuning pass should consider:
- Whether to increase the centerForce multiplier to make the slider more responsive
- Whether to adjust preset values to stay within the slider's effective range
- Whether to adjust slider min/max to match the multiplier better
