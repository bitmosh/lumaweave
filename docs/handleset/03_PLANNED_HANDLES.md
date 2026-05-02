# Planned Handles v0

## TypeScript Handleset Scaffold

A machine-readable TypeScript handleset registry is available at:
- `src/control-plane/handles/handleset.registry.ts`

This registry contains all planned handles with their runtime bindings and QA references. The TypeScript scaffold does not yet drive UI - SettingsPanel still uses `settings.registry.ts`. The handleset registry is a machine-readable documentation/scaffold layer for now.

## Overview

Handles that are defined in schema/registry but marked as future work or not wired yet.

**Note:** All planned settings with UI controls have been hidden from settings.registry.ts (commented out) until they are wired to the renderer. They still exist in schema and defaults but are not visible to users.

## Physics

### physics.centerForce
- **Handle Path:** physics.centerForce
- **Label:** Center Force (Planned)
- **Category:** Physics
- **Default Value:** 40
- **UI Control Type:** range (min 0, max 200, step 5)
- **Source File:** src/control-plane/settings/settings.schema.ts
- **Runtime Target:** Sigma force layout center attraction
- **Live Update Behavior:** No - not wired to Sigma
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Marked as "Planned for force layout v1". Default exists but no runtime effect. **Hidden from UI** in settings.registry.ts until wired.

### physics.communityGravity
- **Handle Path:** physics.communityGravity
- **Label:** Community Gravity (Planned)
- **Category:** Physics
- **Default Value:** 80
- **UI Control Type:** range (min 0, max 200, step 5)
- **Source File:** src/control-plane/settings/settings.schema.ts
- **Runtime Target:** Sigma force layout intra-community clustering
- **Live Update Behavior:** No - not wired to Sigma
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Marked as "Planned for force layout v1". Default exists but no runtime effect. **Hidden from UI** in settings.registry.ts until wired.

### physics.curveAmount
- **Handle Path:** physics.curveAmount
- **Label:** Edge Curve (Planned)
- **Category:** Physics
- **Default Value:** 45
- **UI Control Type:** range (min 0, max 100, step 5)
- **Source File:** src/control-plane/settings/settings.schema.ts
- **Runtime Target:** Edge curvature in renderer
- **Live Update Behavior:** No - not wired to renderer
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Marked as "Planned for visual polish". Default exists but no runtime effect. **Hidden from UI** in settings.registry.ts until wired.

### physics.animationSoftness
- **Handle Path:** physics.animationSoftness
- **Label:** Animation Softness (Planned)
- **Category:** Physics
- **Default Value:** 60
- **UI Control Type:** range (min 0, max 100, step 5)
- **Source File:** src/control-plane/settings/settings.schema.ts
- **Runtime Target:** Transition smoothness in renderer
- **Live Update Behavior:** No - not wired to renderer
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Marked as "Planned for force layout v1". Default exists but no runtime effect. **Hidden from UI** in settings.registry.ts until wired.

## Labels

### labels.hoverLabelColor
- **Handle Path:** labels.hoverLabelColor
- **Label:** Hover Label Color (Planned)
- **Category:** Labels
- **Default Value:** "#e0f2fe"
- **UI Control Type:** text
- **Source File:** src/control-plane/settings/settings.schema.ts
- **Runtime Target:** Hover label text color
- **Live Update Behavior:** No - not wired to Sigma
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Description: "Per-node hover label color is not yet implemented. Planned for future label color customization." Sigma supports attribute-based label color but this setting is not connected. **Hidden from UI** in settings.registry.ts until wired.

## Graph View

### graphView.selectedNodeColor
- **Handle Path:** graphView.selectedNodeColor
- **Label:** Selected Node Color (Planned)
- **Category:** Graph View
- **Default Value:** "#fbbf24"
- **UI Control Type:** text
- **Source File:** src/control-plane/settings/settings.schema.ts
- **Runtime Target:** Selected node fill color
- **Live Update Behavior:** No - not wired to renderer
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Marked as "Planned for future theme customization." Default matches nodeColorTokens.selected but setting is not connected to token. **Hidden from UI** in settings.registry.ts until wired.

### graphView.defaultNodeColor
- **Handle Path:** graphView.defaultNodeColor
- **Label:** Default Node Color (Planned)
- **Category:** Graph View
- **Default Value:** "#22d3ee"
- **UI Control Type:** text
- **Source File:** src/control-plane/settings/settings.schema.ts
- **Runtime Target:** Default node fill color
- **Live Update Behavior:** No - not wired to renderer
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Marked as "Planned for future theme customization." Default matches nodeColorTokens.default but setting is not connected to token. **Hidden from UI** in settings.registry.ts until wired.

