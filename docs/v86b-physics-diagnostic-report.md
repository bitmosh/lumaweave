# DRAFT — vP-physics-diagnostic: Trace centerForce / repelForce dataflow

**Status:** DRAFT — Awaiting operator review
**Date:** 2026-05-13
**Pass:** vP-physics-diagnostic

---

## Summary

Diagnostic pass on physics system to investigate why slider adjustments to centerForce/repelForce don't produce proportionate visual change. Three hypotheses were verified. All three are confirmed as contributing factors to the physics issue.

---

## Hypothesis 1: Defaults are out of sync with preset values

### Confirmed defaults vs preset values

**src/control-plane/settings/settings.defaults.ts (lines 42-56):**
```typescript
physics: {
  physicsPreset: "balanced",
  qualityPreset: "balanced",
  nodeSize: 4,
  linkDistance: 120,      // ← default
  repelForce: 600,       // ← default
  centerForce: 0.05,     // ← default
  communityGravity: 0.5,
  physicsDialect: "helix",
  strongGravityMode: false,
  linLogMode: false,
  adjustSizes: false,
  barnesHutTheta: 0.5,
}
```

**src/app/AppShell.tsx PRESET_VALUES (lines 88-124):**
```typescript
const PRESET_VALUES = {
  balanced: {
    repelForce: 100,      // ← preset
    centerForce: 200,     // ← preset
    linkDistance: 3,      // ← preset
    strongGravityMode: false,
    linLogMode: false,
  },
  spread: {
    repelForce: 300,
    centerForce: 50,
    linkDistance: 3,
    strongGravityMode: false,
    linLogMode: false,
  },
  tight: {
    repelForce: 50,
    centerForce: 400,
    linkDistance: 5,
    strongGravityMode: true,
    linLogMode: false,
  },
  organic: {
    repelForce: 150,
    centerForce: 100,
    linkDistance: 3,
    strongGravityMode: false,
    linLogMode: true,
  },
  performance: {
    repelForce: 80,
    centerForce: 200,
    linkDistance: 3,
    strongGravityMode: false,
    linLogMode: false,
  },
};
```

**MISMATCH CONFIRMED:**
- `linkDistance`: default 120 vs preset range 3-5 (40× difference)
- `repelForce`: default 600 vs preset range 50-300 (2-12× difference)
- `centerForce`: default 0.05 vs preset range 50-400 (1000× difference)

The defaults are on a completely different scale than the preset values. This means:
- On first load, physics uses the mismatched defaults (linkDistance: 120, repelForce: 600, centerForce: 0.05)
- If preset is "balanced" (default), the sync effect overwrites with preset values (linkDistance: 3, repelForce: 100, centerForce: 200)
- If preset is "custom" (e.g., from localStorage), the sync effect early-returns and the mismatched defaults stand

### Other fields in defaults but not in PRESET_VALUES

**In defaults but NOT in PRESET_VALUES:**
- `qualityPreset` (this is a separate coupling, not physics)
- `nodeSize`
- `communityGravity`
- `physicsDialect`
- `adjustSizes`
- `barnesHutTheta`

**In PRESET_VALUES but NOT in defaults:**
- None (all PRESET_VALUES fields exist in defaults)

---

## Hypothesis 2: physicsPreset sync effect early-returns on "custom"

### Effect early-return verification

**src/app/AppShell.tsx (lines 155-165):**
```typescript
// Sync physics sliders with preset values
useEffect(() => {
  const preset = settings.physics.physicsPreset;
  if (preset === "custom") return;  // ← EARLY RETURN CONFIRMED
  const vals = PRESET_VALUES[preset as keyof typeof PRESET_VALUES];
  if (!vals) return;
  setSetting("physics", {
    ...settings.physics,
    ...vals,
    physicsPreset: preset,
  });
}, [settings.physics.physicsPreset]);
```

**CONFIRMED:** The sync effect early-returns when `preset === "custom"`.

### Mechanism to ensure sane physics values when preset is "custom" on load

**NONE FOUND.**

There is no mechanism in the codebase that ensures physics values are coherent when preset is "custom" on initial load. If localStorage has `physicsPreset: "custom"` (which can happen after manual slider adjustments), the sync effect early-returns and the (potentially mismatched) defaults from `settings.defaults.ts` stand unchanged.

