---
id: index.docs
title: Documentation Index
type: index
status: accepted
version: v73c
domain: overview
cluster: gray
agent_readable: true
include_in_self_graph: false
last_updated: v73c
tags: [index, docs, navigation, overview]
---

# LumaWeave Documentation Index

## How to Read This Index

**For agents starting a session:** Read Tier 0 first, then ask
the user for git status before reading anything else.

**For new agents:** Start with `docs/agent/onboarding/NEW_AGENT_ONBOARDING.md`.

**For understanding the project:** Start with `docs/overview/LUMAWEAVE_HIGH_DEF_OVERVIEW.md`.

**Archive cutoff:** Anything in `docs/_archive/` is pre-v65 historical.
Do not treat archived docs as current governance.

---

## Tier 0 — Read Every Session

```
docs/operating-policies/SESSION_AND_STACK.md       ← version spine, roadmap, arc
docs/operating-policies/SOURCE_OF_TRUTH.md         ← forbidden boundaries by system
docs/operating-policies/QA_AND_PLAYWRIGHT.md       ← evidence rules, lockstep
```

---

## docs/overview/

Project-wide orientation and platform vision.

| File | Purpose | When to Read |
|------|---------|--------------|
| LUMAWEAVE_HIGH_DEF_OVERVIEW.md | Full project overview, architecture, version spine, completion % | Orientation, planning |
| PLATFORM_VISION.md | Lattica family, Memory Palace, product identity and naming | Platform planning |
| CREATIVE_PIPELINE_CONCEPT.md | Artwork generation + theme engine adaptation | Workshop / theme work |
| DOCS_INDEX.md | This file | Finding things |

---

## docs/agent/

Everything related to agents — brain, protocols, onboarding, leveling.

### onboarding/
| File | Purpose | When to Read |
|------|---------|--------------|
| NEW_AGENT_ONBOARDING.md | Self-contained brief for any fresh agent | First session, new agent |
| MULTI_AGENT_POLICY.md | Rules for multi-agent sessions | Any session with 2+ agents |

### brain/
| File | Purpose | When to Read |
|------|---------|--------------|
| 00_AGENT_LEARNING_INDEX.md | Index of all brain docs, high-risk reading sets | Start of complex passes |
| 21_BANDIT_EXPERIENCE_LEDGER.md | Accumulated lessons from accepted passes | Learning from history |
| 22_BANDIT_PREVIOUS_TITLE.md | Previous rank record | Leveling context |
| 23_BANDIT_CURRENT_TITLE.md | Active skill bank, current rank | Every pass |
| 24_BANDIT_WORKING_MEMORY_REFRESHER.md | What to load before each pass type | Every pass |
| 25_BANDIT_SELF_MODEL_AND_GROWTH_PROTOCOL.md | Self-regulation and growth | Complex passes |

### protocols/
| File | Purpose | When to Read |
|------|---------|--------------|
| BANDIT_PROTOCOL.md | Full operating rules, terminal mode, brain structure | Every session |
| BANDIT_SELF_SPLIT_PROTOCOL.md | 3-strategy → backout → debug report procedure | When stuck |
| PASS_TRANSITION_PROTOCOL.md | How to move between QA passes cleanly | QA key rotation |
| QA_KEY_LIFECYCLE.md | QA key lifecycle and versioning rules | QA rotation |
| REGISTRY_CONTRACT_PATTERNS.md | Patterns for registry + contract work | Registry passes |
| ADVISORY_STATE_MODEL.md | How advisory state works | Advisory drift issues |

### leveling/
| File | Purpose | When to Read |
|------|---------|--------------|
| BANDIT_LEVELING_AND_FEEDBACK_PROTOCOL.md | XP system, clean streak, title rotation | After accepted passes |
| BANDIT_CHANGELOG.md | Operational event log — one entry per accepted pass | Update after every pass |
| BANDIT_ERROR_LOG.md | Self-splits, recoveries, blockers | Update after any failure |
| BANDIT_TRAINING_CURRICULUM.md | Skills to develop and resources for each | Skill development |
| BANDIT_DOC_PROPOSAL_PROTOCOL.md | How to propose new operating rules | When gaps are found |

### tooling/
| File | Purpose | When to Read |
|------|---------|--------------|
| BANDIT_TOOLBELT_ARCHITECTURE.md | MCP tool architecture and roadmap | Tool setup |
| BANDIT_TOOL_USE_CHECKLIST.md | When and how to use each tool | Tool selection |
| CUSTOM_SKILLS_AND_WORKFLOWS.md | Custom skills and workflow definitions | Workflow automation |
| MCP_SERVER_CANDIDATES.md | Available MCP servers and priorities | Tool selection |
| TOOL_PERMISSION_POLICY.md | Path constraints and permission rules | Tool safety |

