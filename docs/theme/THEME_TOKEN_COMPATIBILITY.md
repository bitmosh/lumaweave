---
id: theme.token.compatibility
title: Theme Token Compatibility
type: contract
status: current
version: v86a
domain: theme
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
governs:
  - src/themes/themeTokenGovernance.ts
references:
  - theme.system.overview
  - theme.token.path.map
  - theme.preset.model
  - theme.override.storage.contract
  - theme.mapping.panel.entry.contract
  - asset.bank
  - visual.grammar.engine
tags:
  - theme
  - tokens
  - compatibility
  - governance
  - invariants
  - v86a
---

# Theme Token Compatibility

System invariants that prevent the Visual Grammar Engine, Asset Bank, Grammar Lens, and any future customization layer from creating parallel token systems or bypassing canonical token paths.

This doc is governance — it states what is allowed, what is forbidden, and what hierarchy must be respected. Enforcement happens in `themeTokenGovernance.ts` at boot, plus the override storage contract, plus the Theme Mapping Panel entry contract.

---

## Core principle

Canonical token paths are the source of truth. Every visual customization mechanism — preset selection, override storage, asset bank entries, grammar lens edits, future workshop submissions — must resolve through canonical paths. Nothing creates parallel token systems. Nothing bypasses canonical paths.

The three-tier model (Primitives → Semantics → Components) is the structural expression of this principle. Customization layers on top of the tier chain; it does not replace it.

---

## Compatibility hierarchy

```
Canonical Token Paths
        ↓
Theme Presets assign values via tier chain
        ↓
Theme Targets expose surfaces that consume tokens
        ↓
Theme Handles expose editable slots
        ↓
Grammar Handles expose visual grammar slots (future)
        ↓
Asset Bank provides compatible visual assets for those slots
        ↓
User customization layers (override storage, custom presets)
        ↓
Runtime application only by explicit contract
```

Simplified mnemonic:

```
tokens first
handles second
assets third
user customization fourth
runtime application only by explicit contract
```

If a new visual capability is needed, it must be added at the **token path level first**. Then handles expose it for editing. Then assets can populate slots. Then users can override. Skipping any layer creates drift and breaks downstream contracts.

---

## Tier-walk enforcement

The three-tier model is enforced at boot via `assertThemeTokenGovernanceClean()` in `src/themes/themeTokenGovernance.ts`. The validator hard-throws on any of the following:

**Tier-walk violations:**
- Tier 3 component referencing anything that's not a Tier 2 semantic
- Tier 2 semantic referencing anything that's not a Tier 1 primitive
- Inline values (raw colors, hex codes, numbers) in Tier 2 or Tier 3 declarations

**Path / target violations:**
- Active theme target bound to a non-canonical path
- Active theme target bound to a planned-only path
- Planned theme target declaring `tokenBindings` prematurely
- Built-in preset missing a canonical path that all six themes are expected to populate

These checks run before the app mounts. If any violation is present, the application refuses to start. This is intentional — a corrupt token graph at runtime would silently render wrong values; a hard throw at boot surfaces the problem immediately.

For tier source files, see `tokenPrimitives.ts`, `tokenSemantics.ts`, `tokenComponents.ts`. For path declarations, see [Theme Token Path Map](theme.token.path.map).

---

## Conflict risks and how to avoid them

### Risk: Asset Bank becomes a second token registry

**Bad:**
```
Asset Bank defines:
  cardBackground
  panelGlow
  dangerRed
  atlasGold
```
This creates a parallel naming convention for visual values and bypasses canonical paths.

**Good:**
```
Asset Bank entry declares:
  uses token slot: surface.background.deep
  uses token slot: status.danger.color
  uses token slot: app.glow
```
Assets reference existing canonical paths. They provide alternative visuals (textures, shaders, illustrations) for the same conceptual slot — they don't redefine the slot.

### Risk: Grammar Lens bypasses token paths

**Bad:**
```
User clicks card → Inspector writes arbitrary CSS variable
                    or inline style.
```
This breaks the override storage contract and corrupts the customization audit trail.

**Good:**
```
User clicks card → Grammar Lens resolves handle
                 → editable slots
                 → canonical token paths
                 → preview layer
                 → optional save via override storage contract
```
Every edit flows through canonical paths and the preview/override layer. The runtime never sees ad-hoc CSS injection.

