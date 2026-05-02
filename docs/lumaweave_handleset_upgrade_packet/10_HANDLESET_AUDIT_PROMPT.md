# Bandit Prompt: Handleset Registry Audit v0

```txt
Bandit task: Handleset Registry Audit v0

Project root:
~/Projects/lumaweave

Goal:
Create a living handleset documentation database for all configurable LumaWeave settings, visual tokens, physics controls, theme handles, and renderer bindings.

Important:
Documentation/audit only.
Do not change production behavior.
Do not refactor.
Do not implement theme editor.
Do not implement new controls.
Do not change SigmaGraphView behavior.

Inspect:
- src/control-plane/settings/settings.schema.ts
- src/control-plane/settings/settings.defaults.ts
- src/control-plane/settings/settings.registry.ts
- src/control-plane/settings/SettingsPanel.tsx
- src/graph/visual/graphVisualTokens.ts
- src/graph/visual/graphVisualTypes.ts
- src/graph/renderers/sigma2d/SigmaGraphView.tsx
- src/graph/visual/graphStylePolicy.ts
- src/graph/visual/graphLabelPolicy.ts
- src/app/AppShell.tsx
- src/control-plane/qa/qa-registry.ts
- tests/e2e/

Create:
- docs/handleset/00_HANDLESET_INDEX.md
- docs/handleset/01_ACTIVE_HANDLES.md
- docs/handleset/02_PARTIAL_HANDLES.md
- docs/handleset/03_PLANNED_HANDLES.md
- docs/handleset/04_BACKEND_FRONTEND_WIRING.md
- docs/handleset/05_RENDERER_BINDINGS.md
- docs/handleset/06_HANDLES_REQUIRING_QA.md

For each handle, document:
- handle path
- label
- category
- default value
- UI control type
- source file
- runtime target
- live update behavior
- status: active / partial / planned / deprecated / internal / experimental
- related Playwright tests
- related QA checklist
- notes

Rules:
- Do not mark a handle active unless it visibly affects runtime behavior.
- If uncertain, mark partial and explain.
- No production code changes.
- Do not add controls.
- Do not remove controls.

Final report:
1. total handles found
2. active count
3. partial count
4. planned count
5. dead/misleading handles found
6. duplicated handles found
7. handles missing QA coverage
8. recommended cleanup tasks
```
