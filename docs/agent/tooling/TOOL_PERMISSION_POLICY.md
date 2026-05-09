---
id: tooling.tool.permission.policy
title: Tool Permission Policy
type: policy
status: accepted
domain: agent
subdomain: tooling
cluster: purple
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
tags:
  - tool
  - permission
  - policy
  - constraints
  - tooling
last_pass: vP-Forensics-2
---

# Tool Permission Policy

Defines what tools may and may not do when used by Bandit or any agent.

---

## Path Constraints

All file-reading tools are constrained to:
```
/home/boop/Projects/lumaweave
```

Forbidden paths:
```
/home/boop/Projects          ← parent directory
/home/boop                   ← home directory
/etc, /var, /usr, /sys       ← system paths
Any path outside the repo    ← unconditionally forbidden
```

If a tool attempts to access a path outside the repo root, stop and report. Do not proceed.

---

## Write Constraints

In Locked Terminal Mode:
- No tool may write to the filesystem
- No tool may execute commands
- No tool may commit or push to git

If terminal privileges are explicitly granted:
- Write only within `/home/boop/Projects/lumaweave`
- No writes to parent directory
- No git push without explicit user instruction

---

## Network Constraints

Tools that access external networks:
- Must be explicitly authorized for the specific URL domain
- Must not transmit project source code to external services
- Must not transmit secrets, tokens, or credentials
- Must not load executable content from external sources

Playwright MCP:
- localhost only by default
- External URLs require explicit user authorization

---

## Output Constraints

Tool output must not be:
- Treated as project truth (all tools are evidence, not authority)
- Used to override accepted contracts or QA evidence
- Cited without actually having been used

---

## Escalation

If a tool requires permissions beyond this policy:
1. Stop the current task
2. Report what additional permission is needed and why
3. Wait for user decision
4. Do not attempt to work around the constraint
