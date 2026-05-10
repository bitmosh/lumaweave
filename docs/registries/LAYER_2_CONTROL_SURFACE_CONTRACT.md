---
id: link.network.layer.2
title: Layer 2 — Control Surface Contract Registry
type: registry
status: current
version: v86a
domain: registries
cluster: slate
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-10
governs:
  - src/control-plane/contracts/controlSurfaceContract.registry.ts
references:
  - link.network.overview
  - link.network.layer.1
  - link.network.layer.3
  - control.surface.contract
tags:
  - link-network
  - layer-2
  - contracts
  - control-surface
  - registry
  - v86a
  - vP-Registry-Y
---

# Layer 2 — Control Surface Contract Registry

Layer 2 of the four-layer link network. Describes where user-facing controls live in the UI surface and maps them to their Layer 1 handles via `settingsKey`. Each contract represents a control location (surface + component) with metadata about its owner, runtime binding, QA coverage, and documentation status.

## Source of Truth

`src/control-plane/contracts/controlSurfaceContract.registry.ts`

## Schema

```typescript
interface ControlSurfaceContract {
  id: string;                      // Dot-path identifier (e.g., "topbar.themeSelector")
  label: string;                   // Human-readable name
  surface: SurfaceType;            // UI surface where control lives
  owner: string;                   // Code owner (e.g., "settings.store.ts")
  settingsKey: string | null;      // Layer 1 handle reference (null if no storage)
  noStorageReason?: string;        // Explanation if settingsKey is null
  runtimeBinding: {
    sourceFile: string;            // Where the control is implemented
    targetComponent: string;       // Which component handles the control
    liveUpdate: boolean;           // Whether changes apply immediately
  };
  qa: {
    checklistKey?: string;         // QA checklist ID if applicable
    hasQaCoverage: boolean;        // Whether QA coverage exists
  };
  playwright: {
    testFile?: string;             // Playwright test file if applicable
    hasCoverage: boolean;          // Whether Playwright coverage exists
  };
  docs: {
    location: string;             // Documentation location
    hasDocs: boolean;              // Whether docs exist
  };
  status: "active" | "planned" | "retired";
  risk: "low" | "medium" | "high"; // Risk level for changes
  notes: string;                  // Description of the control contract
}

type SurfaceType = "topbar" | "graph" | "missionControl" | "settings";
```

## Surface Enum

The `surface` field defines where a control lives in the UI:

- **topbar:** Top application bar (theme selector, glitter toggle, reduce motion)
- **graph:** Graph rendering surface (label controls, physics controls, hover styling)
- **missionControl:** QA panel (checklist navigation, status selectors, submit, history)
- **settings:** Settings panel (not currently used in contracts)

## Entry Table

| ID | Label | Surface | Status | Cross-Reference (settingsKey) |
|----|-------|---------|--------|-------------------------------|
| topbar.themeSelector | Theme Selector | topbar | active | appearance.theme |
| topbar.glitterToggle | Glitter Toggle | topbar | active | appearance.glitterEnabled |
| topbar.reduceMotionToggle | Reduce Motion Toggle | topbar | active | appearance.reduceMotion |
| graph.nodeLabelMode | Node Label Mode | graph | active | labels.nodeLabelMode |
| graph.edgeLabelMode | Edge Label Mode | graph | active | labels.edgeLabelMode |
| graph.showLabelsOnHover | Show Labels On Hover | graph | active | labels.showLabelsOnHover |
| graph.nodeLabelFontSize | Node Label Font Size | graph | active | labels.nodeLabelFontSize |
| graph.edgeLabelFontSize | Edge Label Font Size | graph | active | labels.edgeLabelFontSize |
| graph.maxEdgeLabelLength | Max Edge Label Length | graph | active | labels.maxEdgeLabelLength |
| graph.neighborhoodDepth | Neighborhood Depth | graph | active | graphView.nodeSelectionStage |
| graph.hoverNodeColor | Hover Node Color | graph | active | graphView.hoverNodeColor |
| graph.nodeSize | Node Size | graph | active | physics.nodeSize |
| graph.linkDistance | Link Distance | graph | active | physics.linkDistance |
| graph.repelForce | Repel Force | graph | active | physics.repelForce |
| missionControl.tabs | Mission Control Tabs | missionControl | active | — |
| missionControl.checklistNavigation | QA Checklist Navigation | missionControl | active | — |
| missionControl.statusSelectors | QA Status Selectors | missionControl | active | — |
| missionControl.notesField | QA Notes Field | missionControl | active | — |
| missionControl.submitReport | QA Submit Report | missionControl | active | — |
| missionControl.copyLastSubmission | Copy Last Submission | missionControl | active | — |
| missionControl.decisionBadge | Mission Control Decision Badge | missionControl | active | — |
| missionControl.history | Mission Control History | missionControl | active | — |

## Surface Breakdown

### Top Bar Controls (3)
- Theme selector (built-in presets)
- Glitter toggle (not yet fully wired)
- Reduce motion toggle (animation smoothness)

### Graph Controls (11)
- Label visibility modes (node/edge)
- Label font sizes (node/edge)
- Edge label truncation
- Neighborhood depth selection
- Hover node color
- Physics controls (node size, link distance, repel force) — not live-update

### Mission Control Controls (10)
- Tab switching (Checklist/Last Report/History/Debug)
- Checklist navigation (Next/Previous)
- Status selectors (Pass/Fail/Not Applicable)
- Notes fields per check
- Submit report button
- Copy last submission to clipboard
- Decision badge (ACCEPT/INCOMPLETE/BLOCKED)
- History tab

## Cross-Reference Pattern

Layer 2 contracts connect to Layer 1 handles via the `settingsKey` field. A contract's `settingsKey` references a Layer 1 handle's `handle` field, establishing the link between UI surface location and abstract control capability.

**Example:**
- Layer 1: `handle: "appearance.theme"` (abstract handle)
- Layer 2: `id: "topbar.themeSelector"` → `settingsKey: "appearance.theme"` (UI location)

Mission Control controls have `settingsKey: null` because they operate on QA panel local state only and do not persist to settings storage.

## Runtime Binding Notes

- **Live Update:** Controls with `liveUpdate: true` apply changes immediately
- **Non-Live Update:** Physics controls (nodeSize, linkDistance, repelForce) require graph rebuild
- **No Storage:** Mission Control controls have `settingsKey: null` and `noStorageReason` explaining they live in QA panel state only

## QA Coverage

- **Playwright Coverage:** 15 of 24 contracts have Playwright test coverage
- **Manual QA Accepted:** Physics controls and some graph controls have manual QA acceptance
- **QA Checklist Keys:** Contracts reference specific checklist keys for tracking

## Boundary Notes

This registry is a contract map and validation aid only. It does not yet drive UI. The contract registry describes and validates the currently active control surface but does not control rendering.
