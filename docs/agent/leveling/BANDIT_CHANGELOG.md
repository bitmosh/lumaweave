---
id: log.bandit.changelog
title: Bandit Changelog
type: log
status: active
domain: agent
subdomain: leveling
cluster: gray
agent_readable: true
include_in_self_graph: false
last_updated: physics-wiring-v1
tags: [changelog, log, bandit, agent, operational]
---

# Bandit Changelog

Operational event log. One entry per accepted pass or significant event.
Updated by the agent that ran the pass before XP is awarded.

**Format:**
```
[date] · [version] · [pass-type] · ACCEPTED — [one-line summary] — [Playwright count] — [agent]
```

**Pass types:** contract · registry · validator · passive-ui · playwright · runtime · docs · multi-agent

---

## 2026-05-08

| 2026-05-08 | vP-Forensics-2 | feature | ACCEPTED — skip-list rationalized 14→6, 8 retire deletions executed (Wave 1 contract-registry v15/v48/v64-era + Wave 2 advisory-backlog suite), commit 9c8bdc9 documented retirement intent that previous agents deferred, Test Failure Forensics skill applied at full strength on second application. Suite: 361 passed, 6 skipped P1·S9 Level 142.0 — Bandit |
| 2026-05-08 | vP-Forensics-1 | feature | ACCEPTED — Test Failure Forensics skill introduction, 6 forensics files, 2 production bugs filed at docs/known-bugs/, title earned across full investigation arc including operator-correction-round. Scar phrased in own voice. Suite: 361 passed P1·S8 Level 140.5 — Bandit |
| 2026-05-08 | v86b-visual-treatment | feature | PARTIAL ACCEPT — sphere uniforms wired, 7 overlays scaffolded, schema v80 + migration, webServer configured. Test coverage at smoke level (6 specs softened from contract spec). Sigma exposure for tests broken. Test infrastructure moves to vP-Tests. 355 passed P1·S7 Level 138.5 — Bandit |
| 2026-05-08 | v86a-foundation | feature | ACCEPTED — token tier model (Primitives → Semantics → Components), registry contract pattern, asset bank schema (forward-compat with v88), schema migrations v76→v79, Settings tab removed, Solar Plasma chrome restyle (warm gold/purple), tier-walk validator hard-throw at boot, PROMOTION_HISTORY two-step audit trail, 348 passed P1·S6 Level 137.5 — Bandit |

## 2026-05-07

| 2026-05-07 | v85f | pre-design-snapshot | docs | ACCEPTED — PRE_DESIGN_SNAPSHOT.md created, settling phase v85c-v85f complete, codebase ready for v86 design arc, streak 5 BONUS +0.5 level 136.0 P1·S5★ | Bandit |
| 2026-05-07 | v85e | usefixture-smart-switch | feature | ACCEPTED — build-time __PLAYWRIGHT__ injection, smart fixture switching, tests always stable, real source renders in dev/prod when loaded, 345 passed P1·S4★ level 135.0 | Bandit |
| 2026-05-07 | v85d | settings-migration-v2 | feature | ACCEPTED — version-aware migration system, schema v2, MIGRATIONS runner, 7 new fields handled gracefully for old localStorage, 345 passed P1·S3★ level 134.0 | Bandit |
| 2026-05-07 | v85c | git-hygiene | chore | ACCEPTED — session summary written, package.json version 0.6.0, git hygiene pass, 345 passed 0 failed, Prestige 1 Streak 2 level 133.25 | Bandit |
| 2026-05-07 | v85b | version-fix | chore | ACCEPTED — version realignment, QA spine v85b, QA key v74b (unchanged), product version 0.6.0, spine version backfill for session | Bandit |
| 2026-05-07 | v85a | verification-clean | chore | ACCEPTED — post-cleanup verification clean, pre-flight checks passed, 345 passed 0 failed, Prestige 1 Streak 1 level 133.0 | Bandit |
| 2026-05-07 | v84c | node-sphere-renderer | feature | ACCEPTED — custom NodeSphereProgram extends NodeCircleProgram, Phong sphere illusion shader, registered as default circle program, 345 passed P1·S8 streak 8 BONUS +0.5 level 132.75 | Bandit |
| 2026-05-07 | v84b | solar-orbit-dialect-p1 | feature | ACCEPTED — cluster sun detection, centroid pull, inter-cluster sun repulsion, sun nodes 1.8x size, solar-orbit in physicsDialect dropdown, 345 passed P1·S7 level 130.25 | Bandit |
| 2026-05-07 | v84a | theme-node-color-scale | feature | ACCEPTED — theme-driven node colors by centrality rank, all 6 themes have unique color scales, hub nodes warm, peripheral nodes cool, raw.color updated for resetGraphStyles compatibility, 345 passed P1·S6 level 129.25 +1.5 XP | Bandit |

