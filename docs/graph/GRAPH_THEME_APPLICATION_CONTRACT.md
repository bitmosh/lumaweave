# Graph Theme Application Contract

## Status

v55 planning contract. Docs-only governance before first DOM-only graph theme application implementation.

## Purpose

Define how graph theme previews may be promoted into the first runtime graph theme application, and explicitly choose the v56 mutation candidate.

This contract establishes:
- What constitutes Graph Theme Application
- The relationship between token value preview (v54) and theme application (v55+)
- The first permitted graph theme application candidate (v56)
- Allowed application boundary for v56
- Forbidden Sigma/renderer boundary
- Forbidden node/edge/canvas boundary
- Forbidden token value application boundary
- CSS variable boundary
- Theme preset/override boundary
- Storage/persistence boundary
- Command/hotkey boundary
- Reversibility requirements
- Accessibility requirements
- Playwright evidence requirements
- v56 preconditions
- v57+ promotion path
- Stop conditions
- Acceptance criteria

This contract does not implement runtime behavior. It defines the rules for v56 implementation.

## Definitions

### Graph Theme Application

A runtime behavior that applies graph-theme-related UI state to a graph surface. In v55/v56, this is restricted to DOM-wrapper-level state only, not Sigma renderer or graph data mutation.

### DOM-Only Graph Theme Application

A runtime UI state that marks the graph shell/wrapper with theme evidence state without applying token values to Sigma, canvas, nodes, edges, CSS variables, or theme presets.

### Graph Shell Theme Evidence Application

A tiny, reversible, app-level DOM-wrapper theme application that applies a data attribute or class to the graph shell/wrapper only. It uses canonical theme token paths as metadata/readout only. It does not resolve or apply token values into runtime graph styling.

## Non-Goals

This contract does not:
- Implement the Graph Shell Theme Evidence Application (that is v56)
- Add Sigma renderer mutation
- Change graph node/edge styles
- Apply theme token values to graph renderer
- Change graph physics/layout/camera/filter behavior
- Add storage/persistence
- Add hotkeys/listeners
- Add command execution
- Promote any other runtime theme application beyond DOM-wrapper level

## Graph Theme Application Model

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
v56: Graph Shell Theme Evidence Application (first DOM-only application)
  ↓
