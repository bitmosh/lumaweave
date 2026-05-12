# R5c Effect Audit: Long-Lived Effect Forensics

## Mission

Audit all useEffect blocks in SigmaGraphView.tsx for the same pattern that R5b fixed: broad dependency arrays with cleanup functions that destroy imperative resources, causing unnecessary recreation.

## Summary

**Total effects audited:** 15

**Severity breakdown:**
- HIGH: 1 (requires action)
- MEDIUM: 1 (consider fix)
- LOW: 2 (acceptable)
- NONE: 11 (no concern)

## Effects with HIGH severity (require action)

### Effect #1: Live slider updates for FA2 settings

**Line range:** 741-767

**Description:** Live slider updates for FA2 settings without graph rebuild. Stops, kills, and recreates FA2Layout worker when physics props change.

**Dependency array contents:**
```typescript
[centerForce, repelForce, linkDistance, strongGravityMode, linLogMode, adjustSizes, barnesHutTheta, physicsPreset]
```

**Cleanup function:** Yes
```typescript
if (fa2Ref.current) {
  fa2Ref.current.stop();
  fa2Ref.current.kill();
  fa2Ref.current = null;
}
```

**Destroys imperative resource:** Yes
- Calls `fa2Ref.current.stop()` and `fa2Ref.current.kill()` on FA2Layout worker
- This is a persistent worker resource that is destroyed and recreated

**Severity:** HIGH
- Cleanup destroys persistent resource (FA2Layout worker)
- Deps include 8 reactive primitives that change frequently during physics slider interaction
- When physics sliders change, the effect re-runs, killing and recreating the FA2 worker
- This is the same pattern as the R5b mount effect bug, but for FA2 instead of Sigma

**Recommendation:** SPLIT EFFECT
- Current effect: 8 deps + FA2 worker recreation on every change
- Proposed split:
  1. Mount-once FA2 worker effect with deps: `[]` (create worker once)
  2. Separate update effect that calls `fa2Ref.current.setSettings()` when physics props change
- Rationale: FA2 worker should persist across slider changes, only settings should update
- This is analogous to how Sigma now persists (R5b fix) while physics settings update via separate effect

## Effects with MEDIUM severity (consider fix)

### Effect #2: v86b uniform pipeline (rAF loop)

**Line range:** 212-233

**Description:** v86b ref-based uniform pipeline - rAF loop updates uniformsRef directly. NodeSphereProgram reads from uniformsRef on its natural render cycle.

**Dependency array contents:**
```typescript
[reduceMotion, nodeHum, nodeFlowSpeed, nodeGlow]
```

**Cleanup function:** Yes
```typescript
return () => cancelAnimationFrame(raf);
```

**Destroys imperative resource:** Yes
- Cancels animation frame (rAF)
- Animation frames are browser resources

**Severity:** MEDIUM
- Cleanup destroys browser resource (animation frame)
- Deps include 4 appearance props that could change during theme/appearance interaction
- However, rAF cancellation is less expensive than Sigma/FA2 recreation
- The pattern is intentional: animation loop restarts when appearance settings change

**Recommendation:** KEEP AS-IS (with note)
- The current pattern is acceptable because:
  - rAF cancellation is lightweight (not a full worker recreation)
  - Appearance changes are less frequent than physics slider changes
  - The animation loop needs to restart when appearance settings change
- If performance issues emerge, consider separating the rAF lifecycle from appearance updates
- But this is not a silent bug like R5b; the behavior is intentional

## Effects with LOW severity (acceptable)

### Effect #3: communityGravity centroid force

**Line range:** 236-293

**Description:** Separate useEffect for communityGravity centroid force. Adds afterRender handler for cluster centroid pull.

**Dependency array contents:**
```typescript
[communityGravity]
```

**Cleanup function:** Yes
```typescript
return () => {
  if (communityGravityRef.current) {
    sigma.removeListener("afterRender", communityGravityRef.current);
    communityGravityRef.current = null;
  }
};
```

**Destroys imperative resource:** Yes
- Removes event listener on long-lived Sigma instance
- Event listeners are resources attached to persistent objects

**Severity:** LOW
- Cleanup removes event listener on Sigma (not destroying Sigma itself)
- Single stable dep (communityGravity)
- Event listener removal is correct cleanup pattern
- The resource being cleaned up is the listener, not the persistent object

**Recommendation:** KEEP AS-IS
- Correct pattern: adds/removes listener based on single dep
- Not a resource recreation issue

### Effect #4: solar-orbit dialect

**Line range:** 296-421

**Description:** Separate useEffect for solar-orbit dialect. Adds afterRender handler for solar-orbit physics.

**Dependency array contents:**
```typescript
[physicsDialect]
```

**Cleanup function:** Yes
```typescript
return () => {
  if (solarOrbitRef.current) {
    sigma.removeListener("afterRender", solarOrbitRef.current);
    solarOrbitRef.current = null;
  }
};
```

**Destroys imperative resource:** Yes
- Removes event listener on long-lived Sigma instance

**Severity:** LOW
- Cleanup removes event listener on Sigma (not destroying Sigma itself)
- Single stable dep (physicsDialect)
- Event listener removal is correct cleanup pattern
- The resource being cleaned up is the listener, not the persistent object

**Recommendation:** KEEP AS-IS
- Correct pattern: adds/removes listener based on single dep
- Not a resource recreation issue

## Effects with LOW severity or no concern

