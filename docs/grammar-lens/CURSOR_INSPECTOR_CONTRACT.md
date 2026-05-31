---
id: contract.cursor.inspector
title: Cursor Inspector Contract
type: contract
status: accepted
version: v75
domain: grammar-lens
cluster: teal
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
depends_on:
  - contract.grammar.lens
  - architecture.rendering.layers
  - contract.cross.layer.override.cache
tags:
  - grammar-lens
  - cursor-inspector
  - overlay
  - ghost
  - contract
  - interaction
references:
  - system.grammar.lens.current.state
  - policy.source.of.truth
---

# Cursor Inspector Contract

## Purpose

The Cursor Inspector is the hold-key + click interaction model that activates
the Grammar Lens overlay. This contract defines the interaction behavior,
popout UI, editable vs read-only field semantics, scope model, and forbidden
actions for the cursor-adjacent popout.

This contract exists to establish governance for the overlay's user-facing
interaction before further implementation work proceeds.

---

## Scope

This contract governs:

- The hold-key + click activation model
- Popout behavior (cursor-adjacent, dismissible)
- Per-element YAML/JSON slice display
- Editable fields vs read-only fields
- "Apply to all elements of this type" scope model
- Motion Safety gate on live preview effects
- Forbidden editing actions

This contract does NOT govern:

- What data the overlay may expose (governed by GRAMMAR_LENS_CONTRACT.md)
- How changes propagate across layers (governed by CROSS_LAYER_OVERRIDE_CACHE_CONTRACT.md)
- Motion safety gate implementation (governed by MOTION_SAFETY_AND_EPILEPSY_GUARD_CONTRACT.md)
- Global element update scope (requires GLOBAL_ELEMENT_UPDATE_CONTRACT.md — not yet written)

---

## Activation Model

### Hold-Key + Click

The Cursor Inspector activates via:

```
User holds designated key (e.g., Alt, Ctrl+Shift, or custom keybinding)
  → User clicks any visible UI element with data-lw-* attribute
  → Cursor-adjacent popout opens
  → Popout shows element's configuration slice
```

### Keybinding

The activation key is configurable but must be:
- A single modifier key or modifier combination
- Not a key that conflicts with browser defaults (e.g., Ctrl+C for copy)
- Documented in user-facing settings

Default keybinding: **Alt** (subject to change based on user testing)

### Dismissal

The popout dismisses via:

```
User clicks outside the popout → popout closes
User presses Escape → popout closes
User releases the hold key → popout closes (optional, depends on UX testing)
```

The popout must not persist indefinitely. It must be dismissible by at least
two of the three methods above.

---

## Popout Behavior

### Positioning

The popout opens cursor-adjacent:

```
Popout is positioned near the click coordinates
  → If popout would overflow screen edge, shift to fit
  → If popout would overlap clicked element, shift to avoid
  → Maximum popout width: 400px (configurable)
  → Maximum popout height: 600px (scrollable if exceeded)
```

The popout must not:
- Cover the clicked element entirely
- Overflow screen boundaries without adjustment
- Overlap critical UI elements (e.g., navigation, controls)

### Visual Design

The popout must:
- Use a distinct visual style from the main UI (e.g., floating panel)
- Have a clear close button or close affordance
- Show a header with element handle path
- Display editable fields with clear visual distinction from read-only fields
- Use a monospace font for YAML/JSON content

### Z-Index

The popout must have a high z-index to appear above other UI elements:
- Minimum z-index: 1000
- Must appear above all control plane panels
- Must appear above Sigma canvas (if applicable)

---

## Per-Element Slice Display

### Data Format

The popout displays a YAML slice for the clicked element:

```yaml
element: graph.node.default
handle: graph.node.fill
source: src/themes/themeTokenPaths.ts

tokens:
  fill: graph.node.fill
  hover: graph.node.hoverFill
  selected: graph.node.selectedFill

current_values:
  fill: "#4fa3e0"
  hover: "#64d9a4"
  selected: "#a67de8"

editable: true
scope: instance
```

