# QA Panel to Agent Chat Evolution

## Overview

This document describes the evolution path from the current QA panel to a future Mission Control panel with Agent Chat capabilities.

## Current QA Panel

### Location
`src/control-plane/qa/QaPanel.tsx`

### Features
- Active checklist display
- Notes field per check
- Pass/Fail/Not Applicable status
- Submit report generation
- Copy report to clipboard
- Checklist version awareness
- Results persistence (qa.store.ts)

### Dependencies
- `qa-registry.ts` - Checklist definitions
- `qa.store.ts` - State persistence
- `qa.types.ts` - Type definitions

## Evolution Steps

### Step 1: QA Panel Enhancements (No Breaking Changes)

**Goal:** Add useful debugging features without changing existing workflow.

**Changes:**
- Add Last Submitted Report panel above checklist
- Add Copy Last Submission button
- Add QA History panel (collapsible)
- Add active QA version badge in header
- Add debug checkpoint summary panel (collapsible)

**What Stays:**
- Existing checklist display
- Existing notes field
- Existing Pass/Fail/Not Applicable status
- Existing submit report
- Existing copy report
- Existing checklist version awareness

**Risk:** Low - additive changes only

---

### Step 2: Mission Control Collapsible Panel

**Goal:** Rename and restructure panel for future extensibility.

**Changes:**
- Rename QaPanel to MissionControl
- Make panel collapsible
- Add tab system:
  - Tab 1: Checklist (current QaPanel content)
  - Tab 2: History (QA history viewer)
  - Tab 3: Debug (debug checkpoint summary)
  - Tab 4: Agent Chat (placeholder only)
- Keep all existing QA functionality in Checklist tab

**What Stays:**
- All QA panel features
- All QA store functionality
- All QA registry functionality

**Risk:** Medium - UI restructure but no functional changes

---

### Step 3: Agent Chat Placeholder

**Goal:** Add Agent Chat tab with placeholder UI.

**Changes:**
- Implement Agent Chat tab UI
- Show placeholder message: "Agent Chat coming soon"
- Add input field (disabled)
- Add send button (disabled)
- No actual AI functionality

**What Stays:**
- All existing functionality
- All tabs functional except Agent Chat

**Risk:** Low - placeholder only

---

### Step 4: Agent Chat - Graph State Explainer

**Goal:** Add AI-powered graph state explanation.

**Changes:**
- Enable Agent Chat input field
- Enable Agent Chat send button
- Implement graph state explainer:
  - Summarize loaded graph
  - Show node/edge counts
  - Show community structure
  - Show important nodes
  - Explain current label/selection/hover state

**Dependencies:**
- Graph state access
- Local LLM or API
- Prompt engineering

**Risk:** High - requires AI infrastructure

---

### Step 5: Agent Chat - QA Failure Summarizer

**Goal:** Add AI-powered QA failure summarization.

**Changes:**
- Implement QA failure summarizer:
  - Aggregate failed checks
  - Identify common failure patterns
  - Suggest likely root causes
  - Recommend next actions

**Dependencies:**
- QA history access
- Local LLM or API
- Prompt engineering

**Risk:** High - requires AI infrastructure

---

### Step 6: Agent Chat - Checklist Suggester

**Goal:** Add AI-powered checklist suggestion.

**Changes:**
- Implement checklist suggester:
  - Based on current state
  - Based on recent changes
  - Based on failure patterns
  - Based on handleset status

**Dependencies:**
- Handleset documentation access
- QA registry access
- Local LLM or API
- Prompt engineering

**Risk:** High - requires AI infrastructure

---

### Step 7: Agent Chat - Handleset Inspector

**Goal:** Add handleset status inspection.

**Changes:**
- Implement handleset inspector:
  - Show active handles
  - Show partial handles
  - Show planned handles
  - Show handles requiring QA
  - Show handleset audit summary

**Dependencies:**
- Handleset documentation access
- Settings registry access

**Risk:** Medium - requires documentation access

---

### Step 8: Agent Chat - Playwright Failure Summarizer

**Goal:** Add Playwright test failure summarization.

**Changes:**
- Implement Playwright failure summarizer:
  - Aggregate Playwright test failures
  - Identify flaky tests
  - Suggest test fixes
  - Recommend test additions

**Dependencies:**
- Playwright test results access
- Local LLM or API
- Prompt engineering

**Risk:** High - requires AI infrastructure

---

### Step 9: Agent Chat - Local Agent Routing

**Goal:** Route to local agents/tools.

**Changes:**
- Implement local agent routing:
  - Detect user intent
  - Route to appropriate agent
  - Execute agent
  - Return result

**Dependencies:**
- Local agent infrastructure
- Tool registry
- Agent routing system

**Risk:** Very High - complex infrastructure

## Migration Path

### For Users
- Phase 1: No changes - existing workflow preserved
- Phase 2: Panel renamed to Mission Control, same workflow
- Phase 3: New tab added, same workflow
- Phase 4+: Agent Chat features added as optional enhancements

### For Developers
- Phase 1: Additive changes only
- Phase 2: Rename and restructure, no functional changes
- Phase 3: Add placeholder tab
- Phase 4+: Implement AI features incrementally

## Rollback Plan

### Phase 1 Rollback
- Remove Last Submitted Report panel
- Remove Copy Last Submission button
- Remove QA History panel
- Remove active QA version badge
- Remove debug checkpoint summary

### Phase 2 Rollback
- Rename MissionControl back to QaPanel
- Remove tab system
- Restore single-panel layout

### Phase 3 Rollback
- Remove Agent Chat tab
- Restore 3-tab system

### Phase 4+ Rollback
- Disable AI features
- Keep placeholder UI

## Notes

- This is documentation and architecture scaffolding only
- No implementation unless explicitly requested
- Manual QA overrides code inspection
- QA panel must remain functional during evolution
- AI features are very late, not near-term priority
