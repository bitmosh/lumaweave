# Ledgers — how they work

A ledger is an **append-only log of facts about the tree**. It exists because the alternative — a descriptive document that gets rewritten in place — goes stale silently, and a stale audit is worse than no audit. This repo has been burned by that: audits have pointed at testids and components that no longer existed, and roadmap items have been edited in place until nobody could tell what was actually done or when.

## The rules

1. **Entries are append-only.** Once an entry has an ID, its body is never rewritten. Not to fix a typo in the finding, not to "update" it. If the finding was wrong, you append a correction; you do not edit history.

2. **You close an entry by appending a line to it**, never by deleting it:
   ```
   Closed: 2026-07-20 · <sha7> · one line on what actually changed
   ```
   A closed entry stays in the file forever. The log is the record of what was true, when, and what we did about it.

3. **If a finding turns out to be wrong**, append:
   ```
   Withdrawn: 2026-07-20 · why it was wrong
   ```
   Do not quietly delete it. A wrong finding that was acted on is history worth keeping — that's how you avoid re-deriving the same mistake.

4. **New findings go at the bottom**, with the next free ID. IDs are never reused, never renumbered.

5. **`Status:` is the ONE mutable field.** Everything else in an entry is frozen once written. Status is the lifecycle marker, so it is updated in place — but it may only move in step with an appended dated line that says what happened. A status change with no appended line is a lie.
   One of: `OPEN` · `CLOSED` · `WITHDRAWN` · `WONTFIX` · `BLOCKED`.
   `BLOCKED` must name what it's blocked on.

6. **An entry can be partly acted on and still be OPEN.** If the fix removed a symptom but the finding still holds, append an `Amended:` line saying so and leave it open. Closing an entry because you touched the file is how a ledger starts lying.

## The anti-stale mechanism

Append-only fixes the history. It does **not** fix the truth: an `OPEN` entry can quietly become false when someone fixes the underlying thing by accident, and nobody notices.

So: **every load-bearing claim gets a guard.** A guard is a test that fails when the claim stops being true.

- `Guard:` names the test that holds the fact in place.
- `Guard: none` is an admission, not a default. It means the claim can rot without anyone noticing, and it should be treated as a lower-confidence entry.

When a guard fails, that is **not** a broken test — it is the tree telling you a documented fact has changed. The correct response is to close or amend the ledger entry, then update the guard. Never "fix" a guard by relaxing it to match new behaviour without an accompanying ledger line explaining what changed.

Guards for the graph-display ledger live in `tests/e2e/graph-contract.spec.ts`.

## The ratchet

Some entries describe damage that must not spread while we work toward fixing it — e.g. the number of files reaching into the renderer through `window.__lwSigma`. Those get a **ratchet guard**: a test asserting the count does not *increase*. It permits progress and forbids regression, which is exactly the pressure you want during a migration.

## Entry format

```
### GD-001 · Short imperative title
Opened: YYYY-MM-DD
Status: OPEN
Area: renderer | attributes | physics | theme | registries | settings
Evidence: what is actually true, with file:line. No speculation.
Impact: why it matters — especially for anything being imported.
Guard: tests/e2e/<file> › "<test name>"   |   none
```

## The ledgers

- `GRAPH_DISPLAY.md` — everything that decides what appears on the canvas. The map of what is live, dead, and lying.
- `RENDERER_MIGRATION.md` — the staged work to make a renderer swap (Sigma → three.js) possible, and to prepare the tree to receive imported assets.

## What does NOT belong in a ledger

Narrative, design rationale, and how-it-works explanations belong in `docs/canonical/`. A ledger holds **facts and their lifecycle**, nothing else. If an entry needs a paragraph of theory, the theory goes in canonical and the ledger links to it.
