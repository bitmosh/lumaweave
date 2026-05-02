# Documentation Staleness Audit

**Date:** 2026-05-02
**Baseline:** v15

## Superseded Docs

### README.md
- **Path:** README.md
- **Status:** superseded
- **Reason:** Generic Tauri template, not LumaWeave-specific
- **Action:** Do not delete (historical reference), but users should use LUMAWEAVE_CURRENT_STATE_HANDOFF.md instead
- **Recommendation:** Replace with LumaWeave-specific README when ready

## Stale Docs (May Need Review)

### Roadmap Docs
- **docs/ROADMAP_LUMAWEAVE_MASTER.md**
  - **Status:** needs-review
  - **Reason:** Mentions "NEAR STABLE" for Baseline B, but we're now at v15 with Mission Control Advisory Cleanup
  - **Action:** Update to reflect v15 baseline state
  - **Recommendation:** Review and update priority chains to reflect current state

- **docs/ROADMAP_FEATURE_PRIORITY_MATRIX.md**
  - **Status:** needs-review
  - **Reason:** May not reflect v15 changes or current priorities
  - **Action:** Review against current state
  - **Recommendation:** Update feature priorities based on v15 baseline

### Theme Docs
- **docs/26_THEME_ENGINE_AND_STYLE_CUSTOMIZATION.md**
  - **Status:** needs-review
  - **Reason:** Theme system has evolved since initial design
  - **Action:** Review against current theme implementation
  - **Recommendation:** Update to reflect current theme architecture

### Interaction Docs
- **docs/28_PARALLEL_INTERACTION_STRUCTURE.md**
  - **Status:** needs-review
  - **Reason:** Interaction model may have evolved
  - **Action:** Review against current interaction implementation
  - **Recommendation:** Update if interaction model changed

### Handleset Docs
- **docs/handleset/01_ACTIVE_HANDLES.md**
  - **Status:** needs-review
  - **Reason:** Active handles may have changed with v15
  - **Action:** Review against current implementation
  - **Recommendation:** Update to reflect current active handles

- **docs/handleset/02_PARTIAL_HANDLES.md**
  - **Status:** needs-review
  - **Reason:** Partial handles may have changed
  - **Action:** Review against current implementation
  - **Recommendation:** Update to reflect current partial handles

- **docs/handleset/03_PLANNED_HANDLES.md**
  - **Status:** needs-review
  - **Reason:** Planned handles may need updating based on v15
  - **Action:** Review against current priorities
  - **Recommendation:** Update to reflect current plans

- **docs/handleset/04_BACKEND_FRONTEND_WIRING.md**
  - **Status:** needs-review
  - **Reason:** Wiring may have evolved
  - **Action:** Review against current architecture
  - **Recommendation:** Update if wiring changed

- **docs/handleset/05_RENDERER_BINDINGS.md**
  - **Status:** needs-review
  - **Reason:** Renderer bindings may have evolved
  - **Action:** Review against current renderer
  - **Recommendation:** Update if bindings changed

- **docs/handleset/06_HANDLES_REQUIRING_QA.md**
  - **Status:** needs-review
  - **Reason:** QA requirements may have changed
  - **Action:** Review against current QA state
  - **Recommendation:** Update to reflect current QA needs

- **docs/handleset/07_THEME_AND_MISSION_CONTROL_HANDLES.md**
  - **Status:** needs-review
  - **Reason:** Mission Control has evolved with v15
  - **Action:** Review against current MC implementation
  - **Recommendation:** Update to reflect v15 Mission Control state

### Layout Docs
- **docs/layout/00_COCKPIT_LAYOUT_OVERVIEW.md**
  - **Status:** needs-review
  - **Reason:** Layout may have evolved
  - **Action:** Review against current layout
  - **Recommendation:** Update if layout changed

- **docs/layout/01_PANEL_ZONES.md**
  - **Status:** needs-review
  - **Reason:** Panel zones may have changed
  - **Action:** Review against current panel structure
  - **Recommendation:** Update if zones changed

