# GWells v0.2 — Macro Controls and Parameter Mapping

**Status:** Draft  
**Purpose:** Define how LumaWeave’s simple UI controls map onto GWells physics parameters, interaction strengths, seed adherence, spacing, damping, and profile presets.  
**Intended location:** `lumaweave/docs/prototypes/gwells-refine/GWELLS_MACRO_CONTROLS_AND_PARAMETER_MAPPING.md`  
**Replaces:** Nothing yet. New UI/implementation contract doc.  
**Related:**
- `GWELLS_UI_CONTROL_MODEL.md`
- `GWELLS_PROFILE_APPLY_MODES_AND_OVERRIDE_SEMANTICS.md`
- `GWELLS_PROFILE_REGISTRY_CONTRACT.md`
- `GWELLS_V0_2_LAYOUT_PROFILE_SYSTEM.md`
- `GWELLS_LAYOUT_MATRIX_AND_GUIDE.md`

---

## 1. Summary

GWells exposes many low-level physics controls:

- spring stiffness
- repulsion strength
- range
- ideal distance
- damping
- seed adherence
- center gravity
- max velocity
- interaction strength
- well overrides
- interaction overrides
- seed parameters

Those controls are powerful, but they are too raw for the default LumaWeave UI.

GWells v0.2 should expose macro controls first.

A macro control is a calm user-facing slider that adjusts multiple low-level parameters together.

Example:

```txt
More Hierarchy
  → stronger containment springs
  → higher seed adherence
  → lower semantic pull
  → more stable parent-child spacing
```

The goal is to simplify operation without simplifying capability.

---

## 2. Design principle

Users should tune intent, not equations.

The default UI should ask:

```txt
Do you want this graph more structured, more spacious, more clustered, or more fluid?
```

It should not ask:

```txt
What should file-orbit siblingRepulsion and directory-anchor springStiffness be?
```

Advanced mode can expose raw parameters later.

---

## 3. Macro control vocabulary

Initial macro controls:

```txt
Structure
Spacing
Clustering
Motion
Relationship Pull
Hierarchy Pull
Stability
```

Optional later controls:

```txt
Focus
Compression
Semantic Pull
Temporal Pull
Component Separation
Collision Avoidance
```

The first implementation should stick to the initial seven.

---

## 4. Macro value range

Each macro slider should normalize to:

```ts
export type GWMacroValue = number; // 0.0 to 1.0
```

Recommended interpretation:

```txt
0.00–0.25:
  low

0.26–0.50:
  medium-low

0.51–0.75:
  medium-high

0.76–1.00:
  high
```

A profile preset may define defaults:

```ts
export interface GWParameterMacroDefaults {
  structure?: number;
  spacing?: number;
  clustering?: number;
  motion?: number;
  relationshipPull?: number;
  hierarchyPull?: number;
  stability?: number;
}
```

---

## 5. Macro control contract

```ts
export interface GWMacroControlState {
  structure: number;
  spacing: number;
  clustering: number;
  motion: number;
  relationshipPull: number;
  hierarchyPull: number;
  stability: number;
}
```

All macro values must be clamped:

```txt
min: 0
max: 1
```

---

## 6. Macro mapping result

Macro controls should compile into a dialect-compatible config layer.

```ts
export interface GWResolvedMacroConfig {
  engineConfig?: Partial<GWEngineConfig>;
  config: GWDialectConfig;

  diagnostics: {
    warnings: string[];
    notes: string[];
  };
}
```

Compiler function:

```ts
export function resolveMacroControls(
  profile: GWPhysicsProfile,
  macroState: GWMacroControlState
): GWResolvedMacroConfig;
```

During the bridge phase, this result can merge with the active profile’s parameter preset.

---

## 7. Merge order

Macro controls should not replace all profile parameters blindly.

Recommended merge order:

```txt
1. GW engine defaults
2. profile parameter preset
3. macro control output
4. advanced raw overrides
5. safety clamps
```

This gives profiles sensible defaults while still letting users tune behavior.

---

## 8. Structure

### 8.1 User-facing meaning

