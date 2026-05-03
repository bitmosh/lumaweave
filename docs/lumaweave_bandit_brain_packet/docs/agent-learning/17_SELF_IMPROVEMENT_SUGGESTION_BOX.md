# Bandit Self-Improvement Suggestion Box

## Status

Durable operating inbox for recurring agent weaknesses, friction, and improvement proposals.

## Purpose

After each meaningful pass, Bandit should record what did not go smoothly, what almost caused damage, what tool use was missing, what tests cascaded, what scope was confusing, and what future operating rule might prevent repeat failures.

This is not a diary. This is not a session log. This is a structured improvement inbox.

The goal is to identify repeated Bandit weaknesses and convert them into:
- better prompts
- better brain docs
- better Playwright procedures
- better MCP tool-use rules
- better stop conditions
- better test isolation patterns
- better source-of-truth docs

## What Belongs Here

Include:
- repeated Playwright cascades
- stale git status reporting
- MCP underuse
- unclear source-of-truth boundaries
- scope expansion pressure
- brittle selectors
- storage/test leakage
- current QA vs historical contract confusion
- missed stop conditions
- helper over-repair risk
- prompts that were too broad or too narrow
- cases where Bandit should have stopped earlier
- cases where a new brain doc or checklist would help

## What Does Not Belong Here

Exclude:
- random implementation notes
- full logs
- stack traces without analysis
- one-off harmless typos
- speculative product ideas
- duplicate backlog items
- blame/self-praise
- vague "do better" notes

## Suggestion Entry Format

Each entry should use:

```md
### YYYY-MM-DD — Short Title

**Pass / Context:**
...

**Symptom:**
...

**What Went Roughly:**
...

**Likely Root Cause:**
...

**Impact / Risk:**
Low / Medium / High

**Repeated Pattern?**
Yes / No / Unknown

**Suggested Improvement:**
...

**Suggested Target:**
- prompt template
- brain doc
- Playwright helper
- QA contract
- source-of-truth doc
- test strategy
- MCP tool-use rule
- stop condition
- other

**Status:**
Open / Adopted / Rejected / Superseded

**Follow-Up Owner:**
User / Bandit / Future Agent
```

## Severity Levels

**Low:** minor friction, no contract risk

**Medium:** slowed pass, caused confusion, or risked test instability

**High:** caused failed validation, skipped tests, scope creep, accepted-contract risk, or needed recovery

## Review Rhythm

Review after:
- major accepted passes
- every failed/cascading pass
- before large Quest Mode tasks

Promote:
- repeated open suggestions into durable docs/checklists
- close adopted suggestions once added to an operating protocol

## Promotion Rule

A suggestion should be promoted into a real operating rule when:
- it appears 2+ times
- it causes failed validation
- it causes skipped/weakened tests
- it causes repo-state confusion
- it affects accepted contracts
- it creates repeated user intervention
- it would help graph physics/source adapter/IDE bridge future work

## Initial Seed Entries

### 2026-05-03 — Stale post-commit git status reporting

**Pass / Context:**
Multiple passes, including v34c1 recovery

**Symptom:**
Bandit reports git status before commit but not after commit, leading to incomplete state reporting in final reports.

**What Went Roughly:**
Reports show pre-commit state but user needs post-commit state to verify clean working tree.

**Likely Root Cause:**
Template or operating procedure does not require post-commit git status check.

**Impact / Risk:**
Low

**Repeated Pattern?**
Yes

**Suggested Improvement:**
Update operating procedures to require post-commit git status in all validation reports. Update report templates to include post-commit git status section.

**Suggested Target:**
- operating procedure
- report template

**Status:**
Open

**Follow-Up Owner:**
User

### 2026-05-03 — Playwright cascades from qa-panel selector drift

**Pass / Context:**
v34c1 export theme override bundle

**Symptom:**
Widespread Playwright failures due to `.nth(1)` selector expecting two qa-panel elements, but DOM only has one.

**What Went Roughly:**
Tests used `.nth(1)` for qa-panel selector, but DOM structure changed from v34b to v34c1, resulting in only one qa-panel element. All tests referencing qa-panel failed.

**Likely Root Cause:**
Selector drift - DOM structure changed but test selectors were not updated. Also, no early-stop triage to identify the shared root cause before full suite run.

**Impact / Risk:**
High - caused full Playwright cascade, needed recovery pass

