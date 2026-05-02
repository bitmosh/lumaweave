# LumaWeave Documentation Index

**Last Updated:** 2026-05-02
**Baseline:** v15

## Current Baseline Docs

### Source-of-Truth
- **docs/LUMAWEAVE_CURRENT_STATE_HANDOFF.md** - Current stable state handoff, v15 baseline locked
  - Status: source-of-truth
  - Purpose: Complete current state snapshot for handoff
  - When to read: Starting new work, after returning to project

### Session Logs
- **docs/logs/sessions/2026-05-02-v15-baseline-lock.md** - v15 baseline lock session
  - Status: session-log
  - Purpose: v15 baseline verification and lock
  - When to read: Understanding v15 baseline state

- **docs/logs/sessions/2026-05-01-mission-control-advisory-cleanup-v15.md** - v15 implementation session
  - Status: session-log
  - Purpose: Mission Control Advisory Cleanup v15 implementation
  - When to read: Understanding v15 changes

- **docs/logs/sessions/2026-05-01-advisory-backlog-priority-reorder-v0.md** - v14 backlog reorder
  - Status: session-log
  - Purpose: Advisory Backlog Priority Reorder v0
  - When to read: Understanding backlog reorder feature

- **docs/logs/sessions/2026-05-01-bandit-toolbelt-architecture-v0.md** - Bandit architecture
  - Status: session-log
  - Purpose: Bandit Toolbelt architecture design
  - When to read: Understanding Bandit system

- **docs/logs/sessions/2026-05-01-theme-system-phase-1a-complete.md** - Theme system implementation
  - Status: session-log
  - Purpose: Theme system phase 1a
  - When to read: Understanding theme system

- **docs/logs/sessions/baseline-b-closure-handleset-cluster-scaffold-v0.md** - Baseline B closure
  - Status: session-log
  - Purpose: Baseline B handleset cluster scaffold
  - When to read: Understanding Baseline B

- **docs/logs/sessions/baseline-b-consolidation-** - Multiple consolidation sessions
  - Status: session-log
  - Purpose: Baseline B consolidation work
  - When to read: Understanding Baseline B history

- **docs/logs/sessions/baseline-b-control-surface-consolidation-v0.md** - Control surface
  - Status: session-log
  - Purpose: Control surface consolidation
  - When to read: Understanding control surface

- **docs/logs/sessions/baseline-b-label-semantics-consolidation-v0.md** - Label semantics
  - Status: session-log
  - Purpose: Label semantics consolidation
  - When to read: Understanding label system

- **docs/logs/sessions/baseline-b-runtime-diagnostics-v0.md** - Runtime diagnostics
  - Status: session-log
  - Purpose: Runtime diagnostics
  - When to read: Understanding diagnostics

- **docs/logs/sessions/baseline-b-stability-pack-v0.md** - Stability pack
  - Status: session-log
  - Purpose: Stability pack implementation
  - When to read: Understanding stability features

- **docs/logs/sessions/baseline-b-viewport-stability-v0.md** - Viewport stability
  - Status: session-log
  - Purpose: Viewport stability
  - When to read: Understanding viewport behavior

- **docs/logs/sessions/baseline-c-kickoff-control-surface-os-v0.md** - Baseline C kickoff
  - Status: session-log
  - Purpose: Baseline C kickoff
  - When to read: Understanding Baseline C plans

- **docs/logs/sessions/edge-hover-parity-v0.md** - Edge hover
  - Status: session-log
  - Purpose: Edge hover parity
  - When to read: Understanding edge interaction

- **docs/logs/sessions/edge-selection-node-label-depth-parity-v0.md** - Edge selection
  - Status: session-log
  - Purpose: Edge selection parity
  - When to read: Understanding edge selection

- **docs/logs/sessions/edge-selection-v0.md** - Edge selection
  - Status: session-log
  - Purpose: Edge selection implementation
  - When to read: Understanding edge selection

- **docs/logs/sessions/floating-panels-layout-v0.md** - Floating panels
  - Status: session-log
  - Purpose: Floating panels layout
  - When to read: Understanding panel layout

- **docs/logs/sessions/graph-normalizer-v0.md** - Graph normalizer
  - Status: session-log
  - Purpose: Graph normalizer implementation
  - When to read: Understanding graph normalization

- **docs/logs/sessions/graph-source-loader-v0.md** - Graph source loader
  - Status: session-log
  - Purpose: Graph source loader implementation
  - When to read: Understanding graph loading

- **docs/logs/sessions/2025-01-XX-** - Historical sessions (glitter, mission control, theme)
  - Status: session-log
  - Purpose: Early implementation sessions
  - When to read: Historical context only

## Operating Policies