### Read-Only Metadata

The following fields are always read-only:
- `element` — element type
- `handle` — canonical token path
- `source` — source file path
- `editable` — whether this element is editable
- `scope` — current scope selector

These fields must be visually distinct from editable fields (e.g., gray text,
no border, no cursor).

### Editable Fields

The following fields are editable (if `editable: true`):
- Token values in `current_values` (e.g., `fill: "#4fa3e0"`)
- Canonical token paths in `tokens` (e.g., `fill: graph.node.fill`)
- Scope selector (if GLOBAL_ELEMENT_UPDATE_CONTRACT is implemented)

Editable fields must:
- Have a clear visual affordance (e.g., text input, border on focus)
- Support YAML syntax validation
- Reject invalid YAML with a clear error message
- Show a "Apply" button or auto-apply on blur (UX decision)

---

## Editable vs Read-Only Fields

### Editable Fields

Fields are editable when:

```
1. Element has data-lw-* attributes (identified by overlay)
2. Element is not in a forbidden boundary (see GRAMMAR_LENS_CONTRACT.md)
3. Element's canonical token path exists in token registry
4. User has permission to edit (no permission system yet — always true)
```

Editable fields include:
- Token values (e.g., `fill: "#4fa3e0"`)
- Canonical token paths (e.g., `fill: graph.node.fill`)
- Scope selector (instance / type / global — if GLOBAL_ELEMENT_UPDATE_CONTRACT exists)

### Read-Only Fields

Fields are read-only when:

```
1. Element has no data-lw-* attributes (overlay skips these entirely)
2. Element is in a forbidden boundary (e.g., Sigma internals)
3. Element's canonical token path does not exist in token registry
4. Field is metadata (element, handle, source, editable, scope)
```

Read-only fields must:
- Be visually distinct from editable fields
- Not accept user input
- Show a tooltip explaining why read-only (if applicable)

---

## Scope Model

### Instance Scope (default)

Changes apply to the clicked element only:

```yaml
scope: instance
```

Cross-layer behavior:
- The same element ID must exist in the target layer
- If the element does not exist in the target layer, the cache entry is marked "failed"
- Instance scope is the only allowed scope until GLOBAL_ELEMENT_UPDATE_CONTRACT is written

### Type Scope (future — requires GLOBAL_ELEMENT_UPDATE_CONTRACT)

Changes apply to all elements of the same handle type:

```yaml
scope: type
```

Cross-layer behavior:
- The target layer applies the change to all elements of the matching handle type
- If the handle type does not exist in the target layer, the cache entry is marked "failed"
- Type scope requires GLOBAL_ELEMENT_UPDATE_CONTRACT.md to be written and accepted

### Global Scope (future — requires GLOBAL_ELEMENT_UPDATE_CONTRACT)

Changes apply to all elements matching a pattern:

```yaml
scope: global
pattern: "graph.node.*"
```

Cross-layer behavior:
- The target layer applies the change to all elements matching the pattern
- If no elements match the pattern in the target layer, the cache entry is marked "failed"
- Global scope requires GLOBAL_ELEMENT_UPDATE_CONTRACT.md to be written and accepted

### Scope Selector UI

The popout must include a scope selector dropdown:

```
[ Scope: instance ▼ ]
```

The dropdown options are:
- `instance` — always available
- `type` — disabled until GLOBAL_ELEMENT_UPDATE_CONTRACT is accepted
- `global` — disabled until GLOBAL_ELEMENT_UPDATE_CONTRACT is accepted

The selector must:
- Show only available options
- Disable unavailable options with a tooltip explaining why
- Persist the selected scope for the current popout session
- Reset to `instance` on popout close

---

## Motion Safety Gate

### Live Preview Effects

If the popout shows a live preview of the edited value (UX decision), the
preview must pass through the Motion Safety gate:

```
User edits token value in popout
  → Is this handle classified in motionSafetyRegistry?
  → Is the user's reduce-motion preference enabled?
  → What is the epilepsy risk classification?
  → Gate decision: allow / soften / block
  → Show allowed/softened preview
  → If blocked: show warning instead of preview
```

### Gate Application

The Motion Safety gate must run on:
- Live preview effects (if implemented)
- Final "Apply" action
- Cross-layer cache flush (handled by CROSS_LAYER_OVERRIDE_CACHE_CONTRACT.md)

See MOTION_SAFETY_AND_EPILEPSY_GUARD_CONTRACT.md for complete gate specification.

### Gate Bypass Forbidden

The popout must never bypass the Motion Safety gate:
- No direct CSS application without gate check
- No Sigma API calls without gate check
- No theme token updates without gate check
- No cross-layer cache flush without gate check

---

## Forbidden Editing Actions

The Cursor Inspector must never allow editing of:

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

### Forbidden Scope Updates

- Type scope updates without GLOBAL_ELEMENT_UPDATE_CONTRACT
- Global scope updates without GLOBAL_ELEMENT_UPDATE_CONTRACT
- Pattern-based updates without GLOBAL_ELEMENT_UPDATE_CONTRACT

---

## Relationship to GRAMMAR_LENS_CONTRACT.md

The Cursor Inspector depends on GRAMMAR_LENS_CONTRACT.md for:

- What data the overlay may expose (allowed vs forbidden)
- Rendering layer rules (active layer only, inactive layers receive cache)
- Forbidden boundaries (what the overlay must never expose)
- Canonical token path usage
- Cross-layer cache dependency

The Cursor Inspector extends GRAMMAR_LENS_CONTRACT.md by defining:
- The hold-key + click interaction model
- Popout behavior and positioning
- Editable vs read-only field semantics
- Scope model (instance / type / global)
- Motion Safety gate application to live preview

---

## Acceptance Criteria

This contract is considered accepted when:

1. Both GRAMMAR_LENS_CONTRACT.md and CURSOR_INSPECTOR_CONTRACT.md exist
2. SOURCE_OF_TRUTH.md is updated to reference these contracts
3. GHOST_OVERLAY_CURRENT_STATE.md is updated to reference these contracts
4. No runtime implementation changes are made in this pass (docs-only)

Future implementation acceptance criteria (when the overlay is implemented):

1. Cursor Inspector activates via hold-key + click on `data-lw-*` elements
2. Popout opens cursor-adjacent with correct positioning
3. Popout displays per-element YAML/JSON slice
4. Editable fields are visually distinct from read-only fields
5. Scope selector shows only available options (instance only until GLOBAL_ELEMENT_UPDATE_CONTRACT)
6. Motion Safety gate runs on live preview effects (if implemented)
7. Forbidden editing actions are blocked
8. Popout dismisses via click-outside, Escape, or key-release
9. Playwright tests prove: hold-key + click → popout opens → edit → apply → change visible

---

## Implementation Preconditions

Before this contract can be implemented at runtime:

1. GRAMMAR_LENS_CONTRACT.md must be accepted (this pass)
2. CROSS_LAYER_OVERRIDE_CACHE_CONTRACT.md must be accepted (already accepted at v73c)
3. GRAPH_SIGMA_AND_RENDERING.md must be accepted (supersedes RENDERING_LAYER_ARCHITECTURE.md, accepted at v73c)
4. MOTION_SAFETY_AND_EPILEPSY_GUARD_CONTRACT.md must be accepted (already accepted at v60)
5. GLOBAL_ELEMENT_UPDATE_CONTRACT.md must be written and accepted (for type/global scope)

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
- Establishes governance for Cursor Inspector interaction model
- Defines hold-key + click activation, popout behavior, editable/read-only semantics
- Establishes scope model (instance default, type/global require GLOBAL_ELEMENT_UPDATE_CONTRACT)
- Defines Motion Safety gate application to live preview effects
