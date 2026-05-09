---
id: guide.new.agent.onboarding
title: New Agent Onboarding Guide
type: manual
status: accepted
domain: agent
subdomain: onboarding
cluster: violet
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
tags:
  - onboarding
  - agent
  - new
  - fresh
  - brief
  - deepseek
  - bandit
references:
  - policy.multi.agent
  - index.session.and.stack
  - index.source.of.truth
last_pass: vP-Forensics-2
---

# New Agent Onboarding Guide

## You Are Starting Cold

This document is self-contained. You do not need prior context.
Read it fully before touching anything.

---

## What This Project Is

**LumaWeave** is a local-first graph visualization platform.
It renders code architecture, contracts, registries, and evidence
as an interactive graph. Built on React + Vite + Graphology + Sigma.
Packaged as a desktop app via Tauri.

**Lattica** is the future broader platform family LumaWeave belongs to.

**Tagline:** "Clarity in every connection."

---

## Repo Root — Memorize This

```
/home/boop/Projects/lumaweave
```

This is the ONLY valid working directory. `/home/boop/Projects` is NOT
the repo. Before running any command, confirm:

```bash
pwd
git rev-parse --show-toplevel
```

Both must return `/home/boop/Projects/lumaweave`. If they do not,
stop and navigate there before doing anything else.

---

## Current Version State

The project uses versioned passes (v36, v37... v73c, v74a...).
Each version is a governance or implementation unit.

**Currently accepted through:** `v73c` (Mode Registry Validator v0)

**Next planned:** `v74a` (Source Adapter OS Foundation Contract)

Do not implement features from future versions unless explicitly
told to. Do not modify accepted contracts from past versions.

**Archive cutoff:** Anything before v65 is historical. Do not
treat pre-v65 docs as current governance.

---

## Your Operating Mode

Unless explicitly told otherwise, you are in **Locked Terminal Mode**:

- You MAY read files freely
- You MAY edit files that are explicitly assigned to you
- You MAY provide commands for the user to run
- You MAY NOT run git, npm, npx, grep, find, or Playwright yourself
- You MAY NOT modify files outside your assigned scope

When in doubt: **ask before acting**.

---

## The Most Important Rules

**1. Evidence before acceptance.**
No pass is accepted without: typecheck passing, Playwright passing,
zero skipped tests, no manual DevTools JavaScript as evidence.

**2. No skipped tests. Ever.**
A skipped test is an acceptance failure. Do not skip tests to
make the suite green.

**3. Contract before implementation.**
Every new capability requires a docs-only contract defining allowed
and forbidden behavior before any code is written.

**4. Truthful stopped report beats false clean report.**
If something fails and you can't fix it, say so clearly.
Do not fake a passing state.

**5. Forbidden boundaries are absolute.**
The following require an explicit new contract before any
implementation — no exceptions, no "this seems safe":
- Sigma/renderer mutation
- Audio input, microphone, Web Audio API
- CSS variable writes
- Node/edge/canvas styling
- Command execution
- Storage/persistence beyond what's contracted
- 3D rendering layer
- VR implementation

---

## Forbidden Evidence Paths

These are NOT acceptable as acceptance evidence:
- Manual DevTools JavaScript execution
- "Trust me, I read the code"
- Skipped tests
- Weakened tests that match broken behavior
- Fallback advisory as current-pass evidence

---

## The QA Lockstep Rule

When rotating the active QA key, ALL FIVE of these files must
update together as a single atomic operation:

```
docs/control-plane/qa/BACKLOG_POLICY.md
src/control-plane/qa/QaPanel.tsx
src/control-plane/qa/qa-registry.ts
src/control-plane/qa/advisory-registry.ts
tests/e2e/contract-registry.spec.ts
```

Do not rotate the QA key partially. Do not rotate the QA key
if another agent is currently active on an overlapping scope.

---

## Multi-Agent Context

You may not be the only agent working on this project.
Before starting any pass:

1. Ask: "Is another agent currently active? What are they working on?"
2. Confirm your scope does not overlap with theirs.
3. Announce your intended file scope before starting.
4. Do not touch QA bundle files or brain docs without lead agent
   (Bandit) authorization.

Full policy: `docs/agent/onboarding/MULTI_AGENT_POLICY.md`

---

## Required Validation Commands

Run these in order for any pass that touches runtime or tests:

```bash
cd /home/boop/Projects/lumaweave || exit 1
npm run typecheck
npm run qa:e2e
grep -R "test.skip" -n tests/e2e || true
git status --short
git diff --name-only
```

All must pass before a pass is accepted.

---

## Acceptance Report Format

Every completed pass needs a report in this format:

```
[Version] Validation Report

Agent: [your identity]
Repo root confirmed: yes / no

Validation:
- typecheck:       passed / failed
- Playwright:      N passed, 0 skipped / [failures]
- test.skip grep:  clean / dirty
- git status:      clean / dirty

Forbidden boundary check:
- graph/Sigma mutation: none
- audio input/playback: none
- command execution:    none
- QA key/advisory/registry changes: none / [what changed]
- UI/panel changes: none / [what changed]

Files changed: [list or "none"]

Recommendation: ACCEPT / DO NOT ACCEPT / BLOCKED — NEEDS HUMAN REVIEW
```

---

## If Something Goes Wrong

**Playwright fails:** Stop. Report full failure. Classify the shared
root cause. Apply the 3-strategy rule. If unresolved after 3 distinct
strategies, execute self-split protocol.

**Typecheck fails:** Stop. Report full output. Fix only errors
directly in your assigned files. Do not attempt broad fixes.

**More than 5 Playwright failures at once:** Stop immediately.
This is a cascade. Classify the shared root cause before patching
anything. Do not patch individual tests.

**Anything unexpected:** Stop and report. Do not improvise.

Self-split protocol: `docs/agent/protocols/BANDIT_SELF_SPLIT_PROTOCOL.md`

---

## Where to Find More

```
docs/operating-policies/SESSION_AND_STACK.md     ← version spine, roadmap
docs/operating-policies/SOURCE_OF_TRUTH.md       ← forbidden boundaries by system
docs/operating-policies/QA_AND_PLAYWRIGHT.md     ← evidence rules, lockstep
docs/agent/protocols/BANDIT_PROTOCOL.md          ← full operating protocol (Bandit)
docs/agent/protocols/BANDIT_SELF_SPLIT_PROTOCOL.md ← self-split procedure
docs/agent/onboarding/MULTI_AGENT_POLICY.md      ← multi-agent rules
docs/survival-manual/02_DIAGNOSTIC_ROUTER.md     ← failure classification
docs/quest/QUEST_TEMPLATE.md                     ← situation report format
```

If you are Bandit: also read your brain docs at `docs/agent/brain/`
before any pass, starting with `23_BANDIT_CURRENT_TITLE.md`.

---

## First Action Checklist

Before doing anything else:

```
□ Confirm repo root: pwd returns /home/boop/Projects/lumaweave
□ Read SESSION_AND_STACK.md — confirm current version and roadmap
□ Read SOURCE_OF_TRUTH.md — review forbidden boundaries
□ Ask user: what is my assigned task for this session?
□ Ask user: is another agent currently active and what are they working on?
□ State your self-check (Mode / Risk / Pass type / Forbidden actions / Stop condition)
□ Announce your intended file scope
□ Wait for user confirmation before touching anything
```
