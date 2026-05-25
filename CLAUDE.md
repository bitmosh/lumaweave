# CLAUDE.md — LumaWeave Project Guide for Claude Code

## What this project is

LumaWeave is a local-first, graph-based architecture visualization
workbench. The user is a single developer (no team). The graph
shows code, docs, and configs as a network of nodes and edges with
typed relationships, custom physics layouts (gwells), theme tokens,
and an evolving tile/panel system.

The codebase is in active development. Many systems are in transition
between an older "everything is in AppShell" model and a more
modular "everything goes through a registry" model. Both patterns
exist in the tree right now; we're migrating selectively, not
all-at-once.

Stack: TypeScript, React 18, Vite, Sigma.js for graph rendering,
Tailwind for utility CSS, Zustand for state, Playwright for E2E
testing. Node 20.

## Working relationship

You are working with a developer who plans alongside another Claude
(in the chat interface) and executes work through you (Claude Code).
The planning Claude drafts structured prompts; you receive them
and execute. You may also receive direct requests from the developer.

**The planning Claude and you share training and reasoning patterns.**
Prompts the planning Claude writes are written for you specifically.
Follow them carefully; they encode disciplines learned through real
debugging cycles on this project.

When in doubt about scope or intent, **ask the developer rather than
guessing**. You can pause mid-task. You don't have to push through
when something feels uncertain.

## Core disciplines (non-negotiable)

These are hard-earned lessons. Honor them unless explicitly told
otherwise.

## Failure classification

Before patching any failure, classify it. Don't patch from
vibes. Classification often reveals the correct next action.

Failure classes:
- Environment Prerequisite — missing browser, package, port
- Dependency / API Uncertainty — unfamiliar library behavior
- Selector / Test Harness Mismatch — Playwright can't find
  what's visibly there
- Identity / Binding Drift — key mismatches across surfaces
- Persistence / Reset Bug — state lifecycle wrong
- Runtime Lifecycle / Regression — visual blank, console error,
  graph disappearance
- Obsolete Spec Debt — test targets removed/renamed UI
- Contract / Registry Drift — registry shape changed without
  consumer updates
- Scope Creep — fix requires files outside declared scope
- Docs / Source-of-Truth Drift — code disagrees with docs

For each failure, report:
- Input signal
- Transformation point
- Expected output
- Observed output
- Classification
- Smallest safe fix
- Proof after fix

Full router: docs/agent/survival-manual/02_DIAGNOSTIC_ROUTER.md

### Evidence before fix

Never apply a fix based on a hypothesis without evidence. If a test
fails or behavior is wrong, the first move is to gather diagnostic
information (logs, grep, file contents, DOM inspection). Once
evidence is in hand, then diagnose. Once diagnosis is confirmed,
then fix.

The anti-pattern: "I think the bug might be X, let me try a fix
for X." This burns time and frequently makes things worse. We've
hit this pattern multiple times during the v86c tile system work;
the discipline of "instrument first, fix once you know" is what
got us through.

### Two-attempt cap on iteration

If a fix doesn't work and the second tweak doesn't work, STOP and
report. Don't iterate a third time on the same hypothesis. Three
rounds chasing the same theory means the theory is wrong.

After two attempts, surface the failure to the developer. We may
need a new hypothesis, a deeper diagnostic, or a different
approach entirely.

### Cascade detection

If more than 5 tests fail simultaneously, STOP. Do not let
a cascade run to completion. Do not patch individual failures.

5+ simultaneous failures usually share one root cause. Classify
the shared signature before any code changes. Report the root
cause hypothesis to the developer, then wait for direction.

Anti-pattern: patching the first failure, watching three more
appear, patching those, watching five more appear. By the time
you've "fixed" twenty tests, you've often made things worse and
the original root cause is buried.

If the same failure recurs after 2 distinct strategies, stop
even if total failure count is under 5. That's the two-attempt
cap firing.

