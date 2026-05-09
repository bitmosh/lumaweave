---
id: tooling.custom.skills.workflows
title: Custom Skills and Workflows
type: manual
status: accepted
domain: agent
subdomain: tooling
cluster: purple
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
tags:
  - skills
  - workflows
  - tooling
  - agent
  - LumaWeave
last_pass: vP-Forensics-2
---

# Custom Skills and Workflows

LumaWeave-specific skills and reusable workflow patterns for Bandit.

---

## Skills

### Large Bite Execution Skill

**Purpose:** Execute a multi-sub-pass feature implementation with full validation.

**When to use:** When a task spans multiple files and requires multiple validation checkpoints.

**Workflow:**
```
1. Read relevant source files and contracts
2. Plan sub-passes in sequence with explicit stop conditions
3. Implement each sub-pass
4. Typecheck after each meaningful change
5. Full Playwright after each sub-pass is complete
6. Update QA checklist if in scope
7. Update docs if changed
8. Print acceptance report with changelog entry
```

**Required validation:** Typecheck clean, Playwright clean (0 skipped), git status expected.

**Forbidden:** No git push, no writes outside scope, no QA bundle touch without lockstep.

---

### QA Contract Authoring Skill

**Purpose:** Write or update QA checklist entries for a new feature.

**When to use:** When a new system or capability is being registered in the QA bundle.

**Workflow:**
```
1. Read existing qa-registry.ts structure
2. Identify checks required for the feature
3. Draft checklist entries with expected behavior and test IDs
4. Add to qa-registry.ts
5. Typecheck
6. Update advisory-registry.ts if advisory questions are needed
7. Update BACKLOG_POLICY.md to reflect new active pass
8. Run QA Bundle Validator
```

**Forbidden:** No modification of existing accepted checklist entries without user authorization.

---

### No Dead Controls Audit Skill

**Purpose:** Audit a UI surface for dead controls (visible controls with no wired action).

**When to use:** Before accepting any passive UI pass. After adding any new UI element.

**Workflow:**
```
1. List all visible controls in the target surface
2. For each control: verify it has a wired action OR is explicitly marked as future/placeholder
3. Verify all controls have data-testid attributes
4. Verify all data-testid attributes are covered by Playwright specs
5. Report any dead controls found
```

**Rule:** No active-appearing control may be deployed without a wired action. Placeholder controls must be visually distinct (disabled state, future badge, etc.).

---

### Graph Interaction Regression Skill

**Purpose:** Verify that graph interaction behavior didn't regress after a change.

**When to use:** After any change to graph rendering, physics, or event handling.

**Workflow:**
```
1. Read existing graph interaction tests
2. Run targeted graph Playwright specs
3. If any fail: classify as regression before patching
4. If new interaction was added: write a spec for it
5. Verify no existing interactions degraded
```

---

### Advisory Proposal Skill

**Purpose:** Generate a well-formed advisory proposal for Mission Control.

**When to use:** When a significant architectural decision needs user visibility.

**Workflow:**
```
1. Read current advisory-registry.ts
2. Draft proposal: title, summary, rationale, risk, recommended action
3. Add to active advisory section (current QA key)
4. Verify proposal renders in Advisory tab (Playwright or manual)
5. Do not implement the proposal — surface it for user decision
```

---

## Reusable Workflow Patterns

### Contract → Registry → Validator → UI → Playwright

The standard ladder. Every new system uses this sequence. See `docs/agent/protocols/REGISTRY_CONTRACT_PATTERNS.md`.

### QA Key Rotation

All five files move together. See `docs/agent/protocols/PASS_TRANSITION_PROTOCOL.md`.

### Self-Split Recovery

Three strategies → back out → debug report → wait. See `docs/agent/protocols/BANDIT_SELF_SPLIT_PROTOCOL.md`.

### Multi-Agent Handoff

Announce scope, confirm isolation, wait for confirmation. See `docs/agent/onboarding/MULTI_AGENT_POLICY.md`.
