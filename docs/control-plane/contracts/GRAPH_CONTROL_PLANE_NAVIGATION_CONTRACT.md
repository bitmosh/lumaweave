---
id: control.plane.graph.navigation.contract
title: Graph Control Plane Navigation Contract
type: contract
status: accepted
version: v68
cluster: slate
domain: control-plane
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
references:
  - control.plane.command.deck.hotkey.registry.contract
  - control.plane.system.index.registry.contract
  - graph.visual.policy
tags: [control-plane, graph, navigation, command-deck, contract, v68, ux]
---

# Graph Control Plane Navigation Contract v68

## Status

**Status**: Contract (docs-only)
**Date**: 2026-05-03

## Purpose

Define the UX/navigation contract for making the Graph Visual Inventory and Command Deck easier to navigate without weakening evidence.

The Graph Visual Inventory is correct and evidence-rich, but it is becoming a long scroll-wall. This contract defines navigation improvements that preserve all evidence content while making the control panel more navigable.

## Current Problem

The Graph Visual Inventory panel has grown significantly with multiple registry sections:

- Graph View Elements
- Theme Mappings
- Motion Safety / Epilepsy Guard
- Synthetic Audio Signal Preview
- Music Reactive Mapping Inventory (14 mappings)
- Audio Source Registry (7 sources)

This creates a scroll-wall problem:
- Users must scroll extensively to find specific sections
- No quick navigation between sections
- No high-level overview of what sections exist
- Music Reactive Mapping rows are not grouped by mode family
- Dense evidence content makes it hard to scan quickly

## Non-Goals

This contract does NOT aim to:

1. **Remove Evidence**: Do not remove any evidence content. All current evidence must be preserved.
2. **Weaken Tests**: Do not weaken historical contract tests. All test assertions must remain valid.
3. **Add Runtime Behavior**: Do not add graph/Sigma mutation, command execution, or music reactivity.
4. **Add Audio**: Do not add microphone, file upload, audio playback, or Web Audio input.
5. **Add Animation**: Do not add animation beyond accessible disclosure behavior.
6. **Change Read-Only Boundaries**: Do not change passive/read-only boundaries of existing registries.
7. **Break Test IDs**: Do not break stable data-testid values without migration plan.

## Overview → Drilldown Model

The navigation model follows an overview → drilldown pattern:

**Overview Mode** (Human Mode):
- Compact summary cards for each section
- High-level metadata only
- Quick navigation between sections
- Collapsible by default

**Drilldown Mode** (Evidence Mode):
- Full evidence content
- Detailed metadata
- All current test data
- Expandable on demand

The user can switch between Overview and Drilldown modes, or expand specific sections on demand.

## Sticky Summary / Mini TOC Model

A sticky summary / mini table of contents is proposed:

**Sticky Summary**:
- Fixed position at top of panel
- Shows section titles with quick links
- Collapsible to save space
- Highlights current section on scroll

**Mini TOC**:
- Section names with anchor links
- Grouped by category (Safety, Audio, Theme, Graph)
- Badge showing item count per section
- Click to scroll to section

**Implementation Notes**:
- Use CSS `position: sticky` for fixed header
- Use Intersection Observer API for scroll highlighting
- Preserve existing section structure
- No changes to data-testid values

## Collapsible Evidence Sections

Evidence sections should be collapsible:

**Collapsible Behavior**:
- Each section has a collapse/expand toggle
- Default state: collapsed for dense sections (Music Reactive Mapping, Audio Source)
- Default state: expanded for critical sections (Motion Safety, Graph View Elements)
- Collapse/expand state persists per session
- Accessible disclosure behavior (ARIA attributes, keyboard navigation)

**Section Collapse Rules**:
- Graph View Elements: Default expanded (critical)
- Theme Mappings: Default collapsed (dense)
- Motion Safety: Default expanded (critical safety)
- Synthetic Audio Signal: Default collapsed (preview only)
- Music Reactive Mapping: Default collapsed (14 mappings, dense)
- Audio Source Registry: Default collapsed (7 sources, dense)

**Implementation Notes**:
- Use HTML `<details>` and `<summary>` elements for native collapsible behavior
- Or use React state with ARIA attributes for custom behavior
- Preserve all data-testid values
- Add collapse/expand data-testid for testing

