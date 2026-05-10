---
id: link.network.layer.3.gaps
title: Layer 3 Token Coverage Gap
type: gap-analysis
status: current
version: v86a
domain: registries
cluster: slate
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-10
governs:
  - src/graph/graphVisualThemeMappingRegistry.ts
references:
  - link.network.overview
  - link.network.layer.3
  - TOKEN_CENSUS_CANONICAL.md
  - theme.token.path.map
tags:
  - link-network
  - layer-3
  - gap-analysis
  - tokens
  - v86a
  - vP-Registry-Y
---

# Layer 3 Token Coverage Gap

Gap analysis comparing 40 canonical theme tokens against 14 Layer 3 mappings. Layer 3 currently covers v50 graph elements but does not include mappings for the 24 new tokens added in v86a.

## Coverage Summary

- **Total canonical tokens:** 40
- **Mapped tokens:** 14
- **Unmapped tokens:** 26
- **Coverage rate:** 35%

## Mapped Tokens (14)

The following canonical tokens have Layer 3 mappings in `graphVisualThemeMappingRegistry.ts`:

| Canonical Token | Graph Element | Layer 3 Mapping |
|-----------------|---------------|----------------|
| app.background | graph.surface | graph.surface → app.background |
| graph.edge.label | graph.edges | graph.edges → graph.edge.label.color |
| graph.edge.stroke | graph.edges | graph.edges → graph.edge.color |
| graph.node.fill | graph.nodes | graph.nodes → graph.node.fill |
| graph.node.label | graph.nodes | graph.nodes → graph.node.label.color |
| panel.background | graph.frame | graph.frame → panel.background |
| panel.border | graph.frame | graph.frame → panel.border |
| text.muted | graph.labels | graph.labels → graph.label.fontSize (partial) |
| text.primary | graph.labels | graph.labels → graph.label.fontFamily (partial) |
| effects.glow.intensity | graph.highlight | graph.highlight → graph.highlight.color |
| graph.edge.hoverStroke | graph.edges | graph.edges → graph.edge.color (partial) |
| graph.edge.selectedStroke | graph.edges | graph.edges → graph.edge.color (partial) |
| graph.node.hoverFill | graph.nodes | graph.nodes → graph.node.fill (partial) |
| graph.node.selectedFill | graph.nodes | graph.nodes → graph.node.fill (partial) |

Note: Some mappings are partial or inferred (e.g., `text.muted` and `text.primary` mapped to label font size/family rather than color).

## Unmapped Tokens by Tier

### Tier 1 Primitives (3 unmapped)

No Tier 1 primitive tokens are currently unmapped. All primitive tokens in the canonical set are mapped or not applicable to graph elements.

### Tier 2 Semantics (23 unmapped)

