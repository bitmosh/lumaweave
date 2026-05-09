---
id: brain.bandit.previous.title
title: Bandit Previous Title — System Index Architect
type: log
status: archived
domain: agent
subdomain: brain
cluster: purple
agent_readable: true
include_in_self_graph: false
last_updated: 2026-05-09
tags:
  - bandit
  - title
  - previous
  - historical
  - registry
  - validator
last_pass: vP-Forensics-2
---

# Bandit Previous Title — System Index Architect

```
Title:  System Index Architect
Level:  100.5 (at rotation)
Era:    v71–v73c — Registry governance + validator infrastructure + UI architecture + Sigma interaction + Physics dialects + Graph styling + Visual polish + Panel UX + Theme family redesign + Graph anti-collision + Degree centrality
```

## Recall Handle

This title era covers the registry governance and validator infrastructure arc,
the left panel UX restructure, the Sigma graph interaction work (drag, helix physics,
Louvain community detection, ForceAtlas2, noverlap, degree centrality), and the
6-theme family redesign.

If you are in a situation involving registry governance, validator patterns,
Sigma graph interaction, physics dialects, or theme system architecture, this era
has the most directly relevant experience.

## Hallmark Work

- Registry/Validator infrastructure (v71–v73c)
- Left panel UX restructure + Control Dock + Tile workspace (v76)
- Node dragging with Sigma v3 (node-drag-v1)
- Helix physics dialect with Louvain community detection (helix-dialect-v1, louvain-helix-v1)
- Cluster color fix + slider color refinements (cluster-color-fix, helix-fix+slider-colors)
- Visual polish v1 (visual-polish-v1)
- Skip cleanup + title/slider styling (skip-cleanup-v1)
- 6-theme family redesign (theme-family-redesign)
- Theme accent wiring (--lw-visual-accent fix)
- Graph anti-collision pass (noverlap-v1)
- Degree centrality node sizing (degree-centrality-v1)
- Theme documentation update (theme-docs-update)

## Key Lessons Carried Forward

**Validator-First Pattern**: When a new registry or contract system is introduced,
the validator script comes before UI or runtime promotion. This pattern prevented
multiple cascade failures where UI was built before the contract boundary was validated.

**Contract-First Discipline**: No implementation without a contract. This principle
prevented more bugs than any specific technical skill. The Graph/Sigma boundary
preservation was a direct application of this discipline.

**Sigma v3 Drag Pattern**: No plugin needed. Use sigma.on("downNode") + container
mousemove/mouseup events. This pattern enabled node dragging without external
dependencies and became a reusable template for all Sigma interaction work.

**Louvain Community Detection for Universal Helix**: Run Louvain community detection
before helix layout to auto-assign communities. This enabled the helix physics dialect
to work with any graph source, not just pre-clustered fixtures.

**Case-Insensitive and Substring-Aware Validator Matching**: Validators checking string
fields should always use case-insensitive matching unless the schema explicitly requires
case-sensitive values. Use substring matching for descriptive prose fields.

## Transition Note

Rotated to "Living Graph Architect" after achieving LEVEL 100 MILESTONE.
The registry/validator infrastructure work was complete. The new challenge is
making the graph alive with physics, community detection, anti-collision, and
dynamic sizing — the era of the living graph.
