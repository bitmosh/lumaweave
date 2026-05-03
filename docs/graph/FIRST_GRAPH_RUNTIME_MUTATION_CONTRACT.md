# First Graph Runtime Mutation Contract

## Status

v47 planning contract. Docs-only governance before first safe runtime graph mutation implementation.

## Purpose

Define the first permitted runtime graph mutation category and exact v48 candidate.

This contract establishes:
- What constitutes the first promoted graph runtime mutation
- The exact v48 implementation candidate (Graph Evidence Detail Mode)
- Allowed mutation boundary for v48
- Forbidden mutation boundaries that remain locked
- Sigma/renderer non-mutation guarantee
- Physics/layout non-mutation guarantee
- Camera/filter non-mutation guarantee
- Storage/persistence boundary
- Command deck boundary
- Hotkey boundary
- Accessibility requirements
- Playwright evidence requirements
- v48 preconditions
- v49+ promotion path
- Stop conditions
- Acceptance criteria

This contract does not implement runtime behavior. It defines the rules for v48 implementation.

## Definitions

### First Promoted Graph Runtime Mutation

A deliberately small, app-level runtime UI state that changes how graph evidence/probe/inventory metadata is displayed without mutating graph renderer behavior.

This is the first mutation category promoted from the v45/v46 passive observation zone into the mutation execution zone.

### App-Level UI State

Local React component state that affects only DOM-visible text/detail display in control-plane graph evidence UI. It does not affect Sigma renderer, graph data, physics, camera, filters, layout, or any graph behavior.

### Graph Evidence Detail Mode

A non-persistent UI mode in the Graph Runtime Probe / Graph Visual Inventory area that switches displayed evidence text between "Summary" and "Detailed". It changes only text/detail visibility in the control-plane graph evidence UI. It does not affect the graph renderer, graph data, nodes, edges, physics, camera, filters, layout, storage, hotkeys, or commands.

## Non-Goals

This contract does not:
- Implement the Graph Evidence Detail Mode (that is v48)
- Add Sigma renderer mutation
- Change graph physics behavior
- Change node/edge visual rendering
- Add camera/filter controls
- Add storage/persistence
- Add hotkeys/listeners
- Add command execution
- Promote any other mutation category beyond app-level UI state

## First Mutation Candidate

### Candidate Name

Graph Evidence Detail Mode

### Candidate Description

A non-persistent UI mode in the Graph Runtime Probe / Graph Visual Inventory area that switches displayed evidence text between "Summary" and "Detailed".

### Implementation Location

`src/control-plane/graph/GraphVisualInventoryPanel.tsx`

### Allowed Behavior

- Add local React state: `useState<"summary" | "detailed">`
- Mode values: "summary" and "detailed"
- Summary mode: shows existing compact rows
- Detailed mode: shows extra boundary/evidence text per registry/probe item
- Changes only text/detail visibility in control-plane graph evidence UI
- No persistence
- No graph renderer effect
- No Sigma instance access
- No graph data mutation

### UI Controls

Preferred UI options:
- Segmented control with two buttons (Summary / Detailed)
- Native select with stable label/test ID
- Buttons must be genuinely active and fully tested
- No dead controls or no-op buttons

### Data Test IDs

- `graph-evidence-detail-mode` - mode control container
- `graph-evidence-mode-summary` - summary mode indicator/control
- `graph-evidence-mode-detailed` - detailed mode indicator/control
- `graph-evidence-detail-readout` - current mode display

## Allowed Mutation Boundary

### What is Allowed in v48

- Local React state for UI mode selection
- Visible label/status change between Summary/Detailed
- Expanded metadata text in detailed mode
- Compact metadata text in summary mode
- DOM-level text visibility changes only
- Active controls that visibly change displayed evidence

### What is Forbidden in v48

- Sigma instance access or API calls
- Renderer settings changes
- Graph physics parameter changes
- Graph data model mutation
- Node/edge style changes
- Camera/filter behavior changes
- Storage/persistence
- Hotkey/listener addition
- Command execution
- No-op or dead controls

## Forbidden Mutation Boundary

The following mutations remain forbidden in v48 and require v49+ explicit promotion:

### Physics Tuning
- Changing node size
- Changing link distance
- Changing repel force
- Changing gravity
- Changing any physics parameters

### Camera Automation
- Adding camera movement controls
- Adding zoom controls
- Adding pan controls
- Adding fit-to-screen controls
- Automating camera transitions

### Node/Edge Styling Changes
- Changing node colors
- Changing edge colors
- Changing node shapes
- Changing edge styles
- Changing label visibility

### Graph Filtering/Hiding
- Adding node filtering
- Adding edge filtering
- Adding category-based hiding
- Adding search-based hiding
- Adding dynamic visibility toggles