- **docs/layout/02_TOP_BAR_CONTROL_PLAN.md**
  - **Status:** needs-review
  - **Reason:** Top bar may have evolved
  - **Action:** Review against current top bar
  - **Recommendation:** Update if top bar changed

### Testing Docs
- **docs/32_PLAYWRIGHT_TEST_BACKLOG.md**
  - **Status:** needs-review
  - **Reason:** Test backlog may be outdated
  - **Action:** Review against current test coverage
  - **Recommendation:** Update to reflect current test needs

## Historical Docs (Should Remain Historical)

### Baseline B Docs
- **docs/BASELINE_B_CLOSURE_REPORT.md**
  - **Status:** historical
  - **Reason:** Baseline B closure report
  - **Action:** Keep as historical reference
  - **Recommendation:** Do not edit, preserve for historical context

- **docs/35_BASELINE_B_CONSOLIDATION_QA_CHECKLIST.md**
  - **Status:** historical
  - **Reason:** Baseline B QA checklist
  - **Action:** Keep as historical reference
  - **Recommendation:** Do not edit, preserve for historical context

### Session Logs
- **docs/logs/sessions/baseline-b-** (multiple files)
  - **Status:** historical
  - **Reason:** Baseline B implementation sessions
  - **Action:** Keep as historical reference
  - **Recommendation:** Do not edit, preserve for historical context

- **docs/logs/sessions/baseline-c-** (multiple files)
  - **Status:** historical
  - **Reason:** Baseline C planning sessions
  - **Action:** Keep as historical reference
  - **Recommendation:** Do not edit, preserve for historical context

- **docs/logs/sessions/2025-01-XX-** (multiple files)
  - **Status:** historical
  - **Reason:** Early implementation sessions
  - **Action:** Keep as historical reference
  - **Recommendation:** Do not edit, preserve for historical context

- **docs/logs/sessions/edge-** (multiple files)
  - **Status:** historical
  - **Reason:** Edge interaction implementation sessions
  - **Action:** Keep as historical reference
  - **Recommendation:** Do not edit, preserve for historical context

- **docs/logs/sessions/floating-panels-layout-v0.md**
  - **Status:** historical
  - **Reason:** Floating panels layout session
  - **Action:** Keep as historical reference
  - **Recommendation:** Do not edit, preserve for historical context

- **docs/logs/sessions/graph-normalizer-v0.md**
  - **Status:** historical
  - **Reason:** Graph normalizer implementation
  - **Action:** Keep as historical reference
  - **Recommendation:** Do not edit, preserve for historical context

- **docs/logs/sessions/graph-source-loader-v0.md**
  - **Status:** historical
  - **Reason:** Graph source loader implementation
  - **Action:** Keep as historical reference
  - **Recommendation:** Do not edit, preserve for historical context

## Source-of-Truth Docs (Current)

### Current State
- **docs/LUMAWEAVE_CURRENT_STATE_HANDOFF.md**
  - **Status:** source-of-truth
  - **Reason:** Current v15 baseline state
  - **Action:** Keep as current reference
  - **Recommendation:** Update on baseline changes

- **docs/DOCS_INDEX.md**
  - **Status:** source-of-truth
  - **Reason:** Documentation index
  - **Action:** Keep as current reference
  - **Recommendation:** Update when docs change

- **docs/DOCS_STALENESS_AUDIT.md**
  - **Status:** source-of-truth
  - **Reason:** Staleness audit
  - **Action:** Keep as current reference
  - **Recommendation:** Update when docs change

### Policy Docs
- **docs/30_QA_CHECKLIST_GENERATION_POLICY.md**
  - **Status:** policy
  - **Reason:** QA checklist generation policy
  - **Action:** Keep as current policy
  - **Recommendation:** Update if policy changes

- **docs/27_FEATURE_REGISTRATION_STANDARD.md**
  - **Status:** policy
  - **Reason:** Feature registration standard
  - **Action:** Keep as current policy
  - **Recommendation:** Update if standard changes

