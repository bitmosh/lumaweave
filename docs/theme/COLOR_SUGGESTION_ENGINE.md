---
id: theme.color.suggestion.engine
title: Color Suggestion Engine
type: design-doc
status: design-pending-impl
version: v88-design (impl deferred to v88b or v88c)
domain: theme
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-22
governs:
  - src/themes/colorSuggestionEngine.ts (planned)
  - src/themes/themeSelectableColors.ts (planned)
references:
  - theme.system.overview
  - theme.preset.model
  - theme.token.path.map
  - theme.override.storage.contract
tags: [theme, color, automation, ux, design]
---

# Color Suggestion Engine

When a user adds a new element to the app (node, panel, button, asset, etc.), they shouldn't have to pick a color from scratch. The system suggests a color that fits the active theme, is distinct from nearby elements, has appropriate contrast, and is overridable.

This document describes the engine design. Implementation is deferred to v88b or v88c. v88a (runtime layer) does NOT include this engine.

---

## Why this exists

Without a suggestion engine, the user has three options when creating a new element:

1. **Always pick from a color picker** — high friction, decision fatigue
2. **Always get the same default color** — boring, all elements look identical
3. **Get a random color** — chaotic, inconsistent, fights the theme aesthetic

The engine provides a fourth option: **theme-aware automatic selection from a curated set, with rotation for variety and overrides for control.**

This is the same pattern Material Design uses for tonal roles, what iOS does with semantic colors, and what Notion does with accent palettes — adapted for LumaWeave's tier-based theme system.

---

## Architecture overview

Four layers:
┌─────────────────────────────────────┐
│ Layer 4: User overrides              │  themeOverrideStorage (existing)
│ (User picks override engine picks)   │
└─────────────────────────────────────┘
▲
│
┌─────────────────────────────────────┐
│ Layer 3: Suggestion logic            │  colorSuggestionEngine.ts
│ (Category + context + rotation)      │
└─────────────────────────────────────┘
▲
│
┌─────────────────────────────────────┐
│ Layer 2: Color use categories         │  Defined in this doc
│ (What kind of color does this need?)  │
└─────────────────────────────────────┘
▲
│
┌─────────────────────────────────────┐
│ Layer 1: Theme selectable colors      │  themeSelectableColors.ts
│ (8-10 curated colors per theme)       │
└─────────────────────────────────────┘

Each layer has a single responsibility. The engine sits in Layer 3 and orchestrates Layers 1 and 2 to produce a color. Layer 4 (user overrides) is existing v86d.1 infrastructure; the engine respects overrides without modifying them.

---

## Layer 1 — Theme selectable colors

Each theme defines a curated set of 8-10 colors that are "good for arbitrary element use." These are NOT the theme's full Tier 1 primitives. They're a hand-picked subset that looks good when used as element fills, accents, or highlights.

### Why curated, not generated

Generated palettes (HSL math, hue rotation) produce technically-valid colors that often look bad. A theme's identity comes from specific color choices, not procedural rules. Curated sets preserve identity.

### Shape

```typescript
interface ThemeSelectableColors {
  themeId: ThemeId;

  /** Curated color slots. 8-10 per theme. */
  slots: ColorSlot[];

  /** Rotation order for cycling. Slot ids in order. */
  rotationOrder: string[];

  /** Semantic locks — these don't participate in rotation. */
  semantics: {
    success: string;   // slot id
    warning: string;   // slot id
    danger: string;    // slot id
    info: string;      // slot id
  };
}

interface ColorSlot {
  id: string;                  // Stable id ("aurora-violet", "plasma-cyan")
  hex: string;                 // The color
  label: string;               // Human-readable ("Aurora Violet")
  hueAngle: number;            // 0-360 HSL hue (for sorting/filtering)
  lightness: number;           // 0-100 HSL lightness (for contrast filtering)
  saturation: number;          // 0-100 HSL saturation
  role?: "primary" | "secondary" | "accent" | "neutral";
}
```

