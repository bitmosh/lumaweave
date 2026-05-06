---
id: contract.command.deck.hotkey.registry
title: Command Deck and Hotkey Registry Contract
type: contract
status: accepted
version: v32
domain: control-plane
subdomain: contracts
cluster: blue
agent_readable: true
include_in_self_graph: true
last_updated: v73c
governs:
  - src/control-plane/commands/command-registry.ts
  - src/control-plane/command-deck/CommandDeckPanel.tsx
tags: [command, deck, hotkey, registry, contract, accepted, v32]
---

# Command Deck and Hotkey Registry Contract

**Status:** Accepted — v32

---

## Purpose

Define the governance for LumaWeave's Command Deck — the central registry for commands, hotkeys, and keyboard shortcuts. Ensures all commands are registered, documented, and traceable before they can be implemented.

---

## Core Rules

- All commands must be registered in `command-registry.ts` before implementation
- Each command: `{ id, label, hotkey, category, status, description }`
- Hotkeys must not conflict with OS-level shortcuts or browser defaults
- Dead controls (visible but non-functional) are not acceptable
- Command Deck Panel is read-only evidence display — commands execute elsewhere

## Banned Hotkeys

```
Ctrl+Alt+T    (terminal shortcut on Linux)
Ctrl+W        (browser tab close)
Ctrl+N        (new browser window)
Ctrl+S        (browser save — reserved for future LumaWeave save)
F5 / Ctrl+R   (browser refresh)
```

## Forbidden

- Adding hotkeys outside the registry
- Implementing commands that are not registered
- Silently conflicting hotkeys
- Using Command Deck as a runtime execution surface (it is a metadata display)
