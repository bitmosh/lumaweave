# Ship Readiness Roadmap — LumaWeave v0.15.x → v1.0

**Status:** Working document, canonical for the home-stretch arc sequence
**Source basis:** Terminal Claude empirical audit (2026-06-08) + ongoing v109 architectural context + sibling-integration design work in `~/Projects/future-integration/`
**Owners:** Ryan (product, sequencing decisions) + Planning Claude (architecture, arc shape)
**Living document:** Each arc's actual landing may surface amendments; this doc evolves with the work, not against it

---

## §1 — Current State (Ground Truth)

### What's actually working

The core product is genuinely solid. This isn't aspiration — it's verified by the audit against live code:

- **Graph rendering pipeline.** Floating node planets, plasma edge ribbons, starfield backdrop, themed cluster colors. Custom WebGL shaders, Sigma 3.0.3 + Graphology in multi-graph mode. Real.
- **Theme system.** OKLCH-based color math, six built-in themes, per-target overrides (with both global and target-scope), the v106 radial inspector for token editing, aurora-styled CSS variable application.
- **Physics engine (gwells).** Custom gravity-well system replacing FA2. Phyllotaxis spiral placement, per-pair spring distances, content-driven node sizing, spine bucketing, dialect-based switching (radial-backbone, parallel-spines).
- **Tile workspace.** Docking, floating, snap-to-grid, drag-anywhere. Tile sections registered via `tileSectionRegistry`.
- **Source adapter platform.** SDK contract in `~/Projects/future-integration/SDK_SPEC.md`. `BaseSourceAdapter` interface, family-base classes (`DirectoryAdapter`, `SingleFileAdapter`), `registerSourceAdapter()` API, Map-based dispatch, per-adapter settings configurations, forward-compat hooks for sibling-module integration (`coupling: "external" | "sibling-module"`, reserved `extensions: {}` namespace, `transport: "file" | "live"` flag).
- **Tauri filesystem layer.** Four commands (`read_file`, `run_script`, `list_files`, `read_vault_file`, `read_user_file`), each with manual `canonicalize → starts_with` validation, symlink rejection, no-plugin-fs discipline. Runtime-verified security boundary (`../etc/passwd` traversal correctly rejected).
- **Two real adapters live.** Self-graph (v108) and markdown-vault / Obsidian (v109.1), with Cytoscape JSON (v109.2) now landed. All exercise the platform on genuinely different shapes — directory + derivation, single-file + structural mapping.
- **TypeScript strict mode, zero typecheck errors, no `console.log` debris in production code.**
- **Registry-first architecture.** Consistent pattern across themes, physics dialects, source adapters, tile sections, inspector spokes, commands, hotkeys. Each registry is documented; each follows the same shape.
- **Settings migrations.** Schema chain through v93. Additive backfill pattern. Migration tests in place.

### What's "dev-artifact bleed"

The audit's framing for the category of issues blocking ship. These are visible in normal UI surfaces, not hidden bugs:

- Window/dock/About-dialog identity still says "starmap" (old project name in `tauri.conf.json`)
- Internal arc numbers leak into user-facing strings: "Coming in v92 (Audio Reactivity arc)", "Coming in a later v102 phase"
- Three inspector spokes are visible-but-stubbed (Type, Motion, Layout)
- Four Theme menu sub-areas render `<StubSubArea>` placeholders
- AgentChatPlaceholder tile registered in `tileSectionRegistry`, renders an empty chat surface
- `QaPanel.tsx` (1606 lines) is developer-facing meta-tooling but shipped in the default tile system
- `StatusCluster.tsx:14-15` — `useLayoutState()` returns hardcoded `"settling"` permanently (comment says "v89+", we're at v109; never wired)
- Source adapter panel shows 10 entries; 3 work, 7 are candidates; the UI doesn't distinguish clearly enough for a new user

None of these are deep. All of them collectively signal "internal build" instead of "released product."

### What's broken in production

Real bugs affecting the primary use case (real-source mode). Currently hidden by skipped tests:

- **`ThemeTargetInspectorOverlay.tsx:149-184`** — panel right edge overflows viewport in real-source mode. Layout works in fixture mode; breaks in production mode.
- **`ThemeTargetInspectorOverlay.tsx:42`** — Sigma selector hardcodes the fixture testid (`self-graph-fixture-loaded`). In real-source mode the testid is `graph-viewport`. Result: graph primitives cannot be pinned (theme target inspector partial-broken) in the mode that actually matters for users.

These are skipped E2E tests, not silent breakage — they were documented but punted. They have to land before v1.0 is honest.

### What's structurally concerning

Not blocking but should be acknowledged:

- **No `React.ErrorBoundary` anywhere.** Any uncaught exception in any component = white screen, no recovery. For a desktop app handling user data, this is a crash class with no excuse.
- **Test suite is 9-12 minutes**; `graph-visual-inventory.spec.ts` alone is ~8.7 min (119 tests). Full-suite CI verification effectively impossible. The targeted-test-scope convention is load-bearing for every recent commit; CI runs `lint:css` + `typecheck` only. (E2E in CI was never wired.)
- **Chromium → tmp high-severity advisory** unresolved in `package-lock.json`. Pre-existing; needs triage before ship.
- **Inspectable Coverage + Token Hygiene debt.** `css-handle-report.md` identified `--lw-glow` silent failures, orphaned variables, hardcoded fallbacks. Logged as a deferred arc since v105 close.

### What's decided but not yet executed

We have multiple design artifacts in `~/Projects/future-integration/` that reflect locked decisions but aren't all reflected in the codebase:

- `SDK_SPEC.md` — adapter SDK contract, mostly settled, some sections marked "open" or "TBD"
- `INTEGRATION_FUTURES.md` — sibling-integration deferred vision, do-not-build list for v1.0
- `SHARED_SCHEMA.md` — cerebra-graph.json schema, v1 contract, reserved `extensions.*` namespaces

These remain authoritative. The ship-readiness path respects them.

---

## §2 — Architectural Principles for the Home Stretch

Things we've established that explicitly govern the remaining arcs. Naming them so they don't drift:

### 2.1 Brief-then-implement loop

For any pass touching new territory (security surface, new format, architectural decisions), a written investigation brief precedes implementation. Terminal Claude executes the brief against live code, produces a structured report with file:line citations and difficulty ratings. Planning Claude reasons against the report and scopes the implementation prompt. Bandit executes against locked decisions.

Established by: v107, v108, v109.0 platform, v109.1, v109.2, v109.3 (all benefited measurably).

**Exception:** tactical fixes with known cause and known mechanism (a one-line type fix, a settled regression with confirmed root). Just scope it.

### 2.2 Targeted-test-scope convention (with amendment)

Per-commit verification runs only the test files directly affected by the change. **Plus the CI fast-jobs** (`typecheck`, `lint:css`, `cargo check` if Rust touched).

The 9-12 min E2E suite is *not* a per-commit gate. It's a manual checkpoint at arc-close.

**Amendment (logged from v109.2.3 CSS-lint surprise):** any CI job (`typecheck`, `lint:css`, `cargo check`) is non-negotiable per commit. CI fast-jobs caught a 7-issue CSS debt that was silently red since v109.0 because the convention didn't initially include them.

### 2.3 Audit-by-eyeball Rust discipline

Every new Tauri command stays small (~15-80 lines). `canonicalize → starts_with(scope_root)` is the load-bearing safety check. Symlinks not followed. Defense-in-depth canonicalize-on-each-file in directory walks. Hard-coded allowlists for command execution (not config-driven). No `tauri-plugin-fs` or `tauri-plugin-shell` until justified by a real need that manual code can't safely cover.

The Rust must be small enough that Ryan can read it and understand the entire security model. v108's `read_file`, v109.0.3's `list_files`/`read_vault_file`, and v109.2.0's `read_user_file` all hold this bar.

### 2.4 No installs without explicit per-install approval

NPM, Cargo, Apt, brew, snap — none. Active npm supply-chain attack risk + Cargo's growing surface area means every dep is a real decision. Bandit prompts include this as a hard stop. If a pass needs a new dep, it surfaces it for Ryan's call before any installation happens.

This is why v109.3 ships JSON-only — TOML support means a new TOML parser dep, which means a dependency-vet conversation, which means it's not a scoped-fit for that pass.

### 2.5 Sibling-module forward-compat, not sibling-module implementation

LumaWeave and Cerebra are independently shippable. The `coupling: "sibling-module"` flag, reserved `extensions: {}` namespace, and `transport: "file" | "live"` field exist in v1.0 *only* as hooks. The actual live integration is post-v1.0. Documented in `~/Projects/future-integration/INTEGRATION_FUTURES.md` §7 do-not-build list.

The discipline: when tempted to build a stub for live integration, *stop*. The hooks are sufficient. Real live integration ships when both systems are ready, not via placeholder code.

### 2.6 The "registered" bar for adapters

An adapter shipping with `status: "registered"` in v1.0 means: a real user can successfully load real data with this adapter, and the failure modes produce useful error messages, not raw Rust strings.

An adapter not meeting that bar ships as `status: "candidate"` with explicit "preview / experimental" framing in the UI. This is the honesty requirement that prevents the "10 adapters where half silently error" problem the audit named.

**Self-graph (v108):** registered. Works.
**Markdown-vault (v109.1):** registered. Works on real Obsidian vaults.
**Cytoscape JSON (v109.2):** registered. Works on Cytoscape.js exports.
**Package-dependency (v109.3):** to be evaluated against this bar during the arc, not assumed.
**CSV edge list (v109.4):** to be evaluated against this bar during the arc, not assumed.

If v109.3 or v109.4 don't meet the bar, they ship as candidates with clear UX framing. This is the design principle that resolves the audit's concern about adapter polish.

### 2.7 Dev-artifact-bleed elimination

Anything that signals "internal build" rather than "shipped product" gets surfaced and addressed. Internal arc numbers in user strings, developer tooling in canvas tiles, placeholder spokes in main nav, "Coming in vN" text — all of these are bleed.

The principle: every user-visible string is in user language, not developer language. Every visible UI surface either works fully or is removed entirely (no "Coming in future arc" stubs). Every shipped tile is a feature users want, not a tool developers built.

This is the discipline that turns the polished core into a polished *product*.

### 2.8 The do-not-build list

Beyond INTEGRATION_FUTURES §7, there's a broader do-not-build for v1.0:

- No live Cerebra IPC channel
- No full plugin SDK (the declarative Option B is a possible v110+ stretch; full JS/WASM plugin loading is v2.0)
- No additional manifest formats beyond `package.json` for v109.3 (Cargo, Python, Ruby, Go all post-v1.0)
- No folder-picker dialog (text input only; `tauri-plugin-dialog` deferred)
- No DSL adapters in v1.0 (Mermaid, Graphviz DOT, PlantUML, D2 all post-v1.0)
- No file-watching for live source refresh (manual refresh only)
- No streaming/chunked loading for huge vaults (2000-node cap with truncation warning)
- No declarative config-driven adapters as the v1.0 plugin model (deferred to post-1.0)

These are explicitly named so future-Claude doesn't "helpfully" implement them mid-arc.

---

## §3 — The Home-Stretch Arc Sequence

The audit proposed v109.3 → v109.5 → v110 → v111 → v112 → v113 → v114 → v115. The bones are right; the *flesh* needs to match how our arcs actually shape up.

### Arc dependency graph

```
v109.3 (package-dependency)  ─┐
                              │
v109.4 (CSV edge list)        ├──→ v109.5 (arc close + adapter bar verification)
                              │
v109.* (architecturally) ─────┘
                                     │
                                     ▼
                              v110 (real-source mode bugs + identity + error boundary)
                                     │
                                     ▼
                              v111 (test infrastructure)
                                     │
                                     ▼
                              v112 (UI completeness + dev-artifact-bleed)
                                     │
                                     ▼
                              v113 (source adapter UX maturity)
                                     │
                                     ▼
                              v114 (security + dependency hygiene)
                                     │
                                     ▼
                              v115 (release build + cold-install QA)
                                     │
                                     ▼
                                  v1.0.0
```

**Sequence change from the audit:** v110 (audit's "test infrastructure") and v111 (audit's "identity + critical bugs") are swapped. Rationale below.

### v109.3 — Package-Dependency Adapter

**Status:** investigation report landed (`v109_3_package_dependency_report.md`); ready to scope.

**Sub-passes:**
- v109.3.0 — adapter + form + registry (per report §9)
- v109.3.1 — fixture + E2E + arc-step docs

**Decisions locked** (per report §7):
- npm `package.json` only; `pyproject.toml` returns error
- Name-only node identity; version constraint in `raw.version`
- Three distinct edge `relationship` values
- Workspaces warn-and-skip
- Permissive shape validation
- `maxNodes` audible-ignore
- `projectPath` directory + `manifestType` selector
- Dual-edge behavior for packages in multiple dep buckets is correct semantics

**Registered-bar evaluation:** package-dependency on `package.json` is mechanical — JSON parse, walk three dep buckets, emit nodes. The UX surface is the smallest of any adapter (one text input + one disabled-select). High likelihood of meeting the registered bar.

**Driver:** Continues the adapter portfolio Kirby move. Validates the platform on derived-graph data (manifest → dependency tree). Last of three "shippable in v1.0" adapter formats per current scope.

### v109.4 — CSV Edge List Adapter

**Status:** not yet briefed. Will get its own investigation brief after v109.3 lands.

**Anticipated structure:** SingleFileAdapter, `readUserFile()`, CSV parse, two columns minimum (source, target), optional third column (relationship/weight). Trivial fixture, mechanical E2E. Likely a single-pass arc with 1-2 commits.

**Decisions pending brief:**
- Delimiter handling (comma only, or auto-detect including TSV?)
- Header row required or optional?
- Quoted-field handling (RFC 4180 minimal compliance?)
- Empty cells / missing target → skip or error?

**Registered-bar evaluation:** CSV is genuinely simple; the UX risk is "user has a weirdly-formatted CSV and the error message is unhelpful." Bar-clearing depends on error message quality.

**Driver:** Final adapter for the v1.0 set. Represents the generic-format family in the Kirby move.

### v109.5 — Arc Close + Adapter Bar Verification

**Sub-passes:**
- v109.5.0 — Manual verification pass: each of the three new adapters (markdown-vault, cytoscape-json, package-dependency, csv) gets tested against real-world inputs. Markdown-vault on a real Obsidian vault. Cytoscape on a real Cytoscape.js export. Package-dependency on a real npm project. CSV on a real edge-list export from somewhere. Adapter that doesn't meet the registered bar gets downgraded to candidate + UI framing updated.
- v109.5.1 — Arc close: semver 0.15.0 → 0.16.0, NOW.md reconcile, SDK_SPEC.md coherence pass (any sections still marked "open" — close or explicitly mark "post-v1.0").

**Driver:** Arcs need explicit close passes to bank state cleanly. v109 has accumulated significant architectural change (the platform, four adapters, two `~/Projects/future-integration/` design docs, the test-scope convention, multiple sharp-edge entries). v109.5 explicitly closes that loop.

### v110 — Real-Source-Mode Bugs + Identity + Error Boundary

**Sequence change rationale:** The audit had v110 = test infrastructure, v111 = bugs+identity. I'm swapping them. The two real-source bugs (`ThemeTargetInspectorOverlay` panel overflow + fixture-testid hardcode) are **bugs in production**, currently masked by skipped tests. They affect the primary use case. Test infrastructure can wait one arc — the bugs cannot.

Identity (window title, dock, About) and the error boundary are paired here because they're all "ship-blocker hygiene" — different code areas, same urgency, all fit a single coordinated pass.

**Sub-passes:**
- v110.0 — Investigation brief: classify each known production bug, identify dependencies, scope the boundary placement strategy (AppShell root only, or per-tile too?), confirm the identity rename surfaces (`tauri.conf.json`, `Cargo.toml` if applicable, the dock+About flow).
- v110.1 — Identity rename: `tauri.conf.json` productName/identifier/title, Cargo.toml name field, window-title verification. Single-commit pass.
- v110.2 — ErrorBoundary at AppShell root + recovery UI (reset-settings button, error display). Per-tile boundaries deferred to v112 if not needed for safety.
- v110.3 — Real-source bug 1: `ThemeTargetInspectorOverlay.tsx:149-184` panel overflow. Includes re-enabling the skipped E2E test.
- v110.4 — Real-source bug 2: `ThemeTargetInspectorOverlay.tsx:42` fixture-testid hardcode. Includes re-enabling the skipped E2E test.
- v110.5 — `StatusCluster.tsx:14-15` layout state: either wire to physics supervisor or remove from UI. The "settling" hardcode has been a v109-era embarrassment; it ends here.
- v110.6 — Arc close: 0.16.0 → 0.17.0.

**Driver:** These are the items the audit identified as "literally cannot ship." Naming them as an arc surfaces them; sequencing them first means everything downstream operates on an honest production-mode foundation.

**LANDED:** `ebd29ac` (v110.1) · `4755b99` (v110.2) · _(v110.3 arc close)_ — arc closed 2026-06-09 · semver 0.16.0 → 0.17.0.
Compressed from 6 sub-passes to 3 commits per Ryan's blast-radius assessment: v110.0 investigation informed scope directly (no standalone commit); v110.1 bundled identity + ErrorBoundary + StatusCluster; v110.2 bundled both real-source bugs + 10 test renames + 2 re-enabled E2E; StatusCluster removal folded into v110.1; arc close is v110.3.
Deviations: per-subsystem ErrorBoundary boundaries remain deferred to post-v1.0 per ROADMAP §2.6.

### v111 — Test Infrastructure

**LANDED:** 2026-06-09

- v111.1 `cc42b94` — graph-visual-inventory split (3 files: Core/Probes/Theme)
- v111.2 `fcd79d0` — qa.ts helper conversions (openAdvisoryTab, expandSection)
- v111.3 `68e543c` — flaker triage (color-tab fix + 3 documented + gwells C9.0 deferred)
- v111.4 + .4a–.4e — CI E2E wiring attempts (6 amendments, none converged)
- v111.4-pull `d2d0cce` — revert CI E2E, defer to dedicated arc
- v111.5 `35028fe` — arc close, semver 0.17.0 → 0.18.0

**Outcomes:**
- GVI portion: ~8.7 min → 2m 58s (66% reduction)
- contract-registry flake resolved via cascade fix in v111.2
- color-tab animation waits eliminated
- gwells C9.0 deferred as architectural (engine instrumentation needed, out of v1.0 scope)
- CI E2E DEFERRED to dedicated arc (post-v1.0); v110-era CI state (lint-css + typecheck) retained

**Deviations from planned sub-pass structure:**
- v111.4 split into 6 amendments (audit projection of CI runtime was wrong by ~10x; structural Vite/CI mismatch surfaced only through measurement)
- v111.4 pulled entirely after the prod-preview switch (v111.4e) failed CI with 4/5 shards timing out
- Decision discipline: when amendments stop converging, pull and defer rather than continue past arc-budget

**Audit projection vs reality (the lesson):**
- Audit (`v111_0_test_infrastructure_report.md` §4) projected 4-7 min CI runtime based on GVI split's local measurement
- Reality (single-runner): 70-100 min projected; never measured to completion
- Reality (5-shard matrix with prod-preview): 4/5 shards hit 20-min job timeout
- Root cause: Vite dev cold-start in CI is structurally slow and not addressed by timeout/shard configuration
- Real-fix path documented in `docs/known-bugs/ci-e2e-vite-cold-start.md` for a dedicated future arc

### v112 — UI Completeness + Dev-Artifact-Bleed Cleanup [NEXT]

This is where I want to push back on the audit's framing. The audit treated this as "remove from nav as part of cleanup." It's bigger than that — it's information-architecture work.

**Sub-passes:**
- v112.0 — Investigation brief + IA decisions: what's the inspector ring's actual shape after removing the three placeholder spokes? (Drop to 5? Re-flow to a different design? Add other useful spokes?) Same question for the Theme menu (Workshop/History/Bookmarks/Export removed → "Browse + Active" only — is that the right shape?). These are *design* questions that deserve a brief, not just code edits.
- v112.1 — Implement the IA decisions (remove or reframe spokes/sub-areas; updated nav shape).
- v112.2 — Scrub internal arc numbers from user-visible strings throughout. "Coming in v92" → either user-language ("Audio reactivity coming soon") or remove entirely.
- v112.3 — Dev-tooling tile triage: `QaPanel` (1606 lines, definitely dev-only) → gated. `command-deck` → reframe as user-facing (command palette is core UX). `system-index` → reframe or gate based on usefulness decision. `AgentChatPlaceholder` → remove entirely or feature-flag.
- v112.4 — Mis-homed tile sections (5 deferred): `qa-feedback`, `graph-visual-inventory`, `system-index`, `command-deck`, `source-adapter`. Each: relocate to settings advanced tab, gate behind dev-mode flag, or promote to proper panel.
- v112.5 — Arc close: 0.18.0 → 0.19.0.

**Driver:** First external users will see these surfaces. Every stub, placeholder, and internal string visible at this stage is a "rough edge" flag. The audit identified the surfaces; v112 makes the design+removal decisions explicitly.

### v113 — Source Adapter UX Maturity

**Sub-passes:**
- v113.0 — Investigation brief: audit current SourceAdapterPanel UX against "would a real user know how to use this?" Pre-load path validation, error message quality, candidate-vs-registered visual distinction, first-run onboarding.
- v113.1 — Pre-load validation: text input fields hint at format (Obsidian vault → existing directory; Cytoscape JSON → existing file). Form-level "is this even findable?" before the load tries.
- v113.2 — Error message quality: every raw error string from a Tauri command gets a user-language wrapper. "Cannot canonicalize root: No such file or directory" → "Couldn't find that folder. Check the path?"
- v113.3 — Candidate-vs-registered visual distinction: clear UI badge, candidate adapters explicitly labeled "preview" or hidden behind an opt-in toggle.
- v113.4 — First-run nudge: when user is on self-graph (the v1.0 default), subtle prompt in the panel header pointing at "Connect your own data" with a one-tap path to picking an adapter.
- v113.5 — Arc close: 0.19.0 → 0.20.0.

**Driver:** The source adapter is the primary value proposition. The first real interaction users have with their own data is through this panel. It needs to feel like a *product feature*, not a debug surface.

### v114 — Security + Dependency Hygiene

**Sub-passes:**
- v114.0 — `npm audit` triage, full pass: chromium → tmp resolve, any other advisories.
- v114.1 — Stylelint: remove redundant `stylelint-use-logical` plugin (unused alongside `stylelint-plugin-logical-css`); promote remaining 5 logical-property warnings to errors.
- v114.2 — Tauri plugin version review.
- v114.3 — Final dependency-vet pass: review every direct dep, document why each ships.
- v114.4 — Arc close: 0.20.0 → 0.21.0.

**Driver:** Known high-severity advisory in the lockfile is a ship liability. v114 is the explicit "clean the dependency tree" arc.

### v115 — Release Build + Cold-Install QA

**Sub-passes:**
- v115.0 — Pre-ship checklist execution: full E2E green on 3 consecutive runs (post-v111 suite), tauri release build on Linux (primary platform), Windows/Mac if in scope, settings migration regression test (v92 → current).
- v115.1 — Cold install on a fresh machine: app opens correctly, defaults are sane, no prior-settings bleed, About dialog correct.
- v115.2 — Real-data end-to-end: load a real markdown vault, a real Cytoscape JSON, a real `package.json`, a real CSV. Verify each works through to graph render.
- v115.3 — Final user-visible-strings audit: no internal arc numbers, no "coming soon" in main nav, all polish-debt cleared.
- v115.4 — Release: semver to 1.0.0, tagged release, Tauri bundle artifacts, changelog from v109.5 onward published.

**Driver:** Ship.

---

## §4 — What v1.0 Does Not Include (Explicit Defer List)

Each item here is justified by either scope-discipline or post-v1.0 ordering. Documenting so they don't accidentally re-enter scope:

### 4.1 Adapter formats deferred to post-v1.0

- **`package-lock.json` / `yarn.lock` / `pnpm-lock.yaml`** (transitive deps): v110+ candidate
- **`Cargo.toml` + `Cargo.lock`** (Rust): v110+ candidate
- **`pyproject.toml` / `requirements.txt` / `Pipfile`** (Python): v110+ candidate
- **`Gemfile`, `go.mod`, `pom.xml`, `build.gradle`** (Ruby/Go/Java): post-v2.0 candidates (each is its own parser)
- **Mermaid, Graphviz DOT, PlantUML, D2** (DSL diagrams): post-v1.0 (new DSLAdapter family base)
- **GraphML, GEXF, JGF, NetworkX node-link, Sigma export** (other graph formats): post-v1.0 (some are trivial; bundling them adds noise to the registered-adapter list without proportional value)
- **OPML, RDF/Turtle, JSON-LD, OpenAPI, GraphQL schema** (web/data): post-v1.0 (each is its own parser)

### 4.2 Platform features deferred

- **Folder-picker dialog** (`tauri-plugin-dialog`): text input only for v1.0
- **File-watching for live source refresh**: manual refresh only for v1.0
- **Streaming / chunked loading**: 2000-node cap with truncation warning is sufficient for v1.0
- **Full plugin SDK (JS/WASM runtime loading)**: post-v2.0 (Option C from v109 portfolio survey)
- **Declarative config-driven adapters**: deferred to post-v1.0 (Option B from v109 portfolio survey; possible v2.0 candidate)
- **`tauri-plugin-fs` adoption for user-configured roots**: manual Rust validation continues; revisit if a real need surfaces post-v1.0

### 4.3 Sibling integration

Per `~/Projects/future-integration/INTEGRATION_FUTURES.md` §7 do-not-build list:
- No live Cerebra IPC channel
- No live transport implementation (`transport: "live"` is rejected at parse time in v1.0)
- No Cerebra-specific UI beyond the `coupling: "sibling-module"` flag
- No cross-module dependencies in either direction
- No agent-state extensions implemented (the namespace exists; no code reads from it in v1.0)

### 4.4 Quality-of-life arcs deferred

- **Code spoke enrichments** (registration site, token bindings inline, cross-file references): logged since v105; remains deferred
- **Inspectable Coverage + Token Hygiene** (css-handle-report findings, `--lw-glow` silent failure, orphaned variables, hardcoded fallbacks): logged since v105; remains deferred to post-v1.0
- **Tile-content theming** (~86 hardcoded Tailwind references): post-v1.0
- **3D rendering** (Three.js / R3F path): post-v1.0 vision; ribbon edge geometry validated; full arc post-1.0
- **Audio reactivity**: post-v1.0 (the v92 audio-reactivity arc that's been showing as "coming in v92" in inspector strings — explicitly deferred and the user-visible string must be removed in v112)
- **Typography axis token wiring**: same — deferred and the inspector spoke string must be removed in v112
- **CI E2E wiring** — deferred to a dedicated post-v1.0 arc. v111 attempted via 6 amendments; Vite dev cold-start in CI is structurally too slow, production-preview switch surfaced additional unknowns. Full investigation in `docs/known-bugs/ci-e2e-vite-cold-start.md`. Local full-suite runs (~3 min) + manual pre-ship gate (per §3 v115) cover the verification need for v1.0. CI E2E becomes a quality-of-life addition, not a ship-readiness blocker.

### 4.5 The discipline

When tempted to fold any of the above into a v1.0 arc, *stop*. Each is here because pulling it forward would either bloat the ship arc, require a dependency Ryan hasn't approved, or signal the wrong product positioning.

---

## §5 — Open Questions to Resolve Before Each Arc Starts

Each arc surfaces architectural decisions that need locking. The investigation-brief-then-implement loop produces these as pre-flight checklists. Listing here as a forward-looking index so we know what's pending:

### Before v110

- Error boundary scope: AppShell root only, or per-tile too?
- Identity rename: does `Cargo.toml` need a name update, or only `tauri.conf.json`?
- Real-source bug 2 fix shape: dynamic testid selector vs. unified naming (rename the production testid to match the fixture)? The latter is cleaner but might break tests.

### Before v111

- graph-visual-inventory split granularity: 3 files by feature area, 5 files, or `test.describe.parallel()` within the same file?
- E2E CI wiring: GitHub Actions matrix, single runner, or separate per-feature-area runs?
- Acceptable suite runtime ceiling: <5 min, <3 min, or just "as fast as practical"?

### Before v112

- Inspector ring shape after removing placeholders: 5 spokes, 8 spokes with new fillers, or redesigned entirely?
- Theme menu shape: "Browse + Active" only, or restructured?
- `QaPanel`, `system-index`, `command-deck`, `graph-visual-inventory`: which are "remove from canvas tile system entirely," which are "reframe as user-facing," which are "gate behind dev-mode flag"?
- AgentChatPlaceholder: remove entirely, feature-flag, or replace with a real (minimal) chat interface?

### Before v113

- First-run nudge UX: subtle banner, modal, panel-header tooltip, or onboarding overlay?
- Candidate-adapter UX: hidden by default with toggle, or always shown with "preview" badge?
- Error message wrapping strategy: per-error-string in code, or central error translation table?

### Before v114

- Stylelint warning → error promotion: pre-fix the 5 warnings then promote, or promote and let CI fail until fixed?
- Tauri plugin version review: every plugin needs review, or only those with reported issues?

### Before v115

- Target platforms for v1.0 release: Linux only (matches Ryan's primary dev environment), or Linux + Windows + macOS?
- Bundle format: AppImage / .deb / .dmg / .msi / Snap — which subset?
- Release channel: GitHub releases only for v1.0, or include other distribution mechanisms?

---

## §6 — Living Document Conventions

This doc evolves with the work. The discipline:

1. **Arc landing updates this doc.** When an arc closes, the relevant §3 entry gets a "**LANDED:**" annotation with the closing commit and any amendments to the original plan. Architectural decisions surfaced in the arc that affect later arcs get propagated to those entries.

2. **Defer-list amendments are explicit.** If an item gets pulled out of §4 (e.g. a deferred adapter becomes a v1.0 candidate), the discussion happens here first, with a "**AMENDED:**" annotation explaining the rationale.

3. **Cross-references with `~/Projects/future-integration/`.** This doc is LumaWeave-internal ship-readiness. The sibling-integration concerns (SDK_SPEC, INTEGRATION_FUTURES, SHARED_SCHEMA) live in the shared dir. When a v1.0 arc surfaces a sibling-integration implication, this doc references the shared dir; the shared dir doesn't track LumaWeave-internal arcs.

4. **NOW.md remains the operational state.** This doc is *planning*; NOW.md is *current snapshot*. NOW.md updates with each arc landing; this doc updates with each strategic shift.

5. **Decisions, not aspirations.** Every entry in this doc is something we've decided or that's locked by the audit. Aspirations and speculative ideas go in the future-integration docs or in dedicated brainstorming docs — not here.

---

## §7 — Cross-References

- `~/Projects/lumaweave/docs/LUMAWEAVE_NOW.md` — current operational state
- `~/Projects/lumaweave/docs/KNOWN_SHARP_EDGES.md` — accumulated lessons (Zustand selectors, Buffer polyfill, adapter-loader dep direction, etc.)
- `~/Projects/future-integration/SDK_SPEC.md` — adapter SDK contract (v0.1, evolving)
- `~/Projects/future-integration/INTEGRATION_FUTURES.md` — sibling-module deferred vision
- `~/Projects/future-integration/SHARED_SCHEMA.md` — cerebra-graph.json contract
- `~/Projects/lumaweave/docs/workflows/` — investigation reports and Bandit prompts (per-arc artifacts)
- `~/Projects/lumaweave/docs/prototypes/source-adapter-plan.md` — earlier (pre-v109) adapter audit

---

## §8 — Audit Trail

- **2026-06-08, terminal Claude audit:** initial empirical ship-readiness analysis, source for §1 ground-truth findings and §3 arc structure bones
- **2026-06-08, planning Claude synthesis:** this document; sequence amendment (v110/v111 swap to surface production bugs first); architectural principles in §2 named explicitly; defer list in §4 expanded against the v109 conversation history

This doc was created late in the v109.2 arc, after the platform + first three adapters landed, when the gap between v106-v108 documented intent and v109 lived reality had become visible. The audit caught us up; this synthesis turns the audit into a working roadmap.
