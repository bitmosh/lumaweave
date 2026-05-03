# Graph Runtime Boundary Contract

## Status

v45 planning contract. Docs-only governance before any runtime graph/Sigma mutation.

## Purpose

Define the first permitted runtime graph mutation boundary before any real runtime graph mutation is attempted.

This contract establishes:
- What constitutes runtime graph mutation
- What categories of mutation are permitted and when
- What passive observation is allowed without mutation
- What runtime mutations are forbidden until explicitly promoted
- The relationship between this contract and existing graph contracts
- The relationship between this contract and other LumaWeave systems
- Required evidence before any future mutation
- Preconditions for v46 passive probe
- Promotion path for v47+ actual runtime mutation

This contract does not implement runtime behavior. It defines the rules for future implementation.

## Definitions

### Runtime Graph Mutation

Any change that alters Sigma renderer behavior, graph physics, layout, camera, filtering, node/edge rendering, or graph interaction behavior.

Examples of runtime graph mutation:
- Changing Sigma renderer settings
- Modifying graph physics parameters (node size, link distance, repel force)
- Adding camera movement/zoom/pan controls
- Adding graph filtering or hiding behavior
- Changing node/edge visual styling
- Modifying graph data model at runtime
- Triggering graph layout recalculation
- Adding live graph controls (buttons, sliders, toggles)

### Passive Graph Probe

A non-mutating readout that observes app-visible graph container/evidence state without changing graph/Sigma behavior.

A passive graph probe:
- Reads DOM-visible status or existing app-level metadata
- Does not read/mutate Sigma internals unless already safely exposed as non-mutating public state
- Does not change graph behavior
- Does not add controls
- Does not execute graph actions
- Does not store data
- Is clearly labeled passive/read-only

### Runtime Boundary Model

The runtime boundary model defines three zones:

1. **Passive Observation Zone (v46)**: Safe to enter. Read-only probes that observe existing graph state without mutation.
2. **Contract Definition Zone (v45)**: Docs-only governance. Define what mutations are permitted and when.
3. **Mutation Execution Zone (v47+)**: Forbidden until explicitly promoted. Actual runtime graph/Sigma mutation.

## Non-Goals

This contract does not:
- Implement a live runtime graph mutation system
- Add Sigma renderer mutation
- Change graph physics behavior
- Change node/edge visual rendering
- Add new graph controls
- Add camera/filter behavior
- Add storage/persistence
- Add hotkeys/listeners
- Add command execution
- Implement the passive probe (that is v46)

## Runtime Boundary Model

The runtime boundary model follows these principles:

1. **Explicit Acceptance**: All runtime graph mutations require explicit contract acceptance before implementation.
2. **Passive First**: The first allowed runtime step is passive observation only, not mutation.
3. **Sigma Black Box**: Sigma/renderer internals are treated as a black box. Boundary operates at DOM/app level only.
4. **Evidence First**: Runtime mutations require Playwright evidence before acceptance.
5. **Governance First**: Contract definition must precede any implementation.

### Zone Progression

```txt
v45: Contract Definition Zone (docs-only)
  ↓
v46: Passive Observation Zone (read-only probe)
  ↓
v47+: Mutation Execution Zone (explicit promotion required)
```

## Mutation Categories

### Category 1: Passive Observation (v46)

**Status**: Permitted in v46

**Definition**: Read-only probes that observe existing graph state without mutation.

**Examples**:
- Reporting graph frame mounted status
- Reporting graph surface evidence selector presence
- Reporting registry entries count
- Reporting inventory entries count
- Reporting runtime mutation status as locked/deferred

**Requirements**:
- No Sigma/renderer mutation
- No physics changes
- No camera/filter behavior
- No controls
- No storage
- No hotkeys
- Clearly labeled passive/read-only

### Category 2: Theme Mapping (future)

**Status**: Forbidden until v47+ with explicit promotion

**Definition**: Changing graph visual appearance via theme system.

**Examples**:
- Node color mapping
- Edge color mapping
- Background color mapping
- Label styling mapping

