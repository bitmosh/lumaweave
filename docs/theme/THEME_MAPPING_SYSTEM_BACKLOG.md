---
id: backlog.theme.mapping.system
title: Theme Mapping System Backlog
type: manual
status: accepted
version: v18a
domain: theme
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: v73c
related:
  - registry.theme.target
  - map.theme.token.paths
tags: [theme, mapping, backlog, v18a, inspector, overlay, architecture]
---

# Theme Mapping System Backlog

**Status:** Accepted — v18a (architecture-only, no runtime code)

---

## Vision

Theme Mapping Mode is the future fusion point between Control Contract OS, Visual Handle Library, and the Theme Token Path Map. Inspired by Ableton's MIDI Map Mode:

1. Operator toggles Theme Mapping Mode
2. Inspector overlay highlights `data-lw-theme-target` nodes as cursor moves
3. Hovering shows `themeTargetId`, `visualHandle`, `tokenBindings`, editable properties
4. Clicking generates a contextual theme panel seeded with allowed controls
5. Operator previews adjustments → saves to preset or discards
6. Debug UI reflects active overrides for QA evidence

---

## Core Terms

```
handleId         Control Contract identity
settingsKey      Persisted state path for controls (nullable for stateless)
visualHandle     CSS primitive (e.g. "lw-panel") from Visual Handle Library
themeTokenPath   Canonical design token path (e.g. "app.panel.border")
themeTargetId    Inspectable UI surface ID (e.g. "mission-control.panel")
data-lw-theme-target  DOM attribute binding runtime nodes to themeTargetId
themeOverride    User-authored customization for a themeTargetId + token/property pair
themePreset      Saved overrides + metadata (built-in or user-defined)
temporaryPreview Unsaved override layer — auto-reverts if canceled
```

---

## Override Layer Resolution Order

```
1. Temporary preview    volatile edits while mapping mode active
2. Per-target override  saved adjustments scoped to a themeTargetId
3. User theme preset    the selected preset (may include overrides)
4. Base theme preset    shipped preset definition (Solar Plasma, etc.)
5. Fallback token       baked-in default if nothing else matches
```

Guardrails:
- Every override references a registered target + property
- Overrides must be reversible (preview cancel, preset reset)
- Arbitrary CSS injection forbidden
- Base presets stay intact even if user overrides fail to load

---

## Required Phase Sequence

```
v18a  Theme Mapping System Backlog (this — architecture docs only)
v19   Theme Token Path Map                 → canonical vocabulary (DONE)
v20   Theme Target Registry                → ThemeTargetContract entries (DONE)
v21   Debug UI Inspector Overlay           → runtime hover/selection (partial)
v22   Theme Mapping Panel v0               → generates controls from registry
v23   Theme Override Storage + Save Preset → persistence + preset management
```

Each phase unlocks the next dependency. Token map precedes targets. Targets precede overlay. Overlay precedes control generation. Controls precede storage.

---

## Risks and Guardrails

```
Risk: Token ambiguity causing inconsistent overrides
Guardrail: Finish Token Path Map before emitting editable properties

Risk: Inspector overlay misidentifying DOM nodes
Guardrail: Require data-lw-theme-target registration via Theme Target Registry

Risk: Override sprawl leading to unbounded CSS
Guardrail: Whitelist editable properties per target

Risk: Coupling to glitter or graph visual policy prematurely
Guardrail: Keep mapping mode orthogonal until those systems stabilize
```

---

## Non-Goals

- No runtime color pickers or new UI (in this pass)
- No editing of existing presets or Mission Control layout
- No changes to graph renderer, glitter, or preset runtime
