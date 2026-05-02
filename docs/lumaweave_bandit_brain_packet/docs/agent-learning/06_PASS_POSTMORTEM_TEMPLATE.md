# Pass Postmortem Template

Complete this after a pass, especially recovery or high-risk contract work.

```md
# Pass Postmortem

## Acceptance Recommendation
ACCEPT / ACCEPT WITH MANUAL QA REQUIRED / INCOMPLETE / DO NOT ACCEPT

## What Changed

## What Was Preserved
List stable contracts and IDs that were intentionally preserved.

## Contract Chain Verified
- docs:
- registry:
- runtime:
- DOM marker:
- Playwright:
- QA report:

## Validation
- Typecheck:
- Playwright:
- skipped tests:
- grep checks:
- manual QA:

## Files Changed By Class
| File | Class | Reason |
| --- | --- | --- |

Classes:
- runtime implementation
- contract registry
- QA/advisory contract
- Playwright evidence surface
- DOM/test witness
- future scaffold
- docs/logs

## Faults Encountered

## Lessons Learned

## New Guardrail Needed

## Follow-Up Work
```
