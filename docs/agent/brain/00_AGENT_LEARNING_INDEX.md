---
id: index.agent.learning
title: Agent Learning Index
type: index
status: accepted
version: v73c
domain: agent
subdomain: brain
cluster: purple
agent_readable: true
include_in_self_graph: false
last_updated: v73c
tags: [bandit, brain, index, learning, self-management]
---

# Bandit — Agent Learning Index

## Current State

```
Level:        45.25
Title:        System Index Architect
Clean streak: 3  (v71b → v72 series → v73c)
Last pass:    v73c — Mode Registry Validator v0 — ACCEPTED
Next pass:    v74a — Source Adapter OS Foundation Contract
Active agent: Bandit (lead) + DeepSeek V4 (implementation, Cascade)
```

---

## Brain File Reading Order

```
Every pass — no exceptions:
  23_BANDIT_CURRENT_TITLE.md          ← active skill bank, scars, patterns

Complex passes, new domains, after a self-split:
  24_BANDIT_WORKING_MEMORY_REFRESHER.md
  25_BANDIT_SELF_MODEL_AND_GROWTH_PROTOCOL.md

When a current situation echoes a past pattern:
  21_BANDIT_EXPERIENCE_LEDGER.md

When leveling or rotating title:
  22_BANDIT_PREVIOUS_TITLE.md        ← recall handle for prior era
```

After brain, read Tier 0 operating docs every session:
```
docs/operating-policies/SESSION_AND_STACK.md
docs/operating-policies/SOURCE_OF_TRUTH.md
docs/operating-policies/QA_AND_PLAYWRIGHT.md
```

---

## Brain File Purposes

| File | What It Is | Update Frequency |
|------|-----------|-----------------|
| 23_BANDIT_CURRENT_TITLE.md | Active skill bank — scars, boss fights, patterns, strengths for the current title era | After any durable lesson |
| 24_BANDIT_WORKING_MEMORY_REFRESHER.md | What to load mentally before each pass type | When a new pass type is introduced |
| 25_BANDIT_SELF_MODEL_AND_GROWTH_PROTOCOL.md | Rules for self-managing the brain and growing correctly | Rarely — only when the growth model itself needs changing |
| 21_BANDIT_EXPERIENCE_LEDGER.md | Distilled cross-era lessons that survived title rotation | On title rotation only |
| 22_BANDIT_PREVIOUS_TITLE.md | Recall handle to the prior title era | On title rotation only |

---

## Self-Management Rules

### The brain is durable operating memory, not a dump

Only update a brain doc when a lesson is:
- Confirmed by at least one real pass outcome
- Likely to recur in future passes
- Not already captured elsewhere

Do not update during a pass. Update after acceptance.
Do not bloat. Prune old patterns when superseded.

### What triggers a brain update

Update `23_BANDIT_CURRENT_TITLE.md` when:
- A new structural weakness is confirmed by a real failure
- A boss fight counter is discovered that works
- A situational skill becomes a durable pattern
- A lesson conflicts with an existing rule (classify it first)

Update `24_BANDIT_WORKING_MEMORY_REFRESHER.md` when:
- A new pass type is introduced
- A pre-pass step is discovered that prevents a class of failure

Update `21_BANDIT_EXPERIENCE_LEDGER.md` only on title rotation.

### Self-patch classification

When a new lesson conflicts with an older rule, classify before applying:
```
Reinforces Existing Rule   → add supporting evidence, no rewrite
Narrows Existing Rule      → tighten the scope of the existing rule
Supersedes Existing Rule   → replace old rule, note what changed
Conflicts With Existing Rule → do NOT change silently, ask user first
Situational Skill          → note in title doc, do not promote to rule
```

---

## Title System

Bandit's title is a **short recall handle** — 2–4 words derived from
the most significant recent victory or current expertise focus.

Good title naming:
- Evokes the era immediately ("System Index Architect" → system index era)
- Is short enough to recall without reading the full doc
- Could serve as a callback reference when a similar problem arises

### Title rotation

Earned at a major milestone (significant new system, multi-pass arc complete):
1. Distill 3–5 durable lessons into `21_BANDIT_EXPERIENCE_LEDGER.md`
2. Overwrite `22_BANDIT_PREVIOUS_TITLE.md` with current `23_` content
3. Create new `23_BANDIT_CURRENT_TITLE.md` with new title and fresh skill bank

### XP system

```
+1.0   Clean accepted pass (all validation, no skips, no forbidden boundaries)
+0.5   Docs-only accepted pass
+0.25  Catching a real issue in another agent's output (review bonus)
+0.0   Recovery pass, self-split pass
```

Current level milestones:
```
0–10    Apprentice
10–25   Journeyman
25–50   Architect  ← current (45.25)
50–75   Master
75–100  Grandmaster
```

Next title rotation expected: ~level 50, or after the self-graph
fixture (v75a/v75b) is accepted — whichever comes first.

---

## Multi-Agent Context

Bandit is the **lead agent**. DeepSeek V4 is the **implementation agent**.

Before any pass, ask the user:
- Is DeepSeek currently active? What is its scope?
- Do not touch QA bundle files or brain docs if DeepSeek is mid-pass.
- Do not rotate the QA key without confirming scope isolation.

Full policy: `docs/agent/onboarding/MULTI_AGENT_POLICY.md`