---

## docs/operating-policies/

Core operating rules. First read every session.

| File | Purpose |
|------|---------|
| SESSION_AND_STACK.md | Version spine, roadmap, reading order, arc |
| SOURCE_OF_TRUTH.md | All source files + forbidden boundaries by system |
| QA_AND_PLAYWRIGHT.md | Evidence rules, lockstep, cascade rules, no-skip |
| PARALLEL_STRUCTURE_POLICY.md | Node/edge mirrored behavior rules |
| LARGE_BITE_EXECUTION_POLICY.md | Slice-based large pass execution |
| QA_MISSION_CONTROL_POLICY.md | QA panel checklist design and evolution |

---

## docs/survival-manual/

Coding survival manual — recent, solid. Use when stuck.

| File | Purpose |
|------|---------|
| README.md | Manual overview and file guide |
| 01_TROUBLESHOOTING_DECISION_MATRIX.md | Failure types and first-response rules |
| 02_DIAGNOSTIC_ROUTER.md | Classify failures before patching |
| 03_TOOL_USE_TRIGGERS.md | When to use Playwright, Context7, Sequential Thinking |
| 04_DEBUGGING_LENSES.md | 26 ways to reason about problems |
| 05_FAILURE_REPORT_TEMPLATE.md | Standard failure report format |
| 06_STOP_CONDITIONS.md | When to pause and ask instead of patching |
| 07_PROMPT_BLOCKS.md | Copy/paste prompt snippets for tasks |
| 08_LUMAWEAVE_AGENT_OPERATING_LOOP.md | Full agent behavior loop |

---

## docs/quest/

Quest mode templates and field guides.

| File | Purpose |
|------|---------|
| QUEST_TEMPLATE.md | Situation report format with changelog/error log fields |
| QUEST_MODE_FIELD_GUIDE.md | When and how to use Quest Mode |
| QUEST_MODE_PROMPT_TEMPLATE.md | Template for assigning quest-mode tasks |

---

## docs/roadmap/

Planning and backlog.

| File | Purpose |
|------|---------|
| LATTICA_ROADMAP_REALIGNMENT_V67.md | Roadmap realignment post-v66 |
| BACKLOG_POLICY.md | Canonical record of all completed and planned passes |
| FUTURE_IDEAS_INBOX.md | Future concept inbox (not a roadmap) |

---

## docs/graph/

Graph system governance.

### contracts/
All accepted graph contracts (v40–v58). Add frontmatter only — do not modify content.

| File | Version |
|------|---------|
| GRAPH_VIEW_ELEMENT_REGISTRY_CONTRACT.md | v40 |
| GRAPH_RUNTIME_BOUNDARY_CONTRACT.md | v45 |
| FIRST_GRAPH_RUNTIME_MUTATION_CONTRACT.md | v47 |
| GRAPH_VISUAL_THEME_MAPPING_CONTRACT.md | v49 |
| GRAPH_THEME_RUNTIME_APPLICATION_CONTRACT.md | v51 |
| GRAPH_THEME_APPLICATION_CONTRACT.md | v55 |
| GRAPH_THEME_TOKEN_VALUE_APPLICATION_CONTRACT.md | v57 |
| GRAPH_THEME_TOKEN_VALUE_PREVIEW_CONTRACT.md | v53 |

### intelligence/
| File | Purpose |
|------|---------|
| CLUSTER_GRAVITY_AND_COLOR_CODED_NEIGHBORHOODS.md | Future cluster gravity concept |
| GRAPH_VISUAL_POLICY.md | Graph visual token/policy rules |

---

## docs/control-plane/

Control plane contracts and QA.

### contracts/
| File | Version | Status |
|------|---------|--------|
| COMMAND_DECK_AND_HOTKEY_REGISTRY_CONTRACT.md | v32 | Accepted |
| PERSPECTIVE_SYSTEM_CONTRACT.md | v38 | Accepted |
| GRAPH_CONTROL_PLANE_NAVIGATION_CONTRACT.md | v68 | Accepted |
| SYSTEM_INDEX_REGISTRY_CONTRACT.md | v72a | Accepted |
| SYSTEM_INDEX_PANEL_MOUNT_CONTRACT.md | v72d | Accepted |
| HUMAN_MODE_EVIDENCE_MODE_CONTRACT.md | v73a | Accepted |
| CONTRACT_TO_CODE_TRACE_MATRIX.md | v71a | Accepted |

### qa/
| File | Purpose |
|------|---------|
| BACKLOG_POLICY.md | Completed and in-progress pass record (canonical) |

