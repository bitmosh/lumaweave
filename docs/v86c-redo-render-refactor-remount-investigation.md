# v86c Render Refactor - Remount Investigation

## Summary

The primary remount cause is **object identity churn in the `resolvedGraphTokens` prop**. When settings change (e.g., theme change, physics slider), the entire `settings` object gets a new identity via `structuredClone` in the Zustand store. This triggers AppShell to re-render, which recomputes `themeTokens` and `resolvedGraphTokens` as new object identities. SigmaGraphView receives the new `resolvedGraphTokens` prop identity, and since it's not memoized and the component lacks a `key` prop to stabilize it, React performs a full remount instead of a re-render.

## Findings

### 1. Zustand Store Identity Cascade (HIGH IMPACT)

**File**: `src/control-plane/settings/settings.store.ts`
**Line**: 16

**Pattern**:
```typescript
function setNestedValue(obj: any, path: string, value: unknown) {
  const keys = path.split(".");
  const copy = structuredClone(obj);  // ← NEW OBJECT IDENTITY
  let cursor = copy;
  // ...
  return copy;
}
```

**Why it causes remount**: Every `setSetting` call creates a deep clone of the entire settings tree. This means the top-level `settings` object has a new identity on every change, even if only a single primitive value changed.

**Impact**: HIGH - This is the root cause of the identity cascade.

**Proposed fix**: Use immer or shallow cloning instead of deep cloning. Only clone the path being modified, not the entire tree.

---

### 2. Computed Object Identity Churn (HIGH IMPACT)

**File**: `src/app/AppShell.tsx`
**Lines**: 199-204

**Pattern**:
```typescript
const themeTokens = getThemeRuntimeTokens(settings.appearance.theme);
const resolvedGraphTokens = resolveGraphVisualTokens(themeTokens.graph, {
  hoverNodeColor: settings.graphView.hoverNodeColor,
});
```

