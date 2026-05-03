# Graph Theme Runtime Application Contract

## Status

v51 planning contract. Docs-only governance before first Sigma-safe graph theme runtime application implementation.

## Purpose

Define how passive graph visual theme mapping may be promoted toward runtime application, and explicitly choose the v52 probe candidate.

This contract establishes:
- What constitutes Graph Theme Runtime Application
- The relationship between passive mapping (v50) and runtime application (v51+)
- The first permitted runtime application candidate (v52)
- Allowed application boundary for v52
- Forbidden Sigma/renderer boundary
- Forbidden node/edge/canvas boundary
- Token path vs token value boundary
- Storage/persistence boundary
- Command/hotkey boundary
- Reversibility requirements
- Accessibility requirements
- Playwright evidence requirements
- v52 preconditions
- v53+ promotion path
- Stop conditions
- Acceptance criteria

This contract does not implement runtime behavior. It defines the rules for v52 implementation.

## Definitions

### Graph Theme Runtime Application

Any runtime behavior that applies theme-related state to graph surfaces. In v51/v52, this is restricted to wrapper-level DOM state only, not Sigma renderer or graph data mutation.

### Sigma-Safe Theme Application

A runtime theme-related UI state on the graph shell/wrapper that does not apply token values to Sigma, canvas, nodes, edges, or graph data. It operates at DOM level only, using canonical token paths as metadata/readout.

### Graph Theme Evidence Wrapper Mode

A tiny app-controlled visual state on the graph shell/wrapper only that toggles theme-related evidence state as wrapper-level DOM attributes or visible status labels. It does not resolve or apply token values, does not affect Sigma internals, and does not change graph rendering.

## Non-Goals

This contract does not:
- Implement the Graph Theme Evidence Wrapper Mode (that is v52)
- Add Sigma renderer mutation
- Change graph node/edge styles
- Apply theme token values to graph renderer
- Change graph physics/layout/camera/filter behavior
- Add storage/persistence
- Add hotkeys/listeners
- Add command execution
- Promote any other runtime theme application beyond wrapper-level DOM state

## Graph Theme Runtime Application Model

The model follows a strict progression:

```
v49: Passive Theme Mapping Contract (docs-only)
  ↓
v50: Passive Theme Mapping Inventory (metadata display only)
  ↓
v51: Runtime Application Contract (docs-only, defines safe candidate)
  ↓
v52: Wrapper-Level Evidence Mode (first Sigma-safe probe)
  ↓
v53+: True Sigma/Node/Edge Theme Application (requires new contract)
```

### v51 Role

v51 is the contract definition pass that:
- Defines what runtime theme application means
- Explicitly chooses the v52 candidate (Graph Theme Evidence Wrapper Mode)
- Defines the allowed application boundary for v52
- Defines all forbidden boundaries that remain locked until v53+
- Establishes token path vs token value boundary
- Establishes storage/persistence boundary
- Establishes command/hotkey boundary

### v52 Role

v52 is the implementation pass that:
- Implements Graph Theme Evidence Wrapper Mode only
- Operates at wrapper-level DOM state only
- Does not cross into Sigma/renderer internals
- Does not cross into node/edge/canvas styling
- Does not cross into token value application
- Does not cross into storage/persistence

## First Application Candidate

### Candidate Name

Graph Theme Evidence Wrapper Mode

### Candidate Description

A tiny app-controlled visual state on the graph shell/wrapper only that toggles theme-related evidence state as wrapper-level DOM attributes or visible status labels.

### Implementation Location

`src/control-plane/graph/GraphVisualInventoryPanel.tsx`

### Allowed Behavior

- Add local React state: `useState<boolean>` for theme evidence mode
- Toggle graph shell/wrapper theme evidence state:
  - `data-graph-theme-evidence="on/off"` attribute
  - Visible status label: "Graph theme evidence: active/inactive"
  - Wrapper-level class if needed