Structure controls how strongly the graph preserves the seed layout and high-level arrangement.

Low Structure:

```txt
Nodes may drift more freely.
Relationships and local forces can reshape the graph.
```

High Structure:

```txt
Nodes stay closer to the seeded arrangement.
The graph feels more organized and less fluid.
```

### 8.2 Low-level mapping

Increasing Structure should generally:

```txt
increase seedAdherence
increase parent/container spring strength
increase centerGravity slightly
reduce maxVelocity slightly
increase damping slightly
```

Decreasing Structure should generally:

```txt
lower seedAdherence
allow semantic/link forces to reshape clusters
increase motion slightly
```

### 8.3 Example mapping

```ts
function mapStructure(value: number): Partial<GWDialectConfig> {
  return {
    wellOverrides: {
      "gwells.well.collection-anchor": {
        seedAdherence: lerp(0.05, 0.30, value),
        centerGravity: lerp(0.01, 0.08, value),
      },
      "gwells.well.document-orbit": {
        seedAdherence: lerp(0.02, 0.18, value),
      },
      "gwells.well.semantic-cluster": {
        seedAdherence: lerp(0.00, 0.12, value),
      },
    },
  };
}
```

---

## 9. Spacing

### 9.1 User-facing meaning

Spacing controls how far apart nodes and clusters spread.

Low Spacing:

```txt
Compact graph.
Shorter distances.
More dense clusters.
```

High Spacing:

```txt
More breathing room.
Clusters separate more clearly.
Less overlap.
```

### 9.2 Low-level mapping

Increasing Spacing should generally:

```txt
increase idealDistance
increase sibling repulsion
increase interaction ranges moderately
increase seed layout distance parameters when reseeding
```

Decreasing Spacing should generally:

```txt
lower idealDistance
lower sibling repulsion
lower seed layout spacing parameters
```

### 9.3 Example mapping

```ts
function mapSpacing(value: number): Partial<GWDialectConfig> {
  return {
    wellOverrides: {
      "gwells.well.collection-anchor": {
        idealDistance: lerp(300, 900, value),
        siblingRepulsion: lerp(120, 520, value),
      },
      "gwells.well.document-orbit": {
        idealDistance: lerp(80, 280, value),
        siblingRepulsion: lerp(60, 240, value),
      },
      "gwells.well.asset-satellite": {
        idealDistance: lerp(40, 140, value),
        siblingRepulsion: lerp(20, 120, value),
      },
    },
    seedParams: {
      spacingScale: lerp(0.75, 1.75, value),
    },
  };
}
```

---

## 10. Clustering

### 10.1 User-facing meaning

Clustering controls how strongly similar or related nodes gather together.

Low Clustering:

```txt
Nodes stay more evenly spread.
Clusters are looser.
```

High Clustering:

```txt
Related nodes pull together.
Topics and communities become more obvious.
```

### 10.2 Low-level mapping

Increasing Clustering should generally:

```txt
increase semantic attraction
increase topic-hub attraction
increase same-topic/similar-to interaction strength
decrease sibling repulsion slightly inside clusters
increase inter-cluster repulsion to keep clusters separate
```

Decreasing Clustering should generally:

```txt
lower semantic attraction
increase even spacing
make graph more map-like and less community-like
```

### 10.3 Example mapping

```ts
function mapClustering(value: number): Partial<GWDialectConfig> {
  return {
    interactionOverrides: {
      "gwells.interaction.semantic-cluster.attracts.semantic-cluster": {
        strength: lerp(0.1, 1.4, value),
        range: lerp(180, 520, value),
      },
      "gwells.interaction.topic-hub.attracts.document-orbit": {
        strength: lerp(0.2, 1.8, value),
        range: lerp(200, 700, value),
      },
    },
  };
}
```

---

## 11. Motion

### 11.1 User-facing meaning

Motion controls how fluid, lively, or settled the graph feels.

Low Motion:

```txt
Graph settles quickly.
Nodes move calmly.
Less animation.
```

High Motion:

```txt
Graph feels more alive.
Nodes respond more visibly.
Layout takes longer to settle.
```