**Requirements**:
- Theme contract must exist
- Theme Target Registry integration
- Playwright evidence for theme application
- No direct Sigma mutation (theme operates at DOM level)

### Category 3: Control Surface (future)

**Status**: Forbidden until v47+ with explicit promotion

**Definition**: Adding UI controls that affect graph behavior.

**Examples**:
- Physics sliders
- Camera controls
- Filter toggles
- Layout controls

**Requirements**:
- Explicit contract acceptance
- Playwright evidence for control behavior
- No Sigma/renderer mutation unless explicitly promoted
- Command Deck integration if applicable

### Category 4: Physics Change (future)

**Status**: Forbidden until v47+ with explicit promotion

**Definition**: Changing graph physics parameters.

**Examples**:
- Node size changes
- Link distance changes
- Repel force changes
- Gravity changes

**Requirements**:
- Explicit contract acceptance
- Playwright evidence for physics behavior
- Stable physics baseline established
- No breaking of existing graph visual contracts

### Category 5: Camera Change (future)

**Status**: Forbidden until v47+ with explicit promotion

**Definition**: Adding camera movement/zoom/pan controls.

**Examples**:
- Zoom controls
- Pan controls
- Fit-to-screen controls
- Camera presets

**Requirements**:
- Explicit contract acceptance
- Playwright evidence for camera behavior
- No Sigma/renderer mutation unless explicitly promoted
- Command Deck integration if applicable

### Category 6: Filter Behavior (future)

**Status**: Forbidden until v47+ with explicit promotion

**Definition**: Adding graph filtering or hiding behavior.

**Examples**:
- Node filtering
- Edge filtering
- Label filtering
- Category-based hiding

**Requirements**:
- Explicit contract acceptance
- Playwright evidence for filter behavior
- No Sigma/renderer mutation unless explicitly promoted
- Registry integration for filterable elements

## Passive Observation Boundary

### What is Allowed in Passive Observation

- Reading DOM-visible graph container status
- Reading existing app-level metadata
- Reporting registry entries count
- Reporting inventory entries count
- Reporting mutation boundary status
- Displaying passive/read-only labels

### What is Forbidden in Passive Observation

- Reading Sigma internals unless already safely exposed
- Mutating Sigma/renderer settings
- Changing graph physics parameters
- Adding camera movement
- Adding graph filtering/hiding
- Adding active controls (buttons, sliders, toggles)
- Storing/persisting data
- Adding hotkeys/listeners
- Executing graph actions

### Passive Probe Requirements

A passive probe must:
- Be clearly labeled "passive" or "read-only" in UI
- Display mutation boundaries as locked/deferred
- Have no enabled controls
- Not execute any graph actions
- Not store data
- Not trigger any side effects
- Be testable via Playwright without DevTools

## Forbidden Until Promoted

The following runtime mutations are forbidden until explicitly promoted to v47+:

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

## Sigma / Renderer Boundary

### Sigma as Black Box

The Sigma renderer is treated as a black box for runtime boundary purposes.

### Boundary Rules

- Runtime boundary operates at DOM/app level, not Sigma internals
- No direct Sigma API calls from runtime boundary layer
- DOM markers wrap Sigma canvas but do not inspect canvas internals
- Playwright tests observe DOM-visible behavior, not canvas pixel states
- Sigma/renderer configuration changes require explicit promotion

### Allowed Sigma Interactions

- Reading Sigma instance reference if already exposed as public non-mutating state
- Reading Sigma configuration if already exposed as public read-only state
- DOM-level observation of Sigma canvas (size, visibility, position)

### Forbidden Sigma Interactions

- Calling Sigma API methods that mutate state
- Changing Sigma renderer settings
- Modifying Sigma event handlers
- Accessing Sigma private/internal APIs
- Inspecting Sigma canvas pixel data (unless already established and stable)

## Physics Boundary

### Physics as Protected Subsystem

Graph physics parameters are a protected subsystem that require explicit promotion before mutation.

### Boundary Rules

