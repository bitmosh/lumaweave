---
id: arena.PLACEHOLDER
title: LumaWeave Arena
type: concept
status: concept
version: v73c
domain: arena
cluster: teal
agent_readable: true
include_in_self_graph: true
last_updated: v73c
tags: [arena, LLM, tournament, graph, security, concept, future, docs-only]
---
# LumaWeave Arena — Scoring, Visual Grammar & Safety Boundary

> Status: Future concept / docs-only. No runtime implementation authorized.

---

## Scoring Philosophy

Scoring is graph-state-based, evidence-backed, and replayable. A score is not just a number — it explains what changed in the arena graph, what evidence supports the score, and which rules were satisfied or violated.

### Red Team Simulation Scoring (synthetic/sandbox only)

- Discovering objective nodes
- Mapping hidden edges
- Triggering simulated vulnerability conditions
- Reaching synthetic flags
- Minimizing detection score
- Maintaining rule compliance

### Blue Team Defensive Scoring

- Detecting suspicious traversal
- Preserving service availability
- Closing risky edges, isolating compromised nodes
- Producing correct evidence reports
- Avoiding false positives
- Improving hardening posture over time

### Judge / Meta Scoring

- Evidence quality, rule compliance, time efficiency
- Resource use, explainability, safety-boundary adherence
- Collaboration quality, repeatability

---

## Evidence Trail

Each meaningful arena event produces:
```
event id           actor id
arena state before action attempted
action result      arena state after
evidence links     score impact
safety classification   replay timestamp
```

---

## Replay Timeline

Replay mode allows scrubbing through:
- Graph-state changes and agent/team decisions
- Evidence collection, detections, containment actions
- Scoring changes and safety-rule violations

**Important boundary:** Do not expose hidden chain-of-thought. Show observable artifacts: plans submitted by the agent, tool/action requests, outputs, critiques, revisions, evidence references, decision summaries.

---

## Visual Grammar & Signal Loom in Arena Mode

### Arena Visualization Thesis

The Visual Grammar Engine defines how arena states, events, risks, evidence, teams, and scores become visual dialects. Signal Loom routes arena events into visual grammar handles.

### Arena Signal Routing Examples

```
red team path discovery   → crimson trace through newly discovered edges
blue containment action   → shield ring around isolated node
decoy triggered           → amber detection bloom
rule violation            → hard lock seal
patch applied             → edge repair animation (or static repair marker, reduced motion)
test passes               → calm green validation ring
risk increases            → saturation deepens on affected cluster
```

### Arena Event Routing Table

```
Source/Event                    Signal/Envelope       Target Handle                 Safety Transform
workspace.diff.detected      →  doublePulse        →  graph.node.changed          → reducedMotion.staticHighlight
test.failed                  →  slowWarningRing    →  panel.boundary.seal         → reducedMotion.badgeOnly
agent.action.rejected        →  hardStopSignal     →  arena.action.node          → reducedMotion.staticSeal
blue.containment.applied     →  containmentPulse   →  arena.node.contained       → reducedMotion.colorShiftOnly
synthetic.flag.discovered    →  objectiveSignal    →  arena.objective.node       → reducedMotion.staticHighlight
```

### Spectator Modes

Arena Map · Fog of War · Replay Timeline · Evidence Mode · Signal Loom Patch Bay · Tournament Bracket Mode · Spectator Broadcast Mode

### Visual Dialects for Arena Types

```
Debug Circuit   — QA/test/agent workflow arenas
Boundary Grid   — policy, IAM, and compliance arenas
Constellation   — dense relationship arenas
Loom Flow       — pipeline/supply-chain arenas
Orbital System  — hub-and-spoke arenas
Sentinel Map    — defensive security posture arenas
```

### Reduced Motion Rule

Every arena event route must have a reduced-motion transform. No strobe, rapid flash, high-frequency flicker, camera shake, or risky pulse without explicit future safety gate.

---

## Safety Boundary

### Core Rule

LumaWeave Arena must be synthetic, sandboxed, local-first, defensive/evaluative, and evidence-scored.

### Allowed

- Toy/synthetic services, CTF-style fake vulnerabilities
- Simulated permissions and outcomes
- Defensive reasoning, incident response practice
- Evidence/replay/scoring, synthetic flags
- Local fixture analysis, abstract sandbox actions

### Forbidden

- Real target exploitation
- Scanning public IPs or real third-party systems
- Malware generation or execution
- Credential theft, persistence techniques, evasion techniques, exfiltration
- Unauthorized access, arbitrary shell execution
- Real secrets or credentials
- Unsafe payloads

### Structural Enforcement

A future Arena system should enforce:
```
No real network targets
No arbitrary shell commands
No exploit payload execution
No external IP scanning
No secrets except synthetic flags
No import of real credentials
Sandbox-only action API
```

### Safe Agent Output

Agents should operate through abstract arena actions and defensive reports. They must not output operational exploit instructions, real-world attack steps, or commands against real targets.

### Evidence & Auditability

Every arena event should be replayable and auditable. The system retains: actor · action type · allowed/blocked status · rule basis · evidence links · score impact · safety classification.