### Risk: Asset implies behavior

**Bad:**
```
This seal triggers animation.
This music theme enables audio input.
This graph theme changes Sigma rendering.
This layout button runs commands.
```
Visual assets must not declare behavior. Behavior comes from contracts (motion safety, audio source, graph runtime, command registry), not from theme entries.

**Good:**
```
This seal changes approved presentation.
This music-reactive preset is passive metadata
  until promoted by motion safety contract.
This graph style is preview/metadata unless
  runtime graph styling is contracted.
```

---

## Editable slot categories

When new editable slots are added, they fall into these categories. Slots within a category share invariants (units, value ranges, etc.):

```
Color:
  surface, text, border, accent, warning, danger,
  safe, locked, verified

Shape:
  radius, border width, divider style

Depth:
  shadow, elevation, inset, glass strength

Expression:
  glow strength, ornament density, texture strength

Typography:
  heading font role, body font role, mono font role,
  size scale

Density:
  padding, gap, row height, card compactness

Iconography:
  icon style, badge style, seal style

Motion:
  static only until explicit future
  reduced-motion-safe contract
```

New slots must be added through the canonical token/theme path process (PLANNED → CANONICAL with all six themes populated). Asset bank, grammar lens, and customization layers cannot create new slots — they can only fill existing ones.

---

## Forbidden through theme/grammar layer

The following are explicitly out of scope for theme entries, asset bank entries, grammar lens edits, and any user customization:

- Commands
- Scripts
- Event handlers
- Remote URLs (theme cannot fetch external resources)
- Arbitrary CSS injection
- Theme-defined command execution
- Graph/Sigma behavior modification
- Audio input or playback
- Music reactivity runtime modification
- Storage/persistence behavior outside the override storage contract

The reasoning: theme is presentation-only. Behavior comes from explicit contracts that have their own governance, threat models, and runtime boundaries. Folding behavior into theme entries would let "just changing the visuals" silently change application logic — a serious safety problem.

---

## Compatibility rule

The Asset Bank may provide validated visual assets and presets only for slots exposed by:
- Canonical token paths (current)
- Theme Handle Registry (when handles are added)
- Grammar Handle Registry (future, when VGE handles are added)

Asset entries must not:
- Create new canonical token paths
- Bypass token path resolution
- Write arbitrary CSS variables
- Alter contract truth (e.g. flip a target's binding)

If a new visual slot is needed, it must be added first through the canonical token/theme path process. The order is non-negotiable: paths first, then assets that fill them.

---

## Core invariant

> **Customization changes presentation. Customization does not change evidence truth.**

This is the load-bearing principle. A theme can change how things look. A theme cannot change what they mean, what they do, or what they prove. The Mission Control panel still reports the same QA results regardless of which theme is active. The graph still represents the same data. The contracts still govern the same behavior. Only the rendered pixels differ.

If a customization mechanism would change evidence truth (e.g. a theme that reorders QA results, or an asset that hides warning badges), it violates this invariant and must be rejected.

---

## Source files

| Concern | File |
|---------|------|
| Tier-walk validator | `src/themes/themeTokenGovernance.ts` |
| Tier 1 primitives | `src/themes/tokenPrimitives.ts` |
| Tier 2 semantics | `src/themes/tokenSemantics.ts` |
| Tier 3 components | `src/themes/tokenComponents.ts` |
| Path declarations | `src/themes/themeTokenPaths.ts` |
| Override storage | `src/themes/themeOverrideStorage.ts` |

---

## What this doc does not cover

- Specific tier source contents — see tier files directly
- Canonical path catalog — see [Theme Token Path Map](theme.token.path.map)
- Override storage mechanics — see [Theme Override Storage Contract](theme.override.storage.contract)
- Theme Mapping Panel entry rules — see [Theme Mapping Panel Entry Contract](theme.mapping.panel.entry.contract)
- Visual Grammar Engine architecture — see [Visual Grammar Engine](visual.grammar.engine) (cluster pending operator decision on alive vs shelved)
- Asset Bank schema — see Asset Bank docs (forward-compat empty in v86a)

---

*Replaces v50-era theme token compatibility doc. Updated for three-tier model and current registry pattern.*
