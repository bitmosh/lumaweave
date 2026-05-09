---
id: control.plane.command.deck.hotkey.registry.contract
title: Command Deck and Hotkey Registry Contract
type: contract
status: accepted
version: v35
cluster: slate
domain: control-plane
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
references:
  - control.plane.system.index.registry.contract
  - control.plane.perspective.system.contract
  - control.plane.graph.navigation.contract
tags: [control-plane, command-deck, hotkey, registry, contract, v35, governance]
---

# Command Deck / Hotkey Registry Contract

## Status

v35 planning contract. Docs-only governance before new hotkeys or Command Deck runtime.

## Purpose

Define the governance model for Command Deck and Hotkey Registry systems in LumaWeave.

This contract establishes:
- What a Command is and how Commands are registered
- What the Command Deck is and its read-only boundary
- What the Hotkey Registry is and its governance model
- Which hotkeys are currently accepted
- What hotkeys are banned or conflicting
- When Command Deck becomes executable
- When new hotkeys may be added
- Accessibility requirements
- Playwright evidence requirements

This contract does not implement runtime behavior. It defines the rules for future implementation.

## Definitions

### Command

A named capability that may later be exposed through a Command Deck, but is not executable until explicitly wired and tested.

Commands have:
- A unique identifier
- A human-readable title
- A description of what the command does
- An eligibility flag (whether it can be exposed)
- An optional category/group
- An optional keyboard shortcut (only if approved by Hotkey Registry)

Commands are passive metadata until explicitly wired to execution logic.

### Command Deck

A UI surface for discovering available actions.

In v35, the Command Deck is passive/read-only unless explicitly promoted to a later version.

Command Deck responsibilities:
- Display registered command metadata
- Show command titles, descriptions, and categories
- Show keyboard shortcuts (if any)
- Indicate which commands are eligible vs ineligible
- Provide no execution controls
- Provide no command mutation controls
- Provide no storage/persistence

Command Deck is a discovery surface, not an execution surface, until v36 or later.

### Hotkey Registry

A governance layer for approved keyboard shortcuts.

The Hotkey Registry:
- Lists all approved keyboard shortcuts
- Enforces that no new shortcuts are added without registry approval
- Identifies banned shortcuts (OS/browser conflicts)
- Identifies native shortcuts (reserved by browser/OS)
- Identifies conflicting shortcuts (would clash with approved shortcuts)
- Provides a single source of truth for keyboard behavior

No new hotkeys may be added outside the Hotkey Registry.

### Free-Floating Hotkey

Any shortcut added directly to a component or hook without registry governance.

**Forbidden.** All keyboard shortcuts must go through the Hotkey Registry.

## Non-Goals

This contract does not:
- Implement Command Deck runtime
- Implement command execution logic
- Implement command dispatch
- Implement command palette behavior
- Implement new keyboard shortcuts
- Implement hotkey binding logic
- Add user-customizable hotkeys
- Touch graph/Sigma renderer
- Mutate theme storage/schema/presets
- Add Mission Control restructure
- Implement storage or persistence for commands

## Command Deck Model

### Command Shape

```typescript
interface Command {
  id: string; // Unique identifier, e.g., "theme-override-export"
  title: string; // Human-readable title, e.g., "Export Theme Override Bundle"
  description: string; // What this command does
  category?: string; // Optional grouping, e.g., "theme", "view", "debug"
  eligible: boolean; // Whether this command can be exposed in Command Deck
  shortcut?: string; // Keyboard shortcut, only if approved by Hotkey Registry
  requiresFeatureFlag?: string; // Optional feature gate
  requiresPermission?: string; // Optional permission gate
}
```

### Command Registry

A read-only registry of Commands.

The Command Registry:
- Is populated at build time or app initialization
- Contains all registered Commands
- Does not support runtime mutation
- Does not support user-added commands
- Does not support command execution

### Command Deck UI (v35 - Read-Only Shell)

If implemented in v35, the Command Deck UI:
- Displays Commands from the Command Registry
- Shows only eligible Commands (eligible: true)
- Shows command metadata (title, description, category, shortcut)
- Shows no execution buttons
- Shows no edit/mutation controls
- Shows no storage/persistence controls
- Is passive/discovery-only

Command Deck UI must use stable data-testid values for Playwright evidence.

## Hotkey Registry Model

### Hotkey Shape

```typescript
interface Hotkey {
  id: string; // Unique identifier, e.g., "inspector-toggle"
  shortcut: string; // Keyboard shortcut, e.g., "Alt+Shift+I"
  commandId?: string; // Optional linked command
  description: string; // What this hotkey does
  status: "active" | "banned" | "native" | "conflicting";
  reason?: string; // Why banned/native/conflicting
}
```

### Hotkey Registry

A read-only registry of approved, banned, native, and conflicting hotkeys.

