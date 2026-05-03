# Perspective System Contract

## Status

v37 planning contract. Docs-only governance before Perspective System v0 runtime.

## Purpose

Define the governance model for the Perspective System in LumaWeave.

This contract establishes:
- What a Perspective is and how Perspectives are registered
- What the Perspective Registry is and its read-only boundary
- Which perspectives are built-in candidates
- When Perspective Panel becomes interactive
- When custom/user-created perspectives may be added
- When graph/Sigma mutation may occur
- Accessibility requirements
- Playwright evidence requirements

This contract does not implement runtime behavior. It defines the rules for future implementation.

## Definitions

### Perspective

A named, structured, selectable view/lens over LumaWeave's architecture/control-plane state.

In v38, perspectives are built-in and read-only. They provide alternative ways to view the same underlying state without mutating it.

Perspectives have:
- A unique identifier
- A human-readable title
- A description of what the perspective shows
- A category/group (e.g., architecture, theme, QA, graph)
- A status (active, locked, future)
- A scope boundary (what it can/cannot do)

Perspectives are passive metadata in v38. They do not mutate graph/Sigma behavior directly.

### Perspective Registry

A typed inventory of built-in perspectives and their metadata.

The Perspective Registry:
- Lists all approved built-in perspectives
- Enforces that no perspectives mutate graph/Sigma directly
- Identifies locked/future perspectives
- Identifies scope boundaries per perspective
- Provides a single source of truth for perspective metadata

The Perspective Registry must not mutate graph/Sigma behavior directly in v38.

### Perspective Panel

A passive UI surface that lists or previews available perspectives.

In v38, the Perspective Panel is read-only. It displays perspective metadata without apply/execute controls.

### Free-Floating Perspective

Any perspective added directly to the UI without registry governance.

**Forbidden.** All perspectives must go through the Perspective Registry.

## Non-Goals

This contract does not:
- Implement Perspective Panel runtime
- Implement perspective switching logic
- Implement graph/Sigma camera movement
- Implement graph filtering/hiding
- Implement graph physics changes
- Implement custom/user-created perspectives
- Implement storage/persistence for perspectives
- Touch graph/Sigma renderer
- Mutate theme storage/schema/presets
- Add Mission Control restructure
- Implement new hotkeys
- Implement command execution
- Add write-back actions

## Perspective Model

### Perspective Shape

```typescript
interface Perspective {
  id: string; // Unique identifier, e.g., "default-architecture"
  title: string; // Human-readable title, e.g., "Default Architecture"
  description: string; // What this perspective shows
  category: PerspectiveCategory; // Architecture, Theme, QA, Graph, etc.
  status: PerspectiveStatus; // active, locked, future
  scope: PerspectiveScope; // What this perspective can/cannot do
  metadata?: Record<string, unknown>; // Additional metadata
}

type PerspectiveCategory =
  | "architecture"
  | "theme"
  | "qa"
  | "graph"
  | "command"
  | "custom";

type PerspectiveStatus = "active" | "locked" | "future";

type PerspectiveScope = {
  canMutateGraph: boolean; // false for v38
  canMutateCamera: boolean; // false for v38
  canMutateFilter: boolean; // false for v38
  canMutatePhysics: boolean; // false for v38
  canPersist: boolean; // false for v38
  requiresStorage: boolean; // false for v38
};
```

## Perspective Registry Model

### Registry Shape

```typescript
interface PerspectiveRegistry {
  perspectives: Perspective[];
  version: string;
  lastUpdated: string;
}

// Built-in perspectives are populated at build time
// No runtime mutation in v38
```

### Registry Behavior

In v38:
- Registry is populated at build time with built-in perspectives
- Registry is read-only at runtime
- No user-created perspectives
- No runtime mutation of perspective metadata
- No storage/persistence

Future (v39+):
- May support user-created perspectives with explicit governance
- May support runtime mutation with explicit scope
- May support storage/persistence with explicit contract

## Built-In Perspective Candidates

### Active in v38

1. **Default Architecture**
   - id: "default-architecture"
   - category: "architecture"
   - status: "active"
   - scope: read-only display of architecture state
   - description: Shows the default architecture view of LumaWeave

2. **Theme Mapping**
   - id: "theme-mapping"
   - category: "theme"
   - status: "active"
   - scope: read-only display of theme mapping state
   - description: Shows theme mapping relationships and token paths

3. **Command Deck**
   - id: "command-deck"
   - category: "command"
   - status: "active"
   - scope: read-only display of command metadata
   - description: Shows registered commands and hotkey inventory

4. **QA Evidence**
   - id: "qa-evidence"
   - category: "qa"
   - status: "active"
   - scope: read-only display of QA history and reports
   - description: Shows QA evidence, checklist history, and acceptance reports

### Locked in v38

None in v38. Locked perspectives would be built-in but not selectable.

### Future in v39+

5. **Graph Physics**
   - id: "graph-physics"
   - category: "graph"
   - status: "future"
   - scope: future graph physics controls (locked in v38)
   - description: Future perspective for graph physics configuration

6. **Source Adapter**
   - id: "source-adapter"
   - category: "architecture"
   - status: "future"
   - scope: future source adapter views (locked in v38)
   - description: Future perspective for source adapter integration

## Scope Boundary

### v38 Scope

