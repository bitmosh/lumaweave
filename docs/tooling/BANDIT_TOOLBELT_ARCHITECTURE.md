# Bandit Toolbelt Architecture v0

## Mission

Create a practical tooling architecture for Bandit that accelerates LumaWeave development while maintaining safety, evidence tracking, and repo integrity.

## Core Principles

1. **Safety First**: No tool should be able to modify the repo without explicit permission and evidence tracking
2. **Evidence Required**: Every tool use must produce a traceable log of what was done and why
3. **Repo Boundary**: Tools must be constrained to the LumaWeave workspace unless explicitly authorized
4. **Validation Gates**: All code changes must pass typecheck, Playwright, and QA checks before completion
5. **Incremental Expansion**: Start with minimal safe tools, expand based on proven need
6. **Skill Abstraction**: Custom skills should encapsulate complex multi-step operations
7. **Workflow Reusability**: Common development patterns should be captured as workflows

## MCP Tiers

### Tier 1 — Install First / High Confidence

**Likely candidates:**
- **filesystem MCP** (repo-scoped to `/home/boop/Projects/lumaweave`)
- **git MCP** (local repo only, read-write with approval)
- **Playwright MCP** (localhost only)
- **sequential-thinking MCP**
- **Context7 or equivalent docs MCP** (local docs lookup)

**Installation priority:**
1. Playwright MCP
2. Filesystem MCP (scoped to LumaWeave)
3. Git MCP (read-only/local)
4. Sequential Thinking MCP
5. Context7 docs MCP

### Tier 2 — Install After Tier 1 Works

**Likely candidates:**
- **GitHub MCP** (read-only)
- **fetch/web MCP** (with citation discipline)
- **memory MCP**
- **SQLite MCP** (if relevant later)
- **AST/code-map tooling** (if available)

**Installation priority:**
6. GitHub MCP (read-only)
7. Fetch/web MCP (with citation discipline)
8. Memory MCP
9. AST/code-map tooling

### Tier 3 — Parked / Risky / Later

**Likely candidates:**
- **unrestricted shell MCP**
- **unrestricted filesystem MCP**
- **production database MCP**
- **deployment/cloud provider MCP**
- **browser automation against arbitrary sites**
- **tools that execute remote code**
- **tools with unclear maintenance/security**

**Never install:**
- Unrestricted shell MCP (too dangerous)
- Unrestricted filesystem MCP (safety risk)
- Deployment/cloud MCPs (not needed for local development)
- Database write MCPs (not needed)
- Tools that can access secrets
- Tools that can browse/write outside repo scope

## Permission Tiers

### Permission Tier Definitions

1. **read-only**: Can read files in allowed paths, no writes
2. **repo-write**: Can write to src/docs/tests in LumaWeave only
3. **test-runner**: Can run npm test commands, Playwright
4. **browser-localhost**: Can automate localhost browser only
5. **network-docs-only**: Can fetch from documentation domains only
6. **network-general**: Can fetch from broader allowlist (Tier 2)
7. **destructive-git**: Can run git reset/rebase (requires explicit approval)
8. **deployment**: Can deploy to production (never for Bandit)

### Permission Tier Rules

- **Default to read-only**: All tools start at read-only tier
- **Repo writes must be limited to LumaWeave**: No writes outside workspace
- **Browser automation should default to localhost**: No external URLs
- **Git push/deploy/destructive reset should require explicit human approval**: Always
- **Any new MCP server must have**:
  - purpose
  - allowed scope
  - blocked actions
  - evidence it provides
  - failure mode
  - rollback plan

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Bandit Agent                             │
│  (Planning, reasoning, coordination, safety gate enforcement)   │
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬────────────┐
        │            │            │            │
┌───────▼──────┐ ┌──▼──────────┐ ┌▼──────────┐ ┌▼──────────────┐
│ MCP Servers   │ │   Skills    │ │ Workflows │ │  Permission   │
│ (Tool access) │ │ (Abstraction)│ │ (Patterns) │ │   Policy      │
└───────────────┘ └─────────────┘ └───────────┘ └───────────────┘
        │
        ├─ Filesystem (read/write)
        ├─ Git (read, limited write)
        ├─ Playwright (browser automation)
        ├─ Sequential Thinking (planning)
        ├─ Documentation (lookup)
        ├─ Web Fetch (research, rate-limited)
        ├─ AST/Code Intelligence (analysis)
        └─ Shell (safe commands only)
