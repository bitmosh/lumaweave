# Pass Friction Report Template

## Status

Template Bandit should use after meaningful passes, especially failed/recovery/Playwright-heavy passes.

## Purpose

This is a compact after-action report for finding Bandit weaknesses and improvement opportunities.

## When To Use

Use after:
- any failed validation
- any Playwright cascade
- any recovery pass
- any Quest Mode pass
- any MCP-heavy pass
- any pass where user intervention was needed
- any pass that introduced storage/schema/test helper changes
- any pass that ended with STOPPED AT CHECKPOINT

Optional after:
- clean small docs-only pass

## Template

```markdown
# Pass Friction Report

## Pass
- pass id:
- commit/hash:
- date:
- feature family:

## Outcome
- accepted / not accepted / stopped / recovered:
- validation summary:

## What Went Smoothly
- ...

## What Did Not Go Smoothly
- ...

## First Point Of Friction
- ...

## Root Cause Classification
- Playwright cascade
- state leakage
- brittle selector
- current QA vs historical contract drift
- MCP underuse
- stale git reporting
- source-of-truth ambiguity
- scope expansion
- helper over-repair
- storage/schema risk
- graph/Sigma risk
- other

## Was This Preventable?
- yes/no/unknown:
- prevention:

## Tool Use
- Sequential Thinking MCP:
- Context7 MCP:
- Playwright MCP:
- should any tool have been used earlier?

## Test / Evidence Issues
- tests failed:
- skipped tests:
- weak assertions risk:
- old contracts affected:

## Repo State Issues
- dirty tree:
- untracked files:
- stale status report:
- commit checkpoint quality:

## Suggested Improvement
- ...

## Suggested Target
- prompt template
- brain doc
- Playwright helper
- QA contract
- source-of-truth doc
- MCP protocol
- stop condition
- other

## Should This Become A Suggestion Box Entry?
- yes/no:
- title:
- severity:
```

## Compact Version

For routine passes, use this shorter version:

```markdown
## Compact Friction Report

- Pass:
- Outcome:
- Friction:
- Root cause:
- Preventable next time:
- Suggested improvement:
- Add to suggestion box? yes/no
```

## Rule

Bandit should not add a suggestion box entry for every tiny thing.
Only add entries that are likely to improve future performance.
