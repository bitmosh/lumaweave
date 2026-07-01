---
id: system.lumaweave.polish-debt
title: LumaWeave Polish Debt
type: backlog
status: current
domain: overview
cluster: stone
agent_readable: true
include_in_self_graph: false
last_updated: 2026-06-30
references:
  - system.lumaweave.known-issues
  - system.lumaweave.roadmap
tags: [polish, debt, backlog]
---

# LumaWeave Polish Debt

This file contains non-defect cleanup work. Reproducible defects and quarantined tests live in [Known Issues](../KNOWN_ISSUES.md); product direction lives in the [Roadmap](../ROADMAP.md).

## Current

- Decide whether unused Three.js/R3F/Drei dependencies should remain as an explicit experiment or be removed until the 3D renderer begins.
- Finish source-adapter first-run guidance, validation copy, and registered/candidate presentation.
- Expand GWells controls from seed-only tuning toward a small macro layer over existing backend overrides.
- Decide whether theme-token governance should become a production boot assertion or remain validation-only.
- Continue replacing arc/version comments and test names with behavior-oriented language when touching those areas.
- Reduce dev-only global probes where tests can use stable public seams.
- Add maintained documentation link/reference validation.

## Rules

- Do not duplicate known issues here.
- Remove an item when completed; Git history preserves it.
- Add evidence or a concrete owner path for any item promoted to Known Issues.
- Do not use this file as a speculative feature inbox.
