---
id: brain.bandit.working.memory
title: Bandit Working Memory Refresher
type: manual
status: accepted
domain: agent
subdomain: brain
cluster: violet
agent_readable: true
include_in_self_graph: false
last_updated: 2026-05-09
tags:
  - bandit
  - working-memory
  - pre-pass
  - checklist
  - pass-types
last_pass: vP-Forensics-2
---

# Bandit Working Memory Refresher

## Purpose

Before starting any pass, mentally load the correct context
for that pass type. This doc tells you what to load and what
to verify. It prevents the most common pre-pass mistakes.

---

## Universal Pre-Pass Checklist (Every Pass)

Before anything else:

```
□ Read 23_BANDIT_CURRENT_TITLE.md — active skill bank
□ Ask user for git status --short and git log --oneline -12
□ Confirm current QA key in qa-registry.ts
□ Confirm no other agent is mid-pass on overlapping scope
□ State self-check:
    Mode: [Locked Terminal / Editor / Planner / Validator / Reporter]
    Risk: [low / medium / high]
    Pass type: [contract / registry / validator / passive UI / Playwright / runtime]
    Known weakness: [which scar applies here]
    Forbidden actions: [list relevant forbidden boundaries]
    Evidence required: [typecheck / Playwright / both / none]
    Multi-agent: [who else is active, what scope]
    Stop condition: [exactly what triggers a self-split]
```

---

## Tool Execution Rules

Before running any terminal commands:

```
□ Run terminal commands one at a time, never in parallel
□ Wait for each command to return output before running the next one
□ If a command is canceled with "Step was canceled by user":
    1. Do not continue with remaining commands
    2. Do not re-run immediately
    3. Report what was canceled and what succeeded
    4. Wait for user to confirm before re-running
□ This applies even when commands seem independent
□ Parallel terminal execution is not reliable in this environment
```

---

## By Pass Type

### Contract Pass (docs-only)

Load:
- `docs/operating-policies/SOURCE_OF_TRUTH.md` — forbidden boundary list
- Relevant existing contracts in the same domain
- Current arc from `SESSION_AND_STACK.md`

Verify before starting:
- No runtime files in scope
- No QA key rotation needed
- No Playwright required (docs-only)

Watch for:
- Accidentally describing runtime behavior as if contracted
- Writing a contract that contradicts an existing accepted contract
- Skipping the forbidden boundaries section

Evidence required: none — but do typecheck if any `.ts` files touched.

---

### Registry Pass

Load:
- The contract this registry implements (must exist and be accepted)
- `docs/operating-policies/SOURCE_OF_TRUTH.md`
- TypeScript type definitions for the domain

Verify before starting:
- Contract is accepted (not just written)
- Registry type matches contract schema exactly
- QA lockstep: does this need a new QA key? If yes, plan all five files.

Watch for:
- Promoting a registry entry to runtime behavior without a runtime contract
- Adding a field to the type that isn't in the contract schema
- Forgetting to run typecheck after every meaningful change

Evidence required: typecheck. Playwright only if QA bundle changes.

---

### Validator Pass

Load:
- The contract and registry this validator enforces
- `docs/operating-policies/QA_AND_PLAYWRIGHT.md` — no-skip rule
- Recent validator failures for context (if available)

Verify before starting:
- Validator is read-only (no mutations to source files)
- All string checks use case-insensitive matching unless schema requires otherwise
- Descriptive fields use substring matching, not exact match
- Validator exits with a clear pass/fail signal

Watch for:
- Case sensitivity mismatches (most common validator failure)
- Substring vs exact match for prose fields
- Validator silently passing on partial data
- Validator script path not registered in QA bundle

Evidence required: typecheck + Playwright (validator must be proven to run).

---

### Passive UI Pass

Load:
- The contract this UI surface implements
- Current mode metadata (Human/Evidence/Debug) if mode-aware
- Existing `data-testid` conventions in the codebase

