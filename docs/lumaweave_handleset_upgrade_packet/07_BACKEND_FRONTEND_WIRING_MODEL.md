# Backend ↔ Frontend Wiring Model

## Wiring Chain

```txt
settings.schema.ts
  ↓
settings.defaults.ts
  ↓
settings.registry.ts
  ↓
SettingsPanel
  ↓
settings.store
  ↓
AppShell props
  ↓
SigmaGraphView
  ↓
Sigma setting / Graphology attribute
  ↓
visual result
  ↓
QA / Playwright / manual verification
```

## Example: Edge Label Font Size

```txt
Handle:
labels.edgeLabelFontSize

Schema:
settings.schema.ts

Default:
settings.defaults.ts → 13

UI:
settings.registry.ts → range slider under Labels

Runtime:
AppShell passes value to SigmaGraphView

Renderer:
SigmaGraphView calls:
sigma.setSetting("edgeLabelSize", edgeLabelFontSize)
sigma.refresh()

QA:
settings-label-controls.spec.ts checks control exists
manual QA checks visible size change
```

## Example: Hover Node Color

```txt
Handle:
graphView.hoverNodeColor

Schema:
settings.schema.ts

Default:
settings.defaults.ts → #fbbf24

UI:
settings.registry.ts → color control or text color input

Runtime:
AppShell passes value to SigmaGraphView

Renderer:
graphStylePolicy applies color to hovered node

QA:
manual hover regression check
```
