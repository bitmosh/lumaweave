# Diagnostics & Failure Reporting

How to classify failures, what to report when a STOP gate fires, and the instrumentation patterns that have solved hard bugs here.

## Failure classification

Before patching any failure, classify it — classification often reveals the correct next action. Don't patch from vibes.

Classes:
- **Environment Prerequisite** — missing browser, package, port
- **Dependency / API Uncertainty** — unfamiliar library behavior
- **Selector / Test Harness Mismatch** — Playwright can't find what's visibly there
- **Identity / Binding Drift** — key mismatches across surfaces
- **Persistence / Reset Bug** — state lifecycle wrong
- **Runtime Lifecycle / Regression** — visual blank, console error, graph disappearance
- **Obsolete Spec Debt** — test targets removed/renamed UI
- **Contract / Registry Drift** — registry shape changed without consumer updates
- **Scope Creep** — fix requires files outside declared scope
- **Docs / Source-of-Truth Drift** — code disagrees with docs

For each failure report: input signal · transformation point · expected output · observed output · classification · smallest safe fix · proof after fix.

Full router: `docs/agent/survival-manual/02_DIAGNOSTIC_ROUTER.md`.

## Situation Report (post when a STOP fires / cascade / two failed attempts)

```
Situation Report
═══════════════════════════════════════════════════════════
Mode: [Recovery / Diagnostic / Planning]
Repo: [branch] · [clean / dirty]

──────────────────────────────────────
CURRENT STATE
Files changed: [list or none]
Validation:
  typecheck:      passed / failed
  Playwright:     N passed, M skipped, K failed
  test.skip grep: clean / dirty
  git status:     clean / dirty

──────────────────────────────────────
FAILURE (if applicable)
Exact failing command/test:
Failure classification: [from list above]
Strategies attempted (max 2 before stopping):
  1.
  2.
Likely shared root cause:
Not-yet-proven assumptions:

──────────────────────────────────────
SAFE NEXT OPTIONS
1.
2.
3.
```

Full template: `docs/quest/QUEST_TEMPLATE.md`.

## Diagnostic instrumentation: console.log + stack traces

For "why isn't this rendering" / "where is this write coming from":

```javascript
console.log("[ComponentName render]", { relevantState });
console.log("[functionName called]", {
  args,
  stack: new Error("trace").stack?.split("\n").slice(1, 5).join(" | "),
});
```

Capture browser console in Playwright tests:

```javascript
page.on("console", (msg) => {
  console.log(`[BROWSER ${msg.type()}] ${msg.text()}`);
});
```

Run the failing test, grep for the diagnostic prefixes, report verbatim. This pattern has solved multiple hard bugs.

**Always remove all instrumentation before committing** — grep for `console.log` and `page.on("console")`. Production and tests stay clean.

## Verbatim reporting

Paste real output; don't summarize, paraphrase, or skip the long parts — the developer and planning Claude need the actual output to diagnose. If output is thousands of lines, paste the relevant section verbatim and note what was elided. Surface caveats unprompted: reused dev server, a "matching baseline" that may have tested the same compiled code, a count that "looks clean" while skipped tests rose. A truthful stopped report beats a false clean one.