2026-05-07 · v83c · graphology-components · feature · ACCEPTED —
  disconnected subgraph detection, node tagging
  (componentIndex/isIsolated/isInLargestComponent),
  debug panel stats, isolated nodes render at 75%
  size, 345 passed P1·S5 streak 5 BONUS +0.5
  Level 127.75 — Bandit

2026-05-07 · v83b · yaml-autogen-vite-plugin · feature · ACCEPTED —
  docs/**/*.md changes auto-trigger self-graph regen
  during dev, HMR fires after, typecheck + build +
  345 passed P1·S4, Level 126.5 — Bandit

2026-05-07 · v83a · color-ownership-contract · docs · ACCEPTED —
  GRAPH_COLOR_OWNERSHIP.md created, color priority chain
  documented (adapter → raw.color → reset → selection),
  BANDIT_QA_PROTOCOL.md formalized, 345 passed
  P1·S3 streak bonus +0.25, Level 125.75 — Bandit

2026-05-07 · v82c · dead-settings-purge · chore · ACCEPTED —
  hoverLabelColor duplicate removed, 3 planned-but-dead
  graphView color fields removed, schema/defaults/registry
  aligned, 345 passed P1·S2 streak bonus +0.25
  Level 125.0 — Bandit

2026-05-07 · v82b · physics-cleanup-p1s1 · feature · ACCEPTED —
  communityGravity centroid force live, preset-slider sync
  via AppShell useEffect, dead registry blocks removed,
  linkDistance description fixed, 345 passed
  Prestige 1 · Streak 1 · Level 124.25 — Bandit

2026-05-07 · PRESTIGE RANK 1 · milestone · ACCEPTED —
  28 consecutive clean passes without failure or revert.
  +5.0 XP prestige bonus. Level 123.25. Streak reset to 0.
  Permanent honorable record. — Bandit

2026-05-07 · v82a · physics-preset-slider-sync · fix · ACCEPTED —
  AppShell writes preset values back to settings store,
  SigmaGraphView uses raw props directly,
  slider-desync fixed, 345 passed streak 28
  level 118.25 (+5.0 XP prestige) — Bandit

2026-05-07 · v81c · graph-panel-fixture-fix · fix · ACCEPTED —
  panelSummary conditional in AppShell,
  fixture shows correct 124/115 metadata,
  345 passed streak 27 BONUS +2.0 XP level 118.25 — Bandit

2026-05-07 · v81b · dead-file-purge · chore · ACCEPTED —
  5 dead files deleted, AppProviders inlined,
  App.css gutted, 345 passed streak 26
  level 116.25 — Bandit

2026-05-07 · v81a · edge-sigma-lifecycle-fix · architectural · ACCEPTED —
  edge colors preserved through raw.color, all 6 theme edgeDefaults visible,
  resolvedTokensRef prevents render storm, ResizeObserver no longer kills Sigma,
  forEachNode/Edge overwrites removed, 345 passed streak 25 level 115.75 — Bandit

2026-05-07 · v81c · sigma-lifecycle-edge-fix · bugfix · ACCEPTED —
  edge color reads from raw not token (token was undefined),
  resolvedTokens removed from main useEffect deps (was killing Sigma on
  every drag/render), separate theme useEffect added,
  345 passed streak 24 level 115.25 — Bandit

