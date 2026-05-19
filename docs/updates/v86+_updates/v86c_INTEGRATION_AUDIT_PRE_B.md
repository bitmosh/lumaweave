# v86c Integration Audit — Pre-Scope-B

**Date**: 2026-05-18
**Branch**: feat/v86c-A-diagnostic
**Test baseline**: 376/5/1 (after Phase 1 fixes)

## Phase 2a — Section content rendering

**Finding**: All 7 registered sections (graph, qa, evidence, debug, physics, appearance, labels) in `tileSectionRegistry.ts` lack a `content` field. Registry entries only contain metadata (id, label, category, defaultWidth, defaultHeight, collapsible) but no render function or component reference.

**FloatingTile.tsx** (line 151-153) has an empty `tile-body` div with comment "Content will be rendered by TileLayer" but no actual content rendering logic exists. The prototype (line 316) calls `reg.content()` to render section content, but this field is missing from the current TypeScript registry contract.

**Impact**: When a section is torn off into a floating tile, the tile appears but has no content inside it. This is the primary blocker for end-to-end tile functionality.

## Phase 2b — TileableSection wiring

**Finding**: TileableKey wiring is complete and correct.

**Pass sites:**
- `AppShell.tsx` passes tileableKey values: "graph-section", "qa-section", "evidence-section", "debug-section" (lines 498, 679, 719, 750, 784)
- `SettingsPanel.tsx` passes tileableKey from categoryToTileKey mapping: "physics-section", "labels-section", "appearance-section" (lines 19-23, 28, 36)

**Registry match**: All passed values match tileSectionRegistry ids exactly.

**CollapsibleSection.tsx** (lines 29-30, 36, 45) correctly receives tileableKey, calls `isTiledOut()` and `tileOut()` from useTileContext(), and renders the ⤴ tear-off handle (line 116-133). The tear-off handler uses a drag threshold (line 43) before creating the tile.

## Phase 2c — TileableSection vs CollapsibleSection

**Finding**: `TileableSection.tsx` exists but is dead code (not imported anywhere). The live tear-off functionality is inlined in `CollapsibleSection.tsx`.

**TileableSection.tsx** (lines 22-92) is a wrapper around CollapsibleSection that adds an onTearOff callback prop and renders a separate ⊕ button (line 61-85) positioned absolutely. This component is not referenced anywhere in the codebase.

**CollapsibleSection.tsx** (lines 12, 27-66) has the live implementation with tileableKey prop, mousedown handler (line 32), drag threshold logic (line 43), and calls to `tileOut()` from useTileContext() (line 45). The ⤴ handle is rendered inline (line 116-133).

**Recommendation**: Delete TileableSection.tsx as dead code. The CollapsibleSection+tileableKey pattern is the live architecture.

## Phase 2d — Settings persistence

**Finding**: Settings persistence is fully wired and functional.

**Schema**: `tileLayout` field declared in `settings.schema.ts` line 192 as `TileLayoutEntry[]` with shape: `{ id, sectionKey, x, y, w, h, collapsed, z }`.

**Migration**: Migration 78 (v77→v78, lines 35-50) adds tileLayout by mapping from old tiledTabs array to TileLayoutEntry format with default positions.

**Read/write**: 
- `TileProvider.tsx` (line 33) reads `ui.tileLayout` on mount
- `TileProvider.tsx` (line 39) writes to `ui.tileLayout` via `setSetting()` on tile state changes
- `settings.defaults.ts` (line 109) defaults to empty array `[]`

**Impact**: Persistence is not a blocker. Tiles will be saved and restored across reloads once content rendering is fixed.

## Phase 2e — Prototype gaps

**Finding**: Key gaps between prototype (NEW)tile-system.jsx and current TypeScript implementation:

1. **Registry contract mismatch**: Prototype registry (line 16) has `{ title, content: ()=>JSX, originPanel }` with a render function. Current TS registry has no `content` field at all.

2. **FloatingTile content rendering**: Prototype (line 316) calls `{reg.content()}` inside tile-body. Current TS FloatingTile (line 151-153) has empty tile-body with comment but no content rendering.

3. **GroupBar collapse-all**: Prototype GroupBar (lines 419-420) has collapse-all/expand-all button. Current TS GroupBar (lines 89-96) only has close button, missing collapse-all functionality.

4. **CSS styling**: Prototype uses inline `<style>` tags with custom CSS classes (lines 97-129, 320-372, 423-443, 462-469, 490-492). Current TS implementation uses className attributes but the CSS classes are not defined (likely missing from global CSS or CSS modules).

