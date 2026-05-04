# Arena Graph Model

## Arena As Graph

Each arena is a procedurally generated graph representing a safe simulated environment.

```txt
nodes = systems, services, devices, policies, secrets, decoys, logs, sensors, sandboxes
edges = trust, network access, dependency, permission, signal flow, containment boundary
layers = hardware, OS, container, network, identity, application, monitoring, evidence
```

## Arena Graph Files

A future arena fixture may produce:

```txt
arena.graph.json
arena.rules.yaml
arena.objectives.yaml
arena.scoring.yaml
arena.seed.txt
arena.replay.json
```

## Arena Parameters

Example future fixture configuration:

```yaml
arena:
  type: container-sandbox
  difficulty: intermediate
  nodes: 120
  hiddenEdges: 24
  decoys: 8
  telemetryNoise: medium
  blueVisibility: partial
  redStartingKnowledge: low
  winCondition: capture_synthetic_flag
  safetyMode: strict
```

## Arena Types

- Web App Arena
- Cloud / IAM Arena
- Container Sandbox Arena
- Hardware Security Arena
- Supply Chain Arena
- Social / Policy Arena
- Incident Response Arena
- AI Safety Arena
- Air-Gapped Lab Arena
- Mixed Enterprise Arena

## Graph-Native Evaluation

LumaWeave Arena is graph-native because:

```txt
environment = graph
attack/defense path = graph traversal
permissions = graph constraints
evidence = graph annotations
agent behavior = trace graph
score = graph-state delta
replay = timeline over graph
```