### STOP gates

When a prompt has explicit STOP-and-report instructions, honor them
exactly. Don't continue. Don't apply "small fixes while I'm here."
Don't iterate. Report verbatim and wait for direction.

This protects the developer's time. The developer would rather you
stop early and report than continue and produce work that has to
be reverted.

Validation:
  - Typecheck fails after a nontrivial change
  - Playwright failure count exceeds 5 (cascade)
  - New test.skip appears
  - Skipped test count increases unexpectedly

Identity:
  - QA key surfaces disagree
  - Report key differs from active checklist key

Contract:
  - Active control count changes unexpectedly
  - Registry shape changes without consumer updates
  - Test/contract count drops without explanation

Scope:
  - Fix requires files outside declared change list
  - Docs-only pass starts requiring runtime edits
  - Implementation requires registry shape changes

Safety:
  - Command requires sudo/system package changes
  - Git destructive action would be needed
  - Tool needs access outside repo scope

Full conditions: docs/agent/survival-manual/06_STOP_CONDITIONS.md

### Verbatim reporting

When reporting test output, console output, or file contents, paste
verbatim. Don't summarize. Don't paraphrase. Don't skip "the long
parts." The developer (and the planning Claude) need the actual
output to diagnose correctly.

If output is very long (thousands of lines), report the relevant
section verbatim and note what was elided.

**Caveats surface unprompted, not just on request.** If your test
run reused an existing dev server, say so. If a "matching baseline"
might have tested the same compiled code as the comparison run,
say so. If a count "looks clean" but skipped tests increased, say
so. The developer can't ask about caveats they don't know exist.

A truthful stopped report is better than a false clean report.

## Situation report format

When a STOP condition fires, a cascade is detected, or two
attempts at a fix fail, post a structured report:

  Situation Report
  ═══════════════════════════════════════════════════════════
  Mode: [Recovery / Diagnostic / Planning]
  Repo: [branch] · [clean / dirty]

  ──────────────────────────────────────
  CURRENT STATE
  Files changed: [list or none]
  Validation:
    typecheck:      passed / failed
    Playwright:     N passed, M skipped, K failed
    test.skip grep: clean / dirty
    git status:     clean / dirty

  ──────────────────────────────────────
  FAILURE (if applicable)
  Exact failing command/test:
  Failure classification: [from list above]
  Strategies attempted (max 2 before stopping):
    1.
    2.
  Likely shared root cause:
  Not-yet-proven assumptions:

  ──────────────────────────────────────
  SAFE NEXT OPTIONS
  1.
  2.
  3.

Full template: docs/quest/QUEST_TEMPLATE.md

### Diagnostic pattern: console.log + stack traces

When investigating "why isn't this rendering" or "where is this
write coming from," add diagnostic console.log statements:

```javascript
console.log("[ComponentName render]", { relevantState });
console.log("[functionName called]", {
  args,
  stack: new Error("trace").stack?.split("\n").slice(1, 5).join(" | "),
});
```

Use Playwright's `page.on("console", ...)` listener in tests to
capture browser console output to the terminal:

```javascript
page.on("console", (msg) => {
  console.log(`[BROWSER ${msg.type()}] ${msg.text()}`);
});
```

Run the failing test, grep for the diagnostic prefixes, report
verbatim. This pattern has solved multiple hard bugs.

**Always remove diagnostic instrumentation before committing.**
Production code stays clean. Tests stay clean.

### Manual verification for visual work

Tile system, theme system, indicator components, anything visual:
automated tests catch some things but not visual layout,
animations, or interaction feel. The developer must verify
manually with `npm run dev` and a browser.

Don't claim "ready for review" on visual work without flagging
that manual verification is needed.

## Project conventions

### Registry-driven architecture

Many subsystems use a registry pattern: a single source of truth
where consumers iterate the registry rather than hardcoding lists.
Examples:

