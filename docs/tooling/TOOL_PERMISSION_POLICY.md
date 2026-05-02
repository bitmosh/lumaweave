# Tool Permission Policy v0

## Overview

This document defines the permission policy for Bandit tool usage. All MCP servers, skills, and workflows must adhere to these constraints to ensure safety, evidence tracking, and repo integrity.

## Permission Tiers

### Tier Definitions

1. **read-only**: Can read files in allowed paths, no writes
   - Allowed: All files in `/home/boop/Projects/lumaweave`
   - Forbidden: Any write operations
   - Approval: Not required
   - Evidence: Log file path and read timestamp

2. **repo-write**: Can write to src/docs/tests in LumaWeave only
   - Allowed: Write to `/home/boop/Projects/lumaweave/src/**/*`, `/docs/**/*`, `/tests/**/*`
   - Forbidden: Writes outside workspace, writes to node_modules, writes to .git
   - Approval: Required for new files and configuration files
   - Evidence: Log file path, diff, and write timestamp

3. **test-runner**: Can run npm test commands, Playwright
   - Allowed: `npm run typecheck`, `npm run qa:e2e`, `npx playwright install`
   - Forbidden: Any other npm commands, package installs
   - Approval: Required for all commands
   - Evidence: Log command, output, and exit code

4. **browser-localhost**: Can automate localhost browser only
   - Allowed: URLs `http://localhost:*`, `http://127.0.0.1:*`
   - Forbidden: Any external URLs
   - Approval: Not required for standard operations
   - Evidence: Log URL, action, and screenshot on failure

5. **network-docs-only**: Can fetch from documentation domains only
   - Allowed: `https://developer.mozilla.org/**`, `https://www.typescriptlang.org/**`
   - Forbidden: All other domains
   - Rate limit: 10 requests per session
   - Approval: Not required for allowlisted domains
   - Evidence: Log URL, response status, and content summary

6. **network-general**: Can fetch from broader allowlist (Tier 2)
   - Allowed: `https://www.npmjs.com/**`, `https://github.com/**`, documentation domains
   - Forbidden: All other domains
   - Rate limit: 10 requests per session
   - Approval: Required for non-allowlisted domains
   - Evidence: Log URL, response status, and content summary

7. **destructive-git**: Can run git reset/rebase (requires explicit approval)
   - Allowed: `git reset --soft`, `git rebase` (with explicit approval)
   - Forbidden: `git push`, `git pull`, `git reset --hard`, `git remote`
   - Approval: Always required
   - Evidence: Log git command, diff, and approval reason

8. **deployment**: Can deploy to production (never for Bandit)
   - Allowed: None
   - Forbidden: All deployment operations
   - Approval: Never approved
   - Evidence: N/A

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

## Safety Requirements

### MCP Security Risks

#### Risk: Prompt Injection Through Tool Output
- **Mitigation**: Never execute code returned by tools, validate all tool output before use
- **Detection**: Log all tool output, flag suspicious patterns
- **Response**: Block operation, notify user

#### Risk: Unsafe Filesystem Scope
- **Mitigation**: Path constraints enforced at MCP level, validate all paths
- **Detection**: Log all file operations, flag paths outside allowed scope
- **Response**: Block operation, log violation

#### Risk: Unsafe Shell Execution
- **Mitigation**: Shell MCP parked for v2+, strict allowlist when installed
- **Detection**: Log all shell commands, flag commands not in allowlist
- **Response**: Block operation, log violation

#### Risk: Secrets Exposure
- **Mitigation**: Never allow access to `.ssh`, `.npm`, `.config`, environment files
- **Detection**: Log all file reads, flag access to sensitive paths
- **Response**: Block operation, log violation

#### Risk: Accidental Destructive Git Commands
- **Mitigation**: Git MCP blocks destructive commands, requires approval for write ops
- **Detection**: Log all git commands, flag destructive commands
- **Response**: Block operation, require explicit approval

#### Risk: Stale Docs
- **Mitigation**: Documentation MCP validates docs against implementation
- **Detection**: Regular audits, version control for docs
- **Response**: Update docs, flag discrepancies

#### Risk: Over-Trust Generated Proposals
- **Mitigation**: All proposals require explicit approval, no auto-implementation
- **Detection**: Log all proposals, require user review
- **Response**: Block auto-implementation, require approval

#### Risk: Fake Validation Claims
- **Mitigation**: Validation gates run actual commands, verify output
- **Detection**: Log validation commands and output, flag discrepancies
- **Response**: Re-run validation, block if fake claim detected

### Path Constraints

