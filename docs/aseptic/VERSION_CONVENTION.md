---
title: Version Convention — Forward and Descending-Letter Passes
---

# Version Convention

LumaWeave/GWells uses two pass-versioning tracks: forward versioning for load-bearing work and descending-letter versioning for non-load-bearing cleanup.

---

## Forward versioning — load-bearing passes

Work passes that deliver user-visible or consumer-visible behavior increment normally:

```
v0.1.10 → v0.1.11 → v0.1.12
```

A load-bearing pass is one where you would describe the change to a user or consumer as "we made X better" or "GWells now does Y." Examples:

- Runtime lifecycle API: `getRuntimeState()`, debug events, and safer stop/error behavior. Forward version.
- Benchmark step hook: `GWController.step()` gives deterministic manual stepping for performance measurement. Forward version.
- Structural resolver behavior that changes node classification. Forward version.

---

## Descending-letter versioning — cleanup passes

Non-load-bearing passes take a descending letter suffix on the current forward version, counting down from `z`:

```
v0.1.11 → v0.1.11z → v0.1.11y → v0.1.12
```

A non-load-bearing pass is one where the honest user-facing description is "we cleaned up internally" or "docs got better." Examples:

- Aseptic docs bootstrap and living-report seed. Descending-letter version.
- Canonical docs refresh for already-shipped lifecycle APIs. Descending-letter version unless packaged as part of a release.
- Test helper cleanup with no behavior change. Descending-letter version.

**Load-bearing test:** Ask: would you describe this fix to a user as "we made X better"?
- Yes: forward versioning.
- No, internal cleanup: descending letter.

When in doubt, prefer forward versioning for behavior/API work and descending letters for docs/process cleanup.

---

## Cadence norms

Three to five descending-letter passes between forward versions is normal. More than five is a soft pressure signal that cleanup is overtaking product work. Zero descending letters for several forward versions in a row is a signal that cleanup debt may be accumulating.

---

## PASS COMPLETE version field

The PASS COMPLETE header must use the assigned pass version exactly:

```
── PASS COMPLETE · v0.1.12 · 2026-06-12 ──────────────────────
```

For descending-letter passes, include the letter:

```
── PASS COMPLETE · v0.1.11z · 2026-06-12 ──────────────────────
```

Use `Project: gwells` for GWells changelog posts unless the pass is explicitly for another LumaWeave component.