### Policy Docs
- **docs/lumaweave_phase_architecture_packet/00_BANDIT_DEVELOPMENT_PROTOCOL.md** (and sibling packet files)
  - Status: policy
  - Purpose: Phase architecture packet; required pre-read before starting new phase work
  - When to read: Beginning of each major pass or when context feels stale

- **docs/tooling/lumaweave_coding_survival_manual/README.md**
  - Status: policy
  - Purpose: Survival manual summarizing troubleshooting, tool triggers, and stop conditions
  - When to read: Before recovery passes, debugging loops, or when onboarding new contributors

- **docs/30_QA_CHECKLIST_GENERATION_POLICY.md** - QA checklist generation policy
  - Status: policy
  - Purpose: Defines baseline vs follow-up checklist generation
  - When to read: Creating or modifying QA checklists

- **docs/27_FEATURE_REGISTRATION_STANDARD.md** - Feature registration standard
  - Status: policy
  - Purpose: How to register features in control plane
  - When to read: Adding new control plane features

- **docs/33_GRAPH_VISUAL_POLICY_V0.md** - Graph visual policy
  - Status: policy
  - Purpose: Token/policy/renderer contract for graph visuals
  - When to read: Modifying graph visual behavior

## Handleset Docs

### Handleset Reference
- **docs/handleset/00_HANDLESET_INDEX.md** - Handleset index
  - Status: source-of-truth
  - Purpose: Handleset overview and organization
  - When to read: Understanding handleset system

- **docs/handleset/01_ACTIVE_HANDLES.md** - Active handles
  - Status: needs-review
  - Purpose: Currently implemented handles
  - When to read: Understanding current handles

- **docs/handleset/02_PARTIAL_HANDLES.md** - Partial handles
  - Status: needs-review
  - Purpose: Partially implemented handles
  - When to read: Understanding partial implementations

- **docs/handleset/03_PLANNED_HANDLES.md** - Planned handles
  - Status: needs-review
  - Purpose: Future planned handles
  - When to read: Planning future work

- **docs/handleset/04_BACKEND_FRONTEND_WIRING.md** - Backend/frontend wiring
  - Status: needs-review
  - Purpose: How handles connect backend to frontend
  - When to read: Implementing handle wiring

- **docs/handleset/05_RENDERER_BINDINGS.md** - Renderer bindings
  - Status: needs-review
  - Purpose: How handles bind to renderers
  - When to read: Implementing renderer integration

- **docs/handleset/06_HANDLES_REQUIRING_QA.md** - Handles requiring QA
  - Status: needs-review
  - Purpose: Handles that need QA coverage
  - When to read: Planning QA for handles

- **docs/handleset/07_THEME_AND_MISSION_CONTROL_HANDLES.md** - Theme/Mission Control handles
  - Status: needs-review
  - Purpose: Theme and Mission Control specific handles
  - When to read: Understanding theme/MC handles

- **docs/handleset/08_FUTURE_VISUAL_HANDLES_TAXONOMY.md** - Future visual handles
  - Status: future-ideas
  - Purpose: Taxonomy for future visual handles
  - When to read: Planning visual handle library

## Mission Control Docs

### Mission Control Reference
- **docs/LUMAWEAVE_CURRENT_STATE_HANDOFF.md** - Includes Mission Control state
  - Status: source-of-truth
  - Purpose: Current Mission Control state
  - When to read: Understanding Mission Control

## Theme Docs

### Theme Reference
- **docs/26_THEME_ENGINE_AND_STYLE_CUSTOMIZATION.md** - Theme engine
  - Status: needs-review
  - Purpose: Theme engine architecture
  - When to read: Understanding theme system

- **docs/handleset/07_THEME_AND_MISSION_CONTROL_HANDLES.md** - Theme handles
  - Status: needs-review
  - Purpose: Theme-specific handles
  - When to read: Understanding theme handles

- **docs/theme-system/THEME_MAPPING_SYSTEM_BACKLOG.md** - Theme Mapping backlog (v18a)
  - Status: backlog
  - Purpose: Captures Theme Mapping Mode architecture and dependencies
  - When to read: Planning v18a/v19 theme pipeline

- **docs/theme-system/THEME_TOKEN_PATH_MAP.md** - Theme Token Path Map (v19)
  - Status: source-of-truth
  - Purpose: Canonical token path vocabulary + resolver references
  - When to read: Implementing v19 Theme Token Path Map or future Theme Mapping work

- **docs/theme-system/THEME_TARGET_REGISTRY.md** - Theme Target Registry (v20)
  - Status: source-of-truth
  - Purpose: Canonical themeTargetId registry + inspector overlay contract
  - When to read: Implementing v20 registry/overlay or Theme Mapping prerequisites

## Graph Docs