## Compact Summary Cards

Each section should have a compact summary card in Overview Mode:

**Summary Card Content**:
- Section title
- Item count (e.g., "14 mappings", "7 sources")
- Key metadata (e.g., "3 mode families", "1 active source")
- Status badge (e.g., "Complete", "Active", "Locked")
- Expand button to drill down

**Summary Card Layout**:
- Grid layout (2-3 columns per row)
- Compact height (100-150px)
- Hover effect for interactivity
- Click to expand to full evidence

**Example - Music Reactive Mapping Summary Card**:
```
Music Reactive Mapping
14 mappings • 3 mode families
Status: Complete (passive/read-only)
[Expand for details]
```

**Implementation Notes**:
- Create summary card component
- Extract key metadata from registry data
- Preserve existing section structure
- Add data-testid for summary cards

## Music Reactive Mapping Grouping

Music Reactive Mapping rows should be grouped by mode family:

**Mode Families**:
- Lantern Pulse (lantern-pulse-demo, lantern-pulse-slow, lantern-pulse-fast)
- Plasma Loom (plasma-loom-demo, plasma-loom-slow, plasma-loom-fast)
- Constellation Beat (constellation-beat-demo, constellation-beat-slow, constellation-beat-fast)
- Signal Trace (signal-trace-demo, signal-trace-slow, signal-trace-fast)
- Spectral Debug (spectral-debug-demo, spectral-debug-slow, spectral-debug-fast)
- Focus-Safe (focus-safe-demo, focus-safe-slow, focus-safe-fast)

**Grouping Display**:
- Show mode family as group header
- Show family members as collapsible rows
- Show family-level metadata (e.g., "3 presets in family")
- Compact table with expandable row details

**Implementation Notes**:
- Group mappings by modeFamily in registry data
- Render group headers in UI
- Use collapsible rows for family members
- Preserve existing data-testid values for individual mappings

## Human Mode vs Evidence Mode Relationship

Two modes should be defined:

**Human Mode** (Overview):
- Compact summary cards
- Collapsed sections by default
- Quick navigation
- High-level metadata only
- Focus on usability and scanning

**Evidence Mode** (Drilldown):
- Full evidence content
- Expanded sections
- Detailed metadata
- All test data visible
- Focus on verification and debugging

**Mode Switch**:
- Toggle button at top of panel
- State persists per session
- Default: Human Mode
- Smooth transition between modes

**Implementation Notes**:
- Add mode state to component
- Render different content based on mode
- Preserve all data-testid values in both modes
- Add mode toggle data-testid

## Stable Test ID Preservation

Stable data-testid values must be preserved:

**Preservation Rules**:
- All existing data-testid values must remain valid
- New data-testid values should follow existing patterns
- If a data-testid must change, provide migration path
- Update Playwright tests to reflect changes

**Test ID Patterns**:
- Sections: `data-testid="section-name-section"`
- Items: `data-testid="item-name-row"`
- Metadata: `data-testid="item-name-metadata"`
- Controls: `data-testid="item-name-control"`

**Implementation Notes**:
- Audit existing data-testid values before changes
- Document any data-testid changes
- Update Playwright tests in same pass
- No data-testid changes without test updates

## Accessibility Requirements

Navigation improvements must meet accessibility standards:

**Keyboard Navigation**:
- All collapsible sections must be keyboard accessible
- Tab order must be logical
- Focus indicators must be visible
- Escape key should close collapsible sections

**Screen Reader Support**:
- ARIA attributes for collapsible sections
- ARIA labels for summary cards
- ARIA live regions for dynamic content
- Alt text for any visual indicators

**Color Contrast**:
- Text must meet WCAG AA contrast requirements
- Status badges must be distinguishable
- Hover states must not rely on color alone

**Focus Management**:
- Focus must move to expanded content when section expands
- Focus must return to toggle when section collapses
- No focus traps

## Playwright Evidence Requirements

Playwright tests must verify navigation improvements:

**Required Tests**:
1. Sticky summary is visible and fixed at top
2. Mini TOC shows all section titles
3. Collapsible sections toggle correctly
4. Summary cards show correct metadata
5. Music Reactive Mapping is grouped by mode family
6. Human Mode vs Evidence Mode toggle works
7. All existing data-testid values remain valid
8. Keyboard navigation works (Tab, Enter, Escape)
9. Screen reader announces collapsible state
10. Evidence content is preserved in Evidence Mode

