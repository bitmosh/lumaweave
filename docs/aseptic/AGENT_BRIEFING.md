---
title: Agent Briefing — System-Prompt Fragment
---

# Agent Briefing

The following is a copy-pasteable prompt fragment for a single agent participating in an Aseptic-instrumented LumaWeave/GWells pass.

---

```
## Aseptic discipline — LumaWeave/GWells

You are working in a LumaWeave/GWells pass under Aseptic discipline. Before writing code, read these files:

  docs/aseptic/TECH_DEBT.md      — functional but known-bad implementation choices
  docs/aseptic/POLISH_DEBT.md    — correct but imprecise; mechanical to fix
  docs/aseptic/DEVIATION.md      — where implementation diverged from spec, brief, or ADR

These are the living reports. They are your map of known debt and divergence. An open TECH_DEBT entry may explain why code looks the way it does. A DEVIATION entry tells you that written guidance and code disagree; investigate before aligning either side.

### At pass completion, before posting PASS COMPLETE:

1. Update the living reports. For every finding encountered during this pass:
- Functional but known-bad? Add a TECH_DEBT entry (ID: TD-NNN)
- Correct but imprecise? Add a POLISH_DEBT entry (ID: PD-NNN)
- Implementation diverges from spec/brief/ADR? Add a DEVIATION entry (ID: DV-NNN)
- Existing open entry now resolved? Mark it resolved; do not delete it

2. Write the blast-radius file. Create `docs/aseptic/blast-radius/pass-*.md` using `docs/aseptic/BLAST_RADIUS.md`. The Living report updates section is required even if empty: write "No new entries this pass. No entries resolved."

3. Write a cross-pollination file only if warranted. If the blast radius includes breaking API changes, behavior changes, or new APIs that adjacent LumaWeave/GWells surfaces use, create `docs/aseptic/cross-pollination/pass-*.md` using `docs/aseptic/CROSS_POLLINATION.md`.

4. Write the pass report using `docs/aseptic/PASS_REPORTING.md`. The no-new-entries confirmation in section 5 is required and must be explicit.

### Fail-loudly defaults

When implementation hits ambiguity, prefer a loud, explicit error or documented deferral over a silent fallback. For GWells, preserve standalone core boundaries: no React, Sigma, browser UI, LumaWeave theme, or app-specific imports inside `src/physics/gwells`.

### Deviation surfacing convention

If you discover that written guidance says one thing and code does another:
- Do not silently align code to docs
- Do not silently align docs to code
- Add a DEVIATION entry with `OPEN — spec should be updated` or `OPEN — implementation should catch up`
- Surface the deviation in the pass report

### Reading project state

The living reports are additive and resolved entries are preserved. To understand current state:
- Entries without a `pass_resolved` value are open
- Resolved entries are history, not current work
- Re-assess severity if circumstances changed

### Version to use for this pass

Use `docs/aseptic/VERSION_CONVENTION.md`. Load-bearing work that a user would describe as "we made X better" gets a forward version. Internal cleanup and docs-only work gets a descending-letter version.
```
