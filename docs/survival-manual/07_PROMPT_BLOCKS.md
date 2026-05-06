---
id: manual.prompt.blocks
title: Reusable Prompt Blocks
type: manual
status: accepted
version: v73c
domain: survival-manual
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: v73c
tags: [prompts, blocks, templates, survival]
---

# Reusable Prompt Blocks

Copy-paste these blocks when assigning tasks to Bandit or other agents.

---

## Failure Handling Block

```
Failure handling:
If anything fails, do not immediately patch. First classify it using the
Diagnostic Router (docs/survival-manual/02_DIAGNOSTIC_ROUTER.md).
Use Playwright for UI evidence, Context7 for external API uncertainty,
Sequential Thinking for complex transition planning.
Then patch the smallest proven boundary and validate.
Three strategies maximum. If all three fail: back out, stop, debug report.
```

---

## Scope Guard Block

```
Scope guard:
Before editing any file, list intended files.
If any new file or system becomes necessary, pause and report why before editing.
Do not touch graph renderer, theme runtime, settings store architecture,
or QA internals unless explicitly in scope.
```

---

## Tool Trigger Block

```
Tool use:
- Playwright MCP: localhost UI verification, selector failures, console errors
- Context7 MCP: external library / API uncertainty (Playwright, React, Vite, Tauri, Sigma, Graphology)
- Sequential Thinking MCP: complex transition planning, multi-system failure classification
- Do not claim a tool result unless actually used
- Repo code + accepted QA = project truth. Context7 = library truth. Playwright = UI evidence.
```

---

## Playwright Environment Recovery Block

```
If Playwright fails with:
  "browserType.launch: Executable doesn't exist"
  "Please run: npx playwright install"
  missing Chromium / Firefox / WebKit binary

Classify as Environment Prerequisite. Do not report app instability.

Safe recovery:
  npx playwright install chromium
  npm run qa:e2e

If missing system dependencies:
  Stop and ask before sudo:
  sudo npx playwright install-deps chromium
```

---

## QA Lockstep Block

```
QA lockstep: if rotating the QA key, all five files move together atomically:
  docs/control-plane/qa/BACKLOG_POLICY.md
  src/control-plane/qa/QaPanel.tsx
  src/control-plane/qa/qa-registry.ts
  src/control-plane/qa/advisory-registry.ts
  tests/e2e/contract-registry.spec.ts

Do not rotate the key partially. Run QA Bundle Validator after:
  node scripts/validate-qa-bundle.mjs
```

---

## Self-Check Block

```
Before starting this pass, state:
  Mode: [Locked Terminal / Editor / Planner / Validator / Reporter]
  Risk: [low / medium / high]
  Pass type: [contract / registry / validator / passive UI / Playwright / runtime]
  Known weakness: [which scar applies]
  Forbidden actions: [relevant forbidden boundaries]
  Evidence required: [typecheck / Playwright / both / none]
  Multi-agent context: [who else is active]
  Stop condition: [what triggers self-split]
```

---

## Acceptance Report Block

```
[Version] Validation Report

Agent:
Repo root confirmed: yes / no

Validation:
- typecheck:       passed / failed
- Playwright:      N passed, 0 skipped
- test.skip grep:  clean / dirty
- git status:      clean / dirty

Forbidden boundary check:
- graph/Sigma mutation:    none
- audio input/playback:   none
- command execution:      none
- QA key/advisory changes: none / [what changed]

Files changed: [list or "none"]

Changelog entry: [date · version · type · ACCEPTED — summary — count — agent]

Recommendation: ACCEPT / DO NOT ACCEPT / SELF-SPLIT
```
