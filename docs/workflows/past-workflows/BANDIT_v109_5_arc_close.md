# Bandit — v109.5: adapter registered-bar evaluation + arc close

Final pass of the v109 arc (Source Adapter Platform + Portfolio). Two commits:
- **v109.5.0** — registered-bar evaluation: load all four new adapters against real-world data; downgrade any that don't clear the bar
- **v109.5.1** — formal arc close: semver 0.15.0 → 0.16.0, NOW.md reconcile, SDK_SPEC coherence pass, sharp-edges log

Basis:
- `~/Projects/lumaweave/docs/SHIP_READINESS_ROADMAP.md` §2.6 (registered-bar principle) and §3 (v109.5 sub-pass structure)
- All v109 commits (`087a10e` → `7e513af`)
- SDK_SPEC at `~/Projects/future-integration/SDK_SPEC.md`

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE (each commit)
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680). 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

**v109.5.1 is the semver-bump commit** (0.15.0 → 0.16.0). v109.5.0 is internal.

---

## Commit 1 — `chore(v109.5.0): adapter registered-bar evaluation against real-world data`

This is not a "ship code" pass — it's a **structured evaluation**. The output is a written verdict on each adapter, and any downgrades/UX framing changes implemented based on that verdict.

### Targeted test scope

The evaluation IS the test. No new E2E required (the existing per-adapter specs already cover synthetic correctness). Manual smoke runs are the verification surface.

`npm run typecheck` + `npm run lint:css` always.

### Real-world test data sources

