---
id: protocol.pass.transition
title: Pass Transition Protocol
type: protocol
status: accepted
domain: agent
subdomain: protocols
cluster: violet
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
tags:
  - pass
  - transition
  - QA
  - key
  - rotation
  - protocol
references:
  - protocol.qa.key.lifecycle
  - policy.qa.and.playwright
last_pass: vP-Forensics-2
---

# Pass Transition Protocol

Use this protocol whenever moving from one QA pass, checklist version, advisory set, or implementation slice to another. Prevents identity drift, stale advisory questions, skipped-test buildup, and half-switched runtime states.

---

## Standard Pass Transition Checklist

```
1. Identify the previous qaKey
2. Choose the new qaKey
3. Decide: major key or sub-pass key?
     v74, v75, v76        → major key (new topic)
     v74a, v74b, v74c     → sub-pass (continuation / repair within same topic)
4. Update QA checklist entry
5. Update advisory set
6. Bind all five identity surfaces to the same qaKey:
     dropdown, header badge, report key, history entry, advisory content
7. Confirm stale localStorage cannot override the active qaKey
8. Migrate Playwright tests (update or replace, never skip)
9. Remove or replace obsolete tests
10. Run typecheck and full Playwright suite
11. Record exact skipped-test count (must be zero)
12. Print acceptance report
```

---

## Required Identity Surfaces — All Must Agree

Every active pass must keep these surfaces aligned:

```
QA dropdown selected value
Header badge
Active checklist object
Submitted report "Checklist Key"
Submitted report "Advisory Set Key"
Copy Last Submission output
QA history entry
Debug diagnostics
Advisory question set
```

If any disagree, the pass is not acceptable.

---

## Major Key vs Sub-Pass Key

```
Major key  → new product topic, new primary QA focus
             Example: v74 = Source Adapter OS Foundation

Sub-pass   → continuation, repair, or cleanup within same topic
             Example: v74a = Foundation Contract (docs-only)
                      v74b = Registry + Validator
```

Use sub-pass keys for passes within the same arc. Increment major key for a new arc.

---

## Transition Stop Conditions

Stop and report instead of continuing if:

```
- Active checklist cannot be identified
- Dropdown and header badge disagree
- Submitted report key differs from advisory set key
- Playwright fails
- Playwright has new skipped tests without explicit replacement coverage
- Runtime app cannot be opened
- Graph renderer disappears or crashes
- Another agent is currently rotating the QA key
```

---

## Final Report Requirements

Every transition pass must include:

```
Previous qaKey:
New qaKey:

Identity Surfaces:
  Header:
  Dropdown:
  Report Key:
  Advisory Set Key:
  Debug Diagnostics:

Validation:
  Typecheck:
  Playwright: N passed / N failed / N skipped
  test.skip grep: clean / dirty
  git status: clean / dirty

Test Migration:
  [what was updated, replaced, or removed]

Remaining Risks:
  [anything that needs follow-up]
```
