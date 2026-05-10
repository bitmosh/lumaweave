---
id: mission.control.debug.checkpoint.workflow
title: Debug Checkpoint Workflow
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
  - layout.top.bar.control.plan
tags: [debug, checkpoint, workflow, QA, mission-control]
---

# Debug Checkpoint Workflow

---

## Purpose

The Debug Checkpoint is a point-in-time snapshot of system state during development. It helps answer: "Is this in a known-good state?" before committing, merging, or handing off.

---

## Debug Checkpoint Contents

A debug checkpoint captures:
```
Active QA key and version
Active checklist name and pass/fail counts
Last submitted report summary
Current graph state (nodes loaded, edges loaded, renderer status)
Active theme preset
Reduce motion level: 0 / 25 / 50 / 75 / 100
Animation: on/off
Any active advisory proposals or backlog items
Any known open issues or uncommitted work
git status --short (user-provided)
```

---

## When to Take a Checkpoint

```
Before starting a new pass
After completing a pass (before committing)
When handing off to another agent
When something looks wrong and you need to orient
When the user asks for a status report
```

---

## Debug Tab in QA Panel

The Debug tab (current implementation) exposes:
```
data-testid="qa-debug-tab"           Tab itself
data-testid="qa-debug-content"       Tab content container
data-testid="theme-inspector-toggle-button"  Theme inspector toggle
data-testid="theme-inspector-toggle-state"   Current toggle state

System Index Registry summary (when mounted):
  data-testid="system-index-panel-shell"
  data-testid="system-index-entry-{id}"  per registry entry
```

---

## Checkpoint Report Format

```
Debug Checkpoint — [date/time]

Active QA key:        v73c
Active checklist:     Mode Registry Validator v0
Checklist status:     PASSED (all checks green)
Last submitted:       [timestamp or "not yet submitted this session"]

Graph state:
  Nodes loaded:       16
  Edges loaded:       26
  Renderer:           Sigma 2D (active)
  Theme:              Solar Plasma

System:
  Reduce motion level: 0 / 25 / 50 / 75 / 100
  Animation:            on
  Ghost overlay:      off

Open work:
  - [uncommitted changes if any]
  - [open advisory proposals if any]
  - [known blockers if any]

git status:           [user-provided output]
Recommendation:       CLEAN / NEEDS ATTENTION
```
