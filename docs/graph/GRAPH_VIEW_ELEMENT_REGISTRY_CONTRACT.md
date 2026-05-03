# Graph View Element Registry Contract

## Status

v40 planning contract. Docs-only governance before Graph View Element Registry v0 runtime.

## Purpose

Define the governance model for the Graph View Element Registry in LumaWeave.

This contract establishes:
- What a Graph View Element is and how elements are registered
- What the Graph View Element Registry is and its read-only boundary
- Which graph visual elements are candidates for registration
- When the Element Registry becomes interactive
- When graph visual mutations may occur
- Accessibility requirements
- Playwright evidence requirements

This contract does not implement runtime behavior. It defines the rules for future implementation.

## Definitions

### Graph View Element

A named, structured visual/interactive graph surface element such as:
- Graph frame/container
- Node layer
- Edge layer
- Label layer
- Overlay layer
- HUD (Heads-Up Display)
- Minimap
- Control surface (physics sliders, camera controls, filter controls)

Graph View Elements have:
- A unique identifier
- A human-readable name
- A description of what the element shows or controls
- A category/group (e.g., frame, layer, overlay, control)
- A status (active, locked, future)
- A scope boundary (what it can/cannot do)
- Evidence requirements (DOM markers, Playwright selectors, accessibility attributes)

Graph View Elements are passive metadata in v40. They do not mutate graph/Sigma behavior directly.

### Graph View Element Registry

A future typed inventory of graph visual elements and their metadata.

The Element Registry:
- Lists all approved graph visual elements
- Enforces that no elements mutate graph/Sigma directly
- Identifies locked/future elements
- Identifies scope boundaries per element
- Provides a single source of truth for element metadata
- Defines evidence requirements for each element

In v40, the Element Registry is contract/policy only. No runtime enforcement exists.

## Non-Goals

This contract does not:
- Implement a live graph element registry
- Add Sigma renderer mutation
- Change graph physics behavior
- Change node/edge visual rendering
- Add new graph controls
- Add camera/filter behavior
- Add storage/persistence
- Add hotkeys/listeners
- Add command execution

## Graph View Element Model

Each Graph View Element has the following metadata structure:

```typescript
interface GraphViewElement {
  id: string;                    // Unique identifier (e.g., "graph-frame", "node-layer")
  name: string;                  // Human-readable name
  description: string;           // What this element shows or controls
  category: ElementCategory;     // frame, layer, overlay, control
  status: ElementStatus;         // active, locked, future
  scope: ElementScope;           // What this element can/cannot do
  evidence: EvidenceRequirements; // DOM markers, Playwright selectors, ARIA attributes
}
```

### Element Categories

- **frame**: Graph container, canvas wrapper, viewport
- **layer**: Node layer, edge layer, label layer
- **overlay**: HUD, minimap, selection indicators
- **control**: Physics sliders, camera controls, filter controls

### Element Status

- **active**: Element exists and is testable
- **locked**: Element exists but is read-only or disabled
- **future**: Element is planned but not yet implemented

## Element Registry Model

The Element Registry is a typed map of element IDs to element metadata:

```typescript
interface GraphViewElementRegistry {
  version: string;              // Registry version (e.g., "v0")
  elements: Record<string, GraphViewElement>;
  lastUpdated: string;          // ISO timestamp
}
```

In v40, this is a contract definition. No runtime registry exists.

## Visual Policy Model

Graph Visual Policy defines rules for:
- How graph visual behavior changes are governed
- How theme mapping applies to graph elements
- How DOM evidence markers are added
- How Playwright evidence is structured
- How Sigma/renderer boundaries are respected
- How accessibility is enforced

Visual Policy enforces that:
- Sigma/renderer internals are not equivalent to DOM surfaces
- DOM evidence markers may wrap graph surfaces but must not pretend to validate canvas internals
- Playwright tests prove stable app-visible behavior, not brittle pixel-perfect physics
- Graph visual changes need explicit policy/registry acceptance before runtime mutation
- Perspective System may reference graph perspectives but must not mutate graph behavior until contracted

## Sigma / Renderer Boundary

The Sigma renderer is a black box. The Element Registry and Visual Policy operate at the DOM level only.

Boundary rules:
- Element Registry does not control Sigma internals
- Visual Policy does not validate Sigma rendering
- DOM evidence markers wrap Sigma canvas but do not inspect canvas internals
- Playwright tests observe DOM-visible behavior, not canvas pixel states
- No direct Sigma API calls from Element Registry or Visual Policy

## DOM Evidence Boundary

Graph elements may have DOM evidence markers (data-testid, aria-label, role) for testability.

Boundary rules:
- DOM evidence markers are passive metadata
- Markers do not mutate Sigma behavior
- Markers do not validate Sigma internals
- Markers are for Playwright and accessibility only
- Canvas pixel assertions are forbidden unless already established and stable

## Theme Target Relationship

Graph View Elements may be Theme Targets for theme mapping.

Relationship rules:
- Graph elements can be registered as Theme Targets
- Theme mapping applies to DOM surfaces, not Sigma internals
- Theme changes do not require Sigma renderer mutation
- Theme mapping is read-only in v40

## Perspective System Relationship

Perspective System may reference graph perspectives (e.g., "Graph Physics" perspective).

Relationship rules:
- Perspective System can show graph metadata
- Perspective System does not mutate graph behavior
- Graph perspectives are read-only in v40
- Future graph perspective behavior requires explicit contract

## Command Deck Relationship

Graph controls may be referenced in Command Deck.

Relationship rules:
- Command Deck can show graph control metadata
- Command Deck does not execute graph commands in v40
- Graph controls are read-only/passive in v40
- Future graph command execution requires explicit contract

## Playwright Evidence Requirements

Each Graph View Element must have Playwright evidence:

- Graph frame: Canvas visible, dimensions valid
- Node layer: Nodes visible when data exists
- Edge layer: Edges visible when data exists
- Label layer: Labels visible when enabled
- Control surfaces: Sliders/buttons have stable data-testid
- No skipped tests
- No canvas pixel assertions unless established and stable

## Accessibility Requirements

Each Graph View Element must meet accessibility requirements:

- Graph frame: aria-label or role
- Controls: aria-label, keyboard navigation
- Canvas: fallback content or ARIA live region
- No keyboard traps
- Focus indicators visible

## v41 Preconditions

Before v41 (Graph Visual Registry v0 or graph physics test-hardening), the following must be accepted:
- v40 Graph View Element Registry contract
- v40 Graph Visual Policy contract
- v39 graph physics Playwright coverage (completed)
- v38 Perspective System v0 (completed)

## Stop Conditions

Stop if:
- Any attempt to mutate Sigma renderer directly
- Any attempt to change graph physics behavior
- Any attempt to add graph camera/filter behavior
- Any attempt to add storage/persistence
- Any attempt to add new hotkeys/listeners
- Any attempt to add command execution
- Any attempt to bypass DOM evidence boundary

## Acceptance Criteria

v40 is accepted when:
- docs/graph/GRAPH_VIEW_ELEMENT_REGISTRY_CONTRACT.md exists with all sections
- docs/graph/GRAPH_VISUAL_POLICY.md exists with all sections
- Contract sections match requirements
- No runtime implementation exists
- No graph/Sigma mutation exists
- QA/advisory/backlog updated for v40
- Typecheck passes
- Playwright passes with 0 skipped
- test.skip grep is clean
