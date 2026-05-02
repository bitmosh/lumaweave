# Bandit Tool Use Checklist v0

## Overview

This checklist ensures Bandit uses tools safely, effectively, and in compliance with the permission policy. Use this checklist before, during, and after tool operations.

## Pre-Operation Checklist

Before any tool operation, verify:

### Path Validation
- [ ] File path is in `/home/boop/Projects/lumaweave`
- [ ] File path is not in forbidden paths (`.git/`, `node_modules/`, system paths)
- [ ] File path matches operation type (read/write/delete paths)
- [ ] File extension is expected for operation

### Operation Validation
- [ ] Operation is allowed for this MCP server
- [ ] Operation is not in forbidden operations list
- [ ] Operation parameters are safe
- [ ] Operation has no side effects outside workspace

### Approval Validation
- [ ] Approval is not required (auto-approved operation)
- [ ] OR approval has been requested and granted
- [ ] Approval reason is documented
- [ ] Approval is from authorized source (user, not auto)

### Validation Gates
- [ ] Typecheck passes (if writing TypeScript files)
- [ ] Playwright tests pass (if applicable)
- [ ] QA checklist is complete (if applicable)
- [ ] Previous operation succeeded (if sequential)

### Context Validation
- [ ] File exists (for read/write/delete operations)
- [ ] File is not locked by another process
- [ ] Workspace is in clean state (no uncommitted changes if needed)
- [ ] Sufficient disk space for operation

## Tool-Specific Checklists

### Filesystem MCP

#### Read Operation
- [ ] Path is in ALLOWED_PATHS.read
- [ ] File exists
- [ ] File is readable (permissions)
- [ ] File is not binary (unless expected)
- [ ] File size is reasonable (< 10MB)

#### Write Operation
- [ ] Path is in ALLOWED_PATHS.write
- [ ] File exists or parent directory exists
- [ ] File is writable (permissions)
- [ ] Write operation is approved
- [ ] File content is valid
- [ ] Typecheck will run after write

#### Delete Operation
- [ ] Path is in ALLOWED_PATHS.delete
- [ ] File exists
- [ ] File is deletable (not critical system file)
- [ ] Delete operation is approved
- [ ] Delete reason is documented
- [ ] File is backed up (if needed)

#### Create Operation
- [ ] Path is in ALLOWED_PATHS.write
- [ ] Parent directory exists
- [ ] File does not already exist
- [ ] Create operation is approved
- [ ] File content is valid
- [ ] Typecheck will run after create

### Git MCP

#### Read Operation
- [ ] Git command is allowed (status, log, diff, show, blame)
- [ ] Git repository exists
- [ ] Git command is safe (no destructive operations)
- [ ] Git command output will be logged

#### Write Operation
- [ ] Git command is allowed (add, commit)
- [ ] Git repository exists
- [ ] Git command is approved
- [ ] Commit message is meaningful
- [ ] Files to add are in workspace
- [ ] Git status is clean before operation (if needed)

### Playwright MCP

