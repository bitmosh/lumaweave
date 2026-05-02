# Debug Checkpoint Workflow

## Overview

The debug checkpoint workflow is a development-time process for verifying that LumaWeave is functioning correctly. It involves running QA checklists, reviewing results, and taking corrective action when needed.

## Current Workflow

### Step 1: Select Checklist
- Choose active QA checklist from registry
- Verify checklist version matches expected version
- Review checklist steps

### Step 2: Execute Checks
- Follow each check step
- Verify expected behavior
- Record notes for each check
- Mark status: Pass / Fail / Not Applicable

### Step 3: Submit Report
- Review all check results
- Add overall notes
- Submit report
- Copy report to clipboard

### Step 4: Address Failures
- Review failed checks
- Identify root cause
- Implement fix
- Re-run checklist
- Verify fix

## Enhanced Workflow (Near Term)

### Step 1: Select Checklist
- Choose active QA checklist from registry
- Verify checklist version (badge shows active version)
- Review checklist steps
- View Last Submitted Report for context

### Step 2: Execute Checks
- Follow each check step
- Verify expected behavior
- Record notes for each check
- Mark status: Pass / Fail / Not Applicable
- View Debug Checkpoint Summary for context

### Step 3: Submit Report
- Review all check results
- Add overall notes
- Submit report
- Copy report to clipboard
- Report saved to QA History

### Step 4: Address Failures
- Review failed checks
- View QA History for pattern detection
- Identify root cause
- Implement fix
- Re-run checklist
- Verify fix

### Step 5: Copy Last Submission
- Use Copy Last Submission button for quick sharing
- Paste into documentation or issue tracker
- Reference in code reviews

## Debug Checkpoint Summary

The Debug Checkpoint Summary provides context during the workflow:

### Graph State
- Loaded graph summary
- Node count
- Edge count
- Community count
- Important nodes count

### Handleset Status
- Active handles count
- Partial handles count
- Planned handles count
- Handles requiring QA count
- Handleset audit summary

### Recent Test Results
- Playwright test results
- Failed tests
- Flaky tests
- Last test run timestamp

### Runtime State
- Active label mode
- Active selection state
- Active hover state
- Active depth setting
- Any warnings/errors

## QA History

The QA History provides historical context:

### Filter Options
- Filter by feature
- Filter by version
- Filter by date range
- Filter by status

### Report View
- Click any report to view details
- Show all check results
- Show notes
- Show timestamp

### Export
- Export history as JSON
- Export single report as JSON
- Export single report as Markdown

## Future Workflow (Agent Chat)

### Step 1: Select Checklist
- Choose active QA checklist
- Agent Chat suggests appropriate checklist based on context
- Verify checklist version

### Step 2: Execute Checks
- Follow each check step
- Agent Chat explains expected behavior
- Agent Chat provides hints for difficult checks
- Record notes
- Mark status

### Step 3: Submit Report
- Review all check results
- Agent Chat summarizes failures
- Agent Chat suggests root causes
- Agent Chat recommends next actions
- Submit report

### Step 4: Address Failures
- Agent Chat explains failed checks
- Agent Chat suggests fixes
- Agent Chat inspects handleset status
- Agent Chat reviews Playwright failures
- Implement fix
- Re-run checklist
- Verify fix

## Checkpoint Types

### Development Checkpoint
- After feature implementation
- After bug fix
- After refactoring
- Before merge

### Release Checkpoint
- Before release
- After release
- After hotfix

### Regression Checkpoint
- After breaking change
- After dependency update
- After infrastructure change

## Checkpoint Triggers

### Manual Trigger
- Developer initiates
- Before committing
- Before merging

### Automated Trigger
- After CI/CD pipeline
- After deployment
- On schedule

### Event Trigger
- After error detected
- After performance degradation
- After user report

## Checkpoint Artifacts

### Report
- Checklist results
- Notes
- Timestamp
- Feature version

### Logs
- Runtime logs
- Browser console logs
- Playwright logs

### Screenshots
- Before state
- After state
- Failure state

## Checkpoint Review

### Self Review
- Developer reviews own report
- Verifies all checks passed
- Addresses any failures

### Peer Review
- Peer reviews report
- Verifies completeness
- Suggests improvements

### Manager Review
- Manager reviews report
- Verifies quality
- Approves release

## Notes

- This is documentation and architecture scaffolding only
- No implementation unless explicitly requested
- Manual QA overrides code inspection
- Checkpoint workflow must remain simple and efficient
