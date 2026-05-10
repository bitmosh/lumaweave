---
id: link.network.layer.1
title: Layer 1 — Handle Registry
type: registry
status: current
version: v86a
domain: registries
cluster: azure
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-10
governs:
  - src/control-plane/handles/handleset.registry.ts
references:
  - link.network.overview
  - link.network.layer.2
  - handleset.active
  - handleset.concept
tags:
  - link-network
  - layer-1
  - handles
  - controls
  - registry
  - v86a
  - vP-Registry-Y
---

# Layer 1 — Handle Registry

Layer 1 of the four-layer link network. Catalogs user-manipulable controls as abstract handles, independent of where they appear in the UI. Each handle represents a control capability with metadata about its category, default value, control type, and runtime binding.

## Source of Truth

`src/control-plane/handles/handleset.registry.ts`

## Schema

```typescript
interface HandlesetEntry {
  handle: string;           // Dot-path identifier (e.g., "labels.nodeLabelMode")
  label: string;            // Human-readable name
  category: string;         // Logical grouping (Labels, Appearance, Graph View, etc.)
  defaultValue: any;        // Default value for the handle
  controlType: string;      // UI control type (select, range, checkbox, color, internal)
  status: "active" | "internal" | "partial" | "planned";
  binding: {
    sourceFile: string;     // Where the setting is defined
    runtimeTarget: string;  // Which code consumes the setting
    liveUpdate: boolean;    // Whether changes apply immediately
    notes?: string;         // Additional binding context
  };
  qa: {
    checklistId?: string;  // QA checklist ID if applicable
    playwrightTest?: string; // Playwright test file if applicable
    manualQA?: string;     // Manual QA notes if applicable
  };
  notes: string;           // Description of what the handle controls
}
```

## Entry Table

| Handle | Label | Category | Status | Cross-Reference (settingsKey) |
|--------|-------|----------|--------|--------------------------------|
| labels.nodeLabelMode | Node Label Mode | Labels | active | appearance.labels.nodeLabelMode |
| labels.edgeLabelMode | Edge Label Mode | Labels | active | appearance.labels.edgeLabelMode |
| labels.nodeLabelFontSize | Node Label Font Size | Labels | active | appearance.labels.nodeLabelFontSize |
| labels.edgeLabelFontSize | Edge Label Font Size | Labels | active | appearance.labels.edgeLabelFontSize |
| labels.maxEdgeLabelLength | Max Edge Label Length | Labels | active | appearance.labels.maxEdgeLabelLength |
| labels.showLabelsOnHover | Show Labels On Hover | Labels | active | appearance.labels.showLabelsOnHover |
| graphView.nodeSelectionStage | Neighborhood Depth | Graph View | active | graph.neighborhoodDepth |
| graphView.hoverNodeColor | Hover Node Color | Graph View | active | graph.hoverNodeColor |
| appearance.theme | Theme | Appearance | active | appearance.theme |
| appearance.glitterEnabled | Glitter Enabled | Appearance | active | appearance.glitterEnabled |
| physics.nodeSize | Node Size | Graph View | active | graph.nodeSize |
| physics.linkDistance | Simulation Speed | Graph View | active | graph.linkDistance |
| physics.repelForce | Repel Force | Graph View | active | graph.repelForce |
| hoveredNodeId | Hovered Node ID | Internal | internal | — |
| hoveredEdgeId | Hovered Edge ID | Internal | internal | — |
| selectedNodeId | Selected Node ID | Internal | internal | — |
| selectedEdgeId | Selected Edge ID | Internal | internal | — |
| labels.zoomLabelThreshold | Zoom Label Threshold | Labels | partial | — |
| missionControl.activeChecklistId | Active Checklist ID | Mission Control | partial | — |
| missionControl.lastSubmittedReport | Last Submitted Report | Mission Control | partial | — |
| missionControl.submissionHistory | Submission History | Mission Control | partial | — |
| theme.presetDropdown | Theme Preset Dropdown | Theme | active | appearance.theme |
| theme.customThemePresets | Custom Theme Presets | Theme | planned | — |
| agentChat.enabled | Agent Chat Enabled | Mission Control | planned | — |
| graphIntelligence.clusterGravity | Cluster Gravity | Graph View | planned | — |
| graphIntelligence.progressiveDepthSlider | Progressive Depth Slider | Graph View | planned | — |

## Categories

- **Labels:** Label visibility and styling controls
- **Graph View:** Graph rendering and interaction controls
- **Appearance:** Theme and visual appearance controls
- **Internal:** Runtime state tracking (not user-controllable)
- **Mission Control:** QA and mission control panel state
- **Theme:** Theme preset and customization controls
- **Physics:** Physics simulation controls (not yet wired)

## Status Values

- **active:** Handle is implemented and affects runtime behavior
- **internal:** Handle tracks internal state, not user-controllable
- **partial:** Handle is partially implemented or represented differently in runtime
- **planned:** Handle is documented but not yet implemented

## Cross-Reference Pattern

Layer 1 handles connect to Layer 2 contracts via the `settingsKey` field. A handle's `binding.sourceFile` typically points to a settings schema, and the Layer 2 contract's `settingsKey` references the same setting path.

**Example:**
- Layer 1: `handle: "appearance.theme"` → `binding.sourceFile: "src/control-plane/settings/settings.schema.ts"`
- Layer 2: `id: "topbar.themeSelector"` → `settingsKey: "appearance.theme"`

## Runtime Binding Notes

- **Live Update:** Controls with `liveUpdate: true` apply changes immediately without requiring a graph rebuild
- **Non-Live Update:** Physics controls (nodeSize, linkDistance, repelForce) require graph rebuild to apply
- **Not Yet Wired:** Some handles (glitterEnabled, physics controls) are documented but not yet connected to runtime
- **Internal State:** Handles in the Internal category track runtime state (hoveredNodeId, selectedNodeId, etc.) but are not user-controllable

## Boundary Notes

This registry is documentation and scaffolding only. It does not yet drive the UI. SettingsPanel still uses `settings.registry.ts`. The contract registry (Layer 2) is a contract map and validation aid only.
