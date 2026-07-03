---
id: policy.qa.and.playwright
title: LumaWeave — QA, Playwright & Acceptance Rules
type: policy
status: current
cluster: violet
domain: operating-policies
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
references:
  - policy.session.and.stack
  - policy.source.of.truth
  - quest.template
tags:
  - policy
  - qa
  - playwright
  - acceptance
  - evidence
  - v86a
---

# LumaWeave — QA, Playwright & Acceptance Rules

## Evidence Paths

Accepted evidence paths:
1. Playwright assertions
2. In-app QA Debug readouts
3. Visible manual app behavior
4. Typecheck/build output
5. Git diff/file inspection
6. User-provided terminal output when Bandit is in Locked Terminal Mode

Forbidden or discouraged evidence paths:
1. Manual DevTools JavaScript
2. Manual inspection of JS object arrays as sole evidence
3. "Trust me from code inspection"
4. Requiring the user to run ad-hoc `window.__...` probe commands
5. Skipped tests
6. Weakening tests to match broken behavior
7. Treating fallback advisory as current-pass evidence

---

## Required Validation Commands

For runtime/QA/test changes:
```bash
cd "$(git rev-parse --show-toplevel)" || exit 1
npm run typecheck
npm run qa:e2e
grep -R "test.skip" -n tests/e2e || true
git status --short
git diff --name-only
```

For targeted debugging:
```bash
npx playwright test tests/e2e/contract-registry.spec.ts --reporter=line
npx playwright test tests/e2e/graph-visual-inventory.spec.ts --reporter=line
```

---

## QA Lockstep Rule

When rotating the active QA key, always update all five together:
```
docs/roadmap/BACKLOG_POLICY.md
src/control-plane/qa/QaPanel.tsx
src/control-plane/qa/qa-registry.ts
src/control-plane/qa/advisory-registry.ts
tests/e2e/contract-registry.spec.ts
```

Every active QA key must have:
- Registry checklist entries
- Advisory section
- Proposal IDs expected by tests
- Backlog rows expected by tests
- Contract-registry constants aligned

---

## Playwright Helper Scope Rule

Shared helpers must not assume unrelated tabs are visible.

**Correct pattern:**
```
switchQaKey(page, qaKey)
  → selects dropdown and verifies value only

openAdvisoryTab(page)
  → opens Advisory tab

waitForAdvisorySection(page)
  → waits for qa-advisory-section ONLY when Advisory tab is visible/needed
```

This rule came from a v66 helper regression where `switchQaKey()` waited for `qa-advisory-section` during Debug/Checklist tests and caused timeouts.

---

## Playwright Cascade Rule

If more than 5 Playwright failures appear:
1. Stop feature work immediately.
2. Classify the shared root cause.
3. Inspect helper/data source/contract drift — the cascade is almost always one broken shared thing.
4. Do not patch failing tests individually.
5. Do not skip tests.

A cascade is not 5 separate problems. Find the one.

---

## QA Drift Checklist

When contract-registry tests fail around proposals/backlog/current key:
1. Check `CURRENT_QA_KEY`
2. Check `PRIMARY_PROPOSAL_ID` and `SECONDARY_PROPOSAL_ID`
3. Verify active advisory section exists
4. Verify proposal IDs exist in active advisory
5. Verify active advisory has backlog rows
6. Verify fallback advisory is not being used
7. Verify helper waits are tab-specific

---

## Failure Classification

**Missing proposal/test ID** → usually advisory registry drift.

**Current key badge missing** → usually QaPanel default/key rotation drift or selected key state issue.

**Historical key checks failing** → historical tests must explicitly select the historical key before asserting.

**Timeout waiting for hidden section** → usually a helper scope bug; check that the relevant tab is open before waiting for its content.

---

## Screenshot Testing Policy

- Use DOM/evidence tests as primary proof.
- Use screenshot tests only for stable DOM UI surfaces.
- Do not use pixel-perfect screenshots as primary proof for Sigma/canvas/physics behavior.
- Canvas/Sigma/3D screenshots require: deterministic seed, fixed viewport, fixed camera, reduced motion, disabled animation, and tolerance thresholds.

---

## Acceptance Report Format

Every accepted pass must include:
```
Validation:
- typecheck: passed/failed
- Playwright: N passed, 0 skipped
- test.skip grep: clean/dirty
- git status: clean/dirty

Forbidden boundary check:
- graph/Sigma mutation: none
- audio input/playback: none
- command execution: none
- storage/persistence: none unless contracted
- dead controls: none
```

---

## No-Skip Rule

Never resolve a failing test by skipping it. Classify the failure and restore coverage.

A truthful stopped report is better than a false clean report.

---

*Frontmatter added v86a. BACKLOG_POLICY path updated from `docs/control-plane/qa/` to `docs/roadmap/`. All other policies preserved as timeless principles.*
