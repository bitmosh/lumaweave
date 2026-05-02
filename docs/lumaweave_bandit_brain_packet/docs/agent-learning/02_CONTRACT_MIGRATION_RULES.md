# Contract Migration Rules

## Purpose

LumaWeave is migrating from ad hoc UI/settings/QA structures into typed contract/token/registry systems.

The goal is to preserve accepted behavior while making it easier to inspect, validate, and extend.

## Correct Migration Pattern

```txt
Old accepted behavior
→ preserve as contract evidence
→ wrap in typed registry
→ expose through debug/evidence surfaces
→ validate with Playwright
→ document future expansion
```

## Incorrect Migration Pattern

```txt
Old accepted behavior looks messy
→ delete or rewrite it
→ rename keys/selectors
→ tests lose witnesses
→ accepted QA state disappears
```

## Golden Rule

Modernization means adding structure around accepted behavior, not replacing accepted behavior with cleaner-looking equivalents.

## Preservation Rules

Do not delete, rename, or rewrite these during recovery unless the task explicitly authorizes a contract migration:

- accepted `qaKey` values
- advisory resolver behavior
- v-numbered checklist artifacts
- Playwright selectors
- `data-testid` witnesses
- `data-lw-theme-target` markers
- canonical `themeTokenPath` values
- canonical `themeTargetId` values
- accepted `handleId` values
- accepted `settingsKey` bindings

### Theme Target Registry Guardrails

- Theme Target Registry is the source of truth for all inspectable theme/UI surfaces.
- Any future theme-editable DOM surface must expose a stable `data-lw-theme-target` that maps to a registered `themeTargetId`.
- Not every DOM node needs a marker; only surfaces intended for inspector/Theme Mapping workflows qualify.
- Inspector overlay remains dev/debug-only until Theme Mapping Panel exists; treat overlay work as diagnostics, not user-facing controls.
- Graph node/edge theme targets stay in "planned" status until the Graph Visual Policy refresh promotes them.

### Theme Token Path Governance

- Active runtime `tokenBindings` may reference only canonical `ThemeTokenPath` values from `themeTokenPaths.ts`.
- `PlannedThemeTokenPath` entries are documentation only until they are promoted to canonical.
- Promoting a planned path requires: updating the `ThemeTokenPath` union, adding it to `CANONICAL_THEME_TOKEN_PATHS`, providing resolver coverage, validating built-in presets, and updating docs/tests.

## Compatibility Wrappers

If a structure needs modernization, wrap it:

```txt
old accepted content → new typed object
old key → stable lookup alias
old selector → stable evidence surface
old behavior → new implementation behind same contract
```

Do not force every consumer to change at once unless the pass is explicitly scoped as a migration.

## Contract Migration Checklist

Before changing a contract-heavy file, answer:

1. What accepted behavior depends on this?
2. What tests depend on this?
3. What docs depend on this?
4. What user/manual QA decision depends on this?
5. Is this a migration, a repair, or an additive feature?
6. What stable keys must remain unchanged?
7. What compatibility aliases are needed?
8. What validation proves the contract survived?

## Example: v20 Overlay Recovery

Failure:

```txt
ThemeTargetInspectorOverlay.tsx was deleted while AppShell still imported it.
```

Result:

```txt
Vite crashed before hydration.
All QA/debug/theme Playwright selectors looked missing.
```

Lesson:

```txt
A small runtime file can be contract-critical if it provides DOM/test/debug evidence.
```

Preventive rule:

```txt
Before deleting a file, classify whether it is runtime implementation, contract registry, QA/advisory contract, Playwright evidence surface, DOM/test witness, future scaffold, or obsolete code.
```