- **docs/33_GRAPH_VISUAL_POLICY_V0.md**
  - **Status:** policy
  - **Reason:** Graph visual policy
  - **Action:** Keep as current policy
  - **Recommendation:** Update if policy changes

### Testing Docs
- **docs/LUMAWEAVE_PLAYWRIGHT_TESTING_GUIDE.md**
  - **Status:** source-of-truth
  - **Reason:** Playwright testing guide
  - **Action:** Keep as current reference
  - **Recommendation:** Update if testing approach changes

### Handleset Docs
- **docs/handleset/00_HANDLESET_INDEX.md**
  - **Status:** source-of-truth
  - **Reason:** Handleset index
  - **Action:** Keep as current reference
  - **Recommendation:** Update if handleset changes

## Future Ideas Docs (Should Remain)

### Future Concepts
- **docs/FUTURE_IDEAS_INBOX.md**
  - **Status:** future-ideas
  - **Reason:** Future feature concepts
  - **Action:** Keep as future reference
  - **Recommendation:** Do not delete, use for planning

- **docs/handleset/08_FUTURE_VISUAL_HANDLES_TAXONOMY.md**
  - **Status:** future-ideas
  - **Reason:** Future visual handles taxonomy
  - **Action:** Keep as future reference
  - **Recommendation:** Do not delete, use for planning

- **docs/graph-intelligence/CLUSTER_GRAVITY_AND_COLOR_CODED_NEIGHBORHOODS.md**
  - **Status:** future-ideas
  - **Reason:** Future cluster gravity feature
  - **Action:** Keep as future reference
  - **Recommendation:** Do not delete, use for planning

## Recent Session Logs (v15)

### v15 Sessions
- **docs/logs/sessions/2026-05-02-v15-baseline-lock.md**
  - **Status:** session-log
  - **Reason:** v15 baseline lock
  - **Action:** Keep as current reference
  - **Recommendation:** Do not edit, preserve for historical context

- **docs/logs/sessions/2026-05-01-mission-control-advisory-cleanup-v15.md**
  - **Status:** session-log
  - **Reason:** v15 implementation
  - **Action:** Keep as current reference
  - **Recommendation:** Do not edit, preserve for historical context

- **docs/logs/sessions/2026-05-01-advisory-backlog-priority-reorder-v0.md**
  - **Status:** session-log
  - **Reason:** v14 backlog reorder
  - **Action:** Keep as current reference
  - **Recommendation:** Do not edit, preserve for historical context

- **docs/logs/sessions/2026-05-01-bandit-toolbelt-architecture-v0.md**
  - **Status:** session-log
  - **Reason:** Bandit architecture
  - **Action:** Keep as current reference
  - **Recommendation:** Do not edit, preserve for historical context

- **docs/logs/sessions/2026-05-01-theme-system-phase-1a-complete.md**
  - **Status:** session-log
  - **Reason:** Theme system implementation
  - **Action:** Keep as current reference
  - **Recommendation:** Do not edit, preserve for historical context

## Summary

### Docs to Update Before Next Major Work
1. docs/ROADMAP_LUMAWEAVE_MASTER.md - Update to reflect v15
2. docs/ROADMAP_FEATURE_PRIORITY_MATRIX.md - Update priorities
3. docs/handleset/07_THEME_AND_MISSION_CONTROL_HANDLES.md - Update for v15 MC
4. docs/32_PLAYWRIGHT_TEST_BACKLOG.md - Update test backlog

### Docs to Keep Historical
- All baseline-b- session logs
- All 2025-01-XX session logs
- All edge- session logs
- BASELINE_B_CLOSURE_REPORT.md
- 35_BASELINE_B_CONSOLIDATION_QA_CHECKLIST.md

### Docs to Keep Current
- LUMAWEAVE_CURRENT_STATE_HANDOFF.md
- DOCS_INDEX.md
- DOCS_STALENESS_AUDIT.md
- All policy docs
- All testing guides
- Recent v15 session logs

### Docs to Keep for Future
- FUTURE_IDEAS_INBOX.md
- All future-ideas docs
