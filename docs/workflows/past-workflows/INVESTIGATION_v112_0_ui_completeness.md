# Investigation brief — v112.0 UI completeness + content substitution

**For:** Terminal Claude · **Output:** one markdown report dropped into PK as `v112_0_ui_completeness_report.md` · **No code changes, no commits, no installs.**

v112 is the UI-completeness arc per `~/Projects/lumaweave/docs/SHIP_READINESS_ROADMAP.md` §3. Originally framed as "remove placeholders," but Ryan clarified that the placeholders refer to *placeholder content* inside real features — not the features themselves. v112 is about substituting honest content for stub content while keeping all the feature scaffolding intact.

The work is **needle-picking**:
- Dev-language strings in user-visible UI → user-language equivalents
- Hardcoded values that should be dynamic registry reads → wire to registry
- Stub UI surfaces → minimum-viable real content OR honest placeholder OR dev-gated OR removed
- Internal arc numbers ("Coming in v92") → user-friendly language
- Dev tooling tiles → user-facing reframe OR dev-gate OR remove

This brief audits each surface and proposes a decision per placeholder.

**Hard stops:**
- No code changes. No commits. No installs.
- Cite file:line for every claim. Quote actual current content where decisions depend on it.
- Each section asks specific questions; answer with direct evidence.
- For each placeholder, propose ONE concrete action: substitute / dev-gate / remove / honest-placeholder.
- Tradeoff analysis in product terms, not just code structure.

---

## §1 — Internal arc numbers in user-visible strings (highest-priority bleed)

The audit identified `Coming in v92 (Audio Reactivity arc)`, `Coming in v93 (Physics Dialect arc)`, `Coming in future arc (Typography axis token wiring)`, etc. as user-visible internal-arc-number bleed.

1.1 Grep the entire source tree (`src/`) and any en.json (i18n strings) for:
- `Coming in v` (case-insensitive)
- `v\d+ (` (regex — matches arc-number references)
- `arc` in user-visible string contexts (NOT in code comments or test names)
- `phase` in user-visible string contexts
- Other dev-language candidates: "TBD", "TODO", "WIP", "stub" in any string that renders to a user

1.2 For each occurrence, quote:
- File and line
- The current string
- What UI surface it renders in (which menu, which tile, which spoke)
- Recommended user-language replacement

1.3 The four known cases from `en.json` per project knowledge:
- `inspector.code.placeholderMessage: "Coming in v98 (Code Spoke arc)"`
- `inspector.layout.placeholderMessage: "Coming in v93 (Physics Dialect arc)"`
- `inspector.motion.placeholderMessage: "Coming in v92 (Audio Reactivity arc)"`
- `inspector.type.placeholderMessage: "Coming in future arc (Typography axis token wiring)"`

For each, propose:
- New string in user-language (e.g., `"Layout controls coming soon."` or `"Typography controls in development."`)
- Whether the placeholder UI itself can be replaced with minimum-viable real content (see §3 for inspector spoke breakdown)

1.4 Look for other arc-number bleed in **tile section names, panel headers, menu items, tooltips, status messages**. Anywhere a user might see them.

---

## §2 — Hardcoded values that should be dynamic registry reads

Ryan's framing: "changing over hard coded items to their actual dynamic function." There are places in the code where a registry exists but the UI still uses a hardcoded list/value/string.

2.1 Identify hardcoded UI content that has a corresponding registry. Likely candidates:
- Inspector spoke list — hardcoded in any UI vs. read from `inspectorSpokeRegistry.ts`?
- Theme list — hardcoded in any UI vs. read from `themePresets.ts` / `builtInThemePresets`?
- Physics dialect list — hardcoded in any UI vs. read from `physicsDialectRegistry.ts`?
- Source adapter list — hardcoded in any UI vs. read from `sourceAdapterRegistry.ts`?
- Tile section list — hardcoded in any UI vs. read from `tileSectionRegistry.ts`?
- Command list — hardcoded in any UI vs. read from `command-registry.ts`?
- Hotkey display strings — hardcoded vs. read from `hotkey-registry.ts`?
- Inspector spoke icons, labels, statuses — hardcoded vs. registry?

