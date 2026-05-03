# Graph Theme Token Value Preview Contract

## Status

v53 planning contract. Docs-only governance before read-only graph theme token value preview implementation.

## Purpose

Define how canonical graph theme mapping token values may be safely previewed without applying them to graph runtime behavior.

This contract establishes:
- What constitutes Graph Theme Token Value Preview
- The relationship between token path metadata (v52) and token value preview (v54)
- The allowed preview boundary for v54
- Forbidden token application boundaries
- Sigma/renderer non-mutation guarantee
- Node/edge/canvas non-mutation guarantee
- CSS variable non-mutation guarantee
- Storage/persistence boundary
- Command/hotkey boundary
- Accessibility requirements
- Playwright evidence requirements
- v54 preconditions
- v55+ promotion path
- Stop conditions
- Acceptance criteria

This contract does not implement runtime behavior. It defines the rules for v54 implementation.

## Definitions

### Graph Theme Token Value Preview

A read-only UI display that shows canonical theme token paths and their currently resolved display/value information for mapped graph visual elements. It displays what the token values are, but does not apply those values to graph runtime behavior.

### Token Value Preview vs Token Path Metadata

- **Token Path Metadata (v52)**: Shows canonical token path strings only (e.g., "panel.border", "graph.node.fill"). Does not resolve or display actual values.
- **Token Value Preview (v54)**: Shows canonical token paths AND their resolved display values (e.g., "panel.border: #ccc", "graph.node.fill: #3b82f6"). Still does not apply values to graph.

### Read-Only Preview

A UI display that shows information without allowing mutation. Read-only preview has no enabled apply/edit/save controls and does not trigger any runtime changes.

## Non-Goals

This contract does not:
- Implement the Token Value Preview UI (that is v54)
- Apply token values to Sigma renderer
- Change graph node/edge/canvas styles
- Apply theme token values to graph runtime
- Write CSS variables
- Mutate theme presets
- Add storage/persistence
- Add hotkeys/listeners
- Add command execution
- Promote any token application beyond read-only preview