### Effect #5: Sync resolvedTokens ref
**Line range:** 205-207
**Description:** Sync resolvedTokens ref on every render
**Deps:** `[]`
**Cleanup:** None
**Severity:** NONE
**Recommendation:** KEEP AS-IS

### Effect #6: Callback refs sync
**Line range:** 461-466
**Description:** Syncs callback refs with latest values
**Deps:** `[onSelectNode, onSetPathTarget, onSelectEdge, onClearSelection]`
**Cleanup:** None
**Severity:** NONE
**Recommendation:** KEEP AS-IS

### Effect #7: Mount effect (Sigma + FA2 creation)
**Line range:** 468-738
**Description:** Main mount effect - creates Sigma instance and FA2 worker
**Deps:** `[nodes, edges]` (narrowed in R5b)
**Cleanup:** Yes (sigma.kill(), fa2.kill())
**Severity:** NONE (already fixed in R5b)
**Recommendation:** KEEP AS-IS (R5b fix applied)

### Effect #8: Node size live update
**Line range:** 770-780
**Description:** Node size live update without rebuild
**Deps:** `[nodeSize]`
**Cleanup:** None
**Severity:** NONE
**Recommendation:** KEEP AS-IS

### Effect #9: Shortest path highlighting
**Line range:** 783-833
**Description:** Compute and highlight shortest path when pathTargetId changes
**Deps:** `[pathTargetId, selectedNodeId]`
**Cleanup:** None
**Severity:** NONE
**Recommendation:** KEEP AS-IS

### Effect #10: Clear path highlighting
**Line range:** 836-860
**Description:** Clear path highlighting when selection is cleared
**Deps:** `[selectedNodeId, selectedEdgeId, neighborhoodDepth, hoveredNodeId, hoveredEdgeId, hoverNodeColor, edgeLabelFontSize]`
**Cleanup:** None
**Severity:** NONE
**Recommendation:** KEEP AS-IS

### Effect #11: ResizeObserver
**Line range:** 863-882
**Description:** ResizeObserver to handle container size changes
**Deps:** `[]`
**Cleanup:** Yes (resizeObserver.disconnect())
**Severity:** LOW
**Recommendation:** KEEP AS-IS (correct pattern, empty deps)

### Effect #12: Selection styling
**Line range:** 885-963
**Description:** Single selection styling effect - uses graph visual policy system
**Deps:** `[selectedNodeId, selectedEdgeId, neighborhoodDepth, hoveredNodeId, hoveredEdgeId, hoverNodeColor, edgeLabelFontSize, resolvedTokens]`
**Cleanup:** None
**Severity:** NONE
**Recommendation:** KEEP AS-IS

### Effect #13: Edge label font size
**Line range:** 966-972
**Description:** Edge label font size live update effect
**Deps:** `[edgeLabelFontSize]`
**Cleanup:** None
**Severity:** NONE
**Recommendation:** KEEP AS-IS

### Effect #14: Node label font size
**Line range:** 975-981
**Description:** Node label font size live update effect
**Deps:** `[nodeLabelFontSize]`
**Cleanup:** None
**Severity:** NONE
**Recommendation:** KEEP AS-IS

### Effect #15: Label policy
**Line range:** 984-1008
**Description:** Label policy effect - applies label visibility based on mode and selection
**Deps:** `[selectedNodeId, selectedEdgeId, neighborhoodDepth, nodeLabelMode, edgeLabelMode, maxEdgeLabelLength, showLabelsOnHover, hoveredNodeId, hoveredEdgeId]`
**Cleanup:** None
**Severity:** NONE
**Recommendation:** KEEP AS-IS

## Proposed follow-up passes

### Pass 1: R5d - Fix FA2 worker recreation (HIGH priority)

**Scope:** Fix the live slider updates effect (lines 741-767)

**Problem:** FA2 worker is killed and recreated on every physics slider change, similar to the Sigma recreation bug fixed in R5b.

**Proposed fix:**
1. Create mount-once FA2 worker effect with deps: `[]`
   - Creates FA2Layout worker once on mount
   - Stores in fa2Ref
   - Cleanup: `fa2Ref.current.stop(); fa2Ref.current.kill();`
2. Create separate update effect with deps: `[centerForce, repelForce, linkDistance, strongGravityMode, linLogMode, adjustSizes, barnesHutTheta, physicsPreset]`
   - Calls `fa2Ref.current.setSettings()` when physics props change
   - No cleanup needed
   - Or use FA2's built-in settings update API if available

**Expected outcome:**
- FA2 worker persists across physics slider changes
- Only settings update, not full worker recreation
- Improved performance and stability during physics interaction
- Consistent with R5b's Sigma persistence fix

### Pass 2: Optional - v86b rAF lifecycle review (MEDIUM priority, deferrable)

**Scope:** Review v86b uniform pipeline effect (lines 212-233)

**Problem:** rAF loop is cancelled and recreated on every appearance setting change.

**Assessment:**
- This is less severe than FA2/Sigma recreation
- rAF cancellation is lightweight
- Appearance changes are less frequent than physics slider changes
- Current behavior may be intentional (restart animation when appearance changes)

**Proposed action:**
- Monitor for performance issues during theme/appearance interaction
- If issues emerge, consider separating rAF lifecycle from appearance updates
- This is a "nice to have" optimization, not a critical bug

## Validation

- No code changes made (read-only pass)
- qa:e2e baseline holds (no incidental changes)
