# Session Log: Baseline B Runtime Diagnostics v0

## Goal

Add runtime-visible diagnostics and debug/test hooks for hover and label controls to investigate the discrepancy between code inspection (appears correct) and manual QA (reports failures).

**Key insight from user:** Manual QA is the source of truth. If manual QA says something is broken, report it as broken even if code looks correct. When code inspection says yes but manual QA says no, the fix is instrumentation: make hidden state visible, then test it.

## Correction from Previous Session

**Previous claim:** SettingsPanel is not in the UI.

**Actual state:** SettingsPanel IS in the UI at AppShell.tsx line 346, in the right dock under "Control Plane" heading.

**Impact:** The previous session's claim that SettingsPanel was not visible was incorrect. The settings-label-controls.spec.ts test was skipped based on this incorrect claim.

## Files Changed

### AppShell.tsx
- Added `data-testid="settings-panel"` to right dock aside (line 340)
- Added `data-testid="graph-sources-panel"` to left dock aside (line 120)
- Added `data-testid="qa-panel"` to QA panel container (line 237)
- Added `data-testid="graph-viewport"` to graph section (line 247)

### SigmaGraphView.tsx
- Added `data-testid="renderer-debug-panel"` to renderer debug panel container (line 452)
- Added `data-testid="hovered-node-debug-row"` to Hovered Node debug row (line 483)
- Added `data-testid="selected-node-debug-row"` to Selected Node debug row (line 475)
- Added `data-testid="selected-edge-debug-row"` to Selected Edge debug row (line 476)
- Added `data-testid="node-label-mode-debug-row"` to Node Label Mode debug row (line 479)
- Added `data-testid="edge-label-mode-debug-row"` to Edge Label Mode debug row (line 480)
- Added `data-testid="edge-label-font-size-debug-row"` to Edge Label Font Size debug row (line 482)
- Added console.log to enterNode event handler: `[HOVER] enterNode: {nodeId}` (line 343)
- Added console.log to leaveNode event handler: `[HOVER] leaveNode: clearing hoveredNodeId` (line 348)
- Added console.log to unified styling effect start: `[STYLING] Running unified effect` with state (line 388)
- Added console.log after reset: `[STYLING] Reset all graph styles to default` (line 398)
- Added console.log after selected edge styling: `[STYLING] Applied selected edge styling: {edgeId}` (line 416)
- Added console.log after selected node styling: `[STYLING] Applied selected node styling: {nodeId} stage {stage}` (line 425)
- Added console.log when no selection: `[STYLING] No selection` (line 428)
- Added console.log after hover styling: `[STYLING] Applied hover styling: {nodeId} color: {color}` (line 434)
- Added console.log when hovered node is selected: `[STYLING] Hovered node is selected, skipping hover styling: {nodeId}` (line 436)
- Added console.log when no hovered node: `[STYLING] No hovered node` (line 438)
- Added console.log after Sigma refresh: `[STYLING] Refreshed Sigma` (line 442)
- Added console.log to Sigma config: `[SIGMA CONFIG] labelColor: #0f172a edgeLabelSize: {size}` (line 318)

### SettingsPanel.tsx
- Added `data-testid="setting-{path}"` to select inputs (line 106)
- Added `data-testid="setting-{path}"` to range inputs (line 77)
- Path dots are replaced with dashes for valid test IDs (e.g., `labels.edgeLabelFontSize` becomes `setting-labels-edgeLabelFontSize`)

### settings-label-controls.spec.ts
- Removed test.skip() that claimed SettingsPanel was not implemented
- Updated test to use `data-testid="settings-panel"` to find settings panel
- Updated test to use `data-testid="setting-labels-nodeLabelMode"` for Node Label Mode control
- Updated test to use `data-testid="setting-labels-edgeLabelMode"` for Edge Label Mode control
- Updated test to use `data-testid="setting-labels-edgeLabelFontSize"` for Edge Label Font Size control

## Debug Rows Verified

The following debug rows exist in the Renderer Debug panel with data-testid attributes:
- Hovered Node (data-testid="hovered-node-debug-row")
- Selected Node (data-testid="selected-node-debug-row")
- Selected Edge (data-testid="selected-edge-debug-row")
- Node Selection Stage
- Active Selection Mode
- Node Label Mode (data-testid="node-label-mode-debug-row")
- Edge Label Mode (data-testid="edge-label-mode-debug-row")
- Edge Label Font Size (data-testid="edge-label-font-size-debug-row")
- Show Labels On Hover
- Zoom Label Threshold

## Runtime Diagnostics Added

### Hover Event Handlers
- `enterNode`: Logs when cursor enters a node with node ID
- `leaveNode`: Logs when cursor leaves a node and clears hoveredNodeId

