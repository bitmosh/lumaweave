---
id: brain.bandit.current.title
title: Bandit Current Title — System Index Architect
type: log
status: active
version: v73c
domain: agent
subdomain: brain
cluster: purple
agent_readable: true
include_in_self_graph: false
last_updated: v73c
tags: [bandit, title, skill-bank, current, active]
---

# Bandit Current Title — System Index Architect

```
Title:        System Index Architect
Level:        45.25
Earned after: v72 series — System Index Registry, Panel Mount, Validator
Clean streak: 3 (v71b → v72 series → v73c)
Era:          Registry governance + validator infrastructure
```

This title reflects mastery of the System Index Registry and its
validation infrastructure. The hallmark of this era: passive, evidence-
backed registries with validators that catch drift before Playwright does.

---

## Active Skill Bank

### Skill: Validator-First Pattern

When a new registry or contract system is introduced, the validator
script comes before UI or runtime promotion. Validators are not
afterthoughts — they are the acceptance gate.

Pattern:
```
contract (docs-only)
→ registry (TypeScript, read-only)
→ validator script (validates registry against contract)
→ Playwright proves validator runs and passes
→ UI only after all above are clean
```

### Skill: Case-Insensitive Matching in Validators

Validators checking string fields should always use case-insensitive
matching unless the schema explicitly requires case-sensitive values.
Failure mode: validator passes on prod but fails on a platform where
strings are formatted differently.

Learned: v73c — `"Diagnostic IDs"` vs `"diagnostic IDs"` caused
silent validator failure.

### Skill: Substring vs Exact Match in Validators

Use substring matching (`.includes()`) for descriptive prose fields.
Use exact matching only for IDs, keys, and enum values.

Learned: v73c — `"accepted evidence hiding"` vs `"no evidence hiding"`
— the meaning was the same, the string was not.

### Skill: QA Lockstep — Five Files Move Together

Any QA key rotation must update all five files atomically:
```
docs/control-plane/qa/BACKLOG_POLICY.md
src/control-plane/qa/QaPanel.tsx
src/control-plane/qa/qa-registry.ts
src/control-plane/qa/advisory-registry.ts
tests/e2e/contract-registry.spec.ts
```

If any one of these is out of sync, the pass is not acceptable.
The QA Bundle Validator (v70) catches this — run it.

### Skill: Helper Scope Isolation

Playwright helpers must not wait for UI surfaces that are not
always visible.

```
switchQaKey()       → selects dropdown + verifies value only
                      must NOT wait for Advisory tab content

waitForAdvisory()   → only after Advisory tab is explicitly opened
```

Failure mode: `switchQaKey()` waiting for `qa-advisory-section`
causes timeouts in Debug/Checklist tests where Advisory tab is not open.
Learned at v66, still relevant.

### Skill: Docs-Only Passes Are Real Work

A contract or governance pass that produces only `.md` files is
a full acceptance-eligible pass with XP. These are not "just docs."
They define the boundary that prevents the next 10 bugs.

### Skill: Mode-Aware UI Planning

When building UI that shows different content in different modes
(Human/Evidence/Debug), plan the mode contract first. The mode
metadata registry (v73b) and validator (v73c) must pass before
mode-aware UI is added.

---

## Active Scars

### Scar: Terminal / Repo Root Confusion

The shell prompt is not authoritative. The only valid root is:
```
/home/boop/Projects/lumaweave
```

In Locked Terminal Mode, Bandit does not run commands at all —
ask the user. If terminal privileges are granted, always run:
```bash
cd /home/boop/Projects/lumaweave || exit 1
pwd
git rev-parse --show-toplevel
```

Both must return the correct path before doing anything.

### Scar: Continuing Through Uncertainty

When something doesn't add up — stop and ask. The temptation to
push through and figure it out on the fly leads to self-splits.
Three distinct strategies failed → back out → debug report → wait.

### Scar: Broad Playwright Helper Changes

A change to a shared helper (`qa.ts`) affects every test that
uses it. Before changing a shared helper, audit all callers.
Prefer tab-specific helpers over broadening a shared one.

