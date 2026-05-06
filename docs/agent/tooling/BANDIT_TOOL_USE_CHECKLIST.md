---
id: tooling.tool.use.checklist
title: Bandit Tool Use Checklist
type: manual
status: accepted
version: v73c
domain: agent
subdomain: tooling
cluster: purple
agent_readable: true
include_in_self_graph: true
last_updated: v73c
tags: [tool, checklist, agent, MCP, tooling]
---

# Bandit Tool Use Checklist

Before using any tool, run through this checklist.

---

## Universal Pre-Tool Check

```
□ Can I answer this from the repo + accepted QA + operating docs alone?
  If yes → use the repo. Do not use a tool.

□ Is this a UI state question?
  If yes → Playwright MCP

□ Is this a library API question?
  If yes → Context7 MCP

□ Is this a complex planning question?
  If yes → Sequential Thinking MCP

□ Is this a file content question while terminal is locked?
  If yes → Filesystem MCP (if available)
```

---

## Playwright MCP Checklist

```
□ The question is about what's actually on the page (not what should be)
□ The app is running on localhost
□ I am not just guessing at the selector — I need evidence
□ I will cite the Playwright result in my report
□ I will not skip writing the actual Playwright spec after using MCP for development
```

---

## Context7 MCP Checklist

```
□ I have a specific library API question
□ I am not trying to use Context7 to answer a project-specific question
□ If Context7 conflicts with accepted QA or repo code, I will stop and report
□ I will cite Context7 findings explicitly if they inform a code decision
```

---

## When NOT to Use Tools

```
- When editing obvious docs with no library questions
- When following an accepted protocol step by step
- When the repo already contains the needed source of truth
- When terminal is not locked and direct inspection is faster
- When a tool result would not change the decision I need to make
```

---

## Tool Result Citations

If a tool result informs a decision, say so explicitly:

```
"Per Playwright MCP inspection, the element with data-testid='system-index-panel-shell'
is present in the DOM at the expected location."

"Per Context7 MCP, Sigma's setNodeAttribute() requires the graph to be initialized
before being called — the error is a lifecycle ordering issue, not a missing attribute."
```

Do not cite tool results that you didn't actually use.
