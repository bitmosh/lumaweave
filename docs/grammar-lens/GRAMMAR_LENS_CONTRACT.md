---
id: contract.grammar.lens
title: Grammar Lens Contract
type: contract
status: accepted
version: v75
domain: grammar-lens
cluster: blue
agent_readable: true
include_in_self_graph: true
last_updated: v75
depends_on:
  - architecture.rendering.layers
  - contract.cross.layer.override.cache
  - contract.graph.runtime.boundary
related:
  - contract.cursor.inspector
  - system.grammar.lens.current.state
  - policy.source.of.truth
tags: [grammar-lens, overlay, ghost, contract, rendering, cross-layer]
---

# Grammar Lens Contract

## Purpose

The Grammar Lens is a UI interaction mode that allows users to inspect and
edit visual element configuration via a cursor-adjacent popout overlay.
This contract defines what the overlay may and may not expose, how changes
propagate across rendering layers, and the forbidden boundaries that must
never be crossed.

This contract exists to prevent technical debt accumulation in the Ghost
Overlay, which is partially live without formal governance.

---

## Scope

This contract governs:

- The Ghost Overlay activation model (hold key + click element)
- Element identification via `data-lw-*` DOM attributes
- What configuration data the overlay may expose to the user
- What data the overlay must never expose
- How overlay changes apply to rendering layers
- Forbidden boundaries for overlay behavior
- Relationships to cross-layer cache and global update contracts

This contract does NOT govern:

- Sigma renderer internals (governed by GRAPH_RUNTIME_BOUNDARY_CONTRACT.md)
- Theme token system (governed by GRAPH_THEME_APPLICATION_CONTRACT.md)
- Motion safety gates (governed by MOTION_SAFETY_AND_EPILEPSY_GUARD_CONTRACT.md)
- Cross-layer override cache implementation (governed by CROSS_LAYER_OVERRIDE_CACHE_CONTRACT.md)
- Global element type updates (requires GLOBAL_ELEMENT_UPDATE_CONTRACT.md — not yet written)

---

## Activation Model

### User Interaction

The Grammar Lens activates via a hold-key + click interaction:

```
User holds designated key (e.g., Alt, Ctrl+Shift, or custom keybinding)
  → User clicks any visible UI element with data-lw-* attribute
  → Cursor-adjacent popout opens showing element's configuration slice
  → User can edit editable fields
  → Changes apply to active rendering layer live
  → User clicks outside or presses Escape → popout closes
```

### Element Identification

Only elements with `data-lw-*` DOM attributes are interactive via the overlay.

```html
<!-- Interactive element -->
<div data-lw-handle="graph.node.fill" data-lw-element="node-123">
  Node content
</div>

<!-- Non-interactive element (no data-lw-* attributes) -->
<div>
  Plain content
</div>
```

Attribute format:
- `data-lw-handle="[canonical.token.path]"` — the grammar handle for this element
- `data-lw-element="[element-id]"` — optional element identifier for instance scope

Elements without `data-lw-*` attributes are skipped by the overlay. The overlay
must not attempt to infer handles from class names, IDs, or other heuristics.

---

## What the Overlay CAN Expose

The overlay may expose the following data for a clicked element:

### Per-Element Configuration Slice

The overlay displays a YAML or JSON slice representing the clicked element's
grammar handle configuration:

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

### Editable Fields

The overlay may allow editing of:
- Token values (e.g., `fill: "#4fa3e0"`)
- Canonical token paths (if the user wants to rewire a handle)
- Scope selector (instance vs type — if GLOBAL_ELEMENT_UPDATE_CONTRACT is implemented)

### Read-Only Metadata

The overlay may display read-only metadata:
- Element handle path
- Source file where the token is defined
- Current rendering layer (2D Sigma / 3D Hyper / Flat)
- Scope of pending change (instance / type / global)

---

## What the Overlay CANNOT Expose

The overlay must NEVER expose or allow editing of:

### Contract Truth

- Contract document contents (`.md` files in `docs/`)
- Contract acceptance status
- Contract version or metadata
- Contract dependency graph

### Evidence Status

- QA evidence panel contents
- Evidence acceptance status
- Evidence validation results
- Test coverage data

### QA State

