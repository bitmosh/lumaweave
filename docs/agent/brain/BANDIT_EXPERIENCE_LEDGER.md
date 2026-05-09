---
id: brain.bandit.experience.ledger
title: Bandit Experience Ledger
type: log
status: current
domain: agent
subdomain: brain
cluster: violet
agent_readable: true
include_in_self_graph: false
last_updated: 2026-05-09
tags:
  - bandit
  - experience
  - ledger
  - durable-lessons
  - cross-era
last_pass: vP-Forensics-2
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
*Distilled at: Living Graph Architect rotation (LEVEL 100 MILESTONE)*

### Lesson: Validator-First Pattern

When a new registry or contract system is introduced, the validator
script comes before UI or runtime promotion. Validators are not
afterthoughts — they are the acceptance gate.

Pattern:
```
contract (docs-only)
→ registry (TypeScript, read-only)
→ validator script (validates registry against contract)
→ Playwright proves validator runs and passes
→ UI only after all above are clean
```

This pattern prevented multiple cascade failures where UI was built
before the contract boundary was validated.

### Lesson: Contract-First Discipline

No implementation without a contract. This principle prevented more
bugs than any specific technical skill. When there is no contract,
there is no boundary. When there is no boundary, any implementation
seems reasonable until it isn't.

The Graph/Sigma boundary preservation (never mutate without contract)
was a direct application of this discipline and prevented multiple
graph state corruption issues.

### Lesson: Sigma v3 Drag Pattern

No plugin needed. Use sigma.on("downNode") + container
mousemove/mouseup events. Convert coords with sigma.viewportToGraph()
using getBoundingClientRect() for offset. Set node attribute
"fixed":true during drag to prevent FA2 fighting the drag.
Disable camera during drag to prevent pan conflict.
Always clean up event listeners in useEffect return.

This pattern enabled node dragging without external dependencies
and became a reusable template for all Sigma interaction work.

### Lesson: Louvain Community Detection for Universal Helix

Helix dialect groups nodes by cluster, but external graph sources
lack cluster data. Run Louvain community detection before helix
layout to auto-assign communities. Map community numbers to brand
cluster colors (0→blue, 1→purple, 2→gold, 3→teal, 4→green, 5+→gray).
Only assign clusters to nodes that don't already have them — fixture
nodes keep manual clusters.

Pattern:
```
build graph → louvain.assign() → map community to cluster → applyHelixLayout()
```

This enabled the helix physics dialect to work with any graph source,
not just pre-clustered fixtures.

### Lesson: Case-Insensitive and Substring-Aware Validator Matching

Validators checking string fields should always use case-insensitive
matching unless the schema explicitly requires case-sensitive values.
Use substring matching (.includes()) for descriptive prose fields.
Use exact matching only for IDs, keys, and enum values.

Learned: v73c — `"Diagnostic IDs"` vs `"diagnostic IDs"` caused
silent validator failure. `"accepted evidence hiding"` vs `"no evidence hiding"` —
the meaning was the same, the string was not.

These two patterns together made validators robust against string
formatting differences while still enforcing strict constraints on
identifiers.

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
