---
id: agent.project-conventions
title: Project Conventions
type: manual
status: current
domain: agent
cluster: violet
agent_readable: true
include_in_self_graph: false
last_updated: 2026-06-30
tags: [conventions, architecture, testing]
---

# Project Conventions

Repository-specific implementation rules. Canonical domain docs live in `docs/canonical/`.

## Registries

Prefer one typed registry that consumers iterate over parallel hardcoded lists. Before adding a list, inspect the relevant domain for an existing registry and its validation/test pattern.

Registry presence is not runtime capability. Check status, consumer wiring, loader/component presence, and evidence.

## Settings and callbacks

Persisted state lives in `useSettingsStore`. In event callbacks, use `useSettingsStore.getState()` when the latest value is required; render-captured values and ref-sync workarounds are vulnerable to stale closures.

Use local React state for local UI state. Use settings or a focused context for cross-component/persistent state.

## Extraction and refactoring

When extracting a component, preserve behavior first. Refactor semantics in a separate reviewable change. Do not combine broad cleanup with a behavior fix unless the coupling is proven.

## CSS and themes

- Consume `--lw-*` custom properties with an intentional fallback where necessary.
- Mark inspectable surfaces with stable `data-lw-theme-target` values.
- Use `data-lw-theme-target="ignore"` for internal surfaces that probes should skip.
- Prefer logical CSS properties for directional layout.
- Search CSS pseudo-element content when removing UI text.
- Respect Reduce Motion for every time-dependent effect.

## Graph rendering

- Keep one Sigma instance per graph dataset.
- Reconcile selection, labels, themes, geometry, and physics through graph/settings mutation.
- Keep per-frame uniforms out of React state.
- Preserve camera state across non-dataset changes.
- Treat `graphRendererInterface.ts` as an unused seam until a renderer actually implements it.

## GWells

- Keep core imports free of React, Sigma, browser, theme, and app modules.
- Preserve `applyDialect()`, radial-backbone, and parallel-spines unless a task explicitly changes compatibility.
- Add benchmark evidence before performance architecture.
- Preserve pins and lifecycle invariants across configuration changes.
- Profiles and event-backed history remain outside the current core.

## Source adapters

- Normalize source-specific data at the adapter boundary.
- Enforce bounds in loader code; metadata limits are not self-enforcing.
- Keep candidate entries visibly distinct from registered loaders.
- Test representative success, malformed input, bounds, and configuration UI.
- Do not broaden filesystem access without explicit security review.

## Tests

- `npm run typecheck` for TypeScript.
- `npm run physics:gwells` for GWells registry/import validation.
- `npm run qa:e2e -- <spec>` for targeted Playwright.
- Do not leave `test.only`.
- Treat `test.skip` and `test.fixme` as visible debt.
- Avoid fixed waits when a web-first assertion can observe the state.
- Run one browser suite at a time.

## Documentation

- [Current Status](../CURRENT_STATUS.md) owns implementation boundaries.
- [Roadmap](../ROADMAP.md) owns direction.
- [Known Issues](../KNOWN_ISSUES.md) owns current defects/test debt.
- Canonical docs own architecture.
- Git owns granular history.