## Graph Theme Token Value Preview Model

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
v55+: True Token Value Application (apply values to graph, requires new contract)
```

### v53 Role

v53 is the contract definition pass that:
- Defines what token value preview means
- Distinguishes token path metadata from token value preview
- Defines the allowed preview boundary for v54
- Defines all forbidden boundaries that remain locked until v55+
- Establishes CSS variable write boundary
- Establishes storage/persistence boundary
- Establishes command/hotkey boundary

### v54 Role

v54 is the implementation pass that:
- Implements read-only token value preview UI only
- Displays resolved token values as text only
- Does not apply values to Sigma/renderer
- Does not apply values to node/edge/canvas
- Does not write CSS variables
- Does not add storage/persistence

## Token Path vs Token Value Boundary

This is a critical boundary for v53/v54.

### Token Path (v52, Already Implemented)

Canonical theme token paths are allowed as metadata/readout:
- Display token paths like "panel.border", "graph.node.fill"
- Use token paths as string identifiers for governance
- Show token paths in UI as readout text
- Reference token paths from THEME_TOKEN_PATH_MAP.md

### Token Value (v54, New Capability)

Token value resolution and display is allowed in v54, but with strict limits:
- Display resolved token values as read-only text (e.g., "#ccc", "#3b82f6")
- Use existing safe resolver from themeTokenPaths.ts if available
- Show "metadata only" / "value preview deferred" if no safe resolver exists
- Values are display-only, for inspection purposes

### Token Value Application (Forbidden Until v55+)

Applying token values to graph runtime is forbidden in v53/v54:
- Do not apply token values to Sigma renderer
- Do not apply token values to node/edge styles
- Do not apply token values to CSS variables
- Do not apply token values to canvas
- Do not trigger graph re-rendering based on token values

### Boundary Rules

- Token paths (v52): metadata only, display as strings
- Token values (v54): read-only display if safe resolver exists
- Token application (v55+): forbidden until explicit new contract
- v53/v54 operates on display only, not runtime application

## Allowed Preview Boundary

### What is Allowed in v54

- Read-only display of resolved token values as text
- Use existing themeTokenPaths.ts resolver if safe and accessible
- Display "metadata only" if resolver is not safe or accessible
- Display token path + value pairs in inventory UI
- No enabled controls for apply/edit/save
- Text-only display, no color swatches or live previews that mutate DOM

### What is Forbidden in v54

- Token value application to Sigma/renderer
- Token value application to node/edge/canvas
- CSS variable writes
- Renderer settings changes
- Node/edge style changes
- Camera/filter behavior changes
- Storage/persistence
- Hotkey/listener addition
- Command execution
- Enabled apply/edit/save controls
- Live color swatches that trigger DOM changes

## Forbidden Sigma / Renderer Boundary

The Sigma renderer remains a black box for v54. Token Value Preview does not access or mutate Sigma internals.

### Boundary Rules

- No Sigma instance access from Token Value Preview
- No Sigma API calls from Token Value Preview
- No renderer settings changes from Token Value Preview
- Display-only text, no canvas interaction
- Playwright tests observe DOM-visible text, not canvas states

### Allowed Sigma Interactions

- None in v54

### Forbidden Sigma Interactions

- Calling Sigma API methods
- Changing Sigma renderer settings
- Modifying Sigma event handlers
- Changing Sigma renderer options
- Accessing Sigma private/internal APIs
- Inspecting Sigma canvas pixel data

## Forbidden Node / Edge / Canvas Boundary

Graph node/edge/canvas styling remains protected in v54. Token Value Preview does not change node/edge/canvas styles.

### Boundary Rules

- Node/edge/canvas parameters are read-only in v54
- No node/edge style changes from Token Value Preview
- No canvas style changes from Token Value Preview
- Display-only text, no canvas interaction

### Allowed Node/Edge/Canvas Interactions

- None in v54

### Forbidden Node/Edge/Canvas Interactions

- Changing node colors
- Changing edge colors
- Changing node shapes
- Changing edge styles
- Changing label visibility
- Changing canvas rendering properties
- Changing any node/edge/canvas visual properties

## CSS Variable Boundary

CSS variable writing is forbidden in v53/v54. Token Value Preview displays values as text only, not as CSS variables.

### Boundary Rules

- No CSS variable writes from Token Value Preview
- No DOM style.setProperty() calls
- No stylesheet mutations
- Display values as text content, not as CSS

### Allowed CSS Interactions

- None in v54

### Forbidden CSS Interactions

- Writing CSS variables
- Setting DOM element styles via style properties
- Mutating stylesheets
- Any CSS state changes

## Storage / Persistence Boundary

### No Persistence in v54

Token Value Preview must not persist state.

### Boundary Rules

- No localStorage usage
- No sessionStorage usage
- No database storage
- No file storage
- No URL state persistence
- Preview state resets on page refresh

### Allowed Storage Interactions

- None in v54

### Forbidden Storage Interactions

- localStorage
- sessionStorage
- IndexedDB
- File system
- URL state
- Any persistence mechanism

## Command / Hotkey Boundary

### No Command Execution in v54

Token Value Preview must not add or execute commands.

### Boundary Rules

- No Command Deck command registration
- No slash command registration
- No command palette actions
- No command execution

### Allowed Command Interactions

- None in v54

### Forbidden Command Interactions

- Registering graph theme mutation commands
- Executing graph theme mutation commands
- Adding command palette actions

### No Hotkeys in v54

Token Value Preview must not add hotkeys or listeners.

### Boundary Rules

- No global hotkey registration
- No keyboard listener addition
- No keyboard shortcut for preview toggling
- No keyboard interaction

### Allowed Hotkey Interactions

- None in v54

### Forbidden Hotkey Interactions

- Adding hotkeys that trigger graph theme mutation
- Adding keyboard shortcuts for theme changes
- Adding global hotkeys for graph controls
- Banned hotkeys (Ctrl+Alt+T, Alt+F8)

## Accessibility Requirements

### Required Attributes

- Preview display: Visible text for screen readers
- Token path display: Visible text for screen readers
- Token value display: Visible text for screen readers
- Status indicators: ARIA labels for preview status
- Keyboard navigation: Tab navigable if interactive elements exist

### Keyboard Navigation

- If any interactive elements exist: Tab navigable
- No keyboard traps

### Screen Reader Support

- Token paths should be announced
- Token values should be visible in text
- Preview status should have clear labels

## Playwright Evidence Requirements

### Evidence Paths

Preferred evidence paths for v54 acceptance:

1. **Playwright assertions** – e2e specs that verify preview display is visible and read-only
2. **Visible manual app behavior** – Direct UI observation of preview text
3. **Typecheck/build output** – typecheck, lint, and build artifacts for infra checks
4. **Git diff / file inspection** – Structural verifications tied to acceptance notes

### Forbidden Evidence Paths

- Manual DevTools JavaScript execution
- Manual inspection of JS arrays or objects
- "Trust me, I read the code"
- Skipping tests
- Changing tests to fit broken behavior

### v54 Evidence Requirements

For v54 Token Value Preview acceptance, Playwright must prove:
- Token value preview section is visible
- Token paths are visible
- Token values are visible (if safe resolver exists) OR "metadata only" is shown (if no safe resolver)
- Preview is read-only/passive
- No apply/edit/save controls exist
- No CSS variables are written by this feature
- No Sigma/renderer/node/edge/canvas/physics/camera/filter controls are introduced
- Graph surface still mounts
- Existing inventory/probe/detail mode/theme mapping/evidence wrapper mode still works
- No skipped tests

## v54 Preconditions

Before v54 Token Value Preview implementation can begin, the following must be true:

1. **v53 Contract Accepted**: GRAPH_THEME_TOKEN_VALUE_PREVIEW_CONTRACT.md is accepted and committed
2. **v53 Commit Clean**: Post-commit git status is clean
3. **v52 Evidence Wrapper Accepted**: Graph Theme Evidence Wrapper Mode is accepted (from previous pass)
4. **v51 Runtime Application Contract Accepted**: GRAPH_THEME_RUNTIME_APPLICATION_CONTRACT.md is accepted (from previous pass)
5. **v50 Passive Inventory Accepted**: Graph Theme Mapping Inventory is accepted (from previous pass)
6. **Typecheck Passes**: npm run typecheck passes with zero errors
7. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
8. **No Skipped Tests**: grep -R "test.skip" returns no results
9. **No Banned Hotkeys**: grep for banned hotkeys returns no results in code
10. **No DevTools Wording**: grep for DevTools wording returns no results in docs
11. **Read-Only Scope Confirmed**: v54 can remain read-only/passive display
12. **No Sigma/Node/Edge Required**: No Sigma/renderer/node/edge/canvas behavior is required for v54
13. **No CSS Variable Writes Required**: No CSS variable writes are required for v54
14. **Gate Conditions Met**: All v53 → v54 gate conditions are satisfied

If any precondition fails, v54 must not proceed. Stop and report.

## v55+ Promotion Path

### Promotion Process

To promote from v54 (read-only token value preview) to v55+ (true token value application), the following process must be followed:

1. **Specific Runtime Contract**: Create specific contract for true token value application
2. **Advisory Discussion**: Advisory questions for true token application are discussed and answered
3. **QA Checklist**: QA checklist items for true token application are defined and verified
4. **Playwright Evidence**: Playwright tests prove true token application is safe and correct
5. **Backlog Clearance**: No blocking backlog items exist
6. **Acceptance**: True token application is accepted via QA report
7. **Implementation**: True token application is implemented according to contract
8. **Validation**: Typecheck and Playwright validation pass
9. **Commit**: True token application is committed with appropriate message
10. **Post-Commit Verification**: Git status is clean and tests still pass

### Promotion Criteria

True token value application can be promoted when:
- The specific runtime contract is accepted
- True token application has explicit advisory approval
- True token application has Playwright evidence
- True token application does not break existing contracts
- True token application does not break existing tests
- True token application has no skipped tests
- True token application has no banned hotkeys
- True token application has no DevTools wording in docs

### Forbidden Promotion Paths

The following promotion paths are forbidden:
- Promoting without specific contract acceptance
- Promoting without Playwright evidence
- Promoting with skipped tests
- Promoting with banned hotkeys
- Promoting that breaks existing contracts
- Promoting that breaks existing tests
- Promoting that requires DevTools manual steps

### v55 Candidate Categories

Potential v55+ runtime application categories (all require explicit new contracts):
- Sigma renderer theme application (apply token values to Sigma settings)
- Node/edge styling via theme (apply token values to node/edge styles)
- Canvas rendering via theme (apply token values to canvas)
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
11. **Enabled Control Found**: Any apply/edit/save control is added

### Stop and Report Conditions

Work must stop and produce a Quest Mode Situation Report if:

1. **Typecheck Fails**: npm run typecheck returns errors
2. **Playwright Fails**: npm run qa:e2e returns failures
3. **Skipped Tests Found**: grep -R "test.skip" returns results
4. **Git Status Dirty**: git status --short shows uncommitted changes during validation
5. **Gate Condition Fails**: Any v53 → v54 gate condition fails
6. **Contract Violation**: Implementation violates contract requirements
7. **Boundary Crossing**: Implementation crosses forbidden boundary
8. **Evidence Missing**: Required Playwright evidence is missing

## Acceptance Criteria

### v53 Acceptance Criteria

v53 (Graph Theme Token Value Preview Contract) is accepted when:

1. **Contract Document Exists**: docs/graph/GRAPH_THEME_TOKEN_VALUE_PREVIEW_CONTRACT.md exists with all 19 required sections
2. **Contract is Complete**: All required sections are filled with meaningful content
3. **Contract is Consistent**: Contract is consistent with GRAPH_THEME_RUNTIME_APPLICATION_CONTRACT.md
4. **Contract is Consistent**: Contract is consistent with GRAPH_VISUAL_THEME_MAPPING_CONTRACT.md
5. **Contract is Consistent**: Contract is consistent with GRAPH_RUNTIME_BOUNDARY_CONTRACT.md
6. **Preview Model Defined**: Token Value Preview model is clearly defined
7. **Path vs Value Boundary Clear**: Token path vs token value boundary is explicitly defined
8. **Allowed Boundary Clear**: Allowed preview boundary is clearly defined
9. **Forbidden Sigma Boundary Clear**: Forbidden Sigma/renderer boundary is clearly defined
10. **Forbidden Node/Edge/Canvas Boundary Clear**: Forbidden node/edge/canvas boundary is clearly defined
11. **CSS Variable Boundary Clear**: CSS variable write boundary is explicitly forbidden
12. **Storage Boundary Clear**: No persistence is explicitly required
13. **Command/Hotkey Boundary Clear**: No command execution or hotkeys are explicitly required
14. **Accessibility Requirements**: Accessibility requirements are defined
15. **Playwright Evidence Requirements**: Playwright evidence requirements are defined
16. **v54 Preconditions**: v54 preconditions are clear and testable
17. **v55+ Promotion Path**: v55+ promotion path is defined
18. **Stop Conditions**: Stop conditions are clearly defined
19. **QA Updated**: QA/advisory/backlog are updated for v53
20. **Typecheck Passes**: npm run typecheck passes with zero errors
21. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
22. **No Skipped Tests**: grep -R "test.skip" returns no results
23. **Commit Clean**: Post-commit git status is clean

### v54 Acceptance Criteria

v54 (Read-Only Graph Theme Token Preview) is accepted when:

1. **v53 Gate Conditions Met**: All v53 → v54 gate conditions are satisfied
2. **Contract Respected**: Implementation respects GRAPH_THEME_TOKEN_VALUE_PREVIEW_CONTRACT.md
3. **Read-Only Only**: Implementation is read-only/passive display
4. **No Sigma Mutation**: No Sigma/renderer mutation occurs
5. **No Node/Edge Change**: No node/edge/canvas style changes occur
6. **No Token Application**: No token values are applied to graph runtime
7. **No CSS Variable Writes**: No CSS variables are written
8. **No Storage**: No storage/persistence is added
9. **No Hotkeys**: No new hotkeys/listeners are added
10. **No Commands**: No command execution is added
11. **Preview Visible**: Token value preview section is visible
12. **Token Paths Visible**: Canonical token paths are visible
13. **Token Values Visible**: Token values are visible (if safe) OR "metadata only" (if not safe)
14. **No Apply Controls**: No enabled apply/edit/save controls exist
15. **Graph Surface Mounts**: Graph surface still mounts and is visible
16. **Existing Inventory Works**: Existing graph inventory/probe/detail mode/theme mapping/evidence wrapper mode still works
17. **No Skipped Tests**: No tests are skipped
18. **Playwright Proves Behavior**: Playwright tests prove read-only preview behavior
19. **Typecheck Passes**: npm run typecheck passes with zero errors
20. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
21. **QA Updated**: QA/advisory/backlog are updated for v54
22. **Commit Clean**: Post-commit git status is clean
