---
id: protocol.qa.key.lifecycle
title: QA Key Lifecycle
type: protocol
status: accepted
domain: agent
subdomain: protocols
cluster: violet
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
tags:
  - qa
  - key
  - lifecycle
  - versioning
  - protocol
references:
  - protocol.pass.transition
  - policy.qa.and.playwright
last_pass: vP-Forensics-2
---

# QA Key Lifecycle

Defines lifecycle states for QA keys so Bandit can distinguish active work, accepted contracts, historical records, and obsolete tests.

---

## QA Key Format

```
v74      major key
v74a     sub-pass within v74 arc
v74b     sub-pass within v74 arc
v75      next major key
```

Rules:
- `v74`, `v75`, `v76` are major QA / topic keys
- `v74a`, `v74b` are sub-pass or repair keys inside a major topic
- A qaKey binds: checklist, advisory set, report output, dropdown, history, tests

---

## Lifecycle States

```
draft              Being authored. Not yet the default.

active             Current default QA key.
                   Only ONE key may be active at a time.

accepted           User accepted the QA report.
                   This becomes a contract for future regression checks.

accepted-with-debt User accepted runtime behavior but automated
                   test debt remains. Must be documented. Follow-up
                   test cleanup pass required.

superseded         A newer key replaced this one. Retained for history.
                   No longer drives UI state.

historical         Retained for session history and reference.
                   Does not drive current UI state.

obsolete           No longer valid. Tests must be removed or replaced,
                   not skipped forever.
```

---

## Acceptance Semantics

```
ACCEPT                 = contract — behavior is proven and binding
ACCEPT WITH TEST DEBT  = behavior accepted, automated coverage incomplete
INCOMPLETE             = useful notes, not a contract
DO NOT ACCEPT          = repair or revert required
BLOCKED                = cannot evaluate until blocker removed
```

---

## Accepted-Unverified Lifecycle State

QA keys increment every accepted pass regardless of whether an in-app QA report was submitted.

Passes without submitted reports use lifecycle state:
  accepted-unverified

Rules:
- Not a failure. Not a blocker.
- Pass was accepted via Playwright + typecheck evidence
- In-app QA report was not submitted
- Archived and available to pull up later if needed
- No effect on future passes or clean streak
- QA key still increments normally on the next pass

Retroactive application:
- Passes v69–v73c are retroactively accepted-unverified
- The registry moves forward from v74b
- Do not attempt to backfill submitted reports for these passes

---

## QA Key Promotion Rules

A QA key can be promoted to accepted only when:

```
□ App opens cleanly
□ Relevant feature behavior passes QA
□ Typecheck passes
□ Full Playwright passes
□ Skipped tests: zero (or explicitly documented with replacement coverage)
□ Header, dropdown, report key, and advisory set all match
□ No other agent is mid-rotation on the same key
```

---

## Key Rotation Rule

Only one agent may rotate the QA key at a time. The rotating agent must:
1. Announce rotation to user before starting
2. Confirm no other agent is touching QA bundle files
3. Update all five QA bundle files atomically
4. Run QA Bundle Validator: `node scripts/validate-qa-bundle.mjs`
