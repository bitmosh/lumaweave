# Graph Visual Theme Mapping Contract

## Status

v49 planning contract. Docs-only governance before passive graph theme mapping inventory implementation.

## Purpose

Define the governance model for how graph visual elements may relate to theme tokens without mutating Sigma renderer or graph styles yet.

This contract establishes:
- What constitutes Graph Visual Theme Mapping
- The relationship between graph visual elements and canonical theme tokens
- Eligible graph visual elements for theme mapping
- Eligible theme token paths (canonical only)
- Passive mapping boundary (metadata only, no runtime application)
- Runtime application boundary (forbidden until v51+)
- Sigma/renderer non-mutation guarantee
- Node/edge styling non-mutation guarantee
- Theme Target relationship
- Perspective relationship
- Command Deck relationship
- Accessibility requirements
- Playwright evidence requirements
- v50 preconditions
- v51+ promotion path
- Stop conditions
- Acceptance criteria

This contract does not implement runtime behavior. It defines the rules for v50 passive inventory implementation.

## Definitions

### Graph Visual Theme Mapping

A governance relationship between graph visual element IDs and canonical theme token paths. In v49/v50, it is passive metadata only. It defines which graph visual elements are intended to map to which theme tokens for future theme application, but does not apply styles at runtime.

### Graph Theme Mapping Registry

A typed/static inventory of graph visual element IDs and their intended canonical theme token relationships. In v50, it must not apply styles to Sigma, canvas, nodes, edges, or physics. It is read-only evidence for inspection only.

### Canonical Theme Token Path

A theme token path that is defined in the canonical token source of truth (THEME_TOKEN_PATH_MAP.md and themeTokenPaths.ts). Only canonical tokens are eligible for graph visual theme mapping. Planned or hypothetical tokens are forbidden.

## Non-Goals

This contract does not:
- Implement the Graph Theme Mapping Registry (that is v50)
- Add Sigma renderer mutation
- Change graph node/edge styles
- Apply graph theme changes at runtime
- Change graph physics/layout/camera/filter behavior
- Add storage/persistence
- Add active graph theme controls
- Add new hotkeys
- Add command execution
- Promote any runtime graph theme application to v49/v50

## Graph Visual Theme Mapping Model

The model is a static typed relationship:

```
graphVisualElementId → canonicalThemeTokenPath
```

Where:
- `graphVisualElementId` is a stable ID from the Graph View Element Registry
- `canonicalThemeTokenPath` is a canonical token path from THEME_TOKEN_PATH_MAP.md

This relationship is:
- **Governance metadata**: Documents intended theme relationships
- **Passive**: Does not apply styles at runtime
- **Typed**: Has TypeScript type definitions
- **Static**: Does not change at runtime
- **Read-only**: v50 inventory displays but does not edit

## Graph Element To Theme Token Relationship

The relationship is one-to-many or one-to-one:

- One graph visual element may map to multiple theme tokens (e.g., graph.frame → panel.border, panel.background)
- One theme token may be referenced by multiple graph visual elements
- The relationship is directional: graph element → theme token (not reverse)

The relationship does not:
- Apply styles automatically
- React to theme changes at runtime
- Mutate Sigma renderer settings
- Change node/edge visual properties

## Eligible Graph Visual Elements

Eligible graph visual elements are those defined in the Graph View Element Registry (GRAPH_VIEW_ELEMENT_REGISTRY_CONTRACT.md) that have visual rendering properties.

Examples of eligible elements:
- graph.frame (container frame/border)
- graph.surface (background surface)
- graph.nodes (node fill, stroke, size)
- graph.edges (edge stroke, width)
- graph.labels (label text, color)
- graph.hud (overlay UI)
- graph.controls (control panel)

Elements that are not eligible:
- Elements without visual rendering properties
- Elements that are purely structural
- Elements that are marked as "locked" or "future" in the registry

## Eligible Theme Token Paths

Eligible theme token paths are canonical tokens from:

- `docs/theme-system/THEME_TOKEN_PATH_MAP.md`
- `src/themes/themeTokenPaths.ts`

