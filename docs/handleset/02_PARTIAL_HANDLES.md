# Partial Handles v0

## TypeScript Handleset Scaffold

A machine-readable TypeScript handleset registry is available at:
- `src/control-plane/handles/handleset.registry.ts`

This registry contains all partial handles with their runtime bindings and QA references. The TypeScript scaffold does not yet drive UI - SettingsPanel still uses `settings.registry.ts`. The handleset registry is a machine-readable documentation/scaffold layer for now.

## Overview

Handles that are defined but not fully wired or behavior is uncertain.

## Labels

### labels.zoomLabelThreshold
- **Handle Path:** labels.zoomLabelThreshold
- **Label:** Zoom Label Threshold (Planned)
- **Category:** Labels
- **Default Value:** 1.15
- **UI Control Type:** range (min 0.5, max 3, step 0.05)
- **Source File:** src/control-plane/settings/settings.schema.ts
- **Runtime Target:** Sigma zoom level threshold for label visibility
- **Live Update Behavior:** No - not wired to Sigma
- **Status:** partial
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Marked as "Planned" in registry description. Sigma config has labelRenderedSizeThreshold token but this setting is not connected to it. Setting exists in schema/defaults but **hidden from UI** in settings.registry.ts (commented out) until wired to renderer.

## Visual Tokens (Internal)

These are internal visual tokens defined in graphVisualTokens.ts. They are not user-configurable via UI but are used by the renderer and policy system.

### nodeColorTokens.default
- **Token Path:** graphVisualTokens.nodeColor.default
- **Value:** "#22d3ee"
- **Category:** Visual Tokens
- **UI Control Type:** None (internal)
- **Source File:** src/graph/visual/graphVisualTokens.ts (line 16)
- **Runtime Target:** Sigma default node color
- **Live Update Behavior:** No - hardcoded token
- **Status:** internal
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Used as defaultNodeColor in Sigma config. Not configurable via settings (graphView.defaultNodeColor is planned but not wired).

### nodeColorTokens.selected
- **Token Path:** graphVisualTokens.nodeColor.selected
- **Value:** "#fbbf24"
- **Category:** Visual Tokens
- **UI Control Type:** None (internal)
- **Source File:** src/graph/visual/graphVisualTokens.ts (line 19)
- **Runtime Target:** Selected node fill color
- **Live Update Behavior:** No - hardcoded token
- **Status:** internal
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Used by graphStylePolicy.ts applySelectedNodeStyles. Not configurable via settings (graphView.selectedNodeColor is planned but not wired).

### nodeColorTokens.hover
- **Token Path:** graphVisualTokens.nodeColor.hover
- **Value:** "#ffffff"
- **Category:** Visual Tokens
- **UI Control Type:** None (internal)
- **Source File:** src/graph/visual/graphVisualTokens.ts (line 22)
- **Runtime Target:** Hovered node fill color
- **Live Update Behavior:** Partial - can be overridden by graphView.hoverNodeColor setting
- **Status:** partial
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Token value is "#ffffff" but can be overridden by graphView.hoverNodeColor setting passed to graphStylePolicy.

### edgeColorTokens.default
- **Token Path:** graphVisualTokens.edgeColor.default
- **Value:** "#64748b"
- **Category:** Visual Tokens
- **UI Control Type:** None (internal)
- **Source File:** src/graph/visual/graphVisualTokens.ts (line 39)
- **Runtime Target:** Sigma default edge color
- **Live Update Behavior:** No - hardcoded token
- **Status:** internal
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Used as defaultEdgeColor in Sigma config. Not configurable via settings.

### edgeColorTokens.selected
- **Token Path:** graphVisualTokens.edgeColor.selected
- **Value:** "#a855f7"
- **Category:** Visual Tokens
- **UI Control Type:** None (internal)
- **Source File:** src/graph/visual/graphVisualTokens.ts (line 42)
- **Runtime Target:** Selected edge stroke color
- **Live Update Behavior:** No - hardcoded token
- **Status:** internal
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Used by graphStylePolicy.ts applySelectedNodeStyles/applySelectedEdgeStyles. Not configurable via settings (graphView.selectedEdgeColor is planned but not wired).

### labelFontSizeTokens.edge
- **Token Path:** graphVisualTokens.labelFontSizeTokens.edge
- **Value:** 13
- **Category:** Visual Tokens
- **UI Control Type:** None (internal)
- **Source File:** src/graph/visual/graphVisualTokens.ts (line 84)
- **Runtime Target:** Default edge label font size
- **Live Update Behavior:** Partial - overridden by labels.edgeLabelFontSize setting
- **Status:** partial
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Token is 13 but labels.edgeLabelFontSize setting (default 13) overrides this via live update to Sigma.

### labelFontSizeTokens.node
- **Token Path:** graphVisualTokens.labelFontSizeTokens.node
- **Value:** 13
- **Category:** Visual Tokens
- **UI Control Type:** None (internal)
- **Source File:** src/graph/visual/graphVisualTokens.ts (line 81)
- **Runtime Target:** Default node label font size
- **Live Update Behavior:** Partial - overridden by labels.nodeLabelFontSize setting
- **Status:** partial
- **Related Playwright Tests:** None
- **Related QA Checklist:** None
- **Notes:** Token is 13 but labels.nodeLabelFontSize setting (default 13) overrides this via live update to Sigma. Previously was 12, updated to 13 in Node Label Font Size v0.

## Summary

**Total Partial Handles:** 9
- 1 setting with UI control but no runtime effect (labels.zoomLabelThreshold)
- 8 internal visual tokens (not user-configurable, partially wired to settings)

**Key Issues:**
- labels.zoomLabelThreshold has UI control but no Sigma wiring
- Visual tokens are not user-configurable despite having planned settings for some colors
