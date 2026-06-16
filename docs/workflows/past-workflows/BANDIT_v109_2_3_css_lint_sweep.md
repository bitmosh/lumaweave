# Bandit — v109.2.3: CSS lint full sweep (restore CI green)

Tiny hygiene pass. CI's `lint:css` job has been red since at least v109.0 — 2 errors + 5 warnings in 3 files. Run `--fix` for what it can autofix, address the rest manually. Restore CI green so every subsequent commit gets honest signal.

NOT a feature commit. Pure hygiene. v109 arc stays open.

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`. ONE commit.

## ⏩ BANDIT PASS PREFACE
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680). 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

No semver bump.

## Pre-flight (verify, report, STOP if diverges)

1. Confirm v109.2.2 (commit `a4fef50`) is on HEAD.
2. Run `npm run lint:css` and confirm the 7 issues from Ryan's local run:
   - **`src/control-plane/StatusBar.css`**: 3 warnings (line 92 `bottom`, 93 `left`, 174 keyword `right`)
   - **`src/control-plane/commands/palette.css`**: 2 warnings (lines 10, 18 — both `vh` unit)
   - **`src/control-plane/settings/SettingsPanel.css`**: 2 errors (lines 1041, 1060 — `at-rule-empty-line-before`)
3. If the issue list differs from the above, STOP and report — drift means something changed and we need to re-baseline before fixing.

## Step 1 — Run `--fix`

```bash
npx stylelint "src/**/*.css" --fix
```

Most issues should be fixable automatically:
- The 2 SettingsPanel.css errors (empty lines before at-rules) are mechanical — fixable.
- The StatusBar.css logical-property warnings (`bottom` → `inset-block-end`, `left` → `inset-inline-start`, `right` keyword → `end`) are likely fixable.
- The palette.css `vh` → `vb` unit conversion is likely fixable.

After running `--fix`, re-run `npm run lint:css` and report the remaining issues.

## Step 2 — Manual remediation (only if `--fix` left anything behind)

If anything remains after `--fix`, address manually per the stylelint suggestion:
- `bottom` → `inset-block-end`
- `left` → `inset-inline-start`
- Logical keyword `right` (in `text-align` or similar context) → `end`
- `vh` unit → `vb` unit
- Empty line before at-rule → insert blank line

**Hard stop:** if `--fix` makes any change that looks visually consequential (e.g. a property change that would affect rendering in unexpected ways, especially for `vh` → `vb` which can differ in non-standard writing-modes), STOP and ask Ryan to eyeball. The codebase is LTR-only by intent; `vh` and `vb` are equivalent there, so the conversion should be visually identical. But report any oddness rather than commit blind.

## Step 3 — Verify

```bash
npm run lint:css
# Expected: 0 errors, 0 warnings
npm run typecheck
# Expected: 0 errors
```

**Manual smoke (Ryan, brief, `npm run tauri dev`):**
- App loads.
- StatusBar renders correctly (the bottom/left positioning was likely for absolute positioning of badges/pills — should look unchanged).
- CommandPalette opens (Ctrl/Cmd+K or whatever the trigger is) — its sizing should be unchanged.
- SettingsPanel opens — at-rule changes are pure whitespace, no visual impact expected.

## Step 4 — Commit

MERGE GATE → commit (explicit paths only — only the 3 CSS files):
`chore(v109.2.3): CSS lint sweep — logical properties + at-rule whitespace (restore CI green)`

END-OF-RUN REPORT to #changelog + bump+push gate.

## END-OF-RUN REPORT

- Files modified (3 expected).
- Confirmed `npm run lint:css` → 0 errors, 0 warnings.
- Confirmed typecheck still clean.
- Manual smoke notes (Ryan).
- CI status: now green (verify via the GitHub Actions tab if convenient).

## Hard stops

- No code changes outside the 3 CSS files identified by `lint:css`.
- No new dependencies. No new Rust.
- If `--fix` proposes changes to files NOT in the lint:css output, STOP and ask.
- If any visual change is suspected, STOP and ask before committing.
- Targeted-test-scope: typecheck + lint:css only. No E2E re-run for a CSS-only change.
- Explicit-path git (NEVER `git add -A`).

## Note for context

This is debt from before v109 started. Bandit flagged it during v109.0.1 ("CSS lint: 2 pre-existing errors in unchanged files") but we didn't include `lint:css` in the targeted-test-scope convention, so it's been silently red in CI ever since. The warnings/errors aren't caused by v109 work — they're inherited. The fix is small, banks the debt cleanly, and restores honest CI signal for all subsequent commits.
