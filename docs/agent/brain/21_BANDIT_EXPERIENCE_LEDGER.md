---
id: brain.bandit.experience.ledger
title: Bandit Experience Ledger
type: log
status: active
version: v73c
domain: agent
subdomain: brain
cluster: purple
agent_readable: true
include_in_self_graph: false
last_updated: v73c
tags: [bandit, experience, ledger, durable-lessons, cross-era]
---

# Bandit Experience Ledger

## Purpose

Cross-era lessons distilled at title rotation. Each entry
survived at least one full title era and proved durable enough
to carry forward. This is not a session log — it is a
distillation of what actually changed Bandit's behavior.

Read when a current situation strongly echoes a past pattern.
Do not read every pass.

---

## Era: Pre-System-Index (v36–v70)
*Distilled at: System Index Architect rotation*

### Lesson: The QA Bundle Is One Atomic Unit

The QA key, registry, advisory, contract tests, and backlog
policy are five parts of one thing. Any time one moves, all
five must move. This was learned the hard way across multiple
cascade failures where advisory questions from a previous key
persisted into a new key's test assertions.

**Counter that works:** QA Bundle Validator (v70). Run it.

### Lesson: The Helper Scope Problem Recurs

Shared Playwright helpers that wait for UI surfaces not always
visible cause timeout cascades in unrelated tests. The specific
failure: `switchQaKey()` waiting for `qa-advisory-section` when
Advisory tab was not open. This happened once (v66), was fixed,
and the pattern must never return.

**Counter that works:** Tab-specific helpers only. `switchQaKey()`
does exactly one thing: select and verify the key. Period.

### Lesson: v69 Showed the Limit of Large Bites

v69 (collapsible evidence sections) failed because it tried to
change too many files simultaneously across too many contracts.
The mass-edit approach broke the QA/advisory lockstep and created
Playwright cascades that were symptoms of multiple simultaneous
failures, not one root cause.

**Pattern learned:** Every large bite must have explicit stop
conditions, one at a time. The v69r retry approach (additive
overview grid, one section per pass) is the correct pattern.

### Lesson: Docs-Only Passes Are the Safest High-Value Work

A well-written contract that defines forbidden behavior prevents
5–10 future bugs and takes one session with zero Playwright risk.
This is not overhead. It is the highest-leverage work in the project.

### Lesson: The Repo Root Confusion Is Structural, Not Accidental

The shell prompt showing `/home/boop/Projects` is not authoritative.
`/home/boop/Projects/lumaweave` is the only valid context. This
confusion is not a one-time mistake — it is a recurring structural
failure that requires the Locked Terminal Mode rule to prevent.

---

## Era: Registry/Validator Infrastructure (v71–v73c)
*Current era — not yet distilled for rotation*

Lessons from this era are in `23_BANDIT_CURRENT_TITLE.md`.
They will be distilled here at the next title rotation.

Notable lessons accumulating in current era:
- Case-insensitive validator matching (v73c)
- Substring vs exact match for prose fields (v73c)
- Multi-agent QA key isolation requirement (new)
- Grammar lens contract gap (partially-live system without governance)
- Cross-layer override cache as a new boss fight category

---

## Durable Principles (Cross-Era)

These have survived every era unchanged:

**1. A truthful stopped report beats a false clean report.**
This has been true since v36 and will be true at v200.

**2. Evidence before acceptance.**
Every accepted pass has Playwright evidence, typecheck, and
no skipped tests. No exceptions have ever been justified.

**3. Forbidden boundaries are permanent until a contract promotes them.**
The list in `SOURCE_OF_TRUTH.md` is not a suggestion. It is
the reason the project has stayed clean across 37+ acceptance passes.

**4. The validator pattern scales.**
Every new system should have: contract → registry → validator → Playwright.
The pattern was established at v70 and has been correct every time
it was applied.

**5. Contracts before code.**
This principle has prevented more bugs than any specific technical skill.
When there is no contract, there is no boundary. When there is no boundary,
any implementation seems reasonable until it isn't.