### Renderer Lifecycle Changes
- Destroying and recreating Sigma instance
- Changing Sigma configuration
- Swapping renderer implementations
- Modifying Sigma initialization

### Sigma Setting Changes
- Changing Sigma internal settings
- Modifying Sigma event handlers
- Changing Sigma renderer options
- Accessing Sigma private APIs

### Graph Data Model Mutation
- Adding/removing nodes at runtime
- Adding/removing edges at runtime
- Modifying graph structure dynamically
- Changing graph topology

### Command-Triggered Graph Behavior
- Adding Command Deck commands that mutate graph
- Adding slash commands that affect graph
- Adding command palette actions for graph mutation

### Hotkey-Triggered Graph Behavior
- Adding hotkeys that trigger graph mutation
- Adding keyboard shortcuts for camera/physics
- Adding global hotkeys for graph controls

## Sigma / Renderer Non-Mutation Guarantee

### Sigma as Black Box

The Sigma renderer remains a black box for v48. The Graph Evidence Detail Mode does not access or mutate Sigma internals.

### Boundary Rules

- No Sigma instance access from Graph Evidence Detail Mode
- No Sigma API calls from Graph Evidence Detail Mode
- No renderer settings changes from Graph Evidence Detail Mode
- DOM-level text changes only, no canvas interaction
- Playwright tests observe DOM-visible text changes, not canvas states

### Allowed Sigma Interactions

- None in v48

### Forbidden Sigma Interactions

- Calling Sigma API methods
- Changing Sigma renderer settings
- Modifying Sigma event handlers
- Accessing Sigma private/internal APIs
- Inspecting Sigma canvas pixel data

## Physics / Layout Non-Mutation Guarantee

### Physics as Protected Subsystem

Graph physics parameters remain protected in v48. Graph Evidence Detail Mode does not change physics.

### Boundary Rules

- Physics parameters are read-only in v48
- No physics changes from Graph Evidence Detail Mode
- No layout recalculation from Graph Evidence Detail Mode
- Text visibility changes only, no physics interaction

### Allowed Physics Interactions

- None in v48

### Forbidden Physics Interactions

- Changing node size
- Changing link distance
- Changing repel force
- Changing gravity
- Changing any physics parameters
- Triggering layout recalculation

## Camera / Filter Non-Mutation Guarantee

### Camera and Filter as Protected Subsystems

Camera and filter behavior remain protected in v48. Graph Evidence Detail Mode does not add camera/filter controls.

### Boundary Rules

- Camera/filter behavior is read-only in v48
- No camera movement from Graph Evidence Detail Mode
- No filter/hide behavior from Graph Evidence Detail Mode
- Text visibility changes only, no camera/filter interaction

### Allowed Camera/Filter Interactions

- None in v48

### Forbidden Camera/Filter Interactions

- Adding camera movement controls
- Adding zoom controls
- Adding pan controls
- Adding filter/hide behavior
- Changing camera parameters

## Storage / Persistence Boundary

### No Persistence in v48

Graph Evidence Detail Mode must not persist state.

### Boundary Rules

- No localStorage usage
- No sessionStorage usage
- No database storage
- No file storage
- No URL state persistence
- Mode resets on page refresh

### Allowed Storage Interactions

- None in v48

### Forbidden Storage Interactions

- localStorage
- sessionStorage
- IndexedDB
- File system
- URL state
- Any persistence mechanism

## Command Deck Boundary

### No Command Execution in v48

Graph Evidence Detail Mode must not add or execute commands.

### Boundary Rules

- No Command Deck command registration
- No slash command registration
- No command palette actions
- No command execution

### Allowed Command Interactions

- None in v48

### Forbidden Command Interactions

- Registering graph mutation commands
- Executing graph mutation commands
- Adding command palette actions

## Hotkey Boundary

### No Hotkeys in v48

Graph Evidence Detail Mode must not add hotkeys or listeners.

### Boundary Rules

- No global hotkey registration
- No keyboard listener addition
- No keyboard shortcut for mode switching
- No keyboard interaction

### Allowed Hotkey Interactions

- None in v48

### Forbidden Hotkey Interactions

- Adding hotkeys that trigger graph mutation
- Adding keyboard shortcuts for camera/physics
- Adding global hotkeys for graph controls
- Banned hotkeys (Ctrl+Alt+T, Alt+F8)

## Accessibility Requirements

### Required Attributes

- Mode control: `aria-label` or `aria-labelledby`
- Mode buttons: `aria-pressed` state
- Current mode announcement: ARIA live region or visible text
- Keyboard navigation: Tab navigable controls
- Focus indicators: Visible focus states

