# System Index Panel Route Discovery

**Version**: v72d.2
**Purpose**: Inspect and document existing app shell, route, tab, and control-plane mount patterns to determine the safest future mount path for SystemIndexPanel.

## Inspected Files

1. **src/App.tsx** (13 lines)
   - Simple wrapper that renders AppShell
   - No routing logic
   - Imports AppProviders and AppShell

2. **src/app/AppShell.tsx** (556 lines)
   - Main app shell with 3-column grid layout
   - No routing system - single-page app
   - All panels mounted at once (no conditional rendering)
   - Uses data-testid attributes for Playwright targeting

3. **tests/e2e/qa-panel.spec.ts** (18 lines)
   - Tests use `page.goto("/")` to access the app
   - No route navigation tests (single-page app)

4. **tests/e2e/contract-registry.spec.ts** (554 lines)
   - Tests use `page.goto("/")` to access the app
   - Tests access panels via data-testid attributes (e.g., "qa-panel", "qa-tab-checklist")
   - No route navigation tests

## Current App Shell / Route Structure

**Layout**: 3-column grid: `grid-cols-[280px_1fr_420px]`

**Left Sidebar (280px)**:
- Graph Sources panel (data-testid="graph-sources-panel")
- QA Panel (data-testid="qa-panel")
- Command Deck Panel (data-testid="command-deck-panel")
- Graph Visual Inventory Panel (data-testid="graph-visual-inventory-panel")

**Center (1fr)**:
- Sigma Graph View (data-testid="graph-viewport")
- Floating Graph Inspector (CollapsiblePanel with InspectorPanel)
- Theme Target Inspector Overlay (when enabled)

**Right Sidebar (420px)**:
- Settings Panel / Control Plane (data-testid="settings-panel")

**Key Finding**: No routing system exists. This is a single-page app where all panels are mounted at once in a fixed layout. There are no tabs, no routes, no conditional rendering, and no navigation logic.

## Existing Mount Patterns

**Pattern 1: Left Sidebar Panels**
- Panels are mounted in the left sidebar using consistent structure:
  ```tsx
  <div className="mt-4 rounded-xl p-4" data-testid="<panel-name>-panel">
    <h3 className="mb-2 text-sm font-semibold">Panel Title</h3>
    <div className="min-h-0">
      <PanelComponent />
    </div>
  </div>
  ```
- Examples: QA Panel, Command Deck Panel, Graph Visual Inventory Panel

**Pattern 2: Right Sidebar Control Plane**
- Settings Panel is mounted in the right sidebar with:
  ```tsx
  <aside className="min-h-0 overflow-y-auto p-4" data-testid="settings-panel">
    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider">Control Plane</h2>
    <div className="space-y-4">
      <SettingsPanel />
    </div>
  </aside>
  ```

**Pattern 3: Floating Panels**
- Graph Inspector is a floating panel using CollapsiblePanel component
- Mounted absolutely over the graph viewport

**Pattern 4: Playwright Test Access**
- Tests use `page.goto("/")` to access the app
- Tests target panels via data-testid attributes
- No route navigation tests (single-page app)

## Where Panels Mount

**QaPanel**: Left sidebar, below Graph Sources panel
- data-testid="qa-panel"
- Receives theme props and theme inspector toggle callback
- No conditional rendering

**GraphVisualInventoryPanel**: Left sidebar, below Command Deck panel
- data-testid="graph-visual-inventory-panel"
- No conditional rendering
- Read-only inventory display

**CommandDeckPanel**: Left sidebar, below QA panel
- data-testid="command-deck-panel"
- No conditional rendering

**SettingsPanel**: Right sidebar (Control Plane)
- data-testid="settings-panel"
- No conditional rendering

## Candidate Mount Options

### Option 1: Add to Left Sidebar (Below GraphVisualInventoryPanel)

**Description**: Add SystemIndexPanel to the left sidebar, below GraphVisualInventoryPanel.

**Benefit**:
- Consistent with existing left sidebar pattern
- Easy to implement (add another panel div)
- Playwright targeting via data-testid
- No routing changes needed

**Risk**:
- Left sidebar may become crowded (4 panels already)
- May require scrolling to see all panels
- No isolation from existing panels

**Testability**: High (data-testid targeting, same pattern as existing panels)

**Blast Radius**: Low (adds one panel to existing sidebar)

**Recommendation**: Acceptable if sidebar space is sufficient

---

### Option 2: Add to Right Sidebar (Below SettingsPanel)

**Description**: Add SystemIndexPanel to the right sidebar (Control Plane), below SettingsPanel.

**Benefit**:
- Consistent with right sidebar pattern
- Control Plane context fits System Index content
- Less crowded than left sidebar

**Risk**:
- Right sidebar is labeled "Control Plane" - may need clarification
- SettingsPanel may need restructuring
- May require SettingsPanel changes

**Testability**: High (data-testid targeting)

**Blast Radius**: Low-Medium (may require SettingsPanel restructuring)

**Recommendation**: Acceptable if SettingsPanel changes are minimal

---

### Option 3: Add as New Right Sidebar Section (Above SettingsPanel)

**Description**: Add SystemIndexPanel as a new section in the right sidebar, above SettingsPanel, with its own header.

**Benefit**:
- Isolated from SettingsPanel
- Clear separation of concerns
- Control Plane context fits System Index

**Risk**:
- Requires right sidebar restructuring
- May affect SettingsPanel visibility

**Testability**: High (data-testid targeting)

