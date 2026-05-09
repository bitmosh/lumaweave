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

### Already executed

| Source | Action | Output | Status |
|--------|--------|--------|--------|
| `08_GRAPH_VISUAL_TOKEN_MODEL.md` | RETIRE | — | done |
| `01_VISUAL_TOKENS_VS_TYPES.md` | RETIRE | — | done |
| `THEME_MAPPING_SYSTEM_BACKLOG.md` | RETIRE | — | done |

### Cluster 1 Batch 1 — Foundational rewrites

| Source | Action | Output | Status |
|--------|--------|--------|--------|
| `00_THEME_SYSTEM_OVERVIEW.md` | REWRITE + RENAME | `THEME_SYSTEM_OVERVIEW.md` | synced |
| `THEME_TOKEN_PATH_MAP.md` | REWRITE | `THEME_TOKEN_PATH_MAP.md` | synced |
| `01_THEME_PRESET_MODEL.md` | REWRITE + RENAME | `THEME_PRESET_MODEL.md` | synced |
| `06_THEME_TOKEN_COMPATIBILITY.md` | REWRITE + RENAME | `THEME_TOKEN_COMPATIBILITY.md` | synced |
| `THEME_TARGET_REGISTRY.md` | UPDATE | `THEME_TARGET_REGISTRY.md` | synced |
| `REHAUL_LEDGER.md` | NEW | `REHAUL_LEDGER.md` | synced |

### Cluster 1 Batch 2 — Customization + override docs

| Source | Action | Output | Status |
|--------|--------|--------|--------|
| `02_TOP_BAR_THEME_CONTROLS.md` | REWRITE + RENAME | `THEME_TOP_BAR_CONTROLS.md` | synced |
| `26_THEME_ENGINE_AND_STYLE_CUSTOMIZATION.md` | REWRITE + RENAME | `THEME_ENGINE.md` | synced |
| `09_THEME_CUSTOMIZATION_PATH.md` + `13_THEME_CUSTOMIZATION_SCAFFOLDING_PLAN.md` | MERGE + RENAME | `THEME_CUSTOMIZATION_ROADMAP.md` | synced |
| `THEME_OVERRIDE_STORAGE_CONTRACT.md` | UPDATE (woven patch) | `THEME_OVERRIDE_STORAGE_CONTRACT.md` | synced |
| `THEME_MAPPING_PANEL_ENTRY_CONTRACT.md` | UPDATE (woven patch) | `THEME_MAPPING_PANEL_ENTRY_CONTRACT.md` | synced |

### Cluster 1 — Awaiting Phase Y outputs

| Source | Action | Output | Status |
|--------|--------|--------|--------|
| `04_THEME_HANDLESET_INTEGRATION.md` | RETIRE (deferred) | — | proposed |
| `07_THEME_AND_MISSION_CONTROL_HANDLES.md` | RETIRE (deferred) | — | proposed |

### Cluster 1 — Keep (5 contract docs)

| File | Action | Notes |
|------|--------|-------|
| `GRAPH_THEME_TOKEN_VALUE_PREVIEW_CONTRACT.md` | KEEP | v53, current |
| `GRAPH_THEME_TOKEN_VALUE_APPLICATION_CONTRACT.md` | KEEP | v57, current |
| `GRAPH_THEME_APPLICATION_CONTRACT.md` | KEEP | v55 governance |
| `GRAPH_THEME_RUNTIME_APPLICATION_CONTRACT.md` | KEEP | v51 governance |
| `GRAPH_VISUAL_THEME_MAPPING_CONTRACT.md` | KEEP | v49 governance |

**Cluster 1 status:** ✅ Complete except deferred-retire pair

---

## Cluster 3 — Handleset

### PK cleanup (16 prefixed/legacy files removed)

| File | Action | Status |
|------|--------|--------|
| `01_ACTIVE_HANDLES.md` | RETIRE | done |
| `02_PARTIAL_HANDLES.md` | RETIRE | done |
| `03_PLANNED_HANDLES.md` | RETIRE | done |
| `04_BACKEND_FRONTEND_WIRING.md` | RETIRE | done |
| `04_THEME_HANDLESET_INTEGRATION.md` | RETIRE | done |
| `05_RENDERER_BINDINGS.md` | RETIRE | done |
| `05_HANDLESET_PHASE_PLAN.md` | RETIRE | done |
| `06_HANDLES_REQUIRING_QA.md` | RETIRE | done |
| `07_THEME_AND_MISSION_CONTROL_HANDLES.md` | RETIRE | done |
| `08_FUTURE_VISUAL_HANDLES_TAXONOMY.md` | RETIRE | done |
| `09_VISUAL_HANDLE_LIBRARY.md` | RETIRE | done |
| `00_HANDLESET_INDEX.md` | RETIRE | done |
| `00_HANDLESET_CONCEPT.md` | RETIRE | done |
| `03_HANDLESET_ENTRY_SCHEMA.md` | RETIRE | done |
| `10_HANDLESET_AUDIT_PROMPT.md` | RETIRE | done |
| `README_HANDLESET_UPGRADE_PACKET.md` | RETIRE | done |

