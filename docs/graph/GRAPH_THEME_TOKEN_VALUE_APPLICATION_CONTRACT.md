# Graph Theme Token Value Application Contract

## Status

v57 planning contract. Docs-only governance before first graph theme token value application implementation.

## Purpose

Define how canonical theme token values may be safely applied to graph surfaces, and establish the diagnostic readiness requirements before any actual application occurs.

This contract establishes:
- What constitutes Graph Theme Token Value Application
- The relationship between DOM-only wrapper (v56) and token value application (v57+)
- The diagnostic readiness requirements before v57+ implementation
- Allowed application boundaries for future implementation
- Forbidden Sigma/renderer boundary
- Forbidden node/edge/canvas boundary
- CSS variable write boundary
- Storage/persistence boundary
- Command/hotkey boundary
- Reversibility requirements
- Accessibility requirements
- Playwright evidence requirements
- v57 preconditions
- v58 diagnostic role
- v59+ promotion path
- Stop conditions
- Acceptance criteria

This contract does not implement runtime behavior. It defines the rules for v58 diagnostic implementation and future v59+ application.

## Definitions

### Graph Theme Token Value Application

A runtime behavior that applies resolved theme token values to graph surfaces. In v57/v58, this is restricted to diagnostic readiness inspection only, not actual value application.

### Token Value Application vs Token Value Preview

- **Token Value Preview (v54)**: Read-only display of resolved token values as text. Does not apply values to graph runtime.
- **Token Value Application (v57+)**: Actual application of resolved token values to graph surfaces (DOM, CSS variables, Sigma settings, node/edge styles). Forbidden until explicit promotion.

### Graph Theme Application Readiness Diagnostic

A diagnostic inspection that verifies whether the graph system is ready to safely apply theme token values without violating existing contracts. It checks preconditions, boundary compliance, and infrastructure readiness without actually applying values.

## Non-Goals

This contract does not:
- Implement the Graph Theme Application Readiness Diagnostic (that is v58)
- Apply token values to Sigma renderer
- Change graph node/edge/canvas styles
- Write CSS variables
- Mutate theme presets
- Add storage/persistence
- Add hotkeys/listeners
- Add command execution
- Implement actual token value application (that requires v59+ contract)

## Graph Theme Token Value Application Model

The model follows a strict progression:

```
v49: Passive Theme Mapping Contract (docs-only)
  ↓
v50: Passive Theme Mapping Inventory (metadata display only)
  ↓
v51: Runtime Application Contract (docs-only, defines safe candidate)
  ↓
v52: Wrapper-Level Evidence Mode (token path strings as metadata)
  ↓
v53: Token Value Preview Contract (docs-only, defines read-only preview)
  ↓
v54: Read-Only Token Value Preview (display resolved values, still no application)
  ↓
v55: Graph Theme Application Contract (docs-only, defines DOM-only application)
  ↓
v56: Graph Shell Theme Evidence Application (DOM-only wrapper, no token values)
  ↓
v57: Token Value Application Contract (docs-only, defines diagnostic readiness)
  ↓
v58: Application Readiness Diagnostic (inspect readiness, no application)
  ↓
v59+: True Token Value Application (apply values to graph, requires new contract)
```

### v57 Role

v57 is the contract definition pass that:
- Defines what token value application means in the context of v56+ progression
- Establishes that v57 is a diagnostic readiness inspection pass only
- Defines the v58 diagnostic candidate (Graph Theme Application Readiness Diagnostic)
- Defines all forbidden boundaries that remain locked until v59+
- Establishes CSS variable write boundary
- Establishes storage/persistence boundary
- Establishes command/hotkey boundary
- Defines preconditions for future token value application

### v58 Role

v58 is the diagnostic implementation pass that:
- Implements Graph Theme Application Readiness Diagnostic only
- Inspects whether the system is ready for token value application
- Does not apply token values
- Does not cross into Sigma/renderer internals
- Does not cross into node/edge/canvas styling
- Does not write CSS variables
- Does not add storage/persistence

## Diagnostic Candidate

### Candidate Name

Graph Theme Application Readiness Diagnostic

### Candidate Description

A diagnostic inspection that verifies whether the graph system is ready to safely apply theme token values. It checks preconditions, boundary compliance, and infrastructure readiness without actually applying values.

### Implementation Location

`src/control-plane/graph/GraphVisualInventoryPanel.tsx` (extend existing panel with diagnostic section)

### Allowed Behavior

