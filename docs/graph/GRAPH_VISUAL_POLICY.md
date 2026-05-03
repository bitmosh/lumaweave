# Graph Visual Policy

## Status

v40 planning contract. Docs-only governance before Graph Visual Policy v0 runtime.

## Purpose

Define the governance model for graph visual behavior in LumaWeave.

This policy establishes:
- How graph visual changes are governed
- How theme mapping applies to graph elements
- How DOM evidence markers are structured
- How Playwright evidence is structured
- How Sigma/renderer boundaries are respected
- How accessibility is enforced for graph elements
- When graph visual mutations may occur

This policy does not implement runtime behavior. It defines the rules for future implementation.

## Definitions

### Graph Visual Behavior

Any change to the visual appearance or interaction of graph elements, including:
- Node color, size, shape
- Edge color, width, style
- Label visibility, font, size
- Camera position, zoom, pan
- Physics settings (node size, link distance, repel force)
- Filter/hide behavior
- Overlay visibility

### Visual Policy

A set of rules governing how graph visual behavior can change, who can change it, and what evidence is required before changes are accepted.

## Non-Goals

This policy does not:
- Implement visual policy enforcement at runtime
- Add Sigma renderer mutation
- Change current graph visual behavior
- Add new graph controls
- Add camera/filter behavior
- Add storage/persistence
- Add hotkeys/listeners
- Add command execution

## Visual Policy Model

Graph Visual Policy follows these principles:

1. **Explicit Acceptance**: All graph visual changes require explicit contract acceptance before implementation.
2. **DOM Boundary**: Visual policy operates at DOM level, not Sigma internals.
3. **Evidence First**: Visual changes require Playwright evidence before acceptance.
4. **Accessibility First**: Visual changes must meet accessibility requirements.
5. **Passive Registry**: Element Registry is read-only in v40, no runtime enforcement.

### Change Categories

- **Passive Observation**: Adding DOM markers for testability (allowed in v40)
- **Theme Mapping**: Changing colors via theme system (allowed if theme contract exists)
- **Control Surface**: Adding UI controls (requires explicit contract)
- **Physics Change**: Changing physics settings (requires explicit contract)
- **Camera Change**: Adding camera controls (requires explicit contract)
- **Filter Behavior**: Adding filter/hide behavior (requires explicit contract)

## Sigma / Renderer Boundary

The Sigma renderer is a black box. Visual Policy operates at the DOM level only.

Boundary rules:
- Visual Policy does not control Sigma internals
- Visual Policy does not validate Sigma rendering
- DOM markers wrap Sigma canvas but do not inspect canvas internals
- Playwright tests observe DOM-visible behavior, not canvas pixel states
- No direct Sigma API calls from Visual Policy

## DOM Evidence Boundary

Graph elements may have DOM evidence markers (data-testid, aria-label, role) for testability.

Boundary rules:
- DOM evidence markers are passive metadata
- Markers do not mutate Sigma behavior
- Markers do not validate Sigma internals
- Markers are for Playwright and accessibility only
- Canvas pixel assertions are forbidden unless already established and stable

### Allowed DOM Markers

- `data-testid` on graph container, control surfaces
- `aria-label` on graph canvas, controls
- `role` on graph container
- `title` on interactive elements

### Forbidden DOM Markers

- Markers that attempt to validate Sigma internals
- Markers that pretend to control Sigma rendering
- Canvas pixel validation via DOM markers

## Theme Target Relationship

Graph View Elements may be Theme Targets for theme mapping.

Relationship rules:
- Graph elements can be registered as Theme Targets
- Theme mapping applies to DOM surfaces, not Sigma internals
- Theme changes do not require Sigma renderer mutation
- Theme mapping is read-only in v40
- Theme changes require explicit theme contract acceptance

### Theme Mapping Scope

Theme mapping can change:
- Node colors
- Edge colors
- Label colors
- Background colors
- Border colors

