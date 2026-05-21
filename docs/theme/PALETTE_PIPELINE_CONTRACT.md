---
id: theme.palette.pipeline.contract
title: Palette Pipeline Contract
type: contract
status: current
version: v86d.3a-pre
domain: theme
cluster: gold
agent_readable: true
last_updated: 2026-05-20
references:
  - theme.system.overview
  - theme.target.registry
  - theme.token.path.map
tags: [theme, palette, pipeline, runtime, v86d]
---

# Palette Pipeline Contract

## Purpose

Defines how runtime consumers access the active theme's color primitives, and how inspector spokes (or any other binding-aware consumer) iterate a target's token bindings to decide what to edit.

This is the first formal palette consumer contract. Previously the token system was governance-only (declaration, tiering, canonical path validation). This contract adds the runtime consumption layer.

---

## Active theme primitives

The active theme's Tier 1 primitives are the source of all palette colors offered to the user.

Consumers access primitives via the reactive hook:

```typescript
useActiveThemePrimitives(): ActiveThemePrimitive[]
```

Where `ActiveThemePrimitive` is:

```typescript
{
  path: string;       // e.g. "color.gold.500"
  hex: string;        // e.g. "#FFB347"
  family: string;     // e.g. "gold"
  shade: number;      // e.g. 500
}
```

The hook is **reactive** — when the user switches themes, consumers re-render with the new theme's primitives.

Primitives are returned in **canonical sort order**:
1. By family (alphabetical: corona, cream, flare, fuchsia, gold, green, magenta, purple, red, void)
2. By shade ascending within family

This ordering is stable across themes so the palette layout is predictable.

All themes declare the full canonical family set (corona, cream, flare, fuchsia, gold, green, magenta, purple, red, void). Themes may have varying shade depth per family, but the family set is invariant. This keeps palette layout stable across theme switches.

### Example

For Solar Plasma theme, the color primitives returned are:

```
{ path: "color.corona.400", hex: "#4FACFF", family: "corona", shade: 400 }
{ path: "color.corona.500", hex: "#00D4FF", family: "corona", shade: 500 }
{ path: "color.cream.100", hex: "#FFE9D6", family: "cream", shade: 100 }
{ path: "color.cream.200", hex: "#F5DAB7", family: "cream", shade: 200 }
{ path: "color.flare.500", hex: "#FF6B1A", family: "flare", shade: 500 }
{ path: "color.fuchsia.500", hex: "#CC2EFA", family: "fuchsia", shade: 500 }
{ path: "color.gold.400", hex: "#FFD79A", family: "gold", shade: 400 }
{ path: "color.gold.500", hex: "#FFB347", family: "gold", shade: 500 }
{ path: "color.green.500", hex: "#7CF6B5", family: "green", shade: 500 }
{ path: "color.magenta.500", hex: "#FF1F8F", family: "magenta", shade: 500 }
{ path: "color.purple.500", hex: "#7B2FFF", family: "purple", shade: 500 }
{ path: "color.red.500", hex: "#FF4D6D", family: "red", shade: 500 }
{ path: "color.void.600", hex: "#14071F", family: "void", shade: 600 }
{ path: "color.void.700", hex: "#1B0830", family: "void", shade: 700 }
{ path: "color.void.800", hex: "#0E0420", family: "void", shade: 800 }
{ path: "color.void.900", hex: "#03000A", family: "void", shade: 900 }
```

---

## Target token bindings

Each themeTargetRegistry entry declares which token paths the target renders. A target like `topbar.root` declares:

```typescript
tokenBindings: {
  background: "app.background",
  border: "panel.border",
  text: "text.primary",
  accent: "accent.primary"
}
```

Inspector spokes iterate these bindings to decide what's editable.

Consumers access target bindings via the synchronous function:

```typescript
getTargetBindings(targetId: string): TargetBinding[]
```

Where `TargetBinding` is:

```typescript
{
  property: string;    // e.g. "background"
  tokenPath: string;   // e.g. "app.background"
  label?: string;      // e.g. "Application Background"
}
```

Returns empty array if the target is not registered.

### Binding semantics

There is **no "primary" binding concept**. Spokes show all bindings; the user picks which one to edit. This deliberately differs from typical "pick a primary color" picker UX — LumaWeave's inspector shows the full color composition of each target.