The Hotkey Registry:
- Lists all keyboard shortcuts in the system
- Enforces that new shortcuts must be added through registry approval
- Identifies which shortcuts are banned (OS/browser conflicts)
- Identifies which shortcuts are native (reserved by browser/OS)
- Identifies which shortcuts are conflicting (clash with approved shortcuts)
- Does not support runtime mutation
- Does not support user-customizable hotkeys

### Hotkey Governance Rules

1. **No free-floating hotkeys**: All keyboard shortcuts must be registered.
2. **No OS/browser conflicts**: Shortcuts that conflict with OS or browser native shortcuts are banned.
3. **No conflicts with approved shortcuts**: New shortcuts must not clash with existing approved shortcuts.
4. **No user customization**: Hotkeys are not user-customizable.
5. **Registry approval required**: New shortcuts require explicit approval through the Hotkey Registry.

## Existing Accepted Hotkeys

The following hotkeys are currently accepted in LumaWeave:

### Inspector Toggle
- **Shortcut**: Alt+Shift+I
- **Command**: Theme Target Inspector Overlay toggle
- **Status**: Active
- **Description**: Toggles the Theme Target Inspector overlay on/off
- **Purpose**: Allows users to inspect theme targets and warning badges

### Pin/Unpin
- **Shortcut**: Alt+Shift+P
- **Command**: Pin/unpin selected theme target
- **Status**: Active
- **Description**: Pins or unpins the currently selected theme target
- **Purpose**: Allows users to keep specific targets visible in the inspector

These are the only approved keyboard shortcuts in v35. No new shortcuts may be added in v35.

## Banned / Native / Conflicting Hotkey Policy

### Banned Hotkeys

Banned hotkeys are shortcuts that conflict with OS or browser native shortcuts.

Examples of banned hotkeys:
- **Ctrl+Alt+T**: Conflicts with Ubuntu terminal shortcut
- **Ctrl+T**: Browser new tab
- **Ctrl+W**: Browser close tab
- **Ctrl+S**: Browser save
- **Ctrl+F**: Browser find
- **Alt+F4**: OS close window
- **Ctrl+Alt+Del**: OS task manager

**Rule**: Never add a hotkey that conflicts with OS or browser native shortcuts.

### Native Hotkeys

Native hotkeys are shortcuts reserved by the browser or OS.

Examples of native hotkeys:
- **F5**: Browser refresh
- **F11**: Browser fullscreen
- **Ctrl+C**: Browser copy
- **Ctrl+V**: Browser paste
- **Ctrl+Z**: Browser undo

**Rule**: Never override browser or OS native shortcuts.

### Conflicting Hotkeys

Conflicting hotkeys are shortcuts that would clash with existing approved hotkeys.

**Rule**: New hotkeys must not conflict with existing approved hotkeys (Alt+Shift+I, Alt+Shift+P).

### QA Wording Rule

Current QA wording and advisory questions should not include active banned shortcut names (e.g., "Ctrl+Alt+T"). Instead, use generic references like "banned OS-conflicting shortcuts" or "native browser shortcuts".

Historical/policy documentation may reference banned shortcuts for educational purposes, but current QA/advisory/test wording should use generic references.

## Read-Only Shell Boundary

### v35 Read-Only Shell (If Implemented)

If v35 implements a read-only Command Deck shell:

**Allowed**:
- Display command metadata (title, description, category)
- Display keyboard shortcuts (read-only)
- Show eligible vs ineligible status
- Use stable data-testid values
- Add Playwright tests proving shell renders
- Add Playwright tests proving commands are disabled/passive

**Forbidden**:
- Command execution buttons
- Command mutation controls
- Storage/persistence for commands
- New keyboard shortcuts
- Keyboard binding logic
- User-customizable hotkeys
- Write-back actions
- Graph/Sigma integration
- Mission Control restructure

### Stop Before

Stop before:
- Actual command execution
- New shortcuts
- Command palette behavior
- Write actions
- Graph/Sigma integration
- Storage/persistence
- Broad Mission Control restructure

## Future Command Execution Boundary

### v36 or Later: Command Execution

Command execution may be implemented in v36 or later, but only after:

1. v35 contract is accepted
2. v35 read-only shell (if implemented) validates cleanly
3. Command execution logic is explicitly designed and tested
4. Playwright evidence proves execution works correctly
5. No storage/schema risk is introduced
6. No graph/Sigma risk is introduced

Command execution must:
- Have explicit wiring logic
- Have explicit permission checks
- Have explicit feature flags
- Have Playwright tests for each command
- Have rollback capability
- Not create dead controls

### v36 or Later: New Hotkeys

New hotkeys may be added in v36 or later, but only after:

1. v35 contract is accepted
2. Hotkey Registry governance is proven
3. New hotkey is approved through Hotkey Registry
4. New hotkey does not conflict with OS/browser native shortcuts
5. New hotkey does not conflict with existing approved hotkeys
6. Playwright tests prove new hotkey works
7. Accessibility requirements are met

