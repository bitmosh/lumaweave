---
id: docs.rehaul.ledger
title: Documentation Rehaul Ledger
type: ledger
status: active
version: v86a
domain: docs
cluster: purple
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-08
references:
  - docs.rehaul.audit
tags: [docs, rehaul, ledger, tracking, v86a]
---

# Documentation Rehaul Ledger

Tracks every action taken during the documentation rehaul project. Cross-references to git tracking when codebase sync happens.

---

## Conventions

**Action types:**
- `RETIRE` — Doc deleted from project knowledge and codebase
- `ARCHIVE` — Doc removed from project knowledge and codebase, kept on operator's machine for reference
- `REWRITE` — Doc replaced with new content under same or new filename
- `MERGE` — Multiple docs combined into single new doc
- `RENAME` — Filename changed, content essentially preserved
- `UPDATE` — Light content refresh, structure preserved
- `NEW` — New doc created from scratch (no source doc)
- `KEEP` — No action; doc stays as-is

**Status values:**
- `proposed` — Decided but not yet executed
- `drafted` — New content written, not yet synced to codebase
- `staged` — In project knowledge, awaiting codebase sync
- `synced` — Reflected in codebase, git commit landed
- `done` — Fully complete, all states aligned

---

## Cluster 1 — Theme System

### Already executed (no longer in project knowledge)

| Source | Action | Output | Status | Git suggested commit |
|--------|--------|--------|--------|---------------------|
| `08_GRAPH_VISUAL_TOKEN_MODEL.md` | RETIRE | — | done | `docs(theme): retire 08_GRAPH_VISUAL_TOKEN_MODEL.md (superseded by three-tier model in v86a)` |
| `01_VISUAL_TOKENS_VS_TYPES.md` | RETIRE | — | done | `docs(theme): retire 01_VISUAL_TOKENS_VS_TYPES.md (concept absorbed into tier model docs)` |
| `THEME_MAPPING_SYSTEM_BACKLOG.md` | RETIRE | — | done | `docs(theme): retire THEME_MAPPING_SYSTEM_BACKLOG.md (v18a backlog has been delivered)` |

### Cluster 1 Batch 1 — Foundational rewrites (this session)

| Source | Action | Output | Status | Git suggested commit |
|--------|--------|--------|--------|---------------------|
| `00_THEME_SYSTEM_OVERVIEW.md` | REWRITE + RENAME | `THEME_SYSTEM_OVERVIEW.md` | drafted | `docs(theme): rewrite THEME_SYSTEM_OVERVIEW for v86a (three-tier model, 6 themes, link network)` |
| `THEME_TOKEN_PATH_MAP.md` | REWRITE | `THEME_TOKEN_PATH_MAP.md` | drafted | `docs(theme): rewrite THEME_TOKEN_PATH_MAP for v86a (40 canonical + 12 planned, tier classification)` |
| `01_THEME_PRESET_MODEL.md` | REWRITE + RENAME | `THEME_PRESET_MODEL.md` | drafted | `docs(theme): rewrite THEME_PRESET_MODEL for v86a (current 6 themes, assetRefs field, tier integration)` |
| `06_THEME_TOKEN_COMPATIBILITY.md` | REWRITE + RENAME | `THEME_TOKEN_COMPATIBILITY.md` | drafted | `docs(theme): rewrite THEME_TOKEN_COMPATIBILITY for v86a (preserve hierarchy, update VGE references)` |
| `THEME_TARGET_REGISTRY.md` | UPDATE | `THEME_TARGET_REGISTRY.md` | drafted | `docs(theme): update THEME_TARGET_REGISTRY (refresh entries from current themeTargetRegistry.ts)` |

### Cluster 1 Batch 2 — Customization + override docs (next session)