---

## docs/grammar-lens/

Ghost Overlay / Grammar Lens system — partially live.

| File | Purpose |
|------|---------|
| GHOST_OVERLAY_CURRENT_STATE.md | What's actually working now (fill in checkboxes) |
| GRAMMAR_LENS_CONTRACT.md | Hold-key + click popout contract |
| CURSOR_INSPECTOR_CONTRACT.md | Per-element YAML editor behavior |
| GLOBAL_ELEMENT_UPDATE_CONTRACT.md | Batch scope model ("apply to all type:X") |

---

## docs/rendering/

Multi-layer rendering architecture.

| File | Purpose |
|------|---------|
| RENDERING_LAYER_ARCHITECTURE.md | 2D/3D/flat layer model and switching |
| CROSS_LAYER_OVERRIDE_CACHE_CONTRACT.md | How edits propagate across layers |
| SIGMA_2D_LAYER_CONTRACT.md | Current active rendering layer contract |
| HYPER_3D_LAYER_CONCEPT.md | Future 3D layer concept |

---

## docs/physics/

Physics dialect system and individual dialect specs.

| File | Purpose |
|------|---------|
| PHYSICS_DIALECT_SYSTEM.md | Overview, selection model, implementation order |
| HELIX_CONSTELLATION_DIALECT.md | Brand layout — implement first |
| CONSTELLATION_MODE_DIALECT.md | Star-field spread layout |
| GALAXY_MODE_DIALECT.md | Orbital cluster layout — high complexity |
| PHYSICS_AUDIO_ROUTING_CONTRACT.md | How audio maps to physics parameters |

---

## docs/layout/

Cockpit layout and tile workspace system.

| File | Purpose |
|------|---------|
| COCKPIT_LAYOUT_OVERVIEW.md | Overall layout zones and intended structure |
| PANEL_ZONES.md | Panel zone definitions and contents |
| TOP_BAR_CONTROL_PLAN.md | Top bar controls plan |
| TILE_WORKSPACE_SYSTEM.md | Movable/snappable/fullscreen tile system |
| WORKSPACE_CONFIGURATION_CONTRACT.md | Saved workspace presets contract |
| LENS_NAVIGATION_MODEL.md | Six lenses, sub-modes, VR spaces, history slider |

---

## docs/mission-control/

QA panel → Mission Control evolution.

| File | Purpose |
|------|---------|
| MISSION_CONTROL_OVERVIEW.md | Current state and evolution path |
| QA_PANEL_TO_AGENT_CHAT_EVOLUTION.md | Step-by-step evolution plan |
| DEBUG_CHECKPOINT_WORKFLOW.md | Debug checkpoint workflow |
| QA_ADVISORY_PROTOCOL.md | Advisory protocol for QA passes |

---

## docs/handleset/

Handle system — upgrade packet supersedes old folder.

| File | Purpose |
|------|---------|
| HANDLESET_CONCEPT.md | What a handleset is and why it matters |
| HANDLESET_ENTRY_SCHEMA.md | Schema for handleset entries |
| HANDLESET_PHASE_PLAN.md | Implementation phases |
| ACTIVE_HANDLES.md | Runtime-accurate active handles list |
| PARTIAL_HANDLES.md | Partially wired handles |
| PLANNED_HANDLES.md | Future handles (hidden from UI) |
| FUTURE_VISUAL_HANDLES_TAXONOMY.md | Full future handle taxonomy |
| BACKEND_FRONTEND_WIRING.md | Settings schema → UI → renderer flow |
| RENDERER_BINDINGS.md | How settings bind to Sigma/Graphology |

---

## docs/theme/

Theme system documentation.

| File | Purpose |
|------|---------|
| THEME_SYSTEM_OVERVIEW.md | Current theme state and architecture |
| THEME_PRESET_MODEL.md | Theme preset model and structure |
| THEME_TOKEN_PATH_MAP.md | Canonical token paths (source of truth) |
| THEME_TARGET_REGISTRY.md | Inspectable UI surface registry |
| THEME_MAPPING_SYSTEM_BACKLOG.md | Theme mapping mode architecture backlog |

---

## docs/audio/

Audio / music reactive governance.

| File | Purpose | Status |
|------|---------|--------|
| AUDIO_REACTIVITY_CONTRACT.md | Core audio reactivity contract | v61, Accepted |
| MUSIC_REACTIVE_MAPPING_CONTRACT.md | Music reactive mapping contract | v63, Accepted |
| AUDIO_SOURCE_SYSTEM_CONTRACT.md | Audio source types and boundaries | v65, Accepted |
| UNIVERSAL_AUDIO_HANDLE_ROUTING.md | Any handle can subscribe to any channel | New, Concept |

