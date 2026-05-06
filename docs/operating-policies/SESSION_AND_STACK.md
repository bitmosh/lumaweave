---
id: index.session.and.stack
title: Session Handoff & Accepted Stack
type: index
status: accepted
version: v73c
domain: operating-policies
cluster: purple
agent_readable: true
include_in_self_graph: true
last_updated: v73c
tags: [session, handoff, stack, operating, agent]
---

# LumaWeave / Lattica — Session Handoff & Accepted Stack

## Project Identity

**LumaWeave** is the graph visualization engine.
**Lattica** is the broader platform family (future).
**Panorama Atlas** is the flagship Atlas lens — not a product subtitle.

```
LumaWeave  = current repo/product identity and graph engine name
Lattica    = future broader platform identity
```

Tagline: **"Clarity in every connection."**

Do not rename files, folders, packages, imports, or product strings unless the user explicitly initiates a rename pass.

**Repo root:**
```
/home/boop/Projects/lumaweave
```
`/home/boop/Projects` is not the repo.

---

## Tech Stack

```
Graphology  = external graph data model/library
Sigma       = external graph renderer (2D, WebGL)
React       = UI framework
Vite        = dev/build environment
Playwright  = E2E evidence layer
Tauri       = desktop app wrapper

LumaWeave/Lattica = custom control plane, governance, safety,
                    registry, theme, rendering layer, and
                    graph-architecture OS layers
```

---

## Current Accepted Version Spine

```
v36–v38   Command Deck + Perspective System read-only foundations
v39–v46   Graph physics coverage, element registry, visual inventory,
          runtime boundary/probe
v47–v58   Graph runtime/theme mapping/application ladder
v59–v60   Motion Safety / Epilepsy Guard contract + registry
v61–v62   Audio Reactivity Contract + Synthetic Signal Preview
v63–v64   Music Reactive Mapping Contract + Passive Inventory
v65–v66   Audio Source System Contract + Passive Audio Source Registry
v67–v68   Roadmap Realignment + Graph Control Plane Navigation Contract
v70       QA Bundle Validator                         [ACCEPTED]
v71a      Contract-to-Code Trace Matrix               [ACCEPTED]
v71b      Contract Trace Validator                    [ACCEPTED]
v72a      System Index Registry Contract              [ACCEPTED]
v72b      Static System Index Registry                [ACCEPTED]
v72c      System Index Validator v0                   [ACCEPTED]
v72d.1    Safe Mount Point Discovery                  [ACCEPTED]
v72d.2    AppShell / Route Pattern Discovery          [ACCEPTED]
v72d.3    Passive SystemIndexPanel Mount + Playwright [ACCEPTED]
v73a      Human / Evidence / Debug Mode Contract      [ACCEPTED]
v73b      Mode Metadata Registry                      [ACCEPTED]
v73c      Mode Registry Validator v0                  [CURRENT — verify committed]
```

**v69 (Collapsible Evidence Sections) — PAUSED.** Failed attempt due to
mass-edit approach. Retry scheduled after v73c is accepted, using
mode-aware additive overview grid only (v69a–v69d sliced approach).

**Archive cutoff:** Anything before v65 is historical. Do not reference
pre-v65 docs as current governance. They live in `docs/_archive/`.

---

## Current Roadmap

```
v73c   Mode Registry Validator v0            ← verify committed, then done
v74a   Source Adapter OS Foundation Contract ← next
v74b   Source Adapter Base Registry + Validator
v75a   Synthetic Data Fixtures v0 — Self-Graph Seed
v75b   Self-Graph Passive Mount — First Demo Surface
v76    Verified Download Button Boundary Contract
v77a   Theme Workshop Security Model — Docs Pass
v77b   Workshop Security Gate v0 — Schema + Provenance Layer
v69r   v69 Retry — Overview Grid / Summary Cards (additive only)
v78+   Visual Grammar Engine Bootstrap
```

---

## LumaWeave-Owned Layers

```
Command Deck
Perspective System
QA / advisory / backlog governance
Graph View Element Registry
Graph Visual Inventory
Graph Theme Mapping Registry
Graph Runtime Boundary / Probe
Graph Theme Application ladder
Motion Safety / Epilepsy Guard Registry
Synthetic Audio Signal Preview
Music Reactive Mapping Registry
Audio Source Registry
System Index Registry
Human / Evidence / Debug Mode Registry
Theme Workshop Security Packet
Ghost Overlay / Grammar Lens (partial — in development)
Bandit operating memory / skill bank
```

---

## Multi-Agent Context

As of 2026-05-06, two agents may be active simultaneously:
- **Bandit** (Claude) — primary governance agent
- **DeepSeek V4** (Cascade) — secondary implementation agent

Before starting any pass, confirm which agent is active and what the
other agent's current scope is. See `docs/agent/onboarding/MULTI_AGENT_POLICY.md`.

---

## Current Operating Rules

Evidence before acceptance.