### Allowed Paths

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
    "/home/boop/Projects/lumaweave/.windsurf/**/*",
  ],
  delete: [
    "/home/boop/Projects/lumaweave/src/**/*.{generated,temp,cache}",
    "/home/boop/Projects/lumaweave/docs/logs/**/*",
    "/home/boop/Projects/lumaweave/tests/**/*.{generated,temp}",
    "/home/boop/Projects/lumaweave/node_modules/.cache/**/*",
  ],
};
```

### Forbidden Paths

```typescript
const FORBIDDEN_PATHS = [
  "/home/boop/.config/**/*",
  "/home/boop/.ssh/**/*",
  "/home/boop/.npm/**/*",
  "/home/boop/.local/**/*",
  "/etc/**/*",
  "/usr/**/*",
  "/var/**/*",
  "/home/boop/Projects/ai-lab/**/*", // Other projects
  "/home/boop/Projects/**/node_modules/**/*", // Don't touch node_modules
  "/home/boop/Projects/lumaweave/.git/**/*", // Git internals
];
```

### Special Path Rules

- **package.json**: Read-only, modifications require explicit approval
- **package-lock.json**: Read-only, never modify directly
- **tsconfig.json**: Read-only, modifications require explicit approval
- **.gitignore**: Read-only, modifications require explicit approval
- **node_modules/****: Forbidden, never read or write
- **.git/****: Forbidden, use Git MCP for git operations

## Operation Permissions

### Filesystem MCP

#### Read Operations
- **Permission**: Allowed for all files in ALLOWED_PATHS.read
- **Approval**: Not required
- **Evidence**: Log file path and read timestamp
- **Constraints**: Cannot read forbidden paths

#### Write Operations
- **Permission**: Allowed for files in ALLOWED_PATHS.write
- **Approval**: Required for:
  - New file creation
  - Existing file modification
  - Configuration file changes (package.json, tsconfig.json)
- **Evidence**: Log file path, diff, and write timestamp
- **Constraints**: Cannot write to forbidden paths

#### Delete Operations
- **Permission**: Allowed for files in ALLOWED_PATHS.delete
- **Approval**: Always required
- **Evidence**: Log file path, deletion reason, and timestamp
- **Constraints**: Cannot delete source files (*.ts, *.tsx, *.spec.ts) without explicit user override

#### Create Operations
- **Permission**: Allowed for files in ALLOWED_PATHS.write
- **Approval**: Required for:
  - New source files
  - New configuration files
- **Evidence**: Log file path, creation reason, and timestamp
- **Constraints**: Cannot create in forbidden paths

### Git MCP

#### Read Operations
- **Permission**: Allowed for all read operations
- **Approval**: Not required
- **Evidence**: Log git command and output
- **Allowed Commands**: `git status`, `git log`, `git diff`, `git show`, `git blame`

#### Write Operations
- **Permission**: Allowed with approval
- **Approval**: Required for:
  - `git add`
  - `git commit`
- **Evidence**: Log git command, diff, and commit message
- **Forbidden Commands**: `git push`, `git pull`, `git rebase`, `git reset --hard`, `git remote`

### Playwright MCP

#### Browser Operations
- **Permission**: Allowed for localhost URLs only
- **Approval**: Not required for standard operations
- **Evidence**: Log page URL, action, and screenshot on failure
- **Allowed URLs**: `http://localhost:*`, `http://127.0.0.1:*`
- **Forbidden URLs**: All external URLs

#### Page Operations
- **Permission**: Allowed for standard Playwright operations
- **Approval**: Not required
- **Evidence**: Log action, selector, and result
- **Allowed Actions**: navigate, click, type, fill, screenshot, snapshot
- **Forbidden Actions**: evaluate (unsafe JavaScript execution)

### Sequential Thinking MCP

#### Planning Operations
- **Permission**: Unlimited
- **Approval**: Not required
- **Evidence**: Log thought process and conclusion
- **Constraints**: None

### Fetch MCP (v2+)

#### Web Operations
- **Permission**: Allowed for allowlisted domains only
- **Approval**: Not required for allowlisted domains
- **Evidence**: Log URL, response status, and content summary
- **Allowlisted Domains**:
  - `https://www.npmjs.com/**`
  - `https://github.com/**`
  - `https://developer.mozilla.org/**`
  - `https://www.typescriptlang.org/**`
- **Rate Limit**: 10 requests per session
- **Forbidden Domains**: All other domains

### Shell MCP (v2+)

#### Command Execution
- **Permission**: Allowed for allowlisted commands only
- **Approval**: Required for all commands
- **Evidence**: Log command, output, and exit code
- **Allowlisted Commands**:
  - `npm run typecheck`
  - `npm run qa:e2e`
  - `npx playwright install`
  - `npx tsc --noEmit`
- **Forbidden Commands**:
  - `rm -rf`
  - `sudo`
  - `apt`, `yum`, `brew` (package managers)
  - `pip install`, `npm install` (package installs)
  - Any command with `>`, `>>`, pipe to system files

## Approval Workflow