- Physics parameters are read-only in v45/v46
- Physics changes require explicit contract acceptance
- Physics changes require Playwright evidence for behavior
- Physics changes must not break existing graph visual contracts

### Allowed Physics Interactions

- Reading physics parameters if already exposed as public read-only state
- Displaying physics status as locked/deferred
- Documenting physics parameter names and ranges

### Forbidden Physics Interactions

- Changing node size
- Changing link distance
- Changing repel force
- Changing gravity
- Changing any physics parameters
- Adding physics controls without explicit promotion

## Camera / Filter Boundary

### Camera and Filter as Protected Subsystems

Camera and filter behavior are protected subsystems that require explicit promotion before mutation.

### Boundary Rules

- Camera/filter behavior is read-only in v45/v46
- Camera/filter changes require explicit contract acceptance
- Camera/filter changes require Playwright evidence for behavior
- Camera/filter changes must not break existing graph visual contracts

### Allowed Camera/Filter Interactions

- Reading camera position if already exposed as public read-only state
- Displaying camera status as locked/deferred
- Documenting camera parameter names and ranges

### Forbidden Camera/Filter Interactions

- Adding camera movement controls
- Adding zoom controls
- Adding pan controls
- Adding filter/hide behavior
- Changing camera parameters without explicit promotion

## Registry Relationship

### Graph View Element Registry

The Graph View Element Registry (v40-v43) defines passive metadata for graph visual elements.

### Relationship to Runtime Boundary

- Runtime boundary extends the registry's passive metadata model to runtime behavior
- Registry defines what elements exist; runtime boundary defines what can be done with them
- Registry status (active/locked/future) informs runtime boundary decisions
- Registry sigmaBoundary field provides Sigma/renderer context
- Registry policyNote field provides policy context

### Consistency Requirements

- Runtime boundary must respect registry status (locked elements cannot be mutated)
- Runtime boundary must respect registry sigmaBoundary (no Sigma mutation unless promoted)
- Runtime boundary must respect registry policyNote (no policy violations)

### Integration Points

- Passive probe (v46) should report registry entries count
- Passive probe (v46) should report inventory entries count
- Future mutation contracts should reference registry element IDs

## Perspective Relationship

### Perspective System

The Perspective System (v37-v38) defines how multiple inspector views coexist.

### Relationship to Runtime Boundary

- Perspective System is orthogonal to runtime graph mutation
- Perspective System does not control graph/Sigma behavior
- Runtime boundary does not affect Perspective System
- Both systems can coexist without conflict

### Consistency Requirements

- Runtime boundary must not interfere with Perspective System
- Runtime boundary must not add controls that conflict with Perspective System
- Perspective System views should remain stable during runtime boundary work

### Integration Points

- Graph runtime probe (if added to UI) should respect Perspective System layout
- Graph runtime probe should not break Perspective System switching
- Future graph controls should integrate with Perspective System if applicable

## Command Deck Relationship

### Command Deck

The Command Deck (v35-v36) defines command execution and hotkey governance.

### Relationship to Runtime Boundary

- Command Deck governs command execution; runtime boundary governs graph mutation
- Runtime boundary must not add commands that mutate graph without explicit promotion
- Runtime boundary must not add hotkeys that trigger graph mutation without explicit promotion
- Command Deck provides governance layer for future graph commands

### Consistency Requirements

- Runtime boundary must respect Command Deck hotkey policy
- Runtime boundary must not add banned hotkeys (e.g., Ctrl+Alt+T)
- Runtime boundary must not add commands that conflict with Command Deck

### Integration Points

- Future graph commands should be registered in Command Deck
- Future graph hotkeys should be registered in Command Deck
- Command Deck should provide audit trail for graph mutation commands

## Playwright Evidence Requirements

### Evidence Paths

Preferred evidence paths for runtime boundary acceptance:

1. **Playwright assertions** – e2e specs that execute scenarios and assert results
2. **In-app QA Debug readouts** – Mission Control Debug tab exposes probe data without console work
3. **Visible manual app behavior** – Direct UI observation that is documented and reproducible
4. **Typecheck/build output** – typecheck, lint, and build artifacts for infra checks
5. **Git diff / file inspection** – Structural verifications tied to acceptance notes

