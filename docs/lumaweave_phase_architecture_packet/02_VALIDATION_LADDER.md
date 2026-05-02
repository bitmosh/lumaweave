# Validation Ladder

## Level 0 — TypeScript Compile

```bash
npm run typecheck
```

Required for every code patch.

## Level 1 — Existing Browser QA

```bash
npm run qa:e2e
```

Required for changes touching QA, layout, settings, graph viewport, or Playwright-covered behavior.

## Level 2 — Feature-Specific Automated Tests

Add or update `.spec.ts` files when feasible.

## Level 3 — Runtime Diagnostics

Use debug rows, data-testid hooks, console logs, and visible state when canvas behavior is hard to test directly.

## Level 4 — Manual Visual QA

Required for canvas label readability, hover/selection visual state, graph styling, edge label visibility, and layout feel.

## Acceptance Rule

No visual/canvas behavior is accepted unless manual QA passes or a reliable Playwright/debug test directly proves it.
