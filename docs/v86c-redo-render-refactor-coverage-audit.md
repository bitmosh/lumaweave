# vP-Render-Refactor-Prep-Audit: Playwright Coverage for Graph Interactions

Generated: 2026-05-11T20:35:00.000Z

## Objective

Read-only audit of current Playwright coverage for graph interactions before refactoring the render pipeline. This audit identifies which interactions have regression tests and which are at risk.

## Test File Analysis

### Tests Touching Graph Rendering, Selection, Hover, Dimming, Theme Switching, Physics, or Camera

| Test File | Interaction Tested | Assertions | Touches Graph Rendering/Selection/Hover/Dimming/Theme/Physics/Camera |
|-----------|-------------------|------------|---------------------------------------------------------------------|
| **camera-wrapper-mount.spec.ts** | Camera state persistence after reload, camera reset not called on mount | Camera state preserved within ±2px tolerance, camera unchanged after reload | **Camera** ✓ |
| **graph-physics-coverage.spec.ts** | Graph surface mounts, graph frame stable, panels coexist, physics controls visible | Canvas visible, bounding box >100px, physics sliders visible | **Graph Rendering**, **Physics** ✓ |
| **graph-visual-inventory.spec.ts** | Read-only inventory of graph visual elements, runtime probe, detail mode toggle | Registry entries visible, status active, mutation status locked/deferred | **Graph Rendering** (read-only) ✓ |
| **graph-visual-state-stability.spec.ts** | Graph remains visible after slider changes, no console errors during slider changes | Canvas visible after node size/link distance/repel force changes, no console errors | **Graph Rendering**, **Physics** ✓ |
| **theme-selector.spec.ts** | Theme selector exists, built-in options exist, selecting updates control value, glitter/reduce motion toggles | Theme selector visible, 6 options, value updates after selection, toggles toggle | **Theme Switching** ✓ |
| **quality-preset-coupling.spec.ts** | Quality preset couples to appearance settings (potato/balanced/fancy) | Appearance values set correctly when quality preset changes | **Theme Switching** (preset coupling) ✓ |
| **self-graph.spec.ts** | Graph canvas renders with YAML parser graph loaded | Canvas visible, graph viewport visible | **Graph Rendering** ✓ |
| **viewport-stability.spec.ts** | Graph remains visible after QA navigation | Canvas visible after next/previous navigation, bounding box stable | **Graph Rendering** ✓ |
| **v86c-tile-system.spec.ts** | Tile tear-off handle visible, TileLayer renders, tileable sections match registry | Tear-off handles visible, tile layer visible, sections with tileableKey rendered | **Tile System** ✓ |

### Tests NOT Touching Graph Interactions (Infrastructure/Other)

| Test File | Interaction Tested | Reason for Exclusion |
|-----------|-------------------|---------------------|
| app-smoke.spec.ts | App loads core shell | Basic smoke test |
| command-deck.spec.ts | Command deck shell visibility | Command deck only |
| contract-registry.spec.ts | Mission Control tabs, theme selector, glitter toggle, theme override storage | Mission Control, theme storage |
| edge-label-truncation.spec.ts | Edge label length control | Settings panel only |
| edge-plasma-overlay.spec.ts | Plasma overlay rendering | Edge rendering (not core graph) |
| listener-verification.spec.ts | Console listener captures logs | Diagnostic |
| perspective-system.spec.ts | Perspective System panel | Command deck panel |
| qa-navigation.spec.ts | QA notes persist during navigation | QA panel |
| qa-panel.spec.ts | QA panel typing/deleting notes | QA panel |
| qa-refresh.spec.ts | QA notes persist after refresh | QA panel |
| qa-submit.spec.ts | QA submit clears form | QA panel |
| reduce-motion-halt.spec.ts | Reduce motion halts animations | Animation control |
| screenshot-artifact.spec.ts | Screenshot capture | Visual regression |
| selector-pattern-diagnostic.spec.ts | Selector pattern diagnostic | Diagnostic |
| settings-label-controls.spec.ts | Label controls visibility | Settings panel |
| settings-migrations.spec.ts | Settings migration chain | Settings migration |
| snapshot-baseline.spec.ts | Screenshot baseline | Visual regression |
| source-adapter.spec.ts | Source Adapter panel | Source adapter panel |
| system-index.spec.ts | System Index panel | System index panel |
| theme-override-storage.spec.ts | Theme override storage | Theme storage |
| theme-target-inspector.spec.ts | Theme target inspector overlay | Theme inspector |
| theme-token-governance.spec.ts | Theme token governance | Theme governance |
| theme-token-paths.spec.ts | Theme token path map | Theme token paths |
| tier-walk-validator.spec.ts | Tier-walk validator | Theme governance |
| v86b-uniforms-diagnostic-getsetting.spec.ts | getSetting diagnostic | Diagnostic |
| v86b-uniforms-diagnostic-props.spec.ts | v86b uniform props diagnostic | Diagnostic |
| v86b-uniforms-diagnostic-useeffect.spec.ts | useEffect diagnostic | Diagnostic |
| v86b-uniforms-diagnostic.spec.ts | v86bUniforms diagnostic | Diagnostic |
| visual-handles.spec.ts | Visual handle library | Visual handles |