### Approval Levels

1. **Auto-Approved**: Operations that are safe and don't require user approval
   - Read operations in allowed paths
   - Sequential thinking operations
   - Standard Playwright operations on localhost

2. **Soft Approval**: Operations that require user confirmation but can be auto-approved with confidence
   - Write operations to non-configuration files
   - Git add operations
   - Shell commands in allowlist

3. **Hard Approval**: Operations that always require explicit user approval
   - Delete operations
   - Configuration file changes
   - Git commit operations
   - Shell commands not in allowlist

### Approval Process

```
User Request
    ↓
Bandit Plans Operation
    ↓
Check Permission Policy
    ↓
Is Operation Allowed?
    ├─ No → Block with reason
    └─ Yes → Continue
        ↓
Is Approval Required?
    ├─ No → Execute
    └─ Yes → Request Approval
        ├─ Approved → Execute
        └─ Denied → Block
```

### Approval Request Format

```typescript
interface ApprovalRequest {
  operation: string;
  tool: string;
  parameters: Record<string, unknown>;
  risk: "low" | "medium" | "high";
  reason: string;
  evidence: {
    filesAffected: string[];
    commandsToRun: string[];
    urlsToAccess: string[];
  };
}
```

## Validation Gates

### Typecheck Gate

- **Trigger**: Before and after any TypeScript file write
- **Requirement**: `npm run typecheck` must pass
- **Failure Handling**:
  - Simple errors: Auto-fix if possible
  - Complex errors: Block operation, show error context
- **Evidence**: Log typecheck output

### Playwright Gate

- **Trigger**: After feature implementation or test addition
- **Requirement**: `npm run qa:e2e` must pass
- **Failure Handling**:
  - Regression: Block operation, show failure context
  - New test failure: Allow with reason, add to backlog
- **Evidence**: Log test output, screenshots on failure

### QA Checklist Gate

- **Trigger**: After feature implementation
- **Requirement**: Relevant QA checks must be completed
- **Failure Handling**:
  - Missing checks: Allow with reason, add to backlog
- **Evidence**: Log QA checklist status

## Evidence Tracking

### Evidence Requirements

Every tool operation must produce:

1. **Operation Log**: What was done
2. **Timestamp**: When it was done
3. **Parameters**: What parameters were used
4. **Result**: What was the result
5. **Files Affected**: Which files were read/written/deleted
6. **Approval Status**: Whether approval was granted and by whom

### Evidence Storage

Evidence is stored in:

- **Session Logs**: `/docs/logs/sessions/{date}-{task}.md`
- **Tool Usage Logs**: Embedded in session logs
- **Diff Artifacts**: Stored in session log or referenced
- **Screenshots**: Stored in session directory
- **Commit Messages**: Stored in git history

### Evidence Format

```typescript
interface ToolEvidence {
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
    diffs: Record<string, string>;
    commandsRun: string[];
    urlsAccessed: string[];
    screenshots: string[];
  };
  safety: {
    permissionGranted: boolean;
    approvalRequired: boolean;
    approvedBy: "auto" | "user";
    approvalReason?: string;
  };
  outcome: "success" | "failure" | "blocked";
}
```

## Safety Checks

### Pre-Operation Checks

Before any operation, Bandit must check:

1. **Path Validation**: Is the path in allowed paths?
2. **Operation Validation**: Is the operation allowed for this tool?
3. **Approval Validation**: Is approval required? Has it been granted?
4. **Validation Gate**: Are validation gates satisfied?

### Post-Operation Checks

After any operation, Bandit must check:

1. **Evidence Logging**: Was evidence logged?
2. **Validation**: Did the operation succeed?
3. **Side Effects**: Were there unintended side effects?
4. **Rollback**: Is rollback needed on failure?

### Rollback Policy

Rollback is triggered when:

1. Typecheck fails after TypeScript file write
2. Playwright test fails after feature implementation
3. User denies approval after operation
4. Critical error occurs during operation

Rollback actions:

- Revert file changes using git diff
- Delete newly created files
- Restore deleted files from git
- Log rollback reason and evidence

## Risk Levels

### Low Risk

Operations that are:
- Read-only
- Local to workspace
- No side effects
- Reversible

Examples:
- Reading a file
- Running typecheck
- Navigating to localhost URL
- Sequential thinking

### Medium Risk

Operations that are:
- Write operations to non-configuration files
- Git add operations
- Allowlisted shell commands
- Reversible with effort

Examples:
- Writing to a source file
- Adding files to git
- Running `npm run typecheck`
- Creating a new test file

### High Risk

Operations that are:
- Delete operations
- Configuration file changes
- Git commit operations
- External access
- Irreversible

Examples:
- Deleting a file
- Modifying package.json
- Committing to git
- Accessing external URL
- Running shell command not in allowlist