### Unified Styling Effect
Logs the complete styling cycle:
1. Effect trigger with current state (selectedNodeId, selectedEdgeId, nodeSelectionStage, hoveredNodeId, hoverNodeColor)
2. Reset all styles to default
3. Apply selected edge OR selected node styling
4. Apply hovered node styling (if applicable and not selected)
5. Sigma refresh

### Sigma Config
Logs initial Sigma configuration:
- labelColor: "#0f172a"
- edgeLabelSize: current value

## Edge Label Font Size Setting

Already in place from previous session:
- settings.schema.ts: `labels.edgeLabelFontSize: number`
- settings.defaults.ts: `edgeLabelFontSize: 13`
- settings.registry.ts: range control (min: 8, max: 24, step: 1)
- AppShell.tsx: passed to SigmaGraphView
- SigmaGraphView.tsx: used as `edgeLabelSize` in Sigma config
- Debug panel: shows current value

**Status:** Fully wired and visible in SettingsPanel under Labels category.

## Hover Label Readability

Current configuration:
- Sigma global labelColor: "#0f172a" (dark slate)
- No label background configuration in Sigma config
- Sigma uses default label background (likely white/transparent)

**Status:** Dark label text should be readable on most node backgrounds. If manual QA still reports unreadability, the issue may be:
- Sigma not applying the labelColor setting at runtime
- Label background is white and text is still light (Sigma override)
- Browser-specific rendering behavior

**Runtime verification:** Console log added to Sigma config to verify labelColor is set to "#0f172a".

## Hover Color Reset

Current architecture:
- enterNode sets hoveredNodeId
- leaveNode clears hoveredNodeId
- Unified styling effect runs on hoveredNodeId dependency
- Effect resets all styles before applying selection and hover
- Hover styling is applied last

**Status:** Code architecture appears correct. Runtime diagnostics added to verify:
1. enterNode actually fires and sets hoveredNodeId
2. leaveNode actually fires and clears hoveredNodeId
3. Unified effect actually runs when hoveredNodeId changes
4. Reset actually applies default colors
5. Hover styling actually applies hover color

## Validation Results

### Typecheck
**PASSED**

### Playwright E2E
**PASSED** (7 passed)
- app-smoke.spec.ts ✓
- qa-panel.spec.ts ✓
- qa-navigation.spec.ts ✓
- qa-refresh.spec.ts ✓
- viewport-stability.spec.ts ✓
- qa-submit.spec.ts ✓
- settings-label-controls.spec.ts ✓ (previously skipped, now passing)

## Manual QA vs Code Inspection Discrepancy

**Current state:**
- Code inspection: Architecture appears correct
- Manual QA: Reports failures (hover stale, label unreadable, selection not persisting)

**Instrumentation added:**
- Console logs for hover events
- Console logs for styling effect state transitions
- Console logs for Sigma config
- data-testid attributes for Playwright testing
- data-testid attributes for debug rows

**Next step for manual QA:**
Run the app and check browser console logs to see:
1. Does enterNode fire when hovering a node?
2. Does leaveNode fire when cursor leaves?
3. Does the unified styling effect run when hoveredNodeId changes?
4. Does the effect reset styles before applying new ones?
5. Does Sigma config show labelColor: "#0f172a"?

If console logs show correct behavior but visual rendering is wrong, the issue is likely:
- Sigma rendering behavior not visible in code
- Browser-specific rendering
- Sigma version/configuration differences

## Known Limitations

1. **hoverLabelColor misleading**: Setting exists but is not actually wired to Sigma label rendering. Sigma uses global labelColor configuration directly.

2. **Manual QA discrepancy**: Code appears correct but manual QA reports failures. Runtime diagnostics added to investigate.

3. **Canvas testing**: Hover/selection tests still need canvas-based interaction or debug state exposure for full Playwright coverage.

## Files Changed Summary

- `src/app/AppShell.tsx`: Added data-testid attributes to panels
- `src/graph/renderers/sigma2d/SigmaGraphView.tsx`: Added data-testid to debug panel and rows, added console.log diagnostics
- `src/control-plane/settings/SettingsPanel.tsx`: Added data-testid to controls
- `tests/e2e/settings-label-controls.spec.ts`: Fixed to test actual visible controls

## Summary

This session focused on instrumentation to investigate the discrepancy between code inspection (appears correct) and manual QA (reports failures). Added:

1. data-testid attributes for reliable Playwright testing
2. Console logs for hover event handlers
3. Console logs for unified styling effect state transitions
4. Console logs for Sigma config verification
5. Fixed settings-label-controls.spec.ts to test actual visible controls

All Playwright tests now pass. Manual QA should check browser console logs to verify runtime behavior matches code expectations.

Typecheck: **PASSED**
Playwright E2E: **PASSED** (7 passed)