Verify before starting:
- UI is read-only (no interactive edits without contract)
- All new elements have `data-testid` attributes
- Mode-aware rendering: mode contract must be accepted before mode-dependent code
- No dead controls (every visible control must do something)

Watch for:
- Adding a button without a wired action
- Adding mode-aware rendering before the mode contract is accepted
- Missing `data-testid` attributes on new elements
- Accidentally importing Sigma API or triggering graph mutation

Evidence required: typecheck + Playwright.

---

### Playwright Evidence Pass

Load:
- `docs/operating-policies/QA_AND_PLAYWRIGHT.md` — cascade rule, helper scope rule
- Existing test helpers in `tests/e2e/helpers/`
- Current failing test output (if this is a fix pass)

Verify before starting:
- No test.skip anywhere in scope
- Helper changes audited for all callers
- Advisory tab tests use `waitForAdvisory()` only after tab is opened
- `switchQaKey()` does not wait for Advisory content

Watch for:
- Cascade (5+ failures → stop, classify shared root, do not patch individually)
- Broad helper changes breaking unrelated tests
- Adding `test.skip` to make the suite green
- Historical key tests that don't explicitly select their key before asserting

Evidence required: full Playwright suite clean, zero skips.

---

### QA Key Rotation Pass

This is a special case of the registry pass. All five files move together.

Load:
- Current `qa-registry.ts` and `advisory-registry.ts`
- `docs/agent/protocols/PASS_TRANSITION_PROTOCOL.md`
- `docs/agent/protocols/QA_KEY_LIFECYCLE.md`

Five files to update atomically:
```
docs/control-plane/qa/BACKLOG_POLICY.md
src/control-plane/qa/QaPanel.tsx
src/control-plane/qa/qa-registry.ts
src/control-plane/qa/advisory-registry.ts
tests/e2e/contract-registry.spec.ts
```

Verify before starting:
- No other agent is touching any of these five files
- The new QA key is correct (major vs sub-pass: v74 vs v74a)
- All five identity surfaces will agree: header, dropdown, report key,
  advisory set key, debug diagnostics

Watch for:
- Partial rotation (only 3 of 5 files updated)
- Sub-pass key when a major key is needed (or vice versa)
- Old advisory questions leaking into new key's advisory set
- Fallback advisory being used as current-pass evidence

Evidence required: typecheck + full Playwright, QA Bundle Validator.

---

### Recovery / Self-Split Pass

Load:
- `docs/agent/protocols/BANDIT_SELF_SPLIT_PROTOCOL.md`
- The debug report from the failed pass
- `docs/survival-manual/02_DIAGNOSTIC_ROUTER.md` — classify the failure

Verify before starting:
- Repo is backed out to last clean state (git status clean)
- The failure class is correctly identified
- This is strategy 1 of a fresh 3-strategy attempt, not strategy 4

Watch for:
- Trying a 4th strategy instead of stopping at 3
- Making "small cleanup" changes while investigating
- Not backing out before starting recovery

Evidence required: whatever the original pass required. Self-split
passes earn +0 XP. Recovery passes earn +0 XP.

---

### Multi-Agent Handoff Pass

Load:
- `docs/agent/onboarding/MULTI_AGENT_POLICY.md`
- The other agent's handoff report
- `docs/operating-policies/SESSION_AND_STACK.md` — current arc

Verify before starting:
- Handoff report is received and complete
- Human has confirmed the handoff
- Scope is clearly defined and non-overlapping
- QA key state is confirmed (no mid-rotation state)

Watch for:
- Building on another agent's unvalidated output
- Scope creep into the other agent's files
- QA key collision (both agents rotating simultaneously)

---

## What Never Changes

Regardless of pass type:

- No skipped tests. Ever.
- No Sigma/renderer mutation without contract.
- No audio input/playback/reactivity without contract.
- No command execution.
- Truthful stopped report > false clean report.
- 3 strategies → back out → self-split debug report → wait.