5. **Component exports**: Prototype exports to window (lines 497-500). Current TS uses proper ES module exports.

## Integration status summary

**What works**:
- TileProvider context and state management (tiles Map, tileOut, closeTile, updateTile, isTiledOut)
- CollapsibleSection tileableKey prop and tear-off handle rendering
- Drag-and-drop tile positioning with snap-to-grid
- Group computation (computeGroups) and group bar rendering
- Settings persistence (tileLayout read/write/migration)
- Data-testid infrastructure for testing

**What's wired but incomplete**:
- Registry entries exist but lack `content` render functions
- FloatingTile renders shell (header, body, resize) but body is empty
- GroupBar missing collapse-all/expand-all button
- CSS classes referenced but not defined in stylesheets

**What's missing entirely**:
- Section content rendering in floating tiles
- Registry-to-tile content bridging (how to get from sectionKey to actual JSX content)
- CSS styling for tile-layer, tile, gbar, goutline classes
- TileableSection.tsx is dead code (should be deleted)

## Scope B candidate — single-section tear-off proof

Based on findings, the most realistic Scope B target section is **physics-section**, because:

1. It has a simple, self-contained content area (settings sliders in SettingsPanel.tsx)
2. The content is already wrapped in CollapsibleSection with tileableKey
3. The content doesn't depend on complex external state (unlike graph/qa sections)
4. SettingsPanel already maps category "Physics" to tileableKey "physics-section"

The work required to get physics-section fully tearable end-to-end (handle click → floating tile with real content → drag/snap/persist → close) is roughly:

1. Add `content: () => JSX` field to physics-section entry in tileSectionRegistry.ts
2. Modify FloatingTile.tsx to call `tileSectionRegistry.getById(sectionKey).content()` and render result in tile-body
3. Define CSS classes for tile-layer, tile, tile-head, tile-body, tile-resize (port from prototype inline styles or create CSS module)
4. Delete dead TileableSection.tsx file
5. Add collapse-all button to GroupBar (optional polish)

**Estimated diff size**: ~80 lines across 4 files (tileSectionRegistry.ts: +5, FloatingTile.tsx: +3, CSS file: +60, TileableSection.tsx: -93).

**Risks identified**:
- Content rendering may require portal or ref forwarding if the original content depends on parent context
- CSS styling may conflict with existing Tailwind classes
- SettingsPanel content may need to be refactored to be extractable as a standalone component

## Scope B Outcome (2026-05-18)

Physics section successfully wired end-to-end as a floating tile. Option X (shared `PhysicsSectionContent` component) implemented.

**Files changed**:
- New: `src/control-plane/panels/PhysicsSectionContent.tsx` (+168 lines)
- Modified: `src/control-plane/settings/SettingsPanel.tsx` (-70 lines, +8 lines net)
- Modified: `src/control-plane/panels/tileSectionRegistry.ts` (+2 lines)
- Modified: `src/control-plane/panels/tile.types.ts` (+5 lines)
- Modified: `src/control-plane/panels/FloatingTile.tsx` (+9 lines)
- Modified: `tests/e2e/v86c-tile-system.spec.ts` (+42 lines)
- Deleted: `src/control-plane/panels/TileableSection.tsx` (-93 lines)

**Diff size**: ~171 lines net

**Architecture implemented**:
- Added optional `content?: () => ReactNode` field to `TileSectionEntry` interface
- Created `PhysicsSectionContent` component rendering Physics settings JSX (dialect select, sliders, HelixTwistSliders)
- Updated SettingsPanel to use `<PhysicsSectionContent />` for Physics category, inline for others
- Wired physics-section registry entry's content() to return `createElement(PhysicsSectionContent)`
- Updated FloatingTile to call `sectionEntry.content?.()` and render in tile-body with fallback placeholder
- Deleted TileableSection.tsx (confirmed dead code with zero importers in Phase 1)

**Test coverage**:
- New integration test: "v86c-B: Physics section renders content when tiled out"
- Verifies: tile renders with physics-section-content, dialect-select visible, source slot greys out via data-tiled-out
- Tile system tests: 6/6 passing (5 existing + 1 new)

**Remaining gaps for Scope C**:
- Labels section needs `LabelsSectionContent` extraction
- Graph View section needs `GraphViewSectionContent` extraction
- Other tile registry entries (qa, evidence, debug) still lack content wiring
- Group formation testing still untested (requires 2+ wired sections)