### 11.2 Low-level mapping

Increasing Motion should generally:

```txt
increase maxVelocity
lower damping slightly
lower convergence strictness
allow forces to remain active longer
```

Decreasing Motion should generally:

```txt
lower maxVelocity
increase damping
increase convergence settling behavior
```

### 11.3 Example mapping

```ts
function mapMotion(value: number): Partial<GWEngineConfig> {
  return {
    maxVelocity: lerp(12, 80, value),
    convergenceThreshold: lerp(0.15, 0.75, 1 - value),
  };
}
```

Note: `convergenceThreshold` is not currently implemented in v0. It should be added during the lifecycle/convergence pass.

---

## 12. Relationship Pull

### 12.1 User-facing meaning

Relationship Pull controls how much cross-links, references, citations, dependencies, or semantic edges reshape the graph.

Low Relationship Pull:

```txt
Hierarchy and seed layout dominate.
Cross-links are visible but weak.
```

High Relationship Pull:

```txt
Connected nodes move closer.
Backlinks, references, citations, and dependencies strongly shape layout.
```

### 12.2 Low-level mapping

Increasing Relationship Pull should generally:

```txt
increase link/reference/dependency/citation spring strengths
increase relationship force ranges
lower seedAdherence slightly if structure is low
increase bridge-node stabilizing behavior
```

Decreasing Relationship Pull should generally:

```txt
reduce non-containment springs
make graph more hierarchy-first
```

### 12.3 Example mapping

```ts
function mapRelationshipPull(value: number): Partial<GWDialectConfig> {
  return {
    interactionOverrides: {
      "gwells.interaction.document-orbit.links.document-orbit": {
        strength: lerp(0.05, 1.2, value),
        range: lerp(160, 640, value),
      },
      "gwells.interaction.reference-thread.springs.document-orbit": {
        strength: lerp(0.05, 1.4, value),
        range: lerp(200, 800, value),
      },
      "gwells.interaction.bridge-node.stabilizes.semantic-cluster": {
        strength: lerp(0.1, 1.3, value),
        range: lerp(240, 900, value),
      },
    },
  };
}
```

---

## 13. Hierarchy Pull

### 13.1 User-facing meaning

Hierarchy Pull controls how strongly parent-child structure shapes the graph.

Low Hierarchy Pull:

```txt
Folders, documents, chapters, or containers become less dominant.
Links and semantic clusters can reshape the graph.
```

High Hierarchy Pull:

```txt
Parent-child structure dominates.
The graph behaves more like a tree or outline.
```

### 13.2 Low-level mapping

Increasing Hierarchy Pull should generally:

```txt
increase containment spring strength
increase parent-child seed adherence
increase collection/container anchor strength
increase hierarchy-related interaction ranges
```

Decreasing Hierarchy Pull should generally:

```txt
reduce containment spring strength
allow cross-links and semantic relations to dominate
```

### 13.3 Example mapping

```ts
function mapHierarchyPull(value: number): Partial<GWDialectConfig> {
  return {
    interactionOverrides: {
      "gwells.interaction.document-orbit.springs.collection-anchor": {
        strength: lerp(0.2, 1.8, value),
      },
      "gwells.interaction.section-band.springs.document-orbit": {
        strength: lerp(0.2, 1.6, value),
      },
      "gwells.interaction.annotation-satellite.springs.section-band": {
        strength: lerp(0.3, 2.0, value),
      },
    },
  };
}
```

---

## 14. Stability

### 14.1 User-facing meaning

Stability controls how quickly the graph stops moving and how resistant it is to jitter.

Low Stability:

```txt
Graph can keep breathing and adjusting.
Useful during exploration.
```

High Stability:

```txt
Graph settles quickly and stays readable.
Useful for large graphs or documentation views.
```

### 14.2 Low-level mapping

Increasing Stability should generally:

```txt
increase damping
lower maxVelocity
increase convergence strictness
increase seed adherence modestly
reduce noisy long-range forces
```

Decreasing Stability should generally:

