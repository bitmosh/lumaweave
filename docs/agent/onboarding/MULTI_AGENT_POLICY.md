---
id: policy.multi.agent
title: Multi-Agent Operating Policy
type: policy
status: accepted
domain: agent
subdomain: onboarding
cluster: purple
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
tags:
  - multi-agent
  - policy
  - operating
  - deepseek
  - bandit
  - cascade
references:
  - protocol.bandit.operating
  - index.session.and.stack
last_pass: vP-Forensics-2
---

# Multi-Agent Operating Policy

## Context

As of 2026-05-06, LumaWeave development uses multiple agents
simultaneously:

- **Bandit** (Claude / Claude.ai project) — primary governance agent.
  Owns contract writing, docs, QA/advisory lockstep, brain maintenance,
  and architectural decisions.

- **DeepSeek V4** (Cascade / Windsurf) — secondary implementation agent.
  Runs validation passes, implementation tasks, and Playwright evidence
  collection under Bandit's contract governance.

Additional agents may be added. This policy governs all multi-agent
sessions regardless of which agents are active.

---

## Agent Role Taxonomy

### Lead Agent
- Writes contracts and governance docs
- Makes architectural decisions
- Rotates QA keys
- Reviews other agents' output before acceptance
- Updates brain docs and changelog
- Current lead: **Bandit**

### Implementation Agent
- Runs validation commands
- Implements contracted features
- Collects Playwright evidence
- Reports results in standard format
- Does NOT rotate QA keys without lead agent authorization
- Does NOT make architectural decisions unilaterally
- Current implementation agent: **DeepSeek V4**

### Reviewer Agent
- Reviews another agent's output for correctness
- Reports findings without making changes
- No file writes during review mode
- Either agent can act as reviewer

---

## File Ownership Rules

### During Any Pass

Each pass has an explicit scope. File ownership for that pass
belongs to the agent running it. Rules:

1. **One agent per file per pass.** If Agent A is working on
   `src/modes/modeMetadataRegistry.ts`, Agent B must not touch it
   until Agent A's pass is complete and committed.

2. **Announce scope before starting.** Before any pass begins,
   the active agent states the files it intends to touch. The human
   confirms no collision with the other agent's current scope.

3. **QA bundle files are exclusively lead agent territory.**
   The following files may only be modified by the lead agent
   or with explicit lead agent authorization:
   ```
   docs/control-plane/qa/BACKLOG_POLICY.md
   src/control-plane/qa/QaPanel.tsx
   src/control-plane/qa/qa-registry.ts
   src/control-plane/qa/advisory-registry.ts
   tests/e2e/contract-registry.spec.ts
   ```

4. **Brain docs are exclusively lead agent territory.**
   ```
   docs/agent/brain/
   docs/agent/leveling/
   docs/agent/protocols/
   ```

---

## Handoff Protocol

When one agent completes a pass and hands off to the other:

**Agent completing the pass provides:**
```
Handoff Report
──────────────
Agent:            [who ran the pass]
Pass:             [version / task name]
Files changed:    [list]
Validation:       typecheck [pass/fail] · Playwright [N passed, 0 skipped]
Git status:       [clean / dirty]
Uncommitted:      [list or "none"]
Next agent scope: [what the receiving agent should do next]
Blockers:         [anything the next agent needs to know]
```

**Receiving agent does NOT start until:**
1. Handoff report is received
2. Human confirms the handoff
3. Receiving agent reads the handoff report and confirms understanding

---

## Conflict Prevention Rules

### QA Key Rotation
- Only one agent may rotate the QA key at a time
- The rotating agent must announce this to the human before starting
- The other agent must not touch QA bundle files during rotation
- Rotation is complete only when all five QA bundle files are updated
  and `npm run qa:e2e` passes

### Playwright Runs
- Only one agent should run the full Playwright suite at a time
- Parallel Playwright runs on the same codebase produce unreliable results
- If both agents need Playwright evidence, run them sequentially

### Contract Writes
- Contracts are lead agent territory
- Implementation agent may propose contract language but does not
  commit contracts without lead agent review

### Simultaneous Commits
- Never commit simultaneously from two agents
- One agent commits, confirms clean git state, then the other proceeds

---

## When Agents Disagree

If two agents produce conflicting outputs (different fixes for the
same problem, conflicting file edits, different architectural decisions):

1. **Both agents stop.** Do not merge conflicting outputs.
2. **Both agents report** their reasoning to the human.
3. **Human decides.** The chosen approach is the canonical one.
4. **The other agent's work is discarded**, not merged or compromised.

Do not attempt to "split the difference" between two conflicting
agent outputs. One is right, one is wrong, or both need a new approach.

---

## Treating Another Agent's Output

Until explicitly validated:
- Another agent's code changes are **unvalidated**
- Another agent's doc changes are **unreviewed**
- Another agent's test results are **unconfirmed**

An agent's output becomes trusted only after:
1. `npm run typecheck` passes
2. `npm run qa:e2e` passes with zero failures and zero skips
3. The lead agent has reviewed the diff
4. The human has accepted the pass

Do not build on unvalidated output. If you receive another agent's
work that has not been fully validated, report this before proceeding.

---

## XP and Leveling in Multi-Agent Context

- **XP belongs to the agent that ran the validation commands**
  and produced the clean evidence for an accepted pass.
- **Review bonus:** An agent that reviews another agent's output
  and catches a real issue earns **+0.25 XP** for the catch.
- **Clean streaks are per-agent**, not shared. Agent A's streak
  is not affected by Agent B's recovery pass.
- **Bandit's leveling** tracks Bandit's passes only.
  DeepSeek's passes do not count toward Bandit's level,
  and vice versa.

---

## Session Start Checklist (Multi-Agent)

At the start of any session where multiple agents may be active:

```
1. Ask user: "Is another agent currently active? What are they working on?"
2. Read SESSION_AND_STACK.md to confirm current version and roadmap.
3. Confirm your scope does not overlap with the other agent's scope.
4. Announce your intended scope before starting.
5. Confirm with user that the scope is clear and approved.
6. Proceed.
```

If the user cannot confirm the other agent's current scope:
wait for confirmation before starting any pass that touches
shared files (QA bundle, brain docs, currently modified source files).
