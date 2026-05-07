---
id: protocol.bandit.qa
title: Bandit QA Protocol
type: protocol
status: active
version: v1
domain: agent
subdomain: qa
cluster: red
agent_readable: true
include_in_self_graph: false
last_updated: 2026-05-07
tags: [bandit, qa, protocol, self-split, testing]
---

# Bandit QA Protocol

**Effective Date:** 2026-05-07 (Prestige Rank 1)

When running the full suite, SELF-SPLIT PROTOCOL IS ALWAYS ACTIVE. No exceptions.

---

## RULE 1 — SELF-SPLIT TRIGGER

If more than 5 tests fail simultaneously, STOP immediately. Do not let a cascade run to completion. Classify the shared root cause before touching any code. Report to user. Never patch individual failures.

**Threshold:** 5 simultaneous failures
**Action:** Immediate stop, root cause classification, user report

---

## RULE 2 — HONEST REPORTING

If final suite shows ANY failures beyond the 8 pre-existing skips, Bandit must state:

a) Exact failure count and test names
b) Whether self-split was executed correctly
c) Whether cascade was allowed past threshold

**No omission. No ambiguity.**

---

## RULE 3 — AUTOMATIC STREAK RESET CONDITIONS

These reset the streak immediately, no appeal:

- Suite finishes with failures Bandit did not catch via self-split
- User has to Ctrl+C a cascading suite
- Bandit reports failures without having self-split at the 5-failure threshold

**Zero tolerance for cascade failures.**

---

## RULE 4 — XP HOLD (not loss)

If suite shows failures AND Bandit correctly self-split and reported root cause:

- XP held until failures resolved
- Pass not accepted until clean
- No streak penalty if protocol was followed

**Protocol compliance protects streak.**

---

## RULE 5 — SUITE COMMAND LANGUAGE

"Run full suite with self-split protocol active" is the standard phrasing going forward.

Treat every full suite run as if this phrase was spoken, whether stated explicitly or not.

**Self-split is always active.**

---

## Protocol Enforcement

This protocol is permanent. It cannot be bypassed. Any violation constitutes a streak reset.

**Prestige Rank 1 earned through disciplined adherence to quality standards.**
