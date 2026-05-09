---
id: theme.engine
title: Theme Engine
type: guide
status: current
version: v86a
domain: theme
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
governs:
  - src/themes/applyTheme.ts
  - src/themes/themeTokenGovernance.ts
references:
  - theme.system.overview
  - theme.token.path.map
  - theme.preset.model
  - theme.token.compatibility
  - theme.override.storage.contract
tags:
  - theme
  - engine
  - runtime
  - applyTheme
  - v86a
---

# Theme Engine

The runtime application engine that takes a selected theme preset and writes resolved values into CSS custom properties. This is the bridge between the typed token model (declared in tier files) and the rendered DOM (styled via `--lw-*` custom properties).

The source of truth is `src/themes/applyTheme.ts` and the supporting governance functions in `src/themes/themeTokenGovernance.ts`. This doc describes what the engine does and when, not how each line of code works.

---

## What the engine does

When the active theme changes (or on initial app boot), the engine:

1. Validates the token graph (tier-walk validator hard-throws on violations)
2. Loads the active theme's primitives + semantics
3. Walks Tier 3 → Tier 2 → Tier 1 to resolve every component slot
4. Writes resolved values into CSS custom properties on the document root
5. Applies any active overrides from the override storage layer
6. Notifies any rAF-driven animations (sphere shaders, plasma overlays) of new uniform values

Steps 1-5 happen synchronously on theme change. Step 6 happens on the next animation frame.

---

## Resolution order

The engine resolves token paths through the three-tier chain:

```
Tier 3 component slot   →   Tier 2 semantic   →   Tier 1 primitive
(theme-agnostic)            (per-theme role)      (per-theme raw value)
```

For example, resolving `panel.border` for the active Solar Plasma theme:

```
panel.border                                  ← canonical token path
    ↓ resolves via tokenComponents.panel.border
{surface.border.accent}                       ← Tier 2 semantic ref
    ↓ resolves via solarPlasmaSemantics.surface.border.accent
"{color.gold.500} / 32%"                      ← Tier 1 primitive ref + opacity
    ↓ resolves via solarPlasmaPrimitives.color.gold.500
"#FFB347"                                     ← actual color value (with 32% opacity)
```

The final string gets written to `--lw-panel-border`. CSS rules consume the custom property.

For canonical path → tier resolution details, see [Theme Token Path Map](theme.token.path.map).

---

## Tier-walk validation

Before any resolution happens, the engine validates the token graph via `assertThemeTokenGovernanceClean()`. The validator hard-throws on:

- Active theme target bound to a non-canonical path
- Active theme target bound to a planned-only path
- Tier-walk violation (Tier 3 references something that's not Tier 2, etc.)
- Inline values in Tier 2 or Tier 3 (raw colors instead of references)
- Built-in preset missing a canonical path

Hard-throw is intentional — a corrupt token graph at runtime would silently render wrong values. Throwing at boot makes problems visible immediately.

For full governance rules, see [Theme Token Compatibility](theme.token.compatibility).

---

## CSS custom property output

The engine writes resolved values to CSS custom properties on `document.documentElement`. The naming convention is `--lw-<canonical-path-with-dashes>`:

| Canonical token path | CSS custom property |
|----------------------|---------------------|
| `app.background` | `--lw-app-background` |
| `panel.border` | `--lw-panel-border` |
| `graph.node.fill` | `--lw-graph-node-fill` |
| `node.sphere.glowStrength` | `--lw-node-sphere-glow-strength` |

Stylesheets and components consume these via `var(--lw-<path>)`. CSS is the rendering layer; the engine is the value-writing layer.

The CSS scaffolding for visual handles (`.lw-panel`, `.lw-card`, etc.) lives in `src/styles/lumaweave-visual-handles.css`. Visual handles consume the custom properties and apply them to specific surfaces.

---

## Override application

After base resolution, the engine applies any active overrides from the override storage layer. Override values take precedence over base preset values for the matching token paths.

Override resolution follows the same tier-walk rules as base resolution — overrides cannot bypass tier governance. An override on a Tier 2 path resolves through to a Tier 1 primitive value just like a base preset would.

For override storage rules, scopes, and persistence, see [Theme Override Storage Contract](theme.override.storage.contract).

---

## Animation hand-off

Some token paths drive uniforms in rAF-driven animations rather than CSS custom properties. Examples:

- `node.sphere.glowStrength` → NodeSphereProgram fragment shader uniform
- `node.sphere.flowDuration` → NodeSphereProgram time-based animation rate
- `edge.plasma.flowSpeed` → PlasmaOverlayEdge animation rate
- `selection.halo.maxRadiusRatio` → ClickHalo expansion animation

When the engine resolves these on theme change, it notifies the relevant program/component to update its uniform on the next animation frame. Implementation is in the renderer code, not the engine itself.

The reduce-motion setting can short-circuit animation hand-off for accessibility — when `appearance.reduceMotion` is true, animation-bearing tokens still resolve to values but the renderers freeze their motion.

---

## Source files

| Concern | File |
|---------|------|
| Engine entry point | `src/themes/applyTheme.ts` |
| Tier-walk validator | `src/themes/themeTokenGovernance.ts` |
| Path → value resolver | `src/themes/themeTokenPaths.ts` (`resolveThemeTokenPath`) |
| Tier 1 primitives | `src/themes/tokenPrimitives.ts` |
| Tier 2 semantics | `src/themes/tokenSemantics.ts` |
| Tier 3 components | `src/themes/tokenComponents.ts` |
| Per-theme runtime tokens | `src/themes/themeTokens.ts` |
| Override storage | `src/themes/themeOverrideStorage.ts` |
| CSS custom property mirror | `src/styles/lumaweave-visual-handles.css` |

---

## What this doc does not cover

- Token vocabulary — see [Theme Token Path Map](theme.token.path.map)
- Preset structure — see [Theme Preset Model](theme.preset.model)
- Tier governance — see [Theme Token Compatibility](theme.token.compatibility)
- Override storage rules — see [Theme Override Storage Contract](theme.override.storage.contract)
- Multi-renderer (2D / 3D / SVG) coordination — planned for v86d/v86e
- Asset bank integration with engine — pending v88+ workshop

---

*Compressed and refocused from v15-era engine doc. Old doc covered token architecture, presets, runtime, and customization in one sprawling file. This version focuses on the runtime application engine specifically; other concerns now live in dedicated docs.*
