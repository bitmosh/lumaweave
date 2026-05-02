# Recommended Folder Structure

## Documentation Handleset

Start here first:

```txt
docs/handleset/
  00_HANDLESET_INDEX.md
  01_ACTIVE_HANDLES.md
  02_PLANNED_HANDLES.md
  03_BACKEND_FRONTEND_WIRING.md
  04_RENDERER_BINDINGS.md
  05_THEME_TOKEN_MAP.md
  06_HANDLES_REQUIRING_QA.md
```

## Future TypeScript Handleset

Later, after the documentation audit is stable:

```txt
src/control-plane/handles/
  handleset.types.ts
  handleset.registry.ts
  handleset.status.ts
```

## Existing Graph Visual System

Keep and continue using:

```txt
src/graph/visual/
  graphVisualTokens.ts
  graphVisualTypes.ts
  graphStylePolicy.ts
  graphLabelPolicy.ts
```

## Future Theme System

Eventually:

```txt
src/themes/
  theme.types.ts
  themes.solar-plasma.ts
  themes.obsidian-aurora.ts
  themeRegistry.ts
```

## Rule

Do not make the TypeScript handleset power the UI immediately.

Phase 1 should be documentation/audit only.