**Why it causes remount**: Both `getThemeRuntimeTokens` and `resolveGraphVisualTokens` return new object identities on every call. When `settings` changes (due to finding #1), these functions run again and produce new object identities for `themeTokens` and `resolvedGraphTokens`.

**Impact**: HIGH - `resolvedGraphTokens` is passed as a prop to SigmaGraphView at line 837.

**Proposed fix**: Wrap these computations in `useMemo` with dependencies on the actual values that should trigger recomputation:
```typescript
const themeTokens = useMemo(
  () => getThemeRuntimeTokens(settings.appearance.theme),
  [settings.appearance.theme]
);

const resolvedGraphTokens = useMemo(
  () => resolveGraphVisualTokens(themeTokens.graph, {
    hoverNodeColor: settings.graphView.hoverNodeColor,
  }),
  [themeTokens.graph, settings.graphView.hoverNodeColor]
);
```

---

### 3. SigmaGraphView Receives Unstable Object Prop (HIGH IMPACT)

**File**: `src/app/AppShell.tsx`
**Line**: 837

**Pattern**:
```typescript
<SigmaGraphView
  nodes={graphNodes}
  edges={graphEdges}
  nodeSize={settings.physics.nodeSize}
  // ... many primitive props ...
  resolvedTokens={resolvedGraphTokens}  // ← NEW OBJECT IDENTITY
  // ...
/>
```

**Why it causes remount**: `resolvedGraphTokens` is a computed object with a new identity on every render. SigmaGraphView is not wrapped in `React.memo` and does not have a `key` prop, so React treats the new object identity as a signal to remount the entire component tree.

**Impact**: HIGH - This is the direct trigger for SigmaGraphView remounts.

**Proposed fix**: Either:
- Wrap SigmaGraphView in `React.memo` with a custom comparison function that deep-compares `resolvedTokens`
- Or use `useMemo` on `resolvedGraphTokens` (see finding #2)

---

### 4. IIFE Wrapper (LOW IMPACT)

**File**: `src/app/AppShell.tsx`
**Lines**: 808-895

**Pattern**:
```typescript
{graphNodes && graphEdges && graphNodes.length > 0 ? (
  (() => {
    return (
      <>
        <SigmaGraphView ... />
      </>
    );
  })()
) : (...)}
```

**Why it could cause remount**: The IIFE is unnecessary and creates a new function on every render. While this doesn't directly cause remounts (React doesn't track function identities for component rendering), it's a code smell that could mask other issues.

**Impact**: LOW - Unlikely to be the primary cause, but should be cleaned up.

**Proposed fix**: Remove the IIFE wrapper:
```typescript
{graphNodes && graphEdges && graphNodes.length > 0 ? (
  <>
    <SigmaGraphView ... />
  </>
) : (...)}
```

---

### 5. No Key Prop on SigmaGraphView (MEDIUM IMPACT)

**File**: `src/app/AppShell.tsx`
**Line**: 811

**Pattern**:
```typescript
<SigmaGraphView
  // ... props ...
  // No key prop
/>
```

**Why it could cause remount**: Without a `key` prop, React uses the component's position in the tree as its identity. If the parent re-renders and the component position changes (even slightly), React may remount it instead of reusing it.

**Impact**: MEDIUM - Not the primary cause, but adding a stable key would provide additional stability.

**Proposed fix**: Add a stable key based on the graph data identity:
```typescript
<SigmaGraphView
  key={`${graphNodes.length}-${graphEdges.length}`}
  // ... props ...
/>
```

---

### 6. SigmaGraphView Not Memoized (MEDIUM IMPACT)

**File**: `src/graph/renderers/sigma2d/SigmaGraphView.tsx`
**Line**: 139

**Pattern**:
```typescript
export function SigmaGraphView({
  // ... props
}: SigmaGraphViewProps) {
  // ... component body
}
```

**Why it causes re-render**: SigmaGraphView is a regular function component, not memoized. Every time its parent re-renders, React will call the component function again. If props have changed identity, it will re-render. If the props change is significant (like `resolvedTokens` having a new identity), this can trigger expensive operations like Sigma instance recreation.

**Impact**: MEDIUM - Memoization would prevent unnecessary re-renders, but the root cause is the prop identity churn.

**Proposed fix**: Wrap SigmaGraphView in `React.memo` with a custom comparison function:
```typescript
export const SigmaGraphView = React.memo<SigmaGraphViewProps>(({
  // ... props
}) => {
  // ... component body
}, (prevProps, nextProps) => {
  // Custom comparison: deep compare resolvedTokens, shallow compare others
  return (
    prevProps.nodes === nextProps.nodes &&
    prevProps.edges === nextProps.edges &&
    prevProps.nodeSize === nextProps.nodeSize &&
    // ... other primitive props ...
    deepEqual(prevProps.resolvedTokens, nextProps.resolvedTokens)
  );
});
```

---

## Proposed R5 Implementation

### Files to Modify

1. **src/control-plane/settings/settings.store.ts** (estimated 10 lines)
   - Replace `structuredClone` with immer or shallow cloning
   - Risk: MEDIUM - changes core state management
   - Verification: Run all e2e tests, check settings persistence

2. **src/app/AppShell.tsx** (estimated 15 lines)
   - Wrap `themeTokens` and `resolvedGraphTokens` in `useMemo`
   - Remove IIFE wrapper
   - Add stable key prop to SigmaGraphView
   - Risk: LOW - pure React optimization, no logic changes
   - Verification: Visual check, e2e tests

3. **src/graph/renderers/sigma2d/SigmaGraphView.tsx** (estimated 20 lines)
   - Wrap component in `React.memo` with custom comparison
   - Risk: LOW - pure React optimization
   - Verification: Visual check, e2e tests, camera persistence tests

**Total estimated changes**: ~45 lines across 3 files

### Risk Assessment

- **Overall Risk**: MEDIUM
- **Highest Risk Item**: Zustand store modification (could affect settings persistence)
- **Mitigation**: Run full e2e suite before and after changes, verify settings persistence

### Verification Approach

1. **Baseline**: Run `npm run qa:e2e` to establish current test results (360/6/8)
2. **Apply Changes**: Implement fixes in order (store first, then AppShell, then SigmaGraphView)
3. **After Each Change**:
   - Run `npm run typecheck`
   - Run visual check in dev app
   - Run `npm run qa:e2e`
4. **Final Verification**:
   - Verify settings persistence across reloads
   - Verify camera state persists across slider changes (should now be stable)
   - Verify Sigma instance identity persists across slider changes (should now be stable)

---

## Alternative Hypotheses

### Hypothesis 1: Parent Component Remount (LOW LIKELIHOOD)

**Theory**: The parent of AppShell (e.g., main.tsx) is remounting on settings changes.

**Evidence**: AppShell is the top-level component in src/app/AppShell.tsx. No parent found in the codebase.

**Conclusion**: DISPROVED - AppShell is the root component.

---

### Hypothesis 2: Conditional Rendering (LOW LIKELIHOOD)

**Theory**: The conditional `{graphNodes && graphEdges && graphNodes.length > 0 ? (...) : (...)}` is causing remount.

**Evidence**: The conditional is stable - graph data doesn't change on slider/theme changes.

**Conclusion**: DISPROVED - Graph data is stable during settings changes.

---

### Hypothesis 3: React Strict Mode (LOW LIKELIHOOD)

**Theory**: React Strict Mode is causing double-mounts in dev mode.

**Evidence**: The issue occurs in both dev and Playwright (production-like) environments. E2E tests show camera state loss, which wouldn't happen if it were just Strict Mode double-mounts.

**Conclusion**: DISPROVED - Issue persists in non-Strict Mode environments.

---

### Hypothesis 4: Callback Function Identity (MEDIUM LIKELIHOUD)

**Theory**: The callback props (`onSelectNode`, `onSetPathTarget`, etc.) have new identities on every render, causing SigmaGraphView to remount.

**Evidence**: AppShell defines these callbacks inline at lines 842-859. They are recreated on every render.

**Conclusion**: PLAUSIBLE but SECONDARY - Even if callback identities change, React would typically re-render, not remount. The primary cause is still the `resolvedTokens` object identity churn.

---

## Ranked Causes by Impact

1. **HIGH**: Object identity churn in `resolvedGraphTokens` prop (finding #2)
2. **HIGH**: Zustand store deep cloning (finding #1)
3. **HIGH**: SigmaGraphView receives unstable object prop (finding #3)
4. **MEDIUM**: SigmaGraphView not memoized (finding #6)
5. **MEDIUM**: No key prop on SigmaGraphView (finding #5)
6. **MEDIUM**: Callback function identity churn (hypothesis #4)
7. **LOW**: IIFE wrapper (finding #4)