### Example: Solar Plasma selectable colors

```typescript
{
  themeId: "solar-plasma",
  slots: [
    { id: "plasma-cyan",  hex: "#00D4FF", label: "Plasma Cyan",  hueAngle: 190, lightness: 50, saturation: 100, role: "primary" },
    { id: "gold-flare",   hex: "#FFB347", label: "Gold Flare",   hueAngle: 30,  lightness: 64, saturation: 100, role: "primary" },
    { id: "magenta-glow", hex: "#FF6B9D", label: "Magenta Glow", hueAngle: 340, lightness: 70, saturation: 100, role: "accent" },
    { id: "purple-haze",  hex: "#A855F7", label: "Purple Haze",  hueAngle: 270, lightness: 65, saturation: 90,  role: "accent" },
    { id: "coral-spark",  hex: "#FF8C42", label: "Coral Spark",  hueAngle: 20,  lightness: 65, saturation: 100, role: "accent" },
    { id: "mint-flux",    hex: "#7CF6B5", label: "Mint Flux",    hueAngle: 145, lightness: 75, saturation: 90,  role: "secondary" },
    { id: "azure-light",  hex: "#4FACFF", label: "Azure Light",  hueAngle: 210, lightness: 65, saturation: 100, role: "secondary" },
    { id: "violet-mist",  hex: "#C084FC", label: "Violet Mist",  hueAngle: 280, lightness: 75, saturation: 95,  role: "secondary" },
  ],
  rotationOrder: [
    "plasma-cyan", "gold-flare", "magenta-glow", "purple-haze",
    "coral-spark", "mint-flux", "azure-light", "violet-mist"
  ],
  semantics: {
    success: "mint-flux",
    warning: "gold-flare",
    danger: "magenta-glow",
    info: "plasma-cyan",
  },
}
```

### Curation principles per theme

When designing a theme's selectable set:

1. **Cover hue space** — distribute across the spectrum so cycling produces variety. Avoid having 5 blues and no warms.
2. **Honor theme identity** — Obsidian Aurora's set leans violet, Midnight Loom leans gold, etc.
3. **Skip muddy mid-tones** — slots should be visible as element fills. Greys and unsaturated colors belong in Tier 2 semantics, not selectable.
4. **Stay above readable lightness** — slots should support text-on-color contrast for most reasonable text colors. Very dark or very light values complicate the contrast story.
5. **Pick semantic locks last** — once the rotating set is chosen, assign which slot is "success" (usually green/mint), "warning" (gold/amber), "danger" (red/magenta), "info" (cyan/blue).

### Selectable sets for the 6 built-in themes

To be defined as part of implementation. Each theme gets its own thoughtfully-curated set following the principles above. Curation happens in v88b's implementation pass.

---

## Layer 2 — Color use categories

A "category" is the kind of color use a new element needs. Categories constrain what slots are eligible.

### Defined categories

```typescript
type ColorUseCategory =
  | "node-primary"      // Main graph node — bold, full saturation, any hue
  | "node-secondary"    // Supporting node — lighter or desaturated variant
  | "node-tertiary"     // Background node — muted, lower attention
  | "panel-accent"      // Panel highlight — uses primary or accent role slots
  | "panel-tint"        // Panel background tint — lower saturation, lighter
  | "edge-flow"         // Edge color — uses primary slots, full saturation
  | "edge-secondary"    // Edge supporting — desaturated
  | "asset-tag"         // Asset tag color in workshop — uses any rotation slot
  | "user-custom"       // User-marked element — bright, distinct, attention-grabbing
  | "state-success"     // Semantic success — locked to slot in semantics.success
  | "state-warning"     // Semantic warning — locked to slot in semantics.warning
  | "state-danger"      // Semantic danger — locked to slot in semantics.danger
  | "state-info";       // Semantic info — locked to slot in semantics.info
```

### Category → slot filter

