# Project Conventions

Project-specific patterns and the incidents behind the generalized principles in CLAUDE.md. Consult when working in the relevant subsystem. Canonical domain docs live in `docs/canonical/`.

## Registry-driven architecture

Many subsystems use a registry: one source of truth that consumers iterate, instead of hardcoded lists. Examples: `tileSectionRegistry`, `themeTargetRegistry`, `systemIndexRegistry`, `controlSurfaceContractRegistry`, `motionSafetyRegistry`, `audioSourceRegistry`, `musicReactiveMappingRegistry`, `bookmarkRegistry`, `seedFunctionRegistry`, `commandRegistry`, `featureRegistry`, `panelRegistry` (stale, slated for reconciliation).

When tempted to hardcode a list, check for a registry. Add new entries to the registry — don't create parallel taxonomies. Registry-iterating tests auto-discover new entries. Patterns/tiers: `docs/canonical/REGISTRY_AND_LINK_NETWORK.md`.

## Settings store (Zustand)

Persisted state lives in `useSettingsStore`. Read current state inside callbacks via `useSettingsStore.getState()` (synchronous, bypasses React's render cycle) — the canonical "read latest store state in a callback" pattern. `useRef`+`useEffect` to sync state into callbacks is usually a workaround; prefer `getState()`.

## React component patterns

- `useState` for local component state only.
- Cross-component / persisted state → settings store or a dedicated context (e.g. `TileProvider`).
- Extracting a component → copy JSX byte-for-byte first; refactor in a separate commit.
- Avoid props-drilling beyond ~2 levels; lift state or read from the store via a hook.
- Contexts for cross-cutting concerns (theme, tile state); Zustand for app data.

## CSS conventions

- Theme tokens are CSS variables from `src/styles/lumaweave-visual-handles.css` and friends.
- Use `var(--lw-accent, #fallback)` so theme overrides propagate.
- `data-lw-theme-target` marks theme-inspector-interactable elements; `data-lw-theme-target="ignore"` opts internal-only elements out.
- Avoid `[data-attr]::after { content: "text"; }` — invisible to JSX greps, bites during cleanup (grep CSS files too when cleaning visual elements).
- Prefer logical properties (`inset-inline-start`, `margin-block`) for directional values — enforced as warnings via stylelint-plugin-logical-css. Dimensional `width`/`height` are exempt.
- Tailwind utilities are fine for layout; don't hand-write CSS for what Tailwind covers cleanly.

## File organization

- `src/app/` — top-level shell (AppShell, AppProviders)
- `src/control-plane/` — panels, settings, tile system, command deck
  - `panels/` — CollapsibleSection, TileProvider, TileLayer, FloatingTile, TiledOutIndicator, section content
  - `settings/` — store, schema, migrations, SettingsPanel
  - `command-deck/` — future command-deck scaffolding
- `src/themes/` — tokens, target registry, override storage
- `src/graph/` — Sigma rendering, graph types
- `src/physics/` — gwells engine
- `src/control-plane/system-index/` — system index registry browser
- `tests/e2e/` — Playwright
- `docs/` — by topic; `docs/known-bugs/` (one file per bug, kebab-case), `docs/canonical/` (domain reference), `docs/agent/` (operating docs)

## Commits

- `--no-ff` merges for branch integrations (preserve history).
- Single-line subject + multi-paragraph body via `-m`; the body explains *why*.
- Diagnostic-shaped passes: name the diagnostic pattern used and what was learned.
- Don't combine unrelated changes — split into separate commits.
- Stage explicit paths; never `git add -A` / `git add .`.

## Test discipline

- `npm run qa:e2e` — full Playwright suite (~2.7 min). `-- <path>` for one file. `-- --grep "<pattern>"` by name.
- `npm run typecheck` — TS strict.
- Foreground only, one suite at a time — no background runs, no timeout wrappers (parallel/background runs pollute results). Browsers live at `$HOME/pw-browsers` via `PLAYWRIGHT_BROWSERS_PATH`; never reinstall.
- Don't leave `test.only` (disables every other test in the file).
- `test.fixme(name, fn)` for pending/not-yet-wired (exit-code neutral). Avoid `test.fail` — it forces exit code 1 in this Playwright version; prefer `test.fixme`.

## Incidents behind the principles (war stories)

- **"Let me just try a fix while I'm here."** Mid-diagnostic fix instinct → fix doesn't help → second → third → real cause still undiagnosed. Every "while I'm here" fix on uncertain ground compounds risk. Hit repeatedly during v86c tile work; "instrument first, fix once you know" is what got us through.
- **Trusting stale audit docs.** Audits captured a moment; code moved on; we wrote new code against the audit. Result: `sourceTestId` pointing at removed testids, section names for deleted components. Verify against on-disk code.
- **Refactoring during extraction.** Extractions (e.g. `PhysicsSectionContent` out of `SettingsPanel`) silently broke when "cleanup while extracting" changed semantics. Copy verbatim; refactor separately.
- **Instrumentation left in prod.** Shipped console logs spammed for weeks because cleanup was incomplete. Grep before commit.
- **CSS pseudo-element content.** `[data-tiled-out="true"]::after { content: "text"; }` injected a "Tiled out" label invisible to JSX greps — took a week to trace. Grep CSS when cleaning visual elements.
- **Hardcoding registry-derived lists.** `const SECTIONS = [...]` in a test/component drifts from the registry. Iterate the registry; new entries get picked up automatically.
