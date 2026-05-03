# LumaWeave Agent Learning Index

## Purpose

This folder is the structured external memory layer for Bandit and future coding agents working on LumaWeave.

The goal is not to store random notes. The goal is to preserve project-specific operating knowledge that prevents repeated failures during contract-heavy development.

Use this folder when a pass involves:

- contract registries
- QA/advisory artifacts
- theme token paths
- theme target IDs
- DOM evidence markers
- Playwright witnesses
- Mission Control behavior
- recovery after tangled state
- migration from older structures into newer typed systems

## Core Rule

Do not treat accepted behavior, stable IDs, QA strings, DOM witnesses, or Playwright selectors as disposable implementation details.

Modernization means preserving accepted contracts while wrapping them in clearer, typed, validated structures.

## Files

| File | Purpose |
| --- | --- |
| `01_IDENTITY_SYSTEMS_MAP.md` | Defines key project identity systems and what must not be confused. |
| `02_CONTRACT_MIGRATION_RULES.md` | Explains how old accepted structures become new registries without breaking contracts. |
| `03_TANGLE_MODE_PROTOCOL.md` | Required operating procedure when failures cascade or the repo enters tangled state. |
| `04_FAULT_POINT_LEDGER.md` | Running ledger of failures, causes, and preventive rules. |
| `05_PASS_PREBRIEF_TEMPLATE.md` | Template Bandit should complete before risky implementation passes. |
| `06_PASS_POSTMORTEM_TEMPLATE.md` | Template Bandit should complete after a pass or recovery. |
| `07_CANONICAL_TERMS_GLOSSARY.md` | Short definitions for repeated terms and stable naming conventions. |
| `08_QA_PLAYWRIGHT_EVIDENCE_POLICY.md` | Defines accepted QA/Playwright evidence paths and forbids manual DevTools, skipped tests, and weakened tests as acceptance shortcuts. |
| `09_SELF_SPLITTING_QUEST_PROTOCOL.md` | Defines operating protocol for long quests with architecture boundary splitting. |
| `10_QUEST_MODE_PROMPT_TEMPLATE.md` | Template for assigning Bandit longer LumaWeave arcs with Quest Mode. |
| `11_QUEST_MODE_FIELD_GUIDE.md` | Field guide for when to use Quest Mode and how to identify good/bad quest candidates. |
| `12_PLAYWRIGHT_OPERATING_PROCEDURES.md` | Defines Playwright regression-containment procedures, failure classification, state isolation, locator discipline, and test-cascade handling. |
| `13_MCP_TOOL_SUITE_PROTOCOL.md` | Defines when and how Bandit should use Sequential Thinking, Context7, and Playwright MCP during LumaWeave work. |
| `14_BANDIT_ABILITY_AUDIT.md` | Profiles Bandit's current strengths, weaknesses, abilities, upgrade priorities, boss fights, and training rules. |
| `15_PLAYWRIGHT_WORKING_PATTERN_DIFF_AUDIT.md` | Defines how Bandit should compare failing tests against working Playwright patterns and the last accepted green commit before repairing cascades. |
| `16_SELF_IMPROVEMENT_SUGGESTION_BOX.md` | Tracks recurring Bandit friction, weaknesses, near-misses, and proposed operating improvements. |
| `17_PASS_FRICTION_REPORT_TEMPLATE.md` | Template for after-action friction reports after failed, risky, recovery, Playwright-heavy, or Quest Mode passes. |
| `18_REPO_ROOT_SANDBOX_PROTOCOL.md` | Defines the strict repo-root confinement rule for all LumaWeave commands and requires use of scripts/lw-repo-run.sh wrapper. |
| `20_BANDIT_LEVELING_AND_FEEDBACK_PROTOCOL.md` | Defines Bandit's positive reinforcement, level-up rules, clean-pass criteria, and success-reporting format. |
| `21_BANDIT_EXPERIENCE_LEDGER.md` | Growing ledger of reusable lessons extracted from Bandit's successful level-up/title reports and clean Quest Mode passes. |
| `22_BANDIT_PREVIOUS_TITLE.md` | Stores the immediately previous Bandit title/level summary so only the latest two title records are kept. |
| `23_BANDIT_CURRENT_TITLE.md` | Stores the current Bandit title/level summary and points durable lessons into the experience ledger. |
| `graphs/identity_system_graph.md` | Relationship graph for IDs, contracts, runtime, DOM, and tests. |
| `graphs/theme_contract_pipeline.md` | Theme Token Path → Theme Target Registry → DOM marker → overlay → QA pipeline. |
| `graphs/qa_contract_pipeline.md` | QA/advisory/test evidence pipeline. |

## High-Risk Reading Sets

For long or broad tasks, read:

```txt
09_SELF_SPLITTING_QUEST_PROTOCOL.md
10_QUEST_MODE_PROMPT_TEMPLATE.md
11_QUEST_MODE_FIELD_GUIDE.md
14_BANDIT_ABILITY_AUDIT.md
```

For Playwright-heavy work or test cascades, read:

```txt
08_QA_PLAYWRIGHT_EVIDENCE_POLICY.md
12_PLAYWRIGHT_OPERATING_PROCEDURES.md
15_PLAYWRIGHT_WORKING_PATTERN_DIFF_AUDIT.md
```

For MCP-assisted work, uncertain API behavior, UI inspection, or graph physics preparation, read:

```txt
13_MCP_TOOL_SUITE_PROTOCOL.md
14_BANDIT_ABILITY_AUDIT.md
```

For recovery, postmortem, or repeated-agent-error work, read:

```txt
04_FAULT_POINT_LEDGER.md
06_PASS_POSTMORTEM_TEMPLATE.md
14_BANDIT_ABILITY_AUDIT.md
16_SELF_IMPROVEMENT_SUGGESTION_BOX.md
17_PASS_FRICTION_REPORT_TEMPLATE.md
```

## Agent Operating Loop

Use this loop during sensitive phases:

```txt
Study → Explain Understanding → Compare Against Source of Truth → Patch Narrowly → Validate → Postmortem → Update Learning Docs
```

## When To Update This Folder

Update this folder when:

- a repeated failure pattern is found
- a new stable identity type is introduced
- an accepted QA contract becomes source of truth
- a recovery reveals a strategic mistake
- a naming convention becomes contract-critical
- a new future system depends on today’s scaffold
- a new tool-use rule changes future Bandit behavior
- a Playwright cascade reveals a reusable diagnosis pattern
- a working-pattern diff audit identifies a stable selector/helper contract

Do not update this folder for:

- random implementation notes
- temporary debugging thoughts
- stale plans
- duplicate logs
- speculative ideas better suited for roadmap/backlog docs

## Cleanup Policy

If a note is temporary, put it in a session log instead. If a note changes future agent behavior, put it here. If a note is obsolete, remove it or replace it with the current rule.
