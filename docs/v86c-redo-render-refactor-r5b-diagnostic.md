# R5b Diagnostic Report: Narrow Mount Effect Dependencies

## Mission

Stop the mount effect from killing and recreating Sigma on physics slider changes. R5a successfully prevented component remount; this pass prevents Sigma instance recreation within the mounted component.

## Root Cause

Located in `SigmaGraphView.tsx` line 738 (original): mount effect dependency array included physics props:

```typescript
}, [nodes, edges, linkDistance, repelForce, centerForce, physicsDialect, resolvedTokens]);
```

The cleanup function (lines 723-737) calls `sigmaRef.current.kill()` which destroys the Sigma instance. When physics props changed, this effect re-ran, killing Sigma and creating a new instance.

However, lines 740-767 already have a SEPARATE effect that handles live slider updates without recreating Sigma. This created two effects fighting: one rebuilds, one updates-in-place. The rebuild won.

## Implementation

### File Modified
`src/graph/renderers/sigma2d/SigmaGraphView.tsx`

### Changes Made

#### 1. Narrowed Mount Effect Dependencies (Line 738)

**Before:**
```typescript
}, [nodes, edges, linkDistance, repelForce, centerForce, physicsDialect, resolvedTokens]);
```

**After:**
```typescript
}, [nodes, edges]);
```

**Rationale:** The mount effect now only re-runs when graph data fundamentally changes (nodes or edges array identity changes). Physics slider changes, dialect changes, and theme changes are handled by separate effects.

#### 2. Verified Existing Effects Handle Removed Dependencies

- **Physics props (linkDistance, repelForce, centerForce):** Already handled by live slider effect (lines 740-767) with deps `[centerForce, repelForce, linkDistance, strongGravityMode, linLogMode, adjustSizes, barnesHutTheta, physicsPreset]`
- **physicsDialect:** Already handled by solar-orbit effect (lines 295-421) with deps `[physicsDialect]`
- **resolvedTokens:** Added to selection styling effect deps (line 963)

#### 3. Added resolvedTokens to Selection Styling Effect (Line 963)

**Before:**
```typescript
}, [selectedNodeId, selectedEdgeId, neighborhoodDepth, hoveredNodeId, hoveredEdgeId, hoverNodeColor, edgeLabelFontSize]);
```

**After:**
```typescript
}, [selectedNodeId, selectedEdgeId, neighborhoodDepth, hoveredNodeId, hoveredEdgeId, hoverNodeColor, edgeLabelFontSize, resolvedTokens]);
```

**Rationale:** Theme changes (resolvedTokens changes) now trigger the selection styling effect to reapply the graph style policy without recreating Sigma.

## Validation Results

### 1. Typecheck
```bash
npm run typecheck
```
**Result:** ✅ PASSED

### 2. Manual Sentinel Test

**Test Procedure:**
1. Set sentinel: `window.__lwSigma.__sentinel = "before-" + Date.now();`
2. Move physics slider (Repel Force: 100 → 250)
3. Wait 2 seconds
4. Check sentinel: `window.__lwSigma.__sentinel`

**Result:** ✅ PASSED
- Sentinel before slider: `"before-1778559467806"`
- Sentinel after slider: `"before-1778559467806"` (unchanged)
- **Conclusion:** Sigma instance was NOT recreated on physics slider change

**Theme Switch Test:**
1. Switch theme: Solar Plasma → Obsidian Aurora
2. Check sentinel: `window.__lwSigma.__sentinel`

**Result:** ✅ PASSED
- Sentinel after theme switch: `"before-1778559467806"` (unchanged)
- **Conclusion:** Sigma instance was NOT recreated on theme change

### 3. Visual Validation

**Slider changes:** ✅ PASSED
- Physics slider changes still affect graph (forces apply)
- No flash/reset of camera on slider change

**Theme switch:** ✅ PASSED
- Theme switch still affects colors (style policy applies)
- No flash/reset of camera on theme change

**Camera persistence:** ✅ PASSED
- Camera position preserved during slider changes
- Camera position preserved during theme switches

### 4. E2E Test Results

#### Target Test Specs (Expected to Flip from FAILING to PASSING)

**sigma-instance-identity Part A:**
```bash
npm run qa:e2e -- --grep "PART A"
```
**Result:** ✅ PASSED (1.7s)
- Test: "PART A: physics slider change does not recreate Sigma"
- Status: Now passing

**sigma-instance-identity Part B:**
```bash
npm run qa:e2e -- --grep "PART B"
```
**Result:** ✅ PASSED (1.7s)
- Test: "PART B: theme change does not recreate Sigma"
- Status: Now passing

**camera-persistence-settings:**
```bash
npm run qa:e2e -- --grep "camera-persistence-settings"
```
**Result:** ✅ PASSED (1.8s)
- Test: "Camera state persists across physics slider changes"
- Status: Now passing

**camera-persistence-theme:**
```bash
npm run qa:e2e -- --grep "camera-persistence-theme"
```
**Result:** ✅ PASSED (1.9s)
- Test: "Camera state persists across theme switches"
- Status: Now passing

#### Overall E2E Results
```bash
npm run qa:e2e
```
**Result:** 363 passed, 3 failed (2.8m)

**Failed Tests (Unrelated to R5b):**
1. `theme-target-inspector.spec.ts` - Theme target pinning feature (unrelated)
2. `v86c-tile-system.spec.ts` (2 tests) - Tile system integration (unrelated)

**Conclusion:** All 4 target test specs flipped from FAILING to PASSING as expected. The 3 failures are pre-existing and unrelated to R5b changes.

## Summary

### Changes Made
- Narrowed mount effect dependency array from 7 deps to 2 deps (`[nodes, edges]`)
- Added `resolvedTokens` to selection styling effect deps
- Verified existing effects handle physics props and dialect changes

### Validation Summary
- ✅ Typecheck passed
- ✅ Manual sentinel test passed (Sigma persisted on slider change)
- ✅ Manual sentinel test passed (Sigma persisted on theme change)
- ✅ Visual validation passed (slider, theme, camera all working)
- ✅ sigma-instance-identity Part A: PASSED
- ✅ sigma-instance-identity Part B: PASSED
- ✅ camera-persistence-settings: PASSED
- ✅ camera-persistence-theme: PASSED

### Conclusion

**R5b successfully achieved its goal:** The mount effect no longer recreates Sigma on physics slider changes or theme changes. Sigma instance identity is now preserved across these interactions, resolving the Playwright test failures.

**Key Insight:** Component remount (prevented by R5a's React.memo) and effect cleanup (prevented by R5b's narrowed deps) are different things. React.memo prevents the first but not the second. Effects with broad dependency arrays can be just as destructive as full remounts.

**Scar:** R5a's diagnosis (structuredClone identity churn) was incomplete. React.memo successfully prevented component remount, but a long-lived useEffect inside the component had broad dependency arrays that triggered Sigma teardown via the effect's cleanup function. The lesson: "component remount" and "effect cleanup" are different things. React.memo prevents the first but not the second. Effects with broad dependency arrays can be just as destructive as full remounts.