---

## docs/accessibility/

Motion safety and accessibility.

| File | Purpose |
|------|---------|
| MOTION_SAFETY_AND_EPILEPSY_GUARD_CONTRACT.md | Master motion safety authority |

---

## docs/source-adapter/

Source Adapter OS — ingestion layer for all data sources.

| File | Purpose | Status |
|------|---------|--------|
| SOURCE_ADAPTER_OS_OVERVIEW.md | Architecture and pipeline overview | Docs |
| SOURCE_ADAPTER_OS_CONTRACT.md | Foundation contract | v74a — write next |
| NORMALIZED_SOURCE_GRAPH_SCHEMA.md | Common node/edge/evidence model | Docs |
| TRANSLATION_SET_MODEL.md | Source → normalized graph mapping | Docs |
| SOURCE_ADAPTER_CATALOG.md | High-value adapter catalog | Docs |
| WEBSITE_URL_ADAPTER_V0.md | Website URL adapter plan | Docs |
| INGESTION_SAFETY_AND_QA.md | Safety rules and QA requirements | Docs |
| SOURCE_ADAPTER_ROADMAP.md | Phase sequence (updated to v74a/v74b) | Docs |

---

## docs/visual-grammar-engine/

VGE architecture — future/docs-only.

| File | Purpose |
|------|---------|
| VGE_OVERVIEW_AND_TERMS.md | Overview, product thesis, core terms |
| VGE_GRAMMAR_HANDLE_AND_LENS.md | Grammar handle model + Grammar Lens |
| VGE_SIGNAL_LOOM.md | Signal Loom routing model |
| VGE_ASSET_AND_TOKENS.md | Asset Bank and token compatibility |
| VGE_DIALECT_AND_SAFETY.md | Dialect preset files + safety schema |
| VGE_UI_AND_POSITIONING.md | UI layout, mode presets, product positioning |
| VGE_ROADMAP.md | VGE/Signal Loom/Asset Bank roadmaps + v69 scar |

---

## docs/arena/

Arena concept — future/docs-only.

| File | Purpose |
|------|---------|
| ARENA_CONCEPT_AND_MODEL.md | Arena concept, graph model, tournament modes |
| ARENA_SCORING_VISUAL_SAFETY.md | Scoring, evidence, visual safety |
| ARENA_HARDENING_AND_PRODUCT.md | Defensive hardening, roadmap, positioning |

---

## docs/security/

Theme Workshop security — full pipeline documented.

| File | Purpose |
|------|---------|
| LATTICA_THEME_WORKSHOP_SECURITY_PROTOCOL.md | Core security model and doctrine |
| LATTICA_THEME_WORKSHOP_THREAT_MODEL.md | Attack surfaces and controls |
| LATTICA_THEME_BUNDLE_FORMAT_CONTRACT.md | Bundle format specification |
| LATTICA_THEME_SUBMISSION_FILTER_PIPELINE.md | 15-stage submission pipeline |
| LATTICA_THEME_PROVENANCE_AND_SIGNATURE_POLICY.md | Provenance and signing policy |
| LATTICA_THEME_SANDBOX_AND_EXECUTION_BOUNDARY.md | Sandbox and execution rules |

---

## docs/platform/

Platform family vision — Lattica, Memory Palace, creative pipeline.

| File | Purpose |
|------|---------|
| PLATFORM_VISION.md | Lattica family, product identity, naming, vision |
| LATTICA_PRODUCT_FAMILY.md | Product lane definitions |
| CREATIVE_PIPELINE_CONCEPT.md | Artwork generation + theme adaptation |

---

## docs/vr/

VR walk-around and agent familiar system — future/docs-only.

| File | Purpose |
|------|---------|
| VR_COMPATIBILITY_CONCEPT.md | VR layer concept, lens spaces, physics in VR |
| AGENT_FAMILIAR_SYSTEM.md | Agents as VR characters, communication model |
| VR_GRAPH_NAVIGATION_CONTRACT.md | Walking inside the graph (future contract) |

---

## docs/logs/

Session and QA logs. Not agent-readable context.
`include_in_self_graph: false` for all log files.

```
docs/logs/qa/        ← QA session reports
docs/logs/sessions/  ← session logs
```

---

## docs/_archive/

Pre-v65 era docs. Historical reference only.
Do not use as current governance.

```
_archive/baseline-b/         ← Baseline B era
_archive/theme-mapping-arc/  ← v18–v34 theme mapping arc
_archive/phase-packets/      ← old phase packet docs
_archive/handleset-v0/       ← original handleset folder
```
