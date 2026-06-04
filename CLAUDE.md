# CLAUDE.md — LumaWeave (project-specific)

Generic operating rules (engineering principles, package-install safeguard, Discord protocol, diagnostics/reporting format) are inherited from the parent `~/Projects/CLAUDE.md` and `~/Projects/DISCORD_PROTOCOL.md`, which auto-load for every project. This file adds only what's specific to LumaWeave. If a rule here conflicts with the parent, the parent's safety rules (esp. the package-install safeguard) still win.

## What this project is

LumaWeave is a local-first, graph-based architecture-visualization workbench for a single developer (no team). It renders code, docs, and configs as a typed node/edge network with custom physics layouts (gwells), theme tokens, and a tile/panel system.

Stack: TypeScript, React 19, Vite, Sigma.js (graph), Zustand (state), Playwright (E2E). Tauri 2 shell (React webview + Rust backend). Node 22.

The tree is mid-migration from "everything in AppShell" to "everything through a registry." Both patterns coexist; we migrate selectively, not all at once.

**Live state — current version, roadmap, known bugs — lives in `docs/LUMAWEAVE_NOW.md`.** This file holds only timeless project facts. If anything here looks version-specific or stale, check LUMAWEAVE_NOW or ask the developer.

## Working relationship

A planning Claude (chat interface) drafts structured prompts; you (Claude Code) execute them, and also take direct requests from the developer. Read the whole prompt first (phases, STOP gates, the "Don't" list), execute phase-by-phase, check actual-vs-expected at each boundary (match → continue, mismatch → report and pause), report verbatim, and don't continue past the final phase without direction. When scope or intent is unclear, ask rather than guess — you can pause mid-task.

## Discord protocol — approvals & coordination

**Hard rule: MCP only.** All Discord operations use the **Discord MCP server ONLY** — never raw HTTP. If MCP is down, HALT before any gate and report.

### Channel IDs (use IDs, not names)

- **#approve-this** — `1506441138612080680` — approval gates for commit / merge / push / destructive git
- **#current-task** — `1506440945128701955` — lifecycle tracking (brief START + END per pass)
- **#changelog** — `1509728570367283250` — `── PASS COMPLETE ──` reports for bumper (write-once by agent)
- **#notifications** — `1506441052826107964` — detailed run updates (test results, diagnostics, failures)
- **#brainstorm** — `1506441106869583932` — high-ROI improvements only

### Approval gates

**Always ping #approve-this before:** any commit, any merge, any push, any destructive git action, any blog bumper push.
**Never ping for:** reads, typechecks, test runs, diagnostics, in-scope edits not yet being committed.
**Recognized responses:** `approve` / `yes` / `lgtm` / `go` (proceed); `reject` / `no` / `stop` (halt); corrections (apply and re-confirm).

**Polling for responses:** After posting to #approve-this, you will NOT see responses via implicit notifications. Use the Monitor tool to poll the channel every 15 seconds indefinitely: fetch the latest messages from #approve-this, check for a response to your gate post, and parse the response. This is mandatory — without polling, you'll wait forever and the developer won't see you continue.

### Per-pass flow (commit → blog)