- `tileSectionRegistry` — tileable sections
- `themeTargetRegistry` — theme override targets
- `systemIndexRegistry` — feature flags and system entries
- `controlSurfaceContractRegistry` — control surface contracts
- `motionSafetyRegistry` — reduce-motion preferences
- `audioSourceRegistry` — audio input sources
- `musicReactiveMappingRegistry` — audio-to-visual mappings
- `bookmarkRegistry` — bookmark surfaces
- `seedFunctionRegistry` — gwells seed positions
- `commandRegistry` — command palette entries
- `featureRegistry` — feature flags
- `panelRegistry` — panel zones (currently stale, slated for
  reconciliation)

**When you're tempted to hardcode a list, check if there's a
registry to use instead.** When adding new entries to a registry,
update the registry; don't create parallel taxonomies. Tests that
iterate over the registry will automatically discover new entries.

### Settings store (Zustand)

State that needs to persist lives in `useSettingsStore`. Get
current state inside callbacks via `useSettingsStore.getState()`
(synchronous, bypasses React's render cycle). This is the canonical
pattern for "read latest store state inside a callback."

When you see `useRef` + `useEffect` patterns for syncing state to
callbacks, that's often a workaround pattern. Prefer
`getState()` for synchronous reads.

### React component patterns

- `useState` for local component state only.
- For state that crosses components or persists, use the settings
  store or a dedicated context (like `TileProvider`).
- When extracting a component, copy JSX byte-for-byte first. Refactor
  later in a separate commit if needed.
- Avoid props drilling more than 2 levels; lift state higher or use
  a hook that reads directly from the store.
- React contexts for cross-cutting concerns (theme, tile state); zustand
  for app data.

### CSS conventions

- Theme tokens come from CSS variables defined in
  `src/styles/lumaweave-visual-handles.css` and friends.
- Use `var(--lw-accent, #fallback)` so theme overrides propagate
  through the variable system.
- `data-lw-theme-target` attribute marks elements the theme inspector
  can interact with. Use `data-lw-theme-target="ignore"` to opt-out
  internal-only elements.
- Avoid `[data-attribute]::after { content: "text"; }` patterns —
  they're invisible to JSX greps and bite us during cleanup.
- Tailwind utility classes are fine for layout. Don't add custom
  CSS for things Tailwind covers cleanly.

### File organization

Key directories:
- `src/app/` — top-level shell, AppShell, AppProviders
- `src/control-plane/` — panels, settings, tile system, command deck
  - `panels/` — CollapsibleSection, TileProvider, TileLayer,
    FloatingTile, TiledOutIndicator, section content components
  - `settings/` — settings store, schema, migrations, SettingsPanel
  - `command-deck/` — scaffolding for future command deck feature
- `src/themes/` — theme tokens, target registry, override storage
- `src/graph/` — graph rendering (Sigma2D), graph types
- `src/physics/` — gwells physics engine
- `src/control-plane/system-index/` — system index registry browser
- `tests/e2e/` — Playwright tests
- `docs/` — documentation, organized by topic
  - `docs/known-bugs/` — one file per known bug, kebab-case naming
  - `docs/updates/v86+_updates/` — per-version update notes
  - `docs/contracts/` — feature contracts

### Commits

- Use `--no-ff` merges for branch integrations (preserves history).
- Commit messages have a single-line subject + multi-paragraph body
  with `-m` flags. The body explains *why*, not just *what*.
- For diagnostic-shaped passes, the commit message names the
  diagnostic pattern that was used and what was learned.
- Don't combine unrelated changes in one commit. If you're tempted,
  split into two commits.

### Test discipline

- `npm run qa:e2e` runs the full Playwright suite (~2.7 minutes).
- `npm run qa:e2e -- <path>` runs a specific test file.
- `npm run qa:e2e -- --grep "<pattern>"` runs tests matching a name pattern.
- `npm run typecheck` runs TypeScript strict checks.
- Don't introduce `test.only` and leave it. It disables every other
  test in the file.
- `test.fixme(name, fn)` marks tests as pending. Exit-code neutral.
  Use this for "section's content not yet wired" placeholders.
- `test.fail` causes exit code 1 in this Playwright version. Don't
  use it; prefer `test.fixme`.

## Known sharp edges

These are project-specific behaviors that have caught us before.
Honor the workarounds.

### Stale closure in event-handler-set-up code

`CollapsibleSection`'s tear-off handler creates an `onMove` closure
in `pointerdown` that captures the registry callbacks at that
moment. If a callback then internally reads state from a `useState`
or a `useCallback` dep array, it'll see stale state.

Solution pattern: registry callbacks read current state via
`useSettingsStore.getState()` synchronously. Don't rely on
`useState` + `useEffect` syncing for callbacks invoked from
captured event-handler closures.

### Playwright + browser cache

The `~/.cache/ms-playwright/` Chromium binary occasionally gets
evicted. We have `scripts/ensure-playwright-browser.mjs` that
auto-reinstalls if missing. Run `npm run qa:e2e` and it'll
self-heal silently.

### Vite plugin: self-graph fixture

`src/fixtures/self-graph-generated.json` is auto-generated. A Vite
plugin self-heals it on startup if missing. Don't commit this file
to git (it's in `.gitignore`).

### Gwells C9.0 drift-back test

The test at `tests/e2e/gwells-physics.spec.ts:252` ("Pass C9.0:
Dragging a node without modifier drifts back toward seed")
occasionally fails under full-suite load. Passes 18/18 in
isolation. Documented in
`docs/known-bugs/gwells-c9-0-drift-back-flake.md`. If it fails
in your run, treat it as a known flake (verify by running
gwells-physics.spec.ts in isolation; if it passes there, the flake
is what fired).

### Contract registry timeout

The test at `tests/e2e/contract-registry.spec.ts:305`
("v48 checklist includes detail mode checks") times out at 30s
clicking `qa-check-previous`. Documented in
`docs/known-bugs/contract-registry-qa-check-previous-timeout.md`.
Known flaky helper. If it fails in your run, it's expected.

## Anti-patterns we've burned on

These have all bitten us at least once. Recognize and avoid.

### "Let me just try a fix while I'm here"

Diagnosing → instinct to apply a small fix without verifying →
fix doesn't help → second small fix → third → meanwhile the
actual cause is undiagnosed. Every "while I'm here" fix on
uncertain ground compounds risk.

If you find yourself wanting to apply a fix mid-diagnostic, STOP.
Report your findings. Wait for direction.

### Trusting stale audit docs

We've had audit documents capture state at a moment, then the
codebase evolved, and we trusted the audit when writing new code.
Result: `sourceTestId` values pointing at testids that no longer
existed; section names referring to deleted components.

**Verify against actual on-disk code before relying on audit
findings.** Audit docs are starting points, not sources of truth.

### Refactoring during extraction

When extracting a component (e.g., `PhysicsSectionContent` from
`SettingsPanel`), copy JSX byte-for-byte first. The temptation to
"clean it up while I'm extracting" is real. Resist. The pristine
copy preserves behavior; refactor in a separate commit if needed.

We've had extractions silently break because the refactor changed
semantics inadvertently.

### Diagnostic instrumentation left in production code

When investigating a bug with console.log + stack traces, remove
ALL instrumentation before committing. We've shipped logs that
spammed the console for weeks because cleanup was incomplete.

Grep for `console.log` and `page.on("console")` before commit.

### CSS pseudo-elements as invisible content

The `[data-tiled-out="true"]::after { content: "text"; }` pattern
injects text via CSS that doesn't show up in JSX greps. We had a
"stray Tiled out" label for a week before tracing it. When cleaning
up visual elements, grep CSS files too.

### Hard-coding what should be registry-derived

Don't write `const SECTIONS = ["graph", "qa", "evidence", ...]` in
a test or component. Use the registry. When new sections are added
to the registry, they're automatically picked up; no test-file
edits required.

## How to work

When you receive a structured prompt from the planning Claude:

1. Read the whole prompt before starting. Note the phases, STOP
   gates, and "Don't" list.
2. Execute phase-by-phase.
3. At each STOP gate or phase boundary, evaluate: does the actual
   state match what was expected? If yes, continue. If no, report
   and pause.
4. Report verbatim at the end. Paste git status, git log, test
   output, and any other captured output the prompt asked for.
5. Do NOT continue past the final phase without direction.

When you receive a less-structured request from the developer:

1. If it's quick and well-defined (e.g., "add a comment explaining
   this function"), do it.
2. If it requires multi-file changes or could affect tests, ask:
   "Want me to plan this as a structured pass, or just dive in?"
3. If anything is unclear, ASK. Don't assume.
4. For any meaningful change, do these in order: typecheck → relevant
   test → manual verification mention if visual → commit. Don't
   skip steps.

## Approval gates

These gates govern when Claude Code must ping Discord and wait
before doing something. They are SEPARATE from Windsurf's own
approval modals — the Windsurf modal is for the user at the
keyboard; Discord pings are for the user on their phone. Both
exist; honor the Discord-ping rule independently of what Windsurf
does.

The pattern is:
1. Claude Code decides to do action X.
2. BEFORE the tool call, Claude Code posts to #approve-this on
   Discord with the action and a "Reply 'approve' to proceed"
   prompt.
3. Claude Code waits for a Discord response.
4. After approval (via Discord), Claude Code makes the tool call.
   Windsurf may still show its own modal — the user can approve
   that via Windsurf or it may auto-approve depending on settings.

### MANDATORY: All approvals must go through Discord

This is non-negotiable. If an action requires approval, Claude Code
MUST post to #approve-this on Discord and wait for a Discord response.
Text-based approvals in this session are NOT sufficient. Discord is
the authority for all approval gates.

If Discord is unreachable or user hasn't seen the message:
- Do NOT proceed with the action based on text approval in this session
- STOP and wait for Discord approval or explicit user override
- If user explicitly says "proceed anyway" in text, that counts as
  override authorization for that single action only

### Always ping #approve-this before:

- `rm` or `git rm` of any file
- `git commit` (post the full commit message preview first)
- `git push`
- `git merge` (any direction, but especially to main)
- `git reset --hard`
- Editing CLAUDE.md (this file)
- Modifying package.json (dependency adds/removes)
- Creating files in `docs/` outside the current task's scope
- Any system-level command (`chmod`, `sudo`, etc.)
- Deleting any file or directory

### Never ping Discord for:

- Read-only operations: `git status`, `git log`, `git diff`,
  `git branch`, `ls`, `cat`, `grep`, `find`, `head`, `tail`
- `cd` to change directories
- Reading any file (`view`)
- `npm run typecheck`, `npm run qa:e2e`, `npm run dev`
- Editing files explicitly named in the current task prompt
  (these are pre-approved by virtue of being in the prompt)
- Posting status messages to Discord (the post itself is the
  notification)
- Adding diagnostic console.logs to files already being modified
  in the current task

### Default for in-between cases

If a command is destructive AND wasn't pre-approved by the prompt:
ping #approve-this. When in doubt, ping.

If a command is non-destructive (read-only, test, status):
proceed without pinging.

### Discord approval message format

When pinging #approve-this, include:
1. The exact command or change
2. Why (one sentence)
3. "Reply 'approve' to proceed"

### Recognized responses

- "y" / "yes" / "approve" / "approved" / "go" / "proceed" — proceed
- "n" / "no" / "wait" / "stop" / "hold" — STOP and explain or wait
- "change X to Y" — incorporate the change before proceeding
- Ambiguous response — post a clarifying question, continue waiting

### Per-session overrides

The user may say things like "auto-approve through commit for this
pass" or "auto-approve everything for this session." When they do,
override the defaults for that session only. Default restrictions
resume at the next session.

## Wait Cadences

Two distinct wait patterns. They apply at different moments and are
not substitutes for each other.

### Approval gate waits (formal)

Trigger: any post to #approve-this.

Pattern: 35s Monitor loop + immediate `fetch_messages` (limit=15) right
after posting + `fetch_messages` (limit=15) on every Monitor notification.
Full protocol documented in the **#approve-this** section below.

Why: gate-miss-safe. User may be away from the keyboard; a shorter poll
just burns prompt-cache budget without improving safety.

**Never substitute a shorter poll for approval gates.**

### Within-pass listening (informal)

Trigger: any mid-pass moment where Claude is waiting on user direction
that is NOT a formal approval — e.g., between phases, after a STOP
report, while the user is deciding scope or verifying something in the
browser.

Pattern: ~3–5s informal polling via Monitor heartbeat + `fetch_messages`.
While waiting, respond only with "listening". No narration, no
re-summarizing prior work, no pre-explaining next steps.

Why: keyboard-present user shouldn't see chatter while thinking.
Responsive presence, not gate safety.

## Discord messaging protocol

All significant Discord communication follows this structure.

### Channel IDs (for MCP access)

- #approve-this: `1506441138612080680`
- #notifications: `1506441052826107964`
- #current-task: `1506440945128701955`
- #brainstorm: `1506441106869583932`

### Discord operations use the MCP server ONLY

Discord posting, fetching, and monitoring all go through the Discord
MCP server. Never substitute:
- Raw HTTP calls / curl / fetch
- Webhooks
- Any other path

If the Discord MCP is unreachable or a call fails: STOP and report.
Do not fall back to alternatives. Tool-identity drift (Claude reaching
for HTTP because the MCP "feels unavailable") is a known failure mode.

### Channel references use IDs

Channel IDs (numeric, listed above) are the primary identifier in tool
calls. Channel names (#approve-this, #current-task, etc.) are for
human readability and prompt text only.

If a tool call requires a channel and you find yourself uncertain which
channel ID maps to which name: STOP and re-read the channel map above.
Do not guess.

### "Unknown Channel" and similar failures

If any Discord MCP call returns "Unknown Channel", "channel not found",
or any equivalent: STOP and report to #notifications (using a channel
ID you've just verified against the map). Include:
- The attempted operation
- The channel reference used
- The exact error

Do not silently retry with a different channel reference. Recovery
without surfacing the failure masks frequency and prevents diagnosis.

### #approve-this

- **Purpose**: Approval gate for destructive operations
- **Content**: Commit previews, merge notifications, push confirmations
- **Pattern**: "Reply 'approve' to proceed"
- **Wait**: Always wait for response before proceeding
- **Active Listening Protocol** (REQUIRED):
  1. **Immediate check**: Call `fetch_messages` (limit=15) on #approve-this RIGHT AFTER posting.
     Catches instant approvals before any loop starts.
  2. **Start Monitor loop**: Use the **Monitor tool** (NOT `Bash run_in_background`) on:
     ```bash
     while true; do sleep 35; echo "poll"; done
     ```
     Monitor streams each `"poll"` emission back as a notification that wakes Claude.
     `Bash run_in_background` writes to a temp file nobody reads — it is fake monitoring.
  3. **On each Monitor notification**: Call `fetch_messages` (limit=15). If approved, proceed.
     If not, keep monitoring.
  4. **limit=15 always**: Every `fetch_messages` call uses limit≥15 — this prevents
     the gate-miss bug where approvals were silently skipped.
- **CRITICAL**: The Monitor tool is the only real monitoring mechanism. Never substitute
  `Bash run_in_background` for approval waiting.

### #current-task

- **Purpose**: Run lifecycle tracking
- **Content**: 
  - BEGIN: Post when starting a new pass/task with phase name
  - END: Post when task completes with summary + changelog
- **Frequency**: Once per major pass/task, beginning and end only
- **Format**: Concise — phase name, key results, new/modified files

### #notifications

- **Purpose**: Detailed run updates and diagnostics
- **Content**: 
  - Test results (failure/pass counts)
  - Regression alerts
  - Diagnostic findings
  - Status updates during long-running tasks
- **Frequency**: As needed; one message per logical update
- **Format**: Verbatim output when reporting failures (per CLAUDE.md)

### #brainstorm

- **Purpose**: High-ROI improvements, system optimizations, recommendations
- **Content**: 
  - Ideas for streamlining development workflow
  - Architectural suggestions
  - Process improvements
  - Observations about pain points
- **Format**: Summarized writeups (not raw brainstorm dumps); include:
  - Problem identified
  - Proposed solution
  - Estimated ROI (time saved, complexity reduced, etc.)
  - Implementation cost
- **Trigger**: Only post if the suggestion has material impact (don't spam)

## Discord Mode

When you want to work async (e.g., you're stepping away but want work to continue), use Discord Mode.

### How it works

1. **You send a work command via Discord** in #current-task (or elsewhere, specify the channel)
2. **Claude Code enters listen mode**: starts a persistent Monitor that checks for messages every 10 seconds
3. **Work executes in the background**: typecheck, tests, commits, all async
4. **Progress updates post to #notifications**: each logical step (test pass, diagnostic finding, commit) gets a message
5. **Final summary posts to #current-task**: when work completes (or hits a blocker)

### Initiating Discord Mode

**User sends in any channel:**
```
[work command] /dm
```

(Shorthand: `/dm` is equivalent to `/discord-mode`. Can be used in any channel, not just #current-task.)

For example:
```
Implement the tile snap fixes we planned. The snap tolerance should be 75px,
edge snaps should be 0.6x weight, and row alignment snaps should be 0.5x weight.
/dm
```

**Claude Code responds:**
1. Posts to #current-task: "Discord Mode active. Monitoring for 30 minutes (or until work completes). Progress posts to #notifications."
2. Enters a persistent Monitor that:
   - Checks for messages every 10 seconds
   - Executes the work command asynchronously
   - Posts updates to #notifications
   - Posts final result to #current-task when done

### During Discord Mode

- **Blocking issues**: If a test fails or a blocker is hit, Claude Code posts to #notifications with details and waits for your response (max 15 min)
- **Approval gates**: Destructive operations (commit, push) post to #approve-this and wait for your response
- **Progress cadence**: Major milestones (typecheck pass, test suite pass, new file created) get a notification
- **Session timeout**: If no response to a blocking question for 15 minutes, work pauses and final status posts to #current-task

### Exiting Discord Mode

Discord Mode exits automatically when:
- Work completes successfully (final summary posted to #current-task)
- A blocker is hit and you respond with "pause" / "stop"
- 30 minutes elapse (configurable, currently 30min)

You can also explicitly exit by posting:
```
@Claude Code: pause
```

Claude Code will post final status to #current-task and return to normal mode.

### Example Discord Mode flow

```
User (in #current-task):
  Rewrite the tile snap system to be cleaner.
  Increase SNAP_TOLERANCE to 75px, fix row alignment snapping.
  /discord-mode

Claude Code posts to #current-task:
  Discord Mode active. Working on: tile snap rewrite.
  Monitoring until work completes. Progress → #notifications.

Claude Code posts to #notifications:
  ✓ Typecheck passed (0 errors)
  
Claude Code posts to #notifications:
  ✓ E2E tests passed (12/12 passing)
  
Claude Code posts to #notifications:
  ℹ Snap tolerance increased to 75px
  ℹ Row alignment snap weighting set to 0.5x
  ℹ Edge snap weighting set to 0.6x
  
Claude Code posts to #notifications:
  ⏳ Attempting commit... [commit message preview]
  (waiting for approval in #approve-this)
  
User (in #approve-this):
  approve

Claude Code posts to #current-task:
  ✓ Discord Mode complete. Tile snap rewrite finished.
  New commits: [hash] ... [hash]
  Tests: 12/12 passing
  No blockers.
```

### Technical notes

- Discord Mode uses a persistent Monitor loop (does not time out)
- Each significant action (typecheck, test, commit) posts a notification
- Destructive operations still require Discord approval in #approve-this
- If you're not actively monitoring Discord, Discord Mode will naturally pause on approval gates (designed to be async-safe)
- Discord Mode is opt-in; default behavior is synchronous (waits for text input in Claude Code)



## Project state (current as of v86c stabilization)

**v86c Tile System — STABILIZED**

The tile system has transitioned from rewrite attempts to a simplified
floating-container model. This is the stable, working state:

- **Physics tile** (Scope B): shipped and working
- **TiledOutIndicator** extraction: shipped
- **Right-dock sections** (Scope C-2): labels-section + appearance-section wired and working
- **Left-panel reorganization**: deferred (C-1 reverted; see `docs/updates/v86+_updates/v86c_LEFT_PANEL_DEFERRAL.md`)
- **Tile grouping** (feature flag `tileGrouping: false`): disabled.
  Group code preserved in codebase for future re-enable. Tiles are independent floating containers.
- **Tile snapping** (feature flag `snap` path): disabled.
  Tiles drag freely with cursor-precise positions. Snap code preserved in codebase.
- **Persistence**: Fixed. Tile positions survive page refresh via
  Zustand `subscribe()` → localStorage sync.
- **Orphan code cleanup**: Complete. Stale branches deleted; Pass 1A/1B
  rewrite code removed (preserved in git history).

**Key design decision**: Multiple days spent patching group and snap
bugs across old and rewritten tile systems. Cost-benefit analysis favored
simplification (basic floating-container model) with feature flags to
disable problematic behaviors, pending fresh design pass on snap mechanics
and group architecture.

- Multiple known bugs documented in `docs/known-bugs/`.

If this file feels out of date, ask the developer. They (or the
planning Claude) will tell you what's changed.

## Reference docs (load when relevant)

The following docs are not required reading on every pass but
should be consulted when their domain is in play:

Operating / governance:
  docs/agent/protocols/BANDIT_PROTOCOL.md
  docs/agent/protocols/BANDIT_SELF_SPLIT_PROTOCOL.md
  docs/agent/brain/BANDIT_QA_PROTOCOL.md
  docs/agent/protocols/PASS_TRANSITION_PROTOCOL.md
  docs/agent/protocols/QA_KEY_LIFECYCLE.md
  docs/agent/protocols/ADVISORY_STATE_MODEL.md
  docs/agent/protocols/REGISTRY_CONTRACT_PATTERNS.md

Survival manual (diagnostics + debugging):
  docs/agent/survival-manual/01_TROUBLESHOOTING_DECISION_MATRIX.md
  docs/agent/survival-manual/02_DIAGNOSTIC_ROUTER.md
  docs/agent/survival-manual/03_TOOL_USE_TRIGGERS.md
  docs/agent/survival-manual/04_DEBUGGING_LENSES.md
  docs/agent/survival-manual/05_FAILURE_REPORT_TEMPLATE.md
  docs/agent/survival-manual/06_STOP_CONDITIONS.md
  docs/agent/survival-manual/07_PROMPT_BLOCKS.md
  docs/agent/survival-manual/08_LUMAWEAVE_AGENT_OPERATING_LOOP.md

Onboarding / multi-agent:
  docs/agent/onboarding/NEW_AGENT_ONBOARDING.md
  docs/agent/onboarding/MULTI_AGENT_POLICY.md

Situation reports:
  docs/quest/QUEST_TEMPLATE.md