# Pass Transition Protocol

## Purpose

Bandit must use this protocol whenever moving from one QA pass, checklist version, advisory set, or implementation slice to another. The goal is to prevent identity drift, stale advisory questions, skipped-test buildup, and half-switched runtime states.

## Standard Pass Transition Checklist

1. Identify the previous `qaKey`.
2. Choose the new `qaKey`.
3. Decide whether this is a major topic or sub-pass:
   - Use `v17a`, `v17b`, `v17c` for continuation, repair, or cleanup passes inside the same major topic.
   - Use `v18`, `v19`, etc. for new major topics.
4. Create or update the QA checklist.
5. Create or update the advisory set.
6. Bind dropdown, header badge, report key, history entry, and advisory content to the same `qaKey`.
7. Confirm stale localStorage cannot override the active `qaKey`.
8. Migrate Playwright tests.
9. Remove or replace obsolete tests.
10. Run typecheck and Playwright.
11. Record the exact skipped-test count.
12. Create a session log.
13. Report acceptance honestly.

## Required Identity Surfaces

Every active pass must keep these surfaces aligned:

- QA dropdown selected value
- Header badge
- Active checklist object
- Submitted report `Checklist Key`
- Submitted report `Advisory Set Key`
- Copy Last Submission output
- QA history entry
- Debug diagnostics
- Advisory question set

If any disagree, the pass is not acceptable.

## Major Version vs Sub-Pass

Use sub-pass keys when continuing the same topic:

```txt
v17  = Canonical QA key binding
v17a = QA key binding recovery / skipped-test cleanup
v17b = report-based question protocol
```

Use a new major key for a new topic:

```txt
v18 = control handle / settings key alignment
v19 = theme token path map
v20 = graph visual state policy
```

## Transition Stop Conditions

Stop and report instead of continuing if:

- Active checklist cannot be identified.
- Dropdown and header disagree.
- Submitted report key differs from advisory set key.
- Playwright fails.
- Playwright has new skipped tests without explicit replacement coverage.
- Runtime app cannot be opened.
- Graph renderer disappears or crashes.

## Final Report Requirements

Every transition pass final report must include:

```md
## Previous qaKey

## New qaKey

## Identity Surfaces

- Header:
- Dropdown:
- Report Key:
- Advisory Set Key:
- Debug Diagnostics:

## Validation

- Typecheck:
- Playwright:
- Passed:
- Failed:
- Skipped:

## Test Migration

## Remaining Risks
```