- Add local React state: `useState<boolean>` for diagnostic mode
- Toggle diagnostic mode visibility
- Display readiness check results:
  - Contract acceptance status
  - Boundary compliance status
  - Infrastructure readiness status
  - Token resolver availability status
  - Sigma API safety status
- Show diagnostic metadata as readout only
- Must not apply token values
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

- `graph-theme-readiness-diagnostic-toggle` - toggle control
- `graph-theme-readiness-diagnostic-status` - current status display
- `graph-theme-readiness-diagnostic-readout` - diagnostic metadata readout

## Allowed Application Boundary

### What is Allowed in v58

- Local React state for diagnostic mode
- Readiness check display (contract status, boundary status, infrastructure status)
- Diagnostic metadata/readout display
- Reversible toggle control
- DOM-level display only
- Active controls that visibly change diagnostic display state

### What is Forbidden in v58

- Sigma instance access or API calls
- Token value resolution or application
- CSS variable writes
- Renderer settings changes
- Node/edge style changes
- Camera/filter behavior changes
- Storage/persistence
- Hotkey/listener addition
- Command execution
- Actual token value application
- No-op or dead controls

## Forbidden Sigma / Renderer Boundary

The Sigma renderer remains a black box for v58. Graph Theme Application Readiness Diagnostic does not access or mutate Sigma internals.

### Boundary Rules

- No Sigma instance access from diagnostic
- No Sigma API calls from diagnostic
- No renderer settings changes from diagnostic
- Diagnostic checks Sigma API safety status only via metadata inspection, not runtime calls
- Playwright tests observe DOM-visible diagnostic text, not canvas states

### Allowed Sigma Interactions

- None in v58 (diagnostic may check Sigma API safety via static metadata only)

### Forbidden Sigma Interactions

- Calling Sigma API methods
- Changing Sigma renderer settings
- Modifying Sigma event handlers
- Changing Sigma renderer options
- Accessing Sigma private/internal APIs
- Inspecting Sigma canvas pixel data

## Forbidden Node / Edge / Canvas Boundary

Graph node/edge/canvas styling remains protected in v58. Graph Theme Application Readiness Diagnostic does not change node/edge/canvas styles.

### Boundary Rules

- Node/edge/canvas parameters are read-only in v58
- No node/edge style changes from diagnostic
- No canvas style changes from diagnostic
- Diagnostic checks boundary compliance status only, does not mutate

### Allowed Node/Edge/Canvas Interactions

- None in v58 (diagnostic may check boundary compliance via metadata only)

### Forbidden Node/Edge/Canvas Interactions

- Changing node colors
- Changing edge colors
- Changing node shapes
- Changing edge styles
- Changing label visibility
- Changing canvas rendering properties
- Changing any node/edge/canvas visual properties

## CSS Variable Boundary

CSS variable writing is forbidden in v57/v58. Graph Theme Application Readiness Diagnostic does not write CSS variables.

### Boundary Rules

- No CSS variable writes from diagnostic
- No DOM style.setProperty() calls
- No stylesheet mutations
- Diagnostic checks CSS variable write boundary status only, does not write

### Allowed CSS Interactions

- None in v58 (diagnostic may check CSS boundary status via metadata only)

### Forbidden CSS Interactions

- Writing CSS variables
- Setting DOM element styles via style properties
- Mutating stylesheets
- Any CSS state changes

## Storage / Persistence Boundary

### No Persistence in v58

Graph Theme Application Readiness Diagnostic must not persist state.

### Boundary Rules

- No localStorage usage
- No sessionStorage usage
- No database storage
- No file storage
- No URL state persistence
- Diagnostic mode resets on page refresh

### Allowed Storage Interactions

- None in v58

### Forbidden Storage Interactions

- localStorage
- sessionStorage
- IndexedDB
- File system
- URL state
- Any persistence mechanism

## Command / Hotkey Boundary

### No Command Execution in v58

Graph Theme Application Readiness Diagnostic must not add or execute commands.

### Boundary Rules

- No Command Deck command registration
- No slash command registration
- No command palette actions
- No command execution

### Allowed Command Interactions

- None in v58

### Forbidden Command Interactions

- Registering graph theme mutation commands
- Executing graph theme mutation commands
- Adding command palette actions

### No Hotkeys in v58

Graph Theme Application Readiness Diagnostic must not add hotkeys or listeners.

### Boundary Rules

- No global hotkey registration
- No keyboard listener addition
- No keyboard shortcut for diagnostic toggling
- No keyboard interaction

### Allowed Hotkey Interactions

- None in v58

### Forbidden Hotkey Interactions

