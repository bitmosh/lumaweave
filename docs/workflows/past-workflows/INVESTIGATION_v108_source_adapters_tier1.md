# Investigation brief — v108 Source Adapters, Tier 1 (self-graph live mode)

**For:** Terminal Claude · **Output:** one markdown report dropped into PK · **No code changes, no commits, no installs.**

The basis for Tier 1 is `docs/prototypes/source-adapter-plan.md` §"Tier 1" — self-graph live mode. Goal: replace the static fixture with a live read from disk + a "Regenerate" button that runs the generator script. This is the first arc with real OS-level access (`read_file`, `run_script` Tauri commands), so the security surface is the dominant design concern. Tier 0 landed the routing infrastructure (`loadSource` is adapter-dispatched, settings-driven), so Tier 1 plugs into `loadSelfGraph` without touching the hook or panel.

**Hard stops:**
- No code changes. No commits. No installs (do not run `npm install`, `cargo add`, or any dependency mutation).
- Cite file:line for every factual claim about current code.
- For Tauri/Rust API claims, cite the Tauri 2 docs URL or the relevant `Cargo.toml` of a Tauri plugin if you read one. If a claim is from cached knowledge without verification, mark it explicitly.
- This is a **design investigation** — recommendations matter, but back every recommendation with a tradeoff analysis, not a preference.

---

## §1 — Tier 0 outcome verification (quick)

Before scoping Tier 1, confirm Tier 0 actually landed the routing infrastructure cleanly:
1. `loadSource(adapterId, inputPath)` exists in `src/graph/ingest/loadSource.ts` with the adapter-dispatch logic. file:line.
2. `useGraphSourceSummary` reads `settings.sources.active` and re-fires on changes. file:line.
3. `SourceAdapterPanel` has a "Set as active" button per registered entry. file:line.
4. `sources.active` defaults to `"self-graph-yaml-frontmatter"` on a clean install. file:line.
5. `loadGraphifySource.ts` is fully deleted (no shim). Confirm with `git log --diff-filter=D --name-only` or directory listing.

If any of the above is missing or different than expected, flag it — Tier 1 plans assume Tier 0 is sound. (This is hygiene, not deep audit.)

---

## §2 — Where Tier 1 plugs in

Tier 1 doesn't touch `loadSource`'s dispatch — it implements the *self-graph* adapter's load behavior. Today that behavior fetches a fixture. Tier 1 changes it to read from disk via a new Tauri command.

Report:
1. **Where in `loadSource.ts` does the self-graph adapter actually load data?** Is there a switch on `adapterId` that routes to a specific loader, or is the fixture fetch the universal default? Quote the dispatch logic.
2. **What's the current self-graph fixture path?** (Static or computed.)
3. **What's the expected `inputPath` shape from settings?** The Tier 0 schema added `configurations: Record<string, { inputPath?: string }>` — for self-graph, what should `inputPath` be by default? An absolute path? A path relative to the project root (which the existing `get_project_root` Rust command can provide)? Recommend a convention.
4. **Where does `GraphSourcesTileContent` live, and how is its UI structured?** Tier 1 adds a "Regenerate" button there — confirm the file path and report the current panel structure (does it have any buttons today? Where would a new button fit semantically?). file:line.
5. **What's the current self-graph generator script?** Per the plan, it's a node script in the repo. Report the path, what it does at a high level, and whether it writes its output to a predictable location.

---

## §3 — Tauri 2 filesystem access — sandbox vs manual validation

This is the critical design question for Tier 1. Tauri commands run with full process privileges; if `read_file` accepts an arbitrary path, it can read `/etc/shadow`, the user's SSH keys, anything. The mitigation choices have real tradeoffs.

### 3.1 `tauri-plugin-fs` route

Report:
- Does `tauri-plugin-fs` (Tauri 2.x) exist and is it the canonical filesystem-access plugin? Cite the official docs URL.
- What does its **scope configuration** look like? Specifically: how do you declare allowed paths in `capabilities/*.json` so that the plugin enforces them automatically? Show an example config.
- Does the plugin handle path normalization (resolve `..`, symlinks) before scope-checking, or is that still our responsibility? Cite the docs.
- What's the **API surface** the frontend gets? (e.g. `readTextFile(path)`, `readDir(path)` — quote the actual function names and signatures.)
- **Tradeoff analysis:** what does using this plugin cost (new dependency, new capability config complexity, learning curve), what does it gain (battle-tested scope enforcement, less Rust to write)?

### 3.2 Manual path validation in Rust route

Report:
- What would a robust manual `read_file(path: String)` command look like in Rust? Specifically, the sandbox sketch from the v107 investigation:
  - `std::fs::canonicalize(root.join(path))` — resolves `..` and symlinks against the project root.
  - `canonical_path.starts_with(&canonical_root)` — prevents traversal.
  - Edge cases: symlinks pointing outside the project root (canonicalize would follow them; the starts_with check catches it — confirm).
  - What happens on Windows (path separators, UNC paths)? Even though LumaWeave is dogfooded on Linux, confirm whether a Windows port would need different validation.
- Same for `list_files(path: String)` — sandbox approach.
- **Tradeoff analysis:** more Rust to maintain + harder to get right, but no new dependency.

### 3.3 Recommendation

Given LumaWeave's actual use case (dev-tool dogfooding its own repo, single project root, no need for cross-project filesystem access), which approach is right? `tauri-plugin-fs` + scope config, or manual Rust validation? Or a hybrid (use the plugin for reads, manual for the script-exec case)?

Rate the chosen approach's **difficulty:** LOW / MEDIUM / HIGH. Note any per-install approvals required (the plugin would be a new Rust dependency, which needs Ryan's per-install sign-off per CLAUDE.md).

