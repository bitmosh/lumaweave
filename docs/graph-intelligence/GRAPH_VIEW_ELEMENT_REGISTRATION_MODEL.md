# Graph View Element Registration Model (v23 Planning)

## Purpose
Define how graph-facing elements (Sigma-rendered primitives, Graph HUD, and supporting DOM chrome) will be registered without conflating them with general DOM UI surfaces. The goal is to create an additive contract so future customization, graph visual policy changes, and Theme Mapping Panel work can rely on predictable identifiers, tokens, and QA evidence.

## Source-of-Truth Relationships
- **Graph Visual Policy v0** (`docs/33_GRAPH_VISUAL_POLICY_V0.md`) — describes how tokens, policies, and renderer cooperate today.
- **ThemeTokenPath / graph.* tokens** (`src/themes/themeTokenPaths.ts`, `src/themes/themeTokens.ts`) — canonical values for graph colors, labels, and glow.
- **Planned Theme Targets** (`graph.node.*`, `graph.edge.*`) — listed in ThemeTargetRegistry but intentionally left without bindings until Graph Visual Policy refresh.
- **SigmaGraphView + policies** (`src/graph/visual/*.ts`) — actual renderer logic that consumes tokens/policies.
- **Playwright coverage** — existing specs validate graph frame visibility and QA toggles; future specs must cover registered graph elements without interfering with Sigma internals.

## Distinguishing DOM HUD vs Sigma Internals
| Attribute | DOM UI Surface | Sigma Graph Element |
| --- | --- | --- |
| ThemeTargetId | Allowed | **Not** directly applied (use Graph View registry) |
| `data-lw-theme-target` | Required for inspectable DOM surfaces | Forbidden (Sigma canvas should remain attribute-free) |
| Visual Handle | `.lw-panel`, `.lw-graph-frame`, etc. | Not applicable; styling comes from policies/tokens |
| Token Path | Panel/text tokens | `graph.node.*`, `graph.edge.*`, `effects.glow.*` |
| QA Evidence | DOM-focused Playwright expectations | Graph-specific tests via Graph Visual Policy fixtures |

## Classification Table
| Category | Example Element | Ownership | Status | Registration Notes |
| --- | --- | --- | --- | --- |
| **Graph viewport container** | `.lw-graph-frame` + `data-lw-theme-target="graph.frame"` | DOM | Active | Already registered as UI surface; provides inspection anchor but not Sigma styling.
| **Graph frame chrome / HUD** | Zoom controls (future), graph HUD overlays | DOM | Planned | Should register via UI Surface inventory once HUD exists; no Sigma dependency.
| **Graph Inspector panel** | Mission Control tabs showing node/edge metadata | DOM | Active | Covered by UI Surface inventory; interacts with graph via data bindings, not direct Sigma changes.
| **Node default appearance** | `graph.node.default` token path | Sigma | Planned | Registered as planned ThemeTarget; requires Graph Visual Policy refresh + Graph View registry entry.
| **Node hover** | Hover highlight color/size | Sigma | Planned | Must remain policy-driven; registration occurs via Graph View Element Registry with hover-specific schema.
| **Node selected** | Selection highlight + neighborhood tiers | Sigma | Planned | Requires mapping to tokens and policy validation; no `data-lw-*` allowed.
| **Node label** | Default + hover + selected label colors | Sigma | Planned | Label policy already defines modes; registry will reference policy names + token bindings.
| **Edge default/hover/selected** | Edge stroke colors + widths | Sigma | Planned | Shares pipeline with node states; should cite `graph.edge.*` tokens only.
| **Edge label** | Label color/visibility | Sigma | Planned | Controlled by label policy; registry entry must state which policy toggles influence it.
| **Cluster / neighborhood visuals** | Secondary/tertiary node + edge styles | Sigma | Planned | Requires Graph Visual Policy extension; registration should encode neighborhood depth dependence.
| **Selection highlights** | Outline/glow overlays | Sigma + DOM overlay (future) | Planned | Keep Sigma draw logic separate from any DOM overlay (ghost layer lives in overlay hardening backlog).
| **Relationship / edge hover states** | Endpoint emphasis, hover label popups | Sigma | Planned | Cannot attach DOM markers; rely on policy state machine.