### Keyboard Navigation

- Mode control: Tab navigable
- Mode buttons: Arrow key navigation if segmented control
- Enter/Space: Activate mode selection
- No keyboard traps

### Screen Reader Support

- Mode changes should be announced
- Current mode should be visible in text
- Mode control should have clear label

## Playwright Evidence Requirements

### Evidence Paths

Preferred evidence paths for v48 acceptance:

1. **Playwright assertions** – e2e specs that execute mode switching and assert text changes
2. **Visible manual app behavior** – Direct UI observation of mode switching
3. **Typecheck/build output** – typecheck, lint, and build artifacts for infra checks
4. **Git diff / file inspection** – Structural verifications tied to acceptance notes

### Forbidden Evidence Paths

- Manual DevTools JavaScript execution
- Manual inspection of JS arrays or objects
- "Trust me, I read the code"
- Skipping tests
- Changing tests to fit broken behavior

### v48 Evidence Requirements

For v48 Graph Evidence Detail Mode acceptance, Playwright must prove:
- Summary mode is visible by default
- Detailed mode control exists and is active
- Clicking/selecting Detailed changes visible evidence text
- Switching back to Summary changes visible text back
- No graph renderer/physics/camera/filter controls are introduced
- Graph surface still mounts
- Runtime probe still reports mutation boundaries
- No skipped tests
- Controls are genuinely active (not dead)

## v48 Preconditions

Before v48 Graph Evidence Detail Mode implementation can begin, the following must be true:

1. **v47 Contract Accepted**: FIRST_GRAPH_RUNTIME_MUTATION_CONTRACT.md is accepted and committed
2. **v47 Commit Clean**: Post-commit git status is clean
3. **v45 Contract Accepted**: GRAPH_RUNTIME_BOUNDARY_CONTRACT.md is accepted (from previous pass)
4. **v46 Passive Probe Accepted**: Passive runtime probe is accepted (from previous pass)
5. **Typecheck Passes**: npm run typecheck passes with zero errors
6. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
7. **No Skipped Tests**: grep -R "test.skip" returns no results
8. **No Banned Hotkeys**: grep for banned hotkeys returns no results in code
9. **No DevTools Wording**: grep for DevTools wording returns no results in docs
10. **App-Level Scope Confirmed**: v48 can remain app-level UI state only
11. **No Sigma/Physics Required**: No Sigma/physics/camera/filter behavior is required for v48
12. **Gate Conditions Met**: All v47 → v48 gate conditions are satisfied

If any precondition fails, v48 must not proceed. Stop and report.

## v49+ Promotion Path

### Promotion Process

To promote from v48 (app-level UI state) to v49+ (graph/renderer mutation), the following process must be followed:

1. **Specific Mutation Contract**: Create specific contract for the mutation category (e.g., physics tuning contract)
2. **Advisory Discussion**: Advisory questions for the mutation are discussed and answered
3. **QA Checklist**: QA checklist items for the mutation are defined and verified
4. **Playwright Evidence**: Playwright tests prove the mutation behavior is safe and correct
5. **Backlog Clearance**: No blocking backlog items exist
6. **Acceptance**: Mutation is accepted via QA report
7. **Implementation**: Mutation is implemented according to contract
8. **Validation**: Typecheck and Playwright validation pass
9. **Commit**: Mutation is committed with appropriate message
10. **Post-Commit Verification**: Git status is clean and tests still pass

### Promotion Criteria

A mutation category can be promoted when:
- The specific mutation contract is accepted
- The mutation has explicit advisory approval
- The mutation has Playwright evidence
- The mutation does not break existing contracts
- The mutation does not break existing tests
- The mutation has no skipped tests
- The mutation has no banned hotkeys
- The mutation has no DevTools wording in docs

### Forbidden Promotion Paths

The following promotion paths are forbidden:
- Promoting without specific contract acceptance
- Promoting without Playwright evidence
- Promoting with skipped tests
- Promoting with banned hotkeys
- Promoting that breaks existing contracts
- Promoting that breaks existing tests
- Promoting that requires DevTools manual steps

### v49 Candidate Categories

Potential v49+ mutation categories (all require explicit new contracts):
- Physics tuning (node size, link distance, repel force)
- Camera controls (zoom, pan, fit-to-screen)
- Node/edge styling (colors, shapes, sizes)
- Graph filtering/hiding (node filters, edge filters)
- Graph data mutation (dynamic topology changes)

## Stop Conditions

### Immediate Stop Conditions

Work must stop immediately if any of these conditions are detected:

