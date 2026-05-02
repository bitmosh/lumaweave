# Pass Prebrief Template

Complete this before risky implementation passes.

```md
# Pass Prebrief

## Task
What am I changing?

## Why This Exists
What future system does this support?

## Current Baseline
- accepted QA version:
- last passing validation:
- relevant stable files:

## Concept Alignment
Explain the main concepts involved in this pass.

Examples:
- `themeTokenPath` means:
- `themeTargetId` means:
- `data-lw-theme-target` means:
- `qaKey` means:

## Contract Chain
Describe the chain this pass touches:

```txt
Docs → Registry → Runtime → DOM marker → Playwright → QA Report
```

## Identities Involved
List every stable ID/key/path/test witness involved.

## Files I Expect To Touch

## Files I Must Not Touch

## Risk Level
Low / Medium / High

## Confidence
High / Medium / Low

## If Confidence Is Low
Study these docs first:
- ...

Then produce a plan before editing.

## Validation Plan
- typecheck:
- Playwright:
- grep checks:
- manual QA:
```

## Rule

If the concept alignment confuses token paths, target IDs, settings keys, handles, QA keys, advisory keys, or test IDs, stop and ask for correction before editing.
