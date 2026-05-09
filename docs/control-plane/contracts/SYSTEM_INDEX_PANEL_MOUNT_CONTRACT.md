---
id: control.plane.system.index.panel.mount.contract
title: System Index Panel Mount Contract
type: contract
status: accepted
version: v72d.1
cluster: slate
domain: control-plane
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
references:
  - control.plane.system.index.registry.contract
  - control.plane.system.index.panel.route.discovery
  - control.plane.graph.navigation.contract
tags: [control-plane, system-index, panel, mount, contract, v72d]
---

# System Index Panel Mount Contract

**Version**: v72d.1
**Purpose**: Identify and document the safest future mount/integration path for the passive SystemIndexPanel without touching runtime UI.

## Current State

- **Component**: SystemIndexPanel.tsx exists at `src/control-plane/system-index/SystemIndexPanel.tsx`
- **Component Nature**: Passive/read-only UI surface that displays the System Index Registry
- **Mount Status**: Not mounted in AppShell
- **Playwright Coverage**: None (no route/mount exists, so cannot test rendering)
- **Data Source**: src/control-plane/system-index/systemIndexRegistry.ts (16 entries)
- **Component Features**:
  - Summary counts (total entries, categories, kinds, statuses, lifecycles)
  - Entry cards grouped by category
  - Stable data-testid values for future Playwright coverage
  - Read-only display (no editing, no search complexity, no active controls)

## Mount Requirements

A safe mount point must:

1. **Not disrupt GraphVisualInventoryPanel**
   - Must not hide or interfere with the existing graph visual inventory panel
   - Must not require collapsing legacy evidence to make space

2. **Not hide accepted evidence**
   - Must not obscure or replace any accepted evidence surfaces
   - Must preserve visibility of all existing control-plane panels

3. **Not require collapsing legacy evidence**
   - Must not depend on v69 collapsible evidence sections
   - Must not trigger v69 retry or implementation

4. **Not alter QA panel behavior**
   - Must not modify QaPanel functionality or layout
   - Must not interfere with QA bundle validator workflow

5. **Not alter AppShell navigation without a contract**
   - Must not add new navigation routes without a dedicated contract
   - Must not change the existing 3-column grid layout without validation

6. **Not add dead active controls**
   - Any controls added must be functional and tested
   - No placeholder buttons or fake interactions

7. **Be reachable by Playwright**
   - Must have a stable route or mount point for automated testing
   - Must have stable data-testid root for test targeting

8. **Be read-only**
   - Must not enable editing of system index entries
   - Must not enable mutations to the registry

9. **Preserve validators**
   - Must not break qa:bundle (npm run qa:bundle)
   - Must not break trace:contracts (npm run trace:contracts)
   - Must not break index:system (npm run index:system)
   - Must not break contract-registry (npx playwright test tests/e2e/contract-registry.spec.ts)

## Candidate Mount Options

### Option 1: Dedicated Control Plane Tab/Route

**Description**: Add a new tab or route specifically for System Index Panel, accessible via a dedicated URL or navigation item.

**Benefit**:
- Lowest blast radius to existing UI
- Isolated from GraphVisualInventoryPanel and QA panel
- Easy to test with Playwright (stable route)
- Can be dev-only or gated behind a feature flag

**Risk**:
- Requires adding navigation route (needs contract)
- Requires understanding AppShell routing pattern
- May need new navigation UI element

**Testability**: High (stable route, easy Playwright targeting)

**Blast Radius**: Low (isolated new route, minimal impact on existing UI)

**Recommendation**: Preferred if safe routing pattern exists

---

### Option 2: QA Debug Subtab

**Description**: Add SystemIndexPanel as a subtab within the existing QA panel, accessible via a tab switcher.

**Benefit**:
- Reuses existing QA panel infrastructure
- Natural fit for governance/registry content
- Already in control-plane context

**Risk**:
- May alter QA panel layout or behavior
- Requires modifying QaPanel (complex component)
- May interfere with QA bundle validator workflow
- Higher blast radius to critical QA surface

**Testability**: Medium (requires QA panel navigation, more complex targeting)

**Blast Radius**: Medium (modifies existing QA panel, potential impact on QA workflow)

**Recommendation**: Medium priority, requires careful QA panel contract

---

### Option 3: Command Deck / Mission Control Future Panel

**Description**: Add SystemIndexPanel as a new panel in the Command Deck or future Mission Control surface.

**Benefit**:
- Fits within command/control-plane context
- May have existing panel infrastructure
- Aligned with governance/registry content

**Risk**:
- Requires understanding Command Deck architecture
- May not have safe existing mount point
- May require new panel infrastructure
- Unclear blast radius without deeper investigation

**Testability**: Medium (depends on Command Deck mount pattern)

**Blast Radius**: Unknown (requires deeper investigation of Command Deck)