- Show canonical token path metadata as readout only
- Must not resolve or apply token values
- Must not affect Sigma internals, graph data, nodes, edges, canvas, physics, camera, filters, layout, storage, hotkeys, or commands
- Must be reversible by user action (toggle button)
- Must be Playwright-visible

### UI Controls

Preferred UI options:
- Toggle button or switch with clear aria-pressed
- Located in Graph Theme Mapping / Graph Visual Inventory area
- Button must be genuinely active and fully tested
- No dead controls or no-op buttons

### Data Test IDs

- `graph-theme-evidence-toggle` - toggle control
- `graph-theme-evidence-status` - current status display
- `graph-theme-evidence-readout` - metadata readout
- Graph shell/wrapper selector updated with data-graph-theme-evidence attribute

## Allowed Application Boundary

### What is Allowed in v52

- Local React state for theme evidence mode
- Wrapper-level data attribute (e.g., `data-graph-theme-evidence="on/off"`)
- Visible wrapper-level status label
- Canonical token path metadata/readout display
- Reversible toggle control
- DOM-level attribute changes only
- Active controls that visibly change wrapper state

### What is Forbidden in v52

- Sigma instance access or API calls
- Token value resolution or application
- CSS variable writes
- Renderer settings changes
- Node/edge style changes
- Camera/filter behavior changes
- Storage/persistence
- Hotkey/listener addition
- Command execution
- No-op or dead controls

## Forbidden Sigma / Renderer Boundary

The Sigma renderer remains a black box for v52. Graph Theme Evidence Wrapper Mode does not access or mutate Sigma internals.

### Boundary Rules

- No Sigma instance access from Graph Theme Evidence Wrapper Mode
- No Sigma API calls from Graph Theme Evidence Wrapper Mode
- No renderer settings changes from Graph Theme Evidence Wrapper Mode
- DOM-level attribute changes only, no canvas interaction
- Playwright tests observe DOM-visible attributes, not canvas states

### Allowed Sigma Interactions

- None in v52

### Forbidden Sigma Interactions

- Calling Sigma API methods
- Changing Sigma renderer settings
- Modifying Sigma event handlers
- Changing Sigma renderer options
- Accessing Sigma private/internal APIs
- Inspecting Sigma canvas pixel data

## Forbidden Node / Edge / Canvas Boundary

Graph node/edge/canvas styling remains protected in v52. Graph Theme Evidence Wrapper Mode does not change node/edge/canvas styles.

### Boundary Rules

- Node/edge/canvas parameters are read-only in v52
- No node/edge style changes from Graph Theme Evidence Wrapper Mode
- No canvas style changes from Graph Theme Evidence Wrapper Mode
- Wrapper-level attribute changes only, no canvas interaction

### Allowed Node/Edge/Canvas Interactions

- None in v52

### Forbidden Node/Edge/Canvas Interactions

- Changing node colors
- Changing edge colors
- Changing node shapes
- Changing edge styles
- Changing label visibility
- Changing canvas rendering properties
- Changing any node/edge/canvas visual properties

## Token Path vs Token Value Boundary

This is a critical boundary for v52.

### Token Path (Allowed in v52)

Canonical theme token paths are allowed as metadata/readout:
- Display token paths like "panel.border", "graph.node.fill"
- Use token paths as string identifiers for governance
- Show token paths in UI as readout text
- Reference token paths from THEME_TOKEN_PATH_MAP.md

### Token Value (Forbidden in v52)

Token value resolution and application is forbidden in v52:
- Do not resolve token paths to actual color values
- Do not apply token values to Sigma renderer
- Do not apply token values to CSS variables
- Do not apply token values to node/edge styles
- Do not apply token values to canvas
- Do not read theme runtime token values

### Boundary Rules

- Token paths: metadata only, display as strings
- Token values: forbidden to resolve or apply
- v52 operates on path strings, not resolved values
- v52 does not call theme runtime to get token values