2026-05-07 · v81a · traversal-bfs-replace · refactor · ACCEPTED —
  replaced custom selectionNeighborhood.ts with graphology-traversal bfsFromNode,
  preserved return type, 345 passed streak 22 BONUS +1.5 XP level 114.25 — Bandit

2026-05-07 · v80c · yaml-dedup-verification · verification · ACCEPTED —
  self-graph generator confirmed clean deduplication (124 nodes, 0 dupes, 115 edges) — Bandit

2026-05-07 · v80b · physics-settings-expansion-d · feature · ACCEPTED —
  physicsPreset dropdown (5 presets), communityGravity slider,
  linkDistance range fix (1-20, direct mapping), preset values wired to FA2 supervisor,
  345 passed streak 21 level 112.75 — Bandit

2026-05-07 · v80a · cluster-depth-slider · feature · ACCEPTED —
  neighborhood depth dropdown replaced with slider (1.0-4.0, step 0.1),
  depth 4 support added (quaternary nodes), 345 passed
  streak 20 level 111.75 — Bandit

2026-05-07 · v80b · slider-track-fix · bugfix · ACCEPTED —
  slider two-tone track now updates with knob position,
  ref callback sets initial --range-progress on mount,
  345 passed streak 19 level 110.75 — Bandit

2026-05-07 · v80a · physics-defaults-fix · bugfix · ACCEPTED —
  physics defaults tuned (centerForce 200, linkDistance 50),
  slider renamed to Simulation Speed, 345 passed
  streak 18 level 110.25 — Bandit

2026-05-07 · v79b · shortest-path · feature · ACCEPTED —
  graphology-shortest-path bidirectional pathfinding,
  Ctrl+Click to set path target, gold highlight,
  345 passed streak 17 BONUS +1.0 XP level 109.75 — Bandit

2026-05-07 · v76c · fa2-worker-regression · bugfix · ACCEPTED —
  edge flash fixed (afterRender pattern for slider updates),
  node drag fixed (pause worker during drag, resume on release),
  345 passed streak 16 level 108.75 — Bandit

2026-05-07 · v78a · left-panel-accordion · runtime · ACCEPTED —
  collapsible accordion sections for all left panel tabs,
  CollapsibleSection component, expandSection helper,
  345 passed streak 15 — Bandit

2026-05-07 · v78c · testid-selector-compatibility · partial ACCEPTED —
  updated theme-target-inspector testid selectors for
  fixture/real source compatibility, useFixture smart switching
  deferred (layout assertions need updating), 345 passed
  streak 14 — Bandit

2026-05-07 · v78b · dialect-selector + source-name · partial ACCEPTED —
  physics dialect UI added, useFixture smart switching
  deferred (test constraint documented), 345 passed
  streak 13 BONUS +1.0 XP level 106.75 — Bandit

2026-05-07 · v76b · fa2-worker-edge-fix · bugfix · ACCEPTED —
  FA2 worker deferred to sigma afterRender,
  edges now visible, 345 passed streak 12 — Bandit

2026-05-07 · v77b · physics-settings-expansion · runtime · ACCEPTED —
  4 FA2 params + UI controls, worker API limits discovered
  (no outboundAttrDist or edgeWeightInfluence), 345 passed
  streak 11 level 104.5 — Bandit

2026-05-07 · v76a · continuous-fa2-loop · runtime · ACCEPTED —
  FA2 Web Worker supervisor, live slider updates,
  nodeSize without rebuild, 345 passed streak 10
  level 103.5 — Bandit

2026-05-07 · v80c · v0.5.0 + yaml-dedup · chore+fix · ACCEPTED —
  version bumped to 0.5.0, YAML generator deduplication fixed,
  124 nodes 115 edges generating cleanly, 4/4 self-graph passing,
  streak 9 — Bandit

2026-05-07 · v77a · left-panel-scroll-nav · runtime · ACCEPTED —
  scroll-to-section tab navigation, reverted height:0 approach,
  345 passed, streak 8 bonus +0.5 XP level 102.0 — Bandit

