---
id: log.bandit.changelog
title: Bandit Changelog
type: log
status: active
domain: agent
subdomain: leveling
cluster: gray
agent_readable: true
include_in_self_graph: false
last_updated: repair-pass-v75b
tags: [changelog, log, bandit, agent, operational]
---

# Bandit Changelog

Operational event log. One entry per accepted pass or significant event.
Updated by the agent that ran the pass before XP is awarded.

**Format:**
```
[date] · [version] · [pass-type] · ACCEPTED — [one-line summary] — [Playwright count] — [agent]
```

**Pass types:** contract · registry · validator · passive-ui · playwright · runtime · docs · multi-agent

---

## 2026-05-06

```
2026-05-06 · repair-pass-v75b · playwright · ACCEPTED — Repair pass,
  fixed 6 pre-existing failures + 2 fixture interference issues,
  347 passed 9 skipped 0 failed (up from 341 passed 6 failed),
  testid updates (command-deck, graph-visual-inventory x2,
  theme-target-inspector x2), overlay selector fix,
  mode-aware assertions for physics tests — Bandit

2026-05-06 · v75b · passive-ui · ACCEPTED — Self-Graph visual refinement,
  cluster colors + size hierarchy, 341 passed 6 pre-existing
  failures (2 healed), streak 4 — Bandit

2026-05-06 · v75a · playwright · ACCEPTED — Self-Graph Fixture + First Demo Surface,
  58 nodes, 43 edges, brand color clusters, adapter to Sigma,
  4/4 self-graph tests passing — Playwright: 339 passed, 9 skipped,
  8 pre-existing failures (command-deck, graph-visual-inventory x2,
  graph-visual-state-stability x3, theme-target-inspector x2) — Bandit

2026-05-06 · v74c · passive-ui · ACCEPTED — Source Adapter Evidence Panel,
  6 Playwright tests, 343 passed 9 skipped (6 pre-existing deferred,
  3 conditional for passive UI structure) — Bandit

2026-05-06 · grammar-lens-contract · docs · ACCEPTED — Grammar Lens Contract
  + Cursor Inspector Contract, formalizes overlay governance before
  further implementation — no runtime changes — Bandit

2026-05-06 · v74b · registry · ACCEPTED — Source Adapter Base Registry + Validator,
  9 adapter entries, 12 validation checks against v74a contract —
  Playwright: 340 passed, 6 skipped — Bandit

2026-05-06 · v73c · validator · ACCEPTED — Mode Registry Validator v0,
  validates modeMetadataRegistry against v73a contract — [verify count] — Bandit
  Note: v73c was ready for validation at session start; confirm committed.

2026-05-06 · docs-rewrite · docs · IN PROGRESS — Full docs restructure:
  new folder architecture, frontmatter schema, 18 new docs written —
  SESSION_AND_STACK, SOURCE_OF_TRUTH, BANDIT_PROTOCOL, BANDIT_SELF_SPLIT_PROTOCOL,
  MULTI_AGENT_POLICY, NEW_AGENT_ONBOARDING, QUEST_TEMPLATE, BANDIT_CHANGELOG,
  BANDIT_ERROR_LOG all drafted — Claude (analysis/writing agent)
```

---

## Changelog Entry Instructions

### When to add an entry

Add an entry when:
- A pass is accepted (ACCEPT recommendation, all validation passed)
- A docs-only pass produces new files
- A significant architectural decision is made and recorded
- Multi-agent handoff occurs

Do NOT add entries for:
- Recovery passes (use BANDIT_ERROR_LOG.md instead)
- Self-split reports (use BANDIT_ERROR_LOG.md instead)
- Speculative or draft work not yet accepted

### How to fill the entry

```
[date] · [version] · [pass-type] · [ACCEPTED / IN PROGRESS / DOCS-ONLY]
  — [one sentence: what was done and what it produced]
  — [Playwright: N passed, 0 skipped / "no tests touched"]
  — [agent name]
```

If multiple things happened in one session, use multiple lines:

```
2026-05-06 · v74a · contract · ACCEPTED — Source Adapter OS Foundation Contract
  — no tests touched (docs-only) — Bandit

2026-05-06 · v74b · registry · ACCEPTED — Source Adapter Base Registry + Validator
  — 12 new tests, 280 total passed, 0 skipped — DeepSeek V4
```

---

## All-Time Pass Count

| Agent  | Accepted Passes | Last Pass | Current Streak |
|--------|----------------|-----------|----------------|
| Bandit | 5 (v74b, grammar-lens-contract, v75a, v75b, repair-pass-v75b) | repair-pass-v75b | 5 |
| DeepSeek | 0            | —         | 0              |

*Update this table after each accepted pass.*