1. **Sigma Mutation Attempted**: Any code attempts to access Sigma/renderer internals
2. **Physics Change Attempted**: Any code attempts to change physics parameters
3. **Camera/Filter Change Attempted**: Any code attempts to add camera/filter behavior
4. **Control Addition Attempted**: Any code attempts to add graph renderer controls
5. **Storage Addition Attempted**: Any code attempts to add storage/persistence
6. **Hotkey Addition Attempted**: Any code attempts to add new hotkeys/listeners
7. **Command Execution Attempted**: Any code attempts to execute graph commands
8. **Test Skip Attempted**: Any test is marked as skipped
9. **DevTools Wording Found**: Any doc requires manual DevTools steps for acceptance
10. **Banned Hotkey Found**: Any code uses banned hotkeys (e.g., Ctrl+Alt+T)
11. **Dead Control Found**: Any control is added but does not visibly change behavior

### Stop and Report Conditions

Work must stop and produce a Quest Mode Situation Report if:

1. **Typecheck Fails**: npm run typecheck returns errors
2. **Playwright Fails**: npm run qa:e2e returns failures
3. **Skipped Tests Found**: grep -R "test.skip" returns results
4. **Git Status Dirty**: git status --short shows uncommitted changes during validation
5. **Gate Condition Fails**: Any v47 → v48 gate condition fails
6. **Contract Violation**: Implementation violates contract requirements
7. **Boundary Crossing**: Implementation crosses forbidden boundary
8. **Evidence Missing**: Required Playwright evidence is missing

## Acceptance Criteria

### v47 Acceptance Criteria

v47 (First Graph Runtime Mutation Contract) is accepted when:

1. **Contract Document Exists**: docs/graph/FIRST_GRAPH_RUNTIME_MUTATION_CONTRACT.md exists with all 19 required sections
2. **Contract is Complete**: All required sections are filled with meaningful content
3. **Contract is Consistent**: Contract is consistent with GRAPH_RUNTIME_BOUNDARY_CONTRACT.md
4. **First Mutation Candidate Defined**: Graph Evidence Detail Mode is clearly defined
5. **Allowed Boundary Clear**: Allowed mutation boundary is clearly defined
6. **Forbidden Boundary Clear**: Forbidden mutation boundaries are clearly defined
7. **Sigma Non-Mutation Guarantee**: Sigma/renderer non-mutation guarantee is explicit
8. **Physics Non-Mutation Guarantee**: Physics/layout non-mutation guarantee is explicit
9. **Camera Non-Mutation Guarantee**: Camera/filter non-mutation guarantee is explicit
10. **Storage Boundary Clear**: No persistence is explicitly required
11. **Command Deck Boundary Clear**: No command execution is explicitly required
12. **Hotkey Boundary Clear**: No hotkeys are explicitly required
13. **Accessibility Requirements**: Accessibility requirements are defined
14. **Playwright Evidence Requirements**: Playwright evidence requirements are defined
15. **v48 Preconditions**: v48 preconditions are clear and testable
16. **v49+ Promotion Path**: v49+ promotion path is defined
17. **Stop Conditions**: Stop conditions are clearly defined
18. **QA Updated**: QA/advisory/backlog are updated for v47
19. **Typecheck Passes**: npm run typecheck passes with zero errors
20. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
21. **No Skipped Tests**: grep -R "test.skip" returns no results
22. **Commit Clean**: Post-commit git status is clean

### v48 Acceptance Criteria

v48 (Graph Evidence Detail Mode) is accepted when:

1. **v47 Gate Conditions Met**: All v47 → v48 gate conditions are satisfied
2. **Contract Respected**: Implementation respects FIRST_GRAPH_RUNTIME_MUTATION_CONTRACT.md
3. **App-Level Only**: Mutation is app-level UI state only
4. **No Sigma Mutation**: No Sigma/renderer mutation occurs
5. **No Physics Change**: No physics parameters change
6. **No Camera/Filter**: No camera/filter behavior is added
7. **No Storage**: No storage/persistence is added
8. **No Hotkeys**: No new hotkeys/listeners are added
9. **No Commands**: No command execution is added
10. **Active Controls**: Controls are genuinely active (not dead)
11. **Summary Mode Default**: Summary mode is visible by default
12. **Detailed Mode Works**: Detailed mode changes visible evidence text
13. **Mode Switching Works**: Switching between modes visibly changes text
14. **Graph Surface Mounts**: Graph surface still mounts and is visible
15. **Runtime Probe Works**: Runtime probe still reports mutation boundaries
16. **Playwright Proves Behavior**: Playwright tests prove mode switching behavior
17. **No Skipped Tests**: No tests are skipped
18. **Typecheck Passes**: npm run typecheck passes with zero errors
19. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
20. **QA Updated**: QA/advisory/backlog are updated for v48
21. **Commit Clean**: Post-commit git status is clean