| Source | Action | Output | Status | Git suggested commit |
|--------|--------|--------|--------|---------------------|
| `02_TOP_BAR_THEME_CONTROLS.md` | REWRITE + RENAME | `THEME_TOP_BAR_CONTROLS.md` | proposed | `docs(theme): rewrite THEME_TOP_BAR_CONTROLS for v86a (6 themes, current AppShell)` |
| `26_THEME_ENGINE_AND_STYLE_CUSTOMIZATION.md` | REWRITE + RENAME | `THEME_ENGINE.md` | proposed | `docs(theme): rewrite THEME_ENGINE for v86a (tier model, drop renamed tokens)` |
| `09_THEME_CUSTOMIZATION_PATH.md` + `13_THEME_CUSTOMIZATION_SCAFFOLDING_PLAN.md` | MERGE + RENAME | `THEME_CUSTOMIZATION_ROADMAP.md` | proposed | `docs(theme): merge customization path docs into THEME_CUSTOMIZATION_ROADMAP` |
| `THEME_OVERRIDE_STORAGE_CONTRACT.md` | UPDATE | `THEME_OVERRIDE_STORAGE_CONTRACT.md` | proposed | `docs(theme): update THEME_OVERRIDE_STORAGE_CONTRACT (v86a status note, link to tier docs)` |
| `THEME_MAPPING_PANEL_ENTRY_CONTRACT.md` | UPDATE | `THEME_MAPPING_PANEL_ENTRY_CONTRACT.md` | proposed | `docs(theme): update THEME_MAPPING_PANEL_ENTRY_CONTRACT (v86a status note)` |

### Cluster 1 — Awaiting Phase Y outputs

| Source | Action | Output | Status | Notes |
|--------|--------|--------|--------|-------|
| `04_THEME_HANDLESET_INTEGRATION.md` | RETIRE (deferred) | — | proposed | Retire AFTER Phase Y produces `LAYER_1_HANDLE_REGISTRY.md` and `LAYER_2_CONTROL_SURFACE_CONTRACT.md` |
| `07_THEME_AND_MISSION_CONTROL_HANDLES.md` | RETIRE (deferred) | — | proposed | Same — content absorbed by Phase Y outputs |

### Cluster 1 — Keep (5 contract docs)

| File | Action | Notes |
|------|--------|-------|
| `GRAPH_THEME_TOKEN_VALUE_PREVIEW_CONTRACT.md` | KEEP | v53, current, no changes |
| `GRAPH_THEME_TOKEN_VALUE_APPLICATION_CONTRACT.md` | KEEP | v57, current, no changes |
| `GRAPH_THEME_APPLICATION_CONTRACT.md` | KEEP (light note) | v55 governance, executed in v86a — minor "v86a Update" line at top |
| `GRAPH_THEME_RUNTIME_APPLICATION_CONTRACT.md` | KEEP (light note) | v51 governance, executed in v86a — minor "v86a Update" line at top |
| `GRAPH_VISUAL_THEME_MAPPING_CONTRACT.md` | KEEP (light note) | v49 governance, defines what is now Layer 3 — minor "v86a Update" line at top |

---

## Other clusters (placeholder — populated as we progress)

### Cluster 2 — Graph Theme Contracts
*(merged into Cluster 1 above; standalone graph contracts noted under Keep)*

### Cluster 3 — Handleset
*(pending review)*

### Cluster 4 — Visual Grammar Engine
*(pending operator decision: alive concept or shelved)*

### Cluster 5 — Lattica Theme Workshop

| File | Action | Status | Notes |
|------|--------|--------|-------|
| `LATTICA_THEME_WORKSHOP_THREAT_MODEL.md` | ARCHIVE | done | Operator's machine archive |
| `LATTICA_THEME_WORKSHOP_SECURITY_PROTOCOL.md` | ARCHIVE | done | Operator's machine archive |
| `LATTICA_THEME_BUNDLE_FORMAT_CONTRACT.md` | ARCHIVE | done | Operator's machine archive |
| `LATTICA_THEME_PROVENANCE_AND_SIGNATURE_POLICY.md` | ARCHIVE | done | Operator's machine archive |
| `LATTICA_THEME_SANDBOX_AND_EXECUTION_BOUNDARY.md` | ARCHIVE | done | Operator's machine archive |
| `LATTICA_THEME_SUBMISSION_FILTER_PIPELINE.md` | ARCHIVE | done | Operator's machine archive |
| `LATTICA_ROADMAP_REALIGNMENT_V67.md` | ARCHIVE | done | Operator's machine archive |
| `SECURITY_README.md` | ARCHIVE | done | Operator's machine archive |