```

## The 10 Questions Answered

### 1. Which MCP servers should be installed first?

**Phase 1 (Immediate - v0):**
- **Filesystem MCP** - Read/write access to `/home/boop/Projects/lumaweave`
- **Sequential Thinking MCP** - For complex planning and reasoning
- **Playwright MCP** - For browser automation and E2E testing

**Phase 2 (Near-term - v1):**
- **Git MCP** - Read-only git operations, limited write with approval
- **Documentation MCP** - Local docs lookup (Markdown files in `/docs`)
- **AST/Code Intelligence MCP** - For code analysis and refactoring

**Phase 3 (Future - v2+):**
- **Web Fetch MCP** - Rate-limited research (with allowlist)
- **Memory MCP** - For project knowledge persistence
- **Shell MCP** - Safe command execution (allowlist only)

### 2. What should each one be allowed to do?

**Filesystem MCP:**
- **Read**: All files in `/home/boop/Projects/lumaweave`
- **Write**: Only in `/home/boop/Projects/lumaweave/src`, `/docs`, `/tests`
- **Delete**: Require explicit approval, restricted to generated files only
- **Create**: Allowed in src, docs, tests directories
- **Forbidden**: System files outside workspace, package manager files without approval

**Sequential Thinking MCP:**
- Unlimited use for planning and reasoning
- Must produce structured output (thought, nextThoughtNeeded, thoughtNumber, totalThoughts)
- Used for all complex multi-step tasks

**Playwright MCP:**
- Browser automation for testing
- Allowed to take screenshots, navigate, click, type
- Forbidden from accessing external URLs (except localhost dev server)
- Must use `data-testid` selectors for stability

**Git MCP (Phase 2):**
- **Read**: All git operations (status, log, diff, show)
- **Write**: Only `git add` and `git commit` with approval
- **Forbidden**: `git push`, `git rebase`, `git reset --hard`

**Documentation MCP (Phase 2):**
- **Read**: All files in `/docs`
- **Write**: Only in `/docs/logs/sessions/`, `/docs/tooling/`
- **Forbidden**: Modifying core docs without approval

**AST/Code Intelligence MCP (Phase 2):**
- **Read**: All source files for analysis
- **Write**: Forbidden (use Filesystem MCP for writes)
- **Allowed**: Symbol extraction, dependency analysis, refactoring suggestions

**Web Fetch MCP (Phase 3):**
- **Read**: Only from allowlisted domains (npmjs.com, github.com, mdn.io)
- **Forbidden**: Arbitrary web access
- **Rate limit**: 10 requests per session

**Memory MCP (Phase 3):**
- **Read/Write**: Project-specific memory store
- **Allowed**: Storing/retrieving project patterns, decisions, context
- **Forbidden**: Cross-project memory sharing

**Shell MCP (Phase 3):**
- **Allowed**: `npm run typecheck`, `npm run qa:e2e`, `npx playwright install`
- **Allowed**: Safe git commands via Git MCP
- **Forbidden**: `rm -rf`, `sudo`, package manager installs without approval

### 3. Which ones should be read-only?

**Read-Only by Default:**
- Git MCP (Phase 2) - Read-only until explicit write approval
- Documentation MCP (Phase 2) - Read-only core docs, writable logs
- AST/Code Intelligence MCP (Phase 2) - Analysis only, no writes
- Web Fetch MCP (Phase 3) - Read-only external access

**Write-Allowed with Constraints:**
- Filesystem MCP - Writes allowed in specific directories
- Sequential Thinking MCP - No file writes (internal state only)
- Memory MCP (Phase 3) - Read/write to memory store

### 4. Which ones are too risky for now?

**Too Risky for v0-v1:**
- **GitHub MCP** - No remote repo access, push/pull forbidden
- **Shell MCP** - Too dangerous, command execution too broad
- **Web Fetch MCP** - Uncontrolled external access risk
- **Database MCP** - No local database needed yet
- **Design-system/Figma MCP** - No Figma integration yet
- **Arbitrary code execution MCP** - Never allow

**Risky but Acceptable with Strict Controls:**
- Git MCP (write operations) - Requires approval
- Filesystem MCP (delete operations) - Requires approval
- Shell MCP (allowlist only) - Phase 3 only

### 5. Which custom skills should exist for LumaWeave?

**Phase 1 Skills (v0):**
- **LumaWeave File Navigator** - Smart file finding with project awareness
- **TypeScript Validator** - Runs typecheck and interprets errors
- **Playwright Test Runner** - Runs E2E tests and interprets failures
- **Component Locator** - Finds React components by feature/role

**Phase 2 Skills (v1):**
- **LumaWeave Graph Analyzer** - Understands graph rendering pipeline
- **Theme System Expert** - Knows theme tokens and Solar Plasma grammar
- **QA Checklist Runner** - Navigates and validates QA checklists
- **Control Surface Auditor** - Validates control contracts

**Phase 3 Skills (v2+):**
- **LumaWeave Refactoring Assistant** - Safe refactoring patterns
- **Feature Slice Planner** - Breaks down features into slices
- **Bug Trace Investigator** - Follows signal paths in code
- **Documentation Generator** - Auto-generates docs from code

### 6. Which workflows should exist for repeated development passes?

**Core Workflows:**
- **New Feature Slice** - Creates feature branch, implements slice, validates, commits
- **Bug Fix Loop** - Reproduces bug, traces signal, applies fix, validates
- **QA Cycle** - Runs checklist, documents results, updates coverage
- **Playwright Test Add** - Adds test, validates selector, runs suite
- **Documentation Update** - Updates relevant docs, validates links

**Phase 1 Workflows (v0):**
- `new-feature-slice` - Standard feature implementation
- `typecheck-fix-loop` - Iterative type error resolution
- `playwright-test-add` - Add E2E test for new feature
- `session-log-create` - Create session log after work

**Phase 2 Workflows (v1):**
- `control-surface-audit` - Audit control contracts
- `theme-validation` - Validate theme changes across all themes
- `qa-checklist-update` - Add new QA checks to registry
- `graph-rendering-debug` - Debug graph rendering issues

**Phase 3 Workflows (v2+):**
- `safe-refactor` - Multi-file refactoring with validation
- `dependency-update` - Update dependencies with safety checks
- `performance-audit` - Audit performance bottlenecks
- `accessibility-audit` - Audit accessibility compliance

### 7. How should QA/Playwright/typecheck validation be enforced?

**Enforcement Points:**

1. **Before File Writes** - Typecheck must pass for TypeScript files
2. **After File Writes** - Typecheck must pass before proceeding
3. **Before Commit** - Playwright tests must pass (if applicable)
4. **After Workflow Completion** - Full validation suite
5. **Before Slice Marked Complete** - All relevant checks must pass

**Validation Gates:**

```typescript
interface ValidationGate {
  typecheck: {
    required: true;
    autoRun: true;
    blockOnFail: true;
  };
  playwright: {
    required: "if-applicable"; // Only if tests exist
    autoRun: true;
    blockOnFail: true;
  };
  qaChecklist: {
    required: "if-qa-workflow";
    autoRun: false; // Manual QA
    blockOnFail: true;
  };
}
```

**Failure Handling:**
- Typecheck failure: Auto-fix simple errors, block on complex errors
- Playwright failure: Show screenshot + error context, block on regression
- QA failure: Show missing checks, allow manual override with reason

### 8. How should we prevent Bandit from using tools outside the LumaWeave repo?

**Path Constraints:**

```typescript
const ALLOWED_PATHS = {
  read: [
    "/home/boop/Projects/lumaweave/**/*",
    "/home/boop/Projects/lumaweave",
  ],
  write: [
    "/home/boop/Projects/lumaweave/src/**/*",
    "/home/boop/Projects/lumaweave/docs/**/*",
    "/home/boop/Projects/lumaweave/tests/**/*",
  ],
  delete: [
    "/home/boop/Projects/lumaweave/src/**/*.{generated,temp}",
    "/home/boop/Projects/lumaweave/docs/logs/**/*",
  ],
  forbidden: [
    "/home/boop/.config/**/*",
    "/home/boop/.ssh/**/*",
    "/home/boop/.npm/**/*",
    "/etc/**/*",
    "/usr/**/*",
    "/home/boop/Projects/ai-lab/**/*", // Other projects
  ],
};
```

**Command Constraints (Shell MCP):**
- Allowlist: `npm run typecheck`, `npm run qa:e2e`, `npx playwright install`
- Blocklist: `rm -rf`, `sudo`, `apt`, `yum`, `brew`, `pip install`
- Git commands: Only via Git MCP, not Shell MCP

**URL Constraints (Web Fetch MCP):**
- Allowlist: `https://www.npmjs.com/**`, `https://github.com/**`, `https://developer.mozilla.org/**`
- Blocklist: All other URLs
- Rate limit: 10 requests per session

