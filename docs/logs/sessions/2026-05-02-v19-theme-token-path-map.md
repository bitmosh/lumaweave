# v19 Theme Token Path Map — Session Log (2026-05-02)

## Goal
Land the v19 Theme Token Path Map (canonical path list + resolver + QA/advisory/docs) while preserving existing runtime visuals and preparing for Theme Target Registry in v20.

## Files Touched
- `src/themes/themeTokenPaths.ts` (canonical token paths + resolver + validator)
- `src/themes/themeTokens.ts` (validation hook)
- `src/themes/index.ts` (exports)
- `docs/theme-system/THEME_TOKEN_PATH_MAP.md`
- `docs/theme-system/00_THEME_SYSTEM_OVERVIEW.md`
- `docs/theme-system/THEME_MAPPING_SYSTEM_BACKLOG.md`
- `docs/DOCS_INDEX.md`
- `src/control-plane/qa/QaPanel.tsx`
- `src/control-plane/qa/qa-registry.ts`
- `src/control-plane/qa/advisory-registry.ts`
- `tests/e2e/contract-registry.spec.ts`
- `tests/e2e/theme-token-paths.spec.ts`

## Token Path Model Summary
- Canonical paths: `app.*`, `panel.*`, `text.*`, `accent.primary`, `graph.node.*`, `graph.edge.*`, `effects.glow.intensity`.
- Resolver maps each canonical string directly to existing `ThemeRuntimeTokens` fields and logs gaps via `validateThemeTokenPaths`.
- Planned paths documented separately (controls, secondary accents, visual handles) without touching runtime tokens.
- QA and advisory content updated to v19; Mission Control defaults to v19 and identity diagnostics prove binding.

## Validation
- `npm run typecheck` → PASS (tsc --noEmit)
- `npm run qa:e2e` → PASS (55 passed / 0 failed / 0 skipped)
- `grep -R "test.skip" -n tests/e2e` → 0 matches

## QA Result
- v19 checklist active by default and covers doc/code/runtime evidence.
- Advisory set switched to v19 token-path-focused questions.
- Bandit recommends **ACCEPT**.

## Remaining Risks
1. Visual handle CSS variables still rely on manual fallback colors until Theme Target Registry binds canonical paths.
2. Graph tokens remain in their own runtime object; resolver maps them but governance tooling is still to come.
3. Theme Target Registry + read-only Debug Inspector overlay are required next (v20) before editable Theme Mapping Mode can start.

## Notes
- Non-goals preserved: no Theme Mapping UI, glitter untouched, graph renderer behavior unchanged, no broad restyle.
- Session log intentionally compressed to stay within the 80–150 line target.
