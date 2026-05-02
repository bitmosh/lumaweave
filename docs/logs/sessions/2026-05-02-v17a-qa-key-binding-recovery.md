# Session Log: v17a QA Key Binding Recovery

## Goal
Restore the QA Key Binding Recovery pass so that v17a is the canonical QA key across Mission Control, advisory content, and Playwright coverage, eliminating skipped tests while proving persistence signals.

## Files Changed
- src/control-plane/qa/QaPanel.tsx
- src/control-plane/qa/qa-registry.ts
- src/control-plane/qa/advisory-registry.ts
- tests/e2e/helpers/qa.ts
- tests/e2e/contract-registry.spec.ts
- docs/mission-control/QA_ADVISORY_PROTOCOL.md

## Root Causes
1. Legacy v17 defaults left the panel header/dropdown/report identity unsynchronized with the new v17a pass.
2. Proposal decisions, backlog order, and question answers lacked durable/local reset guarantees, so persistence tests were skipped.
3. Playwright helpers had no way to traverse granular checklist items, preventing direct assertions for Typecheck/Playwright checks.

## What Changed
- Added canonical localStorage helpers plus `data-testid` hooks in QaPanel to lock dropdown/header/report/advisory onto `v17a` and persist durable fields.
- Replaced the skipped Playwright scenarios with real coverage using new helper utilities that walk each checklist item.
- Ensured the advisory registry explicitly defines v17a-specific questions/proposals/backlog plus documentation that now references the v17a identity format.

## Validation
- `npm run typecheck`
- `npm run qa:e2e` (53 passed / 0 failed / 0 skipped)

## Accepted QA Result
- Checklist Key: v17a
- Advisory Set Key: v17a
- Decision: ACCEPT
- Pass/fail: 18 pass / 0 fail / 0 untested

## Remaining Follow-up
Report-Based Question Generation — schedule once the v17a identity model stays stable across a full release cycle.