Eligible token categories:
- panel.border, panel.background
- app.background
- graph.node.fill, graph.node.stroke
- graph.edge.stroke, graph.edge.width
- text.primary, text.secondary
- effects.glow.intensity

Forbidden tokens:
- Planned tokens not yet in canonical sources
- Hypothetical tokens invented for mapping
- Tokens marked as "planned" in THEME_TOKEN_PATH_MAP.md
- Non-canonical token paths

## Canonical Token Source Of Truth

The canonical source of truth for theme token paths is:

1. **THEME_TOKEN_PATH_MAP.md** - Defines all canonical theme token paths and their categories
2. **themeTokenPaths.ts** - TypeScript type definitions for canonical token paths

When creating graph theme mapping entries:
- Verify the token path exists in THEME_TOKEN_PATH_MAP.md
- Verify the token path is not marked as "planned"
- Use the exact token path string from the canonical source
- Do not invent new token paths

## Passive Mapping Boundary

In v49/v50, the mapping boundary is passive:

- **Allowed**: Creating static typed mapping metadata
- **Allowed**: Displaying mapping relationships in inventory UI
- **Allowed**: Inspecting mapping relationships for governance
- **Forbidden**: Applying theme tokens to graph at runtime
- **Forbidden**: Reacting to theme changes
- **Forbidden**: Mutating Sigma renderer based on mappings
- **Forbidden**: Changing node/edge styles based on mappings

The mapping is governance documentation, not runtime behavior.

## Runtime Application Boundary

Runtime graph theme application is forbidden in v49/v50:

- **Forbidden**: Applying theme tokens to graph renderer at runtime
- **Forbidden**: Changing Sigma configuration based on theme
- **Forbidden**: Updating node/edge styles when theme changes
- **Forbidden**: Listening to theme change events and mutating graph
- **Forbidden**: Any automatic graph theme application

Runtime application requires v51+ explicit promotion and separate contract.

## Sigma / Renderer Boundary

The Sigma renderer remains a black box for v49/v50:

- **No Sigma instance access** from Graph Theme Mapping Registry
- **No Sigma API calls** from Graph Theme Mapping Registry
- **No renderer settings changes** based on mappings
- **No canvas interaction** from mapping relationships
- **Playwright tests observe DOM-visible metadata, not canvas states**

### Allowed Sigma Interactions

- None in v49/v50

### Forbidden Sigma Interactions

- Calling Sigma API methods
- Changing Sigma renderer settings
- Modifying Sigma event handlers
- Accessing Sigma private/internal APIs
- Inspecting Sigma canvas pixel data

## Node / Edge Styling Boundary

Graph node/edge styling remains protected in v49/v50:

- **Node/edge parameters are read-only** in v49/v50
- **No node/edge style changes** from Graph Theme Mapping Registry
- **No style recalculation** based on mappings
- **Metadata display only**, no style interaction

### Allowed Node/Edge Interactions

- None in v49/v50

### Forbidden Node/Edge Interactions

- Changing node colors
- Changing edge colors
- Changing node shapes
- Changing edge styles
- Changing label visibility
- Changing any node/edge visual properties

## Theme Target Relationship

Graph Visual Theme Mapping is separate from but related to Theme Target Registry:

- **Theme Target Registry**: Maps DOM elements to theme tokens for theme editing UI
- **Graph Theme Mapping**: Maps graph visual elements to theme tokens for governance

The relationship:
- Graph Theme Mapping may reference the same canonical tokens as Theme Target Registry
- Graph Theme Mapping does not use Theme Target Registry infrastructure
- Graph Theme Mapping is graph-specific governance
- Theme Target Registry is DOM-specific infrastructure

## Perspective Relationship

Graph Theme Mapping is independent of Perspective System:

- **No perspective-specific mappings** in v49/v50
- **Mappings apply to graph elements regardless of perspective**
- **Perspective System does not consume Graph Theme Mapping** in v49/v50

Future v51+ may explore perspective-specific graph theme variations, but this requires explicit promotion.