**Git Constraints (Git MCP):**
- Allowed: `git status`, `git log`, `git diff`, `git show`, `git add`, `git commit`
- Forbidden: `git push`, `git pull`, `git rebase`, `git reset --hard`, `git remote`

### 9. How should Bandit report tool usage and evidence?

**Tool Usage Log Structure:**

```typescript
interface ToolUsageLog {
  sessionId: string;
  timestamp: string;
  tool: {
    name: string;
    type: "mcp" | "skill" | "workflow";
  };
  operation: {
    type: string;
    parameters: Record<string, unknown>;
    result: unknown;
  };
  evidence: {
    filesRead: string[];
    filesWritten: string[];
    filesDeleted: string[];
    commandsRun: string[];
    urlsAccessed: string[];
  };
  safety: {
    permissionGranted: boolean;
    approvalRequired: boolean;
    approvedBy: "auto" | "user";
  };
  outcome: "success" | "failure" | "blocked";
}
```

**Evidence Artifacts:**
- Every file write produces a diff
- Every Playwright run produces screenshots
- Every typecheck produces error log
- Every git operation produces commit message
- Session logs aggregate all evidence

**Reporting Format:**
- Session log: `/docs/logs/sessions/{date}-{task}.md`
- Tool usage: Embedded in session log
- Diff artifacts: Stored in session log or referenced
- Screenshots: Stored in session directory