#### Navigate Operation
- [ ] URL is localhost (http://localhost:* or http://127.0.0.1:*)
- [ ] Dev server is running
- [ ] Page is accessible
- [ ] Navigation will be logged

#### Click Operation
- [ ] Selector is valid (data-testid preferred)
- [ ] Element is visible and clickable
- [ ] Click will be logged
- [ ] Screenshot will be taken on failure

#### Type Operation
- [ ] Selector is valid (data-testid preferred)
- [ ] Element is visible and editable
- [ ] Text to type is safe
- [ ] Type will be logged
- [ ] Screenshot will be taken on failure

#### Screenshot Operation
- [ ] Page is loaded
- [ ] Screenshot path is in allowed paths
- [ ] Screenshot will be logged

### Sequential Thinking MCP

#### Planning Operation
- [ ] Thought is relevant to task
- [ ] Thought number is sequential
- [ ] Total thoughts estimate is reasonable
- [ ] Next thought needed flag is correct
- [ ] Thought will be logged

### Fetch MCP (v2+)

#### Fetch Operation
- [ ] URL is in allowlist
- [ ] URL uses HTTPS
- [ ] Request count is within rate limit (10 per session)
- [ ] Response will be logged
- [ ] Content will be validated

### Shell MCP (v2+)

#### Command Execution
- [ ] Command is in allowlist
- [ ] Command parameters are safe
- [ ] Command is approved
- [ ] Command output will be logged
- [ ] Command exit code will be checked

## During Operation Checklist

During tool operation, monitor:

### Execution Monitoring
- [ ] Operation is progressing as expected
- [ ] No unexpected side effects
- [ ] Resource usage is reasonable
- [ ] Operation is not stuck

### Error Monitoring
- [ ] Errors are caught and logged
- [ ] Error context is captured
- [ ] Error is communicated to user
- [ ] Error recovery is attempted

### Evidence Monitoring
- [ ] Operation is being logged
- [ ] Files affected are tracked
- [ ] Diffs are captured
- [ ] Screenshots are captured (if applicable)

## Post-Operation Checklist

After tool operation, verify:

### Success Verification
- [ ] Operation completed successfully
- [ ] Expected result achieved
- [ ] No unexpected side effects
- [ ] Files are in expected state

### Evidence Logging
- [ ] Operation is logged to session log
- [ ] Files affected are documented
- [ ] Diffs are captured
- [ ] Screenshots are captured (if applicable)
- [ ] Approval status is documented

### Validation Gates
- [ ] Typecheck passes (if applicable)
- [ ] Playwright tests pass (if applicable)
- [ ] QA checklist is complete (if applicable)
- [ ] No regressions introduced

### Rollback Preparation
- [ ] Rollback plan exists if needed
- [ ] Git diff is available for rollback
- [ ] Backup is available (if needed)
- [ ] Rollback trigger conditions are defined

## Workflow-Specific Checklists

### New Feature Slice Workflow

#### Pre-Workflow
- [ ] Feature description is clear
- [ ] Files to modify are identified
- [ ] Tests to add are identified
- [ ] Documentation to update is identified
- [ ] Validation gates are defined

#### During Workflow
- [ ] Branch created (if git available)
- [ ] Files are read before modification
- [ ] Changes are applied incrementally
- [ ] Typecheck passes after each change
- [ ] Tests are added
- [ ] Playwright tests pass
- [ ] Documentation is updated

#### Post-Workflow
- [ ] All validation gates pass
- [ ] Session log is created
- [ ] Changes are committed (if git available)
- [ ] Branch is clean (if git available)

### Typecheck Fix Loop Workflow

#### Pre-Workflow
- [ ] Typecheck errors are identified
- [ ] Error context is understood
- [ ] Fix strategy is planned
- [ ] Max iterations are defined

#### During Workflow
- [ ] Typecheck is run
- [ ] Errors are parsed
- [ ] Fixes are applied
- [ ] Typecheck is re-run
- [ ] Process repeats until pass or max iterations

#### Post-Workflow
- [ ] Typecheck passes or max iterations reached
- [ ] All fixes are documented
- [ ] Remaining errors are reported
- [ ] Session log is created

### Playwright Test Add Workflow

#### Pre-Workflow
- [ ] Feature to test is identified
- [ ] Test file location is identified
- [ ] Test selectors are planned
- [ ] Test assertions are planned

#### During Workflow
- [ ] Test file is created or updated
- [ ] Test uses data-testid selectors
- [ ] Test is run
- [ ] Selector issues are fixed
- [ ] Assertion issues are fixed
- [ ] Test passes

#### Post-Workflow
- [ ] Test passes
- [ ] Handleset documentation is updated
- [ ] Session log is created

### Session Log Create Workflow

#### Pre-Workflow
- [ ] Session summary is available
- [ ] Files changed are identified
- [ ] Tool usage evidence is collected
- [ ] Validation results are collected

#### During Workflow
- [ ] Session log markdown is generated
- [ ] Evidence is formatted
- [ ] Validation results are included
- [ ] Session log is written to `/docs/logs/sessions/`

#### Post-Workflow
- [ ] Session log file exists
- [ ] Session log is complete
- [ ] Session log is readable

## Emergency Override Checklist

Use this checklist only in emergency situations:

### Emergency Override Conditions
- [ ] Emergency override is justified
- [ ] User explicitly authorizes override
- [ ] Override reason is documented
- [ ] Normal procedures cannot be used

### Emergency Override Execution
- [ ] Override is logged
- [ ] Bypassed constraints are documented
- [ ] Operation is executed
- [ ] Evidence is captured
- [ ] Post-operation validation is run

### Emergency Override Post-Action
- [ ] Override is reviewed
- [ ] Policy is updated if needed
- [ ] Session log documents override
- [ ] Lessons learned are captured

## Compliance Checklist

### Permission Policy Compliance
- [ ] All operations comply with permission policy
- [ ] Path constraints are respected
- [ ] Operation constraints are respected
- [ ] Approval workflow is followed
- [ ] Validation gates are satisfied

### Evidence Compliance
- [ ] All operations are logged
- [ ] Evidence is complete
- [ ] Evidence is accurate
- [ ] Evidence is stored in correct location
- [ ] Evidence is retrievable

### Safety Compliance
- [ ] No forbidden operations were attempted
- [ ] No forbidden paths were accessed
- [ ] No unsafe commands were run
- [ ] No external URLs were accessed without approval
- [ ] Rollback plan exists if needed

## Common Pitfalls

### Path Violations
- **Pitfall**: Accessing files outside workspace
- **Prevention**: Always validate paths before operations
- **Check**: Path is in `/home/boop/Projects/lumaweave`

### Operation Violations
- **Pitfall**: Attempting forbidden operations
- **Prevention**: Check operation against allowlist
- **Check**: Operation is allowed for this tool

### Approval Violations
- **Pitfall**: Operating without required approval
- **Prevention**: Always request approval before write/delete
- **Check**: Approval is granted before operation

### Validation Gate Violations
- **Pitfall**: Bypassing typecheck or Playwright
- **Prevention**: Always run validation gates
- **Check**: Typecheck and Playwright pass before completion

### Evidence Violations
- **Pitfall**: Not logging operations
- **Prevention**: Log every operation
- **Check**: Evidence is in session log

## Checklist Usage

### When to Use Checklist

- Before any tool operation
- During complex operations
- After operations for verification
- When unsure about safety
- When learning new tools

### How to Use Checklist

1. Read checklist items
2. Verify each item is satisfied
3. Document any exceptions
4. Proceed with operation
5. Re-verify after operation

### Checklist Customization

Checklist can be customized for:
- Specific workflows
- Specific tools
- Specific operations
- Emergency situations

Customizations must:
- Maintain safety requirements
- Be documented
- Be approved by user
- Be version controlled

## Appendix

### Quick Reference

#### Auto-Approved Operations
- Read operations in allowed paths
- Sequential thinking operations
- Standard Playwright operations on localhost

#### Approval Required
- Write operations to non-configuration files
- New file creation
- Git add operations
- Git commit operations
- Delete operations
- Configuration file changes
- Shell commands (even in allowlist)

#### Hard Approval Required
- Delete operations
- Configuration file changes
- Git commit operations
- Shell commands not in allowlist

#### Forbidden Operations
- Access to forbidden paths
- Destructive git operations (push, pull, rebase, reset --hard)
- External URL access without allowlist
- Shell commands not in allowlist
- Package manager installs

### Validation Gates

#### Typecheck Gate
- Trigger: Before/after TypeScript file write
- Requirement: `npm run typecheck` must pass
- Failure: Block operation, show error context

#### Playwright Gate
- Trigger: After feature implementation or test addition
- Requirement: `npm run qa:e2e` must pass
- Failure: Block operation, show failure context

#### QA Checklist Gate
- Trigger: After feature implementation
- Requirement: Relevant QA checks must be completed
- Failure: Allow with reason, add to backlog

### Evidence Storage

#### Session Logs
- Location: `/docs/logs/sessions/{date}-{task}.md`
- Format: Markdown
- Contents: Operation logs, evidence, validation results

#### Diff Artifacts
- Location: Embedded in session log or referenced
- Format: Unified diff
- Contents: File changes

#### Screenshots
- Location: Session directory
- Format: PNG
- Contents: Page state on failure

### Emergency Contacts

For policy violations or emergencies:
- Document violation in session log
- Notify user immediately
- Suggest safe alternative
- Review policy after incident

Before patching a failure, classify it using `docs/lumaweave_phase_architecture_packet/03_TROUBLESHOOTING_PLAYBOOKS.md`.