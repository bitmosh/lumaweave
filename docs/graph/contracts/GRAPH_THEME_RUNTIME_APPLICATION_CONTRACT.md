---
id: contract.graph.theme.runtime.application
title: Graph Theme Runtime Application Contract
type: contract
status: accepted
version: v51
domain: graph
subdomain: contracts
cluster: azure
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
depends_on:
  - contract.graph.visual.theme.mapping
tags:
  - graph
  - theme
  - runtime
  - application
  - contract
  - accepted
  - v51
---

# Graph Theme Runtime Application Contract

**Status:** Accepted — v51

Defines how theme changes propagate at runtime without requiring app restart. Establishes the runtime application lifecycle — when a theme preset is selected, token values update and the graph re-reads them via the DOM wrapper layer.

## Core Rules
- Theme changes apply immediately on preset selection
- Token values flow: preset → token paths → CSS variables → DOM → Sigma reads CSS cascade
- No Sigma restart required for theme changes
- Theme state is stored in theme store / localStorage
- Graph does not need to re-initialize for theme changes

## Forbidden
- Calling Sigma internals to apply theme values
- Applying theme values that bypass the canonical token path registry
---
id: contract.graph.theme.token.value.application
title: Graph Theme Token Value Application Contract
type: contract
status: accepted
version: v57
domain: graph
subdomain: contracts
cluster: blue
agent_readable: true
include_in_self_graph: true
last_updated: v73c
depends_on:
  - contract.graph.theme.application
governs:
  - src/themes/themeTokenPaths.ts
  - src/themes/applyTheme.ts
tags: [graph, theme, token, value, application, contract, accepted, v57]
---

# Graph Theme Token Value Application Contract

**Status:** Accepted — v57

Defines the governance for applying actual token values (colors, sizes, opacities) from theme presets to graph visual elements. Establishes the token value resolution pipeline and validation requirements.

## Core Rules
- Token values resolved from active theme preset via `themeTokenPaths.ts`
- Values validated against canonical token type (color, number, string)
- Applied to DOM via CSS custom properties
- Invalid token paths rejected — do not silently fail
- QA evidence: Playwright proves token values change when preset changes

## Forbidden
- Applying unvalidated token values
- Promoting planned token paths to active without contract
- Raw CSS string injection outside the token system
---
id: contract.graph.theme.token.value.preview
title: Graph Theme Token Value Preview Contract
type: contract
status: accepted
version: v53
domain: graph
subdomain: contracts
cluster: blue
agent_readable: true
include_in_self_graph: true
last_updated: v73c
depends_on:
  - contract.graph.visual.theme.mapping
tags: [graph, theme, token, preview, contract, accepted, v53]
---

# Graph Theme Token Value Preview Contract

**Status:** Accepted — v53

Defines the readiness diagnostic layer — a passive preview that shows which token paths have values defined in the active theme, which are missing, and which are planned. Provides evidence that the token system is wired correctly before application is activated.

## Core Rules
- Preview is read-only — no token values are applied to the graph
- Shows: token path, current resolved value, status (active/planned/missing)
- Displayed in `GraphVisualInventoryPanel.tsx` as evidence rows
- Does not write CSS variables
- Playwright proves preview rows are correct and complete