In v38, the Perspective System:
- Displays built-in perspective metadata
- Shows perspective title, description, category, status
- Marks future/locked perspectives clearly
- Provides no apply/execute controls
- Provides no perspective switching logic
- Provides no graph/Sigma mutation
- Provides no storage/persistence

### v39+ Scope (Future)

Future versions may add:
- Perspective switching logic
- Graph camera movement per perspective
- Graph filtering/hiding per perspective
- Graph physics configuration per perspective
- User-created perspectives with governance
- Storage/persistence for user preferences

These require explicit contracts before implementation.

## Read-Only v0 Boundary

In v38, the Perspective System is strictly read-only:

- No perspective switching
- No graph/Sigma mutation
- No camera movement
- No filtering/hiding
- No physics changes
- No storage/persistence
- No user-created perspectives
- No write-back actions

The Perspective Panel is a discovery surface, not an execution surface, until v39 or later.

## Graph/Sigma Boundary

### v38 Boundary

The Perspective System must not:
- Mutate graph/Sigma renderer state
- Change graph camera position
- Filter or hide graph nodes/edges
- Modify graph physics parameters
- Inject graph visual changes

### Future Boundary (v39+)

Future graph-related perspectives require:
- Explicit contract for graph/Sigma interaction
- Playwright evidence for graph behavior
- QA acceptance before graph mutation

No graph/Sigma mutation without explicit contract.

## Storage/Persistence Boundary

### v38 Boundary

The Perspective System must not:
- Store perspective preferences
- Persist perspective state
- Save user-created perspectives
- Write to localStorage or any storage

### Future Boundary (v39+)

Future storage requires:
- Explicit storage contract
- Schema migration plan
- QA acceptance before storage implementation

No storage/persistence without explicit contract.

## Command Deck Relationship

The Perspective System and Command Deck are separate systems:

- Command Deck: Discovery surface for commands and hotkeys
- Perspective System: Discovery surface for alternative views/lenses

In v38:
- Both are read-only discovery surfaces
- Neither has execution capabilities
- Neither has storage/persistence
- Neither has graph/Sigma mutation

Future versions may integrate perspective-aware commands, but this requires explicit contract.

## Accessibility Requirements

### v38 Requirements

- Perspective Panel must be keyboard navigable
- Perspective rows must have clear focus indicators
- Locked/future perspectives must be visually distinct
- Status labels must be screen-reader friendly
- Data-testid values must be stable for Playwright

### Future Requirements

Future interactive perspectives require:
- Keyboard shortcuts for perspective switching (requires Hotkey Registry approval)
- Screen reader announcements for perspective changes
- High-contrast mode support
- Reduced motion support

## Playwright Evidence Requirements

### v38 Evidence

Playwright tests must prove:
- Perspective panel/surface is visible
- Built-in perspectives are listed
- Perspective rows show title, description, category, status
- Locked/future perspectives are labeled clearly
- No enabled apply/execute controls exist
- No new hotkey behavior exists
- Existing Command Deck and Mission Control behavior still works
- No skipped tests

### Test File

`tests/e2e/perspective-system.spec.ts`

### Acceptance Path

- Playwright assertions only
- No manual DevTools JavaScript
- No console inspection for acceptance
- QA Debug readouts if needed for human verification

## v38 Preconditions

v38 may proceed only if:
- v37 contract is accepted and committed
- v37 commit hash is recorded
- typecheck passes
- qa:e2e passes
- test.skip grep is clean
- v38 remains read-only/passive
- no graph/Sigma/storage/hotkey/execution boundary is needed

## v39/v40 Relationship

### v39 — Graph Physics Playwright Coverage Expansion

v39 focuses on:
- Expanding Playwright coverage for graph physics
- Stabilizing physics sliders/toggles
- Adding test coverage for physics behavior
- No new physics features

v39 does not implement perspective-based graph physics. That requires explicit contract.

### v40 — Graph View Element Registry / Graph Visual Policy Refresh

v40 focuses on:
- Refreshing Graph View Element Registry
- Refreshing Graph Visual Policy
- Stabilizing graph visual behavior
- No new graph visual mapping

v40 does not implement perspective-based graph filtering. That requires explicit contract.

## Stop Conditions

Stop and report if:
- v38 would require graph/Sigma mutation
- v38 would require storage/persistence
- v38 would require new hotkeys or keyboard listeners
- v38 would require command execution
- v38 would require broad UI restructuring
- v37 commit fails or validation is not clean
- typecheck fails outside scoped files
- Playwright fails outside scoped files
- tests need weakening or skipping
- active controls would be dead/unwired

## Acceptance Criteria

v37 contract acceptance requires:
- PERSPECTIVE_SYSTEM_CONTRACT.md exists with all required sections
- Built-in perspective candidates are clearly defined
- Scope boundaries are explicit
- v38 Preconditions are clear
- v39/v40 Relationship is documented
- Stop Conditions are documented
- No runtime changes in v37

v38 implementation acceptance requires:
- Perspective Registry exists with typed metadata
- Perspective Panel exists and is visible
- Built-in perspectives are listed
- Perspective rows are read-only/passive
- Locked/future perspectives are labeled
- No enabled apply/execute controls
- Playwright tests pass with 0 skipped
- typecheck passes
- No graph/Sigma mutation
- No storage/persistence
- No new hotkeys
- No command execution
