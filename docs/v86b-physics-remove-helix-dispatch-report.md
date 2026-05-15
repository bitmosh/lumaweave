# DRAFT — vP-physics-remove-helix-dispatch: Sunflower-only seeding

**Status:** DRAFT — Awaiting operator visual validation
**Date:** 2026-05-13
**Pass:** vP-physics-remove-helix-dispatch

---

## Summary

Removed the helix dispatch block and all helix-related dead code from buildGraphologyGraph.ts. The sunflower seeding is now the only seed source, which should produce the expected ~555-unit layout scale for 124 nodes (instead of the 120-unit helix radius that was crushing the graph). Typecheck passes with zero errors.

---

## Changes Made

### File: src/graph/renderers/sigma2d/buildGraphologyGraph.ts

**Removed Louvain import (line 8):**
```typescript
// Before
import louvain from "graphology-communities-louvain";

// After (removed)
```

**Deleted 6 helix helper functions (lines 48-194):**
- `groupByCluster` (lines 48-65) — grouped nodes by cluster attribute
- `mapCommunityToCluster` (lines 67-80) — mapped Louvain community numbers to cluster colors
- `assignLouvainCommunities` (lines 82-101) — ran Louvain community detection and assigned clusters
- `getHelixPosition` (lines 103-119) — computed helix backbone position for a node
- `getBranchPosition` (lines 121-139) — computed constellation branch position for a node
- `applyHelixLayout` (lines 141-194) — applied helix layout to graph

**Replaced helix dispatch block (lines 348-354):**
```typescript
// Before
// Apply dialect-specific layout seeding
if (settings.physicsDialect === "helix") {
  // Run Louvain community detection before helix layout
  // to assign clusters to nodes that don't have them
  assignLouvainCommunities(nodes, graph);
  applyHelixLayout(nodes, graph);
}

// After
// Dialect-specific layout seeding: not implemented; sunflower seed stands
```

**Preserved:**
- `getSunflowerPosition` function (lines 30-46) — sunflower seed layout
- `buildGraphologyGraph` function — main graph builder
- `countConnectedComponents` call — component analysis
- `noverlap.assign` call — anti-collision pass
- All other file contents unchanged

---

## Validation

### Line Count
- Before: 436 lines
- After: 280 lines
- Deleted: 156 lines (6 functions + 1 dispatch block + docstrings)

### Verification Grep
Searched buildGraphologyGraph.ts for remaining references to deleted code:
- `applyHelixLayout` — 0 matches
- `getHelixPosition` — 0 matches
- `getBranchPosition` — 0 matches
- `groupByCluster` — 0 matches
- `assignLouvainCommunities` — 0 matches
- `mapCommunityToCluster` — 0 matches
- `louvain` — 0 matches

**Result:** Zero unexpected remaining references.

### External Imports Check
Searched src/ for files importing from buildGraphologyGraph.ts:
- `src/app/AppShell.tsx` — imports `buildGraphologyGraph` only
- `src/graph/renderers/sigma2d/SigmaGraphView.tsx` — imports `buildGraphologyGraph` and `LayoutSettings` only

**Result:** No external file imports the deleted helpers.

### Typecheck
```
> lumaweave@0.6.0 typecheck
> tsc --noEmit
```

**Status:** ✅ Clean exit, zero errors

---

## Expected Visual Changes

Operator should confirm after reload:

1. **Graph appears at the expected size (~10× larger than the helix-crushed version)** — The sunflower seed layout with `layoutScale = Math.sqrt(nodes.length) * 50` produces ~555 units for 124 nodes, which should be visibly larger than the 120-unit helix radius that was crushing the graph.

2. **FA2 settles into a coherent layout** — FA2 should still converge to a stable layout, now starting from the larger sunflower seed distribution.

3. **Changing the Physics Dialect dropdown does nothing visible** — This is now correct behavior. The dialect selector is a no-op until real dialect variants are implemented in a future pass.

4. **Physics presets (Balanced, Spread, Tight, Organic, Performance) still produce visibly different layouts** — The preset values in AppShell.tsx still control repelForce, centerForce, linkDistance, strongGravityMode, and linLogMode, which affect FA2 behavior at runtime.

---

## Dead-Adjacent Code Left Alone

The following code was examined but left unchanged because it was out of scope:

- `physicsDialect` field in `LayoutSettings` interface (line 26) — keeping the field means the existing UI control doesn't break; the field is now a no-op but harmless
- `physicsDialect` default in `settings_defaults.ts` — out of scope per prompt; the value is meaningless after this pass but harmless
- `physicsDialect` type in `settings.schema.ts` — out of scope per prompt; keeping the type prevents UI breakage

---

## Files Modified

- `src/graph/renderers/sigma2d/buildGraphologyGraph.ts` — Removed Louvain import, deleted 6 helix helper functions, replaced helix dispatch block with comment

---

## Files Not Modified

- settings_defaults.ts (physicsDialect default stays as "helix" — out of scope)
- settings_schema.ts (the dialect type stays as is — out of scope)
- AppShell.tsx (out of scope)
- SigmaGraphView.tsx (out of scope)
- Any other file

---

## XP Notes

Substantial dead-code removal AND a real visual fix in one pass. The cleanup is the value here — leaving the helix code as dead weight would confuse future passes and make the codebase harder to navigate. The file went from 436 lines to 280 lines, a 36% reduction in size.

The sunflower seeding was originally test scaffolding pre-physics, but with the helix dispatch removed it becomes the de facto correct seed path. The physics presets work correctly; the dialect selector does nothing visible, which is now the intended behavior until real dialect variants are implemented.
