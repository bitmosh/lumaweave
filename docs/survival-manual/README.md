---
id: manual.survival.readme
title: LumaWeave Coding Survival Manual
type: manual
status: accepted
version: v73c
domain: survival-manual
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: v73c
tags: [survival, manual, troubleshooting, agent, operating]
---

# LumaWeave Coding Survival Manual

A compact operating manual for Bandit-style coding agents working on LumaWeave/Lattica.

Core loop:
```
Observe → Classify → Choose Tool → Trace Signal → Patch Smallest Boundary → Prove → Record
```

Use this manual to prevent brute-force patching, stale QA drift, skipped-test debt, and scope creep.

---

## Files

```
01_TROUBLESHOOTING_DECISION_MATRIX.md  ← failure types and first-response rules
02_DIAGNOSTIC_ROUTER.md               ← classify failures before patching
03_TOOL_USE_TRIGGERS.md               ← when to use Playwright, Context7, Sequential Thinking
04_DEBUGGING_LENSES.md                ← 26 ways to reason about problems
05_FAILURE_REPORT_TEMPLATE.md         ← standard failure report format
06_STOP_CONDITIONS.md                 ← when to pause and ask instead of patching
07_PROMPT_BLOCKS.md                   ← copy/paste prompt snippets for Bandit tasks
08_LUMAWEAVE_AGENT_OPERATING_LOOP.md  ← the full agent behavior loop
```

---

## When to Use This Manual

- Before any recovery pass
- When a Playwright cascade appears
- When something fails and the root cause isn't obvious
- When scope is unclear and expanding
- When you've tried one fix and it didn't work

## When NOT to Use This Manual

- During a clean, known-scope pass where everything is going fine
- As a substitute for reading the actual source-of-truth docs

---

## Core Principle

A truthful stopped report is better than a false clean report.

Stop conditions exist to protect the project. Using them correctly is not failure — it is discipline.
