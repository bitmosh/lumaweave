# Playwright Spec Backlog Policy

## Purpose

Every recurring bug should become a future automated test when feasible.

## Backlog File

```txt
docs/32_PLAYWRIGHT_TEST_BACKLOG.md
```

## Entry Format

- proposed file name
- behavior to test
- why it matters
- needed data-testid/debug hook
- priority
- blockers

## Good Spec Areas

- hover-state.spec.ts
- label-settings.spec.ts
- selection-regression.spec.ts
- edge-labels.spec.ts
- qa-checklist-versioning.spec.ts
- floating-panels.spec.ts
- graph-visual-policy.spec.ts

## Rule

Do not write brittle visual canvas tests prematurely. Add debug rows/test IDs first.
