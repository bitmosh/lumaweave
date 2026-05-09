---
id: agent.survival.manual.prompt.blocks
title: Reusable Prompt Blocks
type: manual
status: current
cluster: purple
domain: agent
subdomain: survival-manual
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
last_pass: vP-Forensics-2
references:
  - agent.survival.manual.readme
  - agent.survival.manual.diagnostic.router
  - agent.survival.manual.tool.use.triggers
  - agent.survival.manual.stop.conditions
  - agent.survival.manual.failure.report.template
tags: [agent, survival-manual, prompts, snippets, copy-paste]
---

# Reusable Prompt Blocks

## Failure Handling Block

```md
Failure handling:
If anything fails, do not immediately patch. First classify it as Environment, Dependency/API, Selector/Test Harness, Identity Drift, Persistence, Runtime Lifecycle, Obsolete Spec, Contract Drift, Scope Creep, or Docs Drift. Use Playwright for UI evidence, Context7 for external API uncertainty, and Sequential Thinking for complex transition planning. Then patch the smallest proven boundary and validate.
```

## Diagnostic Router Block

```md
Before patching any failure, classify it.

Use this decision tree:
1. Missing executable/package/browser/port/permission/install command → Environment prerequisite.
2. Selector timeout/strict-mode/element not found → Selector/test harness mismatch; inspect with Playwright.
3. Header/dropdown/report/advisory mismatch → Identity/key drift; trace canonical key.
4. Wrong reset/persistence behavior → Persistence/reset bug; classify state lifecycle.
5. Visual blanking/console/graph disappearance → Runtime lifecycle regression; reproduce and inspect console.
6. Old qaKey/UI/advisory tests → Obsolete spec debt; delete or replace, do not skip.
7. Fix requires files outside scope → Scope creep; pause and report.
8. External API uncertainty → Use Context7 before patching.

For every issue, report:
Input signal:
Transformation point:
Expected output:
Observed output:
Classification:
Tool used:
Smallest safe fix:
Proof after fix:
```

## Tool Trigger Block

```md
Tool use:
- Use Playwright MCP for localhost UI verification, selector failures, console errors, and report/advisory behavior.
- Use Context7 MCP for external library/API uncertainty: Playwright, React, Vite, Tauri, Sigma, Graphology, Tailwind.
- Use Sequential Thinking MCP for complex transition planning and multi-system failure classification.
- Do not claim a tool result unless actually used.
- Repo code + accepted QA are project truth. Context7 is library truth. Playwright is UI evidence. Sequential Thinking is planning aid.
```

## Playwright Environment Recovery Block

```md
If Playwright fails with:
- `browserType.launch: Executable doesn't exist`
- `Please run: npx playwright install`
- missing Chromium/Firefox/WebKit browser binary

Classify as Environment Prerequisite.
Do not report app instability.
Allowed safe recovery:

```bash
npx playwright install chromium
npm run qa:e2e
```

If missing system dependencies are reported, stop and ask before sudo:

```bash
sudo npx playwright install-deps chromium
```
```

## Scope Guard Block

```md
Scope guard:
Before editing, list intended files. If any new file/system becomes necessary, pause and report why before editing it. Do not touch graph renderer, theme runtime, settings store architecture, or QA internals unless explicitly in scope.
```

## Validation Truthfulness Block

```md
Validation truthfulness:
Final report must show exact command output summary:
- Typecheck:
- Playwright passed:
- Playwright failed:
- Playwright skipped:
Do not say “passes” if skipped > 0 unless the user explicitly accepted skipped test debt.
```