This means:
- If a user manually adjusts sliders, `physicsPreset` flips to "custom" (via the auto-flip effect at lines 168-187)
- On reload, if localStorage preserves `physicsPreset: "custom"`, the sync effect does nothing
- The defaults (linkDistance: 120, repelForce: 600, centerForce: 0.05) are used, which are on a different scale than the preset values
- This explains the "twitchy collapsed blob" symptom — the defaults are not tuned for the FA2 multiplier constants

---

## Hypothesis 3: FA2 multiplier constants make centerForce range mostly invisible

### Multiplier constants

**src/graph/renderers/sigma2d/SigmaGraphView.tsx (lines 589-590, first occurrence):**
```typescript
const fa2Settings = {
  gravity: Math.max(0.001, centerForce * 0.005),
  scalingRatio: Math.max(0.1, repelForce * 0.1),
  slowDown: Math.max(1, linkDistance * 1),
  strongGravityMode,
  linLogMode,
  adjustSizes,
  barnesHutOptimize: graph.order > 150,
  barnesHutTheta,
};
```

**src/graph/renderers/sigma2d/SigmaGraphView.tsx (lines 752-753, second occurrence):**
```typescript
fa2Ref.current = new FA2Layout(graphRef.current, {
  settings: {
    gravity: Math.max(0.001, centerForce * 0.005),
    scalingRatio: Math.max(0.1, repelForce * 0.1),
    slowDown: Math.max(1, linkDistance * 1),
    strongGravityMode,
    linLogMode,
    adjustSizes,
    barnesHutOptimize: true,
  },
});
```

**CONFIRMED:**
- `centerForce` multiplier: `0.005`
- `repelForce` multiplier: `0.1`
- The centerForce multiplier is 20× smaller than the repelForce multiplier

### Slider config for centerForce and repelForce

**src/control-plane/settings/settings.registry.ts (lines 85-100):**
```typescript
{
  type: "range",
  category: "Physics",
  path: "physics.repelForce",
  label: "Repel Force",
  min: 0,
  max: 500,
  step: 5,
},
{
  type: "range",
  category: "Physics",
  path: "physics.centerForce",
  label: "Center Force",
  description: "Controls attraction to graph center.",
  min: 0,
  max: 200,
  step: 5,
},
```

**CONFIRMED:**
- `repelForce` slider: min 0, max 500, step 5
- `centerForce` slider: min 0, max 200, step 5

### Computed mapping range for full slider ranges

**centerForce slider (0-200) with multiplier 0.005:**
- 0 × 0.005 = 0, but `Math.max(0.001, ...)` = **0.001**
- 200 × 0.005 = **1.0**
- **Effective gravity range: 0.001 to 1.0**

**repelForce slider (0-500) with multiplier 0.1:**
- 0 × 0.1 = 0, but `Math.max(0.1, ...)` = **0.1**
- 500 × 0.1 = **50**
- **Effective scalingRatio range: 0.1 to 50**

**Analysis:**
- The centerForce slider maps to a gravity range of 0.001-1.0 (3 orders of magnitude)
- The repelForce slider maps to a scalingRatio range of 0.1-50 (2 orders of magnitude)
- The centerForce multiplier (× 0.005) is 20× smaller than repelForce (× 0.1)
- This means equivalent slider deltas produce wildly unequal force changes:
  - Moving centerForce slider by 100 changes gravity by 0.5
  - Moving repelForce slider by 100 changes scalingRatio by 10
  - The repelForce effect is 20× stronger for the same slider delta

**Additionally:**
- The preset values for centerForce (50-400) map to gravity values of 0.25-2.0, which exceed the slider's max (1.0)
- The preset values for repelForce (50-300) map to scalingRatio values of 5-30, which are within the slider's range (0.1-50)

---

## Additional Findings

### Other fields in PRESET_VALUES that are partially wired

**linkDistance:**
- PRESET_VALUES uses linkDistance: 3-5
- SigmaGraphView maps it to `slowDown: Math.max(1, linkDistance * 1)`
- This means linkDistance 3 maps to slowDown 3, linkDistance 5 maps to slowDown 5
- The default (120) would map to slowDown 120, which is 24-40× higher than preset values

