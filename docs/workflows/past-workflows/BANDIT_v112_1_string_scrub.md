# Bandit — v112.1: string scrub + gwells console.log removal

First implementation pass of the v112 UI-completeness arc. Pure mechanical substitution + cleanup: replace 11 user-visible dev-language strings with user-language equivalents, remove 3 debug `console.log` calls from gwells internals. No new features, no logic changes, no architectural decisions.

Basis: `~/Projects/lumaweave/docs/SHIP_READINESS_ROADMAP.md` §3 (v112) + `docs/workflows/v112_0_ui_completeness_report.md` §1 + §7.1 + Ryan-locked decisions on §9 D1, D7.

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680). 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

No semver bump (arc closes at v112.7).

## v112 arc context

- v110 closed at 0.17.0 (real-source bugs + identity + ErrorBoundary)
- v111 closed at 0.18.0 (test infrastructure — split + helpers + flakers; CI E2E deferred)
- **v112 active** — UI completeness + content substitution
- v112 sub-passes: **v112.1** (THIS PASS) → v112.2 (Export MVP) → v112.3 (Type+Motion spokes) → v112.4 (theme menu tidy) → v112.5 (dev tile triage) → v112.6 (agent chat) → v112.7 (arc close)

## Targeted test scope

Sanity:
```bash
npm run typecheck
npm run lint:css
```

E2E specs that reference any of the affected strings (likely the inspector spec for placeholder messages):
- Quote in pre-flight whether `tests/e2e/inspector*.spec.ts` (or similar) assert on `"Coming in v92"`, `"Coming in v93"`, `"Coming in future arc"`, or `"v102"`. If so, update assertions to match the new strings.

If no specs reference these strings, skip the E2E runs.

## Locked decisions (Ryan-confirmed)

| # | Locked from §9 |
|---|---|
| D1 | All 11 string substitutions per §1 of the v112.0 report |
| D7 | Remove 3 gwells `console.log` calls (engine.ts:594, parallelSpines.ts:351, radialBackbone.ts:332) |

---

## Files (explicit paths only)

**String substitution targets (8 files):**
- `src/control-plane/inspector/spokes/registerTypeSpoke.ts` (line 17)
- `src/control-plane/inspector/spokes/registerMotionSpoke.ts` (line 16)
- `src/control-plane/inspector/spokes/registerLayoutSpoke.ts` (line 16)
- `src/i18n/manifests/en.json` (lines 272, 276, 280, 368-369)
- `src/control-plane/settings/categories/CategoryTheme.tsx` (lines 229, 263)
- `src/control-plane/commands/command-registry.entries.ts` (line 157)
- `src/source-adapter/adapters/PackageDependencyConfigForm.tsx` (line 37)

**Console.log removal targets (3 files):**
- `src/physics/gwells/engine.ts` (line 594)
- `src/physics/gwells/seeders/parallelSpines.ts` (line 351)
- `src/physics/gwells/seeders/radialBackbone.ts` (line 332)

Nothing else modified.

---

## Pre-flight (verify, report, STOP if diverges)

1. Confirm v111.5 (commit `35028fe`) is on HEAD. `package.json` reads `"version": "0.18.0"`.

2. Quote each of the 8 string-substitution sites verbatim. If any have shifted location since the v112.0 report, report new file:line.

3. Quote each of the 3 console.log lines verbatim with 3 lines of surrounding context (before + the log + after). Confirm they are *standalone debug traces* — not part of error handling, conditional logic, or test fixtures.

4. Grep `tests/e2e/` for any assertions on the strings being replaced:
   ```bash
   grep -rn "Coming in v92\|Coming in v93\|Coming in future arc\|Coming in a later v102 phase\|Placeholder — not connected" tests/e2e/
   ```
   Report any hits. Each hit needs its assertion updated to match the new string.

5. **STOP if any structural claim diverges from the v112.0 report.**

---

## String substitutions (per §1 of v112.0 report)

### Inspector spoke placeholder messages

**`registerTypeSpoke.ts:17`:**
```typescript
// BEFORE
placeholderMessage: "Coming in future arc (Typography axis token wiring)"
// AFTER
placeholderMessage: "Typography controls are in development."
```

**`registerMotionSpoke.ts:16`:**
```typescript
// BEFORE
placeholderMessage: "Coming in v92 (Audio Reactivity arc)"
// AFTER
placeholderMessage: "Animation and motion controls are in development."
```

**`registerLayoutSpoke.ts:16`:**
```typescript
// BEFORE
placeholderMessage: "Coming in v93 (Physics Dialect arc)"
// AFTER
placeholderMessage: "Physics layout controls are in development."
```

### i18n manifest (mirrors of the above)

**`en.json:272`** (`inspector.layout.placeholderMessage`):
```
"Coming in v93 (Physics Dialect arc)" → "Physics layout controls are in development."
```

**`en.json:276`** (`inspector.motion.placeholderMessage`):
```
"Coming in v92 (Audio Reactivity arc)" → "Animation and motion controls are in development."
```

**`en.json:280`** (`inspector.type.placeholderMessage`):
```
"Coming in future arc (Typography axis token wiring)" → "Typography controls are in development."
```

