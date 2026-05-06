---
id: concept.agent.familiar.system
title: Agent Familiar System
type: concept
status: concept
version: v73c
domain: vr
cluster: teal
agent_readable: true
include_in_self_graph: true
last_updated: v73c
related:
  - concept.vr.compatibility
  - vision.platform
  - policy.multi.agent
tags: [vr, agents, familiars, bandit, deepseek, mission-control, concept]
---

# Agent Familiar System

## Concept

In VR mode, coding agents (Bandit, DeepSeek, and future agents)
manifest as **familiars** — visible characters or entities within
the VR world that represent the agent and communicate directly
with the user.

A familiar is not a chatbot in a sidebar. It is a presence in
the space — something you can approach, that approaches you,
that exists in the same visual world as your architecture.

**Status: Future concept. No implementation without VR layer
and explicit agent familiar contract.**

---

## What a Familiar Does

When an agent needs to communicate with the user, it:

1. **Appears in the appropriate VR space** — Mission Control space
   for reports, Workshop atelier when helping with themes, Atlas
   when navigating the graph

2. **Presents its report visually** — the familiar gestures toward
   the relevant part of the graph, highlights the relevant nodes,
   shows the error or finding in context

3. **Speaks the report** (optional, future TTS) — or displays it
   as floating text the user can read at their own pace

4. **Waits for response** — the familiar doesn't disappear after
   reporting. It waits for the user to acknowledge, ask questions,
   or give direction

5. **Returns to work** — once dismissed, the familiar fades back
   into the graph world, and the user can see it working (subtle
   animation showing agent activity on relevant nodes)

---

## When a Familiar Appears

Familiars appear for:

```
Self-split report        → familiar appears urgently, gestures to
                           the failing area of the graph
Accepted pass            → brief celebratory appearance, adds new
                           nodes/edges to the graph visibly
Recovery needed          → familiar appears with the error in context
Question / clarification → familiar appears with the question,
                           waits patiently
Long task progress       → familiar appears periodically with
                           brief status updates
Session complete         → familiar appears with summary, then
                           fades as the session ends
```

They do NOT appear for:
- Normal background work (agent is invisible when working smoothly)
- Trivial status updates (suppressed unless requested)
- Multi-agent coordination messages (those stay in Mission lens UI)

---

## Familiar Personalities

Each agent has a distinct visual identity and communication style
as a familiar. This makes multi-agent environments readable —
you immediately know which agent is reporting.

**Bandit (Claude):**
Suggested aesthetic: scholarly, precise, slightly formal.
Could appear as a small figure with notebooks and a magnifying glass.
Communication style: structured, clear, references specific doc paths.
Appears in: all spaces, but primarily Mission Control.

**DeepSeek V4:**
Suggested aesthetic: technical, fast-moving, energetic.
Could appear as a more dynamic figure, quick gestures.
Communication style: direct, implementation-focused.
Appears in: primarily Atlas (near the code nodes) and Mission Control.

**Future agents:**
Each new agent type gets a distinct familiar design before
the agent is onboarded. The familiar design is part of the
agent onboarding process.

---

## The Familiar in Mission Control Space

The Mission Control VR space is the primary familiar gathering point.
When multiple agents are active:

```
Mission Control space layout:
  - Central briefing area (user stands here)
  - Agent stations (one per active agent, around the perimeter)
  - Each station shows the agent's current task and status
  - Familiars at their stations, visible and available
  - User can approach a familiar to get a detailed report
  - Familiars can communicate with each other (visible to user)
```

When an agent completes a pass, its familiar walks to the center
and presents the result. When an agent self-splits, its familiar
appears urgently at the center with the debug report.

---

## Familiar Behavior During Graph Work

While agents are working in the background (normal operation,
no reports needed):

```
In Atlas VR space:
  - Agent familiars are visible as small presences near the
    nodes they're currently working on
  - They move as work progresses (node to node, file to file)
  - They leave a faint trail showing the path of work
  - The trail fades after ~30 seconds
  - This makes agent activity visible and spatial
```

The user can glance at the graph and immediately see:
"Bandit is working on the QA bundle over there, DeepSeek is
touching the source adapter nodes on the other side."

---

## Communication Model

Familiar communication is non-blocking by default:

```
Urgent (self-split, critical error):
  → familiar appears at center of current space
  → subtle audio cue (non-startling)
  → stays until user acknowledges

Normal (pass complete, progress update):
  → familiar appears at station, raises hand
  → notification indicator in UI corner
  → user approaches when ready

Background (info only, no action needed):
  → brief appearance, floating text, fades automatically
  → no action required from user
```

---

## Privacy and Presence

The familiar system is local-first. Agent familiars:
- Are purely visual representations of local agent processes
- Do not connect to external services to render
- Do not send any data to external systems
- Are rendered entirely from local graph state + agent report data

The familiar's appearance does NOT mean:
- The agent has a persistent visual identity across sessions
- Agent identity is shared with third parties
- Agent behavior is observable by external services

---

## Non-VR Familiar Mode

When VR is not active, familiars manifest in the Mission lens
as profile cards with status indicators, rather than 3D characters.
The same communication model applies — urgent reports surface
prominently, normal updates are available on demand.

The non-VR familiar is essentially what the Mission Control
agent chat interface evolves into — but with personality and
visual identity rather than just a text interface.

---

## Implementation Prerequisites

1. VR layer implemented and stable
2. Agent communication protocol defined (how agent sends
   structured report that familiar can render spatially)
3. Familiar design assets created (characters or abstract forms)
4. Familiar animation system (idle, working, reporting states)
5. Audio cue system (non-startling notification sounds)
6. Motion Safety classification of all familiar animations
7. User preference system (enable/disable familiars,
   adjust urgency thresholds, choose communication style)
8. Explicit familiar system contract with full behavior spec