A pass is not accepted until:
- `npm run typecheck` passes with zero errors
- `npm run qa:e2e` passes when runtime/QA/tests are touched
- `grep -R "test.skip" -n tests/e2e || true` returns clean
- Current QA key, QA registry, advisory registry, contract tests,
  and backlog policy move in lockstep
- No skipped tests
- No manual DevTools JavaScript required for acceptance evidence
- No dead active controls
- No graph/Sigma mutation unless explicitly promoted by contract
- No audio input/playback/reactivity unless explicitly promoted by contract

See `docs/operating-policies/SOURCE_OF_TRUTH.md` for the full
forbidden boundary list by system.

---

## Bandit Terminal Rule

Bandit is currently in **Locked Terminal Mode**.

- Bandit does not run commands.
- User runs validation and git commands manually.
- Bandit may edit explicitly assigned files, report changed files,
  and provide validation commands.
- If repo state or command output is needed, Bandit asks the user.

---

## Session Start Checklist

At the start of every new session, ask the user for:

```bash
cd /home/boop/Projects/lumaweave || exit 1
git status --short
git log --oneline -12
```

Then:
1. Verify v73c was committed if it was the last reported task.
2. Check for any uncommitted work.
3. Confirm current QA key matches the current accepted pass.
4. Confirm no other agent is mid-pass on an overlapping scope.
5. If clean, proceed with the next roadmap item.

---

## Required Reading Order

**Tier 0 — This packet (read every session):**
```
docs/operating-policies/SESSION_AND_STACK.md     ← this file
docs/operating-policies/SOURCE_OF_TRUTH.md
docs/operating-policies/QA_AND_PLAYWRIGHT.md
```

**Tier 1 — Current repo state (ask user first):**
```bash
git status --short
git log --oneline -12
```
Then inspect:
```
docs/control-plane/qa/BACKLOG_POLICY.md
docs/control-plane/contracts/GRAPH_CONTROL_PLANE_NAVIGATION_CONTRACT.md
docs/roadmap/LATTICA_ROADMAP_REALIGNMENT_V67.md
docs/graph/contracts/
docs/audio/
docs/accessibility/MOTION_SAFETY_AND_EPILEPSY_GUARD_CONTRACT.md
docs/security/
```

**Tier 2 — QA / Control Plane runtime files:**
```
src/control-plane/qa/QaPanel.tsx
src/control-plane/qa/qa-registry.ts
src/control-plane/qa/advisory-registry.ts
tests/e2e/contract-registry.spec.ts
tests/e2e/helpers/qa.ts
```

**Tier 3 — Graph / Theme / Safety / Audio registries:**
```
src/graph/graphViewElementRegistry.ts
src/graph/graphVisualThemeMappingRegistry.ts
src/accessibility/motionSafetyRegistry.ts
src/audio/syntheticAudioSignal.ts
src/audio/musicReactiveMappingRegistry.ts
src/audio/audioSourceRegistry.ts
src/control-plane/graph/GraphVisualInventoryPanel.tsx
src/modes/modeMetadataRegistry.ts
```

**Tier 4 — Bandit brain / working memory:**
```
docs/agent/brain/00_AGENT_LEARNING_INDEX.md
docs/agent/brain/23_BANDIT_CURRENT_TITLE.md
docs/agent/brain/24_BANDIT_WORKING_MEMORY_REFRESHER.md
docs/agent/brain/25_BANDIT_SELF_MODEL_AND_GROWTH_PROTOCOL.md
```

**Tier 5 — Playwright / failure diagnosis:**
```
docs/operating-policies/QA_AND_PLAYWRIGHT.md
docs/quest/QUEST_TEMPLATE.md
docs/survival-manual/02_DIAGNOSTIC_ROUTER.md
```

---

## Current Arc

Old arc (superseded, pre-v65):
```
Inspector stack → Theme Mapping shell → Visual handle/token citations
→ Generated read-only controls
```

Current arc:
```
Graph control plane
→ graph/theme registry governance
→ runtime boundary probes
→ motion safety
→ synthetic audio signal preview
→ passive music-reactive mapping
→ passive audio source registry
→ roadmap/navigation realignment
→ system index registry
→ human/evidence/debug mode contract + registry
→ source adapter OS foundation
→ synthetic data fixtures / self-graph
→ collapsible evidence UX (v69 retry, pending)
→ verified download / theme security
→ rendering layer architecture
→ Visual Grammar Engine bootstrap
→ tile workspace + lens navigation system
→ physics dialects + universal audio routing
```

---

## Deferred Runtime Behavior

Do not implement without explicit future contract:
- Real audio input, microphone permission, local file decoding, audio playback
- Music-reactive visuals, animation/pulse/shimmer/flash
- Graph/Sigma mutation, node/edge/canvas styling, physics reactivity
- Command execution, theme pack installation/download execution
- CSS variable writes or new token promotion
- Grammar Lens edits applied to inactive rendering layers without
  cross-layer override cache contract
- VR implementation of any kind
- Agent familiar system
- 3D rendering layer
