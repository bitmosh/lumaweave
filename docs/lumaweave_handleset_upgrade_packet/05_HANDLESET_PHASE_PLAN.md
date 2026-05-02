# Handleset Phase Plan

## Phase 1 — Documentation Handleset

Low-risk. Do this first.

Create:

```txt
docs/handleset/00_HANDLESET_INDEX.md
docs/handleset/01_ACTIVE_HANDLES.md
docs/handleset/02_PARTIAL_HANDLES.md
docs/handleset/03_PLANNED_HANDLES.md
docs/handleset/04_BACKEND_FRONTEND_WIRING.md
docs/handleset/05_RENDERER_BINDINGS.md
docs/handleset/06_HANDLES_REQUIRING_QA.md
```

Goal:
Describe the current app accurately.

No production code changes.

## Phase 2 — TypeScript Handleset Registry

Create:

```txt
src/control-plane/handles/handleset.registry.ts
```

But do not use it to render UI yet.

It becomes machine-readable documentation.

## Phase 3 — Validate Settings Against Handleset

Add dev checks that flag:

```txt
setting exists in schema but not registry
registry control has no default
active handle has no runtime binding
planned handle is accidentally rendered active
```

## Phase 4 — Generate SettingsPanel From Handleset

Eventually, the handleset becomes a source of truth for the settings UI.

## Phase 5 — Full Theme Customization Menu

The theme editor edits semantic tokens and setting handles, not random renderer internals.
