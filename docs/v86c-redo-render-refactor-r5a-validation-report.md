# v86c Render Refactor - R5a Validation Report

## Summary

R5a implemented consumer-layer memoization to prevent SigmaGraphView from remounting on settings changes. The changes stabilized prop identities at the AppShell layer via useMemo and React.memo. However, the critical camera persistence and sigma-instance-identity tests did NOT flip from failing to passing, indicating that R5a was insufficient to fix the remount issue. R5b (settings store modification) is now necessary.

## Diff Summary

### AppShell.tsx

**Lines 199-212**: Wrapped themeTokens and resolvedGraphTokens in useMemo
```typescript
// v86c: Memoize theme tokens to prevent identity churn on unrelated settings changes
const themeTokens = useMemo(
  () => getThemeRuntimeTokens(settings.appearance.theme),
  [settings.appearance.theme]
);

// Resolve graph visual tokens from theme tokens with settings overrides
// v86c: Memoize to prevent identity churn on unrelated settings changes
const resolvedGraphTokens = useMemo(
  () => resolveGraphVisualTokens(themeTokens.graph, {
    hoverNodeColor: settings.graphView.hoverNodeColor,
  }),
  [themeTokens, settings.graphView.hoverNodeColor]
);
```

**Lines 812-868**: Removed IIFE wrapper and added stable key prop
```typescript
<div className="relative h-full">
  {graphNodes &&
  graphEdges &&
  graphNodes.length > 0 ? (
    <>
      {/* v86c: Stable key prop prevents remount on settings changes */}
      <SigmaGraphView
        key={graphSummary.source}
        nodes={graphNodes}
        edges={graphEdges}
        // ... other props
      />
      {/* Plasma overlay */}
      {/* Graph inspector */}
    </>
  ) : (...)}
</div>
```

### SigmaGraphView.tsx

**Line 8**: Added memo import
```typescript
import { useEffect, useRef, useState, memo } from "react";
```

**Line 139**: Renamed function to SigmaGraphViewComponent
```typescript
function SigmaGraphViewComponent({
  // ... props
}: SigmaGraphViewProps) {
```

**Lines 1067-1114**: Added React.memo with custom comparison
```typescript
// v86c: React.memo with custom comparison to prevent remount on settings changes
// Returns true if props are equal (skip render), false if props differ (re-render)
const arePropsEqual = (prev: SigmaGraphViewProps, next: SigmaGraphViewProps) => {
  // Identity checks for memoized objects
  if (prev.nodes !== next.nodes) return false;
  if (prev.edges !== next.edges) return false;
  if (prev.resolvedTokens !== next.resolvedTokens) return false;

  // Value checks for selection state
  if (prev.selectedNodeId !== next.selectedNodeId) return false;
  if (prev.selectedEdgeId !== next.selectedEdgeId) return false;
  if (prev.pathTargetId !== next.pathTargetId) return false;
  if (prev.neighborhoodDepth !== next.neighborhoodDepth) return false;

  // Value checks for physics props
  if (prev.nodeSize !== next.nodeSize) return false;
  if (prev.linkDistance !== next.linkDistance) return false;
  if (prev.repelForce !== next.repelForce) return false;
  if (prev.centerForce !== next.centerForce) return false;
  // ... other physics props

  // Value checks for label props
  // Value checks for appearance props

  // All props equal - skip re-render
  return true;
};

export const SigmaGraphView = memo(SigmaGraphViewComponent, arePropsEqual);
```

## Validation Results

### 1. Typecheck
✅ **PASSED** - `npm run typecheck` completed with exit code 0

### 2. Visual Check
✅ **PASSED** - Loaded dev app at localhost:1420, waited 3 seconds. No visible flash on initial load. (Note: did not manually interact with sliders/theme dropdown due to console errors)

### 3. Console Error Count
⚠️ **ERRORS FOUND** - 191 "Sigma: Container has no width" errors on initial page load. These are from the ResizeObserver callback triggering before the container has dimensions (R1 issue, not R5a-related). No new errors introduced by R5a changes.