## Accessibility Requirements

### Keyboard Navigation

Command Deck (when implemented) must:
- Support keyboard navigation
- Support Tab/Shift+Tab for focus movement
- Support Enter/Space for activation (when execution is enabled)
- Follow ARIA best practices
- Provide focus indicators

### Screen Reader Support

Command Deck (when implemented) must:
- Provide ARIA labels for all interactive elements
- Provide ARIA descriptions for command metadata
- Announce command states (eligible/ineligible)
- Announce keyboard shortcuts

### Visual Indicators

Command Deck (when implemented) must:
- Show keyboard shortcuts visually
- Show focus indicators
- Show disabled state for ineligible commands
- Use sufficient color contrast

## Playwright Evidence Requirements

### If Runtime UI Shell is Added (v35)

If v35 implements a read-only Command Deck shell:

**Required Playwright tests**:
1. Prove shell is visible
2. Prove command rows render
3. Prove command metadata displays (title, description, category)
4. Prove commands are disabled/passive (no execution controls)
5. Prove no command execution controls are active
6. Prove no new hotkey behavior exists
7. Prove existing approved hotkeys still work (Alt+Shift+I, Alt+Shift+P)
8. Prove no test.skip
9. Prove stable data-testid values

**Use Playwright MCP** to:
- Inspect visible UI before finalizing tests
- Verify locator strategy
- Verify stable selectors

### If Docs/QA Only

If v35 is docs/QA only (no runtime shell):

**Required**:
- Update contract-registry tests only as needed
- Do not invent runtime UI tests for non-existent UI
- Update QA identity only if QA registry/advisory updates are made

### Playwright Cascade Rule

If more than 5 Playwright failures appear:
- Stop full-suite run
- Use max-failures=5
- Classify first failures
- Compare against last accepted green commit
- Do not patch old tests individually

## Stop Conditions

Stop and report instead of continuing if:

- The next step requires storage/schema beyond accepted contract
- Graph/Sigma renderer changes appear necessary
- New shortcuts would be added without registry approval
- Tests would need to be weakened or skipped
- Active controls would be dead/unwired
- Broad architecture rewrite is required
- Implementation scope crosses into a new feature family
- QA identity/advisory/backlog cannot be made current
- Validation fails outside the scoped files
- Typecheck failures point outside the sub-pass scope
- Playwright failures require unrelated changes
- Local-first behavior would require cloud/sync assumptions
- The implementation depends on guessing hidden architecture

## v36 Preconditions

Before v36 can implement command execution or new hotkeys, the following must be true:

1. v35 contract is accepted
2. v35 read-only shell (if implemented) validates cleanly
3. Hotkey Registry governance is proven
4. Command Registry governance is proven
4. Playwright evidence proves read-only shell works (if implemented)
5. No storage/schema risk is identified
6. No graph/Sigma risk is identified
7. Accessibility requirements are documented
8. Command execution logic is explicitly designed
9. New hotkey approval process is explicitly designed

## QA Identity

### v35 QA Identity

If v35 makes QA registry or advisory updates, update current QA identity to:

- **QA Key**: v35
- **Feature ID**: command-deck-hotkey-registry-contract-v35

If v35 is docs-only with no QA updates, keep current QA identity as v34c1.

### v35 Advisory Questions

If v35 updates QA identity, add advisory questions around:
- Command registry shape
- Whether read-only shell should land before execution
- Hotkey governance
- Accessibility
- Avoiding OS/browser shortcut collisions
- How to test command surfaces without dead controls
- Whether v36 should implement read-only shell or first executable command

### v35 Checklist Items

If v35 updates QA identity, add checklist items around:
- Command deck contract defined
- Hotkey registry contract defined
- Existing accepted hotkeys documented
- Banned hotkey policy defined
- Read-only shell boundary defined
- Future execution boundary defined
- Accessibility requirements defined
- Playwright evidence requirements defined
- Typecheck passes
- Playwright passes with 0 skipped

## Backlog Updates

Update backlog so:
- v34c1 export is completed
- v35 Command Deck / Hotkey Registry contract is current
- v36 read-only shell or first runtime shell remains next/future depending what v35 completes
- No new hotkeys are promoted
- Graph physics remains deferred

## References

Related docs:
- docs/control-plane/qa/BACKLOG_POLICY.md
- docs/theme-system/THEME_OVERRIDE_STORAGE_CONTRACT.md
- docs/lumaweave_bandit_brain_packet/docs/agent-learning/10_SELF_SPLITTING_QUEST_PROTOCOL.md
- docs/lumaweave_bandit_brain_packet/docs/agent-learning/13_PLAYWRIGHT_OPERATING_PROCEDURES.md
- docs/lumaweave_bandit_brain_packet/docs/agent-learning/15_BANDIT_ABILITY_AUDIT.md