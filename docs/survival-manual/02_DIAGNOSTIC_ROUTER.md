---
id: manual.diagnostic.router
title: Diagnostic Router
type: manual
status: accepted
version: v73c
domain: survival-manual
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: v73c
tags: [diagnostic, router, classification, failures, survival]
---

# Diagnostic Router

Before patching any failure, classify it using this router.

---

## Decision Tree

**1. Missing executable / package / browser / port / permission?**
Classification: `Environment Prerequisite`
Action: Repair safe local prerequisite or ask user before sudo/system changes. Do not edit app code.

**2. Selector timeout, strict-mode violation, element exists visually but test can't find it?**
Classification: `Selector / Test Harness Mismatch`
Action: Inspect UI with Playwright. Prefer stable `data-testid`. Update test/selector or add stable test ID.

**3. Header / dropdown / report / advisory key mismatch?**
Classification: `Identity / Key Drift`
Action: Trace canonical key through registry → UI → report → advisory → localStorage.

**4. State resets or persists incorrectly?**
Classification: `Persistence / Reset Bug`
Action: Classify state as durable / per-pass / per-report / per-session / stateless before patching.

**5. Browser visual behavior, console error, graph disappears, UI blanks?**
Classification: `Runtime Lifecycle / Regression`
Action: Reproduce with Playwright. Inspect console. Trace lifecycle boundary. Patch smallest ordering issue.

**6. Tests targeting old qaKeys, old UI, or old advisory content?**
Classification: `Obsolete Test / Spec Debt`
Action: Delete or replace with current equivalent. Do not skip.

**7. Fix requires files outside intended scope?**
Classification: `Scope Creep / Architecture Boundary Issue`
Action: Pause and report before expanding scope.

**8. Uncertainty about external API / library behavior?**
Classification: `Dependency / API Uncertainty`
Action: Use Context7 before patching.

**9. Contract document path doesn't match actual source file?**
Classification: `Docs / Source-of-Truth Drift`
Action: Update the doc. Do not change source to match stale doc path.

**10. Another agent has modified a file you need?**
Classification: `Multi-Agent Collision`
Action: Stop. Report both states to user. Do not merge unilaterally.

**11. None of the above, or genuinely unknown?**
Classification: `Unknown`
Action: Stop. Report what you observed. Do not guess and patch.

---

## Required Failure Report Fields

For every classified issue, report:

```
Input signal:
Transformation point:
Expected output:
Observed output:
Classification:
Tool used:
Smallest safe fix:
Proof after fix:
```

---

## Do Not

- Patch from vibes
- Skip tests to make the suite green
- Call app unstable when the environment is missing a prerequisite
- Expand scope without reporting why
- Attempt a 4th strategy after 3 distinct failures