### Forbidden Evidence Paths

- Manual DevTools JavaScript execution
- Manual inspection of JS arrays or objects
- "Trust me, I read the code"
- Manual `window.__lwRunGraphRuntimeProbe()` execution (must be automated or surfaced in QA Debug)
- Skipping tests
- Changing tests to fit broken behavior

### v46 Evidence Requirements

For v46 passive probe acceptance, Playwright must prove:
- Passive probe/readout is visible
- It reports graph frame/surface evidence
- It reports mutation boundaries as locked/deferred
- No enabled controls exist in the probe
- Graph surface still mounts
- Graph Visual Inventory still works
- No skipped tests

### v47+ Evidence Requirements

For v47+ mutation acceptance, Playwright must prove:
- Mutation behavior is documented and reproducible
- Mutation does not break existing graph visual contracts
- Mutation does not break existing Playwright tests
- Mutation has explicit contract acceptance
- Mutation has required pre-mutation checklist completion
- No skipped tests

## Required Pre-Mutation Checklist

Before any v47+ runtime graph mutation is attempted, the following must be completed:

1. **Contract Acceptance**: GRAPH_RUNTIME_BOUNDARY_CONTRACT.md is accepted
2. **Specific Mutation Contract**: Specific mutation contract (e.g., physics tuning contract) is accepted
3. **Registry Alignment**: Mutation respects Graph View Element Registry status and boundaries
4. **Visual Policy Alignment**: Mutation respects GRAPH_VISUAL_POLICY.md
5. **Perspective Compatibility**: Mutation does not break Perspective System
6. **Command Deck Registration**: Commands/hotkeys are registered in Command Deck (if applicable)
7. **Playwright Evidence**: Playwright tests prove mutation behavior
8. **QA Checklist**: QA checklist items for the mutation are all verified
9. **Advisory Approval**: Advisory questions for the mutation are answered
10. **Backlog Clearance**: No blocking backlog items exist

## v46 Preconditions

Before v46 passive probe implementation can begin, the following must be true:

1. **v45 Contract Accepted**: GRAPH_RUNTIME_BOUNDARY_CONTRACT.md is accepted and committed
2. **v45 Commit Clean**: Post-commit git status is clean
3. **Typecheck Passes**: npm run typecheck passes with zero errors
4. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
5. **No Skipped Tests**: grep -R "test.skip" returns no results
6. **No Banned Hotkeys**: grep for banned hotkeys returns no results in code
7. **No DevTools Wording**: grep for DevTools wording returns no results in docs
8. **Passive Scope Confirmed**: v46 can remain passive/non-mutating
9. **No Sigma/Physics Required**: No Sigma/physics/camera/filter behavior is required for v46
10. **Gate Conditions Met**: All v45 → v46 gate conditions are satisfied

If any precondition fails, v46 must not proceed. Stop and report.

## v47+ Promotion Path

### Promotion Process

To promote from passive observation (v46) to actual mutation (v47+), the following process must be followed:

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

## Stop Conditions

### Immediate Stop Conditions

Work must stop immediately if any of these conditions are detected:

1. **Sigma Mutation Attempted**: Any code attempts to mutate Sigma/renderer internals
2. **Physics Change Attempted**: Any code attempts to change physics parameters
3. **Camera/Filter Change Attempted**: Any code attempts to add camera/filter behavior
4. **Control Addition Attempted**: Any code attempts to add active graph controls
5. **Storage Addition Attempted**: Any code attempts to add storage/persistence
6. **Hotkey Addition Attempted**: Any code attempts to add new hotkeys/listeners
7. **Command Execution Attempted**: Any code attempts to execute graph commands
8. **Test Skip Attempted**: Any test is marked as skipped
9. **DevTools Wording Found**: Any doc requires manual DevTools steps for acceptance
10. **Banned Hotkey Found**: Any code uses banned hotkeys (e.g., Ctrl+Alt+T)

