---
id: layout.panel.zones
title: Panel Zones
type: contract
status: current
cluster: stone
domain: layout
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
references:
  - layout.cockpit.overview
  - layout.top.bar.control.plan
  - layout.tile.workspace.system
  - handleset.active
  - handleset.planned
tags: [layout, panels, zones, rails, handles, controls]
---

# Panel Zones

## Overview

The cockpit layout is divided into three main zones: Left Rail, Main Viewport, and Right Rail. Each zone contains specific panels and controls.

## Left Rail

### Graph Sources
- **Purpose:** Load and manage graph sources
- **Components:**
  - Graph source selector
  - Load graph button
  - Graph summary (node/edge counts)
  - Source metadata
  - Refresh button
- **Status:** Partial (graph source loader exists)
- **Related Handles:** graph sources

### QA / Mission Control
- **Purpose:** Development-time debugging and verification
- **Components:**
  - Active checklist display
  - Notes field per check
  - Pass/Fail/Not Applicable status
  - Submit report
  - Copy report
  - Last Submitted Report (planned)
  - QA History (planned)
  - Debug checkpoint summary (planned)
  - Agent Chat (future)
- **Status:** Active (QA panel exists)
- **Related Handles:** missionControl

### Project / Session Actions
- **Purpose:** Manage project and session state
- **Components:**
  - New project button
  - Save project button
  - Export project button
  - Session log viewer
  - Clear session button
- **Status:** Planned
- **Related Handles:** project, session

## Main Viewport

### Graph Renderer
- **Purpose:** Render and interact with graph
- **Components:**
  - SigmaGraphView
  - Graph canvas
  - Node rendering
  - Edge rendering
  - Label rendering
- **Status:** Active (SigmaGraphView exists)
- **Related Handles:** graph rendering

### Overlays
- **Purpose:** Display temporary information over graph
- **Components:**
  - Floating labels (planned)
  - Tooltips (planned)
  - Context menus (planned)
  - Selection indicators
  - Hover indicators
- **Status:** Partial (selection/hover indicators exist)
- **Related Handles:** overlays

## Right Rail

### Control Plane Settings
- **Purpose:** Configure graph behavior
- **Components:**
  - Label controls (node/edge label modes, font sizes, truncation)
  - Graph view controls (hover colors, selection stage, neighborhood depth)
  - Physics controls (node size, link distance, repel force)
  - Appearance controls (theme, animation, reduce motion)
- **Status:** Active (SettingsPanel exists)
- **Related Handles:** labels, graphView, physics, appearance

### Inspector
- **Purpose:** Inspect selected nodes and edges
- **Components:**
  - Selected node details
  - Selected edge details
  - Node attributes
  - Edge attributes
  - Source location links
- **Status:** Active (InspectorPanel exists)
- **Related Handles:** inspector

### Renderer Debug
- **Purpose:** Debug renderer state
- **Components:**
  - Renderer statistics
  - Layout engine status
  - Performance metrics
  - Console log viewer
- **Status:** Planned
- **Related Handles:** renderer debug

## Panel Zone Handles

### leftRailMode
- **Handle Path:** layout.leftRailMode
- **Label:** Left Rail Mode
- **Category:** Layout
- **Default Value:** "expanded"
- **UI Control Type:** select (expanded/collapsed/hidden)
- **Source File:** src/control-plane/settings/settings.schema.ts (planned)
- **Runtime Target:** Left rail panel state
- **Live Update Behavior:** Yes - rail mode changes immediately
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** Layout v0 (future)
- **Notes:** Controls left rail visibility state.

### rightRailMode
- **Handle Path:** layout.rightRailMode
- **Label:** Right Rail Mode
- **Category:** Layout
- **Default Value:** "expanded"
- **UI Control Type:** select (expanded/collapsed/hidden)
- **Source File:** src/control-plane/settings/settings.schema.ts (planned)
- **Runtime Target:** Right rail panel state
- **Live Update Behavior:** Yes - rail mode changes immediately
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** Layout v0 (future)
- **Notes:** Controls right rail visibility state.

### topBarThemeSelector
- **Handle Path:** layout.topBarThemeSelector
- **Label:** Top Bar Theme Selector
- **Category:** Layout
- **Default Value:** "solar-plasma"
- **UI Control Type:** select (theme preset dropdown)
- **Source File:** src/control-plane/settings/settings.schema.ts (planned)
- **Runtime Target:** Top bar theme dropdown
- **Live Update Behavior:** Yes - theme changes immediately
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** Theme System v0 (future)
- **Notes:** Theme preset dropdown in top bar.

## Panel Interactions

### Panel Focus
- Clicking panel gives focus
- Keyboard navigation within panel
- Focus indicators

### Panel Collapse
- Collapse button in panel header
- Collapse via keyboard shortcut
- Collapse via layout preset

### Panel Expand
- Expand button in collapsed panel
- Expand via keyboard shortcut
- Expand via layout preset

### Panel Hide
- Hide button in panel header
- Hide via keyboard shortcut
- Hide via layout preset

### Panel Show
- Show button in toolbar
- Show via keyboard shortcut
- Show via layout preset

## Notes

- This is documentation and architecture scaffolding only
- No implementation unless explicitly requested
- Manual QA overrides code inspection
- Left rail currently has Settings and QA panels
- Right rail currently has Inspector panel
- Main viewport has SigmaGraphView
- Current panel/tile behavior is documented in [Tile & Layout Workspace](../canonical/TILE_AND_LAYOUT_WORKSPACE.md).
