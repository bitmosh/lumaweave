---
id: system.grammar.lens.current.state
title: Ghost Overlay — Current Implementation State
type: manual
status: partial
version: v75
domain: grammar-lens
cluster: teal
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
depends_on:
  - contract.graph.runtime.boundary
  - contract.grammar.lens
  - contract.cursor.inspector
governs:
  - src/[overlay implementation — confirm path with user]
tags:
  - grammar-lens
  - overlay
  - ghost
  - current-state
  - partial
  - in-development
references:
  - contract.cross.layer.override.cache
---

# Ghost Overlay — Current Implementation State

## Status

**Partially implemented. In active development.**

This document captures what is currently working, what is scaffolded
but incomplete, and what is explicitly not yet implemented. It is the
source of truth for the overlay's actual runtime state, not its
intended future state.

Update this document whenever the overlay implementation changes.

---

## What Is the Ghost Overlay

The Ghost Overlay is a UI interaction mode where the user can hold
a key and click any visible UI element to open a cursor-adjacent
popout showing that element's configuration data — and in some
cases, edit it and see changes apply live.

This is the early runtime incarnation of the Grammar Lens concept
from the Visual Grammar Engine architecture.

---

## Current Working Behavior

*To be filled in by the user or implementation agent with the
actual current state. Below is the framework — edit to match reality.*

### Element Identification
- [ ] `data-lw-*` DOM attributes used to identify clickable elements
- [ ] Elements without attributes are skipped / not interactive
- [ ] Attribute format: `data-lw-handle="[handle.path]"` (confirm actual format)

### Activation
- [ ] Hold key: [confirm which key — e.g. Alt, Ctrl+Shift, custom]
- [ ] Click element → popout opens near cursor
- [ ] Click outside → popout closes
- [ ] Escape → popout closes

### Popout Content
- [ ] Shows per-element configuration slice (YAML / JSON — confirm)
- [ ] Shows element handle path or ID
- [ ] Editable text area for the config slice
- [ ] Shows which file / config the slice came from

### Live Application
- [ ] Changes typed in the popout apply to the active rendering layer live
- [ ] Changes revert on Escape / cancel
- [ ] Changes persist on confirm (confirm mechanism)

### What Currently Does NOT Work
*Fill in honestly — these become the roadmap for the contract docs*
- [ ] Global type updates ("apply to all type:border")
- [ ] Cross-layer pending cache (inactive layer changes)
- [ ] Sigma/graph internal elements (correctly blocked)
- [ ] [other known gaps]

---

## Forbidden Boundaries — Currently Enforced

The overlay must respect these boundaries at all times:

- **Cannot expose or edit** contract truth, evidence status,
  QA state, or acceptance records
- **Cannot reach** Sigma renderer internals or canvas properties
- **Cannot write** CSS variables directly
- **Cannot execute** commands or run scripts
- **Cannot access** audio input, playback, or Web Audio API
- **Changes apply** only to the currently active rendering layer
- **Inactive layers** receive pending cache entries, not live changes

If any of these boundaries are currently being violated in the
implementation, flag them here and do not accept the pass until
they are addressed.

---

## Known Implementation Gaps

### Cross-Layer Override Cache (not yet implemented)
When the user is in 2D Sigma mode and edits an element via the
overlay, the change applies to the 2D layer immediately. When
the user switches to 3D mode, the equivalent 3D element should
update to match. This requires:

1. Override stored as canonical token path change (not raw CSS)
2. Pending cache entry for inactive layers
3. On layer switch: cache flush → token validation → handle
   resolver for target layer → Motion Safety gate → apply

Contract needed: `CROSS_LAYER_OVERRIDE_CACHE_CONTRACT.md`
Status: **not yet contracted, not yet implemented**

### Global Element Type Updates (not yet implemented)
"Apply this border change to all elements of type:border globally"
requires a scope model:
- `scope: instance` — apply to this element only (current behavior)
- `scope: type` — apply to all elements of the same handle type
- `scope: global` — apply to all elements matching a pattern

Contract needed: `GLOBAL_ELEMENT_UPDATE_CONTRACT.md`
Status: **not yet contracted, not yet implemented**

### Grammar Handle Resolution (partial)
The overlay currently reads from DOM attributes to find the element.
Full Grammar Handle resolution would:
1. Read `data-lw-handle` from clicked element
2. Look up handle in Grammar Handle Registry
3. Retrieve the YAML grammar slice for that handle
4. Present editable slots only (not raw config)

Status: **partially implemented — confirm actual behavior with user**

---

## Data Format

*Confirm with user whether the overlay uses YAML or JSON, and
what the actual schema of the config slice looks like.*

Expected format (to confirm):
```yaml
element: graph.node.default
handle: graph.node.fill
source: src/themes/themeTokenPaths.ts

tokens:
  fill: graph.node.fill        # canonical token path
  hover: graph.node.hoverFill
  selected: graph.node.selectedFill

current_values:
  fill: "#4fa3e0"
  hover: "#64d9a4"
  selected: "#a67de8"
```

---

## Rendering Layer Behavior

The overlay spans visual rendering layers but respects their
boundaries:

**2D Sigma Layer (current active):**
- Overlay is fully active
- Element clicks resolve to Sigma graph elements OR DOM UI elements
- Sigma canvas elements: read-only identification only
  (cannot edit Sigma internals directly)
- DOM UI elements: editable via canonical token path

**3D Layer (future):**
- Overlay will activate when 3D layer is active
- Same handle resolution, different visual presentation
- Pending cache receives 2D layer overrides until 3D is active

**Flat/Minimal Layer (future):**
- No Sigma dependency
- All elements are DOM — simplest overlay behavior

---

## Relationship to Grammar Lens Roadmap

The current ghost overlay is approximately at:

```
vGrammar-5: Read-only Grammar Lens      ← partially passed
vGrammar-6: Preview-only Grammar Lens   ← partially reached (live apply working)
```

Still needed before the overlay can be considered fully contracted:
- Grammar Lens Contract (v75 — now written)
- Cursor Inspector Contract (v75 — now written)
- Global Element Update Contract (scope model — not yet written)
- Cross-Layer Override Cache Contract (v73c — accepted)

These contracts should be written before further overlay
implementation work proceeds.

---

## Update Protocol

When the overlay implementation changes:
1. Update the checkboxes in "Current Working Behavior"
2. Update "Known Implementation Gaps" if any gaps are closed
3. Update "Data Format" if the schema changes
4. Add a note in BANDIT_CHANGELOG.md
5. If a new forbidden boundary is identified, add it to SOURCE_OF_TRUTH.md
