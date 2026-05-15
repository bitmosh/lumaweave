# DRAFT — vP-physics-remove-sunflower: Replace static seed with random scatter

**Status:** DRAFT — Awaiting operator visual validation
**Date:** 2026-05-14
**Pass:** vP-physics-remove-sunflower

---

## Summary

Replaced the deterministic sunflower seed with random scatter in a circle. The sunflower function was leftover from pre-physics test scaffolding and was forcing FA2 to spend its first iterations undoing the spiral pattern rather than building a topology-aware layout from neutral starting positions. Random scatter is the standard practice for force-directed layouts (D3, Cytoscape, Gephi all do this).

---

## Changes Made

### File: src/graph/renderers/sigma2d/buildGraphologyGraph.ts

**Change 1: Replace seed loop body (lines 62-70):**
```typescript
// Before:
nodes.forEach((node, index) => {
  try {
    const position = getSunflowerPosition(index, layoutScale);

    graph.addNode(node.id, {
      x: position.x,
      y: position.y,
      ...
    });
  } catch (error) { ... }
});

// After:
nodes.forEach((node) => {
  try {
    // Random scatter in a circle — FA2 builds the real layout from here
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * layoutScale;
    const position = {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };

    graph.addNode(node.id, {
      x: position.x,
      y: position.y,
      ...
    });
  } catch (error) { ... }
});
```

**Key changes:**
- Replaced `getSunflowerPosition(index, layoutScale)` with random scatter math
- Removed unused `index` parameter from forEach callback
- Added comment explaining the new approach

---

**Change 2: Delete getSunflowerPosition function (lines 30-45):**
```typescript
// DELETED:
/**
 * Generate a sunflower/golden-angle position for a node.
 * This spreads nodes evenly in a spiral pattern.
 */
function getSunflowerPosition(
  index: number,
  layoutScale: number,
): { x: number; y: number } {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const radius = Math.sqrt(index + 1) * layoutScale;
  const angle = index * goldenAngle;

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}
```

**Note:** Also removed a duplicate `LayoutSettings` interface that was accidentally present after the function (this was a side effect of the edit, not intentional but correct).

---

## Validation

### Grep for remaining getSunflowerPosition references
```bash
grep -r "getSunflowerPosition" src/
```

**Result:** Zero matches — function successfully deleted with no remaining references.

---

### Typecheck
```
> lumaweave@0.6.0 typecheck
> tsc --noEmit
```

**Status:** ✅ Clean exit, zero errors

---

## Expected Changes

Operator should reload the app and confirm:

1. **Topology-shaped layout:** Nodes spread across the viewport in a topology-shaped layout — not a spiral, not a crushed blob
2. **Recognizable force-directed graph:** Clusters visible, edges as visible lines connecting nodes, density gradient reflecting actual graph structure
3. **Instrumentation log:** The `[LW-INSTR seed]` log will show:
   - layoutScale is still ~848 for 288 nodes (Math.sqrt(288) * 50 ≈ 848)
   - Position spread should now be roughly 2x layoutScale in each axis (because random scatter fills a circle of radius layoutScale, so spread is approximately [-848, +848] in both x and y)

If the graph still looks like a crushed blob after this change, the seed was not the dominant issue and we'll move to investigate noverlap or camera fit. But seed is the highest-leverage place to test first.

---

## Files Modified

- `src/graph/renderers/sigma2d/buildGraphologyGraph.ts` — Replaced sunflower seed with random scatter, deleted getSunflowerPosition function

---

## Files Not Modified

- `src/graph/renderers/sigma2d/SigmaGraphView.tsx` — No changes
- `src/control-plane/settings/settings.defaults.ts` — No changes
- Any other file — No changes

---

## Out of Scope

Per prompt instructions, the following were NOT touched:
- noverlap pass — left alone (its settings are next on the list to look at)
- FA2 settings — left alone
- Settings defaults — left alone
- Anything in SigmaGraphView.tsx — left alone

---

## Additional Findings

During the cleanup, I noticed:

1. **Duplicate LayoutSettings interface:** The file had a duplicate `LayoutSettings` interface definition (one before getSunflowerPosition, one after). This was a side effect of the edit and was removed automatically. This was not intentional but is correct — there should only be one interface definition.

2. **No other leftover scaffolding:** I scanned the file for other patterns that might be leftover test scaffolding (e.g., commented-out code, TODOs, FIXMEs). The file looks clean aside from the instrumentation logs (which are intentional diagnostic tools).

3. **layoutScale formula unchanged:** The `layoutScale` constant at line 58 (`Math.sqrt(nodes.length) * 50`) is still correct and reused — it determines the radius of the scatter circle. This formula is appropriate for random scatter.

---

## XP

Removing static-fixture code that was fighting the dynamic physics system. This is the same pattern as the helix removal — leftover scaffolding from an earlier phase that became permanent and started causing visible issues once the system around it matured.

The sunflower seed made sense when the graph was rendered without physics (static visualization). But with FA2 running afterward, the deterministic seed positions force FA2 to spend its first iterations undoing the spiral pattern rather than building a topology-aware layout from neutral starting positions. Random scatter is the industry standard for force-directed layouts because it gives the algorithm a neutral starting point.
