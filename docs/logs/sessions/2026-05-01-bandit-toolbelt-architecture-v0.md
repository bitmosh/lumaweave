# Session Log: Bandit Toolbelt Architecture v0

## Goal
Design the Bandit Toolbelt for LumaWeave: a curated set of MCP servers, skills, workflows, permissions, and safety gates that make future development faster without compromising the repo.

## Files Created
- `docs/tooling/BANDIT_TOOLBELT_ARCHITECTURE.md` - Main architecture document with tiered approach
- `docs/tooling/MCP_SERVER_CANDIDATES.md` - Evaluation of MCP servers by category
- `docs/tooling/CUSTOM_SKILLS_AND_WORKFLOWS.md` - 10 LumaWeave-specific skills and 10 workflows
- `docs/tooling/TOOL_PERMISSION_POLICY.md` - Permission tiers and safety requirements
- `docs/tooling/BANDIT_TOOL_USE_CHECKLIST.md` - Checklist for safe tool use

## What Changed

### BANDIT_TOOLBELT_ARCHITECTURE.md
Created comprehensive architecture document with:
- **MCP Tiers**: Tier 1 (5 tools), Tier 2 (5 tools), Tier 3 (7 risky tools)
- **Permission Tiers**: 8 permission tiers from read-only to deployment (never)
- **Installation Priority**: 1-Playwright, 2-Filesystem, 3-Git, 4-Sequential Thinking, 5-Context7
- **Never Install**: Unrestricted shell, unrestricted filesystem, deployment/cloud MCPs

### CUSTOM_SKILLS_AND_WORKFLOWS.md
Defined 10 LumaWeave-specific skills:
1. Large Bite Execution Skill
2. QA Contract Authoring Skill
3. No Dead Controls Audit Skill
4. Theme Runtime Integrity Skill
5. Mission Control UX Skill
6. Handleset Alignment Skill
7. Playwright Coverage Expansion Skill
8. Session Log / Handoff Skill
9. Graph Interaction Regression Skill
10. Advisory Proposal Skill

Defined 10 LumaWeave-specific workflows:
1. Glitter Tsunami Workflow
2. Focused Bugfix Workflow
3. QA Checklist Activation Workflow
4. Contract Registry Update Workflow
5. Theme Preset Addition Workflow
6. Mission Control Upgrade Workflow
7. Graph Renderer Safe Patch Workflow
8. Documentation Sync Workflow
9. Playwright Regression Workflow
10. New Conversation Migration Workflow

### TOOL_PERMISSION_POLICY.md
Updated with:
- **8 Permission Tiers**: read-only, repo-write, test-runner, browser-localhost, network-docs-only, network-general, destructive-git, deployment
- **Safety Requirements**: Explicitly addressed 8 MCP security risks including prompt injection, unsafe filesystem scope, unsafe shell execution, secrets exposure, accidental destructive git commands, stale docs, over-trust generated proposals, fake validation claims

## Validation
- All documents created in correct locations
- All documents follow tiered approach structure
- All documents reference each other appropriately
- No implementation code created (documentation-only task)
- Typecheck not run (no source files changed)

## Issues
None

## Decision
Bandit Toolbelt Architecture v0 design is complete with tiered approach, permission tiers, 10 LumaWeave-specific skills, 10 workflows, and explicit safety requirements.

## Next Step
Phase 0 implementation: Install Tier 1 MCP servers (Playwright, Filesystem, Git, Sequential Thinking, Context7) and implement LumaWeave-specific skills. This requires user approval before proceeding with actual installation and implementation.