## Coverage Gaps

### 1. Camera State Persists Across Settings Changes

**Status:** NOT TESTED

**Current Coverage:**
- `camera-wrapper-mount.spec.ts` tests camera state persistence after **page reload**
- No test for camera state persistence after **settings changes** (e.g., changing node size slider, link distance slider, repel force slider)

**Risk:** If settings changes trigger camera reset or mutation, users lose their viewport position when adjusting physics parameters.

**Proposed Test:**
```typescript
test("camera state persists after physics slider change", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("canvas");

  // Get initial camera state
  const cameraBefore = await getSigmaCameraState(page);

  // Change node size slider
  const nodeSizeSlider = page.locator("[data-testid='setting-physics-nodeSize']");
  await nodeSizeSlider.fill("1.5");
  await page.waitForTimeout(100);

  // Get camera state after slider change
  const cameraAfter = await getSigmaCameraState(page);

  // Camera state should be preserved (within ±2px tolerance)
  expect(Math.abs(cameraAfter.x - cameraBefore.x)).toBeLessThanOrEqual(2);
  expect(Math.abs(cameraAfter.y - cameraBefore.y)).toBeLessThanOrEqual(2);
  expect(Math.abs(cameraAfter.ratio - cameraBefore.ratio)).toBeLessThanOrEqual(0.01);
});
```

---

### 2. Camera State Persists Across Theme Switches

**Status:** NOT TESTED

**Current Coverage:**
- `camera-wrapper-mount.spec.ts` tests camera state persistence after **page reload**
- `theme-selector.spec.ts` tests theme selector and color switching
- No test for camera state preservation during **theme switch**

**Risk:** If theme switch triggers camera reset or Sigma recreation, users lose their viewport position when changing themes.

**Proposed Test:**
```typescript
test("camera state persists after theme switch", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("canvas");

  // Get initial camera state
  const cameraBefore = await getSigmaCameraState(page);

  // Switch theme
  const themeSelector = page.getByTestId("theme-preset-selector");
  await themeSelector.selectOption("midnight-loom");
  await page.waitForTimeout(500);

  // Get camera state after theme switch
  const cameraAfter = await getSigmaCameraState(page);

  // Camera state should be preserved (within ±2px tolerance)
  expect(Math.abs(cameraAfter.x - cameraBefore.x)).toBeLessThanOrEqual(2);
  expect(Math.abs(cameraAfter.y - cameraBefore.y)).toBeLessThanOrEqual(2);
  expect(Math.abs(cameraAfter.ratio - cameraBefore.ratio)).toBeLessThanOrEqual(0.01);
});
```

---

### 3. Camera State Persists Across Source Switches

**Status:** NOT TESTED

**Current Coverage:**
- `camera-wrapper-mount.spec.ts` tests camera state persistence after **page reload**
- `source-adapter.spec.ts` tests source adapter panel visibility
- No test for camera state preservation during **graph source switch**

**Risk:** If source switch triggers camera reset or Sigma recreation, users lose their viewport position when switching between graph sources.

**Proposed Test:**
```typescript
test("camera state persists after source switch", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("canvas");

  // Get initial camera state
  const cameraBefore = await getSigmaCameraState(page);

  // Switch graph source (if multiple sources available)
  // Note: This test requires knowledge of available graph sources
  // For now, this is a placeholder that assumes a source selector exists
  const sourceSelector = page.getByTestId("graph-source-selector");
  if (await sourceSelector.isVisible()) {
    await sourceSelector.selectOption("alternate-source");
    await page.waitForTimeout(500);

    // Get camera state after source switch
    const cameraAfter = await getSigmaCameraState(page);

    // Camera state should be preserved (within ±2px tolerance)
    expect(Math.abs(cameraAfter.x - cameraBefore.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(cameraAfter.y - cameraBefore.y)).toBeLessThanOrEqual(2);
    expect(Math.abs(cameraAfter.ratio - cameraBefore.ratio)).toBeLessThanOrEqual(0.01);
  } else {
    // Skip if no source selector exists
    console.log("Source selector not available, skipping test");
  }
});
```

