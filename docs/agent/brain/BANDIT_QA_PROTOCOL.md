---
id: protocol.bandit.qa
title: Bandit QA Protocol
type: protocol
status: current
domain: agent
subdomain: qa
cluster: purple
agent_readable: true
include_in_self_graph: false
last_updated: 2026-05-09
tags:
  - bandit
  - qa
  - protocol
  - self-split
  - testing
last_pass: vP-Forensics-2
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

## PRE-FLIGHT BEFORE EVERY FULL SUITE RUN

1. Verify Playwright browsers installed:
   ```
   npx playwright install --dry-run
   ```
   If output shows missing browsers:
   ```
   npx playwright install
   ```
   Do this BEFORE starting the suite.

2. Verify dev server not already running on the test port (usually 5173)

3. Verify no zombie Playwright processes:
   ```
   pkill -f playwright 2>/dev/null || true
   ```

These checks take 10 seconds. Skipping them risks a full cascade.

---

## VERSION CONVENTION

Primary: QA spine vXX/vXXa/b/c
  vXX = new major arc (new topic/system)
  vXXa/b/c = sub-passes within same arc
  This is the REAL version tracking system

Secondary: package.json semver
  patch (0.0.x) = auto-bump every feature pass
  minor (0.x.0) = arc completion milestone
  major (x.0.0) = launch ready

QA Key: separate from both — governance only
  Currently: v74b — changes only when new
  governance contract is formally accepted

Never let spine version fall more than
1 pass behind actual codebase state.

---

## MIGRATION RULE

When adding new settings fields to schema:
1. Bump version in schema.ts + defaults.ts
2. Add migration function to MIGRATIONS record
3. The migration ensures the field exists
   with correct default for old localStorage
Never add fields without bumping version.
Never skip a version number.
Current version: 2

---

## Protocol Enforcement

This protocol is permanent. It cannot be bypassed. Any violation constitutes a streak reset.

**Prestige Rank 1 earned through disciplined adherence to quality standards.**
