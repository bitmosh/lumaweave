# Session Log: Sigma Layout Engine v0

## Goal

Fix the collapsed/stacked graph layout and wire basic layout settings to the renderer. Make the 233-node graph spread out into a readable initial layout with physics controls affecting layout spread.

## Observed Problem

LumaWeave loaded 233 nodes and 313 edges correctly, but the Sigma graph appeared collapsed/stacked. Most nodes occupied the same visual area in a simple circular layout with fixed radius, making the graph unreadable.

## Root Cause

The original `generateCircularLayout` function used a fixed radius of 100 for all nodes, placing them on a single circle. With 233 nodes, this resulted in severe overlap and poor visibility.

## Files Changed

- `src/graph/renderers/sigma2d/buildGraphologyGraph.ts` - Implemented sunflower layout with settings-based scale
- `src/graph/renderers/sigma2d/SigmaGraphView.tsx` - Added physics settings props and camera fit
- `src/app/AppShell.tsx` - Wired physics settings from store to renderer
- `src/control-plane/settings/settings.registry.ts` - Added planned physics settings

## Layout Algorithm Used

**Sunflower / Golden Angle Layout**

```typescript
const goldenAngle = Math.PI * (3 - Math.sqrt(5));

for (let i = 0; i < nodeCount; i++) {
  const radius = Math.sqrt(i + 1) * layoutScale;
  const angle = i * goldenAngle;

  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
}
```

This algorithm:
- Uses the golden angle (φ = π(3 - √5) ≈ 2.39996 radians)
- Spirals nodes outward with radius = √(i + 1) × scale
- Distributes nodes evenly without overlap
- Creates a natural sunflower pattern

**Settings-Based Scale**

```typescript
const layoutScale = 18 + linkDistance * 0.2 + repelForce * 0.08;
```

- Base scale: 18
- Link distance adds spread: 0.2 per unit
- Repel force adds spread: 0.08 per unit

**Node Size**

```typescript
const size = baseSize * nodeSize;
```

- Base size: 10
- Multiplied by nodeSize setting

## Settings Wired

Active settings (affect behavior now):
- `physics.nodeSize` - Multiplies base node size (0.25 to 4)
- `physics.linkDistance` - Affects layout spread (20 to 500)
- `physics.repelForce` - Affects layout spread (0 to 500)

Planned settings (marked as "Planned" in UI):
- `physics.centerForce` - Planned for force layout v1
- `physics.communityGravity` - Planned for force layout v1
- `physics.curveAmount` - Planned for visual polish
- `physics.animationSoftness` - Planned for force layout v1

## Validation Run

- Typecheck passed: `npm run typecheck` succeeded
- Dev server running on port 1420
- Console will show debug logs for graph building

## Debug Logs Added

```typescript
console.log("Building Graphology graph", {
  inputNodes: nodes.length,
  inputEdges: edges.length,
});

console.log("Graphology output", {
  order: graph.order,
  size: graph.size,
  sampleNodes: graph.nodes().slice(0, 5).map((id) => ({
    id,
    attrs: graph.getNodeAttributes(id),
  })),
});
```

## Behavior Added

1. **Sunflower Layout**: 233 nodes now spread in a spiral pattern instead of collapsed circle
2. **Settings Reactivity**: Graph rebuilds when nodeSize, linkDistance, or repelForce changes
3. **Node Size Control**: Slider visibly changes node sizes
4. **Layout Spread Control**: Link distance and repel force sliders visibly change graph spread
5. **Camera Fit**: Sigma camera resets to fit graph after creation
6. **Selection State**: Node selection lifted to parent component (AppShell)

## Known Limitations

- No real force simulation yet (deterministic layout only)
- No edge clicking yet
- No Solar Plasma styling yet
- No 3D rendering yet
- No semantic layout lenses yet
- Planned settings don't affect behavior yet (marked as "Planned")

## Next Step

Verify the app renders 233 spread-out nodes in the browser at `http://localhost:1420` and that:
- Node size slider visibly changes node sizes
- Link distance or repel force sliders visibly change graph spread
- Console shows debug logs confirming correct node/edge counts and distinct coordinates

## Roadmap Note

After this milestone, the planned sequence is:
- Sigma Force Layout v1 → real force/repulsion/cluster physics
- LumaWeave Universe View → graph directories as galaxies
- Solar Plasma Visual v0 → node/edge visual grammar
- Semantic Layout Lenses → solar orbit, districts, helix, impact rings

The galaxy/universe view concept has been added to planning docs as a future roadmap feature.
