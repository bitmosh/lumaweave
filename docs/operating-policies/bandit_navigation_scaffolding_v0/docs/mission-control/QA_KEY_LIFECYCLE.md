# QA Key Lifecycle

## Purpose

This document defines lifecycle states for QA keys so Bandit can distinguish active work, accepted contracts, historical records, and obsolete tests.

## QA Key Format

Use canonical QA key tags:

```txt
v17
v17a
v17b
v18
v19
```

Rules:

- `v17`, `v18`, `v19` are major QA/topic keys.
- `v17a`, `v17b`, `v17c` are sub-pass or repair keys inside a major topic.
- A `qaKey` binds the checklist, advisory set, report output, dropdown, history, and tests.

## Lifecycle States

### draft

The checklist/advisory set is being authored. It should not be default.

### active

The current default QA key. Only one QA key should be active at a time.

### accepted

The user accepted the QA report. This becomes a contract for future regression checks.

### accepted-with-test-debt

The user accepted runtime behavior, but automated test debt remains. This must be documented and should be followed by a test cleanup pass.

### superseded

A newer QA key replaced this one. It remains useful for history but is no longer active.

### historical

Retained for session history, documentation, or reference. It should not drive current UI state.

### obsolete

No longer valid. Obsolete tests should be removed or replaced, not skipped forever.

## Rules

- Only one QA key can be active.
- Accepted QA reports are contracts.
- Earlier incomplete reports may contain useful notes but are not contracts.
- Accepted-with-test-debt may be committed only if the debt is documented.
- Obsolete test coverage must be deleted or replaced.
- New product topics should receive new major keys.
- Repair passes inside the same topic should use sub-pass keys.

## Acceptance Semantics

```txt
ACCEPT = contract
ACCEPT WITH TEST DEBT = behavior accepted, automated coverage incomplete
INCOMPLETE = useful notes, not a contract
DO NOT ACCEPT = repair or revert required
BLOCKED = cannot evaluate until blocker removed
```

## QA Key Promotion

A QA key can be promoted to accepted only when:

- App opens.
- Relevant feature behavior passes manual QA.
- Typecheck passes.
- Playwright passes.
- Skipped tests are zero or explicitly documented and accepted.
- Header, dropdown, report key, and advisory set all match.

## Example

```txt
v17  active -> accepted-with-test-debt
v17a draft -> active -> accepted
v18  draft -> active
```