**Test Structure**:
- Add tests to `tests/e2e/graph-visual-inventory.spec.ts`
- Use existing test patterns
- No `test.skip`
- All tests must pass

## Forbidden Runtime Changes

The following runtime changes are forbidden in v68:

1. **Graph/Sigma Mutation**: No changes to graph renderer or behavior
2. **Command Execution**: No runtime command execution
3. **Music Reactivity**: No audio-to-visual reactivity
4. **Audio Input**: No microphone, file upload, audio playback, Web Audio input
5. **Animation**: No animation beyond accessible disclosure behavior
6. **Evidence Removal**: No removal or weakening of evidence content
7. **Test Skips**: No `test.skip` or weakening of historical tests
8. **Data Loss**: No risk of data loss or user data corruption

## v69 Preconditions

If v68 implementation is authorized in v69, the following preconditions must be met:

1. **v68 Contract Accepted**: v68 contract must be accepted via QA/advisory process
2. **Typecheck Pass**: Typecheck must pass with zero errors
3. **Existing Tests Pass**: All existing Playwright tests must pass
4. **No Evidence Removal**: Evidence content must be preserved
5. **No Forbidden Changes**: No graph/Sigma mutation, no audio input, no command execution
6. **Accessibility Review**: Accessibility requirements must be met
7. **Test Coverage**: New navigation features must have Playwright test coverage

## v70+ Promotion Path

After v69 implementation, the following promotion path is available:

**v70**: QA Bundle Validator Script
- Validate QA lockstep bundle before commit
- Ensure navigation changes don't break QA governance

**v71**: Contract-to-Code Trace Matrix
- Map navigation contract requirements to code locations
- Ensure traceability from contract to implementation

**v72**: Registry Explorer v0
- Unified search interface for all registries
- May integrate with navigation improvements

**v73**: Human Mode vs Evidence Mode
- Refine mode switching based on v69 feedback
- Add more sophisticated mode behavior

## Stop Conditions

Stop immediately if any of the following occur:

1. **Evidence Removal**: Any implementation removes or weakens evidence content
2. **Test Failure**: Any existing Playwright test fails
3. **Data-testid Break**: Any stable data-testid value is broken without migration
4. **Accessibility Violation**: Any accessibility requirement is not met
5. **Forbidden Runtime Change**: Graph/Sigma mutation, audio input, command execution
6. **Animation Beyond Disclosure**: Animation beyond accessible disclosure behavior
7. **Data Loss Risk**: Any implementation risks user data loss or corruption
8. **Contract Violation**: Any implementation violates v68 contract

## Acceptance Criteria

v68 Navigation Contract is accepted when:

1. **Document Exists**: `docs/control-plane/GRAPH_CONTROL_PLANE_NAVIGATION_CONTRACT.md` exists with all required sections
2. **Problem Documented**: Current scroll-wall problem is clearly documented
3. **Navigation Model Defined**: Overview → Drilldown model is clearly defined
4. **Sticky Summary Model Defined**: Sticky summary / mini TOC model is clearly defined
5. **Collapsible Sections Defined**: Collapsible evidence section behavior is clearly defined
6. **Summary Cards Defined**: Compact summary card content and layout is clearly defined
7. **Grouping Defined**: Music Reactive Mapping grouping by mode family is clearly defined
8. **Modes Defined**: Human Mode vs Evidence Mode relationship is clearly defined
9. **Test ID Preservation Defined**: Stable data-testid preservation rules are clearly defined
10. **Accessibility Defined**: Accessibility requirements are clearly defined
11. **Playwright Evidence Defined**: Required Playwright tests are clearly defined
12. **Forbidden Changes Defined**: Forbidden runtime changes are clearly listed
13. **Preconditions Defined**: v69 preconditions are clearly defined
14. **Promotion Path Defined**: v70+ promotion path is clearly defined
15. **Stop Conditions Defined**: Stop conditions are clearly defined
16. **No Implementation**: No runtime code is added in v68 (contract-only)

v68 is contract-only. Implementation is deferred to v69 based on user authorization.