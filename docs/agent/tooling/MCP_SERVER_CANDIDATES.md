---
id: tooling.mcp.server.candidates
title: MCP Server Candidates
type: manual
status: accepted
version: v73c
domain: agent
subdomain: tooling
cluster: purple
agent_readable: true
include_in_self_graph: true
last_updated: v73c
tags: [MCP, servers, candidates, tooling]
---

# MCP Server Candidates

Candidate MCP servers for the Bandit toolbelt. Servers are listed with priority and use case.

---

## Currently Used / Confirmed Available

```
Playwright MCP      Priority: P0 — core evidence tool
  Use: UI inspection, selector verification, console errors

Context7 MCP        Priority: P0 — external library docs
  Use: React, Vite, Tauri, Sigma, Graphology, Playwright APIs

Sequential Thinking Priority: P0 — complex planning
  Use: Multi-system failure classification, pass transition planning
```

---

## High-Priority Candidates

```
Filesystem MCP      Priority: P1 — file inspection when terminal locked
  Use: Reading source files, verifying paths, checking file existence
  Risk: Must be path-constrained to /home/boop/Projects/lumaweave

GitHub MCP          Priority: P1 — repo history and PR context
  Use: git log queries, commit context, PR descriptions
  Risk: Read-only access only — no push/commit permissions

Browser MCP         Priority: P2 — external documentation lookup
  Use: MDN, Tauri docs, Sigma docs when Context7 is insufficient
  Risk: External network access — use with caution
```

---

## Future Candidates

```
LumaWeave Registry MCP    Read registry state without terminal
                           Query system index, mode registry, QA registry

Source Adapter MCP         When source adapter OS is live — query adapter state
                           Test ingestion without terminal

Graph Query MCP            Query Graphology graph state
                           Verify node/edge counts, attribute values
```

---

## Server Selection Criteria

A new MCP server is worth adding when:
- It provides evidence not available from the repo alone
- It reduces the number of times the user needs to run commands manually
- Its risk surface is well-understood and can be bounded by a permission policy
- It has been approved by the user

A server should NOT be added when:
- It provides write/mutation access to the repo (terminal is locked for a reason)
- Its output would be treated as project truth (all tools are evidence, not authority)
- It requires external network access to sensitive services
