---
id: link.network.naming.drift
title: Naming Convention Drift
type: drift-analysis
status: current
version: v86a
domain: registries
cluster: slate
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-10
governs:
  - All link network registries
references:
  - link.network.overview
  - link.network.layer.1
  - link.network.layer.2
  - link.network.layer.3
  - link.network.layer.4
tags:
  - link-network
  - naming-drift
  - conventions
  - v86a
  - vP-Registry-Y
---

# Naming Convention Drift

Analysis of naming inconsistencies across the four-layer link network. Drift occurs when the same conceptual entity uses different naming conventions across layers, making traversal and inspection difficult.

## Layer 1 Handle Namespace

Layer 1 uses category-based dot-path namespaces:

| Category | Handle Pattern | Example |
|----------|---------------|---------|
| Labels | `labels.*` | `labels.nodeLabelMode`, `labels.edgeLabelMode` |
| Graph View | `graphView.*` | `graphView.nodeSelectionStage`, `graphView.hoverNodeColor` |
| Appearance | `appearance.*` | `appearance.theme`, `appearance.glitterEnabled` |
| Physics | `physics.*` | `physics.nodeSize`, `physics.linkDistance` |
| Internal | `hoveredNodeId`, `selectedNodeId` | No namespace prefix |

**Convention:** Category prefix + descriptive name (camelCase)

## Layer 2 Contract Namespace

Layer 2 uses surface-based dot-path namespaces:

| Surface | ID Pattern | Example |
|---------|------------|---------|
| Top Bar | `topbar.*` | `topbar.themeSelector`, `topbar.glitterToggle` |
| Graph | `graph.*` | `graph.nodeLabelMode`, `graph.edgeLabelMode` |
| Mission Control | `missionControl.*` | `missionControl.tabs`, `missionControl.submitReport` |

**Convention:** Surface prefix + descriptive name (camelCase)

## Layer 3 Mapping Namespace

Layer 3 uses graph element IDs as foreign keys (from Layer 4):

| Graph Element | Token Path Pattern | Example |
|---------------|-------------------|---------|
| graph.frame | `panel.*` | `panel.border`, `panel.background` |
| graph.surface | `app.*` | `app.background` |
| graph.nodes | `graph.node.*` | `graph.node.fill`, `graph.node.border` |
| graph.edges | `graph.edge.*` | `graph.edge.color`, `graph.edge.label.color` |

**Convention:** Layer 4 element ID → theme token namespace

## Layer 4 Element Namespace

Layer 4 uses graph element dot-path IDs:

| Category | ID Pattern | Example |
|----------|------------|---------|
| Frame | `graph.frame`, `graph.surface` | Container elements |
| Layer | `graph.nodes`, `graph.edges`, `graph.labels` | Rendering layers |
| Overlay | `graph.overlay`, `graph.hud` | Visual overlays |
| Control | `graph.controls`, `graph.physics` | UI controls |

**Convention:** `graph.*` prefix + element type (camelCase)

## Drift Examples

### Example 1: Label Controls

**Layer 1 handle:** `labels.nodeLabelMode`
**Layer 2 contract:** `graph.nodeLabelMode`
**Layer 3 mapping:** N/A (labels mapped to `graph.label.fontSize`, `graph.label.fontFamily`)
**Layer 4 element:** `graph.labels`

**Drift:** Layer 1 uses `labels.*` namespace, Layer 2 uses `graph.*` namespace for the same conceptual control. The namespace shifts from functional category (`labels`) to surface location (`graph`).

### Example 2: Theme Selection

**Layer 1 handle:** `appearance.theme`
**Layer 2 contract:** `topbar.themeSelector`
**Layer 3 mapping:** N/A (theme not a graph element)
**Layer 4 element:** N/A (theme not a graph element)

**Drift:** Layer 1 uses functional namespace (`appearance`), Layer 2 uses surface namespace (`topbar`). The handle describes what it controls (theme), the contract describes where it lives (top bar).

### Example 3: Physics Controls

**Layer 1 handle:** `physics.nodeSize`, `physics.linkDistance`, `physics.repelForce`
**Layer 2 contract:** `graph.nodeSize`, `graph.linkDistance`, `graph.repelForce`
**Layer 3 mapping:** N/A (physics not mapped to theme tokens)
**Layer 4 element:** `graph.physics`

**Drift:** Layer 1 uses `physics.*` namespace, Layer 2 uses `graph.*` namespace, Layer 4 uses `graph.physics` as element ID. Three different namespaces for the same conceptual subsystem.

### Example 4: Hover/Selected States

**Layer 1 handle:** `graphView.hoverNodeColor`
**Layer 2 contract:** `graph.hoverNodeColor`
**Layer 3 mapping:** `graph.nodes → graph.node.hoverFill` (partial)
**Layer 4 element:** `graph.nodes`

**Drift:** Layer 1 uses `graphView.*` namespace, Layer 2 uses `graph.*` namespace. The hover state is a property of nodes but lives in different namespaces across layers.

## Status Enum Drift

### Layer 1 Status Values

```typescript
type HandleStatus = "active" | "internal" | "partial" | "planned";
```

### Layer 2 Status Values

```typescript
type ContractStatus = "active" | "planned" | "retired";
```

### Layer 3 Status Values

```typescript
type MappingStatus = "active" | "planned" | "deferred";
```

### Layer 4 Status Values

```typescript
type ElementStatus = "active" | "future" | "locked";
```

**Drift:** Each layer uses a different status enum with different values:
- Layer 1: `internal`, `partial` (unique to Layer 1)
- Layer 2: `retired` (unique to Layer 2)
- Layer 3: `deferred` (unique to Layer 3)
- Layer 4: `future`, `locked` (unique to Layer 4)

Only `active` and `planned` are shared across all layers.

## Recommendations

This drift analysis surfaces naming inconsistencies without proposing fixes. The drift falls into three categories:

1. **Namespace drift:** Different prefixes for the same conceptual entity (e.g., `labels.*` vs `graph.*`)
2. **Status enum drift:** Different status values across layers (no shared enum)
3. **Cross-layer mismatch:** Layer 1 functional naming vs Layer 2 surface naming

Resolution options include:
- **Standardize on functional namespaces:** Use Layer 1 category prefixes throughout (e.g., `labels.*` in Layer 2)
- **Standardize on surface namespaces:** Use Layer 2 surface prefixes throughout (e.g., `graph.*` in Layer 1)
- **Accept drift as intentional:** Different layers have different perspectives (functional vs location-based)

The decision should be made before expanding the link network to v86b overlay components, as new entries will need to follow the chosen convention.
