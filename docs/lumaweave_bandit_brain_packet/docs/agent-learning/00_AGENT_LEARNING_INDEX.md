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
| `10_SELF_SPLITTING_QUEST_PROTOCOL.md` | Defines operating protocol for long quests with architecture boundary splitting. |
| `11_QUEST_MODE_PROMPT_TEMPLATE.md` | Template for assigning Bandit longer LumaWeave arcs with Quest Mode. |
| `12_QUEST_MODE_FIELD_GUIDE.md` | Field guide for when to use Quest Mode and how to identify good/bad quest candidates. |
| `graphs/identity_system_graph.md` | Relationship graph for IDs, contracts, runtime, DOM, and tests. |
| `graphs/theme_contract_pipeline.md` | Theme Token Path → Theme Target Registry → DOM marker → overlay → QA pipeline. |
| `graphs/qa_contract_pipeline.md` | QA/advisory/test evidence pipeline. |

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

Do not update this folder for:

- random implementation notes
- temporary debugging thoughts
- stale plans
- duplicate logs
- speculative ideas better suited for roadmap/backlog docs

## Cleanup Policy

If a note is temporary, put it in a session log instead. If a note changes future agent behavior, put it here. If a note is obsolete, remove it or replace it with the current rule.