2.2 For each hardcoded → registry candidate found, quote:
- The hardcoded location (file:line, current array/list)
- The corresponding registry that should be the source of truth
- Estimated complexity of wiring (LOW = one line, swap source; MED = needs a hook/selector; HIGH = registry doesn't expose the needed shape)

2.3 Flag any **divergences** between hardcoded UI and registry — places where the UI shows an outdated list vs. what the registry actually contains. These are silent bugs worth surfacing.

---

## §3 — Inspector ring spoke content audit

Ryan's decision (locked): all 9 spokes stay. The 3 currently-stubbed spokes (Type, Motion, Layout) need:
- User-language placeholder messaging (not "Coming in v92")
- Confirmation that the spokes are properly registered in the devpath (planned arcs exist for filling them)

3.1 For each of the 6 working spokes (Color, Geometry, Code, Apply to…, Open in IDE, History):
- Confirm they render real content (not stubs)
- Note any minor polish needed (typos, awkward labels, registry-divergence)

3.2 For each of the 3 stub spokes (Type, Motion, Layout):

**Type spoke** (Ryan: typesetting — font size, color, possibly axis sliders):
- What does the spoke currently render?
- Is there a `typographyRegistry.ts` or `fontAxisRegistry.ts` that has the data needed for a real minimum-viable Type spoke? (Per project knowledge, both files exist.)
- Could v112 wire up a minimum-viable Type spoke now (font family selector, size slider, color picker), or is this a real future arc?
- Recommend: substitute with MVP / honest placeholder / split into both (MVP for color+size, placeholder for axes)

**Motion spoke** (Ryan: audio reactivity hooks per gwells improvement plans):
- What does the spoke currently render?
- Are there existing motion-related registries? (`animationPrimitiveRegistry.ts`, `motionSafetyRegistry.ts`, `musicReactiveMappingRegistry.ts` per project knowledge.)
- Could v112 wire up motion-safety controls (Reduce Motion toggle, animation primitive picker) as MVP, with audio reactivity remaining placeholder?
- Recommend: substitute / placeholder / split

**Layout spoke** (Ryan: gwells improvements land here):
- What does the spoke currently render?
- Are there existing layout registries to wire? (`physicsDialectRegistry.ts`, `lensRegistry.ts` per project knowledge.)
- Could v112 wire up dialect-picker as MVP, with deeper gwells controls remaining placeholder?
- Recommend: substitute / placeholder / split

3.3 Confirm that each stub spoke is **referenced somewhere in the devpath** (e.g., ROADMAP §4 deferred items, the gwells handle taxonomy doc, a "planned arcs" doc). If a stub spoke has no planned arc, that's a roadmap gap to flag.

---

## §4 — Theme menu sub-area audit

Ryan's decision (in shape, not detail): preserve what's possible, design toward consensus. Browse + Active stay. The 4 stub sub-areas need per-area assessment.

4.1 Audit each stub sub-area against "is there a minimum viable version that ships in v1.0?":

**Workshop** ("compose a theme from scratch"):
- What does the current stub render?
- Complexity of MVP: would a Workshop need a full palette wheel + semantic mapper + contrast guard, or could it ship as a stripped-down "tweak the active theme" surface?
- Recommend: MVP / honest placeholder (post-v1.0 feature) / remove from menu

**History** (recently applied themes):
- What does the current stub render?
- Complexity of MVP: trivial if theme application is already tracked anywhere (e.g., settings store); harder if no history is recorded today
- Is theme history tracked? Search for any `themeHistory`, `lastAppliedTheme`, or similar state
- Recommend: MVP / honest placeholder / remove

**Bookmarks** (user-pinned themes):
- What does the current stub render?
- Complexity of MVP: needs a bookmark store + UI for adding/removing/listing. Is `bookmarkRegistry.ts` (per project knowledge) related to this?
- Recommend: MVP / honest placeholder / remove

**Export** (emit theme as CSS / JSON / diff):
- What does the current stub render?
- Complexity of MVP: probably trivial — `themeOverrideStorage` and `themePresets` have all the data; export is just serialize + download
- Recommend: MVP / honest placeholder / remove

4.2 For each MVP recommendation, estimate the work in **commits** (not time):
- 1 commit: small, isolated change (Export probably)
- 2-3 commits: medium scope (Workshop, possibly)
- "Not a v112 fit": defer to a dedicated arc

4.3 For sub-areas recommended as "honest placeholder" vs "remove from menu," surface the UX implication:
- Placeholder = user sees the menu entry but it says "Coming soon" — signals "this is planned"
- Remove = user doesn't see the entry at all — cleaner shipped feel but loses the roadmap signal

---

## §5 — Dev tooling tile section triage

Ryan's decision: "reframe as user-facing" as the default bucket. But flag honestly if any tile cannot be reframed.

5.1 For each of the four candidates, audit current state:

**QaPanel** (1606 lines per project knowledge):
- What does it currently render?
- Who is the audience? (Clearly dev work; can ANY user-facing reframe exist?)
- If a reframe IS possible, what would it look like? (E.g., a "What's verified" panel showing test coverage in user terms?)
- If a reframe is NOT possible, the actual call is remove or dev-gate
- Recommend with reasoning

**system-index**:
- What does it currently render?
- Same questions as QaPanel
- Recommend

**command-deck**:
- Project knowledge suggests this is already user-facing (the command palette is core UX)
- Is the *tile-section* version different from the hotkey-invoked overlay version? (One might be redundant.)
- Recommend: keep, rename, or remove tile-section variant (overlay variant stays regardless)

**graph-visual-inventory**:
- What does it currently render? (Per project knowledge, this enumerates every visual element with rendered evidence — debug-shaped.)
- Could this be reframed as a "visual element browser" for users who want to understand what's on screen?
- Or is it purely dev?
- Recommend

5.2 For any tile that "cannot be user-facing-reframed," the call becomes:
- **Remove from registered tile sections** — users don't see it; dev access via URL param or a settings toggle
- **Dev-gate** — keep registered but only render if a `?dev=1` URL param or settings toggle is on

Pros/cons:
- Remove: cleanest user-facing surface; loses convenience for dev work in shipped builds
- Dev-gate: preserves dev workflow; adds a feature flag to maintain

5.3 If "reframe" IS the answer for a tile, sketch what the reframed version would look like at a high level (UI shape, what content it shows in user-language, naming).

---

## §6 — AgentChatPlaceholder → minimal real chat

Ryan's decision: wire it up to Ollama as minimal real chat. Docker-compose + LiteLLM YAML available when needed.

6.1 Audit the current AgentChatPlaceholder tile:
- What does it render now?
- Where is it registered? (`tileSectionRegistry.ts` likely.)
- What testid does it have?
- What's the React component file?

6.2 Define the integration shape:

**Integration architecture options:**

**Option A — Direct webview fetch to Ollama.**
- Ollama runs locally (Docker per Ryan's setup); HTTP API at `http://localhost:11434/api/chat`
- React component does `fetch()` directly from the webview
- Pros: simplest; no Tauri command needed; works the same as a browser app
- Cons: webview CORS rules may require config; Ollama API is direct and exposed
- Cost: low — 1-2 commits

**Option B — Tauri command proxy.**
- Add a Rust Tauri command `chat_with_ollama(messages) -> response`
- React calls `invoke("chat_with_ollama", { messages })`
- Rust handles the HTTP call to Ollama
- Pros: hides backend choice from frontend (could swap Ollama for LiteLLM, OpenAI, Cerebra IPC later); no CORS concerns; aligns with existing Tauri command discipline
- Cons: more code; another audit-by-eyeball Rust surface
- Cost: medium — 2-3 commits

**Option C — LiteLLM proxy.**
- Ollama behind LiteLLM's OpenAI-compatible interface (per Ryan's hosting stack)
- React fetches against LiteLLM URL with OpenAI-style payloads
- Pros: same API surface as OpenAI/Anthropic/etc.; clean swap path later
- Cons: requires LiteLLM running; adds an infra layer for a v1.0 feature
- Cost: depends on whether LiteLLM is required infra anyway

Recommend with reasoning. Bias toward whichever fits LumaWeave's existing architectural patterns best (Tauri command discipline + audit-by-eyeball Rust suggests Option B).

6.3 Define minimum-viable chat UI:
- Message list (user + assistant turns)
- Text input + send button
- Loading state during streaming/waiting
- Error state (Ollama unreachable, model failed, etc.)
- Persistent across tile open/close? Or fresh per session?
- Conversation history saved anywhere? (Cerebra eventually — for v1.0, probably ephemeral.)

6.4 Forward-compat hooks:
- When Cerebra IPC eventually lands (post-v1.0 per `INTEGRATION_FUTURES.md`), this chat surface becomes the LLM frontend for Cerebra's agent
- The Tauri command shape (Option B) makes the swap easy: same `invoke()` call, different Rust backend
- Document this expected evolution

---

## §7 — Other dev-artifact bleed candidates

The audit's "dev-artifact bleed" framing covers more than just the named items. Scan for other categories:

7.1 **Console output in production**:
- Grep for `console.log`, `console.warn`, `console.error` in `src/` (excluding tests)
- Categorize: legitimate (e.g., ErrorBoundary's error log) vs. debug bleed (e.g., "yo, this fired")
- Recommend: keep / wrap in DEV guard / remove

7.2 **`window.__lw*` globals**:
- These are dev/test conveniences (per `main.tsx:17` `window.PLAYWRIGHT = true` discovery in v111.4e)
- Are any of them harmful in production? (Probably not — they're useful but unnecessary)
- Recommend: keep (status quo) or guard behind `import.meta.env.DEV` (cleanup; some test impact)
- This decision affects v111.4-style work later; flag the tradeoff

7.3 **Debug UI surfaces**:
- StatusCluster (cleaned in v110.1) — anything similar?
- Any "developer panel" or "diagnostics" surface that's not in §5's named tiles?
- Recommend per surface

7.4 **Tooltips, ARIA labels, accessibility strings**:
- Quick scan for dev-language in `aria-label`, `title`, tooltip content
- These are easy to miss but user-visible to screen readers

7.5 **Empty states**:
- When a tile has no content (e.g., "No graph loaded"), what does it say?
- Are any empty states dev-language? ("No data; load a source") vs user-language ("Choose a data source to begin")
- Recommend per empty state

---

## §8 — Pass shape and sequencing for v112

Given the audit findings, propose v112's sub-pass structure. Original ROADMAP §3 v112 listed 5 sub-passes; with the recalibrated needle-picking framing, the structure may shift.

**Candidate sub-passes:**

- **v112.1** — Internal arc-number string scrub (§1) — mechanical, low-risk, fast feedback
- **v112.2** — Hardcoded → registry wiring (§2) — pick LOW/MED complexity items; HIGH items defer
- **v112.3** — Inspector ring stub-spoke content (§3) — each stub spoke gets per-spoke treatment (MVP or honest placeholder)
- **v112.4** — Theme menu sub-area assessment (§4) — Export and History likely MVP; Workshop and Bookmarks likely honest placeholder
- **v112.5** — Dev tooling tile triage (§5) — per-tile decision
- **v112.6** — AgentChatPlaceholder → Ollama chat (§6) — biggest single new feature in the arc
- **v112.7** — Other bleed (§7) — console output, debug surfaces, empty states
- **v112.8** — Arc close (semver 0.18.0 → 0.19.0)

8.1 Should any sub-passes combine? Likely candidates:
- v112.1 + v112.7 (both are mechanical string/output cleanup)
- v112.3 + v112.4 (both are stub-content assessments with similar shape)

8.2 Should any sub-passes split further? Likely candidates:
- v112.6 (Ollama chat) might want investigation-brief-first since it introduces a new external dependency

8.3 What's the dependency order? (E.g., can the registry-wiring (v112.2) be done before the stub-spoke content (v112.3), since some of the stub content might want to read from registries?)

8.4 Total commit count estimate (not time). v110 was 3 commits; v111 was 8 (5 planned + 3 amendments). v112 is probably wider than either — estimate 8-12 commits depending on combinations.

---

## §9 — Pre-flight decisions for Ryan

Aggregate findings into a clear decision checklist:

1. For each internal arc-number string in §1: substitute / honest-placeholder language?
2. For each hardcoded → registry candidate in §2: wire now / defer to later arc?
3. For each stub inspector spoke in §3: MVP / honest placeholder / split?
4. For each theme menu sub-area in §4: MVP / honest placeholder / remove?
5. For each dev tooling tile in §5: reframe / dev-gate / remove? (Honest assessment per tile, not bucket-wide.)
6. AgentChatPlaceholder integration architecture: Option A (direct fetch) / Option B (Tauri command) / Option C (LiteLLM proxy)?
7. For console output, `__lw*` globals, empty states: keep / DEV-guard / scrub?
8. v112 sub-pass shape: 8 sub-passes as described / consolidated / re-sequenced?

Each gets investigator's recommendation + reasoning. Ryan locks decisions; planning Claude scopes implementation from there.

---

## Output format

One markdown file in PK as `v112_0_ui_completeness_report.md`. Nine sections (§1-§9). File:line citations for every code claim. Tradeoff analysis in product-language. LOW/MED/HIGH ratings where relevant. When complete: ping back; planning Claude reads + works through §9 with Ryan; then scopes v112.1+.

**Honest about gaps:** v112 is the largest IA-heavy arc in the home stretch. The report should be comprehensive but not exhaustive — surface the biggest needles; the smallest ones can be triaged during implementation. If a category has more than ~20 instances, sample and recommend a pattern rather than enumerating every one.
