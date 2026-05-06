---
id: policy.qa.and.playwright
title: QA, Playwright & Acceptance Rules
type: policy
status: accepted
version: v73c
domain: operating-policies
cluster: purple
agent_readable: true
include_in_self_graph: true
last_updated: v73c
tags: [qa, playwright, evidence, lockstep, acceptance, operating]
---

# LumaWeave — QA, Playwright & Acceptance Rules

## Evidence Paths

Accepted evidence paths (in priority order):
1. Playwright assertions
2. In-app QA Debug readouts
3. Visible manual app behavior
4. Typecheck/build output
5. Git diff/file inspection
6. User-provided terminal output when agent is in Locked Terminal Mode

Forbidden evidence paths:
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
cd /home/boop/Projects/lumaweave || exit 1
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
npx playwright test tests/e2e/system-index.spec.ts --reporter=line
```

---

## QA Lockstep Rule

When rotating the active QA key, always update all five together
as a single atomic operation:

```
docs/control-plane/qa/BACKLOG_POLICY.md
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

**Multi-agent rule:** Only one agent may rotate the QA key at a time.
The rotating agent must announce this before starting. The other agent
must not touch QA bundle files during rotation.

---

## Playwright Helper Scope Rule

Shared helpers must not assume unrelated tabs are visible.

```
switchQaKey(page, qaKey)
  → selects dropdown and verifies value only
  → must NOT wait for Advisory tab content

openAdvisoryTab(page)
  → opens Advisory tab explicitly

waitForAdvisorySection(page)
  → waits for qa-advisory-section
  → ONLY after Advisory tab is explicitly opened
```

This rule exists because of a v66 regression where `switchQaKey()`
waited for `qa-advisory-section` during Debug/Checklist tests and
caused timeouts across unrelated tests.

---

## Playwright Cascade Rule

If more than 5 Playwright failures appear simultaneously:
1. Stop feature work immediately
2. Classify the shared root cause
3. Inspect helper/data source/contract drift — a cascade is almost
   always one broken shared thing, not 5 separate problems
4. Do not patch failing tests individually
5. Do not skip tests

Find the one. Patch the one.

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

**Missing proposal/test ID**
→ advisory registry drift. Trace canonical key through registry.

**Current key badge missing**
→ QaPanel default/key rotation drift or selected key state issue.

**Historical key checks failing**
→ historical tests must explicitly select the historical key
  before asserting. Do not rely on default selection.

**Timeout waiting for hidden section**
→ helper scope bug. Check that the relevant tab is open before
  waiting for its content.

**5+ failures simultaneously**
→ cascade. Find the shared root. Do not patch individually.

---

## Screenshot Testing Policy

- Use DOM/evidence tests as primary proof
- Use screenshot tests only for stable DOM UI surfaces
- Do not use pixel-perfect screenshots as primary proof for
  Sigma/canvas/physics behavior
- Canvas/Sigma/3D screenshots require: deterministic seed,
  fixed viewport, fixed camera, reduced motion, disabled
  animation, and tolerance thresholds

---

## Acceptance Report Format

Every accepted pass must include:
```
Validation:
- typecheck:     passed / failed
- Playwright:    N passed, 0 skipped
- test.skip grep: clean / dirty
- git status:    clean / dirty

Forbidden boundary check:
- graph/Sigma mutation:    none
- audio input/playback:   none
- command execution:      none
- storage/persistence:    none unless contracted
- dead controls:          none
- cross-layer violations: none

Agent: [who ran the pass]
```

---

## No-Skip Rule

Never resolve a failing test by skipping it.
Classify the failure and restore coverage.

A skipped test is an acceptance failure.
A truthful stopped report is better than a false clean report.
