# Phase Packet: QA and Testing Harness

## Mission

Use Playwright and in-app QA to turn manual regressions into repeatable validation.

## Required Commands

```bash
npm run typecheck
npm run qa:e2e
```

## QA Panel Rules

- Refresh before Submit preserves working draft.
- Submit finalizes report and clears working form.
- Checklist results are scoped by checklistKey.
- New checklist version starts fresh.
- Old checklist history may be preserved but hidden.

## Manual QA Required For

- hover label readability
- selected/hover color feel
- edge label visual readability
- graph visual depth correctness