**Blast Radius**: Medium (requires right sidebar restructuring)

**Recommendation**: Requires careful right sidebar contract

---

### Option 4: Add as Floating Panel (Like Graph Inspector)

**Description**: Add SystemIndexPanel as a floating panel using CollapsiblePanel, similar to Graph Inspector.

**Benefit**:
- Isolated from fixed layout
- Can be toggled on/off
- No sidebar restructuring needed

**Risk**:
- Floating panels are overlay-only (not for persistent content)
- May obscure graph view
- Not consistent with persistent control-plane content

**Testability**: Medium (floating panel targeting)

**Blast Radius**: Low (no layout changes)

**Recommendation**: Not recommended for persistent content

---

### Option 5: Defer Until Human Mode vs Evidence Mode

**Description**: Defer mount decision until v73 Human Mode vs Evidence Mode contract, which may provide a natural integration point.

**Benefit**:
- Avoids premature integration
- Allows v73 contract to inform mount strategy
- Prevents repeating v69 failure pattern

**Risk**:
- Delays visibility of System Index Panel
- Requires additional planning

**Testability**: N/A (deferred)

**Blast Radius**: Zero (no integration)

**Recommendation**: Safe fallback if no clear low-risk mount exists

## Recommended Future Mount

**Primary Recommendation**: Option 1 (Add to Left Sidebar Below GraphVisualInventoryPanel)

**Rationale**:
- Lowest blast radius (adds one panel to existing sidebar)
- Consistent with existing left sidebar pattern
- No routing changes needed
- Playwright targeting via data-testid
- No conditional rendering or complex state management

**Secondary Recommendation**: Option 2 (Add to Right Sidebar Below SettingsPanel)

**Rationale**:
- Control Plane context fits System Index content
- Less crowded than left sidebar
- Consistent with right sidebar pattern
- Playwright targeting via data-testid

**Fallback**: Option 5 (Defer Until Human Mode vs Evidence Mode)

**Rationale**:
- Safe fallback if sidebar space is insufficient
- Allows v73 contract to inform mount strategy

## Files Likely Touched For Future Mount

For Option 1 (Left Sidebar):
- src/app/AppShell.tsx (add SystemIndexPanel import and mount)
- src/control-plane/system-index/SystemIndexPanel.tsx (may need minor adjustments)
- tests/e2e/system-index.spec.ts (new test file for SystemIndexPanel)

For Option 2 (Right Sidebar):
- src/app/AppShell.tsx (add SystemIndexPanel import and mount)
- src/control-plane/settings/SettingsPanel.tsx (may need minor restructuring)
- src/control-plane/system-index/SystemIndexPanel.tsx (may need minor adjustments)
- tests/e2e/system-index.spec.ts (new test file for SystemIndexPanel)

## Future Playwright Contract

Future integration pass (v72d.3 or later) must include Playwright tests that verify:

1. **SystemIndexPanel renders**
   - Test: `await page.goto("/");`
   - Test: `await expect(page.getByTestId("system-index-panel")).toBeVisible();`

2. **Entry count visible**
   - Test: `await expect(page.getByTestId("system-index-entry-count")).toHaveText("16");`

3. **Future docs-only entries visible**
   - Test: `await expect(page.getByTestId("system-index-entry-visual-grammar-engine")).toBeVisible();`
   - Test: `await expect(page.getByTestId("system-index-entry-signal-loom-routing")).toBeVisible();`
   - Test: `await expect(page.getByTestId("system-index-entry-lumaweave-arena-concept")).toBeVisible();`
   - Test: `await expect(page.getByTestId("system-index-entry-self-graph-fixture")).toBeVisible();`

4. **Forbidden boundaries visible for critical entries**
   - Test: `await expect(page.getByTestId("system-index-entry-forbidden-boundaries-graph-theme-mapping-registry")).toBeVisible();`
   - Test: `await expect(page.getByTestId("system-index-entry-forbidden-boundaries-audio-music-reactive-mapping-registry")).toBeVisible();`
   - Test: `await expect(page.getByTestId("system-index-entry-forbidden-boundaries-audio-source-registry")).toBeVisible();`
   - Test: `await expect(page.getByTestId("system-index-entry-forbidden-boundaries-lumaweave-arena-concept")).toBeVisible();`

5. **No dead active controls**
   - Test: Verify no buttons or interactive elements without corresponding handlers

6. **No test skips**
   - Test: Verify all new tests pass without `test.skip`
   - Test: Verify existing tests continue to pass

7. **Validators preserved**
   - Test: `npm run qa:bundle` must pass
   - Test: `npm run trace:contracts` must pass
   - Test: `npm run index:system` must pass
   - Test: `npx playwright test tests/e2e/contract-registry.spec.ts` must pass

## STOP Conditions for Future Integration

Future integration (v72d.3) must STOP if:

- AppShell route pattern is unclear or requires routing system
- Mounting requires touching GraphVisualInventoryPanel
- Mounting requires QA panel behavior changes
- Mounting requires SettingsPanel restructuring beyond minor adjustments
- Mounting creates dead controls or placeholder interactions
- Playwright cannot reach the panel reliably via data-testid
- Accepted evidence would be hidden or moved
- Tests require broad rewrites beyond new test file
- Any validator (qa:bundle, trace:contracts, index:system, contract-registry) fails

## Version History

- **v72d.2** (2026-05-04): Initial Route Discovery (docs-only inspection of AppShell, mount patterns, and test patterns)
