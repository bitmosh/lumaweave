# LumaWeave Master Roadmap

## Overview

This document provides the master roadmap for LumaWeave development, organized by priority chains. Each chain represents a coherent set of features that should be developed together.

## Priority Chains

### 1. Baseline B Control Surface

**Status:** NEAR STABLE

**Goal:** Complete and stabilize the core graph visual control surface.

#### Current State
- Label controls (node/edge label modes, font sizes, truncation) - ACCEPTED
- Hover behavior (node/edge hover highlight, hover labels) - ACCEPTED
- Selection behavior (node/edge selection, depth highlighting) - ACCEPTED
- Neighborhood depth (depth 1/2/3) - ACCEPTED
- QA loop (QA panel, checklist system, submission) - ACCEPTED
- Handleset documentation (active/partial/planned) - DOCUMENTED
- Edge hover label parity - ACCEPTED (v7)
- Important-only semantics refinement - ACCEPTED (v7)

#### Next Safe Step
- Declare Baseline B Control Surface STABLE
- Mark all handleset items as stable or planned with clear status
- Finalize handleset documentation

#### Later Steps
- None - move to other chains

#### Do-Not-Touch-Yet
- No changes to accepted label/selection/hover/depth behavior
- No new label modes
- No new selection modes
- No new depth modes

---

### 2. Mission Control / Agent Chat

**Status:** SCAFFOLD NEEDED

**Goal:** Evolve QA panel into collapsible Mission Control with future Agent Chat capabilities.

#### Current State
- QA panel exists with checklist, notes, submit report
- QA registry with versioned checklists
- QA store for state persistence
- No Last Submitted Report view
- No QA history view
- No debug mode
- No Agent Chat

#### Next Safe Step
- Add Last Submitted Report panel
- Add Copy Last Submission button
- Add QA history panel
- Add active QA version badge
- Add debug checkpoint summary

#### Later Steps
- Make QA panel collapsible
- Rename to Mission Control
- Add Agent Chat interface
- Add agent-assisted debugging:
  - Explain current graph state
  - Summarize QA failures
  - Suggest next checklist
  - Inspect handleset status
  - Summarize Playwright failures
- Route to local agents/tools (future)

#### Do-Not-Touch-Yet
- Agent chat implementation
- Local agent/tool routing
- AI-powered debugging
- Complex agent workflows

---

### 3. Layout / Cockpit

**Status:** PARTIAL

**Goal:** Define and implement structured cockpit layout with left rail, right rail, top bar, and main viewport.

#### Current State
- AppShell has left/right panel structure
- Settings panel (left/right)
- QA panel (left)
- Inspector panel (right)
- CollapsiblePanel component exists
- No documented layout zones
- No top bar theme controls
- No layout preset system

#### Next Safe Step
- Document cockpit layout zones
- Define left rail: sources + QA/Mission Control
- Define right rail: Control Plane + Inspector + Renderer Debug
- Define top bar: title/project/theme/layout/view controls
- Document current implementation vs intended layout

#### Later Steps
- Add layout preset system
- Add renderer selector to top bar
- Add save/export/import controls to top bar
- Implement resizable panels
- Implement draggable panels
- Add floating labels/tooltips overlays

#### Do-Not-Touch-Yet
- Resizable/draggable panels
- Floating panels
- Complex layout presets
- Layout persistence

---

### 4. Theme System

**Status:** SCAFFOLD NEEDED

**Goal:** Implement theme preset system with graph-only editor first, full app editor later.

#### Current State
- Empty theme files (applyTheme.ts, tokens.ts)
- Theme engine documentation exists
- Theme customization scaffolding plan exists
- Graph visual tokens defined (graphVisualTokens.ts)
- No theme preset model
- No top bar theme controls
- No save/rename/select custom themes
- No color picker

#### Next Safe Step
- Define theme preset model
- Define handleset relationship (theme presets modify token values)
- Document graph-only theme editor scope
- Document full app theme editor scope
- Add theme handles to handleset (planned)

#### Later Steps
- Implement top bar theme preset dropdown
- Implement save custom theme preset
- Implement rename custom theme preset
- Implement select saved preset
- Implement graph-only theme editor
- Implement full app theme editor
- Implement pop-out color picker
- Implement import/export JSON

#### Do-Not-Touch-Yet
- Full theme editor implementation
- Pop-out color picker
- Import/export JSON
- App-wide theme system (start with graph-only)

---

### 5. Graph Intelligence

**Status:** PLANNED

**Goal:** Add graph analysis, search, and intelligence features.

#### Current State
- Important-only label mode (degree-based heuristic)
- No importance/weighting controls
- No label templates
- No source snippets
- No source linking
- No graph search/filter
- No path tracing
- No progressive depth slider
- No view presets/layout lenses
- No 3D/universe view

#### Next Safe Step
- Document importance/weighting concept
- Document label templates concept
- Document source snippets concept
- Document source linking concept
- Document graph search/filter concept
- Document path tracing concept
- Document progressive depth slider concept
- Document view presets/layout lenses concept

#### Later Steps
- Implement importance/weighting controls (using edge confidence_score, weight)
- Implement label templates
- Implement source snippets
- Implement source linking
- Implement graph search/filter
- Implement path tracing
- Implement progressive depth slider (decimal depth)
- Implement view presets/layout lenses
- Implement 3D/universe view (very late)

#### Do-Not-Touch-Yet
- Progressive depth slider (requires stable integer depth first)
- 3D/universe view (requires stable 2D renderer first)
- Complex graph intelligence (requires stable baseline first)

---

## Dependency Graph

```
Baseline B Control Surface (STABLE)
    ↓
Layout / Cockpit (DOCUMENTED)
    ↓
Mission Control / Agent Chat (SCAFFOLDED)
    ↓
Theme System (SCAFFOLDED)
    ↓
Graph Intelligence (PLANNED)
```

## Acceptance Criteria

### Baseline B Control Surface
- All label/selection/hover/depth behaviors accepted
- Handleset documentation complete
- No regressions in v7 QA
- Manual QA passed

### Mission Control / Agent Chat
- Last Submitted Report view
- QA history view
- Active QA version badge
- Debug checkpoint summary
- Collapsible panel
- Agent chat placeholder (no implementation)

### Layout / Cockpit
- Documented layout zones
- Left rail: sources + QA/Mission Control
- Right rail: Control Plane + Inspector + Renderer Debug
- Top bar: title/project/theme/layout/view controls
- Layout preset documentation

### Theme System
- Theme preset model defined
- Handleset alignment documented
- Graph-only theme editor scope documented
- Full app theme editor scope documented
- Theme handles added to handleset (planned)

### Graph Intelligence
- All concepts documented
- Importance/weighting design documented
- Label templates design documented
- Source snippets design documented
- Source linking design documented
- Graph search/filter design documented
- Path tracing design documented
- Progressive depth slider design documented
- View presets/layout lenses design documented

## Risk Assessment

### High Risk
- None currently

### Medium Risk
- Theme system integration with existing tokens
- Mission Control evolution without breaking QA workflow

### Low Risk
- Layout documentation
- Graph intelligence documentation

## Timeline Estimates

- **Baseline B Control Surface:** COMPLETE
- **Mission Control / Agent Chat:** 1-2 weeks (scaffold only)
- **Layout / Cockpit:** 1 week (documentation only)
- **Theme System:** 2-3 weeks (scaffold only)
- **Graph Intelligence:** 2-3 weeks (documentation only)

## Notes

- This roadmap is documentation and architecture scaffolding only
- No implementation unless explicitly requested
- Manual QA overrides code inspection
- No dead active controls
- Stable fixtures must not regress