## Permission Violation Handling

### Violation Types

1. **Path Violation**: Attempting to access forbidden path
2. **Operation Violation**: Attempting forbidden operation
3. **Approval Violation**: Operating without required approval
4. **Validation Violation**: Bypassing validation gates

### Violation Response

1. **Block Operation**: Immediately stop the operation
2. **Log Violation**: Log violation details to session log
3. **Notify User**: Inform user of violation
4. **Suggest Alternative**: Suggest safe alternative if available
5. **Review Policy**: Review if policy needs adjustment

### Violation Logging

```typescript
interface ViolationLog {
  sessionId: string;
  timestamp: string;
  violation: {
    type: "path" | "operation" | "approval" | "validation";
    severity: "low" | "medium" | "high";
    description: string;
  };
  attemptedOperation: {
    tool: string;
    operation: string;
    parameters: Record<string, unknown>;
  };
  response: {
    action: "blocked" | "warned" | "logged";
    message: string;
  };
}
```

## Policy Updates

### Update Process

1. **Propose Change**: Document proposed change with rationale
2. **Review**: Review change for safety implications
3. **Test**: Test change in safe environment
4. **Approve**: Get approval from user
5. **Deploy**: Update policy documentation
6. **Communicate**: Communicate change to Bandit

### Update Triggers

Policy should be updated when:

- New MCP server is added
- New skill is added
- New workflow is added
- Security incident occurs
- User requests change
- Operational need changes

### Version Control

Policy versioning:

- Major version (v1.0, v2.0): Breaking changes
- Minor version (v0.1, v0.2): Non-breaking additions
- Patch version (v0.0.1): Bug fixes, clarifications

Current version: v0.0.1

## Compliance

### Compliance Checklist

Before any tool use, Bandit must verify:

- [ ] Path is in allowed paths
- [ ] Operation is allowed for tool
- [ ] Approval is granted if required
- [ ] Validation gates are satisfied
- [ ] Evidence will be logged
- [ ] Rollback plan exists if needed

### Compliance Monitoring

Bandit should monitor:

- Permission request rate
- Approval denial rate
- Violation rate
- Validation failure rate
- Rollback rate

Metrics are logged to session logs for review.

## Emergency Overrides

### Emergency Override Conditions

Emergency override may be used when:

- User explicitly authorizes emergency override
- Critical bug requires immediate fix
- Policy is blocking legitimate work

### Emergency Override Process

1. User requests emergency override
2. Bandit logs override request
3. User provides explicit override reason
4. Bandit executes operation with bypass
5. Bandit logs bypass and evidence
6. Bandit reviews policy after emergency

### Emergency Override Logging

```typescript
interface EmergencyOverride {
  sessionId: string;
  timestamp: string;
  operation: {
    tool: string;
    operation: string;
    parameters: Record<string, unknown>;
  };
  bypassed: {
    pathConstraint?: boolean;
    operationConstraint?: boolean;
    approvalConstraint?: boolean;
    validationGate?: boolean;
  };
  reason: string;
  approvedBy: "user";
  evidence: ToolEvidence;
}
```

## Appendix

### Permission Policy Examples

#### Example 1: Reading a File

```
Operation: Read file
Tool: Filesystem MCP
Path: /home/boop/Projects/lumaweave/src/app/AppShell.tsx
Check: Path in ALLOWED_PATHS.read? Yes
Approval Required? No
Execute: Read file
Evidence: Log file path, read timestamp
```

#### Example 2: Writing a Source File

```
Operation: Write file
Tool: Filesystem MCP
Path: /home/boop/Projects/lumaweave/src/app/NewComponent.tsx
Check: Path in ALLOWED_PATHS.write? Yes
Approval Required? Yes (new file)
Request Approval: User approves
Execute: Write file
Validation: Run typecheck
Evidence: Log file path, diff, typecheck output
```

#### Example 3: Deleting a File

```
Operation: Delete file
Tool: Filesystem MCP
Path: /home/boop/Projects/lumaweave/src/app/OldComponent.tsx
Check: Path in ALLOWED_PATHS.delete? No (source file)
Approval Required? Yes (hard approval)
Request Approval: User denies with reason "keep for reference"
Execute: Block operation
Evidence: Log denial, reason
```

#### Example 4: Running Playwright Test

```
Operation: Navigate to URL
Tool: Playwright MCP
URL: http://localhost:5173
Check: URL in allowed URLs? Yes (localhost)
Approval Required? No
Execute: Navigate to URL
Evidence: Log URL, action, timestamp
```

#### Example 5: Accessing External URL

```
Operation: Fetch URL
Tool: Fetch MCP
URL: https://example.com
Check: Domain in allowlist? No
Approval Required? Yes (not in allowlist)
Execute: Block operation
Evidence: Log denial, forbidden domain
```