---

### 4. Selection State Survives a Settings Change

**Status:** NOT TESTED

**Current Coverage:**
- No tests for graph node/edge selection
- No tests for selection state persistence

**Risk:** If settings change triggers selection reset, users lose their selected nodes when adjusting physics parameters.

**Proposed Test:**
```typescript
test("selection state survives physics slider change", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("canvas");

  // Select a node (requires knowledge of node selection mechanism)
  // Note: This test assumes nodes can be selected via click
  // Placeholder for node selection logic
  const firstNode = page.locator("canvas").first();
  await firstNode.click({ position: { x: 100, y: 100 } });
  await page.waitForTimeout(100);

  // Verify node is selected (check for selection indicator)
  // Placeholder for selection verification
  const selectedIndicator = page.locator("[data-selected='true']");
  const isSelectedBefore = await selectedIndicator.count() > 0;

  // Change node size slider
  const nodeSizeSlider = page.locator("[data-testid='setting-physics-nodeSize']");
  await nodeSizeSlider.fill("1.5");
  await page.waitForTimeout(100);

  // Verify node is still selected
  const isSelectedAfter = await selectedIndicator.count() > 0;

  if (isSelectedBefore) {
    expect(isSelectedAfter).toBe(true);
  }
});
```

---

### 5. Hover-Dim Returns to Normal on Mouseout

**Status:** NOT TESTED

**Current Coverage:**
- No tests for hover interactions
- No tests for hover-dim behavior

**Risk:** If hover-dim does not return to normal on mouseout, nodes remain dimmed incorrectly after hover.

**Proposed Test:**
```typescript
test("hover-dim returns to normal on mouseout", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("canvas");

  // Hover over a node
  const canvas = page.locator("canvas").first();
  await canvas.hover({ position: { x: 100, y: 100 } });
  await page.waitForTimeout(100);

  // Verify hover-dim is active (check for dimmed state)
  // Placeholder for hover-dim verification
  // This assumes there's a visual indicator for hover-dim state

  // Move mouse away
  await page.mouse.move(0, 0);
  await page.waitForTimeout(100);

  // Verify hover-dim is no longer active
  // Placeholder for normal state verification
});
```

---

### 6. Theme Switch Updates Colors Without Recreating Sigma

**Status:** NOT TESTED

**Current Coverage:**
- `theme-selector.spec.ts` tests theme selector and color switching
- No test for Sigma instance preservation during theme switch

**Risk:** If theme switch recreates Sigma instance, it may cause performance issues, lose camera state, or reset other Sigma state.

**Proposed Test:**
```typescript
test("theme switch updates colors without recreating Sigma", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("canvas");

  // Get Sigma instance reference before theme switch
  const sigmaBefore = await page.evaluate(() => {
    return (window as any).__lwSigma?.id;
  });

  // Switch theme
  const themeSelector = page.getByTestId("theme-preset-selector");
  await themeSelector.selectOption("midnight-loom");
  await page.waitForTimeout(500);

  // Get Sigma instance reference after theme switch
  const sigmaAfter = await page.evaluate(() => {
    return (window as any).__lwSigma?.id;
  });

  // Sigma instance should be the same (not recreated)
  expect(sigmaAfter).toBe(sigmaBefore);
});
```

---

### 7. Physics Slider Changes Update Layout Without Sigma Recreation

**Status:** PARTIALLY TESTED

**Current Coverage:**
- `graph-visual-state-stability.spec.ts` tests graph remains visible after slider changes
- No test for Sigma instance preservation during physics slider changes

**Risk:** If physics slider changes recreate Sigma instance, it may cause performance issues or reset camera state.

**Proposed Test:**
```typescript
test("physics slider changes update layout without recreating Sigma", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("canvas");

  // Get Sigma instance reference before slider change
  const sigmaBefore = await page.evaluate(() => {
    return (window as any).__lwSigma?.id;
  });

  // Change node size slider
  const nodeSizeSlider = page.locator("[data-testid='setting-physics-nodeSize']");
  await nodeSizeSlider.fill("1.5");
  await page.waitForTimeout(100);

  // Get Sigma instance reference after slider change
  const sigmaAfter = await page.evaluate(() => {
    return (window as any).__lwSigma?.id;
  });

  // Sigma instance should be the same (not recreated)
  expect(sigmaAfter).toBe(sigmaBefore);
});
```

