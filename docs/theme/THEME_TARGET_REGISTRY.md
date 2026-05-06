---
id: registry.theme.target
title: Theme Target Registry
type: registry
status: accepted
version: v20
domain: theme
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: v73c
depends_on:
  - map.theme.token.paths
governs:
  - src/themes/themeTargetRegistry.ts
  - src/themes/ThemeTargetInspectorOverlay.tsx
tags: [theme, target, registry, inspector, overlay, data-lw, accepted, v20]
---

# Theme Target Registry

**Status:** Accepted — v20

---

## Purpose

Define the canonical set of inspectable UI surfaces for LumaWeave. Each entry records a `themeTargetId`, surface classification, optional visual handle, canonical `themeTokenPath` bindings, and the editable properties that future Theme Mapping Mode may expose.

The registry is read-only in v20 — it does not unlock editing controls.

---

## ThemeTargetContract Schema

```typescript
type ThemeTargetContract = {
  themeTargetId: string;
  label: string;
  surface: "shell" | "topbar" | "panel" | "mission-control" | "control" | "settings" | "graph";
  visualHandle?: string;           // e.g. "lw-panel"
  tokenBindings: Partial<Record<ThemeEditableProperty, ThemeTokenPath>>;
  editableProperties: ThemeEditableProperty[];
  status: "active" | "planned" | "experimental";
  notes?: string;
};

// ThemeEditableProperty: "background" | "border" | "text" | "accent" | "glow" | "opacity" | "radius"
```

---

## Active Targets

| themeTargetId | Surface | Visual Handle | Token Bindings |
|--------------|---------|---------------|----------------|
| `app.shell` | shell | — | `app.background`, `app.glow` |
| `topbar.root` | topbar | — | `app.background`, `panel.border`, `text.primary`, `accent.primary` |
| `mission-control.panel` | mission-control | `lw-panel` | `panel.background`, `panel.border`, `text.primary` |
| `mission-control.question-card` | mission-control | `lw-card` | `panel.background`, `panel.border`, `text.primary` |
| `mission-control.proposal-card` | mission-control | `lw-card` | `panel.background`, `panel.border`, `text.primary` |
| `mission-control.backlog-card` | mission-control | `lw-card` | `panel.background`, `panel.border`, `text.primary` |
| `settings.panel` | settings | `lw-panel` | `panel.background`, `panel.border`, `text.primary` |
| `graph.frame` | graph | — | `app.background`, `panel.border` |

---

## Planned Targets

| themeTargetId | Notes |
|--------------|-------|
| `graph.node.default` | Pending Graph Visual Policy refresh |
| `graph.node.selected` | Planned for interaction state mapping |
| `graph.edge.default` | Planned for edge stroke tokens |
| `graph.edge.selected` | Planned for selected edge styling |
| `theme-mapping.panel` | Placeholder for Theme Mapping Panel container |
| `theme-mapping.control` | Placeholder for generated inspector controls |

---

## DOM Attribute

All registered surfaces must have:
```html
data-lw-theme-target="mission-control.panel"
```

The ghost overlay reads this attribute to identify clickable elements. No attribute = not inspectable by the overlay.

---

## UI Inspector Behavior (v20/v25)

- Toggle: `Alt+Shift+I` (Ubuntu-safe debug hotkey)
- Debug tab also exposes toggle button with `data-testid="theme-inspector-toggle-button"`
- Disabled by default
- When ON: ghost overlay outlines registered DOM surfaces with `pointer-events:none` dashed rectangles
- Hovering a registered target: bottom-right metadata panel shows label, ID, surface, status, visual handle, editable properties, token bindings
- Never enables editing (read-only)
- Never modifies layout
- `pointer-events:none` on HUD + panel so normal UI interactions continue

---

## Non-Goals

- No Theme Mapping Panel UI
- No color pickers or editable controls
- No theme override storage or preset saving
- No Sigma/Graphology renderer changes
- No new settings-store schema