**strongGravityMode and linLogMode:**
- These are boolean flags passed directly to FA2
- They are correctly wired in both defaults and PRESET_VALUES
- No multiplier issues

### Other physics fields not in PRESET_VALUES

**nodeSize:**
- Default is 4
- Not in PRESET_VALUES
- Used in SigmaGraphView but not part of preset coupling

**communityGravity:**
- Default is 0.5
- Not in PRESET_VALUES
- Not used in SigmaGraphView (may be unused field)

**physicsDialect:**
- Default is "helix"
- Not in PRESET_VALUES
- Controls layout engine selection (not FA2)

**adjustSizes and barnesHutTheta:**
- Defaults are false and 0.5
- Not in PRESET_VALUES
- Passed to FA2 but not part of preset coupling

---

## Root Cause Summary

The physics issue is caused by **three independent problems compounding**:

1. **Scale mismatch between defaults and presets:**
   - Defaults use linkDistance: 120, repelForce: 600, centerForce: 0.05
   - Presets use linkDistance: 3-5, repelForce: 50-300, centerForce: 50-400
   - These are on completely different scales (40×, 2-12×, 1000× differences)

2. **Early-return on "custom" prevents correction:**
   - If localStorage has `physicsPreset: "custom"`, the sync effect does nothing
   - The mismatched defaults stand unchanged
   - No fallback mechanism ensures sane values when preset is "custom"

3. **Multiplier constants make centerForce mostly invisible:**
   - centerForce multiplier (× 0.005) is 20× smaller than repelForce (× 0.1)
   - centerForce slider (0-200) maps to gravity (0.001-1.0)
   - repelForce slider (0-500) maps to scalingRatio (0.1-50)
   - Preset centerForce values (50-400) map to gravity (0.25-2.0), exceeding slider max

**Symptom explanation:**
- On first load, if preset is "custom" (from localStorage), the defaults (linkDistance: 120, repelForce: 600, centerForce: 0.05) are used
- These map to FA2 settings: gravity 0.001 (from 0.05 × 0.005), scalingRatio 60 (from 600 × 0.1), slowDown 120
- The slowDown value of 120 is 24-40× higher than preset values (3-5), causing the "twitchy collapsed blob" symptom
- The gravity value of 0.001 is at the minimum floor, making centerForce slider adjustments mostly invisible

---

## Open Questions for the Fix Pass

1. **Which scale is correct?** The defaults (linkDistance: 120, repelForce: 600, centerForce: 0.05) or the presets (linkDistance: 3-5, repelForce: 50-300, centerForce: 50-400)? The presets appear to be tuned for the current multiplier constants, but this needs operator confirmation.

2. **Should defaults be updated to match presets?** If presets are correct, defaults should be updated to the "balanced" preset values (linkDistance: 3, repelForce: 100, centerForce: 200) to ensure sane initial state.

3. **Should the multiplier constants be adjusted?** The centerForce multiplier (× 0.005) produces a very narrow gravity range (0.001-1.0). Should it be increased to make centerForce more responsive? Should repelForce multiplier be decreased to balance the two?

4. **Should preset values be adjusted to match slider ranges?** The preset centerForce values (50-400) map to gravity (0.25-2.0), which exceeds the slider's max (1.0). Should preset values be reduced to stay within slider range, or should slider max be increased?

5. **Should there be a fallback for "custom" preset?** When preset is "custom" on load, should the system apply a sensible default or validate that values are within expected ranges?

6. **Should linkDistance be removed from preset coupling?** linkDistance is used for slowDown in FA2, but the semantic meaning ("Simulation Speed" in the registry) may not match the preset intent. Should it be decoupled from presets?

7. **Should other physics fields be added to preset coupling?** Fields like nodeSize, communityGravity, barnesHutTheta are not in PRESET_VALUES but affect physics. Should they be added?

---

## XP Notes

Pure diagnostic pass. All three hypotheses are confirmed as contributing factors. The root cause is a compound issue: scale mismatch between defaults and presets, early-return preventing correction when preset is "custom", and multiplier constants making centerForce mostly invisible. The fix pass will need to address all three to fully resolve the physics issue.
