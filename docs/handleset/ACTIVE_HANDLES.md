---
id: handleset.active
title: Active Handles
type: registry
status: accepted
version: v73c
domain: handleset
cluster: azure
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
governs:
  - src/control-plane/contracts/controlSurfaceContract.registry.ts
  - src/control-plane/handles/handleset.registry.ts
tags:
  - handleset
  - active
  - controls
  - handles
  - runtime
  - accepted
---

# Active Handles

Controls that visibly affect runtime behavior in the current build.

---

## Control Surface Contract Registry

Machine-readable registry at:
```
src/control-plane/contracts/controlSurfaceContract.registry.ts
```
Contains all active controls with runtime bindings, QA references, and Playwright coverage. The contract registry does not yet drive UI — SettingsPanel still uses `settings.registry.ts`. The contract registry is a documentation/scaffold layer for contract validation.

---

## Appearance

### appearance.theme
```
Handle Path:    appearance.theme
Label:          Theme
Default:        "solar-plasma"
Control:        select (dropdown)
Source:         src/control-plane/settings/settings.schema.ts
Runtime Target: AppShell.tsx top bar theme selector
Live Update:    Yes — theme changes immediately on selection
Status:         active
Tests:          tests/e2e/theme-selector.spec.ts
QA Checklist:   theme-mission-control-integrity-v11
Notes:          Built-in presets only (solar-plasma, obsidian-aurora, midnight-loom, void-circuit, agartha-dream, agartha-dusk).
                Custom themes not yet supported.
```

### appearance.glitterEnabled
```
Handle Path:    appearance.glitterEnabled
Label:          Enable Glitter
Default:        true
Control:        boolean toggle
Source:         src/control-plane/settings/settings.registry.ts
Runtime Target: Semantic visual effects (sparkle, flare, plasma)
Live Update:    Yes — glitter toggles immediately
Status:         active
Tests:          tests/e2e/theme-selector.spec.ts
Notes:          Available in top bar for quick access. Not fully wired to renderer yet.
```

### appearance.reduceMotion
```
Handle Path:    appearance.reduceMotion
Label:          Reduce Motion
Default:        false
Control:        boolean toggle
Source:         src/app/AppShell.tsx (top bar only — NOT in settings panel)
Runtime Target: Animation smoothness, motion safety gate
Live Update:    Yes — applies immediately
Status:         active
Tests:          tests/e2e/theme-selector.spec.ts
Notes:          Commented out in settings.registry.ts (moved to top bar).
                This is the master authority for all visual reactivity.
```

---

## Graph View

### graph.labelMode
```
Handle Path:    graph.labelMode
Label:          Label Mode
Default:        "smart"
Control:        select
Runtime Target: Sigma label rendering policy
Live Update:    Yes
Status:         active
Tests:          tests/e2e/settings-label-controls.spec.ts
```

### graph.edgeLabelMode
```
Handle Path:    graph.edgeLabelMode
Label:          Edge Label Mode
Default:        "hover"
Control:        select
Runtime Target: Sigma edge label rendering
Live Update:    Yes
Status:         active
Tests:          tests/e2e/settings-label-controls.spec.ts
```

### graph.neighborhoodDepth
```
Handle Path:    graph.neighborhoodDepth
Label:          Neighborhood Depth
Default:        1
Control:        select (1 / 2 / 3)
Runtime Target: Node/edge selection depth highlighting
Live Update:    Yes
Status:         active
Tests:          tests/e2e/graph-visual-state-stability.spec.ts
```

---

## Physics

### physics.nodeSize
```
Handle Path:    physics.nodeSize
Label:          Node Size
Default:        1.0
Control:        number slider (0.5 – 3.0)
Runtime Target: Sigma node size multiplier
Live Update:    Yes
Status:         active
```

### physics.linkDistance
```
Handle Path:    physics.linkDistance
Label:          Link Distance
Default:        80
Control:        number slider
Runtime Target: ForceAtlas2 link distance
Live Update:    Yes
Status:         active
```

### physics.repelForce
```
Handle Path:    physics.repelForce
Label:          Repel Force
Default:        0.5
Control:        number slider
Runtime Target: ForceAtlas2 repel force
Live Update:    Yes
Status:         active
```

---

## Notes

- Manual QA overrides code inspection for active handle status
- "active" means wired and functional, not that every edge case is handled
- Use `data-testid` from tests as the canonical selector reference