### graphView.selectedEdgeColor
- **Handle Path:** graphView.selectedEdgeColor
- **Label:** Selected Edge Color (Planned)
- **Category:** Graph View
- **Default Value:** "#a855f7"
- **UI Control Type:** text
- **Source File:** src/control-plane/settings/settings.schema.ts
- **Runtime Target:** Selected edge stroke color
- **Live Update Behavior:** No - not wired to renderer
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Marked as "Planned for future theme customization." Default matches edgeColorTokens.selected but setting is not connected to token. **Hidden from UI** in settings.registry.ts until wired.

## Evidence (All Planned)

### evidence.showSourceSnippets
- **Handle Path:** evidence.showSourceSnippets
- **Label:** Show Source Snippets
- **Category:** Evidence
- **Default Value:** true
- **UI Control Type:** boolean (not in registry)
- **Source File:** src/control-plane/settings/settings.schema.ts (line 84)
- **Runtime Target:** Evidence panel snippet display
- **Live Update Behavior:** No - not wired to UI
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Defined in schema and defaults but not in settings.registry. No UI control exists.

### evidence.snippetLineCount
- **Handle Path:** evidence.snippetLineCount
- **Label:** Snippet Line Count
- **Category:** Evidence
- **Default Value:** 5
- **UI Control Type:** number (not in registry)
- **Source File:** src/control-plane/settings/settings.schema.ts (line 85)
- **Runtime Target:** Evidence panel snippet length
- **Live Update Behavior:** No - not wired to UI
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Defined in schema and defaults but not in settings.registry. No UI control exists.

### evidence.showRawArtifactRefs
- **Handle Path:** evidence.showRawArtifactRefs
- **Label:** Show Raw Artifact Refs
- **Category:** Evidence
- **Default Value:** false
- **UI Control Type:** boolean (not in registry)
- **Source File:** src/control-plane/settings/settings.schema.ts (line 86)
- **Runtime Target:** Evidence panel raw reference display
- **Live Update Behavior:** No - not wired to UI
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Defined in schema and defaults but not in settings.registry. No UI control exists.

### evidence.minimumConfidence
- **Handle Path:** evidence.minimumConfidence
- **Label:** Minimum Confidence
- **Category:** Evidence
- **Default Value:** "low"
- **UI Control Type:** select (not in registry)
- **Source File:** src/control-plane/settings/settings.schema.ts (line 87)
- **Runtime Target:** Evidence filtering by confidence
- **Live Update Behavior:** No - not wired to UI
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Defined in schema and defaults but not in settings.registry. No UI control exists.

## Source Linking (All Planned)

### sourceLinking.editorScheme
- **Handle Path:** sourceLinking.editorScheme
- **Label:** Editor Scheme
- **Category:** Source Linking
- **Default Value:** "vscode"
- **UI Control Type:** select (not in registry)
- **Source File:** src/control-plane/settings/settings.schema.ts (line 91)
- **Runtime Target:** Source file opening behavior
- **Live Update Behavior:** No - not wired to UI
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Defined in schema and defaults but not in settings.registry. No UI control exists.

### sourceLinking.sourceRoot
- **Handle Path:** sourceLinking.sourceRoot
- **Label:** Source Root
- **Category:** Source Linking
- **Default Value:** null
- **UI Control Type:** text (not in registry)
- **Source File:** src/control-plane/settings/settings.schema.ts (line 92)
- **Runtime Target:** Source file root path
- **Live Update Behavior:** No - not wired to UI
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Defined in schema and defaults but not in settings.registry. No UI control exists.

### sourceLinking.openBehavior
- **Handle Path:** sourceLinking.openBehavior
- **Label:** Open Behavior
- **Category:** Source Linking
- **Default Value:** "editor"
- **UI Control Type:** select (not in registry)
- **Source File:** src/control-plane/settings/settings.schema.ts (line 93)
- **Runtime Target:** Source file open method
- **Live Update Behavior:** No - not wired to UI
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Defined in schema and defaults but not in settings.registry. No UI control exists.

## Performance (All Planned)

### performance.qualityPreset
- **Handle Path:** performance.qualityPreset
- **Label:** Quality Preset
- **Category:** Performance
- **Default Value:** "balanced"
- **UI Control Type:** select (not in registry)
- **Source File:** src/control-plane/settings/settings.schema.ts (line 97)
- **Runtime Target:** Rendering quality settings
- **Live Update Behavior:** No - not wired to UI
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Defined in schema and defaults but not in settings.registry. No UI control exists.

### performance.particleCap
- **Handle Path:** performance.particleCap
- **Label:** Particle Cap
- **Category:** Performance
- **Default Value:** 150
- **UI Control Type:** number (not in registry)
- **Source File:** src/control-plane/settings/settings.schema.ts (line 98)
- **Runtime Target:** Particle effect limit
- **Live Update Behavior:** No - not wired to UI
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Defined in schema and defaults but not in settings.registry. No UI control exists.

