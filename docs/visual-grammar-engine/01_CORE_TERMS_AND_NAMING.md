# 01 — Core Terms and Naming

## Visual Grammar Engine

The umbrella system for defining how source data, UI elements, graph entities, theme tokens, assets, physics layouts, signals, safety transforms, and evidence overlays combine into user-customizable visual dialects.

The Visual Grammar Engine is the terminal/config/file-level layer for authoring, validating, previewing, and managing full visual grammar presets.

## Visual Grammar

The complete ruleset that determines how data becomes visual experience.

Visual grammar includes:

- Source type.
- Data shape.
- Layout/physics profile.
- Theme and asset selections.
- Signal routes.
- Visual handles.
- Safety transforms.
- Display depth.
- Evidence overlays.

## Visual Dialect

A named visual/behavioral profile for a type of data, workspace, or experience.

A visual dialect is what makes a repo graph feel like a mission-control dashboard, an architecture atlas, a constellation mesh, a calm documentation reader, a living music-library screensaver, or a debug circuit.

## Grammar Handle

A stable addressable handle that connects a visual/UI/rendering element to a piece of visual grammar.

Example handles:

```txt
graph.node.changed
graph.edge.trace
panel.boundary.seal
status.badge.verified
music.cluster.currentTrack
evidence.card.contractStatus
```

A grammar handle exposes editable presentation slots. It does not expose contract truth, source truth, permissions, or uncontracted runtime behavior.

## Grammar Lens

The inspector feature that lets a user click a visual element and inspect/edit the grammar slice controlling that element.

Grammar Lens is the general feature. It includes lightweight cursor popouts and pinned/docked editor modes.

## Cursor Grammar Inspector

The toggleable default Grammar Lens mode.

When enabled, clicking an element in Inspector Mode opens a small cursor-adjacent popout showing the focused YAML grammar slice for that element.

Suggested UI hint:

```txt
Press P to pin this Grammar Lens.
```

## Signal Loom

The routing subsystem inside the Visual Grammar Engine.

Signal Loom maps:

```txt
Source/Event → Signal/Envelope → Mapping → Target Handle → Safety Transform
```

It is the data/event/synthetic-signal equivalent of a modular synthesizer patch bay.

## Asset Bank

The user-facing catalog and routing layer for approved customization assets.

The Asset Bank organizes themes, layouts, icons, badges, typography packs, panel frames, grammar presets, graph fixtures, visual dialects, and future source/visual/audio-related assets.

The Asset Bank does not replace canonical registries. It routes user choices into them.

## Visual Dialect Protocol

A schema-governed preset/configuration file that defines a visual dialect.

Possible extensions:

```txt
.lwgrammar.yaml
.lwdialect.yaml
```

## SignalScript

Optional term for the declarative syntax users author inside Visual Dialect Protocol files.

SignalScript should begin as YAML/JSON schema, not arbitrary JavaScript.

## Core Naming Stack

```txt
Visual Grammar Engine — whole system
Visual Dialect Protocols — preset/config grammar files
Signal Loom — routing subsystem
Grammar Lens — click-to-inspect/edit feature
Cursor Grammar Inspector — popout inspector mode
Asset Bank — user-facing customization catalog/router
```

## Preferred Product Copy

```txt
Every visual element can resolve to a grammar handle.
LumaWeave lets users inspect, edit, validate, preview, and save visual dialect overrides through safe, schema-governed workflows.
```

## Poetic Copy

```txt
Every visual element has grammar.
LumaWeave lets you inspect it, rewrite it, and safely remix the dialect of your data.
```

## Technical Copy

```txt
Every visual element can resolve to a grammar handle.
LumaWeave lets users inspect, edit, validate, preview, and save visual dialect overrides through safe, schema-governed workflows.
```