```txt
lower damping
increase motion
allow long-range forces to adjust longer
```

### 14.3 Example mapping

```ts
function mapStability(value: number): {
  engineConfig: Partial<GWEngineConfig>;
  config: Partial<GWDialectConfig>;
} {
  return {
    engineConfig: {
      maxVelocity: lerp(80, 16, value),
      convergenceThreshold: lerp(0.05, 0.45, value),
    },
    config: {
      wellOverrides: {
        "gwells.well.document-orbit": {
          damping: lerp(0.82, 0.94, value),
          seedAdherence: lerp(0.03, 0.12, value),
        },
        "gwells.well.semantic-cluster": {
          damping: lerp(0.80, 0.94, value),
          seedAdherence: lerp(0.00, 0.08, value),
        },
      },
    },
  };
}
```

---

## 15. Macro conflict handling

Some macros intentionally push against each other.

Examples:

```txt
High Structure + High Relationship Pull:
  Graph preserves seeded structure but cross-links visibly tug nodes.

Low Structure + High Relationship Pull:
  Graph becomes relationship-first.

High Stability + High Motion:
  Conflict. Stability should cap motion.

High Spacing + High Clustering:
  Clusters spread apart, but nodes inside clusters gather.
```

### 15.1 Conflict rule

When macros conflict:

```txt
Safety and readability win.
```

Recommended priority:

```txt
1. Stability safety clamps
2. Scale/performance clamps
3. Profile-specific constraints
4. User macro intent
5. Advanced raw overrides, if allowed
```

Advanced raw overrides may bypass some clamps only in developer/debug mode.

---

## 16. Scale-aware clamps

Macro output should be adjusted for graph size.

### 16.1 Large graph clamp

For large graphs:

```txt
lower maxVelocity
increase damping
reduce long-range relationship pull
increase convergence behavior
avoid expensive dense interactions
```

### 16.2 Huge graph clamp

For huge graphs:

```txt
force stable mode
disable expensive experimental interaction sets
prefer seed-heavy profiles
warn user before enabling fluid/high-motion behavior
```

### 16.3 Example

```ts
function applyScaleSafetyClamps(
  macroConfig: GWResolvedMacroConfig,
  analysis: GWGraphAnalysis
): GWResolvedMacroConfig {
  if (analysis.scale.estimatedPhysicsCost === "huge") {
    return clampForHugeGraph(macroConfig);
  }

  if (analysis.scale.estimatedPhysicsCost === "large") {
    return clampForLargeGraph(macroConfig);
  }

  return macroConfig;
}
```

---

## 17. Profile defaults

Every parameter preset may define macro defaults.

Example:

```ts
export const UNIVERSAL_CALM_MACROS: GWMacroControlState = {
  structure: 0.65,
  spacing: 0.55,
  clustering: 0.45,
  motion: 0.30,
  relationshipPull: 0.45,
  hierarchyPull: 0.55,
  stability: 0.75,
};
```

### 17.1 Suggested defaults by profile

| Profile | Structure | Spacing | Clustering | Motion | Relationship Pull | Hierarchy Pull | Stability |
|---|---:|---:|---:|---:|---:|---:|---:|
| Universal Balanced | 0.60 | 0.55 | 0.45 | 0.35 | 0.45 | 0.50 | 0.75 |
| Hierarchical Containment | 0.80 | 0.60 | 0.30 | 0.25 | 0.25 | 0.85 | 0.85 |
| Knowledge Garden | 0.45 | 0.60 | 0.70 | 0.40 | 0.75 | 0.35 | 0.65 |
| Document Library | 0.70 | 0.55 | 0.50 | 0.30 | 0.55 | 0.70 | 0.80 |
| Web Domain Map | 0.55 | 0.65 | 0.50 | 0.35 | 0.80 | 0.45 | 0.70 |
| Semantic Constellation | 0.25 | 0.70 | 0.85 | 0.45 | 0.65 | 0.20 | 0.60 |
| Imported Position Preserve | 0.90 | 0.50 | 0.25 | 0.20 | 0.30 | 0.30 | 0.90 |

