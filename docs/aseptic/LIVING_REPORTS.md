---
title: Living Reports — Specification
---

# Living Reports — Specification

Three accumulating markdown files that every Aseptic-instrumented pass reads and updates. Each entry is written when discovered; each entry is resolved, never deleted, when closed.

---

## General conventions

### Entry format

Each entry uses YAML frontmatter followed by a markdown body:

```markdown
---
id: TD-001
type: tech_debt
status: open
pass_opened: v0.1.11z
pass_resolved:
severity: MEDIUM
---

### TD-001 — Short descriptive title

Body text describing the finding in enough context for a future agent.

**Trigger:** The condition under which this becomes worth addressing.

**Evidence:** Where to verify it.
```

### Resolution convention

Do not delete closed entries. Mark them resolved, preserve the original body, and include the resolving pass/commit.

### ID scheme

- Tech debt: `TD-NNN`
- Polish debt: `PD-NNN`
- Deviations: `DV-NNN`

IDs are sequential within each file. Never reuse an ID.

---

## TECH_DEBT.md

**What goes in:** Functional but known-bad implementation choices. Deliberate deferrals. Architectural shortcuts with a known cost. The test: does this work correctly today, and do we know why it will need to change?

**What does not go in:** Broken behavior, purely cosmetic issues, or implementation-vs-doc gaps.

**GWells example:** `GWController.step()` provides deterministic manual stepping, but the automatic scheduler remains browser-shaped. Correct today; known future cost for headless/standalone operation.

---

## POLISH_DEBT.md

**What goes in:** Correct but imprecise items: stale docs, naming inconsistencies, fixture gaps, minor organization drift.

**What does not go in:** Architectural issues, incorrect behavior, or design decisions requiring user review.

**GWells example:** Canonical docs that omit already-shipped lifecycle APIs are polish debt when code behavior is correct and the fix is documentation refresh.

---

## DEVIATION.md

**What goes in:** Where implementation diverged from spec, implementation brief, or ADR. This is an information log, not a failure log.

**What does not go in:** Performance issues, vague spec gaps, or bugs unrelated to written guidance.

**GWells example:** A refinement brief asks for both baseline and latest benchmark JSON, while implementation writes latest-only pending a baseline policy. Record the gap instead of guessing which side should silently change.
