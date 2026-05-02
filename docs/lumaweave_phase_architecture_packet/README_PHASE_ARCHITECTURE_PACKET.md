# Phase Architecture Packet

Reusable Bandit phase-development framework for LumaWeave.

Use this packet when a task is too large for a one-off prompt but still needs controlled execution.

## Core Principle

**Broad context. Narrow permissions.**

Bandit may inspect broadly, reason across the phase, and build a map of the system, but it should only patch the current permitted layer.

## Files in This Packet

- `00_BANDIT_DEVELOPMENT_PROTOCOL.md`
- `01_PHASE_PACKET_TEMPLATE.md`
- `02_VALIDATION_LADDER.md`
- `03_TROUBLESHOOTING_PLAYBOOKS.md`
- `04_RESEARCH_AND_MCP_TOOL_POLICY.md`
- `05_PLAYWRIGHT_SPEC_BACKLOG_POLICY.md`
- `06_ARCHITECTURE_LAYERING_MODEL.md`
- `10_BASELINE_B_GRAPH_VISUAL_SYSTEM_PHASE_PACKET.md`
- `11_GRAPH_VISUAL_POLICY_WIRING_PLAN.md`
- `12_QA_AND_TESTING_PHASE_PACKET.md`
- `13_THEME_CUSTOMIZATION_SCAFFOLDING_PLAN.md`
- `99_BANDIT_PHASE_PACKET_PROMPT.md`

## Recommended Placement

```bash
cd ~/Projects/lumaweave
mkdir -p docs/bandit-phase-architecture
unzip lumaweave_phase_architecture_packet.zip -d docs/bandit-phase-architecture
```
