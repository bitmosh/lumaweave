---
id: layout.top.bar.control.plan
title: Top Bar Control Plan
type: contract
status: current
cluster: stone
domain: layout
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
references:
  - layout.cockpit.overview
  - layout.panel.zones
  - layout.lens.navigation
  - layout.tile.workspace.system
  - theme.system.overview
  - theme.preset.model
  - accessibility.motion.safety.contract
governs:
  - src/app/AppShell.tsx
tags: [layout, top-bar, controls, theme, animation, reduce-motion, current]
---

# Top Bar Control Plan

## Current Implementation

Located in `src/app/AppShell.tsx`.

### Currently Implemented

```
LumaWeave title / branding (left)

Theme preset dropdown
  → appearance.theme handle
  → 6 built-in presets (solar-plasma, obsidian-aurora, midnight-loom,
    void-circuit, agartha-dream, agartha-dusk)
  → Custom themes: NOT YET IMPLEMENTED

Animation toggle (formerly "Glitter")
  → appearance.animationEnabled handle
  → Controls sparkle / flare / plasma / motion effects
  → Available in top bar for quick access

Reduce Motion toggle
  → appearance.reduceMotion handle
  → Top bar only (removed from settings panel)
  → This is the master motion safety control
  → Future: replace toggle with intensity slider (see "Planned" below)
```

### Implementation Reference

```tsx
// Theme dropdown (AppShell.tsx)
<select
  value={settings.appearance.theme}
  onChange={(e) => setSetting("appearance.theme", e.target.value)}
  className="rounded-lg border border-cyan-400/20 bg-slate-900 px-3 py-1.5 text-xs ..."
>
  <option value="solar-plasma">Solar Plasma</option>
  <option value="obsidian-aurora">Obsidian Aurora</option>
  <option value="midnight-loom">Midnight Loom</option>
  <option value="void-circuit">Void Circuit</option>
  <option value="agartha-dream">Agartha Dream</option>
  <option value="agartha-dusk">Agartha Dusk</option>
</select>
```

---

## Planned Top Bar Additions

### Reduce Motion Slider (replacing toggle)

Promotes the binary toggle to a graduated control:

```
Handle:  appearance.reduceMotionLevel
Type:    slider (0–100, integer)
Levels:
  0   = full motion (animations at design speed)
  25  = soften (animations slowed, transitions still active)
  50  = minimal (only essential motion, no decorative motion)
  75  = static-with-fades (no continuous motion, fades only)
  100 = full freeze (no motion of any kind, master safety)
Status:  planned
Notes:   Each level maps to motion safety classes. The current toggle
         maps to 0 (off) and 100 (on); the slider exposes intermediate
         states. Reduced motion is master authority — see
         accessibility.motion.safety.contract.
```

### Layout Preset Dropdown
```
Handle:  layout.layoutPreset
Options: Default | Focus | Debug | Inspector | QA Mode
Status:  planned
Notes:   Do not implement until layout preset contract exists.
         Long-term path is the Tile Workspace System, where this
         dropdown becomes a saved-workspace selector.
```

### Renderer Selector
```
Handle:  rendering.activeLayer
Options: Sigma 2D | Hyper 3D (future) | Flat (future)
Status:  planned
Notes:   Do not implement until rendering layer contract is complete.
```

### Lens Selector
```
Handle:  lens.active
Options: Overview | Atlas | Evidence | Signal | Workshop | Mission
Status:  planned — see layout.lens.navigation
Notes:   Do not implement until lens navigation contract exists.
```

### Save Custom Theme Button
```
Handle:  theme.saveCustomPreset
Status:  planned
Behavior: Opens modal → prompts for name → validates → saves to
          customPresets via theme override storage
```

---

## Top Bar Constraints

```
Do not add controls that are not registered in the handleset
Do not add controls with no wired action (dead controls)
Do not implement layout preset dropdown without a layout preset contract
Do not implement renderer selector without rendering layer contract
Do not implement lens selector without lens navigation contract
Top bar width is limited — prefer compact controls (dropdowns over
  toggles where possible)
Reduce Motion control must remain easily accessible — do not bury
  in menus
```

---

## Relationship to Lens Navigation

When the [Lens Navigation Model](layout.lens.navigation) is implemented, the top bar will surface the active lens. The current top bar controls (theme, animation, reduce motion) will remain but may be reorganized into a lens-aware layout.

The six lenses (Overview, Atlas, Evidence, Signal, Workshop, Mission) correspond to different default tile configurations — the top bar provides the primary navigation between them.

---

## Naming Notes

- **"Animation" replaces "Glitter"** — the toggle was originally called Glitter (referencing sparkle/flare effects). Renamed to Animation because it controls motion effects broadly, not just sparkle. Reduces confusion with the "Glitter Goblin" theme name (since retired).
- **"Reduce Motion" stays** — even after the planned slider promotion, the control surface still answers "do you want motion reduced?" The slider exposes intensity rather than changing the question.

---

## Theme List History

The current 6-theme set was reached during v74-v85. Earlier shipping sets included:

```
v50-v60 era: 4 presets (solar-plasma, obsidian-aurora, haunted-observatory,
             glitter-goblin) — last 2 phased out during theme polish
v74+:        6 presets (solar-plasma, obsidian-aurora, midnight-loom,
             void-circuit, agartha-dream, agartha-dusk) — current
```

Future theme additions and customization paths are tracked in [Theme Customization Roadmap](theme.customization.roadmap).