---

## §4 — `run_script` — the highest-risk command

Even with filesystem reads sandboxed, executing arbitrary processes is a separate, higher-risk concern. The v107 investigation §5.3 sketched the safe pattern:

1. Canonical path resolution.
2. Root prefix assertion.
3. **Filename allowlist** (hard-coded set of permitted script names — no shell expansion of the script name).
4. Array invocation (`Command::new("node").arg(script).args(args)` — never `/bin/sh -c "..."`).
5. Timeout (e.g. 60s via `tokio::time::timeout`).
6. Output size cap (e.g. 10 MB to prevent memory exhaustion).

Report on each:
1. **What scripts does the allowlist need to contain for Tier 1?** Just the self-graph generator? (Cite the script path.) If only one, the allowlist is trivial; if it's "any script in `scripts/` matching a pattern," the design is harder.
2. **Are there any Tauri plugins (like `tauri-plugin-shell`) that offer this with built-in safety primitives?** If yes, what's the API + tradeoff? If no, confirm manual implementation is the only option.
3. **What does `Command` look like in Tauri 2 Rust?** `std::process::Command` directly, or a Tauri wrapper? Cite.
4. **How should stdout/stderr be returned to the frontend?** Streaming (more UX-friendly, more complex) or buffered (simpler, but UI waits)? Recommend.
5. **Error handling:** if the script exits non-zero, what should the command return? An error result the panel can surface? Confirm.

Rate Tier 1's `run_script` implementation difficulty: LOW / MEDIUM / HIGH.

---

## §5 — Permission grant model

Even sandboxed, the *first* time a user hits "Regenerate" or the app reads a file, should there be a permission prompt? Or do the capability config + scope assertions make a prompt unnecessary?

Report:
1. What's Tauri 2's permission-prompt UX for fs/shell plugins? Does it auto-prompt on first command invocation, or are capabilities granted at build-time (no runtime prompt)?
2. For a dev tool dogfooding its own repo, is a runtime prompt appropriate (defense-in-depth) or paranoid (the user *is* the dev)?
3. **Recommendation:** for Tier 1's `read_file` (reading the generated self-graph JSON) and `run_script` (running the generator), should the user see a one-time consent dialog, an always-confirm-on-run dialog, or no prompt (capability config is sufficient)?

---

## §6 — UI surface — "Regenerate" button + status

Tier 1 adds visible UX in `GraphSourcesTileContent`. Report on the design:

1. **Where does the button go?** Quote the current `GraphSourcesTileContent` JSX structure (file:line) and propose insertion point.
2. **States it needs:**
   - Idle (default — button enabled, says "Regenerate").
   - Running (script executing — disabled, spinner or progress).
   - Success (briefly highlight, then revert to idle; refresh `loadSource`).
   - Error (show the error from stderr, keep last-good summary visible).
3. **What triggers a re-read of the generated file?** After `run_script` succeeds, does the hook automatically re-fire (via a settings tick, a manual `mutate`, etc.)? Or does the regenerate flow need explicit cache-invalidation? Report the cleanest pattern.
4. **What testids will the E2E spec need?** Propose names so the test layer is designed for testability upfront.

Rate the UI work: LOW / MEDIUM / HIGH.

---

## §7 — E2E and manual-smoke implications

Tier 1 adds capabilities that **cannot be tested via Playwright** in the normal way (Tauri invoke is a no-op in browser, and even if it weren't, executing real scripts during E2E would be a mess). Report on the test strategy:

1. **What can be tested via Playwright?** (Probably: button presence, state transitions via a mock invoke, settings-driven adapter routing.)
2. **What must be manual-smoke only?** (The actual file read, the actual script execution.)
3. **Is there a mock-invoke pattern in the existing E2E suite?** (`__lwTauriInvokeMock` or similar — confirm.) If yes, use it; if no, recommend whether to build one for this arc or accept the manual-smoke gap.
4. **Coverage gap for the docs:** what should be logged as "Tauri-only / not E2E-covered" similar to how open-in-IDE is logged?

---

## §8 — Pre-flight decisions Ryan will need to confirm

List every decision point this investigation surfaces that requires Ryan's call before implementation. Format as a checklist of clear questions, each with the investigator's recommendation + reasoning. Examples:
- "Use `tauri-plugin-fs` (requires per-install approval) vs manual Rust validation. Recommend X because Y."
- "Stream stdout vs buffer. Recommend X because Y."
- "Filename allowlist: hard-coded `["generate-self-graph.mjs"]` vs config-driven. Recommend X because Y."
- "Permission prompt model: capability-config-only vs runtime prompt. Recommend X because Y."

Don't recommend a side and call it done — surface the tradeoff explicitly so Ryan picks with full information.

---

## §9 — Recommended pass shape

Given §1–§8 findings, propose the v108 Tier 1 arc shape:
- **Single pass or multiple?** (Tier 1 has 2 new Rust commands + UI + settings glue + test mocks — likely multiple passes.)
- **Suggested sequence** (e.g. "v108.0.1: `read_file` Rust command + scope config; v108.0.2: live self-graph load wired through `read_file`; v108.0.3: `run_script` command; v108.0.4: Regenerate button + UI states; v108.0.5: arc close").
- **Hard sequencing dependencies** — which steps strictly require earlier ones to be in place.
- **Files touched per step** (best estimate; explicit lists).
- **Estimated total scope** (sessions / commit count).

---

## Output format

One markdown file, nine sections, file:line citations for code claims, doc-URL citations for Tauri API claims, LOW/MED/HIGH ratings on every difficulty question, tradeoff analysis (not just preference) on every architectural choice. Drop the report into PK so planning Claude can scope from it. No commits. No code changes. No installs.
