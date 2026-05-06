---
id: manual.tool.use.triggers
title: Tool Use Triggers
type: manual
status: accepted
version: v73c
domain: survival-manual
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: v73c
tags: [tools, playwright, context7, sequential-thinking, survival]
---

# Tool Use Triggers

Use tools deliberately. Tools are evidence instruments, not decoration.

---

## Playwright MCP

Use when the issue is observable in the browser.

Best for:
- Selector failures
- Mission Control UI state verification
- Dropdown / header / report identity confirmation
- Controls visible and clickable
- Form reset / persistence behavior
- Console errors
- Graph visible after changes

Use Playwright to answer:
```
What is actually on the page?
What does the accessibility tree say?
What selector should tests use?
What console error occurred?
Did the user-visible behavior happen?
```

Rules:
- Use for localhost app inspection only
- Prefer Playwright evidence over visual guesses
- Do not claim Playwright worked unless actually used

---

## Context7 MCP

Use when unsure about external library / API behavior.

Best for:
- Playwright locator patterns
- React state / effect behavior
- Vite / Tauri config uncertainty
- Sigma / Graphology API uncertainty
- Tailwind / CSS behavior

Trigger phrases:
```
I am unsure how this library API works.
I am guessing at a Playwright locator pattern.
I do not know whether Sigma supports this setting.
This external error message is unfamiliar.
```

Rules:
- Context7 is library truth, not project truth
- Project source of truth remains: repo code + accepted QA + operating docs
- If Context7 conflicts with project code or accepted QA, stop and report

---

## Sequential Thinking MCP

Use for complex transitions and multi-system classification.

Best for:
- Pass transition planning
- Deciding whether tests are obsolete or still valid
- Multi-layer bugs involving QA registry + UI + localStorage + reports
- Choosing between two architecture-safe fixes

Rules:
- Use for planning / classification
- Do not treat it as validation proof
- Keep traces short

---

## No Tool Needed

Use no tool when:
- Editing obvious docs
- Applying a known local patch
- Following an accepted protocol
- The repo already contains the needed source of truth

---

## Tool Policy

```
Playwright          = UI evidence
Context7            = external docs evidence
Sequential Thinking = planning aid
Repo code + accepted QA + operating docs = project truth
```
