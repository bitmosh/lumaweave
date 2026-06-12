---
title: Pass Reporting — Structured Format
---

# Pass Reporting — Structured Format

The structured pass report is the internal completion artifact for every LumaWeave/GWells pass. It is written before the PASS COMPLETE Discord message; the Discord message is derived from it, not the other way around.

---

## Required sections

```markdown
# Pass Report — Pass Name (vX.Y.Z)

**Date:** YYYY-MM-DD
**Version:** vX.Y.Z
**Type:** load-bearing | cleanup (descending-letter) | docs-only

---

## 1. Deliverables status

| Deliverable | Status | Notes |
|---|---|---|
| [what was specified] | DONE / PARTIAL / SKIPPED | reason if not DONE |

If partial or skipped: explain what remains and whether it is a STOP or a deliberate deferral with a tracking entry.

---

## 2. Test results

```
[paste verbatim output of the test run, or the relevant summary when output is long]
```

If tests were not run: explain why, for example docs-only pass with no runnable code affected.

---

## 3. Files touched

Reference the blast-radius file: `docs/aseptic/blast-radius/pass-*.md`

Summary here:
- Modified: [count] files
- Created: [count] files
- Deleted: [count] files

Key files: [list the 3-5 most significant]

---

## 4. API changes

Reference the blast-radius file for full list. Highlight here:
- Breaking changes: [none | list]
- New public APIs: [none | list]
- Removals: [none | list]

---

## 5. Living report updates

### New entries this pass

- TECH_DEBT: [none | TD-NNN (title)]
- POLISH_DEBT: [none | PD-NNN (title)]
- DEVIATION: [none | DV-NNN (title)]

**If no new entries:** "No new entries this pass." (explicit confirmation required)

### Entries resolved this pass

- [none | ID — title — resolution summary]

---

## 6. Adjacent project impact

Reference the cross-pollination file if one was produced: `docs/aseptic/cross-pollination/pass-*.md`

If no cross-pollination file: "No adjacent-project impact this pass."

If cross-pollination file exists: list impacted projects/surfaces and severity.

---

## 7. PASS COMPLETE message ready

The following is ready to post to #changelog:

```
── PASS COMPLETE · vX.Y.Z · YYYY-MM-DD ──────────────────────

Title: [4-8 word blog-suitable title]
Summary: [one sentence, 20-300 chars]
Project: gwells

Highlights:
· [concrete behavioral change — derived from blast-radius]
· [concrete behavioral change]
· [concrete behavioral change]

Learnings:
· [optional methodology/architecture insight]

Commit: [7-char commit SHA]
Tests: [N] passed · [M] failed · [K] skipped
Branch: main
```
```

---

## The no-new-entries requirement

Section 5 requires an explicit "No new entries this pass" confirmation when there are no living report updates. This is structural. An agent that made no living report updates is otherwise indistinguishable from an agent that did not check.

If a future supervisor pass finds a debt that this pass should have caught, the gap is visible: the pass said "no new entries" when there was one.

---

## Deviations from this format

If a pass has a good reason to omit or modify a section, document that in the report. Omitting a section silently is not acceptable.