## Command Deck Relationship

Graph Theme Mapping must not add or execute commands in v49/v50:

- **No Command Deck command registration** for graph theme application
- **No slash command registration** for graph theme changes
- **No command palette actions** for graph theme mapping
- **No command execution** based on mappings

### Allowed Command Interactions

- None in v49/v50

### Forbidden Command Interactions

- Registering graph theme mutation commands
- Executing graph theme mutation commands
- Adding command palette actions for graph theme

## Hotkey Boundary

Graph Theme Mapping must not add hotkeys or listeners in v49/v50:

- **No global hotkey registration** for graph theme switching
- **No keyboard listener addition** for graph theme changes
- **No keyboard shortcut** for mapping activation
- **No keyboard interaction** with mapping registry

### Allowed Hotkey Interactions

- None in v49/v50

### Forbidden Hotkey Interactions

- Adding hotkeys that trigger graph theme mutation
- Adding keyboard shortcuts for graph theme changes
- Adding global hotkeys for graph controls
- Banned hotkeys (Ctrl+Alt+T, Alt+F8)

## Accessibility Requirements

### Required Attributes

- Mapping inventory rows: `data-testid` attributes for Playwright testing
- Token path display: Visible text for screen readers
- Status indicators: ARIA labels for mapping status
- Keyboard navigation: Tab navigable inventory rows

### Keyboard Navigation

- Inventory: Tab navigable
- Rows: Arrow key navigation if supported
- No keyboard traps

### Screen Reader Support

- Mapping relationships should be announced
- Token paths should be visible in text
- Status should have clear labels

## Playwright Evidence Requirements

### Evidence Paths

Preferred evidence paths for v49 acceptance:

1. **Playwright assertions** – e2e specs that verify contract structure (for v50)
2. **Visible manual app behavior** – Direct UI observation of inventory (for v50)
3. **Typecheck/build output** – typecheck, lint, and build artifacts for infra checks
4. **Git diff / file inspection** – Structural verifications tied to acceptance notes

### Forbidden Evidence Paths

- Manual DevTools JavaScript execution
- Manual inspection of JS arrays or objects
- "Trust me, I read the code"
- Skipping tests
- Changing tests to fit broken behavior

### v49 Evidence Requirements

For v49 Graph Visual Theme Mapping Contract acceptance:

- Contract document exists with all 22 required sections
- Contract is complete with meaningful content
- Contract is consistent with GRAPH_RUNTIME_BOUNDARY_CONTRACT.md
- Contract is consistent with FIRST_GRAPH_RUNTIME_MUTATION_CONTRACT.md
- Graph Visual Theme Mapping is clearly defined
- Eligible elements are clearly defined
- Eligible tokens are clearly defined (canonical only)
- Forbidden mutation boundaries are clearly defined
- Sigma non-mutation guarantee is explicit
- Node/edge styling non-mutation guarantee is explicit
- Runtime application boundary is explicit
- v50 preconditions are clear and testable
- v51+ promotion path is defined
- Stop conditions are clearly defined
- Typecheck passes with zero errors
- Playwright passes with zero failures and zero skips
- No skipped tests exist
- QA/advisory/backlog are updated for v49
- Post-commit git status is clean

## v50 Preconditions

Before v50 Graph Theme Mapping Registry implementation can begin, the following must be true:

1. **v49 Contract Accepted**: GRAPH_VISUAL_THEME_MAPPING_CONTRACT.md is accepted and committed
2. **v49 Commit Clean**: Post-commit git status is clean
3. **v45 Contract Accepted**: GRAPH_RUNTIME_BOUNDARY_CONTRACT.md is accepted (from previous pass)
4. **v48 Safe Mutation Accepted**: FIRST_GRAPH_RUNTIME_MUTATION_CONTRACT.md and v48 implementation are accepted
5. **Typecheck Passes**: npm run typecheck passes with zero errors
6. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
7. **No Skipped Tests**: grep -R "test.skip" returns no results
8. **No Banned Hotkeys**: grep for banned hotkeys returns no results in code
9. **No DevTools Wording**: grep for DevTools wording returns no results in docs
10. **Passive Scope Confirmed**: v50 can remain passive/read-only metadata display
11. **No Sigma Access Required**: No Sigma/renderer/physics/camera behavior is required for v50
12. **Gate Conditions Met**: All v49 → v50 gate conditions are satisfied