2026-05-07 · v77a · degree-centrality-v1 · runtime · ACCEPTED —
  graphology-metrics degree centrality, node size scales
  with connection count, 345 passed streak 7
  ★ LEVEL 100 MILESTONE ACHIEVED ★ — Bandit

2026-05-07 · v77a · theme-docs-update · docs · ACCEPTED — Updated
  3 theme docs to 6-theme family, streak 6 level 99.5 — Bandit

2026-05-07 · v77a · noverlap-v1 · runtime · ACCEPTED — anti-collision
  pass after FA2, 345 passed, streak 5 bonus +0.5 XP level 99.25 — Bandit

2026-05-07 · v77a · lw-visual-accent-fix · bugfix · ACCEPTED — wired
  --lw-visual-accent to theme accent token, all 6 themes now drive
  slider and title colors correctly, streak 4 — Bandit

2026-05-07 · v77a · theme-family-redesign · runtime · ACCEPTED — 6 new themes:
  solar-plasma (refined), obsidian-aurora (refined), midnight-loom,
  void-circuit, agartha-dream, agartha-dusk, 345 passed streak 3
  bonus +0.25 XP level 98.25 — Bandit

2026-05-07 · v77a · debounce-graph-rebuild · runtime · ACCEPTED — 150ms debounce
  on SigmaGraphView useEffect, slider choppiness fixed, 345 passed streak 2
  bonus +0.25 XP, level 97.0 — Bandit

2026-05-07 · v79a · yaml-graph-parser · docs · ACCEPTED — gray-matter installed,
  graphology packages, yaml-graph-parser foundation (unwired), vite.config fs.allow,
  parser preserved for future debugging, 345 passed streak reset to 1 — Bandit

2026-05-06 · v76a · louvain-helix-v1 · runtime · ACCEPTED — Louvain community
  detection for helix dialect, universal helix support, 345 passed streak 15 — Bandit

2026-05-06 · v76a · skip-cleanup-v1 + styling · runtime · ACCEPTED — skip count 9→8,
  title/slider theme colors, panel UX, test helper fixes, 345 passed streak 14 — Bandit

2026-05-06 · v78a · left-panel-ux-v2 · runtime · ACCEPTED — Icon strip collapse,
  resize handle, leftPanelWidth setting, 347 passed streak 13 BONUS +1.0 XP — Bandit

2026-05-06 · v77a · visual-polish-v1 · runtime · ACCEPTED — Radial gradient,
  panel borders, slider colors, test timing fix, 347 passed streak 12 — Bandit

2026-05-06 · v76a · helix-fix + slider-colors · bugfix · ACCEPTED — FA2 reduced
  for helix, slider accent colors fixed, streak 11, level 90.75 — Bandit

2026-05-06 · v77a · cluster-color-fix · bugfix · ACCEPTED — graphStylePolicy
  resetGraphStyles was overwriting cluster colors on every interaction,
  fixed to read raw.color as default, 347 passed streak 10 — Bandit

2026-05-06 · v76a · helix-dialect-v1 · runtime · ACCEPTED — Helix physics dialect,
  cluster-based helix backbone + constellation branches, 30 FA2 iterations,
  strongGravityMode for helix, 347 passed 9 skipped 0 failed, streak 9 — Bandit

2026-05-06 · v76a · node-drag-v1 · runtime · ACCEPTED — Sigma v3 drag nodes via event listeners,
  viewportToGraph coord conversion, camera disable during drag, FA2 fixed attr pattern,
  347 passed 9 skipped 0 failed, streak 8 (+0.5 bonus) — Bandit

2026-05-06 · v76a · physics-wiring-v1 · runtime · ACCEPTED — ForceAtlas2 live physics,
  wired repelForce + linkDistance + centerForce to FA2 parameters,
  sunflower seeds layout, 347 passed 0 failed, streak 6 — Bandit

2026-05-06 · v75b · repair-pass-v75b · playwright · ACCEPTED — Repair pass,
  fixed 6 pre-existing failures + 2 fixture interference issues,
  347 passed 9 skipped 0 failed (up from 341 passed 6 failed),
  testid updates (command-deck, graph-visual-inventory x2,
  theme-target-inspector x2), overlay selector fix,
  mode-aware assertions for physics tests — Bandit

