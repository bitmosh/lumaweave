---
id: vP-backbone-spacing
title: vP-Backbone-Spacing — BACKBONE_CONFIG Investigation
type: report
status: investigation
cluster: azure
domain: graph
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-14
last_pass: vP-backbone-spacing
tags: [graph, physics, backbone, spacing, config, investigation]
---

# vP-Backbone-Spacing — BACKBONE_CONFIG Investigation

## Current BACKBONE_CONFIG Values

File: `src/graph/physics/directoryBackboneSeeder.ts` lines 29-38

```typescript
const BACKBONE_CONFIG = {
  // Horizontal spacing between the two backbones
  backboneSpacing: 600,
  // Vertical spacing between spines along the backbone
  spineSpacing: 80,
  // Radius of file children orbit around parent spine
  childOrbitRadius: 120,
  // Vertical offset for root spines (to center layout vertically)
  rootOffsetY: 0,
} as const;
```

## Mapping to User Request

| User Requested Name | Actual Config Key | Current Value | Proposed Change |
|-------------------|------------------|--------------|----------------|
| axisSeparation | backboneSpacing | 600 | 2000 |
| spineSpacing | spineSpacing | 80 | 150 |
| baseFileRadius | childOrbitRadius | 120 | Keep at 120 |
| fileSpacingPerChild | (not present) | N/A | N/A |
| fileAngularSpread | (not present) | N/A | N/A |
| fileVerticalJitter | (not present) | N/A | N/A |
| (unspecified) | rootOffsetY | 0 | Keep at 0 |

## Awaiting Operator Confirmation

The config keys differ from what was specified in the request:
- "axisSeparation" → actual key is "backboneSpacing"
- "baseFileRadius" → actual key is "childOrbitRadius"
- "fileSpacingPerChild", "fileAngularSpread", "fileVerticalJitter" → not present in config

**Proposed changes based on mapping:**
1. backboneSpacing: 600 → 2000
2. spineSpacing: 80 → 150
3. childOrbitRadius: 120 (keep)
4. rootOffsetY: 0 (keep)

**Please confirm** if this mapping is correct before I proceed with the changes.