Theme mapping cannot change:
- Node sizes (physics)
- Edge widths (physics)
- Camera position
- Physics settings

## Perspective System Relationship

Perspective System may reference graph perspectives (e.g., "Graph Physics" perspective).

Relationship rules:
- Perspective System can show graph metadata
- Perspective System does not mutate graph behavior
- Graph perspectives are read-only in v40
- Future graph perspective behavior requires explicit contract
- Perspective System must not bypass Visual Policy

### Graph Perspectives

Graph perspectives may show:
- Graph element metadata
- Current visual settings
- Theme mapping status

Graph perspectives must not:
- Change graph visual settings
- Mutate Sigma renderer
- Bypass Visual Policy

## Command Deck Relationship

Graph controls may be referenced in Command Deck.

Relationship rules:
- Command Deck can show graph control metadata
- Command Deck does not execute graph commands in v40
- Graph controls are read-only/passive in v40
- Future graph command execution requires explicit contract
- Command Deck must not bypass Visual Policy

### Graph Controls

Command Deck may show:
- Graph control metadata
- Current control values
- Control status

Command Deck must not:
- Execute graph commands
- Change graph settings
- Bypass Visual Policy

## Playwright Evidence Requirements

All graph visual changes require Playwright evidence:

### Evidence Requirements

- **Before Change**: Baseline Playwright test showing current behavior
- **After Change**: Playwright test showing new behavior
- **No Skips**: No test.skip allowed for graph tests
- **Stable Selectors**: Use stable data-testid or role/label selectors
- **No Canvas Pixels**: Avoid canvas pixel assertions unless established and stable
- **Accessibility**: Verify ARIA labels, keyboard navigation

### Test Categories

- **Surface Tests**: Graph frame/container visible
- **Layer Tests**: Nodes/edges/labels visible when data exists
- **Control Tests**: Controls have stable selectors and are accessible
- **Interaction Tests**: Controls respond to user input
- **Coexistence Tests**: Graph coexists with other panels (Mission Control, Command Deck)

## Accessibility Requirements

All graph visual elements must meet accessibility requirements:

### Required Attributes

- Graph canvas: `aria-label` or `role="img"` with `aria-label`
- Controls: `aria-label` or `aria-labelledby`
- Interactive elements: Keyboard navigable
- Focus indicators: Visible focus states

### Keyboard Navigation

- Graph canvas: Should not trap keyboard focus
- Controls: Tab navigable
- Escape key: Should exit graph interaction mode if implemented
- Arrow keys: Should not interfere with browser navigation unless intentional

### Screen Reader Support

- Graph canvas: Should have fallback content or ARIA live region
- Controls: Should announce state changes
- Selection: Should announce selection state

## v41 Preconditions

Before v41 (Graph Visual Registry v0 or graph physics test-hardening), the following must be accepted:
- v40 Graph View Element Registry contract
- v40 Graph Visual Policy contract
- v39 graph physics Playwright coverage (completed)
- v38 Perspective System v0 (completed)

## Stop Conditions

Stop if:
- Any attempt to mutate Sigma renderer directly
- Any attempt to change graph visual behavior without contract
- Any attempt to bypass DOM evidence boundary
- Any attempt to add graph camera/filter behavior without contract
- Any attempt to add storage/persistence
- Any attempt to add new hotkeys/listeners
- Any attempt to add command execution
- Any attempt to use canvas pixel assertions without established stability

## Acceptance Criteria

v40 is accepted when:
- docs/graph/GRAPH_VIEW_ELEMENT_REGISTRY_CONTRACT.md exists with all sections
- docs/graph/GRAPH_VISUAL_POLICY.md exists with all sections
- Contract sections match requirements
- No runtime implementation exists
- No graph/Sigma mutation exists
- No graph visual behavior changes exist
- QA/advisory/backlog updated for v40
- Typecheck passes
- Playwright passes with 0 skipped
- test.skip grep is clean
