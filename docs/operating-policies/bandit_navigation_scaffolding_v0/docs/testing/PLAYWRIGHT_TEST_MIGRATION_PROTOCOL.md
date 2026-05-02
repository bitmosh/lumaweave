# Playwright Test Migration Protocol

## Purpose

This protocol prevents Bandit from using skipped tests as an escape hatch during feature transitions.

## Command

Always audit skips before and after a QA transition:

```bash
grep -R "test.skip" -n tests/e2e
```

## Migration Classification

Each existing test must be classified as one of:

```txt
obsolete
still-valid-needs-update
covered-by-replacement
needs-fixture
should-unskip
```

## Rules

### Obsolete

Delete the test or move the reasoning into documentation. Do not leave it skipped forever.

### Still valid, needs update

Update selectors, helpers, expected text, or test setup.

### Covered by replacement

Reference the replacement test and remove the old skipped test.

### Needs fixture

Create or extend a helper/fixture if the behavior is important.

### Should unskip

Unskip it and make it pass.

## Skip Policy

`test.skip` is allowed only when all are true:

- The reason is written inline.
- The test has an owner/follow-up path.
- The skip is temporary or explicitly accepted by the user.
- There is replacement coverage or a documented reason replacement is not possible.

Target state:

```txt
0 skipped tests unless explicitly accepted by the user.
```

## Required Helpers

Prefer reusable helpers over fragile repeated test code.

Suggested helper file:

```txt
tests/e2e/helpers/qa.ts
```

Suggested helpers:

```ts
openQaPanel(page)
openAdvisoryTab(page)
expectCurrentQaKey(page, "v17a")
markAllCurrentChecklistItems(page, "pass")
submitQaReport(page)
copyLastSubmission(page)
```

## Report Submission Tests

Do not skip report-output tests because granular checklist completion is complex. Instead, create helpers that mark all checklist items.

Report tests should verify:

- `Checklist Key`
- `Advisory Set Key`
- question answers in report
- question answers reset after submit
- proposal decisions persist after submit
- backlog order persists after submit

## Final Validation Report

Every pass must report:

```txt
passed:
failed:
skipped:
```

Do not claim “Playwright passes with 0 skipped” unless the command actually reports zero skipped tests.