### Cluster 6 — Arena
*(all archived to operator's machine — no longer in project knowledge)*

### Cluster 7 — Bandit Brain Docs
*(pending review — most files refreshed via May 9 uploads)*

### Cluster 8 — Operating Policies
*(pending review — most KEEP expected)*

### Cluster 9 — Survival Manual
*(pending review — most KEEP expected)*

### Cluster 10 — Phase Architecture
*(pending review)*

### Cluster 11 — Layout / Cockpit
*(pending review — likely needs major rewrites)*

### Cluster 12 — Source Adapter
*(pending review)*

### Cluster 13 — Mission Control / QA
*(pending review)*

### Cluster 14 — Audio
*(pending review)*

### Cluster 15 — System Index / Perspective
*(pending review)*

### Cluster 16 — Roadmaps

| File | Action | Status |
|------|--------|--------|
| `ROADMAP_LUMAWEAVE_MASTER.md` | REWRITE (proposed) | proposed |
| `ROADMAP_FEATURE_PRIORITY_MATRIX.md` | REWRITE (proposed) | proposed |

### Cluster 17 — Token Census Outputs
*(KEEP — Phase X working artifacts)*

### Cluster 18 — Misc / Standalone
*(pending review)*

### Cluster 19 — Git Prep
*(pending review — likely RETIRE if git is initialized)*

### Cluster 20 — _NEW-V86_ Canonical
*(KEEP — truth-anchor cluster)*

### Existing audit docs

| File | Action | Status |
|------|--------|--------|
| `DOCS_INDEX.md` | RETIRE | done |
| `DOCS_STALENESS_AUDIT.md` | RETIRE | done |

### Pipeline noise (one-time cleanup)

| Files | Action | Status |
|-------|--------|--------|
| 6 Graphify-generated `.md` files | RETIRE | done |

### Obsolete brain docs (no codebase counterpart)

| File | Action | Status |
|------|--------|--------|
| `99_BANDIT_PHASE_PACKET_PROMPT.md` | RETIRE | done |
| `00_BANDIT_DEVELOPMENT_PROTOCOL.md` | RETIRE | done |
| `08_BANDIT_PROMPT_SOURCE_ADAPTER_BACKLOG.md` | RETIRE | done |

### Historical baselines

| File | Action | Status |
|------|--------|--------|
| `35_BASELINE_B_CONSOLIDATION_QA_CHECKLIST.md` | ARCHIVE | done |
| `10_BASELINE_B_GRAPH_VISUAL_SYSTEM_PHASE_PACKET.md` | ARCHIVE | proposed (not yet pulled) |
| `08_V8_DECISION_NO_ACTIVATION.md` | ARCHIVE | proposed (not yet pulled) |

---

## Summary Statistics

**As of 2026-05-08:**

- **Total docs at start of rehaul:** ~174
- **Removed from project knowledge:** 22 (lattica 8, baseline 1 done + 2 pending, graphify 6, audit 2, brain 3)
- **Newly drafted (Cluster 1 Batch 1):** 5
- **Pending drafting:** ~25-30 across remaining clusters
- **Estimated final corpus:** ~120 active docs + Phase Y outputs (10 new)

**Cluster 1 progress:**
- 21 docs at start
- 3 retired
- 5 drafted (this batch)
- 5 proposed for Batch 2
- 5 keep
- 2 deferred-retire (after Phase Y)

---

## Next Actions

1. Operator review Batch 1 drafts
2. Operator stages drafts in project knowledge (replace old versions)
3. Operator commits to git with suggested commit messages above
4. Continue with Cluster 1 Batch 2 (when ready)
5. Proceed to next cluster after Cluster 1 fully closed

---

*This ledger is the single source of truth for rehaul progress. Update on every state change.*