```typescript
function eligibleSlots(category: ColorUseCategory, allSlots: ColorSlot[]): ColorSlot[] {
  switch (category) {
    case "node-primary":
    case "edge-flow":
    case "user-custom":
      return allSlots.filter(s => s.role === "primary" || s.role === "accent");

    case "node-secondary":
    case "edge-secondary":
      return allSlots.filter(s => s.role === "secondary" || s.role === "accent");

    case "node-tertiary":
    case "panel-tint":
      return allSlots.filter(s => s.lightness > 60); // lighter/muted

    case "panel-accent":
      return allSlots.filter(s => s.role === "primary" || s.role === "accent");

    case "asset-tag":
      return allSlots; // all eligible — variety is the point

    case "state-success":
    case "state-warning":
    case "state-danger":
    case "state-info":
      // Locked to specific slot — handled separately, not via filter
      return [];

    default:
      return allSlots;
  }
}
```

### Adding new categories

When a new category is needed (e.g., a new UI element type), add it to the union type and define its eligibility filter. The engine and per-theme selectable sets don't need to change — they just gain a new consumer.

---

## Layer 3 — The engine

The selection logic. Maintains rotation state per category. Picks slots based on category, context, neighbors, and contrast.

### Shape

```typescript
interface ColorSuggestionEngine {
  /**
   * Pick a color for a new element.
   * Same contextKey always returns the same color (idempotent).
   * Engine maintains rotation state internally.
   */
  pick(
    category: ColorUseCategory,
    context: PickContext,
  ): string;

  /**
   * Release a context — engine forgets the pick, freeing the slot
   * for future rotations to choose again.
   */
  release(contextKey: string): void;

  /**
   * Get current rotation state (for debugging/inspection).
   */
  getRotationState(): Record<ColorUseCategory, number>;

  /**
   * Reset all rotation state (e.g., when theme changes).
   */
  reset(): void;
}

interface PickContext {
  /** Stable identifier for this color use. Same key returns same color. */
  contextKey: string;

  /** Currently active theme — engine reads selectableColors[themeId]. */
  themeId: ThemeId;

  /** Adjacent colors to avoid. The engine de-prioritizes slots matching these. */
  neighbors?: string[];

  /** If text will sit on this color, the engine checks contrast. */
  contrastPartner?: string;

  /** Minimum WCAG contrast ratio required (default 3.0 for non-text, 4.5 for text). */
  contrastMinRatio?: number;

  /** User's prior manual pick for this contextKey, if any. Takes precedence. */
  userPick?: string;
}
```

### Selection algorithm

When `pick(category, context)` is called:

1. **Check user override.** If `context.userPick` is set, return it immediately. Engine respects user choices absolutely.
2. **Check memoization.** If `contextKey` was previously picked AND the theme hasn't changed AND no release call happened, return the previously-picked color.
3. **Handle semantic locks.** If category is `state-success/warning/danger/info`, return `selectableColors[themeId].semantics[role]` mapped to slot.hex. Don't rotate.
4. **Filter eligible slots.** Apply `eligibleSlots(category, allSlots)`.
5. **Filter by contrast.** If `contrastPartner` is set, remove slots whose contrast against the partner falls below `contrastMinRatio`.
6. **Filter by neighbors.** Remove slots whose hex matches any in `context.neighbors`.
7. **Pick from rotation.** Get current rotation index for this category. Advance through `rotationOrder` until landing on a slot still in the filtered set. If no slot survives all filters, relax filters in this order: drop neighbor filter → drop contrast filter → fall back to first eligible slot.
8. **Record the pick.** Store `contextKey → slotId` mapping and advance rotation index for this category.
9. **Return slot.hex.**

### Per-category rotation

The engine maintains one rotation counter per category. Categories rotate independently:

```typescript
{
  "node-primary": 3,      // Next pick advances from slot[3]
  "panel-accent": 0,      // Next pick starts from slot[0]
  "asset-tag": 7,         // Next pick advances from slot[7]
}
```

When a category's rotation reaches the end of its eligible set, it wraps back to the beginning. This produces cyclic variety while staying within the theme.

### Theme change behavior

