---
title: Cross-Pollination — Per-Pass Adjacent-Surface Notification Specification
---

# Cross-Pollination — Per-Pass Adjacent-Surface Notification Specification

The cross-pollination report is generated when a pass has meaningful impact on adjacent projects or adjacent LumaWeave/GWells surfaces. It translates the blast radius into actionable notifications so the human does not have to synthesize impact from scratch.

---

## Location

```
docs/aseptic/cross-pollination/pass-NN.md
docs/aseptic/cross-pollination/pass-N.M.md
docs/aseptic/cross-pollination/pass-vX.Y.Z.md
```

A cross-pollination file is only created when at least one adjacent surface has an impact entry. Passes with zero adjacent impact produce no file and explicitly say so in the pass report.

---

## GWells adjacent surfaces

| Surface | Consumes GWells via | Primary consumer surface |
|---|---|---|
| LumaWeave graph UI | `applyDialect`, controller lifecycle, layout outputs | Sigma/render pipeline, node positions, runtime controls |
| Source adapters | graph node/link input shape | structural classification, metadata, parent/child/source/target fields |
| Future layout history/control plane | controller lifecycle/debug state | pause/resume/stop, debug events, possible event-sourcing integration |
| Future standalone GWells package | public exports from `src/physics/gwells/index.ts` | `GWController`, dialect registry, types, seed/interaction registries |

---

## Format

```markdown
---
pass: pass-name-or-number
version: vX.Y.Z
date: YYYY-MM-DD
impacts: [lumaweave-graph-ui]
---

# Cross-Pollination — Pass Name (vX.Y.Z)

## LumaWeave graph UI

**Severity:** BLOCKING | NEEDS-AWARENESS | FYI

**What changed:** One paragraph. Specific enough that the adjacent surface maintainer can assess impact without reading the full blast-radius.

**Action required:** One of:
- No action needed — behavior unchanged; this is informational.
- Verify: `[specific command or test to run]`
- Update: `[specific file or call site to change]`

**Advocate-agent message:**
> [Copy-pasteable message with version, impact, action, and severity.]
```

---

## Severity definitions

**BLOCKING** — the adjacent surface cannot safely use the new GWells version without changes.

**NEEDS-AWARENESS** — the adjacent surface should know and may need to update, but can continue operating meanwhile.

**FYI** — informational only. No action needed; existing behavior is unchanged.

---

## Deciding whether a pass produces a cross-pollination file

Create one if the blast radius includes a breaking API change, shared behavior change, new public API that solves a known workaround, deprecation, removal, or output change an adjacent surface must inspect.

Do not create one for docs-only passes, internal refactors with identical behavior, or generated artifacts no adjacent surface reads.

When uncertain, create an FYI entry rather than letting an adjacent-impact question disappear.
