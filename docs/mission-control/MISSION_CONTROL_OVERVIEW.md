---
id: mission.control.overview
title: Mission Control Overview
type: manual
status: accepted
version: v73c
cluster: slate
domain: mission-control
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
governs:
  - src/control-plane/qa/QaPanel.tsx
  - src/control-plane/qa/qa-registry.ts
  - src/control-plane/qa/advisory-registry.ts
references:
  - mission.control.qa.advisory.protocol
  - mission.control.debug.checkpoint.workflow
  - mission.control.qa.panel.agent.chat.evolution
  - vr.agent.familiar.system
tags: [mission-control, QA, panel, overview, agent-chat, evolution]
---

# Mission Control Overview

---

## Current State

Mission Control is the evolution of the QA Panel. Currently it exists as a QA Panel with advisory questions, proposals, and backlog. Future phases will rename it to Mission Control and expand it with tabs, history, debug summaries, and eventually agent chat.

**Current implementation:**
```
src/control-plane/qa/QaPanel.tsx         ← the active UI surface
src/control-plane/qa/qa-registry.ts      ← checklist definitions (all passes)
src/control-plane/qa/advisory-registry.ts ← advisory questions per pass
src/control-plane/qa/qa.store.ts         ← state persistence
src/control-plane/qa/qa.types.ts         ← type definitions
```

**What currently works:**
- Active checklist display with pass/fail/n/a status per check
- Notes field per check
- Submit report generation and copy to clipboard
- QA history (last submitted report)
- Advisory questions, proposals, and backlog per active QA key
- Active QA version badge in header
- Debug checkpoint summary panel

---

## Near-Term Improvements (Phase 1)

These are additive — no breaking changes:

```
Last Submitted Report panel
Copy Last Submission button
QA History (list of all submitted reports, filter by version)
Active QA Version Badge (currently implemented)
Debug Checkpoint Summary (currently partial)
```

---

## Mission Control Evolution (Phase 2+)

```
Phase 2: Rename QaPanel → MissionControl, add tab system
  Tabs: Checklist | History | Debug | Agent Chat (placeholder)
  No functional changes — same QA workflow in Checklist tab

Phase 3: Agent Chat placeholder UI
  Input field (disabled) + send button (disabled)
  "Agent Chat coming soon"

Phase 4+: Agent Chat functionality (requires AI infrastructure)
  - Explain current graph state
  - Summarize QA failures
  - Suggest next checklist
  - Inspect handleset status
  - Summarize Playwright failures
  - Route to local agents/tools (very late)
```

---

## Advisory System

Advisory content is per-checklist, not global:

```
getAdvisoryForChecklist(featureId, qaVersion)
  → returns questions, proposals, and backlog for the active checklist

Per-pass state (resets after submit):
  checklist statuses, notes, question answers, question status

Durable state (persists across submits and key changes):
  proposal decisions, backlog order, accepted roadmap decisions
```

The active QA key binds all five identity surfaces:
header badge, dropdown, report key, advisory set key, debug diagnostics.
If any disagree, the pass is not acceptable.

---

## What Must NOT Change During Evolution

```
Active checklist display
Notes field per check
Pass/Fail/Not Applicable status
Submit report generation
Copy report to clipboard
Checklist version awareness
Results persistence
Advisory questions, proposals, and backlog per active key
```

These are core to the development workflow and must survive all future phases intact.

---

## Relationship to Agent Familiar System

In future VR mode, the Mission Control space is where agent familiars gather to report.
Familiars appear here for: self-split reports, completed passes, questions, progress updates.
The non-VR equivalent is the Mission Control Agent Chat tab.

See `docs/vr/AGENT_FAMILIAR_SYSTEM.md` for the VR familiar vision.