Per Ryan's confirmation:
- **markdown-vault:** Cerebra vault (Ryan provides path or describes structure)
- **cytoscape-json:** Small sample from official Cytoscape.js docs (`https://js.cytoscape.org/#notation/elements-json` or similar — Bandit downloads a small sample for the eval, doesn't commit it)
- **package-dependency:** The LumaWeave repo itself (`/home/boop/Projects/lumaweave`)
- **csv-edge-list:** Small public graph dataset — Karate Club, Les Misérables, or equivalent (Bandit picks one and uses it for the eval; doesn't commit unless small enough to live in `tests/fixtures/`)

### Pre-flight (verify, report, STOP if diverges)
1. Confirm v109.4.1 (commit `7e513af`) is on HEAD.
2. Confirm all four adapters are registered: list the four entries with their current `status` from `sourceAdapterRegistry.ts`.
3. Confirm `~/Projects/lumaweave/docs/SHIP_READINESS_ROADMAP.md` is in the repo and §2.6 reads as expected (registered-bar definition).
4. Ask Ryan for the Cerebra vault path (or wait for him to provide before starting markdown-vault eval). Don't assume a path.
5. Confirm a way to download a small Cytoscape JSON sample without committing it (e.g. `/tmp/` working dir).

### Step 1 — Per-adapter evaluation

For each of the four adapters, run the following protocol. Document each in a structured report (committed as `docs/workflows/v109_5_0_registered_bar_evaluation.md`).

**Protocol per adapter:**
1. Configure the adapter with the real-world test source (in the running app, `npm run tauri dev`).
2. Click "Set as active" → trigger load.
3. Observe:
   - Does the graph render? (loaded status; non-empty nodes/edges)
   - Are warnings sensible? (If any — read them; are they helpful or cryptic?)
   - Try a *deliberate misconfiguration* (wrong path, wrong column name, etc.). Does the error message tell a user what went wrong, in plain language?
4. Score against the registered-bar (§2.6 of the roadmap):
   - **PASS** — real user can load real data, errors are useful
   - **MARGINAL** — works but with rough edges (error messages mention Rust internals, edge cases produce confusing output)
   - **FAIL** — common failure modes produce unhelpful errors or silent breakage

**Per-adapter sections in the report** (replicate the structure for all four):

```markdown
### markdown-vault (Obsidian) — registered-bar evaluation

**Test source:** Cerebra vault at <path Ryan provides>
**Load outcome:** [counts: N notes, M tag-nodes, X wikilink edges, Y tag-membership edges; warnings: ...]
**Warnings observed:** [list]
**Misconfiguration test:** [pointed at non-existent path → error said "<exact error text>"; pointed at file instead of dir → error said "<text>"]
**Bar verdict:** PASS / MARGINAL / FAIL
**Rationale:** [1-2 sentences]
**Action:** [keep registered / downgrade to candidate / specific UX improvement needed]
```

### Step 2 — Implement evaluation outcomes

Based on the verdicts, apply changes:

**If all four PASS:** no code changes. Just commit the evaluation report.

**If any are MARGINAL:** Stop and ask Ryan how to handle. Options:
- Ship as registered anyway with a polish-debt note for post-v1.0
- Downgrade to candidate with "preview" framing
- Implement a specific UX improvement now

**If any FAIL:** downgrade to `status: "candidate"` in `sourceAdapterRegistry.ts`. Update `SourceAdapterPanel` (if needed) to surface a "preview / experimental" badge for candidate adapters. The candidate label is already visually distinct, so this may just be a status field change.

**For ANY downgrade:** the source-adapter.spec.ts count assertions (registered vs candidate) need updating.

### Step 3 — Verify

```
npm run typecheck
npm run lint:css
npx playwright test tests/e2e/source-adapter.spec.ts --reporter=line
# Plus each adapter's spec if any UI changes touched it:
npx playwright test tests/e2e/markdown-vault.spec.ts --reporter=line  # if markdown-vault changed
# etc per adapter
```

### Step 4 — Commit

MERGE GATE → commit (paths depend on outcomes):
- ALWAYS: `docs/workflows/v109_5_0_registered_bar_evaluation.md`
- IF downgrades: `src/source-adapter/sourceAdapterRegistry.ts` + affected spec files

Commit message: `chore(v109.5.0): adapter registered-bar evaluation against real-world data [+ <N> downgrades if applicable]`

END-OF-RUN REPORT → bump+push gate.

### Hard stops
- This is NOT a feature commit. Do NOT add new functionality, new error message text rewrites, or new UX polish. Those are post-v1.0 (v113 in the roadmap).
- The only code changes acceptable in this commit are: (1) status downgrades, (2) updating spec count assertions to match.
- If a MARGINAL or FAIL surfaces and you're tempted to "just fix it real quick" — STOP and ask. v109.5 is an evaluation pass; polish work belongs in dedicated arcs.
- No installs.

---

## Commit 2 — `chore(v109.5.1): v109 arc close — semver 0.15.0→0.16.0, NOW.md reconcile, SDK_SPEC coherence`

### Files (explicit paths only)

- `package.json` — version 0.15.0 → 0.16.0
- `src-tauri/Cargo.toml` — version field if it tracks main semver (confirm in pre-flight)
- `docs/LUMAWEAVE_NOW.md` — close v109; new arc state header
- `~/Projects/future-integration/SDK_SPEC.md` — coherence pass: resolve any section marked "open" or explicitly mark "post-v1.0"
- `docs/KNOWN_SHARP_EDGES.md` — append entries surfaced across the v109 arc (per pre-flight identification)

### Pre-flight (verify, report, STOP if diverges)
1. Confirm v109.5.0 is on HEAD.
2. Read LIVE `package.json` version (don't trust cached — should be 0.15.0).
3. Confirm `src-tauri/Cargo.toml` version tracking convention.
4. Read SDK_SPEC.md — list all sections currently marked "open" or "TBD". Each gets a decision in this commit: either resolved (with rationale) or marked "post-v1.0" (with reasoning).
5. Identify sharp-edges surfaced across v109 that aren't yet logged:
   - Zustand selector inline-fallback (v109.0.4) — already logged in v109.0.5
   - gray-matter Buffer polyfill in Tauri WebKit (v109.1.1) — confirm logged
   - Adapter-loader dep direction: adapter exports loader, registry imports — verify logged
   - Candidate-vs-registered count discipline (v109.3.1, v109.4): status changes from candidate→registered DON'T change entry count (entries[] is populated at registration regardless of status); only NEW registrations change the count — log this
   - SourceAdapterType union maintenance (v109.4.0): fresh adapters need union additions; candidate promotions don't — log this
   - List any others Bandit surfaced during the arc but didn't bank

### Step 1 — Semver bump

- Update `package.json` version `0.15.0` → `0.16.0`
- Update `src-tauri/Cargo.toml` if it tracks main semver

### Step 2 — NOW.md reconcile

Update `docs/LUMAWEAVE_NOW.md`:

**Header:** `Production version: 0.16.0` · `Internal arc: v110 (real-source bugs + identity + error boundary — per SHIP_READINESS_ROADMAP §3 v110)` · `Last closed: v109 (Source Adapter Platform + Portfolio)`

**Move v109 to closed-arc section.** Include the full commit table from v109.0.1 through v109.5.1. Preserve all v109 architectural notes accumulated across the arc (forward-compat hooks, family-base architecture, targeted-test-scope convention, registered-bar principle, etc.).

**Adapter ship status:** explicitly note which adapters ship as `registered` vs `candidate`, per v109.5.0's verdicts.

**Open-arc section:** v110 per ROADMAP §3. Reference the roadmap doc as the source of truth; don't duplicate sub-pass detail in NOW.md. NOW.md says "v110 open: real-source bugs + identity + error boundary per ROADMAP §3"; sub-pass detail lives in the roadmap.

**Deferred items + standing arcs:** preserve everything previously logged.

### Step 3 — SDK_SPEC coherence pass

Read `~/Projects/future-integration/SDK_SPEC.md` start to finish. For each section flagged "open" or "TBD" or with unresolved decisions:

- Did v109 implementation surface a clear answer? → mark **SETTLED in v109** with the rationale
- Is it genuinely still open but needed for v1.0? → mark **OPEN — pending v110+**
- Is it a post-v1.0 concern? → mark **POST-V1.0** with reasoning

Specifically check:
- §3 BaseSourceAdapter interface — settled by v109.0.1?
- §4 family bases — DirectoryAdapter + SingleFileAdapter settled; DSLAdapter / APIAdapter / GeneratedAdapter — post-v1.0
- §6 export envelope — settled by v109.1+; tag-node convention added by v109.1.2
- §10 open questions — what remains?

Goal: SDK_SPEC at v109 close has zero sections labeled "open" without an explicit owner-arc or "post-v1.0" annotation.

### Step 4 — KNOWN_SHARP_EDGES additions

Per pre-flight identification, append entries for any unlogged lessons. Each entry follows the existing format (symptom, cause, anti-pattern, correct pattern, first-encountered).

Likely entries (verify which are unlogged):
- gray-matter Buffer polyfill in WebKit
- Adapter-loader dep direction discipline
- Candidate-vs-registered entry count behavior
- SourceAdapterType union maintenance pattern

### Step 5 — Verify

```
npm run typecheck
npm run lint:css
```

No E2E required (no code changes). Confirm both pass.

### Step 6 — Commit

MERGE GATE → commit (explicit paths only): `chore(v109.5.1): v109 arc close — semver 0.15.0→0.16.0, NOW.md reconcile, SDK_SPEC coherence, sharp-edges`

END-OF-RUN REPORT to #changelog with SHA (arc-close bump). Bump+push gate.

### Hard stops
- No code changes (only semver bump + docs).
- Preserve EVERY previously-logged deferred item and standing arc in NOW.md. Don't lose any.
- SDK_SPEC.md updates must preserve the existing section structure; we're amending status annotations, not rewriting.
- If any SDK_SPEC section's resolution is unclear, STOP and ask Ryan rather than guessing.
- The semver bump is non-negotiable — 0.15.0 → 0.16.0 marks v109 close formally.

---

## END-OF-RUN REPORT (each commit)
Files touched, pre-flight findings, verification, manual smoke (Commit 1), divergences.

**Final report (after Commit 2):**
- Landed state across v109.5.0 + v109.5.1
- Adapter ship verdicts (4 adapters, status per each)
- Semver 0.15.0 → 0.16.0
- v109 ARC FORMALLY CLOSED — 14 commits banked from v109.0.1 (`087a10e`) through v109.5.1
- SDK_SPEC coherence: all sections resolved or marked post-v1.0
- v110 (real-source bugs + identity + error boundary) is NEXT per SHIP_READINESS_ROADMAP §3
- KNOWN_SHARP_EDGES updated with N new entries

## Hard stops (arc-level)
- Targeted-test-scope + CI fast-jobs only.
- No installs. No new Rust. No new Tauri commands. No new dependencies.
- Explicit-path git. Discord MCP only.
- v109.5.0 is evaluation + minimal-change. v109.5.1 is the formal close. Don't combine.
- Manual smoke pass for v109.5.0 requires real Tauri dev run (`npm run tauri dev`); don't skip.
- For markdown-vault eval: WAIT for Ryan to provide the Cerebra vault path. Don't guess.