**Repeated Pattern?**
Unknown

**Suggested Improvement:**
1. Use `.first()` instead of `.nth(1)` for single-element selectors to be more robust to DOM changes.
2. Add early-stop Playwright with max-failures=5 to identify shared root causes quickly.
3. Consider selector stability as a contract in Playwright operating procedures.

**Suggested Target:**
- Playwright helper
- Playwright operating procedure
- test strategy

**Status:**
Adopted

**Follow-Up Owner:**
Bandit

### 2026-05-03 — v34c1 skipped historical tests

**Pass / Context:**
v34c1 recovery cleanup

**Symptom:**
Initial recovery used `test.skip` for v34b historical tests instead of converting them to valid non-skipped tests.

**What Went Roughly:**
Bandit marked v34b tests as skipped instead of preserving historical contracts. This violated the hard rule of no skipped tests.

**Likely Root Cause:**
Confusion between current-pass identity tests and historical behavior contracts. Bandit treated v34b tests as obsolete rather than historical contracts to preserve.

**Impact / Risk:**
High - violated hard rule, weakened test coverage, lost historical contract evidence

**Repeated Pattern?**
Unknown

**Suggested Improvement:**
Update operating procedures to distinguish between:
- current-pass identity tests (should track current version)
- historical behavior contracts (should be preserved as non-skipped tests or registry checks)
Add rule: never use test.skip for historical contracts.

**Suggested Target:**
- operating procedure
- QA contract
- brain doc

**Status:**
Adopted

**Follow-Up Owner:**
User

### 2026-05-03 — MCP tools connected but underused

**Pass / Context:**
v34c1 recovery and general Playwright work

**Symptom:**
Sequential Thinking, Context7, and Playwright MCP tools are available but not consistently used for classification, API documentation, and UI inspection.

**What Went Roughly:**
Manual inspection and reasoning instead of leveraging MCP tools for:
- Playwright cascade classification
- API/library documentation lookup
- Live UI state verification

**Likely Root Cause:**
Bandit not trained to default to MCP tools for specific task types. Unclear when to use each tool.

**Impact / Risk:**
Medium - slower diagnosis, risk of missing insights available through MCP

**Repeated Pattern?**
Yes

**Suggested Improvement:**
Update MCP tool-use protocol with clear decision trees:
- Use Sequential Thinking for classification/planning
- Use Context7 for API/library documentation
- Use Playwright MCP for live UI inspection
Add to operating procedures: default to MCP tools before manual reasoning.

**Suggested Target:**
- MCP tool-use protocol
- operating procedure
- prompt template

**Status:**
Open

**Follow-Up Owner:**
Bandit

### 2026-05-03 — Need for max-failures=5 early-stop Playwright triage

**Pass / Context:**
v34c1 recovery

**Symptom:**
Full Playwright suite run with 48+ failures before identifying shared root cause.

**What Went Roughly:**
Ran full Playwright suite instead of early-stop to identify first 5 failures and classify the cascade.

**Likely Root Cause:**
Operating procedure does not mandate early-stop triage for cascades.

**Impact / Risk:**
Medium - wasted time, noisy failure output, delayed diagnosis

**Repeated Pattern?**
Yes

**Suggested Improvement:**
Add to Playwright operating procedures: for any suspected cascade, run early-stop with max-failures=5 first. Classify root cause before full suite run.

**Suggested Target:**
- Playwright operating procedure
- test strategy

**Status:**
Open

**Follow-Up Owner:**
Bandit

### 2026-05-03 — Need to compare failing tests against last accepted green commit

**Pass / Context:**
v34c1 recovery

**Symptom:**
Diff against last accepted commit helped identify suspect changes, but no structured working-pattern diff audit.

**What Went Roughly:**
Manual diff inspection without systematic comparison of failing tests against working patterns.

**Likely Root Cause:**
No working-pattern diff audit protocol in place.

**Impact / Risk:**
Medium - risk of missing selector drift or other pattern-based failures

**Repeated Pattern?**
Unknown

**Suggested Improvement:**
Implement working-pattern diff audit protocol: compare failing test selectors/helpers against last accepted green commit to identify drift. Add to Playwright operating procedures.

**Suggested Target:**
- Playwright operating procedure
- brain doc

**Status:**
Open

**Follow-Up Owner:**
Bandit
