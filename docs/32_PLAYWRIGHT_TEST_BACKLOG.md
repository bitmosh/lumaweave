# Playwright Test Backlog

This document tracks recommended future Playwright E2E tests for LumaWeave. These are not implementation commitments but suggestions for future testing coverage.

## Recommended Future Tests

### hover-state.spec.ts

**Purpose:** Verify hover state updates correctly and resets cleanly.

**What it should verify:**
- Hovering a node updates the "Hovered Node" debug row
- Moving cursor away clears the "Hovered Node" debug row
- Hovering multiple nodes in sequence doesn't leave stale hover states
- Selected node highlight persists when hovering unselected nodes

**Blockers/Needed test IDs:**
- Renderer Debug panel needs `data-testid` or stable selector for "Hovered Node" row
- Canvas hover targeting is unreliable without data-testid hooks on nodes
- May need debug panel exposure of hover state for reliable testing

**Current Status:** Not feasible without test IDs or debug hooks. Canvas-based hover targeting is brittle.

---

### label-settings.spec.ts

**Purpose:** Verify label-related settings controls exist and function correctly.

**What it should verify:**
- Node Label Mode dropdown exists and can be changed
- Edge Label Mode dropdown exists and can be changed
- Edge Label Font Size slider exists and can be changed
- Max Edge Label Length slider exists and can be changed
- Show Labels On Hover checkbox exists and can be toggled
- Settings changes persist across page refresh

**Blockers/Needed test IDs:**
- Settings controls need `data-testid` attributes for reliable selection
- May need to verify actual label rendering changes (currently only checking control existence)

**Current Status:** Partially covered by `settings-label-controls.spec.ts` (existence only). Full behavior testing needs test IDs.

---

### selection-regression.spec.ts

**Purpose:** Verify selection behavior works correctly across node/edge/background interactions.

**What it should verify:**
- Clicking a node selects it and shows highlight
- Clicking another node clears previous selection and selects new node
- Clicking an edge clears node selection and selects edge
- Clicking background clears all selections
- Selected node highlight persists when hovering other nodes
- Selection neighborhood depth changes correctly when changing stage

**Blockers/Needed test IDs:**
- Canvas node/edge targeting needs test IDs or reliable selectors
- Selection state needs to be exposed via debug panel or test attributes
- May need visual regression testing for highlight verification

**Current Status:** Not feasible without canvas test IDs or debug state exposure.

---

### edge-labels.spec.ts

**Purpose:** Verify edge label rendering and font size changes work correctly.

**What it should verify:**
- Edge labels are visible when Edge Label Mode is not "off"
- Changing Edge Label Font Size slider updates the debug panel value
- Edge labels actually change size visually (may need screenshot comparison)
- Edge label modes (off, selected-neighborhood, all-short, all-medium) work correctly
- Edge labels follow neighborhood depth correctly

**Blockers/Needed test IDs:**
- Visual size changes require screenshot comparison or canvas inspection
- Debug panel "Edge Label Font Size" row needs `data-testid`
- May need visual regression infrastructure for size verification

**Current Status:** Can verify debug panel value changes with test IDs. Visual verification needs screenshot comparison.

---

### qa-checklist-versioning.spec.ts

**Purpose:** Verify QA checklist versioning and switching works correctly.

**What it should verify:**
- QA panel dropdown shows available checklist versions
- Switching checklist versions loads correct checks
- Checklist results persist per version (not mixed between versions)
- Submitting a report for one version doesn't clear results for other versions
- Checklist dropdown appears when multiple versions exist

**Blockers/Needed test IDs:**
- Checklist dropdown needs `data-testid`
- Multiple checklist versions need to be registered for testing
- May need to add test-specific checklist definitions

**Current Status:** Not implemented. Needs test data setup and test IDs.

---

### floating-panels.spec.ts

**Purpose:** Verify collapsible panels work correctly and don't break layout.

**What it should verify:**
- Collapsible panels can be expanded and collapsed
- Panel content is hidden when collapsed
- Panel content is visible when expanded
- Collapsing/expanding doesn't break graph rendering
- Multiple panels can be collapsed/expanded independently
- Panel state persists across page refresh

**Blockers/Needed test IDs:**
- CollapsiblePanel components need `data-testid` attributes
- Collapse/expand buttons need test IDs
- May need to verify scroll containment

**Current Status:** Not implemented. Needs test IDs on CollapsiblePanel components.

---

### graph-loading.spec.ts

**Purpose:** Verify graph loading and error handling works correctly.

**What it should verify:**
- Graph loads when valid project data is provided
- Graph shows loading state during load
- Graph shows error state when data is invalid
- Empty graph state is handled gracefully
- Graph reloads correctly when project changes

**Blockers/Needed test IDs:**
- Loading/error states need test IDs
- May need test fixtures with different graph data scenarios
- May need to mock project data loading

**Current Status:** Not implemented. Needs test data fixtures and loading state test IDs.

---

## Testing Infrastructure Recommendations

### Test ID Strategy
Add `data-testid` attributes to key interactive elements:
- Settings controls: `data-testid="settings-node-label-mode"`, etc.
- QA panel controls: `data-testid="qa-submit-button"`, etc.
- Debug panel rows: `data-testid="debug-hovered-node"`, etc.
- Collapsible panels: `data-testid="panel-collapse-button"`, etc.

### Debug Panel Exposure
Consider adding a test-only mode that exposes more state:
- Current hover state
- Current selection state
- Label policy state
- Graph rendering state

### Visual Regression
Consider adding visual regression testing for:
- Node selection highlights
- Edge selection highlights
- Label rendering
- Panel layouts

### Test Data Fixtures
Create test fixtures for:
- Different graph sizes (small, medium, large)
- Different graph structures (sparse, dense, hierarchical)
- Different QA checklist versions
- Different settings configurations

## Priority

**High Priority (feasible soon):**
- label-settings.spec.ts (with test IDs)
- qa-checklist-versioning.spec.ts (with test data)
- floating-panels.spec.ts (with test IDs)

**Medium Priority (needs infrastructure):**
- edge-labels.spec.ts (with debug panel exposure)
- selection-regression.spec.ts (with debug state exposure)
- graph-loading.spec.ts (with test fixtures)

**Low Priority (blocked by canvas targeting):**
- hover-state.spec.ts (needs canvas test IDs or alternative approach)

## Notes

- Canvas-based interaction testing is inherently brittle without test IDs
- Debug panel is a good source of testable state for graph internals
- Visual regression testing may be needed for visual correctness
- Test data fixtures are important for comprehensive coverage
