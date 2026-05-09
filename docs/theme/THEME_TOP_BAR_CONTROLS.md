---
id: theme.top.bar.controls
title: Theme Top Bar Controls
type: guide
status: current
version: v86a
domain: theme
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
governs:
  - src/app/AppShell.tsx
references:
  - theme.system.overview
  - theme.preset.model
  - theme.customization.roadmap
  - theme.override.storage.contract
  - link.network.layer.2
tags:
  - theme
  - top-bar
  - controls
  - ui
  - v86a
---

# Theme Top Bar Controls

The top bar holds quick-access controls for theme switching and visual effect toggles. This doc describes which controls exist, where they bind, what's planned, and what's not.

For implementation details, read `src/app/AppShell.tsx` directly. This doc captures intent and connections, not code.

---

## Current state (v86a)

Three controls live in the top bar:

| Control | Type | Setting key | Status |
|---------|------|-------------|--------|
| Theme preset dropdown | `select` | `appearance.theme` | active |
| Glitter toggle | `checkbox` | `appearance.glitterEnabled` | active |
| Reduce-motion toggle | `checkbox` | `appearance.reduceMotion` | active |

All three are wired to runtime, persist via the settings store, and apply changes immediately (`liveUpdate: true` per the Layer 2 contract).

---

## Theme preset dropdown

The dropdown shows all six built-in themes and applies the selected preset on change. No save / rename / delete / import / export controls exist yet — those are tracked in [Theme Customization Roadmap](theme.customization.roadmap).

**Available presets:**
- `solar-plasma` — Solar Plasma (default)
- `obsidian-aurora` — Obsidian Aurora
- `midnight-loom` — Midnight Loom
- `void-circuit` — Void Circuit
- `agartha-dream` — Agartha Dream
- `agartha-dusk` — Agartha Dusk

For the preset model (interface, theme IDs, tier integration), see [Theme Preset Model](theme.preset.model).

**Behavior:**
- Default selection follows `appearance.theme` from the settings store
- Change applies new theme immediately via `applyTheme.ts`
- Custom presets not yet supported (see customization roadmap)

---

## Glitter toggle

Boolean toggle for the glitter visual effect (selection ambience, glitter field overlays). When disabled, the GlitterField overlay component receives `enabled: false` and renders nothing.

Bound to `appearance.glitterEnabled` setting. Persists across sessions.

---

## Reduce-motion toggle

Boolean toggle that respects user preference for reduced motion. When enabled:
- Sphere shader animations stop (uniforms freeze at static values)
- Plasma overlay flow stops
- Selection halo expansion does not animate
- Other motion-bearing effects render in static mode

Bound to `appearance.reduceMotion` setting. Persists across sessions.

The reduce-motion behavior is the runtime expression of accessibility-aware motion governance. Whether this becomes a token (the planned `motion.reduce` path) or stays a setting flag is a v87+ decision.

---

## Where the controls live in code

| Concern | File |
|---------|------|
| Top bar JSX + control rendering | `src/app/AppShell.tsx` |
| Settings schema | `src/control-plane/settings/settings.schema.ts` |
| Theme application | `src/themes/applyTheme.ts` |
| Setting persistence | `src/control-plane/settings/settings.store.ts` |
| Layer 2 contract entries | `src/control-plane/contracts/controlSurfaceContract.registry.ts` |

For the four-layer link network that connects these controls to runtime rendering, see [Link Network Overview](link.network.overview) and [Layer 2: Control Surface Contract Registry](link.network.layer.2).

---

## What's not in the top bar

The following controls exist elsewhere or don't exist yet:

| Control | Location | Status |
|---------|----------|--------|
| Custom theme save | (planned) | See [Theme Customization Roadmap](theme.customization.roadmap) |
| Custom theme rename / delete | (planned) | Same |
| Theme import / export | (planned, partially shipped via override export in v34c1) | See [Theme Override Storage Contract](theme.override.storage.contract) |
| Layout selector | (not yet) | Future feature |
| Renderer selector (2D / 3D / SVG) | (not yet) | Future feature, multi-renderer coordination |
| Detailed token editing | Theme Mapping Panel | See [Theme Mapping Panel Entry Contract](theme.mapping.panel.entry.contract) |

---

## Responsive behavior

The current implementation is desktop-first. Mobile/tablet layouts and overflow menu behavior are not yet implemented. When responsive design lands, the dropdown stays primary on all sizes; toggles may move to an overflow menu on narrow viewports.

---

## What this doc does not cover

- Theme preset structure — see [Theme Preset Model](theme.preset.model)
- Custom theme creation flow — see [Theme Customization Roadmap](theme.customization.roadmap)
- Override storage / export bundle — see [Theme Override Storage Contract](theme.override.storage.contract)
- Token editing UI — see [Theme Mapping Panel Entry Contract](theme.mapping.panel.entry.contract)
- The four-layer link network — see [Link Network Overview](link.network.overview)
- Setting persistence mechanics — see settings system docs

---

*Replaces v15-era top bar controls doc. Updated for current 6 themes and v86a control plane.*
