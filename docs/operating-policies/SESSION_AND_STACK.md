---
id: policy.session.and.stack
title: LumaWeave — Session Handoff & Accepted Stack
type: policy
status: current
cluster: violet
domain: operating-policies
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
references:
  - policy.source.of.truth
  - policy.qa.and.playwright
  - brain.bandit.current.title
  - brain.bandit.working.memory.refresher
  - brain.agent.learning.index
  - log.bandit.changelog
tags:
  - policy
  - session
  - handoff
  - stack
  - v86a
  - operational
---

# LumaWeave — Session Handoff & Accepted Stack

Operational quickstart for fresh agents. Read this first, then check current repo state, then proceed.

## Project Identity

**Product:** LumaWeave (current). Possible future rename: Lattica.

```
LumaWeave = current repo/product identity and visual engine name
Lattica   = possible broader platform identity (deferred)
```

Do not rename files, folders, packages, imports, or product strings unless the operator explicitly initiates a rename pass.

**Repo root:**
```
/home/boop/Projects/lumaweave
```

`/home/boop/Projects` is not the repo.

---

## Product Shape

LumaWeave is a local-first, high-resolution code architecture visualization platform with a strong evidence/control-plane layer. Evolving toward broader experiential data visualization (see VGE design cluster).

```
Graphology = external graph data model/library
Sigma      = external graph renderer
React/Vite/Playwright = external app/test foundation
LumaWeave  = custom control plane, governance, safety, registry, theme,
             and graph-architecture OS layers
```

---

## Current Accepted State (v86a era)

**Accepted spine:** v74 Source Adapter OS → v75 Synthetic Data Fixtures → v85 series → v86a Foundations → v86b Visual Treatment (partial accept) → vP-Tests → vP-Forensics-1 → vP-Forensics-2 → vP-Registry-1 Phase X.

**For the full version history, see:**
- `docs/agent/leveling/BANDIT_CHANGELOG.md` — operational event log, one entry per accepted pass
- `docs/agent/brain/23_BANDIT_CURRENT_TITLE.md` — current title, level, and streak
- `docs/updates/v86+_updates/(NEW-V86+)V86_BANDIT_MASTER_INDEX.md` — v86 sub-arc plan

**Currently in progress:**

- **vP-Registry-1 Phase Y** — link network documentation. Phase X (token census) complete; Phase Y (per-layer docs and gap analysis) paused for documentation rehaul. Partial output exists at `docs/registries/LINK_NETWORK_OVERVIEW.md`.
- **Documentation rehaul** — cluster-by-cluster cleanup of stale docs, frontmatter normalization, codebase/PK alignment. Tracked in `docs/theme/REHAUL_LEDGER.md`.

**Queued sub-arcs (after rehaul):**

- vP-Registry-2 — token conversion execution (Phase X output → real refactors)
- v86c — Tile System (widget workspace)
- v86d — Inspector Mini-Graph (radial inspector)
- v86e — Cosmetic Polish

---

## LumaWeave-Owned Layers

```
Command Deck                          Three-tier Token Model (primitives/semantics/components)
Perspective System                    Theme Target Registry
QA / Advisory / Backlog governance    Theme Mapping Panel + Override Storage
Graph View Element Registry           Motion Safety / Epilepsy Guard Registry
Graph Visual Theme Mapping Registry   Synthetic Audio Signal Preview
Graph Runtime Boundary / Probe        Music Reactive Mapping Registry
Graph Theme Application ladder        Audio Source Registry
Source Adapter OS (v74+)              System Index Registry
Asset Bank (forward-compat empty)     Human / Evidence / Debug Mode Registry
Inspector Spoke Registry (v86d)       Bandit operating memory / skill bank
```

---

## Current Operating Rules

Evidence before acceptance.

A pass is not accepted until the relevant evidence exists:

- `npm run typecheck`
- `npm run qa:e2e` when runtime/QA/tests are touched
- `grep -R "test.skip" -n tests/e2e || true`
- Current QA key, QA registry, advisory registry, contract tests, and backlog policy move in lockstep
- No skipped tests
- No manual DevTools JavaScript required for acceptance evidence
- No dead active controls
- No graph/Sigma mutation unless explicitly promoted by contract
- No audio input/playback/reactivity unless explicitly promoted by contract

See `SOURCE_OF_TRUTH.md` for the full forbidden boundary list by system.

---

## Bandit Terminal Rule

Bandit is currently in **Locked Terminal Mode**.

- Bandit does not run commands.
- Operator runs validation and git commands manually.
- Bandit may edit explicitly assigned files, report changed files, and provide validation commands.
- If repo state or command output is needed, Bandit asks the operator for output.

---

## Session Start Checklist

At the start of every new session:

```bash
cd /home/boop/Projects/lumaweave || exit 1
git status --short
git log --oneline -12
```

Then:
1. Verify the most recent expected commits are present.
2. Check for any uncommitted work.
3. Confirm current QA key matches the current accepted pass.
4. If clean, proceed with the next roadmap item or assigned task.

---

## Required Reading Order

**Tier 0 — Operating policies (this packet):**
```
docs/operating-policies/SESSION_AND_STACK.md       (this doc)
docs/operating-policies/SOURCE_OF_TRUTH.md
docs/operating-policies/QA_AND_PLAYWRIGHT.md
```

**Tier 1 — Current repo state (from operator):**
```bash
git status --short
git log --oneline -12
```

**Tier 2 — Active brain (current pass context):**
```
docs/agent/brain/00_AGENT_LEARNING_INDEX.md
docs/agent/brain/23_BANDIT_CURRENT_TITLE.md
docs/agent/brain/24_BANDIT_WORKING_MEMORY_REFRESHER.md
docs/agent/leveling/BANDIT_CHANGELOG.md
```

**Tier 3 — Active source (only what the current task touches):**

Read on demand based on task scope. Common entry points:

```
src/control-plane/qa/QaPanel.tsx               (QA work)
src/themes/themeTokenPaths.ts                   (theme work)
src/graph/graphViewElementRegistry.ts           (graph work)
src/control-plane/handles/handleset.registry.ts (handle work)
tests/e2e/contract-registry.spec.ts             (test work)
```

For deeper system docs (per-cluster contracts, registries, schemas), navigate via `SOURCE_OF_TRUTH.md` or the cluster-specific docs in `docs/<cluster>/`.

---

## Current Arc

```
v86 sub-arc work
  → token registry surfacing (vP-Registry-1 Phase X — done)
  → link network documentation (Phase Y — paused, partial)
  → documentation rehaul (in progress)
  → resume Phase Y from clean foundation
  → vP-Registry-2 (token conversion execution)
  → v86c Tile System
  → v86d Inspector Mini-Graph
  → v86e Cosmetic Polish
```

---

## Deferred Runtime Behavior

Do not implement without explicit future contract:

- Real audio input, microphone permission, local file decoding, audio playback
- Music-reactive visuals beyond passive metadata
- Animation/pulse/shimmer/flash beyond what motion safety contract permits
- Graph/Sigma mutation, node/edge/canvas styling, physics reactivity beyond shipping contracts
- Command execution, theme pack installation/download execution
- CSS variable writes outside the theme override storage layer
- New canonical token promotion outside the promotion process
- Workshop-style theme/asset imports (Lattica — v88+)

---

*Rewrite v86a: trimmed multi-year version spine to current operating context only (full history in BANDIT_CHANGELOG). Updated brain doc paths from `docs/lumaweave_bandit_brain_packet/` to current `docs/agent/`. Reading tiers reduced from 5 to 4. References to current shipping precursors added throughout.*