### Cluster 3 — Keep (4 codebase canonical)

| File | Action | Notes |
|------|--------|-------|
| `ACTIVE_HANDLES.md` | KEEP | v73c canonical |
| `PLANNED_HANDLES.md` | KEEP | v73c canonical |
| `HANDLESET_CONCEPT.md` | KEEP | v73c canonical |
| `FUTURE_VISUAL_HANDLES_TAXONOMY.md` | KEEP | v73c canonical |

**Cluster 3 status:** ✅ Complete (16 → 4, 75% reduction)

---

## Cluster 4 — Visual Grammar Engine

### PK cleanup (3 stale prefixed files removed)

| File | Action | Status |
|------|--------|--------|
| `VISUAL_GRAMMAR_ENGINE_README.md` | RETIRE | done |
| `05_VISUAL_GRAMMAR_AND_SIGNAL_LOOM.md` | RETIRE | done |
| `00_VISUAL_GRAMMAR_ENGINE_OVERVIEW.md` | RETIRE | done |

### Cluster 4 — Light updates (7 docs, frontmatter + cross-refs + v86a status notes)

| Source | Action | Output | Status |
|--------|--------|--------|--------|
| `VGE_OVERVIEW_AND_TERMS.md` | UPDATE | `VGE_OVERVIEW_AND_TERMS.md` | drafted |
| `VGE_GRAMMAR_HANDLE_AND_LENS.md` | UPDATE | `VGE_GRAMMAR_HANDLE_AND_LENS.md` | drafted |
| `VGE_SIGNAL_LOOM.md` | UPDATE | `VGE_SIGNAL_LOOM.md` | drafted |
| `VGE_ASSET_AND_TOKENS.md` | UPDATE | `VGE_ASSET_AND_TOKENS.md` | drafted |
| `VGE_DIALECT_AND_SAFETY.md` | UPDATE | `VGE_DIALECT_AND_SAFETY.md` | drafted |
| `VGE_UI_AND_POSITIONING.md` | UPDATE | `VGE_UI_AND_POSITIONING.md` | drafted |
| `VGE_ROADMAP.md` | UPDATE (id fix) | `VGE_ROADMAP.md` | drafted |

**Cluster 4 status:** Drafted, awaiting codebase sync

---

## Cluster 5 — Lattica Theme Workshop

| File | Action | Status |
|------|--------|--------|
| All 8 Lattica files | ARCHIVE | done |
| `SECURITY_README.md` | ARCHIVE | done |

