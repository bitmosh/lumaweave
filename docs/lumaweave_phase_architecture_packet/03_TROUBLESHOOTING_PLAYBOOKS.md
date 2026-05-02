# Troubleshooting Playbooks

## TypeScript Fails

1. Read the first root error.
2. Fix only that class of error.
3. Re-run `npm run typecheck`.
4. Do not pile on unrelated patches.

## Playwright Fails

1. Inspect error, screenshot, and error context.
2. Decide if it is selector bug, app behavior bug, or timing issue.
3. Fix selector only if behavior is correct.
4. Fix app only if behavior is wrong.
5. Re-run the single failing test, then full `npm run qa:e2e`.

## Manual QA Contradicts Code

Manual QA wins.

1. Add debug rows / data-testid / console logs.
2. Verify runtime state transitions.
3. Determine whether state is wrong or renderer output is wrong.
4. If renderer limitation, document and propose fallback.
5. Do not say “code appears correct” as completion.

## Sigma Behavior Is Unclear

1. Inspect installed Sigma types/API.
2. Search official Sigma docs if available.
3. Test one minimal runtime setting.
4. Prefer `sigma.setSetting(...)` and `sigma.refresh()` for live settings when supported.
5. If unsupported, document limitation and propose fallback.

## Setting Exists But Does Not Work

Every setting must be active+wired, planned/disabled, or hidden. No dead active controls.
