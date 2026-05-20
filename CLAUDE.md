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

### STOP gates

When a prompt has explicit STOP-and-report instructions, honor them
exactly. Don't continue. Don't apply "small fixes while I'm here."
Don't iterate. Report verbatim and wait for direction.

This protects the developer's time. The developer would rather you
stop early and report than continue and produce work that has to
be reverted.

### Verbatim reporting

When reporting test output, console output, or file contents, paste
verbatim. Don't summarize. Don't paraphrase. Don't skip "the long
parts." The developer (and the planning Claude) need the actual
output to diagnose correctly.

If output is very long (thousands of lines), report the relevant
section verbatim and note what was elided.

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

- "approve" / "approved" / "yes" / "go" / "proceed" — proceed
- "no" / "wait" / "stop" / "hold" — STOP and explain or wait
- "change X to Y" — incorporate the change before proceeding
- Ambiguous response — post a clarifying question, continue waiting

### Per-session overrides

The user may say things like "auto-approve through commit for this
pass" or "auto-approve everything for this session." When they do,
override the defaults for that session only. Default restrictions
resume at the next session.

## Discord messaging protocol

All significant Discord communication follows this structure.

### Channel IDs (for MCP access)

- #approve-this: `1506441138612080680`
- #notifications: `1506441052826107964`
- #current-task: `1506440945128701955`
- #brainstorm: `1506441106869583932`

### #approve-this

- **Purpose**: Approval gate for destructive operations
- **Content**: Commit previews, merge notifications, push confirmations
- **Pattern**: "Reply 'approve' to proceed"
- **Wait**: Always wait for response before proceeding
- **Polling**: After posting approval request, check for response every 3-4 seconds
  using `fetch_messages`. Do not wait passively — actively poll until response received.

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

## Useful one-liners

```bash
# Run a single test by name pattern
npm run qa:e2e -- --grep "section content"

# Run a single test file
npm run qa:e2e -- tests/e2e/v86c-tile-system.spec.ts

# Capture browser console during a test (add to test code):
# page.on("console", (msg) => console.log(`[B] ${msg.text()}`));

# Find rogue test.only declarations
grep -rn "test\.only" tests/

# Find diagnostic console.logs before committing
grep -rn "console.log.*TileProvider\|console.log.*FloatingTile" src/

# Stack trace from inside a callback (for "who called this" diagnostics)
new Error("trace").stack?.split("\n").slice(1, 5).join(" | ")
```

## Project state at the time of writing this CLAUDE.md

- v86c tile system in active development.
- Physics tile (Scope B) is shipped and working.
- TiledOutIndicator extraction is shipped.
- C-1 left-panel work was REVERTED. The four left-panel registry
  entries (graph, qa, evidence, debug) are removed. Reasoning:
  those were tabs, not tileable units. Real left-panel sub-section
  tile-out is deferred until left-panel reorganization. See
  `docs/updates/v86+_updates/v86c_LEFT_PANEL_DEFERRAL.md`.
- Scope C continues with right-dock only:
  - `labels-section`: pending wiring (C-2)
  - `appearance-section`: pending wiring (C-2)
- Multiple known bugs documented in `docs/known-bugs/`.

If this file feels out of date, ask the developer. They (or the
planning Claude) will tell you what's changed.
