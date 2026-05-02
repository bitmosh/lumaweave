# Tangle Mode Protocol

## Purpose

Tangle Mode prevents agents from micropatching symptoms when the repo enters a confusing or unstable state.

Use Tangle Mode whenever failures cascade, multiple systems appear broken, or the cause is unclear.

## Trigger Conditions

Enter Tangle Mode if any of these occur:

- TypeScript breaks after a recovery/refactor
- Vite/app hydration fails
- many Playwright selectors disappear at once
- QA/advisory registry behavior becomes inconsistent
- prop mismatches appear across AppShell/QaPanel/overlay/control surfaces
- tests fail in unrelated areas after a narrow change
- a file is missing but many tests fail
- Bandit is tempted to rewrite broad architecture to fix local errors

## Immediate Rule

Do not patch until the tangle is mapped.

## Required Commands

Run from repo root:

```bash
git status --short --branch
git diff --name-only
npm run typecheck
npm run qa:e2e
```

If Playwright failure is clearly caused by app boot failure, note that before interpreting selector failures.

## Tangle Report Template

```md
# Tangle Report

## Last Known Stable Baseline
- commit/hash or named pass:
- accepted QA version:
- last passing commands:
- files expected to be stable:

## Current Failure Shape
- TypeScript:
- Vite/app hydration:
- Playwright:
- missing modules:
- selector failures:
- registry/advisory failures:
- DOM marker failures:

## Changed Files By Contract Class
| File | Class | Risk | Notes |
| --- | --- | --- | --- |

Classes:
- runtime implementation
- contract registry
- QA/advisory contract
- Playwright evidence surface
- DOM/test witness
- future scaffold
- obsolete/dead code

## Fault Point Hypothesis
- first file/symbol likely responsible:
- why:
- evidence:
- what changed between stable baseline and now:

## Blast Radius
Allowed files:
Forbidden files:
Do-not-touch contract surfaces:

## Smallest Safe Repair
- intended change:
- why this preserves accepted contracts:
- validation commands:
```

## Tangle Rules

- Do not skip tests.
- Do not edit tests to hide failures.
- Do not rename stable IDs.
- Do not delete v-numbered artifacts.
- Do not broaden scope without reporting why.
- If many selectors fail, check app hydration/module resolution first.
- If registry/advisory content is present but unreachable, fix reachability before editing registry content.

## Exit Criteria

Leave Tangle Mode only when:

- the likely fault point is identified
- the smallest safe repair is named
- allowed/forbidden files are listed
- validation commands are known