- Current QA key
- Advisory questions/proposals/backlog
- QA checklist completion status
- Bandit proposal decisions

### Sigma Internals

- Sigma renderer canvas properties
- Sigma node/edge internal state
- Sigma physics engine parameters
- Sigma camera position or zoom
- Sigma force layout configuration

### Acceptance Records

- Pass acceptance history
- Bandit proposal decision history
- Advisory backlog ordering
- User decision metadata

### System Secrets

- API keys or tokens
- Environment variables
- Configuration secrets
- Authentication credentials

---

## Rendering Layer Rule

### Active Layer Only

Overlay changes apply **only to the currently active rendering layer**:

```
Active layer: 2D Sigma
  → Overlay edit applies to 2D layer immediately
  → 3D layer and Flat layer receive pending cache entries

Active layer: 3D Hyper
  → Overlay edit applies to 3D layer immediately
  → 2D layer and Flat layer receive pending cache entries

Active layer: Flat
  → Overlay edit applies to Flat layer immediately
  → 2D layer and 3D layer receive pending cache entries
```

### Inactive Layer Behavior

Inactive layers do **not** receive live changes. Instead, they receive
**pending cache entries** via the Cross-Layer Override Cache:

```
User edits element in 2D layer (active)
  → Change applied to 2D layer immediately
  → Cache entry created for 3D layer: { handlePath, tokenPath, value, status: "pending" }
  → Cache entry created for Flat layer: { handlePath, tokenPath, value, status: "pending" }

User switches to 3D layer
  → Pending cache entries for 3D layer are flushed
  → Token path validation
  → Handle resolver for 3D layer
  → Motion Safety gate
  → Apply (or soften/block)
```

See CROSS_LAYER_OVERRIDE_CACHE_CONTRACT.md for the complete cache flush sequence.

---

## Forbidden Boundaries

The overlay must respect these boundaries at all times:

### Data Access Forbidden

- Cannot read contract document files from `docs/`
- Cannot read QA evidence panel state
- Cannot read Bandit proposal state
- Cannot read Sigma canvas internals
- Cannot read acceptance records
- Cannot read system secrets or credentials

### Data Mutation Forbidden

- Cannot write to contract document files
- Cannot modify QA evidence status
- Cannot change Bandit proposal decisions
- Cannot mutate Sigma renderer state
- Cannot alter acceptance records
- Cannot expose or modify secrets

### Direct API Calls Forbidden

- Cannot call Sigma API directly
- Cannot call theme token registry without going through canonical token path
- Cannot bypass Motion Safety gate
- Cannot write CSS variables directly
- Cannot execute commands or run scripts

### Cross-Layer Violations Forbidden

- Cannot apply changes to inactive layers directly (must use cache)
- Cannot bypass pending cache flush on layer switch
- Cannot skip token path validation
- Cannot skip Motion Safety gate on cache flush

### Scope Violations Forbidden

- Cannot implement global scope updates without GLOBAL_ELEMENT_UPDATE_CONTRACT
- Cannot implement type scope updates without GLOBAL_ELEMENT_UPDATE_CONTRACT
- Only instance scope is allowed until that contract is written

---

## Relationship to Cross-Layer Override Cache Contract

The Grammar Lens depends on the Cross-Layer Override Cache for cross-layer
consistency:

```
Grammar Lens edit (active layer)
  → Change applied immediately to active layer
  → Cache entry created for each inactive layer
  → Cache stores canonical token path change, not raw CSS
  → On layer switch: cache flush → token validation → handle resolver
    → Motion Safety gate → apply
```

The Grammar Lens must:
- Use canonical token paths for all edits (not raw CSS values)
- Create cache entries for all inactive layers on every edit
- Never apply changes to inactive layers directly

See CROSS_LAYER_OVERRIDE_CACHE_CONTRACT.md for complete cache specification.

---

## Relationship to Global Element Update Contract

The Grammar Lens scope model is limited until GLOBAL_ELEMENT_UPDATE_CONTRACT.md
is written and accepted:

**Current (pre-contract):**
- Only `scope: instance` is allowed
- Changes apply to the clicked element only

