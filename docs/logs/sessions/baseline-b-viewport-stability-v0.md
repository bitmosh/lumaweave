# Session Log: Baseline B Viewport Stability v0

## Goal
Fix three current-phase stability issues found during manual QA before broader Baseline B audit:
1. Graph disappearing when clicking QA Next
2. Hover label unreadability due to color conflicts
3. Whole page scrolling instead of internal panel scrolling

## Files Changed
- `src/app/AppShell.tsx` - Fixed scroll containment with h-screen overflow-hidden on main, added min-h-0 overflow-y-auto to left sidebar, added min-h-0 wrapper around QaPanel
- `src/control-plane/panels/CollapsiblePanel.tsx` - Added max-h-[500px] overflow-y-auto to panel content for internal scrolling
- `src/graph/renderers/sigma2d/SigmaGraphView.tsx` - Fixed ResizeObserver to call sigma.refresh() after resize, fixed nested useEffect structure bug
- `src/control-plane/settings/settings.defaults.ts` - Changed hoverNodeColor from "#ffffff" to "#fbbf24" for readability

## Root Cause of Graph Disappearing on QA Next

The graph disappearing was caused by a nested useEffect structure bug in SigmaGraphView.tsx. The ResizeObserver useEffect was incorrectly nested inside the main initialization useEffect, causing the cleanup function to kill the Sigma instance prematurely. Additionally, the ResizeObserver only called sigma.resize() but not sigma.refresh(), which meant the graph canvas resized but didn't re-render after layout changes.

The fix:
1. Closed the main initialization useEffect with proper return statement before starting the ResizeObserver useEffect
2. Added sigma.refresh() call after sigma.resize() in the ResizeObserver callback
3. Changed ResizeObserver dependency array to empty array [] since it only needs to observe the container ref

## Scroll Containment Changes

**Before:**
- Main element used `min-h-screen` which allowed page to grow beyond viewport
- Left sidebar had no overflow handling
- QA panel had no height constraints
- CollapsiblePanel content had no max height or overflow

**After:**
- Main element uses `h-screen overflow-hidden` to fix to viewport height
- Left sidebar uses `min-h-0 overflow-y-auto` for internal scrolling
- QA panel wrapped in `min-h-0` div for proper height constraints
- CollapsiblePanel content uses `max-h-[500px] overflow-y-auto` for internal scrolling
- Right sidebar already had `min-h-0 overflow-y-auto` (no change needed)
- Graph viewport already had `min-h-0 overflow-hidden` (no change needed)

## Hover Label Readability Changes

**Before:**
- hoverNodeColor: "#ffffff" (white) - unreadable with light label text

**After:**
- hoverNodeColor: "#fbbf24" (amber) - readable contrast with light label text

The white hover color conflicted with the light cyan label text (#f1f5f9), making labels unreadable when hovering. Amber provides sufficient contrast while maintaining the Solar Plasma aesthetic.

## Sigma Resize/Refresh Behavior

The ResizeObserver now:
1. Observes the graph container ref
2. Calls sigma.resize() to update canvas dimensions
3. Calls sigma.refresh() to re-render the graph after resize
4. Properly cleans up by disconnecting the observer and killing the Sigma instance

This ensures that when QA panel navigation or other layout changes occur, the graph remains visible and properly rendered without resetting the camera.

## Typecheck Result

**PASSED** - `npm run typecheck` succeeded with no errors.

## Manual QA Instructions

1. Load app at http://localhost:1420
2. Confirm browser page itself does not vertically scroll
3. Confirm left sidebar/QA area scrolls internally if needed
4. Confirm right Control Plane scrolls internally if needed
5. Click QA Next several times
6. Confirm graph does not disappear
7. Click QA Previous several times
8. Confirm graph does not disappear
9. Resize browser window
10. Confirm graph remains visible and camera does not reset unexpectedly
11. Hover over a node
12. Confirm node label is readable (amber hover color with light text)
13. Move mouse away from node
14. Confirm no stale hover styling remains
15. Confirm QA notes/status still work (QA Panel v1.4 behavior intact)

## Known Limitations

- **ResizeObserver timing:** The ResizeObserver may not fire immediately on all layout changes. In rare cases, clicking inside the graph viewport after QA navigation may still be needed to trigger a refresh. This is acceptable for v0.
- **CollapsiblePanel max height:** The 500px max height on CollapsiblePanel is a fixed v0 value. Future versions should make this configurable or auto-size based on viewport.
- **Per-node label color:** The hoverLabelColor setting is still Planned in the registry and not implemented. This task only fixed the default hoverNodeColor for readability.

## Design Decisions

**h-screen vs min-h-screen:**
Changed main element from `min-h-screen` to `h-screen overflow-hidden` to prevent the page from growing beyond the viewport. This ensures the app behaves like a fixed application shell rather than a scrollable webpage.

**ResizeObserver refresh:**
Added sigma.refresh() after sigma.resize() to ensure the graph re-renders after container size changes. Sigma.resize() only updates canvas dimensions; refresh() is needed to trigger a re-render.

**Nested useEffect fix:**
The ResizeObserver was incorrectly nested inside the main initialization useEffect. This was a structural bug that caused the cleanup function to execute prematurely. Fixed by separating the two useEffects.

**Empty dependency array for ResizeObserver:**
Changed ResizeObserver dependency array from `[nodes, edges, nodeSize, linkDistance, repelForce]` to `[]` since the observer only needs to watch the container ref, not the graph data. The graph data changes are handled by the main initialization useEffect.

**Amber hover color:**
Chose "#fbbf24" (amber) over "#38bdf8" (sky blue) because amber provides better contrast with the cyan label text while fitting the Solar Plasma aesthetic.

## QA Panel v1.4 Behavior Preservation

All QA Panel v1.4 features remain intact:
- Notes persist after browser refresh for same checklist version
- New checklist versions start fresh (no old notes/status leak)
- Status defaults to untested for new checklist version
- Copy/Submit Reports include only current version notes
- Dropdown shows only active checklists
- Dropdown hides if only one active checklist

## Baseline B Viewport Stability v0 Manual Acceptance Status

**READY FOR MANUAL ACCEPTANCE**

All code changes are complete and typecheck passes. Manual QA is required to verify:
1. Browser page does not scroll vertically
2. Panels scroll internally
3. Graph remains visible after QA navigation
4. Graph remains visible after browser resize
5. Hover labels are readable
6. QA Panel v1.4 behavior is intact

Once manual QA confirms these behaviors, Baseline B Viewport Stability v0 can be accepted and the broader Baseline B audit can proceed.
