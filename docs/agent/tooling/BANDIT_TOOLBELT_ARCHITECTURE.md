---
id: tooling.bandit.toolbelt.architecture
title: Bandit Toolbelt Architecture
type: manual
status: accepted
domain: agent
subdomain: tooling
cluster: purple
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
tags:
  - toolbelt
  - MCP
  - tools
  - architecture
  - agent
last_pass: vP-Forensics-2
---

# Bandit Toolbelt Architecture

Defines the MCP tool suite available to Bandit and the intended use of each tool.

---

## Core Principle

Tools should make Bandit more evidence-driven, not more chaotic.

Use tools for:
- Inspecting before guessing
- Consulting current docs before relying on stale assumptions
- Classifying failures before patching
- Proving behavior with durable evidence

Tools do not replace:
- QA/advisory lockstep discipline
- Playwright evidence requirement
- No-skip rule
- User-run validation when terminal is locked

---

## Available Tools

### Playwright MCP
**Purpose:** UI evidence. Inspect the running app in a browser.

Use for:
- Verifying what's actually on the page
- Testing selectors and locators
- Confirming UI state (dropdown, badge, report key, advisory)
- Capturing console errors
- Proving that a Playwright spec would pass before writing it

Do not use for:
- Replacing Playwright test suite (MCP is for development, `npm run qa:e2e` is for evidence)
- Inspecting non-localhost URLs without explicit user authorization

### Context7 MCP
**Purpose:** External library documentation.

Use for:
- Playwright API questions
- React hooks / lifecycle behavior
- Vite / Tauri configuration
- Sigma / Graphology API
- Any "I'm not sure how this library works" moment

Do not use for:
- Project-specific decisions (project truth comes from repo + accepted QA + operating docs)
- Overriding accepted contracts

### Sequential Thinking MCP
**Purpose:** Complex planning and classification.

Use for:
- Multi-system failure classification
- Pass transition planning
- Choosing between two architecture-safe approaches
- Breaking down a large task into safe sub-passes

Do not use for:
- Treating its output as validation evidence
- Replacing the Diagnostic Router

### Filesystem MCP (if available)
**Purpose:** File inspection without terminal.

Use for:
- Reading source files when terminal is locked
- Verifying file contents before editing
- Checking that a file exists at an expected path

---

## Tool Priority Order

```
1. Read from repo (source of truth) before using any tool
2. Use Playwright MCP for UI evidence
3. Use Context7 for external API questions
4. Use Sequential Thinking for complex planning
5. Use Filesystem for file inspection when terminal is locked
```

---

## Tool Policy

```
Playwright MCP     = UI evidence
Context7 MCP       = external library truth
Sequential Thinking = planning aid
Filesystem MCP     = file inspection
Repo + accepted QA = project truth
```

Never treat MCP tool output as project truth. It is evidence to inform decisions, not to override them.
