---
id: mission.control.qa.panel.agent.chat.evolution
title: QA Panel to Agent Chat Evolution
type: manual
status: accepted
version: v73c
cluster: slate
domain: mission-control
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
references:
  - mission.control.overview
  - mission.control.qa.advisory.protocol
  - vr.agent.familiar.system
tags: [mission-control, QA, agent-chat, evolution, phases]
---

# QA Panel to Agent Chat Evolution

Defines the phased evolution from current QA Panel to future Mission Control with Agent Chat.

---

## Phase 1 — QA Panel Enhancements (Additive Only)

**Risk: Low**

```
+ Last Submitted Report panel above checklist
+ Copy Last Submission button
+ QA History panel (collapsible)
+ Active QA version badge in header
+ Debug checkpoint summary panel (collapsible)
```

Nothing removed. All existing QA workflow preserved.

---

## Phase 2 — Mission Control Collapsible Panel

**Risk: Medium (UI restructure, no functional changes)**

```
- Rename QaPanel → MissionControl component
- Make panel collapsible
- Add tab system:
    Tab 1: Checklist (current QaPanel content — unchanged)
    Tab 2: History (QA history viewer)
    Tab 3: Debug (debug checkpoint summary)
    Tab 4: Agent Chat (placeholder only — input disabled)
```

All existing QA functionality lives in Checklist tab unchanged.

---

## Phase 3 — Agent Chat Placeholder

**Risk: Low**

```
+ Agent Chat tab UI implemented
+ Placeholder message: "Agent Chat coming soon"
+ Input field (disabled)
+ Send button (disabled)
+ No AI functionality
```

---

## Phase 4+ — Agent Chat Functionality

**Risk: High — requires AI infrastructure**

Each feature is a separate sub-phase:
```
4a: Explain current graph state (summarize nodes, edges, communities)
4b: Summarize QA failures (aggregate failed checks, root cause suggestions)
4c: Suggest next checklist (based on current state + recent changes)
4d: Inspect handleset status (show active/partial/planned handles)
4e: Summarize Playwright failures (aggregate, identify flaky, suggest fixes)
4f: Route to local agents/tools (very late — complex infrastructure)
```

Dependencies for 4a+:
- Graph state access
- Local LLM or Claude API
- Prompt engineering

**Do not implement Phase 4 until Phase 2 is stable and accepted.**

---

## Rollback Plan

Each phase is independently rollbackable:
- Phase 1: Remove additive panels — restore to current QaPanel
- Phase 2: Rename back, remove tab system — restore single-panel layout
- Phase 3: Remove Agent Chat tab — restore 3-tab system
- Phase 4+: Disable AI features — placeholder UI remains

---

## What Must Survive All Phases

```
Active checklist display with pass/fail/n/a
Notes field per check
Submit report + copy to clipboard
Checklist version awareness
Advisory questions, proposals, backlog per active key
```