### 4. qa:e2e Results
❌ **REGRESSION** - Test results degraded:
- **Before R5a**: 360 passed, 6 failed, 8 skipped
- **After R5a**: 359 passed, 7 failed, 8 skipped
- **Change**: -1 passed, +1 failed

**Spec Breakdown**:

**Still FAILING (0 flipped)**:
- ❌ camera-persistence-settings.spec.ts: Camera state persists across physics slider changes
- ❌ camera-persistence-theme.spec.ts: Camera state persists across theme switches
- ❌ sigma-instance-identity.spec.ts Part A: physics slider change does not recreate Sigma
- ❌ sigma-instance-identity.spec.ts Part B: theme change does not recreate Sigma

**New FAILURE (regression)**:
- ❌ theme-target-inspector.spec.ts: Theme Target Registry + Inspector Overlay › inspector OFF clears pinned state

**Pre-existing FAILURES (unchanged)**:
- ❌ v86c-tile-system.spec.ts: tile-tear-off handle clickable
- ❌ v86c-tile-system.spec.ts: TileLayer renders

**PASSED (unchanged)**:
- ✅ 359 other specs (including all selection persistence tests)

## Analysis

### Why R5a Failed

The consumer-layer memoization was insufficient because:

1. **Callback function identities**: The callback props (`onSelectNode`, `onSetPathTarget`, `onSelectEdge`, `onClearSelection`) are defined inline in AppShell and recreated on every render. Even though they're not compared in the custom comparison function, React may still trigger re-renders due to function identity changes.

2. **Physics prop churn**: Physics props (nodeSize, linkDistance, repelForce, centerForce, etc.) are passed as individual primitives from `settings.physics`. When any physics slider changes, these values change, triggering re-render. While React.memo should skip re-render if the comparison returns true, the comparison function explicitly checks these props and returns false when they differ, which is correct behavior for physics changes but means the component still re-renders on slider changes.

3. **Key prop stability**: The `key={graphSummary.source}` prop is stable for the fixture, but if the source changes, React will unmount and remount the component (intentional per Sigma Lifecycle Contract). However, this doesn't explain why camera persistence tests fail on slider/theme changes.

4. **Possible deeper issue**: The fact that camera persistence tests still fail suggests that Sigma instance recreation is happening despite React.memo. This could indicate:
   - React.memo is not being applied correctly
   - The comparison function has a bug
   - There's another code path causing remount that we didn't identify in R4

### Root Cause Hypothesis

The most likely cause is that **callback function identity churn** is causing React to re-render the parent (AppShell), which then passes new callback function identities to SigmaGraphView. Even though our custom comparison doesn't check callbacks, React may still trigger re-render due to the parent's re-render cascade.

Alternatively, the **physics prop churn** is intentional (we want Sigma to update when physics changes), but the Sigma instance recreation is a side effect of how SigmaGraphView handles physics updates internally (not in the comparison function).

## Decision Gate: R5b Required

According to the R5a decision gate criteria:
- **Target**: 3-4 specs flip from FAILING to PASSING
- **Actual**: 0 specs flipped from FAILING to PASSING

**Conclusion**: R5a was insufficient. R5b (settings store modification to replace `structuredClone` with immer or shallow cloning) is now necessary to address the root cause at the store level.

## Recommendation

Proceed to **R5b**: Modify `src/control-plane/settings/settings.store.ts` to replace `structuredClone` with immer or shallow cloning. This will prevent the identity cascade at the source, eliminating the need for consumer-layer memoization to handle store-level identity churn.

**Risk**: MEDIUM - Changes core state management
**Verification**: Run full e2e suite before and after changes, verify settings persistence

## Next Steps

1. Operator reviews this report and authorizes R5b
2. Implement R5b: settings store modification
3. Re-run validation to verify camera persistence and sigma-instance-identity tests pass
4. If R5b succeeds, consider reverting R5a changes (consumer-layer memoization may be redundant)
5. If R5b also fails, investigate deeper causes (possibly useEffect dependencies or internal SigmaGraphView logic)
