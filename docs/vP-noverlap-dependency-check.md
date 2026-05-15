---
id: vP-noverlap-dependency-check
title: vP-Noverlap-Restoration — Dependency Check
type: report
status: investigation
cluster: azure
domain: graph
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-14
last_pass: vP-noverlap-dependency-check
tags: [graph, physics, noverlap, dependency, investigation]
---

# vP-Noverlap-Restoration — Dependency Check

## Dependency Status

**Package:** graphology-layout-noverlap  
**Status:** ✅ Installed  
**Version:** 0.4.2

## API Shape

From README.md:

### Synchronous Layout (One-shot)

```javascript
import noverlap from 'graphology-layout-noverlap';

// Basic usage - returns positions
const positions = noverlap(graph, {maxIterations: 50});

// With settings
const positions = noverlap(graph, {
  maxIterations: 50,
  settings: {
    ratio: 2
  }
});

// To directly assign the positions to the nodes (one-shot)
noverlap.assign(graph);
```

### Settings

- **gridSize** (default: 20): Grid cells for optimization
- **margin** (default: 5): Margin to keep between nodes
- **expansion** (default: 1.1): Percentage of current space nodes can move outside
- **ratio** (default: 1.0): Ratio scaling node sizes
- **speed** (default: 3): Dampening factor to slow down node movements

### Arguments

- **graph**: Target Graphology graph
- **options**: 
  - **maxIterations** (default: 500): Maximum iterations before stopping
  - **inputReducer**: Custom function to read node attributes
  - **outputReducer**: Custom function to write node positions
  - **settings**: Layout settings object

## API Shape Used in Proposed Implementation

The user's proposed implementation matches the actual API:

```typescript
noverlap.assign(graph, {
  maxIterations: NOVERLAP_CONFIG.maxIterations,
  settings: {
    margin: NOVERLAP_CONFIG.margin,
    ratio: NOVERLAP_CONFIG.ratio,
    speed: NOVERLAP_CONFIG.speed,
  },
});
```

This is the correct one-shot synchronous API. The `.assign()` form directly modifies the graph node attributes.

## AWAITING OPERATOR APPROVAL

Dependency check complete. Package is installed at version 0.4.2. API shape matches proposed implementation.

**Awaiting approval** to proceed with:
1. Create `src/graph/physics/noverlapPass.ts`
2. Modify `src/graph/renderers/sigma2d/SigmaGraphView.tsx` to invoke noverlap after FA2 settles