| Token | Purpose | Why Unmapped |
|-------|---------|--------------|
| accent.primary | Accent color for highlights | No graph element currently uses accent tokens |
| app.glow | Application glow effect | Glow effects not yet wired to renderer |
| backdrop.corona.color | Corona backdrop color | v86b visual treatment, not yet in Layer 3 |
| backdrop.corona.intensity | Corona backdrop intensity | v86b visual treatment, not yet in Layer 3 |
| backdrop.flare.color | Flare backdrop color | v86b visual treatment, not yet in Layer 3 |
| backdrop.starfield.density | Starfield density | v86b visual treatment, not yet in Layer 3 |
| backdrop.vignette.intensity | Vignette intensity | v86b visual treatment, not yet in Layer 3 |
| bookmark.alert.color | Bookmark alert color | Bookmark overlay not in Layer 4 |
| bookmark.pinned.color | Bookmark pinned color | Bookmark overlay not in Layer 4 |
| bookmark.ref.color | Bookmark ref color | Bookmark overlay not in Layer 4 |
| edge.plasma.flowSpeed | Edge plasma flow speed | v86b edge plasma, not yet in Layer 3 |
| edge.style.preset | Edge style preset | Edge style presets not yet defined |
| graph.edge.hoverStroke | Edge hover stroke color | Partially mapped (uses graph.edge.color) |
| graph.edge.selectedStroke | Edge selected stroke color | Partially mapped (uses graph.edge.color) |
| graph.node.hoverFill | Node hover fill color | Partially mapped (uses graph.node.fill) |
| graph.node.selectedFill | Node selected fill color | Partially mapped (uses graph.node.fill) |
| inspector.radial.haloColor | Inspector radial halo color | Inspector UI, not graph element |
| inspector.radial.spokeColor | Inspector radial spoke color | Inspector UI, not graph element |
| node.sphere.flowDuration | Node sphere flow duration | v86b node sphere, not yet in Layer 3 |
| node.sphere.glowStrength | Node sphere glow strength | v86b node sphere, not yet in Layer 3 |
| node.sphere.humDuration | Node sphere hum duration | v86b node sphere, not yet in Layer 3 |
| panel.blur.amount | Panel blur amount | UI panel setting, not graph element |
| panel.tile.groupOutlineColor | Tile group outline color | v86c tile system, not yet in Layer 3 |
| panel.tile.handleColor | Tile handle color | v86c tile system, not yet in Layer 3 |
| selection.dim.opacity | Selection dim opacity | Selection state not in Layer 4 |
| selection.glitter.densityScale | Selection glitter density | Selection state not in Layer 4 |
| selection.halo.color | Selection halo color | Selection state not in Layer 4 |
| selection.halo.maxRadiusRatio | Selection halo max radius | Selection state not in Layer 4 |

### Tier 3 Components (3 unmapped)

| Token | Purpose | Why Unmapped |
|-------|---------|--------------|
| typography.font.body | Body font family | Typography not yet mapped to graph labels |
| typography.font.display | Display font family | Typography not yet mapped to graph labels |
| typography.font.mono | Mono font family | Typography not yet mapped to graph labels |

## Gap Categories

### v86b Visual Treatment Tokens (6)
- backdrop.corona.color, backdrop.corona.intensity, backdrop.flare.color, backdrop.starfield.density, backdrop.vignette.intensity
- edge.plasma.flowSpeed, edge.style.preset
- node.sphere.flowDuration, node.sphere.glowStrength, node.sphere.humDuration

### v86c Tile System Tokens (2)
- panel.tile.groupOutlineColor, panel.tile.handleColor

### Bookmark Overlay Tokens (3)
- bookmark.alert.color, bookmark.pinned.color, bookmark.ref.color

### Selection State Tokens (4)
- selection.dim.opacity, selection.glitter.densityScale, selection.halo.color, selection.halo.maxRadiusRatio

### Inspector UI Tokens (2)
- inspector.radial.haloColor, inspector.radial.spokeColor

### Typography Tokens (3)
- typography.font.body, typography.font.display, typography.font.mono

### Partial Mappings (4)
- graph.edge.hoverStroke, graph.edge.selectedStroke, graph.node.hoverFill, graph.node.selectedFill (currently share base colors)

### Other (2)
- accent.primary, app.glow, panel.blur.amount

## Recommendations

This gap analysis surfaces the missing mappings without proposing fixes. The gaps fall into three categories:

1. **Future phase tokens:** v86b visual treatment, v86c tile system, bookmark overlay, selection state (not yet implemented)
2. **UI subsystem tokens:** Inspector UI, typography, panel blur (not graph elements)
3. **Refinement opportunity:** Partial mappings for hover/selected states could be split into dedicated tokens

Resolution of these gaps should wait until:
- v86b visual treatment lands (for backdrop, edge plasma, node sphere tokens)
- v86c tile system lands (for panel tile tokens)
- Bookmark overlay is added to Layer 4 (for bookmark tokens)
- Selection state is added to Layer 4 (for selection tokens)
- Typography strategy is defined (for font tokens)