A target like `mission-control.panel` might have three bindings (background, border, text), and the user can edit any or all of them independently. The inspector doesn't make assumptions about which is "most important."

---

## Usage patterns

### Pattern 1: Render a color palette

UI that shows swatches from the active theme:

```typescript
function PaletteUI() {
  const primitives = useActiveThemePrimitives();

  return (
    <div>
      {primitives.map((prim) => (
        <button
          key={prim.path}
          style={{ backgroundColor: prim.hex }}
          title={prim.path}
          onClick={() => applyColor(prim.hex)}
        >
          {prim.family} {prim.shade}
        </button>
      ))}
    </div>
  );
}
```

When the user switches themes (e.g., Solar Plasma → Obsidian Aurora), the hook re-renders with the new theme's primitives, and the palette updates.

### Pattern 2: Show a target's editable slots

UI that lists the token paths a target uses:

```typescript
function TargetBindingsUI({ targetId }: { targetId: string }) {
  const bindings = getTargetBindings(targetId);

  if (bindings.length === 0) {
    return <div>Target not registered.</div>;
  }

  return (
    <div>
      {bindings.map((binding) => (
        <div key={binding.tokenPath}>
          <label>{binding.property}</label>
          <span>{binding.tokenPath}</span>
        </div>
      ))}
    </div>
  );
}
```

This is suitable for an inspector UI that asks: "What can you customize about this element?" Answer: whatever token paths it declares in its bindings.

---

## When to use which accessor

- **`useActiveThemePrimitives()`** — when a UI needs to show selectable swatches from the current theme (e.g., ColorTab's palette popover, color picker dialog, asset preview)
- **`getTargetBindings(targetId)`** — when a UI needs to know what token paths a target uses, so it can enumerate editable properties (e.g., ColorTab's per-binding rows, inspector bind visualization)

The hook is reactive; the function is synchronous. Use the hook when you need reactivity; use the function when you need deterministic, synchronous behavior.

---

## Implementation notes

### Tier 1 vs Tier 2/3

This contract is about Tier 1 primitives only. Tier 2 semantics (like `surface.background.deep`) and Tier 3 components (like `node.sphere.glowStrength`) are not exposed through this pipeline. They remain internal to the three-tier governance model.

ColorTab uses primitives as the palette layer — raw colors the user picks. These colors are then applied to canonical token paths (Tier 2/3 slots) via `themeOverrideStorage.setTargetOverride()`. The primitives themselves are never stored in overrides; only the token path and the resolved hex value are persisted.

### Primitive ordering

The canonical sort order (family alphabetical, shade ascending) is stable and deterministic. This allows UIs to make assumptions about layout consistency across theme switches. For example, a grid of 4 columns will have predictable column positions for each family.

### Bindings are read-only

Target bindings are defined at registry build time and don't change at runtime. `getTargetBindings()` is a pure lookup function; it doesn't trigger subscriptions or re-renders. If a target's bindings need to change (e.g., a new property becomes editable), that's a schema update to the target registry, not a runtime change.

---

## Future considerations

This contract is v0. Future expansions (left for explicit follow-up):

- **Color-blind-friendly palette variants** — alternate primitives chosen for perceptual distance in deuteranopia, protanopia, tritanopia modes
- **User-namespaced primitives** — per-brainstorm's locked naming convention, e.g. `color.gold.500/<userId>:1` for user custom colors (v88+)
- **Cross-theme palette merging** — for theme remix UX in v88 Workshop (rare; mainly in composition tools)
- **Curated palette subsets** — if a UI calls for "accent palette" vs "full primitive set", filter before returning (e.g., exclude void/grayscale for accent-only pickers)
- **Property labels from overrides** — fetch user-friendly labels like "Application Background" from a label registry, instead of relying on property name alone

Until those land, consumers iterate the full primitive set in canonical order, and bindings are returned as-is from the registry (property + token path, no labels).

---

## References

- Active theme state: `settings.appearance.theme` (Zustand store)
- Primitive storage: `src/themes/tokenPrimitives.ts` (exported as `themePrimitives`)
- Target registry: `src/themes/themeTargetRegistry.ts` (array `THEME_TARGETS`)
- Runtime accessors: `src/themes/paletteRuntime.ts` (hook + function)

---

*v86d.3a-pre: Foundation for ColorTab (v86d.3a) and future per-binding inspector spokes (v89+).*
