# 06 — Theme Token Compatibility

## Purpose

This document prevents the Visual Grammar Engine, Grammar Lens, and Asset Bank from conflicting with the existing theme/surface/token system.

## Existing Token Principle

Canonical token paths remain the source of truth.

Asset Bank, Grammar Lens, and Visual Grammar files must not invent parallel token systems or bypass canonical token paths.

## Compatibility Hierarchy

```txt
Canonical Token Paths
        ↓
Theme Presets assign values
        ↓
Theme Handles expose editable slots
        ↓
Grammar Handles expose visual grammar slots
        ↓
Asset Bank provides compatible visual assets for those slots
        ↓
Preview / saved override only through contract
```

Simplified:

```txt
tokens first
handles second
assets third
user customization fourth
runtime application only by explicit contract
```

## Conflict Risks

### Asset Bank Becomes a Second Token Registry

Bad:

```txt
Asset Bank defines:
cardBackground
panelGlow
dangerRed
atlasGold
```

Good:

```txt
Asset Bank asset declares:
uses token slot: surfaceRaised
uses token slot: statusForbidden
uses token slot: glowAccent
```

### Grammar Lens Bypasses Token Paths

Bad:

```txt
User clicks card → Inspector writes arbitrary CSS variable or inline style.
```

Good:

```txt
User clicks card → Grammar Lens resolves handle → editable slots → canonical token paths → preview layer.
```

### Asset Implies Behavior

Bad:

```txt
This seal triggers animation.
This music theme enables audio input.
This graph theme changes Sigma rendering.
This layout button runs commands.
```

Good:

```txt
This seal changes approved presentation.
This music-reactive preset is passive metadata until promoted.
This graph style is preview/metadata unless runtime graph styling is contracted.
```

## Theme/Grammar Slot Categories

Potential editable slot categories:

```txt
Color:
surface, text, border, accent, warning, danger, safe, locked, verified

Shape:
radius, border width, divider style

Depth:
shadow, elevation, inset, glass strength

Expression:
glow strength, ornament density, texture strength

Typography:
heading font role, body font role, mono font role, size scale

Density:
padding, gap, row height, card compactness

Iconography:
icon style, badge style, seal style

Motion:
static only until explicit future reduced-motion-safe contract
```

## Forbidden Through Theme/Grammar

- Commands.
- Scripts.
- Event handlers.
- Remote URLs.
- Arbitrary CSS injection.
- Theme-defined command execution.
- Graph/Sigma behavior.
- Audio input/playback.
- Music reactivity runtime.
- Storage/persistence behavior without contract.

## Compatibility Rule

The Asset Bank may provide validated visual assets and presets only for slots exposed by the Theme Handle Registry or Grammar Handle Registry.

Asset assets must not create new canonical token paths, bypass token path maps, write arbitrary CSS variables, or alter contract truth.

If a new visual slot is needed, it must be added first through the canonical token/theme path process.

## Core Invariant

Customization changes presentation.

Customization does not change evidence truth.