---

### 8. Settings Dropdown Changes (Preset, Dialect) Work as Expected

**Status:** PARTIALLY TESTED

**Current Coverage:**
- `quality-preset-coupling.spec.ts` tests quality preset coupling to appearance settings
- `theme-selector.spec.ts` tests theme preset selector
- No test for dialect selector or other dropdown settings

**Risk:** If dropdown settings do not update correctly, users cannot configure the graph as expected.

**Proposed Test:**
```typescript
test("settings dropdown changes work as expected", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("canvas");

  // Test quality preset dropdown
  const qualityPresetSelector = page.locator("[data-testid='setting-physics-qualityPreset']");
  if (await qualityPresetSelector.isVisible()) {
    await qualityPresetSelector.selectOption("balanced");
    await expect(qualityPresetSelector).toHaveValue("balanced");

    // Verify coupled settings updated
    const reduceMotionToggle = page.locator("input[type='checkbox']").first();
    const reduceMotionValue = await reduceMotionToggle.isChecked();
    expect(reduceMotionValue).toBe(false); // balanced has reduceMotion=false
  }

  // Test dialect dropdown if it exists
  const dialectSelector = page.locator("[data-testid='setting-physics-dialect']");
  if (await dialectSelector.isVisible()) {
    await dialectSelector.selectOption("force-directed");
    await expect(dialectSelector).toHaveValue("force-directed");
  }
});
```

---

### 9. Tile System Continues to Function During Graph Interactions

**Status:** NOT TESTED

**Current Coverage:**
- `v86c-tile-system.spec.ts` tests tile system integration (tear-off handles, TileLayer, tileable sections)
- No test for tile system function during graph interactions (e.g., while panning/zooming graph)

**Risk:** If tile system breaks during graph interactions, users cannot tile sections while exploring the graph.

**Proposed Test:**
```typescript
test("tile system continues to function during graph interactions", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("canvas");

  // Verify tear-off handles are visible
  const tearOffHandles = page.getByText("⤴");
  await expect(tearOffHandles.first()).toBeVisible();

  // Pan the graph (simulate drag)
  const canvas = page.locator("canvas").first();
  await canvas.dragTo(canvas, { targetPosition: { x: 100, y: 100 } });
  await page.waitForTimeout(100);

  // Verify tear-off handles are still visible after graph interaction
  await expect(tearOffHandles.first()).toBeVisible();

  // Verify TileLayer is still rendered
  const tileLayer = page.getByTestId("tile-layer");
  await expect(tileLayer).toBeVisible();
});
```

---

## Summary

### Critical Gaps (High Risk)

1. **Camera state persistence across settings changes** - NOT TESTED
2. **Camera state persistence across theme switches** - NOT TESTED
3. **Camera state persistence across source switches** - NOT TESTED
4. **Selection state survives settings changes** - NOT TESTED
5. **Theme switch updates colors without recreating Sigma** - NOT TESTED
6. **Physics slider changes update layout without Sigma recreation** - NOT TESTED

### Moderate Gaps (Medium Risk)

7. **Hover-dim returns to normal on mouseout** - NOT TESTED
8. **Settings dropdown changes work as expected** - PARTIALLY TESTED
9. **Tile system continues to function during graph interactions** - NOT TESTED

### Recommendations

1. **Priority 1 (Critical):** Add tests for camera state persistence across settings changes, theme switches, and source switches before render refactor. These are high-risk regressions that directly impact user experience.

2. **Priority 2 (Critical):** Add tests for Sigma instance preservation during theme switches and physics slider changes. Sigma recreation is a major performance and state regression risk.

3. **Priority 3 (Moderate):** Add tests for selection state, hover-dim behavior, and tile system during graph interactions. These are important but less critical than camera/Sigma state.

4. **Priority 4 (Low):** Expand settings dropdown test coverage to include all dropdown settings (dialect, etc.).

### Helper Functions Needed

Several proposed tests rely on helper functions that may not exist:

- `getSigmaCameraState(page)` - Extract current camera state from Sigma instance
- Selection verification logic - Check if a node is selected
- Hover-dim verification logic - Check if hover-dim is active

These should be added to `tests/helpers/app-state.ts` before implementing the proposed tests.