### Graph Reference
- **docs/33_GRAPH_VISUAL_POLICY_V0.md** - Graph visual policy
  - Status: policy
  - Purpose: Graph visual token/policy contract
  - When to read: Modifying graph visuals

- **docs/graph-intelligence/CLUSTER_GRAVITY_AND_COLOR_CODED_NEIGHBORHOODS.md** - Cluster gravity
  - Status: future-ideas
  - Purpose: Future cluster gravity feature
  - When to read: Planning graph intelligence features

- **docs/28_PARALLEL_INTERACTION_STRUCTURE.md** - Parallel interaction
  - Status: needs-review
  - Purpose: Parallel interaction structure
  - When to read: Understanding interaction model

## Layout Docs

### Layout Reference
- **docs/layout/00_COCKPIT_LAYOUT_OVERVIEW.md** - Cockpit layout
  - Status: needs-review
  - Purpose: Overall cockpit layout
  - When to read: Understanding app layout

- **docs/layout/01_PANEL_ZONES.md** - Panel zones
  - Status: needs-review
  - Purpose: Panel zone definitions
  - When to read: Understanding panel layout

- **docs/layout/02_TOP_BAR_CONTROL_PLAN.md** - Top bar control
  - Status: needs-review
  - Purpose: Top bar control plan
  - When to read: Understanding top bar

## Future Ideas

### Future Concepts
- **docs/FUTURE_IDEAS_INBOX.md** - Future ideas inbox
  - Status: future-ideas
  - Purpose: Consolidated future feature concepts
  - When to read: Planning future features

- **docs/handleset/08_FUTURE_VISUAL_HANDLES_TAXONOMY.md** - Visual handles taxonomy
  - Status: future-ideas
  - Purpose: Future visual handle taxonomy
  - When to read: Planning Visual Handle Library

- **docs/graph-intelligence/CLUSTER_GRAVITY_AND_COLOR_CODED_NEIGHBORHOODS.md** - Cluster gravity
  - Status: future-ideas
  - Purpose: Future cluster gravity feature
  - When to read: Planning graph intelligence

## Roadmaps

### Roadmap Reference
- **docs/ROADMAP_LUMAWEAVE_MASTER.md** - Master roadmap
  - Status: needs-review
  - Purpose: Overall project roadmap
  - When to read: Understanding project direction

- **docs/ROADMAP_FEATURE_PRIORITY_MATRIX.md** - Feature priority matrix
  - Status: needs-review
  - Purpose: Feature prioritization
  - When to read: Planning feature work

## Testing Docs

### Testing Reference
- **docs/LUMAWEAVE_PLAYWRIGHT_TESTING_GUIDE.md** - Playwright testing guide
  - Status: source-of-truth
  - Purpose: How to write Playwright tests
  - When to read: Writing E2E tests

- **docs/32_PLAYWRIGHT_TEST_BACKLOG.md** - Playwright test backlog
  - Status: needs-review
  - Purpose: Pending Playwright tests
  - When to read: Planning test coverage

## Historical Docs

### Historical Reference
- **docs/BASELINE_B_CLOSURE_REPORT.md** - Baseline B closure
  - Status: historical
  - Purpose: Baseline B closure report
  - When to read: Historical context only

- **docs/35_BASELINE_B_CONSOLIDATION_QA_CHECKLIST.md** - Baseline B QA checklist
  - Status: historical
  - Purpose: Baseline B QA checklist
  - When to read: Historical context only

## Superseded Docs

### Superseded Reference
- **README.md** - Generic Tauri template
  - Status: superseded
  - Purpose: Original Tauri template (not LumaWeave-specific)
  - When to read: Never (use LUMAWEAVE_CURRENT_STATE_HANDOFF.md instead)

## Repo/Git Prep Docs

### Git Readiness
- **docs/repo/GIT_READINESS_AUDIT.md** - Git readiness audit
  - Status: source-of-truth
  - Purpose: Git repository readiness assessment
  - When to read: Before initializing git

- **docs/repo/GITIGNORE_DRAFT.md** - .gitignore draft
  - Status: source-of-truth
  - Purpose: Draft .gitignore for review
  - When to read: Before creating .gitignore

- **docs/repo/FIRST_COMMIT_PLAN.md** - First commit plan
  - Status: source-of-truth
  - Purpose: Plan for first git commit
  - When to read: Before running git init

## Documentation Index

- **docs/DOCS_INDEX.md** - This file
  - Status: source-of-truth
  - Purpose: Index of all documentation
  - When to read: Finding documentation

- **docs/DOCS_STALENESS_AUDIT.md** - Staleness audit
  - Status: source-of-truth
  - Purpose: Audit of stale/superseded docs
  - When to read: Before editing/deleting docs