**Cluster 5 status:** ✅ Complete (archived to operator's machine, v88+ revisit)

---

## Cluster 6 — Arena

| File | Action | Status |
|------|--------|--------|
| All 3 Arena docs | ARCHIVE | done |

**Cluster 6 status:** ✅ Complete (archived)

---

## Cluster 16 — Roadmap

### PK cleanup (7 stale files removed)

| File | Action | Status |
|------|--------|--------|
| `BACKLOG_POLICY.md` | RETIRE | done |
| `FUTURE_IDEAS_INBOX.md` | RETIRE | done |
| `ROADMAP_LUMAWEAVE_MASTER.md` | RETIRE | done |
| `ROADMAP_FEATURE_PRIORITY_MATRIX.md` | RETIRE | done |
| `05_PLAYWRIGHT_SPEC_BACKLOG_POLICY.md` | RETIRE | done |
| `07_PHASE_ROADMAP_AND_BACKLOG.md` | RETIRE | done |
| `03_COLOR_PICKER_ROADMAP.md` | RETIRE | done |

### Cluster 16 — Keep

| File | Action | Notes |
|------|--------|-------|
| `roadmap_BACKLOG_POLICY.md` | KEEP | v74c codebase canonical |
| `roadmap_FUTURE_IDEAS_INBOX.md` | KEEP | codebase canonical |

**Cluster 16 status:** ✅ Complete (9 → 2, 78% reduction)

---

## Phase Y Partial Output

| File | Action | Status |
|------|--------|--------|
| `LINK_NETWORK_OVERVIEW.md` | UPDATE (frontmatter + rehaul-aware framing) | synced |

Bandit's mid-Phase-Y output. Patched with frontmatter and softened "replaces THEME_TOKEN_PATH_MAP" framing. Forward references to per-layer docs and gap docs preserved as Phase Y completion targets.

---

## Confirmed clean clusters (no rehaul work needed)

| Cluster | PK count | Status |
|---------|----------|--------|
| Grammar Lens | 3 | ✅ matches codebase |
| Known Bugs | 2 | ✅ matches codebase |
| Test Forensics | 14 | ✅ matches codebase |
| Physics | 4 | ✅ matches codebase |
| Rendering | 2 | ✅ matches codebase |
| Platform/VR | 4 | ✅ matches codebase |
| Quest | 1 | ✅ matches codebase |

---

## Other clusters pending review

- Cluster 7 — Bandit Brain Docs (~14 docs in PK, all refreshed May 9)
- Cluster 8 — Operating Policies (3 codebase docs)
- Cluster 9 — Survival Manual (9 codebase docs)
- Cluster 10 — Phase Architecture
- Cluster 11 — Layout / Cockpit (5 codebase docs including TOP_BAR_CONTROL_PLAN that needs theme refresh)
- Cluster 12 — Source Adapter (8 codebase docs)
- Cluster 13 — Mission Control / QA (4 codebase docs)
- Cluster 14 — Audio (4 codebase docs)
- Cluster 15 — System Index / Perspective
- Cluster 18 — Misc / Standalone
- Cluster 19 — Git Prep
- Cluster 20 — _NEW-V86_ Canonical (in `docs/updates/v86+_updates/`)

---

## Existing audit doc cleanup

| File | Action | Status |
|------|--------|--------|
| `DOCS_INDEX.md` | KEEP | (kept by operator decision) |
| `DOCS_STALENESS_AUDIT.md` | RETIRE | done |

---

## Pipeline noise removed

| File group | Action | Status |
|------|--------|--------|
| 6 Graphify-generated `.md` files | RETIRE | done |

---

## Obsolete brain docs removed

| File | Action | Status |
|------|--------|--------|
| `99_BANDIT_PHASE_PACKET_PROMPT.md` | RETIRE | done |
| `00_BANDIT_DEVELOPMENT_PROTOCOL.md` | RETIRE | done |
| `08_BANDIT_PROMPT_SOURCE_ADAPTER_BACKLOG.md` | RETIRE | done |

---

## Historical baselines

| File | Action | Status |
|------|--------|--------|
| `35_BASELINE_B_CONSOLIDATION_QA_CHECKLIST.md` | ARCHIVE | done |
| `10_BASELINE_B_GRAPH_VISUAL_SYSTEM_PHASE_PACKET.md` | ARCHIVE | proposed |
| `08_V8_DECISION_NO_ACTIVATION.md` | ARCHIVE | proposed |

---

## Summary Statistics

**As of 2026-05-08:**

- **Project knowledge before rehaul:** ~174 markdown files
- **Project knowledge as of last sync:** ~179 markdown files
- **Removed from project knowledge:** ~50 files across all clusters
- **Drafted (Clusters 1+4 + LINK_NETWORK):** 14 docs
- **Estimated final corpus:** ~120-130 active docs + Phase Y completion outputs

**Cluster progress:**

| Cluster | Docs before | Docs after | Reduction |
|---------|-------------|------------|-----------|
| 1 — Theme | 21 | 10 | 52% |
| 3 — Handleset | 16 | 4 | 75% |
| 4 — VGE | 10 | 7 | 30% (light treatment) |
| 5 — Lattica | 8 | 0 | 100% (archived) |
| 6 — Arena | 3 | 0 | 100% (archived) |
| 16 — Roadmap | 9 | 2 | 78% |

---

## Suggested git commit batches

When ready to clear working tree:

1. Brain doc updates (already staged)
2. Cluster 1 Batch 1 (5 theme docs + ledger)
3. Cluster 1 Batch 2 (3 rewrites + 2 patched contracts)
4. Cluster 4 (7 VGE docs)
5. Phase Y partial (LINK_NETWORK_OVERVIEW)
6. Lattica + Arena archive removals
7. Token census artifacts (Phase X output)
8. vP-Forensics test infrastructure
9. Source code changes (themeOverrideStorage, NodeSphereProgram, deletes)

---

## Tooling backlog

- **Frontmatter validator script** — Node script that reads every `.md` in `docs/`, parses frontmatter, validates required fields, surfaces issues. Highest leverage tool. Catches placeholder values, broken references, missing fields. Recommended for Phase Y completion or earlier.
- **Cross-reference graph generator** — Builds directed graph from `references:` arrays, outputs JSON for radial inspector. Phase Y level work.
- **Batch frontmatter updater** — Apply config-driven bulk changes across cluster. Useful for version bumps, cluster color changes.

---

## Next Actions

1. Stage Cluster 4 drafts in PK (7 VGE files)
2. Drop Cluster 4 drafts in `docs/visual-grammar-engine/`
3. Continue cluster cleanup OR commit working tree to clear backlog
4. Eventually: write frontmatter validator script

---

*This ledger is the single source of truth for rehaul progress. Update on every state change.*
