# Bandit — v112.4.2: Tiles popover z-index / stacking fix

Smoke-test-grade bug surfaced during v112.4 manual verification: the Tiles popover (tile section picker) renders underneath nearby floating tiles, partially or fully obscuring the tile list. Should always render on top.

One commit. Pure CSS / stacking-context diagnosis and fix. No logic changes.

Basis: `POLISH_DEBT_RUNNING.md` entry "Tiles popover stacks beneath floating tiles" (added 2026-06-10).

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680). 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

No semver bump (arc closes at v112.6 — renumbered from v112.7).

## Targeted test scope

Sanity:
```bash
npm run typecheck
npm run lint:css
```

If an existing E2E spec exercises the Tiles popover (likely `tests/e2e/tile-popover.spec.ts` or similar), re-run it to confirm no regression. Pre-flight identifies which spec covers this surface.

**The real verification is manual smoke** — open the app, position a floating tile near the Tiles popover trigger, click to open the popover, confirm it stacks on top.

---

## Pre-flight (verify, report, STOP if diverges)

1. Confirm v112.4.1 (commit `f661298`) is on HEAD; `package.json` reads `"version": "0.18.0"`.

2. Locate the Tiles popover component. Candidates per project knowledge:
   - `TilesPopoverContent` (referenced in v112.4.1 end-of-run as "reacts to store in-place")
   - Component file likely in `src/tiles/` or `src/control-plane/` — grep for `TilesPopover` to find the actual file
   
   Quote the component's root element + any positioning/transform/opacity styles applied via inline style OR CSS class.

3. Locate the **floating tile** component (`FloatingTile.tsx` per project knowledge). Quote:
   - The root element's positioning (`position: fixed`? `absolute`?)
   - The z-index value applied
   - Any `transform`, `opacity`, `filter`, `will-change`, or `isolation` properties (any of these create stacking contexts)

4. Diagnose the stacking issue. Three possible root causes:
   - **A) Z-index gap** — Tiles popover has a low or unset z-index; floating tiles have a higher value. Simple ordering issue.
   - **B) Stacking context trap** — a parent of the popover has `transform`, `opacity < 1`, `filter`, etc., creating a new stacking context. The popover's z-index is then bounded by that context, not the page root. Even `z-index: 99999` won't help — it ranks within the trap, not above floating tiles outside.
   - **C) Portal mismatch** — the popover may be rendered outside its trigger's DOM tree via React Portal, but with conflicting z-index assignments at the portal target.

5. Identify the popover's current z-index value (or lack of one). Identify the floating tile's z-index value. Compare. If the popover's is lower or unset → case A. If the popover's is higher but it still renders below → case B or C; check parents for stacking-context-creating properties.

6. Identify whether the popover currently uses a React Portal. Look for `createPortal` usage or any `<Portal>` wrapper component. If it does, identify the portal's destination element (`document.body`? a dedicated overlay root div?).

7. **STOP if diagnosis is ambiguous.** Report findings to Ryan before applying any fix.

---

## Files (explicit paths only — depends on diagnosis)

**Case A (z-index gap):**
- One CSS file — likely the popover's stylesheet (e.g., `TilesPopover.css` or whichever bundle owns it)
- One line change: bump popover's z-index to be above floating tiles

**Case B (stacking context trap):**
- The component file that creates the trap — may need to remove the trapping property OR
- The popover component file — switch to a React Portal rendering at document.body to escape the trap

**Case C (portal target z-index issue):**
- The portal target element's CSS — bump z-index OR
- The popover's CSS at its portal-rendered location

Likely files: 1-2 maximum. This is a small commit.

---

## Implementation per case

### Case A — Z-index gap

The simplest fix. Identify the highest z-index used by floating tiles (likely a constant like `1000` or `var(--lw-z-floating-tile)`). The popover's z-index should be one tier above, e.g.:

```css
.tiles-popover-content {
  z-index: var(--lw-z-popover);  /* or a numeric value above floating tiles */
}
```

If LumaWeave uses a CSS variable scheme for z-index tiers (common in mature codebases), pre-flight identifies the variable. Add a new tier if necessary; popovers are conventionally above floating workspace items.

**Recommended z-index hierarchy** (if not already established):
```
--lw-z-background: 0
--lw-z-default: 1
--lw-z-floating-tile: 100
--lw-z-popover: 1000
--lw-z-modal: 5000
--lw-z-toast: 9000
--lw-z-tooltip: 9500
```