- Adding hotkeys that trigger graph theme mutation
- Adding keyboard shortcuts for theme changes
- Adding global hotkeys for graph controls
- Banned hotkeys (Ctrl+Alt+T, Alt+F8)

## Reversibility Requirements

### User Control

Graph Theme Application Readiness Diagnostic must be reversible by user action:
- Toggle button must be visible and active
- Clicking toggle must change diagnostic display state
- Clicking toggle again must reverse state
- State must be visibly indicated

### Default State

- Default state is inactive/off
- User must explicitly activate to see diagnostic
- Refresh resets to default inactive state

## Accessibility Requirements

### Required Attributes

- Toggle control: `aria-label` or `aria-labelledby`
- Toggle button: `aria-pressed` state
- Status label: Visible text for current state
- Diagnostic readout: Visible text for screen readers
- Keyboard navigation: Tab navigable controls
- Focus indicators: Visible focus states

### Keyboard Navigation

- Toggle control: Tab navigable
- Enter/Space: Activate toggle
- No keyboard traps

### Screen Reader Support

- Diagnostic changes should be announced
- Current state should be visible in text
- Toggle control should have clear label
- Diagnostic metadata should be visible as text

## Playwright Evidence Requirements

### Evidence Paths

Preferred evidence paths for v58 acceptance:

1. **Playwright assertions** – e2e specs that execute toggle and assert diagnostic display changes
2. **Visible manual app behavior** – Direct UI observation of toggle and diagnostic state changes
3. **Typecheck/build output** – typecheck, lint, and build artifacts for infra checks
4. **Git diff / file inspection** – Structural verifications tied to acceptance notes

### Forbidden Evidence Paths

- Manual DevTools JavaScript execution
- Manual inspection of JS arrays or objects
- "Trust me, I read the code"
- Skipping tests
- Changing tests to fit broken behavior

### v58 Evidence Requirements

For v58 Graph Theme Application Readiness Diagnostic acceptance, Playwright must prove:
- Diagnostic toggle is visible and active
- Default diagnostic status is inactive
- Clicking toggle changes status to active
- Diagnostic readout is visible (contract status, boundary status, infrastructure status)
- Clicking again returns status to inactive
- No token values are applied/resolved by this feature
- No CSS variables are written by this feature
- No Sigma/renderer/node/edge/canvas/physics/camera/filter controls are introduced
- Graph surface still mounts
- Existing inventory/probe/detail mode/theme mapping/evidence wrapper mode/token preview/theme application still works
- No skipped tests
- Controls are genuinely active (not dead)

## v57 Preconditions

Before v57 (Token Value Application Contract) can be accepted, the following must be true:

1. **v56 Theme Application Accepted**: Graph Shell Theme Evidence Application is accepted and committed
2. **v56 Commit Clean**: Post-commit git status is clean
3. **v55 Contract Accepted**: GRAPH_THEME_APPLICATION_CONTRACT.md is accepted and committed
4. **v54 Token Preview Accepted**: Read-Only Graph Theme Token Preview is accepted
5. **v53 Token Preview Contract Accepted**: GRAPH_THEME_TOKEN_VALUE_PREVIEW_CONTRACT.md is accepted
6. **v52 Evidence Wrapper Accepted**: Graph Theme Evidence Wrapper Mode is accepted
7. **v51 Runtime Application Contract Accepted**: GRAPH_THEME_RUNTIME_APPLICATION_CONTRACT.md is accepted
8. **Typecheck Passes**: npm run typecheck passes with zero errors
9. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
10. **No Skipped Tests**: grep -R "test.skip" returns no results
11. **No Banned Hotkeys**: grep for banned hotkeys returns no results in code
12. **No DevTools Wording**: grep for DevTools wording returns no results in docs
13. **Diagnostic-Only Scope Confirmed**: v58 can remain diagnostic inspection only
14. **No Sigma/Node/Edge Required**: No Sigma/renderer/node/edge/canvas behavior is required for v58
15. **No CSS Variable Writes Required**: No CSS variable writes are required for v58
16. **Gate Conditions Met**: All v56 → v57 gate conditions are satisfied

If any precondition fails, v57 must not proceed. Stop and report.

## v58 Preconditions

Before v58 (Graph Theme Application Readiness Diagnostic) implementation can begin, the following must be true:

1. **v57 Contract Accepted**: GRAPH_THEME_TOKEN_VALUE_APPLICATION_CONTRACT.md is accepted and committed
2. **v57 Commit Clean**: Post-commit git status is clean
3. **v56 Theme Application Accepted**: Graph Shell Theme Evidence Application is accepted
4. **v55 Contract Accepted**: GRAPH_THEME_APPLICATION_CONTRACT.md is accepted
5. **Typecheck Passes**: npm run typecheck passes with zero errors
6. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
7. **No Skipped Tests**: grep -R "test.skip" returns no results
8. **No Banned Hotkeys**: grep for banned hotkeys returns no results in code
9. **No DevTools Wording**: grep for DevTools wording returns no results in docs
10. **Diagnostic-Only Scope Confirmed**: v58 can remain diagnostic inspection only
11. **No Sigma/Node/Edge Required**: No Sigma/renderer/node/edge/canvas behavior is required for v58
12. **No CSS Variable Writes Required**: No CSS variable writes are required for v58
13. **Gate Conditions Met**: All v57 → v58 gate conditions are satisfied

If any precondition fails, v58 must not proceed. Stop and report.

## v59+ Promotion Path

### Promotion Process

To promote from v58 (diagnostic readiness) to v59+ (true token value application), the following process must be followed:

1. **Specific Runtime Contract**: Create specific contract for true token value application
2. **Advisory Discussion**: Advisory questions for true token application are discussed and answered
3. **QA Checklist**: QA checklist items for true token application are defined and verified
4. **Playwright Evidence**: Playwright tests prove true token application is safe and correct
5. **Backlog Clearance**: No blocking backlog items exist
6. **Diagnostic Readiness**: v58 diagnostic must show all readiness checks pass
7. **Acceptance**: True token value application is accepted via QA report
8. **Implementation**: True token value application is implemented according to contract
9. **Validation**: Typecheck and Playwright validation pass
10. **Commit**: True token value application is committed with appropriate message
11. **Post-Commit Verification**: Git status is clean and tests still pass

### Promotion Criteria

True graph theme token value application can be promoted when:
- The specific runtime contract is accepted
- True token value application has explicit advisory approval
- True token value application has Playwright evidence
- v58 diagnostic shows all readiness checks pass
- True token value application does not break existing contracts
- True token value application does not break existing tests
- True token value application has no skipped tests
- True token value application has no banned hotkeys
- True token value application has no DevTools wording in docs

### Forbidden Promotion Paths

The following promotion paths are forbidden:
- Promoting without specific contract acceptance
- Promoting without Playwright evidence
- Promoting with skipped tests
- Promoting with banned hotkeys
- Promoting that breaks existing contracts
- Promoting that breaks existing tests
- Promoting that requires DevTools manual steps
- Promoting when v58 diagnostic shows readiness failures

### v59 Candidate Categories

Potential v59+ runtime application categories (all require explicit new contracts):
- Sigma renderer theme value application (apply token values to Sigma settings)
- Node/edge styling via theme values (apply token values to node/edge styles)
- Canvas rendering via theme values (apply token values to canvas)
- CSS variable application (write token values to CSS variables)
- Reactive graph theme updates (update graph when theme changes)
- Perspective-specific graph themes (different graph themes per perspective)
- User graph theme customization (user-editable graph theme overrides)

## Stop Conditions

### Immediate Stop Conditions

Work must stop immediately if any of these conditions are detected:

1. **Sigma Mutation Attempted**: Any code attempts to access Sigma/renderer internals
2. **Node/Edge Styling Change Attempted**: Any code attempts to change node/edge styles
3. **Token Value Application Attempted**: Any code attempts to apply token values to graph runtime
4. **CSS Variable Write Attempted**: Any code attempts to write CSS variables
5. **Storage Addition Attempted**: Any code attempts to add storage/persistence
6. **Hotkey Addition Attempted**: Any code attempts to add new hotkeys/listeners
7. **Command Execution Attempted**: Any code attempts to execute graph theme commands
8. **Test Skip Attempted**: Any test is marked as skipped
9. **DevTools Wording Found**: Any doc requires manual DevTools steps for acceptance
10. **Banned Hotkey Found**: Any code uses banned hotkeys (e.g., Ctrl+Alt+T)
11. **Dead Control Found**: Any control is added but does not visibly change behavior
12. **Actual Application Attempted**: v58 diagnostic attempts to actually apply token values

### Stop and Report Conditions

Work must stop and produce a Quest Mode Situation Report if:

1. **Typecheck Fails**: npm run typecheck returns errors
2. **Playwright Fails**: npm run qa:e2e returns failures
3. **Skipped Tests Found**: grep -R "test.skip" returns results
4. **Git Status Dirty**: git status --short shows uncommitted changes during validation
5. **Gate Condition Fails**: Any v57 → v58 gate condition fails
6. **Contract Violation**: Implementation violates contract requirements
7. **Boundary Crossing**: Implementation crosses forbidden boundary
8. **Evidence Missing**: Required Playwright evidence is missing
9. **Diagnostic Shows Readiness Failure**: v58 diagnostic shows critical readiness failures that cannot be resolved without breaking contracts