When the active theme changes:

- Engine calls `reset()` internally
- All rotation counters return to 0
- Memoized picks (`contextKey → hex`) are cleared, since the slot ids don't carry meaning across themes

This means: after a theme switch, all auto-picked elements get NEW colors from the new theme's selectable set. User overrides survive (they're stored separately in themeOverrideStorage).

### Reservation pattern

For elements that exist on screen, the engine reserves their colors so concurrent picks don't duplicate:

```typescript
// New node created
const color = engine.pick("node-primary", {
  contextKey: "node-42",
  themeId: "solar-plasma",
  neighbors: getNeighborNodeColors("node-42"),
});

// ... later, node is deleted
engine.release("node-42");
```

The neighbor list is computed at the call site (the graph code knows which nodes are nearby). The engine doesn't track adjacency itself.

---

## Layer 4 — User overrides

Existing v86d.1 infrastructure. The engine respects overrides:

- Before picking, check if an override exists for this context's stored target. If yes, return the override.
- After engine picks, the engine's pick is the "default" — user can override via the inspector. The override goes into themeOverrideStorage as usual.

The engine does NOT mutate or read from themeOverrideStorage directly. The caller passes `context.userPick` if one exists. This keeps the engine pure and the storage system in sole control of override lifecycle.

---

## Integration with existing systems

### Theme switching

When `applyTheme(themeId)` is called, the suggestion engine calls `reset()` to clear rotation state. The theme crossfade (v87.4) animates the actual colors; the engine just resets its counters.

### Override storage (v86d.1)

The engine never reads/writes overrides. Consumers check overrides FIRST, then call the engine only if no override exists.

### Workshop UI (v88b)

When the user creates a new asset, theme, or palette in Workshop, the UI calls `engine.pick("asset-tag", {...})` to get a default color. User can override in the asset's color field. Workshop displays the engine's pick with a "(auto)" hint until user overrides.

### Inspector mini-graph (v86d)

When the inspector opens on an element with an auto-picked color, the Color tab shows "Auto-picked: <hex>" with a "use this" affirmation button (lock it in as user pick) and the usual color picker for changing.

---

## Color-blindness consideration

**Deferred to v93.** When culori lands, the engine gets a filter layer:

```typescript
function colorBlindSafeFilter(slots: ColorSlot[], profile: ColorBlindProfile): ColorSlot[] {
  // Return only slots that remain distinguishable under the profile
}
```

This is a Layer 1.5 filter applied between category eligibility and rotation. For v88, color-blind users use the override system manually.

The engine architecture supports this addition without breaking changes — the filter is additive.

---

## API examples

### Picking for a new node

```typescript
import { colorSuggestionEngine } from "./themes/colorSuggestionEngine";

const color = colorSuggestionEngine.pick("node-primary", {
  contextKey: "node-42",
  themeId: getActiveTheme(),
  neighbors: getAdjacentNodeColors("node-42"),
  contrastPartner: getNodeLabelColor(),
  contrastMinRatio: 4.5,
});

renderNode("node-42", { fillColor: color });
```

### Picking for a workshop asset tag

```typescript
const tagColor = colorSuggestionEngine.pick("asset-tag", {
  contextKey: `asset-${assetId}-tag`,
  themeId: getActiveTheme(),
});
```

### Releasing on element delete

```typescript
function deleteNode(nodeId: string) {
  colorSuggestionEngine.release(`node-${nodeId}`);
  removeNodeFromGraph(nodeId);
}
```

### Respecting user override

```typescript
const stored = themeOverrideStorage.getTargetOverride(`node-${nodeId}`, "fill.color");
const color = stored ?? colorSuggestionEngine.pick("node-primary", {
  contextKey: `node-${nodeId}`,
  themeId: getActiveTheme(),
  // ...
});
```

---

## Implementation phases

### Phase A — Selectable color sets per theme (v88b)

Define `themeSelectableColors.ts` with curated 8-10 slot sets for each of the 6 built-in themes. Pure data file. ~200 lines.

