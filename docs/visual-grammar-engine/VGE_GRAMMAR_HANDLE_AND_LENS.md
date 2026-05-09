---
id: vge.grammar.handle.and.lens
title: Visual Grammar Engine — Grammar Handle Model & Grammar Lens
type: concept
status: concept
version: v86a
domain: visual-grammar-engine
cluster: teal
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
references:
  - vge.overview.and.terms
  - vge.signal.loom
  - vge.dialect.and.safety
  - grammar.lens.contract
  - cursor.inspector.contract
  - ghost.overlay.current.state
  - handleset.active
  - handleset.planned
  - theme.token.path.map
  - theme.token.compatibility
  - theme.override.storage.contract
tags:
  - vge
  - grammar-handle
  - grammar-lens
  - cursor-inspector
  - future
  - docs-only
---

# Visual Grammar Engine — Grammar Handle Model & Grammar Lens

> **Status:** Future architecture / docs-only. No runtime implementation authorized.

## v86a Status Note

This concept extends two shipping precursors:

- **Grammar Lens** — A read-only precursor exists today as the [Grammar Lens Contract](grammar.lens.contract) and [Cursor Inspector Contract](cursor.inspector.contract). They cover click-to-inspect with metadata display. VGE Grammar Lens extends these with editing, validation, preview, and override flows.
- **Visual Handles** — The current handleset cluster is a precursor to the Grammar Handle Registry. See [Active Handles](handleset.active) for what's wired today and [Planned Handles](handleset.planned) for what's queued. VGE handles add grammar paths, signal compatibility, and safety capabilities to the existing handle model.

VGE Grammar Lens implementation is gated on prerequisite work documented in [VGE Roadmap](vge.roadmap).

---

## Grammar Handle Model

### Core Invariant

Every customizable visual element should resolve to a stable grammar handle.

Handles expose editable presentation grammar. Handles do not expose source truth, contract truth, evidence status, permissions, command behavior, or uncontracted runtime capabilities.

This is the same load-bearing principle as the [Theme Token Compatibility](theme.token.compatibility) doc, applied across all customizable visual elements rather than only theme tokens.

### Example DOM Metadata

```tsx
<div
  data-lw-handle="graph.node.changed"
  data-lw-grammar-path="routes.diffPulse.targets.changedNodes"
  data-lw-scope="graph"
  data-lw-editable="true"
/>
```

### Required Handle Metadata

```ts
{
  handle: "graph.node.changed",
  label: "Changed Graph Node",
  scope: "graph",
  componentType: "GraphNode",
  grammarPath: "routes.diffPulse.targets.changedNodes",
  editableSlots: ["glow", "halo", "accentColor", "saturation", "radius", "border", "labelStyle"],
  compatibleSignals: ["signal.envelope.adsr", "signal.rhythm.pulse", "signal.amplitude.synthetic"],
  safetyRequired: true,
  forbiddenCapabilities: ["commandExecution", "audioInput", "audioPlayback", "uncontractedSigmaMutation"]
}
```

### Handle Resolution Flow

```
Clicked element
→ nearest data-lw-handle
→ Theme/Grammar Handle Registry
→ active grammar preset
→ focused grammar slice
→ schema for editable fields
→ safety/capability validation
→ preview override
```

### Editable vs Locked Fields

**Editable:**

- Surface appearance, accent roles, badge/icon style, glow strength, density
- Border/radius/frame style, typography role
- Signal mapping parameters, reduced-motion fallback selection

**Locked (never editable through grammar):**

- Evidence status, QA status, contract status, permission state
- Source provenance
- Whether graph/Sigma mutation, audio input/playback, or command execution is allowed

### Handle Categories

```
ui.panel.*        ui.card.*         ui.badge.*
evidence.*        qa.*
graph.node.*      graph.edge.*      graph.cluster.*
theme.*           signal.*          asset.*
sourceAdapter.*
```

### Example Handles

```
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

### Handle Stability

Handles are like test IDs and token paths: stable, intentional, migrated carefully.

If a handle must be renamed: provide a migration note, preserve the old handle as a deprecated alias, update docs and tests deliberately, do not silently break saved user grammar presets.

**Future registry file** (not yet authorized): `src/visual-grammar/grammarHandleRegistry.ts`

---

## Grammar Lens

### Purpose

Grammar Lens is the direct manipulation UI for the Visual Grammar Engine. Users click an element, inspect the grammar controlling it, edit a focused YAML slice, validate, preview safely, pin the inspector, and save the result.

### Naming

```
Grammar Lens              General click-to-inspect/edit feature
Cursor Grammar Inspector  Default-on/toggleable cursor popout mode
Pinned Grammar Lens       Docked/pinned larger editor mode
```

### Interaction Flow

```
Alt + Shift + I
→ Inspector Mode activates
→ user clicks a visual element
→ element highlights
→ system resolves grammar handle
→ Cursor Grammar Inspector opens near cursor
→ popout shows focused YAML grammar slice
→ user edits → validation runs
→ user previews / applies / saves / resets
```

### Cursor Popout Contents

- Element name, grammar handle, scope, source grammar preset
- Focused YAML slice, validation status, safety status
- Preview / Apply / Reset controls
- Hint: `Press P to pin this Grammar Lens.`

### Focused YAML Slice (example)

```yaml
element: graph.node.changed
handle: graph.node.glow
source: dialects/diff-work-pulse.lwgrammar.yaml

signal:
  use: diffPulse

map:
  intensity: "changedFiles / 12"
  saturation: "+20%"
  radius: "+8%"

safety:
  reducedMotion: static-highlight
  maxPulseHz: 1
```

### Pinning

**Unpinned:** follows selected element, closes on Escape or outside click. Good for lightweight edits.

**Pinned:** becomes a dockable panel. Can compare multiple handles, show related signal/source/safety sections, open the full grammar preset, show diff/revert/history.

### Apply Model

```
Draft   → YAML changed but not validated
Preview → validated and temporarily applied in session
Saved   → written into user preset / workspace override
```

User flow: **Edit → Validate → Preview → Save**

System flow:

```
YAML text
→ parse
→ schema validate
→ capability validate
→ safety validate
→ dependency/target resolution
→ preview diff
→ apply to preview layer
→ user confirms save
→ persist as override/preset
```

### Override Layer

```
Base theme/preset
→ active visual grammar preset
→ workspace overrides
→ temporary Grammar Lens preview override
```

This override layer extends the existing [Theme Override Storage Contract](theme.override.storage.contract) with grammar-level overrides on top of token-level overrides.

Invalid edits do not apply. Unsafe edits transform or reject with clear explanation.

### Inline Validation Feedback Examples

```
✓ Valid YAML
✓ Handle exists: graph.node.glow
✓ Target exists: graph.nodes.changed
✓ Reduced Motion fallback present
⚠ intensity should be between 0 and 1
✕ maxPulseHz exceeds safety limit
✕ handle graph.node.strobe is forbidden
```

### Forbidden in Grammar Lens

- Raw JavaScript, shell commands, remote imports
- Arbitrary CSS injection or permission changes
- Command execution, audio input/playback
- Uncontracted graph/Sigma runtime mutation
- Editing evidence truth or QA state as if it were visual style

---

*Frontmatter normalized v86a. Body content preserved as design-locked architecture. Connections added to current shipping precursors (Grammar Lens Contract, Cursor Inspector Contract, handleset cluster).*