## Acceptance Criteria

### v57 Acceptance Criteria

v57 (Graph Theme Token Value Application Contract) is accepted when:

1. **Contract Document Exists**: docs/graph/GRAPH_THEME_TOKEN_VALUE_APPLICATION_CONTRACT.md exists with all 21 required sections
2. **Contract is Complete**: All required sections are filled with meaningful content
3. **Contract is Consistent**: Contract is consistent with GRAPH_THEME_APPLICATION_CONTRACT.md
4. **Contract is Consistent**: Contract is consistent with GRAPH_THEME_TOKEN_VALUE_PREVIEW_CONTRACT.md
5. **Contract is Consistent**: Contract is consistent with GRAPH_THEME_RUNTIME_APPLICATION_CONTRACT.md
6. **Contract is Consistent**: Contract is consistent with GRAPH_VISUAL_THEME_MAPPING_CONTRACT.md
7. **Contract is Consistent**: Contract is consistent with GRAPH_RUNTIME_BOUNDARY_CONTRACT.md
8. **Application Model Defined**: Graph Theme Token Value Application model is clearly defined
9. **Diagnostic Candidate Defined**: Graph Theme Application Readiness Diagnostic is clearly defined as v58 candidate
10. **Allowed Boundary Clear**: Allowed diagnostic boundary is clearly defined
11. **Forbidden Sigma Boundary Clear**: Forbidden Sigma/renderer boundary is clearly defined
12. **Forbidden Node/Edge/Canvas Boundary Clear**: Forbidden node/edge/canvas boundary is clearly defined
13. **CSS Variable Boundary Clear**: CSS variable write boundary is explicitly forbidden
14. **Storage Boundary Clear**: No persistence is explicitly required
15. **Command/Hotkey Boundary Clear**: No command execution or hotkeys are explicitly required
16. **Reversibility Requirements**: Reversibility requirements are defined
17. **Accessibility Requirements**: Accessibility requirements are defined
18. **Playwright Evidence Requirements**: Playwright evidence requirements are defined
19. **v57 Preconditions**: v57 preconditions are clear and testable
20. **v58 Preconditions**: v58 preconditions are clear and testable
21. **v59+ Promotion Path**: v59+ promotion path is defined
22. **Stop Conditions**: Stop conditions are clearly defined
23. **QA Updated**: QA/advisory/backlog are updated for v57
24. **Typecheck Passes**: npm run typecheck passes with zero errors
25. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
26. **No Skipped Tests**: grep -R "test.skip" returns no results
27. **Commit Clean**: Post-commit git status is clean

### v58 Acceptance Criteria

v58 (Graph Theme Application Readiness Diagnostic) is accepted when:

1. **v57 Gate Conditions Met**: All v57 → v58 gate conditions are satisfied
2. **Contract Respected**: Implementation respects GRAPH_THEME_TOKEN_VALUE_APPLICATION_CONTRACT.md
3. **Diagnostic-Only Only**: Implementation is diagnostic inspection only
4. **No Sigma Mutation**: No Sigma/renderer mutation occurs
5. **No Node/Edge Change**: No node/edge/canvas style changes occur
6. **No Token Application**: No token values are applied to graph runtime
7. **No CSS Variable Writes**: No CSS variables are written
8. **No Storage**: No storage/persistence is added
9. **No Hotkeys**: No new hotkeys/listeners are added
10. **No Commands**: No command execution is added
11. **Toggle Active**: Toggle control is genuinely active and changes state
12. **Default Inactive**: Default state is inactive
13. **Reversible**: Toggle reverses state on second click
14. **Diagnostic Visible**: Diagnostic readout is visible (contract status, boundary status, infrastructure status)
15. **Graph Surface Mounts**: Graph surface still mounts and is visible
16. **Existing Inventory Works**: Existing graph inventory/probe/detail mode/theme mapping/evidence wrapper mode/token preview/theme application still works
17. **No Skipped Tests**: No tests are skipped
18. **Playwright Proves Behavior**: Playwright tests prove diagnostic inspection behavior
19. **Typecheck Passes**: npm run typecheck passes with zero errors
20. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
21. **QA Updated**: QA/advisory/backlog are updated for v58
22. **Commit Clean**: Post-commit git status is clean