### 10. What should be installed now vs parked for later?

**Install Now (v0):**
- Filesystem MCP (read/write with constraints)
- Sequential Thinking MCP (planning)
- Playwright MCP (browser automation)
- Skills: LumaWeave File Navigator, TypeScript Validator, Playwright Test Runner
- Workflows: new-feature-slice, typecheck-fix-loop, playwright-test-add, session-log-create
- Permission policy: Path constraints, validation gates

**Install Soon (v1):**
- Git MCP (read-only, limited write)
- Documentation MCP (read-only core docs)
- AST/Code Intelligence MCP (analysis)
- Skills: LumaWeave Graph Analyzer, Theme System Expert, QA Checklist Runner, Control Surface Auditor
- Workflows: control-surface-audit, theme-validation, qa-checklist-update, graph-rendering-debug

**Park for Later (v2+):**
- Web Fetch MCP (rate-limited, allowlist)
- Memory MCP (project knowledge)
- Shell MCP (allowlist only)
- Skills: LumaWeave Refactoring Assistant, Feature Slice Planner, Bug Trace Investigator, Documentation Generator
- Workflows: safe-refactor, dependency-update, performance-audit, accessibility-audit

**Never Install:**
- GitHub MCP (remote access risk)
- Database MCP (not needed)
- Design-system/Figma MCP (not needed)
- Arbitrary code execution MCP (unsafe)

## Installation Roadmap

### Phase 0: Foundation (Current)
- Document architecture
- Define permission policy
- Create MCP server candidates list
- Define custom skills and workflows

### Phase 1: v0 Implementation
- Install Filesystem MCP with path constraints
- Install Sequential Thinking MCP
- Install Playwright MCP with URL constraints
- Implement Phase 1 skills
- Implement Phase 1 workflows
- Create tool use checklist
- Validate with test session

### Phase 2: v1 Expansion
- Install Git MCP with write approval
- Install Documentation MCP
- Install AST/Code Intelligence MCP
- Implement Phase 2 skills
- Implement Phase 2 workflows
- Update permission policy
- Validate with real development tasks

### Phase 3: v2+ Future
- Install Web Fetch MCP with allowlist
- Install Memory MCP
- Install Shell MCP with allowlist
- Implement Phase 3 skills
- Implement Phase 3 workflows
- Continuous validation and refinement

## Safety Summary

- **No remote repo access**: GitHub MCP not installed
- **No arbitrary shell commands**: Shell MCP parked for v2+
- **No uncontrolled web access**: Web Fetch MCP with allowlist
- **Path constraints enforced**: All file operations constrained to workspace
- **Validation gates required**: Typecheck and Playwright must pass
- **Evidence tracking mandatory**: All tool use logged
- **Approval workflow**: Write operations require explicit approval
- **Read-only default**: Most MCPs read-only until write approval
