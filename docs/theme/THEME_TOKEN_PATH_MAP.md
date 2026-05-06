---
id: map.theme.token.paths
title: Theme Token Path Map
type: registry
status: accepted
version: v19
domain: theme
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: v73c
governs:
  - src/themes/themeTokenPaths.ts
tags: [theme, tokens, paths, canonical, map, accepted, v19]
---

# Theme Token Path Map

**Status:** Accepted — v19 (canonical vocabulary for all theme systems)

---

## Purpose

Define the stable canonical names that bridge current theme runtime tokens to future Theme Mapping Mode targets, the Grammar Lens overlay, and the Theme Target Registry. Every path here resolves to a real runtime value in `themeTokenPaths.ts`.

Only values that exist in `ThemeRuntimeTokens` receive canonical paths. Planned paths are listed but marked as such — they are not resolvable until promoted.

---

## Canonical Token Groups

| Group | Purpose |
|-------|---------|
| `app.*` | Shell/background scaffolding |
| `panel.*` | Mission Control + panel chrome |
| `text.*` | Primary vs muted UI text |
| `accent.*` | Highlight/accent color |
| `graph.node.*` | Node fills + label color |
| `graph.edge.*` | Edge strokes + label color |
| `effects.glow.*` | Non-graph glow intensity |

---

## Active Token Paths (Resolvable Today)

| Token Path | Resolves To | Consumers |
|-----------|-------------|----------|
| `app.background` | `tokens.app.background` | App shell bg, Mission Control panels |
| `app.glow` | `tokens.app.glow` | Shell glow gradients, ambient effects |
| `panel.background` | `tokens.panelBackground` | Mission Control cards, settings panel |
| `panel.border` | `tokens.panelBorder` | Panel chrome borders |
| `text.primary` | `tokens.textPrimary` | Main UI text |
| `text.muted` | `tokens.textMuted` | Dimmed/secondary UI text |
| `accent.primary` | `tokens.accentPrimary` | Highlight color, active states |
| `graph.node.default` | `tokens.graph.node.default` | Default node fill |
| `graph.node.selected` | `tokens.graph.node.selected` | Selected node fill |
| `graph.node.hovered` | `tokens.graph.node.hovered` | Hovered node fill |
| `graph.node.label` | `tokens.graph.label.default` | Node label color |
| `graph.edge.default` | `tokens.graph.edge.default` | Default edge stroke |
| `graph.edge.selected` | `tokens.graph.edge.selected` | Selected edge stroke |
| `graph.edge.hovered` | `tokens.graph.edge.hovered` | Hovered edge stroke |
| `effects.glow.intensity` | `tokens.effects.glow` | Shell + Mission Control glow |

---

## Planned Token Paths (Not Yet Resolvable)

| Token Path | Purpose | Status |
|-----------|---------|--------|
| `motion.reduce` | Express reduce-motion preference as token | planned |
| `visualHandle.panel.background` | Bind CSS fallback to canonical path | planned |
| `visualHandle.button.background` | Bind CSS fallback to canonical path | planned |
| `graph.background` | Graph canvas background color | planned |
| `graph.label.color` | Global label color (merged with node.label future) | planned |

---

## Validation

`validateThemeTokenPaths()` in `src/themes/themeTokenPaths.ts` logs any canonical-path drift when themes load (dev-only warning).

`tests/e2e/theme-token-governance.spec.ts` proves:
- Active bindings remain canonical
- Planned tokens remain as placeholders
- Presets resolve every active canonical path
- `test.skip` is never present

---

## Terminology Reference

```
themeId           which preset is active (e.g. "solar-plasma")
themeTokenPath    canonical string from this doc (e.g. "panel.border")
visualHandle      CSS primitive (e.g. ".lw-panel")
themeTargetId     future inspectable UI element ID (e.g. "mission-control.panel")
handleId          Control Contract identity
settingsKey       persisted state path for controls
```

---

## Non-Goals

- Do not add Theme Mapping UI or color pickers from this doc
- Do not rename `ThemeRuntimeTokens` — the resolver adapts
- Do not synchronize every CSS variable in v19 — documenting the bridge is sufficient