1. **Brief START** to #current-task (phase name, key results)
2. **Work + verify**, foreground
3. **Brief END** to #current-task
4. **MERGE GATE** → post to #approve-this with:
   - The `── PASS COMPLETE ──` message as a **code block** (for review)
   - **Character count** (must be ≤ 1800 chars; under 200 char safety margin from Discord's 2000 limit)
   - Confirmation that all required fields are present
5. **Once approved:** post the PASS COMPLETE **verbatim** (no changes) to #changelog
6. **Immediately after:** run `bumper bump --dry` to test the blog post generation
7. **BUMP+PUSH GATE** → post to #approve-this with:
   - Dry-run output
   - Project (LumaWeave) push details
   - Blog (blog.bumper) push details
   - Option: "approve both" or "reject / request changes"
8. **Once approved:** run `bumper bump` live (pushes both repos)

### PASS COMPLETE format (1800-char budget)

```
── PASS COMPLETE · v<version> · YYYY-MM-DD ──────────────────

Title: <single line, max 80 chars>
Summary: <1-2 sentences, max 250 chars>
Project: lumaweave

Highlights:
· <max 100 chars per bullet, max 6 bullets>

Learnings:
· <max 100 chars per bullet, max 3 bullets>

Commit: <sha7>
Tests: N passed · M failed · K skipped
Branch: clean
```

If the message won't fit under 1800 chars, trim bullets (prioritize content over count). The Commit line is load-bearing — it **must** land in the same message as the delimiter for bumper to parse it.

**One message per pass, no re-posts.** Once a PASS COMPLETE is in #changelog, bumper reads it and marks it as processed. Deleting and re-posting breaks the idempotency key. If a pass needs correction, post a new message with a trailing letter (`v105a`, `v105b`) rather than overwriting.

### Discord Mode (optional async)

For working async while the developer steps away: developer sends `/dm` in any channel to activate. Post milestones to #notifications. Blocking issues or destructive ops → post to #notifications/#approve-this and wait. Discord Mode naturally pauses at approval gates (async-safe by design). Exit automatically on completion or explicit `pause`/`stop` reply.

## Blog.bumper integration

LumaWeave posts are published via `blog.bumper`, a stateless CLI that reads `── PASS COMPLETE ──` reports from #changelog and renders them as blog posts.

### PASS COMPLETE format (exact & load-bearing)

The header regex is strict: `── PASS COMPLETE · v\d+(?:\.\d+){1,2}[a-z]? · YYYY-MM-DD ──`

**Critical:** The version must include at least one dot-separated segment (e.g., `v105.0`, not `v105`). Trailing dashes must be exactly two: ` ──`, not a long line.

```
── PASS COMPLETE · v105.0 · 2026-06-04 ──

Title: <4-8 words, blog-suitable>
Summary: <one sentence, 20-300 chars>
Project: lumaweave

Highlights:
· <concrete change, max 100 chars, max 6 bullets>

Learnings:
· <optional insight, max 100 chars, max 3 bullets>

Commit: <7-char SHA>
Tests: <N> passed · <M> failed · <K> skipped
Branch: clean
```

Character budget: total message **≤ 1800 chars** (200 char safety margin from Discord's 2000 limit). If over, trim bullets (prioritize Highlights).

### Bumper workflow

1. **Post PASS COMPLETE to #changelog** (single message, must fit 1800-char budget)
2. **Run dry-run:** `cd ~/.bumper && npx blog.bumper bump --dry --msg <message-id> 2>&1`
3. **Post dry-run output to #approve-this** as BUMP+PUSH GATE (version, title, slug, write target, git commit, push target)
4. **Get approval** (`approve both`, `reject`, or request changes)
5. **Run live bump:** `cd ~/.bumper && npx blog.bumper bump --msg <message-id> 2>&1`
6. Blog post is now live at https://www.bitmosh.dev/

**Important:** Use `--msg <id>` to bump a specific message (otherwise `bumper` reads the second-most-recent via `buffer=1`). Message ID comes from Discord — visible in Discord dev tools or from `fetch_messages` API.

**Fixes go to source:** If a gate review finds a wording problem, fix the report in #changelog and re-run dry-run / gate / bump. Never edit the rendered MDX directly — `bumper` regenerates it from the source report.

## Registry-driven architecture

Many subsystems use a registry: one source of truth that consumers iterate, instead of hardcoded lists. Examples: `tileSectionRegistry`, `themeTargetRegistry`, `systemIndexRegistry`, `controlSurfaceContractRegistry`, `motionSafetyRegistry`, `audioSourceRegistry`, `musicReactiveMappingRegistry`, `bookmarkRegistry`, `seedFunctionRegistry`, `commandRegistry`, `featureRegistry`, `panelRegistry` (stale, slated for reconciliation). When tempted to hardcode a list, check for a registry and iterate it. Patterns/tiers: `docs/canonical/REGISTRY_AND_LINK_NETWORK.md`.

## State & component patterns

- Persisted state lives in `useSettingsStore`. Read current state inside callbacks via `useSettingsStore.getState()` (synchronous, bypasses React's render cycle) — the canonical "read latest store state in a callback" pattern. `useRef`+`useEffect` syncing into callbacks is a workaround; prefer `getState()`. (See KNOWN_SHARP_EDGES for the stale-closure trap this avoids.)
- `useState` for local state only; cross-component/persisted → settings store or a dedicated context (e.g. `TileProvider`).
- Contexts for cross-cutting concerns (theme, tile state); Zustand for app data.

## CSS & tokens

- Theme tokens are CSS variables from `src/styles/lumaweave-visual-handles.css` and friends. Use `var(--lw-accent, #fallback)` so theme overrides propagate.
- `data-lw-theme-target` marks theme-inspector-interactable elements; `="ignore"` opts internal-only ones out.
- Prefer logical properties (`inset-inline-start`, `margin-block`) for directional values — enforced as warnings via stylelint-plugin-logical-css; dimensional `width`/`height` are exempt.
- Avoid `[data-attr]::after { content: "text"; }` — invisible to JSX greps. Tailwind utilities are fine for layout.

## Test discipline

- `npm run qa:e2e` — full Playwright suite. `-- <path>` for one file; `-- --grep "<pattern>"` by name. `npm run typecheck` — TS strict.
- Foreground only, one suite at a time — no background runs, no timeout wrappers (they pollute results). Browsers at `$HOME/pw-browsers` via `PLAYWRIGHT_BROWSERS_PATH`; never reinstall.
- Don't leave `test.only` (disables the rest of the file). Use `test.fixme` for pending; avoid `test.fail` (forces exit 1 in this Playwright version).
- CI must run `npm run generate:graph` before typecheck (the self-graph fixture isn't committed). Both CI jobs run on Node 22.

## File organization

- `src/app/` — shell (AppShell, AppProviders)
- `src/control-plane/` — panels, settings, tile system, command deck
  - `panels/` — CollapsibleSection, TileProvider, TileLayer, FloatingTile, TiledOutIndicator, section content
  - `settings/` — store, schema, migrations, SettingsPanel
- `src/themes/` — tokens, target registry, override storage
- `src/graph/` — Sigma rendering, graph types
- `src/physics/` — gwells engine
- `src/control-plane/system-index/` — system index registry browser
- `tests/e2e/` — Playwright
- `docs/` — `LUMAWEAVE_NOW.md` (live state) · `canonical/` (domain reference) · `known-bugs/` (one file per bug, kebab-case) · `agent/` (operating docs)

## Commits

`--no-ff` merges for branch integrations. Single-line subject + multi-paragraph body (the *why*). Don't combine unrelated changes. Stage explicit paths — never `git add -A`.

## LumaWeave reference docs (load when relevant)

- `docs/LUMAWEAVE_NOW.md` — live version, roadmap, known bugs
- `docs/agent/PROJECT_CONVENTIONS.md` — full conventions + the war-story incidents behind the principles
- `docs/agent/KNOWN_SHARP_EDGES.md` — stale-closure trap, Playwright cache self-heal, self-graph fixture, known test flakes
- `docs/agent/DIAGNOSTICS.md` — failure classification, situation-report template, console.log/stack-trace patterns
- `docs/canonical/` — domain reference (registry, theme, graph, physics, source-adapter, control-plane, tile-layout, deferred-vision)
- `docs/agent/survival-manual/` — diagnostics + debugging deep-dives (01–08)
- `docs/agent/protocols/` + `docs/agent/onboarding/` — governance, QA-key lifecycle, multi-agent policy
- `docs/quest/QUEST_TEMPLATE.md` — situation-report template

(Generic rules — engineering principles, STOP gates, package safeguard, Discord protocol + channel IDs, reporting format — come from `~/Projects/CLAUDE.md` and `~/Projects/DISCORD_PROTOCOL.md`.)