**Future (after GLOBAL_ELEMENT_UPDATE_CONTRACT):**
- `scope: type` — apply to all elements of the same handle type
- `scope: global` — apply to all elements matching a pattern

The Grammar Lens must not implement type or global scope updates until
GLOBAL_ELEMENT_UPDATE_CONTRACT.md exists and is accepted.

---

## Data Format

The overlay uses YAML format for configuration slices:

```yaml
element: [element.type]
handle: [canonical.token.path]
source: [source.file.path]

tokens:
  [token.name]: [canonical.token.path]
  ...

current_values:
  [token.name]: [current.value]
  ...

editable: true/false
scope: instance | type | global  # type/global require GLOBAL_ELEMENT_UPDATE_CONTRACT
```

The overlay must validate YAML syntax before applying changes. Invalid YAML
must be rejected with a clear error message.

---

## Motion Safety Gate

Any overlay change that produces a visual effect must pass through the
Motion Safety gate:

```
User edits token value in overlay
  → Is this handle classified in motionSafetyRegistry?
  → Is the user's reduce-motion preference enabled?
  → What is the epilepsy risk classification?
  → Gate decision: allow / soften / block
  → Apply allowed/softened change
  → If blocked: surface warning to user
```

See MOTION_SAFETY_AND_EPILEPSY_GUARD_CONTRACT.md for complete gate specification.

The overlay must:
- Check motion safety classification before applying any visual change
- Soften or block effects when reduce-motion is enabled
- Surface passive notifications for blocked changes
- Never bypass the gate

---

## Acceptance Criteria

This contract is considered accepted when:

1. Both GRAMMAR_LENS_CONTRACT.md and CURSOR_INSPECTOR_CONTRACT.md exist
2. SOURCE_OF_TRUTH.md is updated to reference these contracts
3. GHOST_OVERLAY_CURRENT_STATE.md is updated to reference these contracts
4. No runtime implementation changes are made in this pass (docs-only)

Future implementation acceptance criteria (when the overlay is implemented):

1. Overlay activates via hold-key + click on `data-lw-*` elements only
2. Overlay displays per-element YAML/JSON configuration slice
3. Overlay allows editing of token values and canonical paths
4. Overlay never exposes contract truth, evidence status, QA state, or Sigma internals
5. Overlay changes apply only to active rendering layer
6. Inactive layers receive pending cache entries via cross-layer cache
7. Overlay respects all forbidden boundaries
8. Overlay uses canonical token paths for all edits
9. Overlay passes Motion Safety gate on all visual changes
10. Playwright tests prove: edit in 2D → switch to 3D → change applies (or is motion-gated)

---

## Implementation Preconditions

Before this contract can be implemented at runtime:

1. CROSS_LAYER_OVERRIDE_CACHE_CONTRACT.md must be accepted (already accepted at v73c)
2. RENDERING_LAYER_ARCHITECTURE.md must be accepted (already accepted at v73c)
3. MOTION_SAFETY_AND_EPILEPSY_GUARD_CONTRACT.md must be accepted (already accepted at v60)
4. GLOBAL_ELEMENT_UPDATE_CONTRACT.md must be written and accepted (for type/global scope)
5. CURSOR_INSPECTOR_CONTRACT.md must be written and accepted (this pass)

Earliest reasonable implementation target: v80+ (after Source Adapter OS foundation is stable)

---

## Violation Consequences

If this contract is violated:

1. The violation must be documented in SOURCE_OF_TRUTH.md under "Grammar Lens / Overlay"
2. The violating code must be disabled or removed
3. A new QA pass must be created to address the violation
4. The pass may not be accepted until the violation is resolved

---

## Update Protocol

When this contract is updated:

1. Update the `version` field in the frontmatter
2. Update the `last_updated` field in the frontmatter
3. Add a changelog entry at the end of this document
4. Update related contracts if dependencies change
5. Update SOURCE_OF_TRUTH.md if forbidden boundaries change
6. Run Playwright tests to prove no regressions

---

## Changelog

### v75 (current)
- Initial contract written
- Docs-only pass — no runtime implementation
- Establishes governance for Ghost Overlay before further technical debt accumulates
- Defines activation model, allowed/forbidden data exposure, rendering layer rules
- Establishes relationships to cross-layer cache and global update contracts
