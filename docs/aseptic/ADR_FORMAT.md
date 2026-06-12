---
title: ADR Format — Agent-Friendly Template
---

# ADR Format — Agent-Friendly Template

Aseptic ADRs layer strict agent-facing sections on top of normal human rationale. The agent-facing sections contain only specific, testable statements. The human-facing sections explain context and consequences.

---

## Template

```markdown
# ADR-N: Title

**Status:** Draft | Accepted | Superseded by ADR-M
**Date:** YYYY-MM-DD
**Version:** vX.Y.Z

---

## Decision

One sentence. What was decided, stated affirmatively.

## Constraints (enforceable)

- [constraint statement] — testability note
- [constraint statement] — testability note

## Boundaries (parallel-execution-safe)

Files this decision permits modification of:
- [file or glob pattern] — permitted scope

Files this decision prohibits modification of without revisiting this ADR:
- [file or glob pattern] — rationale

Other ADRs this decision depends on:
- ADR-N — how this decision relies on it

## Invariants (testable)

- **[invariant name]:** [testable statement] → [test reference or test needed]

## Failure-mode preference

When implementation hits ambiguity, prefer: **loud failure | explicit refusal | well-defined fallback**

Justification: one sentence.

---

## Context (for humans)

Rationale, trade-offs, and alternatives.

## Consequences

What this enables, constrains, and creates as debt.
```

---

## Example ADR — GWells Core Boundary

```markdown
# ADR-G1: GWells Core Stays Standalone

**Status:** Draft
**Date:** 2026-06-12
**Version:** v0.1.11z

---

## Decision

GWells core remains standalone and does not import LumaWeave UI, React, Sigma, browser theme, or app-specific modules.

## Constraints (enforceable)

- Files under `src/physics/gwells` must not import from LumaWeave UI/application directories. — verify with import search or lint rule.
- Public integration stays through exported types, dialects, registries, and controller APIs. — verify through `src/physics/gwells/index.ts`.

## Boundaries (parallel-execution-safe)

Files this decision permits modification of:
- `src/physics/gwells/**` — core implementation and tests
- `docs/aseptic/**` — process docs and pass records
- `docs/canonical/GWELLS_PHYSICS.md` — canonical behavior docs when requested

Files this decision prohibits modification of without revisiting this ADR:
- UI renderer files to satisfy core behavior — would couple physics core to app presentation

## Invariants (testable)

- **No app imports:** GWells source has no React/Sigma/theme/app-specific imports → test needed.

## Failure-mode preference

When implementation hits ambiguity, prefer: **explicit refusal**

Justification: coupling GWells to LumaWeave UI would make extraction harder and hide architectural drift.
```
