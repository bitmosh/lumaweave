# DRAFT — vP-physics-remove-noverlap: Delete pre-FA2 grid lattice

**Status:** DRAFT — Awaiting operator visual validation
**Date:** 2026-05-14
**Pass:** vP-physics-remove-noverlap

---

## Summary

Deleted the noverlap.assign() call and its import from buildGraphologyGraph.ts. Investigation revealed that noverlap runs BEFORE FA2 starts (FA2 lives in SigmaGraphView.tsx now), despite a stale comment claiming it runs "after FA2 settles the layout." Noverlap's grid-based collision avoidance was producing a tightly-packed grid lattice that FA2 inherited and could not escape from. FA2 has its own collision avoidance via the scalingRatio repulsion force — there is no reason to run a second collision pass before FA2 starts.

---

## Changes Made

### File: src/graph/renderers/sigma2d/buildGraphologyGraph.ts

**Change 1: Delete noverlap import (line 7):**
```typescript
// Before:
import Graph from "graphology";
import noverlap from "graphology-layout-noverlap";
import { degree } from "graphology-metrics/centrality";

// After:
import Graph from "graphology";
import { degree } from "graphology-metrics/centrality";
```

---

**Change 2: Delete noverlap.assign block (lines 215-226):**
```typescript
// DELETED:
// Anti-collision pass — nudges nodes apart
// after FA2 settles the layout
noverlap.assign(graph, {
  maxIterations: 50,
  settings: {
    ratio: 1.2,
    margin: 2,
    speed: 3,
    gridSize: 25,
    expansion: 1.5,
  },
});
```

---

**Change 3: Update stale comment (line 209):**
```typescript
// Before:
// Dialect-specific layout seeding: not implemented; sunflower seed stands

// After:
// Dialect-specific layout seeding: not implemented; random scatter stands
```

Also updated line 213 comment to reflect random scatter instead of sunflower:
```typescript
// Before:
// Initial sunflower positions seed the layout

// After:
// Initial random scatter positions seed the layout
```

---

## Validation

### Grep for remaining noverlap references
```bash
grep -r "noverlap" src/
```

**Result:** One match in `src/control-plane/qa/advisory-registry.ts`

**Analysis:** This match is in the advisory registry (line 1932), which is a catalog of past/possible features, not active code:
```typescript
{
  id: "v74b-noverlap-anti-collision",
  title: "Add graphology-layout-noverlap",
  summary: "Anti-collision post-processing after FA2. Prevents node overlap in dense graph regions. Run after ForceAtlas2 for cleaner visual separation.",
  risk: "low",
  recommendedNextAction: "Install with next physics tuning pass",
}
```

This is an advisory entry describing a feature that was previously considered, not a code usage of the noverlap library. No action needed.

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

1. **Topology-shaped layout:** The graph finally spreads out into a recognizable force-directed layout
2. **Clusters visible:** Clusters visible, edges as readable lines, density gradient reflecting actual topology
3. **Seed log unchanged:** The `[LW-INSTR seed]` log spread should now equal what was achieved by the random scatter (no noverlap compression after)
4. **FA2 equilibrium:** The `[LW-INSTR post-fa2 +3s]` log spread should be in a reasonable range reflecting FA2's natural equilibrium (not constrained by grid lattice)

If the graph STILL looks crushed after this change, something else is constraining positions and we need to investigate further. But noverlap was the last position-mutating pre-FA2 pass we hadn't tested removing.

---

## Files Modified

- `src/graph/renderers/sigma2d/buildGraphologyGraph.ts` — Deleted noverlap import and noverlap.assign block, updated stale comments

---

## Files Not Modified

- `src/graph/renderers/sigma2d/SigmaGraphView.tsx` — No changes
- `src/control-plane/settings/settings.defaults.ts` — No changes
- Any other file — No changes

---

## Out of Scope

Per prompt instructions, the following were NOT touched:
- FA2 settings — left alone
- Anything in SigmaGraphView.tsx — left alone
- Settings defaults — left alone
- Removing the stale comment text was done as part of removing the noverlap.assign block (comment block was deleted with the code)

---

## Additional Findings

During the cleanup, I noticed:

1. **Stale comment about sunflower seed:** The comment "Dialect-specific layout seeding: not implemented; sunflower seed stands" was still referencing the old sunflower seed after it was replaced with random scatter. I updated this to say "random scatter stands" to match the current implementation.

2. **Advisory registry entry:** The grep found an advisory entry in advisory-registry.ts describing noverlap as a feature. This is not code usage — it's a catalog of past/possible features. No action needed.

3. **FA2 collision avoidance:** FA2 has its own collision avoidance via the scalingRatio repulsion force. This is literally what scalingRatio does. There is no reason to run a second collision pass before FA2 starts.

4. **Comment contradiction:** The comment "after FA2 settles the layout" was incorrect because noverlap runs BEFORE FA2 starts (FA2 lives in SigmaGraphView.tsx now, not in buildGraphologyGraph.ts). This is now fixed by deleting the comment entirely.

---

## XP

This is the same pattern as helix and sunflower removal: leftover scaffolding from an earlier architecture that became actively harmful when the surrounding system matured. The operator's instinct that "an old boundary system" was fighting the physics was correct from the start — it just took a while to find which boundary system it was.

The noverlap pass made sense when FA2 was a one-time batch operation in buildGraphologyGraph. But with FA2 now running continuously as a supervisor in SigmaGraphView.tsx, the pre-FA2 noverlap pass produces a tightly-packed grid lattice that FA2 inherits and cannot escape from. Removing it allows FA2 to build the layout from the neutral random scatter positions without fighting a pre-imposed grid structure.
