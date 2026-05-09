---
id: agent.survival.manual.readme
title: LumaWeave Coding Survival Manual
type: manual
status: current
cluster: violet
domain: agent
subdomain: survival-manual
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
last_pass: vP-Forensics-2
references:
  - agent.survival.manual.troubleshooting.decision.matrix
  - agent.survival.manual.diagnostic.router
  - agent.survival.manual.tool.use.triggers
  - agent.survival.manual.debugging.lenses
  - agent.survival.manual.failure.report.template
  - agent.survival.manual.stop.conditions
  - agent.survival.manual.prompt.blocks
  - agent.survival.manual.operating.loop
tags:
  - agent
  - survival-manual
  - readme
  - operating-playbook
---

# LumaWeave Coding Survival Manual

A compact operating manual for Bandit-style coding agents working on LumaWeave.

Core loop:

```txt
Observe → Classify → Choose Tool → Trace Signal → Patch Smallest Boundary → Prove → Record
```

Use this manual to prevent brute-force patching, stale QA drift, skipped-test debt, and scope creep.

## Files

1. `01_TROUBLESHOOTING_DECISION_MATRIX.md` — failure types and first-response rules.
2. `02_DIAGNOSTIC_ROUTER.md` — how to classify failures before patching.
3. `03_TOOL_USE_TRIGGERS.md` — when to use Playwright, Context7, and Sequential Thinking MCP.
4. `04_DEBUGGING_LENSES.md` — 26 ways to reason about problems.
5. `05_FAILURE_REPORT_TEMPLATE.md` — standard failure report format.
6. `06_STOP_CONDITIONS.md` — when to pause and ask instead of patching.
7. `07_PROMPT_BLOCKS.md` — copy/paste prompt snippets for future Bandit tasks.
8. `08_LUMAWEAVE_AGENT_OPERATING_LOOP.md` — the full agent behavior loop.
