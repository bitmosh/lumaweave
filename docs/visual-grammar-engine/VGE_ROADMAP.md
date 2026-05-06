---
id: vge.PLACEHOLDER
title: Visual Grammar Engine — PLACEHOLDER
type: concept
status: concept
version: v73c
domain: visual-grammar-engine
cluster: teal
agent_readable: true
include_in_self_graph: true
last_updated: v73c
tags: [vge, visual-grammar-engine, concept, future, docs-only]
---
# Visual Grammar Engine — Implementation Roadmap

> Status: Future roadmap concept only. Not active implementation authorization.

---

## Dependency Context

VGE implementation should follow the current governance/source-adapter groundwork maturing.

Recommended preceding milestones (many already accepted):
```
v70  QA Bundle Validator                   ✓ accepted
v71  Contract-to-Code Trace Matrix         ✓ accepted
v72  System Index Registry                 ✓ accepted
v73  Human / Evidence / Debug Mode         ✓ accepted (v73c pending)
v74  Source Adapter OS Reconnect Contract  → next
v75  Synthetic Data Fixtures v0            → next
```

---

## Visual Grammar Engine Roadmap

```
vGrammar-1  Visual Grammar Engine Contract
            Docs-only. Define grammar files, handles, routes, safety, forbidden behavior.

vGrammar-2  Handle Reference Registry / README
            Read-only list of grammar handles users can reference.
            First concrete VGE step — low-risk, high-value, starts the naming.

vGrammar-3  Terminal Validator
            lumaweave grammar validate file.lwgrammar.yaml
            No runtime application.

vGrammar-4  Grammar Lens Contract
            Docs-only click-to-YAML-slice inspector behavior.

vGrammar-5  Read-only Grammar Lens
            Click element → show resolved handle and YAML slice. No editing.

vGrammar-6  Preview-only Grammar Lens
            Edit YAML → validate → preview override. No persistence.

vGrammar-7  Saved Workspace Overrides
            Save validated changes locally.

vGrammar-8  Asset Bank Integration
            Saved grammar presets appear in Asset Bank.

vGrammar-9  Runtime Graph/Sigma Dialect Application
            Only after explicit graph runtime styling contract.

vGrammar-10 Screensaver / Live Desktop / Ambient Mode
            Only after sandboxing, permission, performance, and safety contracts.
```

---

## Signal Loom Roadmap

```
vSignal-1   Signal Loom Contract           Docs-only routing shape + forbidden behavior
vSignal-2   Handle Reference README        Read-only signal/visual/target/safety handles
vSignal-3   Preset File Validator CLI      Validate .lwgrammar/.lwsignal YAML
vSignal-4   Fixture Preview               Apply protocol to synthetic fixture data only
vSignal-5   Passive UI Preview            Show resolved routes and safety classifications
vSignal-6   Runtime Visual Preview        DOM-only, reduced-motion safe
vSignal-7   Graph/Sigma Integration       Only after explicit graph runtime contract
vSignal-8   Live Desktop / Screensaver    Only after sandboxing + safety contracts
```

---

## Asset Bank Roadmap

```
vAsset-1    Accepted Asset Type Contract   Categories, file types, forbidden content, validation
vAsset-2    Passive Asset Type Registry    Static read-only registry of allowed asset types
vAsset-3    Asset Bank Contract            Lifecycle, metadata schema, quarantine, provenance
vAsset-4    Local Asset Bank v0            Read-only seeded assets only. No imports.
vAsset-5    Safe Import Preview            Candidate assets into quarantine/preview only
vAsset-6    Theme/Inspector Link          Selected element shows compatible accepted assets
```

---

## Source Adapter OS Notes

(Formerly IDE Live Workspace Bridge — superseded framing.)

The IDE bridge is part of the broader Source Adapter OS:
```
IDE / agent / workspace activity
→ local event/source adapter
→ source classification
→ extraction/normalization
→ graph build schema
→ graph patch preview
→ LumaWeave visualization + QA evidence layer
```

Security/privacy requirements for any source adapter:
- Local-first operation, no unapproved network transmission
- No secret/token leakage
- User-controlled workspace scope
- No parent-directory wandering
- No auto-execution of project commands
- Audit logs for source ingestion

Do not mutate the graph renderer directly from IDE events. Use the safe ladder:
```
source event → adapter registry → normalized entity/relationship preview
→ graph build schema → passive graph patch preview
→ explicit user/apply boundary → graph update only after contract
```

---

## v69 Retry Scar Notes

The failed first attempt at v69 (collapsible evidence sections) established the correct pattern for the retry:

```
v69a  Overview grid / summary cards only — no collapse of legacy accepted evidence
v69b  Section metadata registry + test helper contract
v69c  Collapse one legacy section at a time after tests are migrated and validated
v69d  Repeat section-by-section, stopping after first cascade
```

**Do not repeat:**
- Do not collapse all legacy evidence sections in one pass
- Do not mass-edit large Playwright specs
- Do not patch many test failures one by one
- Do not leave active QA key pointing at paused work
- Do not treat a UI change as accepted without evidence

---

## Bandit Handoff Prompt for VGE Docs Import

Use when asking Bandit to import or preserve VGE docs:

```
Task: Import the Visual Grammar Engine docs packet as docs-only future architecture memory.
Mode: Locked Terminal / Editor. No terminal commands unless explicitly granted.
Expected folder: docs/visual-grammar-engine/

Forbidden:
- no runtime implementation
- no source code changes
- no QA key/advisory/registry changes
- no tests changed
- no token promotion
- no CSS variable writes
- no graph/Sigma mutation
- no audio input/playback/music runtime behavior
- no command execution

Report:
- files imported or created
- one-sentence summary of each file
- forbidden boundary check
```
