# DRAFT — vP-v86b-close-1-bookmark-restyle: Slim Chip + Top-Right Stack

**Status:** DRAFT — Awaiting operator visual validation
**Date:** 2026-05-13
**Pass:** vP-v86b-close-1-bookmark-restyle

---

## Summary

Restyled the FloatingBookmark component to a slim chip visual and restacked the three demo bookmark entries vertically in the top-right corner to eliminate collision with the Minimap. Typecheck passes with zero errors.

---

## Changes Made

### File: src/graph/overlay/FloatingBookmark.tsx

**Slimmed down the chip visual (lines 28, 35, 41):**

```typescript
// Before
className="absolute cursor-pointer rounded-lg px-3 py-2 shadow-lg backdrop-blur-sm border"
fontSize: 12,
<div className="text-xs opacity-75">{bookmark.sub}</div>

// After
className="absolute cursor-pointer rounded-lg px-2 py-1 w-32 shadow-lg backdrop-blur-sm border"
fontSize: 11,
<div className="text-[10px] opacity-70">{bookmark.sub}</div>
```

**Changes:**
- `px-3 py-2` → `px-2 py-1` (tighter padding)
- Added `w-32` (fixed width for consistent pill shape)
- `fontSize: 12` → `fontSize: 11` (smaller text)
- `text-xs opacity-75` → `text-[10px] opacity-70` (smaller sub-text)

**Preserved:**
- `rounded-lg`, `shadow-lg`, `backdrop-blur-sm`, `border` (visual polish)
- Type-colored background with opacity (`typeColors[bookmark.type] + "33"`)
- Type-colored border (`typeColors[bookmark.type]`)
- `transform: "translate(-50%, -50%)"` (centering)
- Click handler and label/sub rendering

---

### File: src/graph/overlay/bookmarkRegistry.ts

**Updated demo bookmark positions to stack vertically in top-right corner (lines 72, 80, 88):**

```typescript
// Before
demo-alert-1: position: { x: 0.1, y: 0.1 }   // top-left
demo-pinned-1: position: { x: 0.9, y: 0.1 }  // top-right
demo-ref-1: position: { x: 0.9, y: 0.9 }    // bottom-right (collided with Minimap)

// After
demo-alert-1: position: { x: 0.94, y: 0.06 }  // top-right, first
demo-pinned-1: position: { x: 0.94, y: 0.14 } // top-right, second
demo-ref-1: position: { x: 0.94, y: 0.22 }   // top-right, third
```

**Layout math:**
- All three anchored at `x: 0.94` (~6% from right edge)
- Vertical spacing: `y: 0.06`, `0.14`, `0.22` (~8% between chips)
- Starting position: `y: 0.06` (~6% from top edge)
- The existing `transform: translate(-50%, -50%)` in FloatingBookmark means these coordinates are the *center* of each chip, so the anchor math works out cleanly

**Preserved:**
- All other fields (id, type, label, sub) unchanged
- Registry contract and singleton pattern unchanged

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

1. **Three bookmarks stacked vertically in the top-right corner** — All three demo entries (Alert, Pinned, Reference) should appear in a vertical stack along the right edge near the top of the viewport.

2. **Each chip is noticeably smaller than before** — The chips should appear as slim pills (w-32 with px-2 py-1) rather than full panels. Text should be slightly smaller (11px vs 12px, sub-text 10px vs 12px).

3. **Reference bookmark no longer overlapping the Minimap** — The Reference bookmark (blue) should now be in the top-right stack, not in the bottom-right where it collided with the Minimap.

4. **Colors still differentiated by type** — Alert (red), Pinned (orange), Reference (blue) should still have their type-colored backgrounds and borders.

---

## Findings

### Nothing out of scope flagged

Both files were straightforward with no unexpected patterns or architectural concerns. The FloatingBookmark component is a simple presentational component with clear props and styling. The bookmarkRegistry follows the standard registry contract pattern from v86a with no deviations.

---

## Files Modified

- `src/graph/overlay/FloatingBookmark.tsx` — Slimmed chip visual (padding, width, font sizes)
- `src/graph/overlay/bookmarkRegistry.ts` — Updated demo bookmark positions to top-right stack

---

## Files Not Modified

- AppShell.tsx — Out of scope per prompt
- BookmarkLayer.tsx — Out of scope per prompt
- Theme tokens or color values — Out of scope per prompt
- Any other overlay component — Out of scope per prompt

---

## XP Notes

Tiny pass, instant visual improvement, no architectural risk. Bookmark layout was the only thing in close-1 that looked half-finished — this finishes it. The slim chip visual is more appropriate for an ambient overlay that doesn't obstruct the graph view.
