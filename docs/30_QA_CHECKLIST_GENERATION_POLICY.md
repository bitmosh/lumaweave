# QA Checklist Generation Policy

## Overview

This document defines the policy for generating focused follow-up QA checklists after failed manual QA runs. The goal is to avoid repeatedly asking already-passed stable checks while ensuring that newly changed or related systems are properly tested.

## Baseline vs Follow-up Checklists

### Baseline Checklist
A baseline checklist is a comprehensive acceptance suite for a feature or system. It includes all relevant checks for the feature's complete functionality and integration points.

**When to use:**
- Initial feature acceptance
- Major version changes
- Architecture overhauls
- When requested explicitly

**Characteristics:**
- Full coverage of feature functionality
- Integration checks with related systems
- Edge cases and error handling
- Performance and usability checks

### Follow-up Checklist
A follow-up checklist is a focused subset of checks targeting specific areas that changed or could have regressed after a failed QA run.

**When to use:**
- After a failed baseline or follow-up QA run
- After targeted fixes to specific subsystems
- When addressing specific bugs or issues

**Characteristics:**
- Failed checks from previous run
- Related regression checks for systems that interact with fixed areas
- Newly added or changed functionality
- Focused scope, not comprehensive

## Follow-up Checklist Composition

A follow-up checklist should include:

1. **Failed checks from previous run** - All checks that failed in the immediately preceding QA run for the same feature.

2. **Related regression checks** - Checks for systems that interact with the areas being fixed. For example:
   - If hover styling is fixed, include selection highlight checks
   - If label rendering is fixed, include label mode checks
   - If QA panel behavior is changed, include persistence and submission checks

3. **Newly changed systems** - Any new functionality or behavior added in the fix.

4. **Integration points** - Checks that verify the fixed area integrates correctly with its dependencies.

## What NOT to Include in Follow-up Checklists

Do not include:
- Checks that passed in the previous run unless the related system changed
- Unrelated system checks
- Checks for systems that were not touched by the fix
- Broad architectural checks unless the architecture changed

## Example: Label Hover + Edge Font + QA Reset Follow-up v0

This follow-up checklist was generated after a failed QA run for Label Controls Repair v0. The failures were:
- Hover label readability (white text on white background)
- Hover stale style (colors not resetting cleanly)

The follow-up focuses on:
1. Hover label readability (failed check)
2. Hover style resets (failed check)
3. Selected node highlight persistence (related to hover styling)
4. Selection clearing behavior (related to hover/selection interaction)
5. Edge label depth regression (related to label system changes)
6. Edge label font size (newly added setting)
7. QA submit reset (newly added behavior)
8. Selection regression checks (ensuring hover/selection fixes didn't break existing selection)

## Dynamic Generation Guidelines (Future)

When implementing a dynamic checklist generator:

1. **Input:** Previous QA report with failed checks, changed files list, feature ID.

2. **Analysis:**
   - Extract failed check IDs
   - Map failed checks to their subsystems
   - Identify related subsystems through dependency mapping
   - Identify newly added functionality from changed files

3. **Generation:**
   - Start with all failed checks
   - Add related checks for identified subsystems
   - Add checks for new functionality
   - Remove duplicate checks
   - Order checks logically (setup → core → edge cases → cleanup)

4. **Validation:**
   - Ensure no unrelated checks are included
   - Ensure all critical paths are covered
   - Keep checklist size reasonable (aim for 10-20 checks max)

## Manual Follow-up Checklist Definition

For the current follow-up (Label Hover + Edge Font + QA Reset Follow-up v0):

**Feature name:** Label Hover + Edge Font + QA Reset Follow-up v0

**Checks:**
1. hover-label-readable - Hovered node label is readable (not white-on-white)
2. hover-style-resets - Hovered node color resets cleanly after cursor leaves
3. selected-node-highlight-persists - Selected node remains highlighted after click
4. selected-node-clears-on-background - Selected node clears when clicking background
5. selected-node-clears-on-edge-selection - Selected node clears when selecting an edge
6. edge-selected-neighborhood-depth-regression - Edge labels still follow neighborhood depth correctly
7. edge-label-font-size-control-visible - Edge Label Font Size slider appears in settings
8. edge-label-font-size-affects-rendering - Changing Edge Label Font Size visibly affects edge labels
9. qa-refresh-before-submit-preserves-form - Browser refresh before Submit preserves notes/status
10. qa-submit-clears-working-form - Submit clears working form but preserves submitted artifact
11. selection-regression-node-edge-background - Selection behavior still works for nodes, edges, and background

## Policy Version

This is v0 of the QA Checklist Generation Policy. It will be refined as more follow-up checklists are generated and patterns emerge.