v57+: True Sigma/Node/Edge Theme Application (requires new contract)
```

### v55 Role

v55 is the contract definition pass that:
- Defines what graph theme application means in the context of v54+ progression
- Explicitly chooses the v56 candidate (Graph Shell Theme Evidence Application)
- Defines the allowed application boundary for v56 (DOM-wrapper only)
- Defines all forbidden boundaries that remain locked until v57+
- Establishes token value application boundary (forbidden in v56)
- Establishes CSS variable write boundary (forbidden in v56)
- Establishes storage/persistence boundary (forbidden in v56)
- Establishes command/hotkey boundary (forbidden in v56)

### v56 Role

v56 is the implementation pass that:
- Implements Graph Shell Theme Evidence Application only
- Operates at DOM-wrapper level state only
- Does not cross into Sigma/renderer internals
- Does not cross into node/edge/canvas styling
- Does not cross into token value application
- Does not cross into CSS variable writes
- Does not cross into storage/persistence

## First Application Candidate

### Candidate Name

Graph Shell Theme Evidence Application

### Candidate Description

A tiny, reversible, app-level DOM-wrapper theme application that applies a data attribute or class to the graph shell/wrapper only. It uses canonical theme token paths as metadata/readout only. It does not resolve or apply token values into runtime graph styling.

### Implementation Location

`src/control-plane/graph/GraphVisualInventoryPanel.tsx`

### Allowed Behavior

- Add local React state: `useState<boolean>` for theme application evidence
- Toggle graph shell/wrapper theme application evidence state:
  - `data-graph-theme-application="on/off"` attribute
  - Visible status label: "Graph theme application evidence: active/inactive"
  - Wrapper-level class if needed (purely local, non-token-value-applying)
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

- `graph-theme-application-toggle` - toggle control
- `graph-theme-application-status` - current status display
- `graph-theme-application-readout` - metadata readout
- Graph shell/wrapper selector updated with data-graph-theme-application attribute

## Allowed Application Boundary

### What is Allowed in v56

- Local React state for theme application evidence
- Wrapper-level data attribute (e.g., `data-graph-theme-application="on/off"`)
- Visible wrapper-level status label
- Canonical token path metadata/readout display
- Reversible toggle control
- DOM-level attribute changes only
- Active controls that visibly change wrapper state
- Wrapper-level class if needed (purely local, non-token-value-applying)

### What is Forbidden in v56

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

The Sigma renderer remains a black box for v56. Graph Shell Theme Evidence Application does not access or mutate Sigma internals.

### Boundary Rules

- No Sigma instance access from Graph Shell Theme Evidence Application
- No Sigma API calls from Graph Shell Theme Evidence Application
- No renderer settings changes from Graph Shell Theme Evidence Application
- DOM-level attribute changes only, no canvas interaction
- Playwright tests observe DOM-visible attributes, not canvas states

### Allowed Sigma Interactions

- None in v56

### Forbidden Sigma Interactions

- Calling Sigma API methods
- Changing Sigma renderer settings
- Modifying Sigma event handlers
- Changing Sigma renderer options
- Accessing Sigma private/internal APIs
- Inspecting Sigma canvas pixel data

## Forbidden Node / Edge / Canvas Boundary

Graph node/edge/canvas styling remains protected in v56. Graph Shell Theme Evidence Application does not change node/edge/canvas styles.

### Boundary Rules

- Node/edge/canvas parameters are read-only in v56
- No node/edge style changes from Graph Shell Theme Evidence Application
- No canvas style changes from Graph Shell Theme Evidence Application
- Wrapper-level attribute changes only, no canvas interaction

### Allowed Node/Edge/Canvas Interactions

- None in v56

### Forbidden Node/Edge/Canvas Interactions

- Changing node colors
- Changing edge colors
- Changing node shapes
- Changing edge styles
- Changing label visibility
- Changing canvas rendering properties
- Changing any node/edge/canvas visual properties

## Forbidden Token Value Application Boundary

Token value application to graph runtime is forbidden in v56. This is a critical boundary.

### Boundary Rules

- No token value resolution into actual color values
- No token value application to Sigma renderer
- No token value application to node/edge styles
- No token value application to CSS variables
- No token value application to canvas
- Token paths may be shown as metadata/readout only

### Allowed Token Interactions

- Display canonical token paths as metadata/readout
- Show token paths as string identifiers
- Use token paths for governance documentation

### Forbidden Token Interactions

- Resolving token paths to actual color values
- Applying token values to Sigma renderer
- Applying token values to node/edge styles
- Applying token values to CSS variables
- Applying token values to canvas
- Reading theme runtime token values for application

## CSS Variable Boundary

CSS variable writing is forbidden in v55/v56. Graph Shell Theme Evidence Application does not write CSS variables.

### Boundary Rules

- No CSS variable writes from Graph Shell Theme Evidence Application
- No DOM style.setProperty() calls
- No stylesheet mutations
- Display token paths as text content, not as CSS

### Allowed CSS Interactions

- None in v56

### Forbidden CSS Interactions

- Writing CSS variables
- Setting DOM element styles via style properties
- Mutating stylesheets
- Any CSS state changes

## Theme Preset / Override Boundary

Theme preset and override mutation is forbidden in v55/v56. Graph Shell Theme Evidence Application does not mutate theme presets or override storage.

### Boundary Rules

- No theme preset mutation
- No theme override storage writes
- No custom graph theme state storage
- No theme configuration changes

### Allowed Theme Interactions

- Read existing theme state only if already safe and accessible
- Use existing theme state for display text only if safe

### Forbidden Theme Interactions

- Mutating theme presets
- Writing to theme override storage
- Creating custom graph theme state
- Changing theme configuration

## Storage / Persistence Boundary

### No Persistence in v56

Graph Shell Theme Evidence Application must not persist state.

### Boundary Rules

- No localStorage usage
- No sessionStorage usage
- No database storage
- No file storage
- No URL state persistence
- Application evidence state resets on page refresh

### Allowed Storage Interactions

- None in v56

### Forbidden Storage Interactions

- localStorage
- sessionStorage
- IndexedDB
- File system
- URL state
- Any persistence mechanism

## Command / Hotkey Boundary

### No Command Execution in v56

Graph Shell Theme Evidence Application must not add or execute commands.

### Boundary Rules

- No Command Deck command registration
- No slash command registration
- No command palette actions
- No command execution

### Allowed Command Interactions

- None in v56

### Forbidden Command Interactions

- Registering graph theme mutation commands
- Executing graph theme mutation commands
- Adding command palette actions

### No Hotkeys in v56

Graph Shell Theme Evidence Application must not add hotkeys or listeners.

### Boundary Rules

- No global hotkey registration
- No keyboard listener addition
- No keyboard shortcut for application toggling
- No keyboard interaction

### Allowed Hotkey Interactions

- None in v56

### Forbidden Hotkey Interactions

- Adding hotkeys that trigger graph theme mutation
- Adding keyboard shortcuts for theme changes
- Adding global hotkeys for graph controls
- Banned hotkeys (Ctrl+Alt+T, Alt+F8)

## Reversibility Requirements

### User Control

Graph Shell Theme Evidence Application must be reversible by user action:
- Toggle button must be visible and active
- Clicking toggle must change state
- Clicking toggle again must reverse state
- State must be visibly indicated

### Default State

- Default state is inactive/off
- User must explicitly activate to see application evidence
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

- Application changes should be announced
- Current state should be visible in text
- Toggle control should have clear label
- Metadata should be visible as text

## Playwright Evidence Requirements

### Evidence Paths

Preferred evidence paths for v56 acceptance:

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

### v56 Evidence Requirements

For v56 Graph Shell Theme Evidence Application acceptance, Playwright must prove:
- Theme application toggle is visible and active
- Default theme application status is inactive
- Clicking toggle changes status to active
- Graph shell/wrapper receives visible/testable theme application state (data attribute)
- Clicking again returns status to inactive
- Canonical token path metadata is visible as metadata/readout
- No token values are applied/resolved
- No CSS variables are written by this feature
- No theme preset or override storage is mutated
- Graph surface still mounts
- No Sigma/renderer/node/edge/canvas/physics/camera/filter controls are introduced
- No skipped tests
- Controls are genuinely active (not dead)

## v56 Preconditions

Before v56 Graph Shell Theme Evidence Application implementation can begin, the following must be true:

1. **v55 Contract Accepted**: GRAPH_THEME_APPLICATION_CONTRACT.md is accepted and committed
2. **v55 Commit Clean**: Post-commit git status is clean
3. **v54 Token Value Preview Accepted**: Read-Only Graph Theme Token Preview is accepted (from previous pass)
4. **v53 Token Value Preview Contract Accepted**: GRAPH_THEME_TOKEN_VALUE_PREVIEW_CONTRACT.md is accepted (from previous pass)
5. **v52 Evidence Wrapper Accepted**: Graph Theme Evidence Wrapper Mode is accepted (from previous pass)
6. **v51 Runtime Application Contract Accepted**: GRAPH_THEME_RUNTIME_APPLICATION_CONTRACT.md is accepted (from previous pass)
7. **v50 Passive Inventory Accepted**: Graph Theme Mapping Inventory is accepted (from previous pass)
8. **Typecheck Passes**: npm run typecheck passes with zero errors
9. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
10. **No Skipped Tests**: grep -R "test.skip" returns no results
11. **No Banned Hotkeys**: grep for banned hotkeys returns no results in code
12. **No DevTools Wording**: grep for DevTools wording returns no results in docs
13. **DOM-Only Scope Confirmed**: v56 can remain DOM-wrapper level state only
14. **No Sigma/Node/Edge Required**: No Sigma/renderer/node/edge/canvas behavior is required for v56
15. **No CSS Variable Writes Required**: No CSS variable writes are required for v56
16. **Gate Conditions Met**: All v55 → v56 gate conditions are satisfied

If any precondition fails, v56 must not proceed. Stop and report.

## v57+ Promotion Path

### Promotion Process

To promote from v56 (DOM-only wrapper application) to v57+ (true Sigma/node/edge theme application), the following process must be followed:

1. **Specific Runtime Contract**: Create specific contract for true graph theme value application
2. **Advisory Discussion**: Advisory questions for true theme value application are discussed and answered
3. **QA Checklist**: QA checklist items for true theme value application are defined and verified
4. **Playwright Evidence**: Playwright tests prove true theme value application is safe and correct
5. **Backlog Clearance**: No blocking backlog items exist
6. **Acceptance**: True theme value application is accepted via QA report
7. **Implementation**: True theme value application is implemented according to contract
8. **Validation**: Typecheck and Playwright validation pass
9. **Commit**: True theme value application is committed with appropriate message
10. **Post-Commit Verification**: Git status is clean and tests still pass

### Promotion Criteria

True graph theme value application can be promoted when:
- The specific runtime contract is accepted
- True theme value application has explicit advisory approval
- True theme value application has Playwright evidence
- True theme value application does not break existing contracts
- True theme value application does not break existing tests
- True theme value application has no skipped tests
- True theme value application has no banned hotkeys
- True theme value application has no DevTools wording in docs

### Forbidden Promotion Paths

The following promotion paths are forbidden:
- Promoting without specific contract acceptance
- Promoting without Playwright evidence
- Promoting with skipped tests
- Promoting with banned hotkeys
- Promoting that breaks existing contracts
- Promoting that breaks existing tests
- Promoting that requires DevTools manual steps

### v57 Candidate Categories

Potential v57+ runtime application categories (all require explicit new contracts):
- True Sigma renderer theme value application (apply token values to Sigma settings)
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
3. **Token Value Application Attempted**: Any code attempts to resolve or apply token values
4. **CSS Variable Write Attempted**: Any code attempts to write CSS variables
5. **Storage Addition Attempted**: Any code attempts to add storage/persistence
6. **Hotkey Addition Attempted**: Any code attempts to add new hotkeys/listeners
7. **Command Execution Attempted**: Any code attempts to execute graph theme commands
8. **Test Skip Attempted**: Any test is marked as skipped
9. **DevTools Wording Found**: Any doc requires manual DevTools steps for acceptance
10. **Banned Hotkey Found**: Any code uses banned hotkeys (e.g., Ctrl+Alt+T)
11. **Dead Control Found**: Any control is added but does not visibly change behavior
12. **Theme Preset Mutation Attempted**: Any code attempts to mutate theme presets
13. **Theme Override Storage Write Attempted**: Any code attempts to write to theme override storage

### Stop and Report Conditions

Work must stop and produce a Quest Mode Situation Report if:

1. **Typecheck Fails**: npm run typecheck returns errors
2. **Playwright Fails**: npm run qa:e2e returns failures
3. **Skipped Tests Found**: grep -R "test.skip" returns results
4. **Git Status Dirty**: git status --short shows uncommitted changes during validation
5. **Gate Condition Fails**: Any v55 → v56 gate condition fails
6. **Contract Violation**: Implementation violates contract requirements
7. **Boundary Crossing**: Implementation crosses forbidden boundary
8. **Evidence Missing**: Required Playwright evidence is missing

## Acceptance Criteria

### v55 Acceptance Criteria

v55 (Graph Theme Application Contract) is accepted when:

1. **Contract Document Exists**: docs/graph/GRAPH_THEME_APPLICATION_CONTRACT.md exists with all 20 required sections
2. **Contract is Complete**: All required sections are filled with meaningful content
3. **Contract is Consistent**: Contract is consistent with GRAPH_THEME_TOKEN_VALUE_PREVIEW_CONTRACT.md
4. **Contract is Consistent**: Contract is consistent with GRAPH_THEME_RUNTIME_APPLICATION_CONTRACT.md
5. **Contract is Consistent**: Contract is consistent with GRAPH_VISUAL_THEME_MAPPING_CONTRACT.md
6. **Contract is Consistent**: Contract is consistent with GRAPH_RUNTIME_BOUNDARY_CONTRACT.md
7. **Application Model Defined**: Graph Theme Application model is clearly defined
8. **First Candidate Defined**: Graph Shell Theme Evidence Application is clearly defined as v56 candidate
9. **Allowed Boundary Clear**: Allowed application boundary is clearly defined
10. **Forbidden Sigma Boundary Clear**: Forbidden Sigma/renderer boundary is clearly defined
11. **Forbidden Node/Edge/Canvas Boundary Clear**: Forbidden node/edge/canvas boundary is clearly defined
12. **Forbidden Token Value Application Boundary Clear**: Token value application boundary is explicitly forbidden
13. **CSS Variable Boundary Clear**: CSS variable write boundary is explicitly forbidden
14. **Theme Preset/Override Boundary Clear**: Theme preset/override mutation is explicitly forbidden
15. **Storage Boundary Clear**: No persistence is explicitly required
16. **Command/Hotkey Boundary Clear**: No command execution or hotkeys are explicitly required
17. **Reversibility Requirements**: Reversibility requirements are defined
18. **Accessibility Requirements**: Accessibility requirements are defined
19. **Playwright Evidence Requirements**: Playwright evidence requirements are defined
20. **v56 Preconditions**: v56 preconditions are clear and testable
21. **v57+ Promotion Path**: v57+ promotion path is defined
22. **Stop Conditions**: Stop conditions are clearly defined
23. **QA Updated**: QA/advisory/backlog are updated for v55
24. **Typecheck Passes**: npm run typecheck passes with zero errors
25. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
26. **No Skipped Tests**: grep -R "test.skip" returns no results
27. **Commit Clean**: Post-commit git status is clean

### v56 Acceptance Criteria

v56 (Graph Shell Theme Evidence Application) is accepted when:

1. **v55 Gate Conditions Met**: All v55 → v56 gate conditions are satisfied
2. **Contract Respected**: Implementation respects GRAPH_THEME_APPLICATION_CONTRACT.md
3. **DOM-Wrapper Only**: Implementation is DOM-wrapper level state only
4. **No Sigma Mutation**: No Sigma/renderer mutation occurs
5. **No Node/Edge Change**: No node/edge/canvas style changes occur
6. **No Token Value Application**: No token values are resolved or applied
7. **No CSS Variable Writes**: No CSS variables are written
8. **No Theme Preset Mutation**: No theme preset mutation occurs
9. **No Theme Override Storage Writes**: No theme override storage writes occur
10. **No Storage**: No storage/persistence is added
11. **No Hotkeys**: No new hotkeys/listeners are added
12. **No Commands**: No command execution is added
13. **Toggle Active**: Toggle control is genuinely active and changes state
14. **Default Inactive**: Default state is inactive
15. **Reversible**: Toggle reverses state on second click
16. **DOM Attribute Visible**: Graph shell/wrapper receives visible/testable data attribute
17. **Metadata Visible**: Canonical token path metadata is visible as readout
18. **Graph Surface Mounts**: Graph surface still mounts and is visible
19. **Existing Inventory Works**: Existing graph inventory/probe/detail mode/theme mapping/evidence wrapper mode/token preview still works
20. **No Skipped Tests**: No tests are skipped
21. **Playwright Proves Behavior**: Playwright tests prove DOM-wrapper level evidence behavior
22. **Typecheck Passes**: npm run typecheck passes with zero errors
23. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
24. **QA Updated**: QA/advisory/backlog are updated for v56
25. **Commit Clean**: Post-commit git status is clean