These are starting points, not final tuning values.

---

## 18. UI labels and descriptions

### 18.1 Structure

Label:

```txt
Structure
```

Description:

```txt
How strongly the layout keeps its seeded shape.
```

Low label:

```txt
Flexible
```

High label:

```txt
Structured
```

### 18.2 Spacing

Description:

```txt
How much breathing room nodes and clusters get.
```

Low label:

```txt
Compact
```

High label:

```txt
Spacious
```

### 18.3 Clustering

Description:

```txt
How strongly related nodes gather together.
```

Low label:

```txt
Loose
```

High label:

```txt
Clustered
```

### 18.4 Motion

Description:

```txt
How fluidly the graph moves while settling.
```

Low label:

```txt
Calm
```

High label:

```txt
Lively
```

### 18.5 Relationship Pull

Description:

```txt
How strongly links, references, and dependencies reshape the layout.
```

Low label:

```txt
Subtle
```

High label:

```txt
Strong
```

### 18.6 Hierarchy Pull

Description:

```txt
How strongly parent-child structure shapes the layout.
```

Low label:

```txt
Soft
```

High label:

```txt
Dominant
```

### 18.7 Stability

Description:

```txt
How quickly the graph settles and resists jitter.
```

Low label:

```txt
Exploratory
```

High label:

```txt
Stable
```

---

## 19. Advanced parameter disclosure

Advanced Mode may show raw values generated by macros.

Example:

```txt
Structure: 0.75
  document-orbit.seedAdherence: 0.14
  collection-anchor.centerGravity: 0.06
  maxVelocity cap: 32

Relationship Pull: 0.80
  links.document strength: 1.0
  reference-thread spring range: 720
```

Default UI should not show this.

---

## 20. Reset behavior

Users should be able to reset macro controls.

Reset options:

```txt
Reset this slider
Reset all sliders to profile defaults
Reset all tuning to profile defaults
Reset profile and tuning
```

Reset should not clear node/family overrides unless explicitly requested.

---

## 21. Implementation sequence

### Pass 1 — Type and defaults

Add:

```txt
GWMacroControlState
GWParameterMacroDefaults
profile macro defaults
```

### Pass 2 — Resolver

Add:

```txt
resolveMacroControls()
mergeMacroConfig()
clampMacroValues()
```

### Pass 3 — Profile integration

Merge macros into:

```txt
profile parameter preset
runtime config
applyProfile()
parameter-preset-only apply mode
```

### Pass 4 — UI integration

Add:

```txt
macro sliders
profile default reset
advanced raw preview
large-graph warnings
```

---

## 22. Test checklist

### 22.1 Value tests

- macro values clamp to 0–1
- missing macro values fill from profile defaults
- reset restores profile defaults
- invalid values do not produce NaN

### 22.2 Mapping tests

- Structure affects seedAdherence
- Spacing affects idealDistance/repulsion
- Clustering affects semantic/topic interactions
- Motion affects maxVelocity/damping/convergence
- Relationship Pull affects link/reference interactions
- Hierarchy Pull affects containment interactions
- Stability applies safety clamps

### 22.3 Merge tests

- advanced raw overrides beat macro output
- macro output beats parameter preset
- profile preset beats engine defaults
- safety clamps apply last unless debug mode bypasses them

### 22.4 Scale tests

- large graphs reduce maxVelocity
- huge graphs warn before high motion
- huge graphs avoid expensive relationship pull defaults

---

## 23. Non-goals

This doc does not require:

- exact final tuning values
- advanced physics UI
- animation preview
- Barnes-Hut/spatial indexing
- true 3D tuning controls
- machine-learning-based parameter selection
- saved user preference profiles

Those can be added later.

---

## 24. Success criteria

This system is successful when:

- users can tune layouts without understanding raw physics
- macro sliders produce predictable graph behavior
- profile defaults feel sane
- large graphs remain safe
- advanced users can inspect raw mappings
- reset behavior is clear
- macro controls do not hide capability, only organize it

---

## 25. Guiding principle

The macro controls should feel like steering a graph, not tuning an engine.