**Recommendation**: Investigate if safe mount point exists, otherwise defer

---

### Option 4: Standalone Dev-Only Route

**Description**: Add a standalone dev-only route (e.g., `/dev/system-index`) that is not integrated into main AppShell navigation.

**Benefit**:
- Lowest blast radius to main app
- Can be dev-gated or behind feature flag
- Easy to test with Playwright (stable route)
- No impact on production UI

**Risk**:
- Requires separate route infrastructure
- May not be discoverable without documentation
- May not fit within existing routing pattern

**Testability**: High (stable dev route, easy Playwright targeting)

**Blast Radius**: Very Low (isolated dev route, zero impact on main app)

**Recommendation**: Preferred if dev route infrastructure exists

---

### Option 5: Deferred Until Human Mode vs Evidence Mode

**Description**: Defer mount decision until v73 Human Mode vs Evidence Mode contract is defined, which may provide a natural integration point.

**Benefit**:
- Avoids premature integration risk
- Allows v73 contract to inform mount strategy
- Prevents repeating v69 failure pattern

**Risk**:
- Delays visibility of System Index Panel
- Requires additional planning before integration

**Testability**: N/A (deferred)

**Blast Radius**: Zero (no integration)

**Recommendation**: Safe fallback if no clear low-risk mount point exists

## Recommendation

**Primary Recommendation**: Option 1 (Dedicated Control Plane Tab/Route) or Option 4 (Standalone Dev-Only Route)

**Rationale**:
- Both options have the lowest blast radius to existing UI
- Both provide stable routes for Playwright testing
- Both isolate SystemIndexPanel from critical surfaces (GraphVisualInventoryPanel, QA panel)
- Both avoid the v69 failure pattern of broad UI integration

**Decision Criteria**:
- If safe routing pattern exists in AppShell: Use Option 1 (Dedicated Control Plane Tab/Route)
- If dev route infrastructure exists: Use Option 4 (Standalone Dev-Only Route)
- If neither safe routing nor dev route infrastructure exists: Defer to Option 5 (Wait for v73 Human Mode vs Evidence Mode)

**Explicit Rejection**:
- Option 2 (QA Debug Subtab): Rejected due to medium blast radius to critical QA surface
- Option 3 (Command Deck): Rejected due to unknown blast radius without deeper investigation

## Test Contract for Future Mount

Future integration pass (v72d.2 or later) must include Playwright tests that verify:

1. **SystemIndexPanel renders**
   - Test: `expect(page.getByTestId('system-index-panel')).toBeVisible()`

2. **Entry count visible**
   - Test: `expect(page.getByTestId('system-index-entry-count')).toHaveText('16')`

3. **Future docs-only entries visible**
   - Test: `expect(page.getByTestId('system-index-entry-visual-grammar-engine')).toBeVisible()`
   - Test: `expect(page.getByTestId('system-index-entry-signal-loom-routing')).toBeVisible()`
   - Test: `expect(page.getByTestId('system-index-entry-lumaweave-arena-concept')).toBeVisible()`
   - Test: `expect(page.getByTestId('system-index-entry-self-graph-fixture')).toBeVisible()`

4. **Forbidden boundaries visible for critical entries**
   - Test: `expect(page.getByTestId('system-index-entry-forbidden-boundaries-graph-theme-mapping-registry')).toBeVisible()`
   - Test: `expect(page.getByTestId('system-index-entry-forbidden-boundaries-audio-music-reactive-mapping-registry')).toBeVisible()`
   - Test: `expect(page.getByTestId('system-index-entry-forbidden-boundaries-audio-source-registry')).toBeVisible()`
   - Test: `expect(page.getByTestId('system-index-entry-forbidden-boundaries-lumaweave-arena-concept')).toBeVisible()`

5. **No dead active controls**
   - Test: Verify no buttons or interactive elements without corresponding handlers
   - Test: Verify no placeholder controls

6. **No test skips**
   - Test: Verify all new tests pass without `test.skip`
   - Test: Verify existing tests continue to pass

7. **Validators preserved**
   - Test: `npm run qa:bundle` must pass
   - Test: `npm run trace:contracts` must pass
   - Test: `npm run index:system` must pass
   - Test: `npx playwright test tests/e2e/contract-registry.spec.ts` must pass

## Forbidden

In this pass (v72d.1):

- No runtime implementation
- No AppShell changes
- No GraphVisualInventoryPanel changes
- No graph-visual-inventory.spec changes
- No QA key rotation
- No v69 retry
- No graph/Sigma mutation
- No audio/music runtime behavior
- No command execution
- No storage/persistence
- No token promotion
- No CSS variable writes

## Version History

- **v72d.1** (2026-05-04): Initial Safe Mount Point Discovery Contract (docs-only)