---
title: Blast Radius — Per-Pass Artifact Specification
---

# Blast Radius — Per-Pass Artifact Specification

The blast-radius report is generated at the completion of every pass. It is a structured inventory of everything the pass touched. It feeds the PASS COMPLETE Discord message and any cross-pollination report.

---

## Location

```
docs/aseptic/blast-radius/pass-NN.md
docs/aseptic/blast-radius/pass-N.M.md
docs/aseptic/blast-radius/pass-vX.Y.Z.md
docs/aseptic/blast-radius/pass-name.md
```

Prefer versioned names for GWells until a stable pass-number convention exists. Use one file per pass.

---

## Format

```markdown
---
pass: pass-name-or-number
version: vX.Y.Z
project: gwells
date: YYYY-MM-DD
summary: one sentence
---

# Blast Radius — Pass Name (vX.Y.Z)

## Files

### Modified
- `path/to/file.ts` — what changed

### Created
- `path/to/new_file.md` — purpose

### Deleted
- `path/to/removed_file.ts` — why removed

---

## Public APIs

### Added
- `GWController.step()` — what it does

### Modified (breaking)
None.

### Modified (non-breaking)
None.

### Removed
None.

---

## Schema changes

None.

---

## Configuration changes

None.

---

## Dependency changes

None.

---

## Behavior changes

- Describe observable behavior, performance characteristic changes, defaults, or output changes.

If no behavior changes: "None."

---

## Living report updates

Entries added to living reports this pass:

- TECH_DEBT: TD-NNN — title
- POLISH_DEBT: PD-NNN — title
- DEVIATION: DV-NNN — title

Entries resolved this pass:

- None.

If no updates: "No new entries this pass. No entries resolved."
```

---

## No-new-entries confirmation

The Living report updates section is required even when empty. This is the structural safeguard against empty-report-by-omission.

---

## Retroactive files

Retroactive files are useful for understanding evolution but should be marked clearly and should not be trusted as precise records unless verified against git history. For LumaWeave/GWells, prefer accurate current-pass records over importing unrelated historical examples as active state.
