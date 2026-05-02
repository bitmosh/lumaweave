# Graph Visual Token Model

## Purpose

Graph visual tokens centralize graph colors, sizes, label values, and depth styling values.

## Recommended Token Groups

```txt
node fill colors
edge stroke colors
node label text colors
edge label text colors
node size multipliers
edge size multipliers
label font sizes
depth ring colors
```

## Example Shape

```ts
export const graphVisualTokens = {
  node: {
    fill: {
      default: "#22d3ee",
      hovered: "#fbbf24",
      selected: "#fbbf24",
      secondary: "#3b82f6",
      tertiary: "#8b5cf6",
    },
  },
  edge: {
    stroke: {
      default: "#64748b",
      selected: "#a855f7",
      secondary: "#c4b5fd",
      tertiary: "#ddd6fe",
    },
  },
  label: {
    node: {
      defaultText: "#f1f5f9",
      hoverText: "#0f172a",
      selectedText: "#f1f5f9",
      fontSize: 13,
    },
    edge: {
      defaultText: "#cbd5e1",
      selectedText: "#f8fafc",
      secondaryText: "#ddd6fe",
      fontSize: 13,
    },
  },
};
```

## Token Rule

Tokens define values.

Policies decide when values are used.

Renderer applies values.