### performance.maxVisibleLabels
- **Handle Path:** performance.maxVisibleLabels
- **Label:** Max Visible Labels
- **Category:** Performance
- **Default Value:** 300
- **UI Control Type:** number (not in registry)
- **Source File:** src/control-plane/settings/settings.schema.ts (line 99)
- **Runtime Target:** Label rendering limit
- **Live Update Behavior:** No - not wired to UI
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Defined in schema and defaults but not in settings.registry. No UI control exists.

### performance.largeGraphModeThreshold
- **Handle Path:** performance.largeGraphModeThreshold
- **Label:** Large Graph Mode Threshold
- **Category:** Performance
- **Default Value:** 10000
- **UI Control Type:** number (not in registry)
- **Source File:** src/control-plane/settings/settings.schema.ts (line 100)
- **Runtime Target:** Auto-switch to large graph mode
- **Live Update Behavior:** No - not wired to UI
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Defined in schema and defaults but not in settings.registry. No UI control exists.

## Developer (All Planned)

### developer.showDebugPanel
- **Handle Path:** developer.showDebugPanel
- **Label:** Show Debug Panel
- **Category:** Developer
- **Default Value:** true
- **UI Control Type:** boolean (not in registry)
- **Source File:** src/control-plane/settings/settings.schema.ts (line 104)
- **Runtime Target:** Renderer debug panel visibility
- **Live Update Behavior:** No - not wired to UI
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Defined in schema and defaults but not in settings.registry. No UI control exists. Debug panel is manually collapsible in UI.

### developer.showFps
- **Handle Path:** developer.showFps
- **Label:** Show FPS
- **Category:** Developer
- **Default Value:** false
- **UI Control Type:** boolean (not in registry)
- **Source File:** src/control-plane/settings/settings.schema.ts (line 105)
- **Runtime Target:** FPS counter display
- **Live Update Behavior:** No - not wired to UI
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Defined in schema and defaults but not in settings.registry. No UI control exists.

### developer.logLevel
- **Handle Path:** developer.logLevel
- **Label:** Log Level
- **Category:** Developer
- **Default Value:** "info"
- **UI Control Type:** select (not in registry)
- **Source File:** src/control-plane/settings/settings.schema.ts (line 106)
- **Runtime Target:** Console logging verbosity
- **Live Update Behavior:** No - not wired to UI
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Defined in schema and defaults but not in settings.registry. No UI control exists.

## Summary

**Total Planned Handles:** 19
- 4 physics controls (marked as planned in registry)
- 1 label control (marked as planned in registry)
- 4 graph view controls (marked as planned in registry)
- 4 evidence settings (not in registry)
- 3 source linking settings (not in registry)
- 4 performance settings (not in registry)
- 3 developer settings (not in registry)
- 1 progressive depth slider (not yet defined in schema)
- 1 theme customization menu (not yet defined in schema)

**Key Issues:**
- 14 settings are in schema/defaults but not in registry (no UI controls)
- Duplicate hoverLabelColor in both labels and graphView categories
- Many color settings have defaults matching tokens but are not wired to override tokens
- Progressive depth slider requires stable integer depth first (later phase)
- Theme customization requires full policy system wiring (later phase)

## Progressive Depth Slider (Planned)

### progressive depth slider
- **Handle Path:** N/A (not yet defined in schema)
- **Label:** Progressive Neighborhood Depth
- **Category:** Graph View (future)
- **Default Value:** N/A
- **UI Control Type:** range (future: min 1.0, max 3.0, step 0.1)
- **Source File:** docs/lumaweave_phase_architecture_packet/DEPTH_SLIDER.md
- **Runtime Target:** Decimal neighborhood depth for progressive context
- **Live Update Behavior:** No - not implemented
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Status: Later phase - requires stable integer depth first. Concept: A future depth control may use decimal increments, such as 1.0 → 3.0, where the graph progressively reveals deeper node paths and blends colors along a depth gradient. Requirements: Stable integer depth (1, 2, 3) must be proven first, gradient token system for smooth color transitions, likely Theme/Visual phase work. Not part of Baseline B stabilization.

## Theme Customization (Planned)

### theme customization / color picker
- **Handle Path:** N/A (not yet defined in schema)
- **Label:** Theme Customization Menu
- **Category:** Appearance (future)
- **Default Value:** N/A
- **UI Control Type:** complex (future: color pickers, theme presets)
- **Source File:** docs/33_GRAPH_VISUAL_POLICY_V0.md (Future Theme Customization Plan)
- **Runtime Target:** graphVisualTokens modification
- **Live Update Behavior:** No - not implemented
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Once the policy system is fully wired (Part F), a full theme customization menu can: 1. Edit tokens instead of reaching into SigmaGraphView directly, 2. Provide a unified UI for color customization, 3. Support theme presets, 4. Enable user-defined themes. The policy system provides the contract: the theme editor modifies tokens, policies read tokens, renderer applies decisions. **Note:** Built-in theme preset dropdown is now active in top bar (see 01_ACTIVE_HANDLES.md). Custom theme save/rename/delete/import/export remains planned.