If any precondition fails, v50 must not proceed. Stop and report.

## v51+ Promotion Path

### Promotion Process

To promote from v50 (passive inventory) to v51+ (runtime graph theme application), the following process must be followed:

1. **Specific Runtime Contract**: Create specific contract for runtime graph theme application
2. **Advisory Discussion**: Advisory questions for runtime theme application are discussed and answered
3. **QA Checklist**: QA checklist items for runtime theme application are defined and verified
4. **Playwright Evidence**: Playwright tests prove runtime theme application is safe and correct
5. **Backlog Clearance**: No blocking backlog items exist
6. **Acceptance**: Runtime theme application is accepted via QA report
7. **Implementation**: Runtime theme application is implemented according to contract
8. **Validation**: Typecheck and Playwright validation pass
9. **Commit**: Runtime theme application is committed with appropriate message
10. **Post-Commit Verification**: Git status is clean and tests still pass

### Promotion Criteria

Runtime graph theme application can be promoted when:
- The specific runtime contract is accepted
- Runtime theme application has explicit advisory approval
- Runtime theme application has Playwright evidence
- Runtime theme application does not break existing contracts
- Runtime theme application does not break existing tests
- Runtime theme application has no skipped tests
- Runtime theme application has no banned hotkeys
- Runtime theme application has no DevTools wording in docs

### Forbidden Promotion Paths

The following promotion paths are forbidden:
- Promoting without specific contract acceptance
- Promoting without Playwright evidence
- Promoting with skipped tests
- Promoting with banned hotkeys
- Promoting that breaks existing contracts
- Promoting that breaks existing tests
- Promoting that requires DevTools manual steps

### v51 Candidate Categories

Potential v51+ runtime application categories (all require explicit new contracts):
- Runtime graph theme application (apply theme tokens to graph renderer)
- Reactive graph theme updates (update graph when theme changes)
- Perspective-specific graph themes (different graph themes per perspective)
- User graph theme customization (user-editable graph theme overrides)

## Stop Conditions

### Immediate Stop Conditions

Work must stop immediately if any of these conditions are detected:

1. **Sigma Mutation Attempted**: Any code attempts to access Sigma/renderer internals
2. **Node/Edge Styling Change Attempted**: Any code attempts to change node/edge styles
3. **Runtime Theme Application Attempted**: Any code attempts to apply theme to graph at runtime
4. **Storage Addition Attempted**: Any code attempts to add storage/persistence
5. **Active Control Addition Attempted**: Any code attempts to add active theme controls
6. **Hotkey Addition Attempted**: Any code attempts to add new hotkeys/listeners
7. **Command Execution Attempted**: Any code attempts to execute graph theme commands
8. **Test Skip Attempted**: Any test is marked as skipped
9. **DevTools Wording Found**: Any doc requires manual DevTools steps for acceptance
10. **Banned Hotkey Found**: Any code uses banned hotkeys (e.g., Ctrl+Alt+T)
11. **Planned Token Used**: Any mapping uses a planned token instead of canonical

### Stop and Report Conditions

Work must stop and produce a Quest Mode Situation Report if:

1. **Typecheck Fails**: npm run typecheck returns errors
2. **Playwright Fails**: npm run qa:e2e returns failures
3. **Skipped Tests Found**: grep -R "test.skip" returns results
4. **Git Status Dirty**: git status --short shows uncommitted changes during validation
5. **Gate Condition Fails**: Any v49 → v50 gate condition fails
6. **Contract Violation**: Implementation violates contract requirements
7. **Boundary Crossing**: Implementation crosses forbidden boundary
8. **Evidence Missing**: Required Playwright evidence is missing

## Acceptance Criteria