2026-05-06 · v75b · passive-ui · ACCEPTED — Self-Graph visual refinement,
  cluster colors + size hierarchy, 341 passed 6 pre-existing
  failures (2 healed), streak 4 — Bandit

2026-05-06 · v75a · playwright · ACCEPTED — Self-Graph Fixture + First Demo Surface,
  58 nodes, 43 edges, brand color clusters, adapter to Sigma,
  4/4 self-graph tests passing — Playwright: 339 passed, 9 skipped,
  8 pre-existing failures (command-deck, graph-visual-inventory x2,
  graph-visual-state-stability x3, theme-target-inspector x2) — Bandit

2026-05-06 · v74c · passive-ui · ACCEPTED — Source Adapter Evidence Panel,
  6 Playwright tests, 343 passed 9 skipped (6 pre-existing deferred,
  3 conditional for passive UI structure) — Bandit

2026-05-06 · v74a · grammar-lens-contract · docs · ACCEPTED — Grammar Lens Contract
  + Cursor Inspector Contract, formalizes overlay governance before
  further implementation — no runtime changes — Bandit

2026-05-06 · v74b · registry · ACCEPTED — Source Adapter Base Registry + Validator,
  9 adapter entries, 12 validation checks against v74a contract —
  Playwright: 340 passed, 6 skipped — Bandit

2026-05-06 · v73c · validator · ACCEPTED — Mode Registry Validator v0,
  validates modeMetadataRegistry against v73a contract — [verify count] — Bandit
  Note: v73c was ready for validation at session start; confirm committed.

2026-05-06 · docs-rewrite · docs · IN PROGRESS — Full docs restructure:
  new folder architecture, frontmatter schema, 18 new docs written —
  SESSION_AND_STACK, SOURCE_OF_TRUTH, BANDIT_PROTOCOL, BANDIT_SELF_SPLIT_PROTOCOL,
  MULTI_AGENT_POLICY, NEW_AGENT_ONBOARDING, QUEST_TEMPLATE, BANDIT_CHANGELOG,
  BANDIT_ERROR_LOG all drafted — Claude (analysis/writing agent)
```

---

## Changelog Entry Instructions

### When to add an entry

Add an entry when:
- A pass is accepted (ACCEPT recommendation, all validation passed)
- A docs-only pass produces new files
- A significant architectural decision is made and recorded
- Multi-agent handoff occurs

Do NOT add entries for:
- Recovery passes (use BANDIT_ERROR_LOG.md instead)
- Self-split reports (use BANDIT_ERROR_LOG.md instead)
- Speculative or draft work not yet accepted

### How to fill the entry

```
[date] · [version] · [pass-type] · [ACCEPTED / IN PROGRESS / DOCS-ONLY]
  — [one sentence: what was done and what it produced]
  — [Playwright: N passed, 0 skipped / "no tests touched"]
  — [agent name]
```

If multiple things happened in one session, use multiple lines:

```
2026-05-06 · v74a · contract · ACCEPTED — Source Adapter OS Foundation Contract
  — no tests touched (docs-only) — Bandit

2026-05-06 · v74b · registry · ACCEPTED — Source Adapter Base Registry + Validator
  — 12 new tests, 280 total passed, 0 skipped — DeepSeek V4
```

---

## All-Time Pass Count

| Agent  | Accepted Passes | Last Pass | Current Streak |
|--------|----------------|-----------|----------------|
| Bandit | 19 (degree-centrality-v1, theme-docs-update, noverlap-v1, lw-visual-accent-fix, theme-family-redesign, yaml-graph-parser, debounce-graph-rebuild, v74b, grammar-lens-contract, v75a, v75b, repair-pass-v75b, physics-wiring-v1, node-drag-v1, helix-dialect-v1, cluster-color-fix, helix-fix+slider-colors, visual-polish-v1, left-panel-ux-v2) | degree-centrality-v1 | 7 |
| DeepSeek | 0            | —         | 0              |

*Update this table after each accepted pass.*