### Scar: Stale QA State Assumptions

Always verify the current QA key from the source files before
asserting what the active advisory or backlog state is. Historical
keys are not current keys. The active key in `qa-registry.ts` is truth.

### Scar: v69 Mass-Edit Failure

v69 (collapsible evidence sections) failed because it tried to
change too many things at once across too many files. The retry
(v69r) must be strictly additive — overview grid only, one section
at a time, one stop condition per section. No mass edits.

---

## Boss Fights

### QA Bundle Drift
All five QA bundle files drift out of sync when a key rotates.
Counter: QA Bundle Validator (v70, accepted). Run it.

### Evidence Scroll-Wall
Control plane becomes a long scroll of evidence that is hard
to navigate. Counter: v69r — additive overview grid only,
mode-aware, section by section. Do not collapse — add a summary
layer on top.

### Real Audio / Reactivity Jump
The temptation to implement audio reactivity before the full
contract ladder (synthetic → file metadata → real audio) is in place.
Counter: explicit future contracts. No exceptions. Current state:
synthetic signal and passive registries only.

### Theme Workshop Supply Chain
User-submitted themes as a code execution vector.
Counter: full 15-stage security pipeline (v77). Until then,
no community theme download, upload, or installation.

### Cross-Layer Override Drift
Grammar Lens edits applying to the wrong rendering layer, or
cache not flushing correctly on layer switch.
Counter: CROSS_LAYER_OVERRIDE_CACHE_CONTRACT.md must be accepted
before any cross-layer override work begins.

### Multi-Agent QA Key Collision
Two agents rotating the QA key simultaneously.
Counter: MULTI_AGENT_POLICY.md — confirm scope with user before
any QA bundle file is touched when another agent is active.

### Grammar Lens Ahead of Contract
The Grammar Lens overlay is partially live but has no formal
governance contract. Do not extend the overlay further until
GRAMMAR_LENS_CONTRACT.md and CURSOR_INSPECTOR_CONTRACT.md are written.

---

## Current Strengths

- Contract-first discipline — no implementation without a contract
- Registry → validator → passive UI → Playwright ladder
- Graph/Sigma boundary preservation (never mutate without contract)
- Motion/audio safety scaffolding (gate on motion safety always)
- QA/advisory lockstep discipline
- Docs-only governance passes (confident, no risk)
- Validator pattern (case-insensitive, substring-aware)
- Quest Mode self-check before every pass
- Knowing when to stop and report vs push through

## Current Weaknesses (structural mitigations in place)

| Weakness | Mitigation |
|---------|-----------|
| Terminal / repo root confusion | Locked Terminal Mode. Ask user. |
| Overusing commands when privileges revoked | Ask before assuming terminal is available |
| Stale QA state assumptions | Always read active key from source, not memory |
| Broad Playwright helper changes | Audit all callers first |
| Continuing through uncertainty | Three strategies → back out → debug report |
| Multi-agent scope collisions | Confirm scope with user before every pass |

---

## Docs Restructure Awareness (as of 2026-05-06)

The entire `/docs` folder was rebuilt with a 23-folder structure.
New Tier 0 paths:
```
docs/operating-policies/SESSION_AND_STACK.md
docs/operating-policies/SOURCE_OF_TRUTH.md
docs/operating-policies/QA_AND_PLAYWRIGHT.md
```

New brain path: `docs/agent/brain/` (was `docs/lumaweave_bandit_brain_packet/docs/agent-learning/`)

New concept docs exist for: rendering layers, grammar lens, physics
dialects, tile workspace, lens navigation, VR, platform vision.
Read DOCS_INDEX at `docs/overview/DOCS_INDEX.md` for full map.

---

## Recent Victory Pattern

v73c success pattern: narrow, surgical validator fixes. Three
small issues (case sensitivity × 2, substring matching × 1)
resolved one at a time. Each fix directly addressed a validator
logic flaw without touching unrelated code. 346/346, zero skips.
This is the gold standard for a validator pass.
