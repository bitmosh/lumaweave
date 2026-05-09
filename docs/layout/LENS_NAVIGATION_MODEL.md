---
id: model.lens.navigation
title: Lens Navigation Model
type: concept
status: concept
version: v73c
domain: layout
cluster: stone
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
depends_on:
  - system.tile.workspace
tags:
  - lenses
  - navigation
  - overview
  - atlas
  - evidence
  - signal
  - workshop
  - mission
  - layout
references:
  - contract.cockpit.layout
  - system.physics.dialects
  - contract.human.evidence.debug.mode
---

# Lens Navigation Model

## Concept

A **Lens** is a purposeful view of the LumaWeave workspace. Each
lens presents the same underlying graph data and system state
through a different intent — what you're trying to do with the
data, not just how it looks.

Lenses are not separate pages. They are workspace configurations
with semantic purpose. Switching lenses changes the tile arrangement
and default display depths, but not the underlying data.

In future VR mode, each lens may correspond to a physical space
the user moves between.

---

## The Six Lenses

### Lens 01 — Overview
**Purpose:** Where am I in the system? What is the health of everything?

```
Primary question: Is the system healthy?
Default tile arrangement:
  - System Health summary (top, full width)
  - Architecture node count, contract count, evidence count
  - QA pass rate
  - Active signals / audio activity
  - Motion Safety status
  - Graph view (center, medium size)
  - System Index tile (right, summary depth)

Display depth: 1 (Summary)
Mode mapping: Human Mode
```

This is the **landing lens** — what you see when you open LumaWeave.
Quick orientation. No deep evidence. Just: is everything okay?

### Lens 02 — Atlas
**Purpose:** Navigate the graph spatially. Explore the architecture.

```
Primary question: Where is X in the graph? How do things connect?
Default tile arrangement:
  - Graph view (center, fullscreen or large)
  - Physics dialect selector (small, bottom left)
  - Node inspector (right rail, collapsed until selection)
  - History slider (bottom, collapsed by default)

Display depth: 2 (Operational)
Mode mapping: Evidence Mode or Human Mode (user choice)
Physics: user's last selected dialect
```

This is the **exploration lens** — where you spend most of your
time understanding the system visually. Physics dialects live here.
The history slider slides out from the bottom on demand.

**Sub-modes within Atlas:**
- 2D Sigma (current active rendering layer)
- 3D Immersive (future — Panorama Atlas full mode)
- Flat / Minimal (future — accessibility-first view)
- VR Walk-Around (future)

### Lens 03 — Evidence
**Purpose:** What's proven? Verify contracts, tests, QA linkage.

```
Primary question: Is X accepted? What proves it?
Default tile arrangement:
  - Evidence panel (center, large)
  - Contract trace matrix (left, medium)
  - System index (right, evidence depth)
  - Graph view (right, small — shows evidence path highlighted)

Display depth: 3 (Evidence)
Mode mapping: Evidence Mode
```

This is the **governance lens** — for auditing, reviewing contracts,
checking test coverage, and verifying that accepted behavior is
actually proven. The graph in this lens highlights evidence paths
(edges that represent tested relationships).

### Lens 04 — Signal
**Purpose:** What's reacting? How is data flowing and reacting?

```
Primary question: What is the system responding to right now?
Default tile arrangement:
  - Signal Patch Bay (center, large)
  - Physics dialect audio map (left)
  - Physics settings (right)
  - Graph view (bottom, small — showing live audio reactivity)
  - Audio source registry (right, small)

Display depth: 2 (Operational)
Mode mapping: Evidence Mode (for signal routing visibility)
```

This is the **reactivity lens** — where you configure how the graph
responds to audio, data changes, and agent activity. The Signal
Loom routing matrix is the primary UI element here.

### Lens 05 — Workshop
**Purpose:** Customize. Build themes, configure dialects, manage assets.

```
Primary question: How should LumaWeave look and feel?
Default tile arrangement:
  - Theme Settings (center, large — or fullscreen)
  - Theme preset browser (left)
  - Asset Bank catalog (right)
  - Graph view (right, small — live preview of theme changes)
  - Grammar Lens controls (bottom)

Display depth: 2 (Operational)
Mode mapping: Human Mode (for clarity during customization)
```

This is the **creative lens** — theme editing, dialect creation,
artwork import, grammar handle overrides. The graph in the
background shows theme changes in real time.

Future: generated artwork integration, VR environment dressing
customization.

### Lens 06 — Mission
**Purpose:** What needs attention? Agent reports, QA status, active work.

```
Primary question: What do my agents need? What is failing?
Default tile arrangement:
  - Mission Control (center, large)
  - History slider (bottom — active, showing recent commits/events)
  - Graph view (right — shows current work highlighted)
  - Evidence panel (right, small — current pass evidence)

Display depth: 3 (Evidence) or 4 (Debug) for active development
Mode mapping: Evidence Mode or Debug Mode
```

This is the **operations lens** — where development work happens.
QA checklist, Playwright failure review, agent reports, and the
history slider for understanding what just happened.

Future: agent familiar interface lives here. When a DeepSeek or
Bandit familiar needs to report something, it appears in the
Mission lens.

---

## Lens Switching Model

Switching lenses:
1. Preserves all current tile data and graph state
2. Applies the target lens's default workspace configuration
   (unless the user has a saved custom configuration for that lens)
3. Adjusts global display depth default
4. Adjusts mode mapping suggestion (not forced — user overrides)
5. Smooth transition animation (tile arrangement reorganizes)

Switching lenses does NOT:
- Change the active rendering layer
- Change the active physics dialect
- Clear graph selection or navigation state
- Reset audio reactivity settings

---

## Lens Persistence

Each lens remembers:
- Last active tile arrangement (if user customized it)
- Last active display depth
- Last active mode (Human/Evidence/Debug)
- Last scroll/zoom position in graph

These are persisted per-session. Across sessions requires a
storage contract (future).

---

## VR Lens Mapping (Future)

In VR walk-around mode, each lens corresponds to a physical space:

```
Overview  → entrance hall / lobby — system health displayed on walls
Atlas     → the graph world itself — you walk inside the graph
Evidence  → library / archive — contracts and test records on shelves
Signal    → signal studio / control room — routing matrix as physical panels
Workshop  → atelier / studio — theme tools, artwork, creative space
Mission   → command center — agent familiars report here
```

Moving between VR spaces = switching lenses. The graph persists
across all spaces — you can always see it through the "windows"
of whichever space you're in.

---

## History Slider

The graph history slider lives in the Atlas and Mission lenses.
It presents the graph's event log as a scrubable timeline.

```
Visual: horizontal helix signature line (from brand mark)
         ──●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━●──
                                                    ▲
                                                   Now

Modes:
  Live   → slider at rightmost position, new events auto-append
  Frozen → slider locked at a historical position, graph frozen
           at that state, full interaction available

Scrubbing:
  → graph rebuilds to its state at the selected time
  → nodes/edges that didn't exist yet are removed
  → nodes/edges that were accepted are shown in their
    accepted state, not their current state

Events shown on slider:
  → each accepted version pass as a marker
  → agent commits as smaller markers between passes
  → self-split events as warning markers
```

The history slider is the brand signature line made functional.
