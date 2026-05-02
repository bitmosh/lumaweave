# Diagnostic Router

Before patching any failure, classify it using this router.

## Decision Tree

### 1. Missing executable/package/browser/port/permission/install command?

Classification: `Environment Prerequisite`

Action:

- Repair safe local prerequisite or ask user before sudo/system changes.
- Do not edit app code.

### 2. Selector, timeout, strict-mode violation, or element exists visually but test cannot find it?

Classification: `Selector / Test Harness Mismatch`

Action:

- Inspect UI with Playwright MCP.
- Prefer stable `data-testid`.
- Update test/selector or add stable test ID.

### 3. Header/dropdown/report/advisory key mismatch?

Classification: `Identity / Key Drift`

Action:

- Trace canonical key through registry → UI → report → advisory → localStorage.

### 4. State resets or persists incorrectly?

Classification: `Persistence / Reset Bug`

Action:

- Classify state as durable/per-pass/per-report/per-session/stateless before patching.

### 5. Browser visual behavior, console error, graph disappearance, or UI blanking?

Classification: `Runtime Lifecycle / Regression`

Action:

- Reproduce with Playwright.
- Inspect console.
- Trace lifecycle boundary.
- Patch smallest ordering issue.

### 6. Tests target old qaKeys, old UI, or old advisory content?

Classification: `Obsolete Test / Spec Debt`

Action:

- Delete or replace with current equivalent.
- Do not skip.

### 7. Fix requires files outside intended scope?

Classification: `Scope Creep / Architecture Boundary Issue`

Action:

- Pause and report before expanding scope.

### 8. Uncertainty about external API/library?

Classification: `Dependency / API Uncertainty`

Action:

- Use Context7 before patching.

## Required Failure Report Fields

For every issue, report:

```txt
Input signal:
Transformation point:
Expected output:
Observed output:
Classification:
Tool used:
Smallest safe fix:
Proof after fix:
```

## Do Not

- Do not patch from vibes.
- Do not skip tests to make the suite green.
- Do not call app unstable when the environment is missing a prerequisite.
- Do not expand scope without reporting why.
