---
id: contract.system.index.panel.mount
title: System Index Panel Mount Contract
type: contract
status: accepted
version: v72d
domain: control-plane
subdomain: contracts
cluster: blue
agent_readable: true
include_in_self_graph: true
last_updated: v73c
depends_on:
  - contract.system.index.registry
governs:
  - src/control-plane/system-index/SystemIndexPanel.tsx
tested_by:
  - tests/e2e/system-index.spec.ts
tags: [system, index, panel, mount, contract, accepted, v72d]
---

# System Index Panel Mount Contract

**Status:** Accepted — v72d (v72d.1 + v72d.2 + v72d.3)

Defines the passive mount of the SystemIndexPanel component. The panel is read-only — it displays the System Index Registry data with full evidence detail. No interactive editing.

## Core Rules
- Panel mounts with `data-testid="system-index-panel-shell"`
- Each entry renders with `data-testid="system-index-entry-{entry.id}"`
- Panel is passive — no controls that modify the registry
- All 16 seed entries must render with correct metadata
- Playwright proves all entries present and correct

## Discovery Sub-Passes
- v72d.1: Safe Mount Point Discovery — where does the panel live in AppShell?
- v72d.2: AppShell/Route Pattern Discovery — how does routing work for the panel?
- v72d.3: Passive Panel Mount + Playwright — the actual implementation

## Forbidden
- Interactive editing of registry entries via the panel
- Adding entries from the panel UI
- Runtime mutation of registry data from user interaction
