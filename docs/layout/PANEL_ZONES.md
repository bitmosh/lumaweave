---
id: layout.panel.zones
title: Panel Zones
type: manual
status: accepted
version: v73c
domain: layout
cluster: stone
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
tags:
  - layout
  - panels
  - zones
  - left-rail
  - right-rail
  - viewport
  - accepted
references:
  - layout.cockpit.overview
---

# Panel Zones

---

## Left Rail

### Graph Sources
```
Purpose:   Load and manage graph sources
Status:    Partial (graph source loader exists)
Handles:   graph sources
Components:
  Graph source selector
  Load graph button
  Graph summary (node/edge counts)
  Source metadata
  Refresh button
```

### QA / Mission Control
```
Purpose:   Development-time debugging and verification
Status:    Active (QaPanel exists and is the primary QA surface)
Handles:   missionControl.*
Components (current):
  Active checklist display
  Notes field per check
  Pass/Fail/Not Applicable status
  Submit report + copy to clipboard
  QA History (partial)
  Debug checkpoint summary (partial)
Components (planned):
  Last Submitted Report panel
  Agent Chat tab
```

### Project / Session Actions
```
Purpose:   Manage project and session state
Status:    Planned
Handles:   project, session
Components:
  New project, save project, export project
  Session log viewer
  Clear session button
```

---

## Main Viewport

### Graph Renderer
```
Purpose:   Render and interact with graph data
Status:    Active (SigmaGraphView, Sigma 2D, WebGL)
Handles:   graph rendering
Components:
  SigmaGraphView
  Node/edge/label rendering
  ForceAtlas2 physics simulation
  Graph source loading
```

### Overlays
```
Purpose:   Display temporary information over graph
Status:    Partial
Active:    ThemeTargetInspectorOverlay (ghost overlay, partial)
           Selection/hover indicators
Planned:   Floating labels, tooltips, context menus
```

---

## Right Rail

### Control Plane Settings
```
Purpose:   Configure graph visual behavior
Status:    Active (SettingsPanel exists)
Handles:   labels, graphView, physics, appearance
Components (active):
  Label controls (mode, font size, truncation)
  Graph view controls (hover, selection, neighborhood depth)
  Physics controls (node size, link distance, repel force)
  Appearance controls (theme, glitter, reduce motion in top bar)
```

### Inspector
```
Purpose:   Inspect selected nodes and edges
Status:    Active (InspectorPanel exists)
Handles:   inspector
Components:
  Selected node details and attributes
  Selected edge details and attributes
  Source location links (where available)
```

### Renderer Debug
```
Purpose:   Debug renderer state and performance
Status:    Planned
Handles:   renderer debug
Components:
  Renderer statistics
  Layout engine status
  Performance metrics
  Console log viewer
```

---

## Panel State Model

```
expanded    Full content visible, full width/height
collapsed   Collapsed to icon bar or header only
hidden      Completely hidden — toggle button to restore
floating    Detached from rail (future — requires contract)
```

---

## Notes

- Left rail currently has Settings and QA panels (slightly different from intended zone model)
- Right rail currently has Inspector panel
- Main viewport has SigmaGraphView
- Actual zone migration happens as part of tile workspace + cockpit layout contract
