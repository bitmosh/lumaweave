# LumaWeave Agent Guide

LumaWeave is a local-first graph visualization and architecture mapping app.
GWells is the graph layout/physics engine inside this repo and is currently the
main focus.

## Primary Working Style

- Prefer investigation-first, small reversible passes.
- Do not jump into broad rewrites.
- Preserve existing behavior unless a task explicitly asks to change it.
- Keep diffs focused and easy to review.
- Always summarize changed files, commands run, tests run, and remaining risks.
- If the task says investigation-only, do not edit files.
- If the task says implementation, still inspect relevant files first and state
  the plan before editing.

## GWells Guidance

- GWells is intended to remain standalone/extractable.
- Do not add LumaWeave UI, React, Sigma, theme, browser, or app-specific imports
  inside the GWells core module.
- Preserve the current registry architecture:
  - `wellTypes.ts`
  - `interactions.ts`
  - `seedFunctions.ts`
  - `dialects.ts`
  - `engine.ts`
  - `types.ts`
  - `index.ts`
- Preserve the public `applyDialect` path unless a task explicitly asks to
  change it.
- Existing radial-backbone and parallel-spines behavior must not be broken.
- v0.1.5 polish-to-ship is the immediate priority.
- Do not implement full GWells v0.2 profile architecture unless explicitly asked.
- Do not integrate event sourcing into GWells yet.
- Treat the future event-sourcing toolkit as a future layout-history/control-plane
  consumer, not a physics-core dependency.

## Current GWells v0.1.5 Priority Order

1. Universal structural resolver / source-agnostic classification.
2. Legacy well assignment through that resolver.
3. Seed layout polish for larger and non-filesystem-shaped graphs.
4. Runtime lifecycle hygiene: pause, stop, resume, duplicate-loop prevention,
   reseed cache correctness.
5. Benchmark-first performance pass.
6. Minimal UI-safe tuning hooks.

## Safety And Quality Rules

- Do not run destructive commands.
- Do not install packages unless the user explicitly approves.
- Do not modify unrelated files.
- Do not commit unless explicitly asked.
- Prefer existing project conventions over inventing new architecture.
- When touching GWells, inspect tests and validation scripts first.
- Add or update tests for behavior changes whenever practical.
- If behavior is uncertain, document the uncertainty instead of guessing.

## Useful Docs To Inspect When Relevant

- `docs/prototypes/gwells-refine/GWELLS_V0_1_5_POLISH_TO_SHIP_IMPLEMENTATION_BRIEF.md`
- `GWELLS_REALIGNMENT_PROMPT.md`
- `event-sourcing-toolkit-roadmap.md`
- `docs/canonical/GWELLS_PHYSICS.md`
- Any GWells current-state, design-conversation, testing, or migration docs
  present in the repo.

## Investigation Report Structure

For investigation reports, use this structure:

A. Executive recommendation

B. Current architecture map

C. Risk findings ranked blocker/high/medium/low

D. Proposed implementation sequence

E. Hidden concerns or missed build-plan issues

F. Suggested next coding prompt
