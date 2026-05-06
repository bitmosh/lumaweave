---
id: layout.top.bar.control.plan
title: Top Bar Control Plan
type: manual
status: accepted
version: v73c
domain: layout
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: v73c
governs:
  - src/app/AppShell.tsx
tags: [layout, top-bar, controls, theme, glitter, reduce-motion, accepted]
---

# Top Bar Control Plan

---

## Current Implementation

Located in `src/app/AppShell.tsx`.

### Currently Implemented

```
LumaWeave title / branding (left)

Theme preset dropdown
  → appearance.theme handle
  → 4 built-in presets (solar-plasma, obsidian-aurora, haunted-observatory, glitter-goblin)
  → Custom themes: NOT YET IMPLEMENTED

Glitter toggle
  → appearance.glitterEnabled handle
  → Controls sparkle/flare/plasma effects
  → Available in top bar for quick access

Reduce Motion toggle
  → appearance.reduceMotion handle
  → Top bar only (removed from settings panel)
  → This is the master motion safety control
```

### Implementation Reference

```tsx
// Theme dropdown (AppShell.tsx ~lines 86-95)
<select
  value={settings.appearance.theme}
  onChange={(e) => setSetting("appearance.theme", e.target.value)}
  className="rounded-lg border border-cyan-400/20 bg-slate-900 px-3 py-1.5 text-xs ..."
>
  <option value="solar-plasma">Solar Plasma</option>
  <option value="obsidian-aurora">Obsidian Aurora</option>
  <option value="haunted-observatory">Haunted Observatory</option>
  <option value="glitter-goblin">Glitter Goblin</option>
</select>
```

---

## Planned Top Bar Additions

### Layout Preset Dropdown
```
Handle:  layout.layoutPreset
Options: Default | Focus | Debug | Inspector | QA Mode
Status:  planned
Notes:   Do not implement until layout preset contract exists
```

### Renderer Selector
```
Handle:  rendering.activeLayer
Options: Sigma 2D | Hyper 3D (future) | Flat (future)
Status:  planned
Notes:   Do not implement until rendering layer contract is complete
```

### Lens Selector
```
Handle:  lens.active
Options: Overview | Atlas | Evidence | Signal | Workshop | Mission
Status:  planned — see docs/layout/LENS_NAVIGATION_MODEL.md
Notes:   Do not implement until lens navigation contract exists
```

### Save Custom Theme Button
```
Handle:  theme.saveCustomPreset
Status:  planned
Behavior: Opens modal → prompts for name → validates → saves to customPresets
```

---

## Top Bar Constraints

```
Do not add controls that are not registered in the handleset
Do not add controls with no wired action (dead controls)
Do not implement layout preset dropdown without a layout preset contract
Do not implement renderer selector without rendering layer contract
Do not implement lens selector without lens navigation contract
Top bar width is limited — prefer compact controls (dropdowns over toggles where possible)
Reduce Motion toggle must remain easily accessible — do not bury in menus
```

---

## Relationship to Lens Navigation

When the Lens Navigation Model (docs/layout/LENS_NAVIGATION_MODEL.md) is implemented, the top bar will surface the active lens. The current top bar controls (theme, glitter, reduce motion) will remain but may be reorganized into a lens-aware layout.

The six lenses (Overview, Atlas, Evidence, Signal, Workshop, Mission) correspond to different default tile configurations — the top bar provides the primary navigation between them.
