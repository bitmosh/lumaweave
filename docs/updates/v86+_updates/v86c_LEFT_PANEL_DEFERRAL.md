# v86c Left-Panel Tile-Out Deferral

**Date**: 2026-05-19
**Status**: Deferred until left-panel reorganization
**Branch**: fix/v86c-C1-revert-and-defer-left-panel

## What's being deferred

The four "left-panel" entries in tileSectionRegistry
(`graph-section`, `qa-section`, `evidence-section`, `debug-section`)
have been removed. These were placeholders assuming the four
left-panel TABS would be tileable as units. They shouldn't be:

1. **Debug** isn't a tile. It will be merged into a future bottom
   status bar (narrow, manual-toggle).
2. **Graph Inspector** (currently a floating panel inside the
   graph viewport) should become a regular left-panel
   CollapsibleSection between Graph Sources and Source Adapter.
3. The actual tileable units in the left panel will be
   sub-sections (e.g., `graph-sources`, `source-adapter`,
   `layout-fa2`) — not the tab containers.

## What still works

Right-dock tile-out is unaffected:
- `physics-section`: wired (Scope B, Physics tile working).
- `labels-section`: pending wiring (Scope C-2).
- `appearance-section`: pending wiring (Scope C-2).

Scope C continues with right-dock work only. Left-panel
tileable sections will be defined when left-panel
reorganization happens.

## Reorganization plan (future work)

The left panel needs structural changes before sections can be
made tileable correctly. Methods to apply when this work
happens:

### Bottom-bar Debug merge

- Reduce Debug from a full left-panel tab to a narrow button
  in the bottom status bar.
- Manual toggle only (no auto-trigger).
- Content remains similar (system index, command deck
  scaffolding), but presentation is compact.

### Graph Inspector → left-panel section

- Move from floating graph-viewport position to a regular
  left-panel CollapsibleSection.
- Position: between Graph Sources and Source Adapter.
- Inherit normal CollapsibleSection tear-off pattern.
- Becomes one of the tileable left-panel sub-sections.

### Left-panel consolidation

- Group/consolidate existing left-panel sections to reduce
  sprawl.
- Condense some sections into tabs-within-sections (e.g.,
  multiple related sub-panels in a tabbed container).
- Cut information that isn't actively useful.
- Make sections that ARE useful actually work properly.

### Tab-container pattern (aspiration)

- Future tile capability: a tile may contain multiple tabs.
- Custom tab sets defined by user (or per workspace).
- Allows compact tiles holding related but distinct content.
- Designed to support future workspace configuration system.

## Re-entry notes

When this work is picked up:

1. Audit the current left-panel structure on the live branch.
   Don't trust this doc's section list — it may have shifted.
2. Identify the actual tileable units (not the tabs).
3. Add those units to `tileSectionRegistry` as left-panel
   entries.
4. Each unit needs: `id`, `label`, `category: "left-panel"`,
   `defaultWidth`, `defaultHeight`, `collapsible`, `content`
   function, `contentTestId`, `sourceTestId`.
5. Wire the meta-test loop in `tests/e2e/v86c-tile-system.spec.ts`
   — it will pick up new entries automatically via the
   registry-driven pattern.

## What was committed in this revert

- Removed: GraphSectionContent.tsx, DebugSectionContent.tsx
  (these were never landed on main; the C-1 work-in-progress
  was discarded).
- Modified: `tileSectionRegistry.ts` — removed four
  left-panel entries.
- Documented: this file.
- CLAUDE.md: Project state section updated.
