---
title: Supervisor Protocol — What a Supervisor Pass Does
---

# Supervisor Protocol

A supervisor pass is a dedicated read-only review that runs when a trigger condition fires. It reads the accumulating instruments, cross-checks against git history, classifies findings that per-pass work missed, and produces a structured report for human review. It does not execute fixes. It halts and hands off.

For current LumaWeave/GWells work this is single-agent discipline, not a multi-agent requirement. Batch-boundary language still applies if the project later returns to parallel execution.

---

## Trigger conditions

| Trigger | Condition |
|---|---|
| Length threshold | Any living report exceeds 600 lines |
| Deviation flag | Any DEVIATION entry has `OPEN — spec should be updated` and is more than two forward versions old without action |
| Batch boundary | A parallel agent batch has completed, if parallel work is in use |
| Periodic | No supervisor pass has run in the last five forward versions |
| Manual | Developer requests one explicitly |

---

## Inputs

The supervisor pass reads, in order:

1. `docs/aseptic/TECH_DEBT.md` — all open entries
2. `docs/aseptic/POLISH_DEBT.md` — all open entries
3. `docs/aseptic/DEVIATION.md` — all open entries
4. `docs/aseptic/blast-radius/pass-*.md` files since the last supervisor pass
5. `docs/aseptic/cross-pollination/pass-*.md` files since the last supervisor pass
6. Git log/diff since the last supervisor pass, to cross-check blast-radius against actual commits

The supervisor pass does not read full source files unless a specific integrity check requires it.

---

## Process

### Phase 1 — Read and inventory

Read all inputs. Build a working inventory:
- Open TECH_DEBT entries: count, oldest, missed trigger conditions
- Open POLISH_DEBT entries: count, trivially closable cleanup candidates
- Open DEVIATION entries: waiting for docs/spec update vs implementation catch-up
- Blast-radius cross-check: do pass files account for modified files in git history?

### Phase 2 — Integrity loop

For each blast-radius file in scope:
1. Check that the Living report updates section is present
2. Spot-check two or three API changes against the source file
3. Verify that open DEVIATION entries have not been silently closed without report updates

### Phase 3 — Spec coherence verification

For each DEVIATION entry:
1. Confirm the referenced doc still says what the entry claims
2. Confirm the implementation still does what the entry claims
3. Flag stale entries for update or closure

### Phase 4 — New findings

Look for missed findings from blast-radius files, accumulated polish that has become architectural, or repeated patterns across passes.

### Phase 5 — Report

Produce `docs/aseptic/SUPERVISOR_REPORT.md`:

```markdown
# Supervisor Report — YYYY-MM-DD

**Passes reviewed:** [range]
**Previous supervisor pass:** [date or none]

## Summary

[2-3 sentences]

## Integrity findings

[Blast-radius inconsistencies, silent omissions, stale entries]

## New findings (missed by per-pass work)

[Classification with proposed entry text]

## Stale entries to update or close

[Entries needing update]

## Recommended cleanup batch

[Prioritized list]

## Halt — awaiting human review

This report is complete. No changes have been made. The recommended cleanup batch requires human approval before execution.
```

---

## Halt discipline

A supervisor pass halts before executing any fix. Its job is diagnostic clarity, not cleanup execution.
