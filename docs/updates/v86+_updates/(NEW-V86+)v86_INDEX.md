# v86 Integration Index

## Purpose

Entry point for the Solar Plasma + Token Tier Foundations arc. Read this first; then the sub-arc packet for whichever sub-arc Bandit is being handed.

## Mission

Establish the design system the project will live on, and ship Solar Plasma as its first complete consumer. Token tier model + three new registries + asset bank schema land in v86a. Visual treatment, tile system, and inspector mini-graph land in parallel after a. Cosmetic polish lands last.

## Sub-Arc Order

```
v86a  Foundations             [keystone — must land first]
   ↓
   ├── v86b  Visual Treatment       ← parallel
   ├── v86c  Tile System            ← parallel
   └── v86d  Inspector Mini-Graph   ← parallel
   ↓
v86e  Cosmetic Polish          [final — depends on v86a + v86c]
```

## Documents in This Bundle

| Document | Purpose |
|---|---|
| `v86_ROADMAP.md` | Full multi-arc plan v86–v103 + polish |
| `v86_INDEX.md` | This file — entry point + handoff prompt |
| `v86a_FOUNDATION.md` | Phase packet — schema, tier model, registries, Solar Plasma chrome |
| `v86b_VISUAL_TREATMENT.md` | Phase packet — sphere uniforms, backdrop, overlay, dimming, edge plasma v1 |
| `v86c_TILE_SYSTEM.md` | Phase packet — per-section tear-off, snap, groups |
| `v86d_INSPECTOR_MINI_GRAPH.md` | Phase packet — scoped overrides + radial-as-graph |
| `v86e_COSMETIC_POLISH.md` | Phase packet — TopBar, footer, dock sections, fonts |
| `lumaweave_integration_audit.html` | Executive overview for human stakeholders |

## v86 Long-Term Contracts (Apply to Every Sub-Arc)

These are referenced from every packet's "Non-Negotiable Contracts" section.

1. **Three-tier token model.** Primitives → Semantics → Components. No tier skipping.
2. **Full theme declarations.** Every theme declares every canonical path. No inheritance until v88.
3. **Override scope specificity.** target > target-kind > cluster > global.
4. **Two-step canonical token landing.** Planned → values populated across all six themes → promoted to canonical and bound.
5. **Registry contract pattern.** `list / getById / filterByCategory / validateShape / register`.
6. **Asset / preset separation.** Native settings in theme; assets by id from bank.
7. **Solar Plasma is the reference theme.** New paths get thoughtful Solar Plasma values; other themes get neutral defaults until v87.

## Bandit Handoff Prompt

Use this prompt when handing each phase packet to Bandit. Substitute `{PACKET}` with the filename of the sub-arc being handed off.

```txt
Bandit, read and follow the attached Phase Architecture Packet: {PACKET}

This is part of the v86 arc. Before editing, restate:
1. current sub-arc (v86a, v86b, v86c, v86d, or v86e)
2. current permitted layer
3. forbidden later-phase work
4. critical contracts (especially the seven v86 long-term contracts in v86_INDEX.md)
5. validation ladder
6. stop conditions

Use:
Observe → Classify → Patch → Validate → Report

You may inspect broadly across the codebase, but only patch FIX NOW items in the current permitted layer.

Manual QA overrides code inspection.

No dead active controls. No active targets bound to planned-only token paths.

Run before declaring done:
npm run typecheck
npm run qa:e2e

If validation fails, follow the troubleshooting playbooks in the packet instead of patching blindly.

Final report must include:
1. summary
2. files inspected
3. files changed
4. issues fixed now
5. issues planned next sub-arc
6. issues documented only
7. validation results (typecheck + Playwright counts)
8. known limitations
9. recommended next sub-arc
10. any v86 long-term contracts violated and why
```

## Validation Across All Sub-Arcs

Required after every sub-arc completes:

```bash
npm run typecheck                               # zero errors
npm run qa:e2e                                  # all tests pass
node scripts/validate-contract-trace.mjs        # contract registry sound
node scripts/validate-system-index.mjs          # system index sound
```

Plus the sub-arc-specific manual QA listed in each packet's Validation Ladder section.

## Pre-Flight Checklist

Before starting v86a, confirm:

- [ ] `npm run typecheck` is green on current trunk
- [ ] `npm run qa:e2e` is green on current trunk (44 tests across `app-smoke_spec.ts`, `theme-override-storage_spec.ts`, `theme-target-inspector_spec.ts`, etc.)
- [ ] No uncommitted changes in `/src` or `/tests`
- [ ] `lumaweave_integration_audit.html` has been read by the operator
- [ ] `v86_ROADMAP.md` has been read by the operator
- [ ] The four open decisions from the audit are answered:
  - Q1: registry-driven, standardize project-wide ✓
  - Q2: wrap Sigma camera, don't replace ✓
  - Q3: inspector mini-graph (radial-as-graph), 4 spokes in v86d ✓
  - Q4: preset drives fine-grained, "custom" auto-set on knob change ✓

## Cross-Reference

Each finding in the executive HTML report (`lumaweave_integration_audit.html`) is tagged with the sub-arc that owns it. Use the report as the human-readable map; use these packets as the executable specs.

---

*Start with `v86a_FOUNDATION.md`.*