### v49 Acceptance Criteria

v49 (Graph Visual Theme Mapping Contract) is accepted when:

1. **Contract Document Exists**: docs/graph/GRAPH_VISUAL_THEME_MAPPING_CONTRACT.md exists with all 22 required sections
2. **Contract is Complete**: All required sections are filled with meaningful content
3. **Contract is Consistent**: Contract is consistent with GRAPH_RUNTIME_BOUNDARY_CONTRACT.md
4. **Contract is Consistent**: Contract is consistent with FIRST_GRAPH_RUNTIME_MUTATION_CONTRACT.md
5. **Mapping Model Defined**: Graph Visual Theme Mapping model is clearly defined
6. **Element Relationship Defined**: Graph element to theme token relationship is clearly defined
7. **Eligible Elements Defined**: Eligible graph visual elements are clearly defined
8. **Eligible Tokens Defined**: Eligible theme token paths are clearly defined (canonical only)
9. **Canonical Source Defined**: Canonical token source of truth is clearly defined
10. **Passive Boundary Clear**: Passive mapping boundary is clearly defined
11. **Runtime Boundary Clear**: Runtime application boundary is explicitly forbidden
12. **Sigma Non-Mutation Guarantee**: Sigma/renderer non-mutation guarantee is explicit
13. **Node/Edge Non-Mutation Guarantee**: Node/edge styling non-mutation guarantee is explicit
14. **Theme Target Relationship**: Relationship to Theme Target Registry is defined
15. **Perspective Relationship**: Relationship to Perspective System is defined
16. **Command Deck Boundary**: No command execution is explicitly required
17. **Hotkey Boundary**: No hotkeys are explicitly required
18. **Accessibility Requirements**: Accessibility requirements are defined
19. **Playwright Evidence Requirements**: Playwright evidence requirements are defined
20. **v50 Preconditions**: v50 preconditions are clear and testable
21. **v51+ Promotion Path**: v51+ promotion path is defined
22. **Stop Conditions**: Stop conditions are clearly defined
23. **QA Updated**: QA/advisory/backlog are updated for v49
24. **Typecheck Passes**: npm run typecheck passes with zero errors
25. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
26. **No Skipped Tests**: grep -R "test.skip" returns no results
27. **Commit Clean**: Post-commit git status is clean

### v50 Acceptance Criteria

v50 (Graph Theme Mapping Inventory) is accepted when:

1. **v49 Gate Conditions Met**: All v49 → v50 gate conditions are satisfied
2. **Contract Respected**: Implementation respects GRAPH_VISUAL_THEME_MAPPING_CONTRACT.md
3. **Passive Only**: Implementation is passive/read-only metadata display
4. **No Sigma Mutation**: No Sigma/renderer mutation occurs
5. **No Node/Edge Change**: No node/edge style changes occur
6. **No Runtime Application**: No runtime graph theme application occurs
7. **No Storage**: No storage/persistence is added
8. **No Active Controls**: No active theme controls are added
9. **No Hotkeys**: No new hotkeys/listeners are added
10. **No Commands**: No command execution is added
11. **Canonical Tokens Only**: Only canonical theme token paths are used
12. **Registry Typed**: Registry has TypeScript type definitions
13. **Inventory Visible**: Graph Theme Mapping Inventory is visible in UI
14. **Mapping Rows Listed**: Mapping entries are displayed
15. **Token Paths Shown**: Canonical token paths are visible
16. **Rows Passive**: Inventory rows are passive/read-only
17. **No Apply Controls**: No enabled apply/edit/save controls exist
18. **Graph Surface Mounts**: Graph surface still mounts and is visible
19. **Existing Inventory Works**: Existing graph inventory/probe/detail mode still works
20. **No Skipped Tests**: No tests are skipped
21. **Playwright Proves Behavior**: Playwright tests prove passive inventory behavior
22. **Typecheck Passes**: npm run typecheck passes with zero errors
23. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
24. **QA Updated**: QA/advisory/backlog are updated for v50
25. **Commit Clean**: Post-commit git status is clean