Acceptance: every built-in theme has a selectable color set with at least 8 slots, all 4 semantic locks assigned.

### Phase B — Engine implementation (v88b or v88c)

Implement `colorSuggestionEngine.ts` per this design. Module-scoped state, no external dependencies beyond `themeSelectableColors` and WCAG contrast utility from v87.3.

Acceptance: engine passes the rotation tests, contrast tests, neighbor avoidance tests, and theme-switch reset tests defined in the test plan below.

### Phase C — First consumer integration

A real consumer calls the engine. Most likely: Workshop's asset color picker, or the graph's new-node color assignment.

Acceptance: in real use, the engine produces distinct, theme-appropriate colors for a sequence of new elements.

### Phase D — Color-blindness filter (v93+)

Add the culori-powered filter as a pre-rotation step. Additive change; existing API unchanged.

---

## Test plan

When implementing, cover at minimum:

1. **Rotation per category** — picking 8 elements of the same category returns 8 distinct colors (assuming 8+ slots).
2. **Category independence** — picking 4 node-primary then 4 panel-accent doesn't share rotation state.
3. **Neighbor avoidance** — picking with neighbors=[slot[0].hex] doesn't return slot[0].
4. **Contrast filtering** — picking with contrastPartner=#000000 and minRatio=7 doesn't return slots that fail.
5. **Theme switch reset** — pick → switch theme → pick same contextKey → returns NEW color from new theme.
6. **Idempotency** — pick(category, {contextKey:"X"}) called twice returns same color.
7. **Release** — release("X") → pick({contextKey:"X"}) returns a fresh color (or the same if rotation lands back).
8. **Semantic locks** — pick(state-success, ...) always returns the theme's success-assigned slot, ignoring rotation.
9. **User override precedence** — pick with userPick set returns the userPick immediately.
10. **Fallback chain** — if all filters eliminate every slot, engine returns first eligible slot rather than throwing.

---

## Open questions for implementation

These don't need answers in design; they get resolved during implementation:

- **Storage of rotation state across reloads.** Currently designed as in-memory. Should it persist? My read: no. Rotation state being session-local is fine — picks for existing elements memoize, new picks get whatever rotation produces.

- **Engine subscription pattern.** Should consumers subscribe to engine state changes? Probably not — the engine is called per-pick, not watched. Consumers re-pick when needed.

- **Multi-theme picks (theme A's elements alongside theme B's elements).** Out of scope. The engine assumes one active theme at a time. Multi-theme support is its own design.

- **Performance under heavy use.** For 100s of new elements per frame, the engine should be O(slots) per pick. With 8-10 slots, that's effectively constant. Should be fine. Profile if needed.

---

## Why not just generate colors

A note for future architects asking "couldn't we just use HSL math to generate infinite variety?"

Tried-and-true wisdom: generated colors look generated. Curated colors look designed. The whole point of having themes is to look designed, not procedurally varied.

Generated palettes are useful for:
- The palette generation function (v88a) — when a user wants tonal scales from a hue anchor
- The variable font axis playground (v87.4) — when demonstrating range
- Color science demos (v95+) — when showing the theory

Generated palettes are wrong for:
- Picking a color for "the next new element a user creates"

The selectable set model gives the engine a tasteful menu rather than an algorithmic firehose.

---

## Future enhancements

Not in scope for v88 but worth noting:

- **Smart recoloring on theme switch.** If user picked "plasma-cyan" for node-42 in Solar Plasma, switching to Obsidian Aurora could remap to the closest equivalent (likely "crystal-cyan") rather than re-picking from scratch.
- **User-defined slot favorites.** Users could mark slots as "use more often" to bias rotation.
- **Theme-author tools.** Workshop UI for designing a new theme could include a "selectable set designer" that helps theme authors pick 8-10 from their primitive palette.
- **Cross-element coherence rules.** "Edges connecting two nodes should be a blend or relative to the node colors" — beyond simple rotation.

---

*End of design document.*