### Stop and Report Conditions

Work must stop and produce a Quest Mode Situation Report if:

1. **Typecheck Fails**: npm run typecheck returns errors
2. **Playwright Fails**: npm run qa:e2e returns failures
3. **Skipped Tests Found**: grep -R "test.skip" returns results
4. **Git Status Dirty**: git status --short shows uncommitted changes during validation
5. **Gate Condition Fails**: Any v45 → v46 gate condition fails
6. **Contract Violation**: Implementation violates contract requirements
7. **Boundary Crossing**: Implementation crosses forbidden boundary
8. **Evidence Missing**: Required Playwright evidence is missing

## Acceptance Criteria

### v45 Acceptance Criteria

v45 (Graph Runtime Boundary Contract) is accepted when:

1. **Contract Document Exists**: docs/graph/GRAPH_RUNTIME_BOUNDARY_CONTRACT.md exists with all 20 required sections
2. **Contract is Complete**: All required sections are filled with meaningful content
3. **Contract is Consistent**: Contract is consistent with existing graph contracts (registry, visual policy)
4. **Contract is Clear**: Forbidden categories are clearly defined
5. **Contract is Actionable**: v46 preconditions are clear and testable
6. **QA Updated**: QA/advisory/backlog are updated for v45
7. **Typecheck Passes**: npm run typecheck passes with zero errors
8. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
9. **No Skipped Tests**: grep -R "test.skip" returns no results
10. **Commit Clean**: Post-commit git status is clean

### v46 Acceptance Criteria

v46 (First Passive Graph Runtime Probe) is accepted when:

1. **v45 Gate Conditions Met**: All v45 → v46 gate conditions are satisfied
2. **Probe is Passive**: Probe is clearly labeled passive/read-only in UI
3. **Probe Reports Evidence**: Probe reports graph frame/surface evidence
4. **Probe Reports Boundaries**: Probe reports mutation boundaries as locked/deferred
5. **No Controls Exist**: Probe has no enabled controls
6. **Graph Surface Mounts**: Graph surface still mounts and is visible
7. **Inventory Still Works**: Graph Visual Inventory still works
8. **Playwright Proves Passive**: Playwright tests prove passive/read-only behavior
9. **No Sigma Mutation**: No Sigma/renderer mutation occurs
10. **No Physics Change**: No physics parameters change
11. **No Camera/Filter**: No camera/filter behavior is added
12. **No Storage**: No storage/persistence is added
13. **No Hotkeys**: No new hotkeys/listeners are added
14. **No Commands**: No command execution is added
15. **QA Updated**: QA/advisory/backlog are updated for v46
16. **Typecheck Passes**: npm run typecheck passes with zero errors
17. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
18. **No Skipped Tests**: grep -R "test.skip" returns no results
19. **Commit Clean**: Post-commit git status is clean

### v47+ Acceptance Criteria

v47+ (First Promoted Runtime Mutation) is accepted when:

1. **Specific Contract Accepted**: Specific mutation contract is accepted
2. **Advisory Approved**: Advisory questions are answered and approved
3. **QA Verified**: QA checklist items are all verified
4. **Playwright Evidence**: Playwright tests prove mutation behavior
5. **No Contract Violation**: Mutation does not violate GRAPH_RUNTIME_BOUNDARY_CONTRACT.md
6. **No Registry Violation**: Mutation respects Graph View Element Registry
7. **No Visual Policy Violation**: Mutation respects GRAPH_VISUAL_POLICY.md
8. **No Perspective Break**: Mutation does not break Perspective System
9. **No Command Deck Conflict**: Mutation does not conflict with Command Deck
10. **No Skipped Tests**: No tests are skipped
11. **No Banned Hotkeys**: No banned hotkeys are used
12. **No DevTools Wording**: No docs require manual DevTools steps
13. **Typecheck Passes**: npm run typecheck passes with zero errors
14. **Playwright Passes**: npm run qa:e2e passes with zero failures and zero skips
15. **Commit Clean**: Post-commit git status is clean