### AgentChatPlaceholder i18n (en.json:368-369)

Replace the description and status:
```json
// BEFORE
"description": "Local agent chat surface. Wires to the agent infrastructure in a future pass.",
"status": "Placeholder — not connected."

// AFTER
"description": "Chat with a local AI model.",
"status": "Not yet connected — coming in a future update."
```

(The status line will be removed entirely in v112.6 when real chat ships. For now we update its language.)

### CategoryTheme.tsx (2 locations)

**Line 229 (StubSubArea body text):**
```tsx
// BEFORE
<p className="theme-stub-coming">Coming in a later v102 phase</p>
// AFTER
<p className="theme-stub-coming">Coming soon</p>
```

**Line 263 (disabled button tooltip):**
```tsx
// BEFORE
title={!area.live ? 'Coming in a later v102 phase' : undefined}
// AFTER
title={!area.live ? 'Coming soon' : undefined}
```

### Command registry entries (line 157)

```typescript
// BEFORE
description: "Open the advanced theme workshop (coming soon)"
// AFTER
description: "Open the theme workshop"
```

### Package dependency form (line 37)

```tsx
// BEFORE
<option value="pyproject.toml" disabled>pyproject.toml (Python — coming soon)</option>
// AFTER
<option value="pyproject.toml" disabled>pyproject.toml (Python — not yet supported)</option>
```

"Not yet supported" is more accurate than "coming soon" (no firm release date).

---

## Console.log removals (per §7.1 of v112.0 report)

### `engine.ts:594`

```typescript
// BEFORE (3-line context to confirm — pre-flight quotes exact)
// ...
console.log(`[gwells] applied dialect '${dialect.id}'`);
// ...

// AFTER
// (line removed; no replacement)
```

### `parallelSpines.ts:351`

```typescript
// BEFORE
// ...
console.log(`[parallelSpines] Seeded ${seededPositions.size} spine positions...`);
// ...

// AFTER
// (line removed; no replacement)
```

### `radialBackbone.ts:332`

```typescript
// BEFORE
// ...
console.log(...);  // seed log per the report
// ...

// AFTER
// (line removed; no replacement)
```

**Important:** these are bare `console.log` statements with no operational purpose. The pre-flight confirms each is standalone (not part of error handling). If any of the 3 lines is *not* a standalone debug trace, STOP and report — don't remove it.

---

## Implementation procedure

### Step 1 — Pre-flight reads
Confirm all 11 string sites + 3 console.log sites match the report's claims. Quote each.

### Step 2 — String substitutions
Apply all 11 substitutions exactly as specified above. Use IDE find-and-replace per file or precise edits per line.

### Step 3 — Console.log removals
Remove the 3 lines (and their associated trailing newlines if they're standalone). Preserve surrounding code unchanged.

### Step 4 — E2E spec updates (if any)
Per pre-flight findings: if any tests/e2e/*.spec.ts files reference the replaced strings, update assertions to match new strings.

### Step 5 — Verify

```bash
npm run typecheck
npm run lint:css
# If any E2E specs were updated:
npx playwright test tests/e2e/<affected-spec>.spec.ts --reporter=line
```

Expected: all clean. No assertion failures from string changes.

### Step 6 — Manual smoke (Ryan, `npm run tauri dev`)

Quick check:
1. Open the radial inspector → click Type spoke → confirm new message
2. Click Motion spoke → confirm new message
3. Click Layout spoke → confirm new message
4. Open settings → Theme category → hover a disabled sub-area tab → confirm tooltip says "Coming soon"
5. Click a disabled sub-area (Workshop, History, Bookmarks, Export) → confirm body says "Coming soon"
6. Open command palette → search "Open Theme Workshop" → confirm description no longer says "(coming soon)"
7. Open source adapter panel → select package-dependency → confirm pyproject.toml option says "not yet supported"
8. Open agent chat tile → confirm new description + status

---

## Commit

MERGE GATE → commit (explicit paths only — the 11 files):
`chore(v112.1): scrub arc-number bleed from user-visible strings + remove 3 gwells debug logs`

END-OF-RUN REPORT to #changelog with SHA + bump+push gate.

---

## END-OF-RUN REPORT (required content)

- Pre-flight findings (all 11 sites confirmed; 3 console.log sites confirmed)
- E2E spec impacts: which specs needed updates, what assertions changed
- typecheck + lint:css confirmation
- Manual smoke verification (8 checks above)
- Any divergences from the report's location claims

---

## Hard stops

- **Only the 11 named files are modified.** No other source touched.
- **String replacements are exact.** Use the wording in this prompt verbatim — don't paraphrase or "improve" the proposed strings.
- **Console.log removals are deletions only.** Don't replace with a comment or a DEV-guarded version. Just remove.
- **If a console.log is part of operational logging (within an error handler, conditional branch, etc.), STOP and report.** The report classified these 3 as standalone debug traces; pre-flight verifies. Don't remove anything that has real operational purpose.
- **No semver bump.** v112.7 handles that.
- **No NOW.md / ROADMAP / KNOWN_SHARP_EDGES edits.** Those happen at arc close.
- No new dependencies. No new Rust. Explicit-path git. Discord MCP only.
- Targeted-test-scope only.