## Storage / Persistence Boundary

### No Persistence in v52

Graph Theme Evidence Wrapper Mode must not persist state.

### Boundary Rules

- No localStorage usage
- No sessionStorage usage
- No database storage
- No file storage
- No URL state persistence
- Mode resets on page refresh

### Allowed Storage Interactions

- None in v52

### Forbidden Storage Interactions

- localStorage
- sessionStorage
- IndexedDB
- File system
- URL state
- Any persistence mechanism

## Command / Hotkey Boundary

### No Command Execution in v52

Graph Theme Evidence Wrapper Mode must not add or execute commands.

### Boundary Rules

- No Command Deck command registration
- No slash command registration
- No command palette actions
- No command execution

### Allowed Command Interactions

- None in v52

### Forbidden Command Interactions

- Registering graph theme mutation commands
- Executing graph theme mutation commands
- Adding command palette actions

### No Hotkeys in v52

Graph Theme Evidence Wrapper Mode must not add hotkeys or listeners.

### Boundary Rules

- No global hotkey registration
- No keyboard listener addition
- No keyboard shortcut for mode switching
- No keyboard interaction

### Allowed Hotkey Interactions

- None in v52

### Forbidden Hotkey Interactions

- Adding hotkeys that trigger graph theme mutation
- Adding keyboard shortcuts for theme changes
- Adding global hotkeys for graph controls
- Banned hotkeys (Ctrl+Alt+T, Alt+F8)

## Reversibility Requirements

### User Control

Graph Theme Evidence Wrapper Mode must be reversible by user action:
- Toggle button must be visible and active
- Clicking toggle must change state
- Clicking toggle again must reverse state
- State must be visibly indicated

### Default State

- Default state is inactive/off
- User must explicitly activate to see evidence mode
- Refresh resets to default inactive state

## Accessibility Requirements

### Required Attributes

- Toggle control: `aria-label` or `aria-labelledby`
- Toggle button: `aria-pressed` state
- Status label: Visible text for current state
- Metadata readout: Visible text for screen readers
- Keyboard navigation: Tab navigable controls
- Focus indicators: Visible focus states

### Keyboard Navigation

- Toggle control: Tab navigable
- Enter/Space: Activate toggle
- No keyboard traps

### Screen Reader Support

- Mode changes should be announced
- Current state should be visible in text
- Toggle control should have clear label
- Metadata should be visible as text

## Playwright Evidence Requirements

### Evidence Paths

Preferred evidence paths for v52 acceptance:

1. **Playwright assertions** – e2e specs that execute toggle and assert DOM changes
2. **Visible manual app behavior** – Direct UI observation of toggle and state changes
3. **Typecheck/build output** – typecheck, lint, and build artifacts for infra checks
4. **Git diff / file inspection** – Structural verifications tied to acceptance notes

### Forbidden Evidence Paths

- Manual DevTools JavaScript execution
- Manual inspection of JS arrays or objects
- "Trust me, I read the code"
- Skipping tests
- Changing tests to fit broken behavior

### v52 Evidence Requirements

For v52 Graph Theme Evidence Wrapper Mode acceptance, Playwright must prove:
- Theme evidence toggle is visible and active
- Default theme evidence status is inactive
- Clicking toggle changes status to active
- Graph shell/wrapper receives visible/testable theme evidence state (data attribute)
- Clicking again returns status to inactive
- Canonical token path metadata is visible as metadata/readout
- No token values are applied/resolved
- No CSS variables are written by this feature
- Graph surface still mounts
- No Sigma/renderer/node/edge/canvas/physics/camera/filter controls are introduced
- No skipped tests
- Controls are genuinely active (not dead)

## v52 Preconditions

Before v52 Graph Theme Evidence Wrapper Mode implementation can begin, the following must be true:

1. **v51 Contract Accepted**: GRAPH_THEME_RUNTIME_APPLICATION_CONTRACT.md is accepted and committed
2. **v51 Commit Clean**: Post-commit git status is clean
3. **v49 Contract Accepted**: GRAPH_VISUAL_THEME_MAPPING_CONTRACT.md is accepted (from previous pass)
4. **v50 Passive Inventory Accepted**: Graph Theme Mapping Inventory is accepted (from previous pass)
5. **Typecheck Passes**: npm run typecheck passes with zero errors
6. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
7. **No Skipped Tests**: grep -R "test.skip" returns no results
8. **No Banned Hotkeys**: grep for banned hotkeys returns no results in code
9. **No DevTools Wording**: grep for DevTools wording returns no results in docs
10. **Wrapper-Only Scope Confirmed**: v52 can remain wrapper-level DOM state only
11. **No Sigma/Node/Edge Required**: No Sigma/renderer/node/edge/canvas behavior is required for v52
12. **Gate Conditions Met**: All v51 → v52 gate conditions are satisfied

If any precondition fails, v52 must not proceed. Stop and report.

## v53+ Promotion Path

### Promotion Process

To promote from v52 (wrapper-level evidence mode) to v53+ (true Sigma/node/edge theme application), the following process must be followed:

1. **Specific Runtime Contract**: Create specific contract for true graph theme application
2. **Advisory Discussion**: Advisory questions for true theme application are discussed and answered
3. **QA Checklist**: QA checklist items for true theme application are defined and verified
4. **Playwright Evidence**: Playwright tests prove true theme application is safe and correct
5. **Backlog Clearance**: No blocking backlog items exist
6. **Acceptance**: True theme application is accepted via QA report
7. **Implementation**: True theme application is implemented according to contract
8. **Validation**: Typecheck and Playwright validation pass
9. **Commit**: True theme application is committed with appropriate message
10. **Post-Commit Verification**: Git status is clean and tests still pass

### Promotion Criteria

True graph theme application can be promoted when:
- The specific runtime contract is accepted
- True theme application has explicit advisory approval
- True theme application has Playwright evidence
- True theme application does not break existing contracts
- True theme application does not break existing tests
- True theme application has no skipped tests
- True theme application has no banned hotkeys
- True theme application has no DevTools wording in docs

### Forbidden Promotion Paths

The following promotion paths are forbidden:
- Promoting without specific contract acceptance
- Promoting without Playwright evidence
- Promoting with skipped tests
- Promoting with banned hotkeys
- Promoting that breaks existing contracts
- Promoting that breaks existing tests
- Promoting that requires DevTools manual steps

### v53 Candidate Categories

Potential v53+ runtime application categories (all require explicit new contracts):
- True Sigma renderer theme application (apply token values to Sigma)
- Node/edge styling via theme (apply token values to node/edge styles)
- Canvas rendering via theme (apply token values to canvas)
- Reactive graph theme updates (update graph when theme changes)
- Perspective-specific graph themes (different graph themes per perspective)
- User graph theme customization (user-editable graph theme overrides)

## Stop Conditions

### Immediate Stop Conditions

Work must stop immediately if any of these conditions are detected:

1. **Sigma Mutation Attempted**: Any code attempts to access Sigma/renderer internals
2. **Node/Edge Styling Change Attempted**: Any code attempts to change node/edge styles
3. **Token Value Application Attempted**: Any code attempts to resolve or apply token values
4. **CSS Variable Write Attempted**: Any code attempts to write CSS variables
5. **Storage Addition Attempted**: Any code attempts to add storage/persistence
6. **Hotkey Addition Attempted**: Any code attempts to add new hotkeys/listeners
7. **Command Execution Attempted**: Any code attempts to execute graph theme commands
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
5. **Gate Condition Fails**: Any v51 → v52 gate condition fails
6. **Contract Violation**: Implementation violates contract requirements
7. **Boundary Crossing**: Implementation crosses forbidden boundary
8. **Evidence Missing**: Required Playwright evidence is missing

