# 02 — Grammar Handle Model

## Purpose

The Grammar Handle Model defines how a visual element becomes selectable, inspectable, editable, and safely routed through the Visual Grammar Engine.

## Core Invariant

Every customizable visual element should resolve to a stable grammar handle.

Handles expose editable presentation grammar.

Handles do not expose source truth, contract truth, evidence status, permissions, command behavior, or uncontracted runtime capabilities.

## Example DOM Metadata

```tsx
<div
  data-lw-handle="graph.node.changed"
  data-lw-grammar-path="routes.diffPulse.targets.changedNodes"
  data-lw-scope="graph"
  data-lw-editable="true"
/>
```

## Required Handle Metadata

A grammar handle should eventually resolve to a registry entry like:

```ts
{
  handle: "graph.node.changed",
  label: "Changed Graph Node",
  scope: "graph",
  componentType: "GraphNode",
  grammarPath: "routes.diffPulse.targets.changedNodes",
  editableSlots: [
    "glow",
    "halo",
    "accentColor",
    "saturation",
    "radius",
    "border",
    "labelStyle"
  ],
  compatibleSignals: [
    "signal.envelope.adsr",
    "signal.rhythm.pulse",
    "signal.amplitude.synthetic"
  ],
  safetyRequired: true,
  forbiddenCapabilities: [
    "commandExecution",
    "audioInput",
    "audioPlayback",
    "uncontractedSigmaMutation"
  ]
}
```

## Handle Resolution Flow

```txt
Clicked element
→ nearest data-lw-handle
→ Theme/Grammar Handle Registry
→ active grammar preset
→ focused grammar slice
→ schema for editable fields
→ safety/capability validation
→ preview override
```

## Editable vs Locked Fields

### Editable

- Surface appearance.
- Accent roles.
- Badge/icon style.
- Glow strength.
- Density.
- Border/radius/frame style.
- Typography role.
- Signal mapping parameters.
- Reduced-motion fallback selection.

### Locked

- Evidence status.
- QA status.
- Contract status.
- Permission state.
- Source provenance.
- Whether graph/Sigma mutation is allowed.
- Whether audio input/playback is allowed.
- Whether command execution is allowed.

## Handle Categories

```txt
ui.panel.*
ui.card.*
ui.badge.*
evidence.*
qa.*
graph.node.*
graph.edge.*
graph.cluster.*
theme.*
signal.*
asset.*
sourceAdapter.*
```

## Example Handles

```txt
controlPlane.statusStrip
graph.inventory.summaryCard
evidence.boundarySeal
evidence.contractCard
qa.currentKeyBadge
graph.node.changed
graph.edge.new
graph.cluster.activeWork
music.cluster.currentTrack
signal.readout.debug
```

## Handle Stability

Handles should be treated like test IDs and token paths: stable, intentional, and migrated carefully.

If a handle must be renamed:

- Provide a migration note.
- Preserve old handle where possible as deprecated alias.
- Update docs and tests deliberately.
- Do not silently break saved user grammar presets.

## Future Registry File

Possible future file:

```txt
src/visual-grammar/grammarHandleRegistry.ts
```

This should not be added until explicitly authorized by a future implementation pass.
