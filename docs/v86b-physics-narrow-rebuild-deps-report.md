# DRAFT — vP-physics-narrow-rebuild-deps: Stop - resolvedTokens usage detected

**Status:** STOP - Cannot proceed per verification check #3
**Date:** 2026-05-13
**Pass:** vP-physics-narrow-rebuild-deps

---

## Summary

The rebuild useEffect deps array is already `[nodes, edges]` at line 738, not the physics deps array mentioned in the prompt. However, verification check #3 surfaced that `resolvedTokens` is used extensively in the rebuild effect body, which means removing it from deps would cause stale values to be used. Per prompt instructions, I am stopping and reporting this finding for discussion.

---

## Verification Check Results

### Check #1: Live-update effect deps
**Status:** ✅ Pass

The live-update FA2 effect at lines 765-767 has the expected physics deps:
```typescript
}, [centerForce, repelForce, linkDistance,
    strongGravityMode, linLogMode, adjustSizes,
    barnesHutTheta, physicsPreset]);
```

This confirms that the live-update effect handles physics slider changes without requiring a graph rebuild.

### Check #2: Other effects watching physics deps
**Status:** ✅ Pass

Grep for `linkDistance`, `repelForce`, and `centerForce` in useEffect deps arrays found:
- Line 765-767: Live-update FA2 effect (expected)
- Line 738: Rebuild effect (already has `[nodes, edges]`)

No other effects watch these three physics deps. The rebuild effect is the only one that would need to be changed.

### Check #3: resolvedTokens usage in rebuild effect body
**Status:** ❌ FAIL - Usage detected

The rebuild effect body (lines 468-737) uses `resolvedTokens` in multiple places:

1. **Line 452** (inside rebuild effect, passed to buildGraphologyGraph):
   ```typescript
   nodeColorScale: resolvedTokensRef.current?.nodeColorScale,
   ```

2. **Line 538** (applyGraphStylePolicy call):
   ```typescript
   applyGraphStylePolicy(graph, interactionState, styleOptions, resolvedTokens);
   ```

3. **Lines 544-558** (Sigma configuration):
   ```typescript
   labelFont: resolvedTokens.sigmaConfig.labelFont,
   labelColor: { attribute: "labelColor", color: resolvedTokens.nodeLabelColor.default },
   labelRenderedSizeThreshold: resolvedTokens.sigmaConfig.labelRenderedSizeThreshold,
   defaultNodeColor: resolvedTokens.nodeColor.default,
   defaultEdgeColor: resolvedTokens.edgeColor.default,
   edgeLabelFont: resolvedTokens.sigmaConfig.edgeLabelFont,
   edgeLabelColor: { color: resolvedTokens.edgeLabelColor.default },
   ```

4. **Line 853** (in a different effect, but shows usage pattern):
   ```typescript
   hoverNodeColor || (resolvedTokensRef.current?.nodeColor?.hover ?? graphVisualTokens.nodeColor.hover),
   ```

5. **Line 907** (in a different effect):
   ```typescript
   applyGraphStylePolicy(graph, interactionState, styleOptions, resolvedTokens);
   ```

6. **Line 963** (different effect deps):
   ```typescript
   }, [selectedNodeId, selectedEdgeId, neighborhoodDepth, hoveredNodeId, hoveredEdgeId, hoverNodeColor, edgeLabelFontSize, resolvedTokens]);
   ```

---

## Current State of Rebuild Effect Deps

The rebuild useEffect at line 738 already has:
```typescript
}, [nodes, edges]);
```

This is already the narrow deps array the prompt requests. The physics deps (`linkDistance`, `repelForce`, `centerForce`, `physicsDialect`, `resolvedTokens`) are NOT in the current deps array.

This suggests either:
1. The deps were already narrowed in a previous pass
2. The prompt is based on an older version of the file before the deps were narrowed
3. The line numbers shifted due to the helix removal pass (156 lines deleted from buildGraphologyGraph.ts)

---

## Issue: resolvedTokens Not in Deps But Used in Body

The current deps array is `[nodes, edges]`, which does NOT include `resolvedTokens`. However, `resolvedTokens` is used extensively in the rebuild effect body (lines 538, 544-558).

This means:
- If `resolvedTokens` changes (e.g., theme hot-update), the rebuild effect will NOT re-run
- The Sigma instance will be created with stale `resolvedTokens` values
- Theme changes may not visually update until the next graph rebuild (nodes/edges change)

This is a separate issue from the physics deps narrowing. The physics deps narrowing is already done, but `resolvedTokens` should likely be in the deps array to support theme hot-updates.

---

## Recommendation

Per prompt instructions: "If verification check #3 surfaces real usage of resolvedTokens inside the rebuild effect body, STOP and report — don't change anything. We'll need to discuss how to handle that separately."

**Recommended next steps:**
1. Discuss whether to add `resolvedTokens` to the rebuild effect deps to support theme hot-updates
2. Discuss whether theme hot-updates should trigger a graph rebuild at all (maybe theme changes should be handled by a separate live-update effect)
3. Verify the current behavior: does changing themes visually update the graph without a nodes/edges change?

**Alternative approach:**
If theme hot-updates should NOT trigger a graph rebuild, the current state (deps = `[nodes, edges]`) is correct, and `resolvedTokens` usage in the rebuild effect body should be refactored to use a live-update pattern similar to the physics sliders.

---

## Files Examined

- `src/graph/renderers/sigma2d/SigmaGraphView.tsx` — examined rebuild useEffect (lines 468-738), live-update FA2 effect (lines 741-767), and resolvedTokens usage throughout

---

## Files Not Modified

No files were modified per verification check #3 stop condition.