The popover sits below modals but above floating workspace items. Adjust if the existing scheme uses different numbers.

### Case B — Stacking context trap

The popover's z-index can't fix it because the trap bounds the popover. Two solutions:

**B.1 — Remove the trapping property from the parent.** If a parent has `transform: translate(...)` or `opacity: 0.99` for visual reasons that don't actually need them, removing the property destroys the stacking context and lets the popover's z-index work. Often unsafe (the property may be load-bearing for animation or positioning).

**B.2 — Render the popover via React Portal at document.body.** Bypasses the trap by mounting the popover outside the trapped subtree:

```tsx
import { createPortal } from "react-dom";

function TilesPopover({ children, isOpen }) {
  if (!isOpen) return null;
  
  return createPortal(
    <div className="tiles-popover-content" style={{ /* absolute positioning relative to viewport */ }}>
      {children}
    </div>,
    document.body
  );
}
```

The portal escapes any parent stacking contexts entirely. The popover's z-index then applies relative to the page root, where it can reliably outrank floating tiles.

**Recommend B.2 if Case B is diagnosed.** It's the canonical fix for stacking-context traps and won't have surprise interactions with future parent property changes.

### Case C — Portal target z-index issue

If the portal target is `<div id="overlay-root">` and *that* div has a low z-index, the fix is at the portal target, not the popover. Bump the target's z-index.

---

## Verify

```bash
npm run typecheck
npm run lint:css
# If an E2E spec exercises the popover (pre-flight identifies):
npx playwright test tests/e2e/<tile-popover-spec>.spec.ts --reporter=line
```

Expected: all clean. No assertion regressions.

**Manual smoke (Ryan, `npm run tauri dev`)** — the actual verification:
1. Open LumaWeave. Self-graph loads.
2. Tear off a tile section (e.g., drag the GraphInspector tile out into a floating position) and position it near the top-right of the screen where the Tiles popover trigger lives.
3. Click the Tiles popover trigger. The popover should appear ON TOP of the floating tile, not behind it.
4. Try with multiple floating tiles in different positions. Popover should always render on top.
5. Optionally: enable dev mode (Settings → Advanced → Developer Mode), open Tiles popover. The dev-gated tiles (QaPanel, system-index, graph-visual-inventory) should appear in the list with the popover still on top of any floating tiles.

---

## Commit

MERGE GATE → commit (explicit paths only — depends on diagnosis, expected 1-2 files):

`fix(v112.4.2): tiles popover renders on top of floating tiles — [case A | case B | case C] fix`

Commit message names the diagnosis case so the git history records which root cause was found.

END-OF-RUN REPORT to #changelog with SHA + bump+push gate.

---

## END-OF-RUN REPORT (required content)

- Pre-flight findings (popover file located, floating tile z-index identified, stacking analysis)
- **Which case (A/B/C) was the actual root cause**
- The fix applied (1-2 file change)
- typecheck + lint:css confirmation
- Any E2E re-runs and their results
- Manual smoke confirmation (5 checks above)
- Mark the polish debt entry as RESOLVED in `POLISH_DEBT_RUNNING.md` (move to RESOLVED section or strikethrough; match existing convention)

---

## Hard stops

- **Diagnose before fixing.** Don't blindly bump z-index — if the cause is Case B (stacking context trap), z-index alone won't work.
- **Maximum 2 files modified.** This is small targeted polish work, not architectural refactoring.
- **Don't restructure the popover component beyond the minimum fix.** If Case B requires React Portal conversion, keep the conversion surgical — same props, same children, just `createPortal` wrapping the render output.
- **Don't introduce new z-index values without checking for an existing scheme.** If `var(--lw-z-*)` tokens exist, use them. If not, document the new value's tier in a comment.
- **Update POLISH_DEBT_RUNNING.md.** Mark the entry resolved. Future smoke testing should not catch this same bug as "still open."
- **Don't fix the settings opacity regression in this commit.** It's a separate bug, separate diagnosis. Stays in POLISH_DEBT_RUNNING.md until v112.6 polish sweep.
- No new dependencies. No new Rust. No semver bump.
- Explicit-path git. Discord MCP only.
- Targeted-test-scope only.
