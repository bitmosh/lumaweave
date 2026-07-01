---
id: agent.diagnostics
title: Diagnostics and Failure Reporting
type: manual
status: current
domain: agent
cluster: violet
agent_readable: true
include_in_self_graph: false
last_updated: 2026-06-30
tags: [diagnostics, debugging, reporting]
---

# Diagnostics and Failure Reporting

Classify failures before changing code. The objective is to find the smallest proven boundary, not to accumulate speculative fixes.

## Failure classes

- Environment prerequisite.
- Dependency/API uncertainty.
- Selector or test-harness mismatch.
- Identity or binding drift.
- Persistence/reset error.
- Runtime lifecycle regression.
- Obsolete specification debt.
- Contract/registry drift.
- Scope expansion.
- Documentation/source drift.

## Evidence frame

For every failure, record:

```txt
Input signal:
Transformation point:
Expected output:
Observed output:
Failure class:
Smallest safe hypothesis:
Proof command/test:
```

## Stop report

After two unsuccessful strategies or when the fix leaves authorized scope:

```txt
Situation Report

Repository state:
Files changed:
Validation already run:

Failure:
Exact command/test:
Classification:
Strategies attempted:
1.
2.

Unproven assumptions:
Smallest safe next options:
1.
2.
```

## Instrumentation

Temporary diagnostics should have unique prefixes and enough context to identify the writer:

```ts
console.log("[ComponentName:reason]", { relevantState });
console.log("[functionName:trace]", {
  args,
  stack: new Error("trace").stack?.split("\n").slice(1, 5).join(" | "),
});
```

Capture browser output in a focused Playwright run when the failure crosses the browser boundary. Remove temporary instrumentation before handoff and search for its prefix.

## Reporting rules

- Include the actual command and exit result.
- Quote the relevant error without hiding caveats.
- Separate observed facts from inference.
- State skipped/fixme tests.
- State whether generated artifacts, dev servers, or caches were reused.
- Preserve unrelated dirty worktree changes.
- A truthful blocked report is better than an unverified success claim.