### v24a Precision Prep
- Manual QA showed that DOM UI Inspector still reports parent surfaces for nested controls, which is acceptable because graph HUD + Sigma overlays remain separate systems.
- Before v25 ghost overlays, we will finalize the **UI Part / Component Role Registration Model** (see UI Surface inventory) so DOM HUD components map cleanly to graph policies without tagging Sigma primitives.
- Ghost overlays must highlight registered DOM surfaces only; Sigma visual states will continue to be proven through the Graph View Element Registry + Graph Visual Policy tests.
- Registered/unregistered warnings should reference this registry boundary so a missing DOM marker does not imply an unregistered Sigma element.
- v24b hardening extends this rule set: outline only DOM surfaces such as `graph.frame`, future graph HUD panels, and Graph Inspector cards. Never outline Sigma primitives, and never warn on nested DOM nodes that intentionally rely on component roles.
- Any future Graph HUD or Graph Inspector panels must first land in the UI Surface inventory (major surface tier) before ghost overlays include them. Sigma entries (`graph.node.*`, `graph.edge.*`) stay policy-driven.
- v25 ghost overlay is the first DOM visualization: it renders pointer-events:none outlines for existing `data-lw-theme-target` surfaces. The overlay continues to ignore Sigma primitives and will later feed registered/unregistered heuristics defined in this registry.
- v26 registered/unregistered heuristic planning: DOM heuristics must treat Sigma primitives as **out-of-scope** evidence. Only DOM HUD containers that satisfy the UI Surface inventory signals (structural handle, landmark `data-testid`, control aggregation, etc.) may become candidates, and even then the heuristic must require ≥3 DOM-only signals before flagging anything. Sigma nodes/edges/labels do not count toward those signals and must never trigger warnings.
- **v27a runtime probe (badges OFF)**: The new `window.__lwRunThemeTargetProbe()` helper runs entirely in DOM space, recording candidates/unknowns, and explicitly ignores Sigma canvases, WebGL layers, or renderer-owned nodes. QA Debug surfaces show probe results while the Sigma renderer, graph physics, and overlay visuals remain untouched.

## Registration Requirements
1. **Graph View Element Registry** (future) will sit beside ThemeTargetRegistry but focus solely on Sigma-facing identifiers (e.g., `graph.node.default`, `graph.edge.hover`).
2. **DOM wrappers stay separate** — `graph.frame`, HUD panels, inspector surfaces remain in the UI Surface inventory.
3. **Token linkage** — every graph element entry must cite canonical `graph.*` ThemeTokenPath values or derived policy outputs.
4. **Policy binding** — registration must specify which policy (style, label, selection) controls runtime behavior.
5. **Validation hooks** — each registered element must declare which QA / Playwright test proves it (e.g., mapped pytest for selection colors, future graph Playwright coverage for physics + visuals).
6. **No direct `data-lw-*` on Sigma primitives** — instrumentation should happen through logs, policies, or DOM HUD, never by mutating canvas nodes.

## Additive Checklist for New Graph Elements
1. Document category + intent in this file.
2. Add `planned` entry to Graph View Element Registry (future JSON/TS file) referencing canonical tokens + policy owner.
3. Extend Graph Visual Policy doc when new behavior is introduced.
4. Update QA backlog to capture new evidence requirements (e.g., graph physics Playwright coverage).
5. Once renderer work lands, move entry to `active` and link to specific tests/logs.
6. For DOM HUD components (zoom controls, graph HUD), also update UI Surface inventory and ThemeTargetRegistry if they become inspectable.

## Validation Expectations
- **Typecheck + Playwright** remain baseline for any future runtime edits.
- **Graph Visual Policy tests** must execute when policies change to ensure registered elements get correct tokens/state.
- **Graph-specific Playwright coverage** (backlog #4) will be required before marking cluster/neighborhood/selection entries as `active`.

## Forbidden Assumptions
- Do not mark Sigma nodes/edges with `data-lw-theme-target` to “borrow” UI Inspector capabilities.
- Do not assume every graph token needs a ThemeTargetRegistry entry; DOM registry stays focused on DOM surfaces.
- Do not collapse all graph states into a single `graph.node` entry; hover/selected/default need explicit lifecycle handling.
- Do not wire graph HUD overlays to Sigma internals without Graph Visual Policy sign-off.

## Risk Tiers
| Tier | Description | Examples | Handling |
| --- | --- | --- | --- |
| **Low** | DOM-only chrome around the graph | Graph frame, HUD containers | Safe to register via UI Surface inventory; no Sigma coupling.
| **Medium** | Sigma styling backed by existing tokens/policies | Default node/edge colors, label modes | Requires registry + policy linkage before exposure to Theme Mapping Panel.
| **High** | Interactive visual states or physics-affecting elements | Selection highlights, neighborhood glow, physics sliders | Must pass Graph Visual Policy validation + graph Playwright coverage before activation.

## Future Implementation Phases
1. **Registry scaffolding** — introduce `GraphViewElementRegistry` (planned) mirroring ThemeTargetRegistry but token/policy-centric.
2. **Graph Visual Policy refresh** — wire planned `graph.node.*` / `graph.edge.*` entries to canonical tokens + validators.
3. **HUD/Overlay integration** — after overlay hardening, add DOM ghost layers or HUDs with clear registration boundaries.
4. **Graph physics Playwright coverage** — backlog item #4 provides automated evidence before promoting high-risk entries.
5. **Theme Mapping Panel integration** — once override storage exists, expose safe graph customization controls referencing this registry.
