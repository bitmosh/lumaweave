# Large Bite Execution Policy

## Purpose

Bandit can take larger, higher-context passes when the system is stable enough.

This policy defines how to execute “ultra-bites” without causing chaos.

## Core Rule

```txt
A large pass may inspect broadly, but only one or two slices should change runtime behavior.
```

Documentation, audit, and scaffolding can be broad.

Runtime behavior changes must stay narrow and validated.

## Slice-Based Execution

Every large bite should be divided into slices.

Example:

```txt
Slice 1 — Observe / integrity validation
Slice 2 — Documentation / handleset alignment
Slice 3 — Small runtime fix
Slice 4 — QA checklist activation
Slice 5 — Validation
Slice 6 — Session log / report
```

## Slice Categories

### Documentation/Audit Slice

Low risk.

Allowed:

- docs
- session logs
- handleset updates
- roadmap updates
- planned handles
- feature matrix

Usually no typecheck needed unless source changes.

### Types/Scaffold Slice

Medium-low risk.

Allowed:

- type definitions
- empty registries
- non-runtime scaffolds
- docs-linked placeholders

Requires typecheck.

### Runtime Slice

Higher risk.

Allowed only when focused.

Examples:

- label policy behavior
- hover behavior
- selection behavior
- settings wiring
- QA registry activation

Requires:

```bash
npm run typecheck
npm run qa:e2e
```

Manual QA if visual/canvas behavior changed.

### QA Slice

Allowed:

- activate current checklist
- archive old checklist
- update QA version
- restore checklist fallback behavior
- update Playwright if necessary

Requires qa:e2e.

## Large Bite Constraints

A large bite should usually contain:

```txt
0–1 risky runtime slices
1–2 moderate source slices
many docs/audit/scaffold slices
```

If more than two runtime systems need changes, split the bite.

## Validation Timing

Run validation:

1. after risky runtime slices
2. after QA registry changes
3. at the end of the pass

At minimum:

```bash
npm run typecheck
npm run qa:e2e
```

If a validation step fails:

1. stop expanding scope
2. identify root cause
3. patch only that cause
4. rerun validation
5. report honestly

## Stop Conditions

Stop the large bite if:

1. typecheck fails repeatedly
2. qa:e2e fails due to app regression
3. manual QA contradicts code inspection
4. a slice requires major architecture migration
5. more than two runtime areas are becoming tangled
6. active checklist breaks
7. source changes drift into forbidden future-phase work

## Forbidden During Large Bites Unless Explicitly Requested

- full theme editor
- 3D/universe view
- force physics overhaul
- progressive depth slider implementation
- relationship label template engine
- agent chat implementation
- broad graph loading rewrite
- package installs
- destructive filesystem operations

## Reporting Format

Every large bite final report must include:

1. summary
2. slice list
3. slice outcomes
4. runtime behavior changed
5. docs/scaffolds created
6. QA checklist version
7. typecheck result
8. qa:e2e result
9. manual QA needed
10. known limitations
11. next recommended pass

## Acceptance Categories

Use:

```txt
ACCEPT
ACCEPT WITH MANUAL QA REQUIRED
INCOMPLETE
DO NOT ACCEPT
```

## Rule of Thumb

```txt
Big context is good.
Big uncontrolled mutation is bad.
```

Bandit should use the large context window to understand the whole system, not to patch everything at once.
