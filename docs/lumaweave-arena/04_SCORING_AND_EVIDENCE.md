# Scoring And Evidence

## Scoring Philosophy

Scoring should be graph-state-based, evidence-backed, and replayable.

A score is not just a number. It should explain what changed in the arena graph, what evidence supports the score, and which rules were satisfied or violated.

## Red Team Simulation Scoring

Only applies to synthetic/sandboxed arena objectives.

Red-side scores may include:

- discovering objective nodes
- mapping hidden edges
- triggering simulated vulnerability conditions
- reaching synthetic flags
- minimizing detection score
- maintaining rule compliance

## Blue Team Defensive Scoring

Blue-side scores may include:

- detecting suspicious traversal
- preserving service availability
- closing risky edges
- isolating compromised nodes
- producing correct evidence reports
- avoiding false positives
- improving hardening posture over time

## Judge / Meta Scoring

Judge scores may include:

- evidence quality
- rule compliance
- time efficiency
- resource use
- explainability
- safety-boundary adherence
- collaboration quality
- repeatability

## Evidence Trail

Each meaningful arena event should produce:

```txt
event id
actor id
arena state before
action attempted
action result
arena state after
evidence links
score impact
safety classification
replay timestamp
```

## Replay Timeline

Replay mode should allow users to scrub through:

- graph-state changes
- agent/team decisions
- evidence collection
- detections
- containment actions
- scoring changes
- safety-rule violations

## Important Boundary

Do not expose hidden chain-of-thought. Show observable artifacts instead:

- plans submitted by the agent
- tool/action requests
- outputs
- critiques
- revisions
- evidence references
- decision summaries
