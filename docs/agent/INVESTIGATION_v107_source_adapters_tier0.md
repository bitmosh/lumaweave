# Investigation brief — v107 Source Adapters, Tier 0 (pre-pass report)

**For:** Terminal Claude · **Output:** one markdown report dropped back into PK · **No code changes, no commits.**

The basis for v107 is `docs/prototypes/source-adapter-plan.md` (audited 2026-06-03). v106 (Radial Inspector Redesign) landed substantial changes between that audit and now — `themeOverrideStorage` was modified, the inspector subsystem was rewritten (HTML/CSS, deleted SVG components, topbar subtargets committed), CLAUDE.md was trimmed. The 24-hour-old plan may have small drifts against current `main`. This investigation verifies the plan's "code reality" column is still accurate, flags drift, and rates Tier 0 feasibility before any implementation.

**Hard stops:**
- No code changes. No commits. Read-only investigation.
- Cite file:line for every factual claim. If a claim depends on cached knowledge, mark it explicitly.
- No installs. No script runs that mutate state.

---

## §1 — Plan freshness audit

The plan's §1 ("What Actually Exists vs. What the Docs Claim") has 8 rows asserting current code state as of 2026-06-03. Verify each against current `main` (post-v106). For each row, report:
- **HOLDS** (still accurate) / **DRIFTED** (changed since audit, describe the change) / **UNCERTAIN** (couldn't verify, say why)
- file:line citation for the verification

Rows to verify:
1. Self-graph adapter: `adaptSelfGraphToSigma()` handles v0/v1, 747 KB fixture.
2. Live source loader: `loadGraphifySource.ts` hardcoded to `/examples/ai-lab/graphify-out/graph.json`, path doesn't exist.
3. Registry: sealed `readonly` const array, 1 registered + 8 candidate, no `register()` API.
4. Normalization: `normalizeGraphifyGraph.ts` handles many raw shapes via field-name probing.
5. UI surfaces: `SourceAdapterPanel` read-only; `GraphSourcesTileContent` shows live source state.
6. Tauri backend: only `get_project_root()` + `open_in_ide()` (+ `greet`) exist — zero ingestion/FS traversal commands.
7. AppShell fixture/live switching: `useFixture = isTestEnv || !hasRealSource`.
8. Source settings: only collapse state; no source path configuration persisted.

Flag any additional drift not in the original 8 rows that's relevant to Tier 0 (e.g. did v106 touch `useGraphSourceSummary`, settings schema, or `themeOverrideStorage` in a way that affects adapter wiring?).

---

## §2 — Tier 0 scope verification

The plan's Tier 0 has 4 sub-items (0.1 — 0.4). Verify the scope is still correct + report each item's actual effort, given the current code:

- **0.1 Repair `loadGraphifySource` → `loadSource(adapterId, inputPath)`.** What's the current file shape? Is the rename + adapter-routing trivial (rename + parametrize) or are there callers/consumers that depend on the existing signature/exports that would also need updating? List every consumer of `loadGraphifySource` by file:line.
- **0.2 Add `sources` section to settings schema** with `active: string | null` + `configurations` map. What's the current `settings.schema.ts` shape, and what's the migration story (schema version bump + migration function)? Confirm the schema-bump pattern hasn't changed since v89/v90.
- **0.3 Wire `useGraphSourceSummary` to settings-driven source.** What does it currently read? What's the change footprint?
- **0.4 Add source selector UI to `SourceAdapterPanel`.** What's the current panel structure? Is the "set active source" button trivial (one button per registered entry) or does it need state plumbing (settings write path, optimistic UI, etc.)?

Rate each item: **LOW / MEDIUM / HIGH** difficulty, with a one-line "why."

---

## §3 — Hidden coupling check

Tier 0 fixes the broken plumbing without adding new adapters. But the plumbing change touches systems that other things consume. Identify and report any *non-obvious* dependencies that could break:

1. **Test surface:** what E2E specs reference `loadGraphifySource`, `useGraphSourceSummary`, the source-adapter panel, or `provenance-parity`? Will the rename + settings-schema change break any of them? List the specs at risk.
2. **AppShell startup path:** how does AppShell currently bootstrap the source? Does it gracefully tolerate a missing/null active source (e.g. on a fresh install with empty `sources.active`)? If not, what's the fallback?
3. **Settings migration:** the plan proposes `default: { active: "self-graph-yaml-frontmatter", configurations: {} }`. Is `"self-graph-yaml-frontmatter"` the correct/current registered adapter id in `sourceAdapterRegistry.ts`? Confirm by reading the registry.
4. **`generate-provenance` / `provenance-parity` interaction:** does the manifest-sync workflow depend on any of the files we're touching? (If yes, we may need to re-run generate-provenance after Tier 0.)
5. **Anything else** the audit didn't anticipate.

---

## §4 — Sealed registry (plan's Gap 5)

The plan's Gap 5 notes the registry is a `readonly` const with no `registerSourceAdapter()` API — inconsistent with the project's registry-first architecture. The plan recommends pairing this with Tier 0.

Verify:
- Does the registry actually need a `register()` API for Tier 0 (i.e. does any near-term work require external/dynamic registration), or is the const-array fine for now?
- What pattern does the gwells `physicsDialectRegistry` use? (The plan compares them — confirm or correct.)
- If we add `registerSourceAdapter()`, what's the migration story for the existing entries? (Convert const-array to register-calls in an init file?)

Rate: should this land in Tier 0 (paired with the plumbing) or defer to its own pass?

---

## §5 — Tauri backend security surface (preview only)

Tier 0 doesn't add Tauri commands — that's Tier 1+. But the plan's overall arc adds many new Rust commands with real security implications: `read_file`, `list_files`, `run_script`, `fetch_authenticated`. Before any of those land, report:

1. Current Tauri capability config — what's in `src-tauri/capabilities/*.json`? What permissions are currently granted?
2. Sandbox/scoping primitives — does Tauri 2 offer fs-scope or path-scope plugins that constrain `read_file`/`list_files` to a configured root? Or do new commands need to implement path validation themselves?
3. The plan's `run_script` command says "sandboxed: only allows scripts within the project directory" — what would a robust implementation of that look like? (Path normalization, symlink resolution, denylist.) Just describe; don't implement.
4. Credential storage (Tier 6) — `tauri-plugin-stronghold` is mentioned. Is it currently a dependency? If not, would adding it require Ryan's per-install approval per the standing rule?

This isn't a Tier 0 blocker — it's a heads-up so the Tier 1+ scoping is grounded in real security primitives, not assumptions.

---

## §6 — Recommended next pass

Given §1–§5 findings, propose ONE concrete v107.0.0 pass:
- What it does (a focused, small step — not the full Tier 0 if Tier 0 looks larger than expected).
- Files touched (explicit list).
- Pre-flight gates needed (any decisions you'd want Ryan to confirm before implementation).
- Estimated commit count (one slice or multiple).

Plus: if Tier 0 needs to be split into multiple passes (e.g. plumbing repair → settings schema → UI as three passes instead of one), say so and propose the sequence.

---

## Output format

One markdown file, six sections as numbered above, file:line citations throughout. Explicit drift table for §1. Difficulty ratings (LOW/MED/HIGH) on every feasibility question. Recommendation section is your proposal; planning Claude will reason over it, not just adopt it.

When complete: drop the report into PK so planning Claude can scope from it. No commits. No code changes.
