# Failure Report Template

Use this before patching nontrivial failures.

```md
# Failure Classification

## Failing Signal

What failed? Include command, test name, user-observed behavior, or console error.

## Classification

Choose one:

- Environment Prerequisite
- Dependency / API Uncertainty
- Selector / Test Harness Mismatch
- Identity / Binding Drift
- State Persistence / Reset Bug
- Runtime Lifecycle / Behavior Regression
- Obsolete Test / Spec Debt
- Contract Registry Drift
- Docs / Source-of-Truth Drift
- Scope Creep / Architecture Boundary Issue

## Evidence

- Command:
- Error:
- File/surface:
- Expected:
- Observed:

## Signal Path

Input signal:
Transformation point:
Expected output signal:
Observed output signal:

## Tool Used

- Playwright MCP:
- Context7 MCP:
- Sequential Thinking MCP:
- No tool:

## Smallest Safe Fix

Describe the smallest patch that addresses the broken boundary.

## Proof After Fix

- Typecheck:
- Playwright:
- Manual/UI proof:
- Console proof:
- Other:

## Remaining Risk

List only real remaining risks.
```

## Example: Missing Playwright Browser

```md
# Failure Classification

## Failing Signal

`npm run qa:e2e` fails before tests execute.

## Classification

Environment Prerequisite

## Evidence

- Command: `npm run qa:e2e`
- Error: `browserType.launch: Executable doesn't exist`
- Expected: Playwright launches Chromium.
- Observed: Chromium binary missing.

## Signal Path

Input signal: Playwright test command
Transformation point: browser launch
Expected output signal: Chromium opens
Observed output signal: executable missing

## Smallest Safe Fix

Run `npx playwright install chromium`, then rerun tests.

## Proof After Fix

Playwright command executes test suite instead of aborting at browser launch.
```