## Acceptance Criteria

### v51 Acceptance Criteria

v51 (Graph Theme Runtime Application Contract) is accepted when:

1. **Contract Document Exists**: docs/graph/GRAPH_THEME_RUNTIME_APPLICATION_CONTRACT.md exists with all 19 required sections
2. **Contract is Complete**: All required sections are filled with meaningful content
3. **Contract is Consistent**: Contract is consistent with GRAPH_VISUAL_THEME_MAPPING_CONTRACT.md
4. **Contract is Consistent**: Contract is consistent with GRAPH_RUNTIME_BOUNDARY_CONTRACT.md
5. **Runtime Application Model Defined**: Graph Theme Runtime Application model is clearly defined
6. **First Candidate Defined**: Graph Theme Evidence Wrapper Mode is clearly defined as v52 candidate
7. **Allowed Boundary Clear**: Allowed application boundary is clearly defined
8. **Forbidden Sigma Boundary Clear**: Forbidden Sigma/renderer boundary is clearly defined
9. **Forbidden Node/Edge/Canvas Boundary Clear**: Forbidden node/edge/canvas boundary is clearly defined
10. **Token Path vs Value Boundary Clear**: Token path vs token value boundary is explicitly defined
11. **Storage Boundary Clear**: No persistence is explicitly required
12. **Command/Hotkey Boundary Clear**: No command execution or hotkeys are explicitly required
13. **Reversibility Requirements**: Reversibility requirements are defined
14. **Accessibility Requirements**: Accessibility requirements are defined
15. **Playwright Evidence Requirements**: Playwright evidence requirements are defined
16. **v52 Preconditions**: v52 preconditions are clear and testable
17. **v53+ Promotion Path**: v53+ promotion path is defined
18. **Stop Conditions**: Stop conditions are clearly defined
19. **QA Updated**: QA/advisory/backlog are updated for v51
20. **Typecheck Passes**: npm run typecheck passes with zero errors
21. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
22. **No Skipped Tests**: grep -R "test.skip" returns no results
23. **Commit Clean**: Post-commit git status is clean

### v52 Acceptance Criteria

v52 (Graph Theme Evidence Wrapper Mode) is accepted when:

1. **v51 Gate Conditions Met**: All v51 → v52 gate conditions are satisfied
2. **Contract Respected**: Implementation respects GRAPH_THEME_RUNTIME_APPLICATION_CONTRACT.md
3. **Wrapper-Only Only**: Implementation is wrapper-level DOM state only
4. **No Sigma Mutation**: No Sigma/renderer mutation occurs
5. **No Node/Edge Change**: No node/edge/canvas style changes occur
6. **No Token Value Application**: No token values are resolved or applied
7. **No CSS Variable Writes**: No CSS variables are written
8. **No Storage**: No storage/persistence is added
9. **No Hotkeys**: No new hotkeys/listeners are added
10. **No Commands**: No command execution is added
11. **Toggle Active**: Toggle control is genuinely active and changes state
12. **Default Inactive**: Default state is inactive
13. **Reversible**: Toggle reverses state on second click
14. **DOM Attribute Visible**: Graph shell/wrapper receives visible/testable data attribute
15. **Metadata Visible**: Canonical token path metadata is visible as readout
16. **Graph Surface Mounts**: Graph surface still mounts and is visible
17. **Existing Inventory Works**: Existing graph inventory/probe/detail mode/theme mapping still works
18. **No Skipped Tests**: No tests are skipped
19. **Playwright Proves Behavior**: Playwright tests prove wrapper-level evidence behavior
20. **Typecheck Passes**: npm run typecheck passes with zero errors
21. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
22. **QA Updated**: QA/advisory/backlog are updated for v52
23. **Commit Clean**: Post-commit git status is clean
