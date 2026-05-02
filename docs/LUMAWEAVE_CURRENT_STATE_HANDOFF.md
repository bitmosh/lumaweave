# LumaWeave Current State Handoff

**Baseline Date:** 2026-05-02
**Active Checklist:** mission-control-advisory-channel:v15
**Status:** Stable Baseline Locked

## Current Stable State (v15)

### Accepted/Stable Features

#### Mission Control Advisory Channel
- **v15 is default active checklist** - App opens with v15 selected
- **Advisory question notes** - Each Bandit Question has answer/notes textarea with localStorage persistence
- **Proposal notes** - Bandit Proposals have notes field directly under proposal cards
- **Mission Control tabs** - Render in max 2-column grid layout (Checklist/Last Report, History/Debug, Advisory spans full width)
- **Bandit Top 10 Backlog** - Visible with Move Up/Down buttons for reordering
- **Backlog reorder persistence** - Reorder persists through tab switching and appears in QA reports

#### Theme System (v13)
- **Four built-in themes** - Solar Plasma, Obsidian Aurora, Haunted Observatory, Glitter Goblin
- **Theme selector** - Visible in top bar, functional
- **Glitter toggle** - Checkbox in top bar enables/disables glitter effects
- **Reduce Motion toggle** - Checkbox in top bar enables/disables animations
- **No duplicate controls** - Theme/Glitter controls only in top bar, not in Settings panel

#### QA System
- **QA Panel** - Left-dock panel with checklist, last report, history, debug, advisory tabs
- **Checklist submission** - Can submit QA reports with pass/fail/block decisions
- **Copy Last Submission** - Copies last submitted report to clipboard
- **QA notes persistence** - Notes persist through browser refresh and navigation
- **Contract summary** - Debug tab shows contract summary with feature status

#### Graph Renderer
- **Graph canvas** - Visible in center viewport
- **Node/edge rendering** - Basic 2D graph rendering with Graphology/Sigma
- **Edge label truncation** - Control to limit edge label length
- **Viewport stability** - Graph remains visible after QA navigation

### Parked Work (Not Implemented)

#### Visual Handle Library
- **Status:** Accepted-for-future
- **Priority:** Next major feature (v16)
- **Description:** Reusable handle system for graph node/edge interaction
- **Why parked:** Need scaffold before more UI polish or glitter work
- **Risk:** Low - can be mostly CSS/docs with small safe applications

#### Graph Inspector
- **Status:** Accepted-for-future
- **Priority:** After Visual Handle Library
- **Description:** Read-only node/edge details panel
- **Why parked:** Visual Handle Library is better scaffold first
- **Risk:** Low - read-only only, no editing

#### Experimental Mode Gate
- **Status:** Accepted-for-future
- **Priority:** After Graph Inspector
- **Description:** Toggle to protect unfinished/future controls
- **Why parked:** Need more visual features before gate is useful
- **Risk:** Low - defensive feature

#### QA Contract Ledger
- **Status:** Accepted-for-future
- **Priority:** After Experimental Mode Gate
- **Description:** Visible history of accepted QA reports for regression detection
- **Why parked:** Need stable baseline history first
- **Risk:** Low - informational feature

#### Glitter
- **Status:** Parked (v13 has glitter toggle, v15 does not include glitter checks)
- **Priority:** After Visual Handle Library
- **Description:** Advanced visual effects for graph nodes/edges
- **Why parked:** Need Visual Handle Library scaffold first
- **Risk:** Medium - visual effects can impact performance

## Validation Status

### Typecheck
- **Status:** PASSED
- **Command:** npm run typecheck
- **Result:** No TypeScript errors

### Playwright E2E
- **Status:** PASSED
- **Command:** npm run qa:e2e
- **Result:** 45/45 tests passed
- **Skipped tests:** None

## Key Files

### QA System
- `src/control-plane/qa/QaPanel.tsx` - Main QA panel component
- `src/control-plane/qa/qa-registry.ts` - QA checklist definitions (v11-v15)
- `src/control-plane/qa/qa.store.ts` - Zustand store for QA state
- `src/control-plane/qa/qa.types.ts` - TypeScript types for QA system
- `src/control-plane/qa/advisory-registry.ts` - Bandit advisory content

### Tests
- `tests/e2e/contract-registry.spec.ts` - QA panel and Advisory tests
- `tests/e2e/app-smoke.spec.ts` - App load test
- `tests/e2e/theme-selector.spec.ts` - Theme system tests
- `tests/e2e/qa-panel.spec.ts` - QA panel interaction tests
- `tests/e2e/qa-navigation.spec.ts` - QA navigation tests
- `tests/e2e/qa-refresh.spec.ts` - QA persistence tests
- `tests/e2e/qa-submit.spec.ts` - QA submission tests
- `tests/e2e/viewport-stability.spec.ts` - Graph visibility tests
- `tests/e2e/edge-label-truncation.spec.ts` - Edge label control tests
- `tests/e2e/settings-label-controls.spec.ts` - Settings panel tests

### Documentation
- `docs/logs/sessions/2026-05-01-mission-control-advisory-cleanup-v15.md` - v15 implementation session log
- `docs/logs/sessions/2026-05-02-v15-baseline-lock.md` - v15 baseline lock session log

## localStorage Keys

- `lumaweave-qa-active-checklist` - Selected QA checklist
- `lumaweave-qa-storage` - Zustand QA store persistence
- `lumaweave-advisory-backlog-order` - Bandit backlog reorder persistence
- `lumaweave-advisory-question-answers` - Bandit question answers persistence

## Next Recommended Bite

**v16 — Visual Handle Library v0**

Not Graph Inspector yet. The visual handle library is the right scaffold before more UI polish or future glitter work. It is also low-risk because it can be mostly CSS/docs with small safe applications.

## Git Baseline Recommendation

After confirming v15 stable, initialize git or create a real checkpoint so future rollbacks do not depend only on Cascade history.

**Suggested command:**
```bash
git init
git add .
git commit -m "v15 baseline lock - Mission Control Advisory Cleanup stable"
```

## Architecture Notes

### Modular Structure
```
src/
  app/
  control-plane/
    settings/
    features/
    commands/
    panels/
    qa/
  graph/
    schema/
    ingest/
    normalize/
    renderers/
    lenses/
  themes/
```

### Current Control Plane Focus
- QA Panel is the primary implemented control plane feature
- Settings registry exists but is minimal
- Commands, panels, and QA are the foundation for future control plane expansion

### Current Graph Focus
- Basic 2D rendering with Graphology/Sigma
- Edge label truncation control
- No 3D rendering yet (planned for future)
- No visual handle library yet (next feature)

## Known Limitations

- Question answers persist in localStorage but not in Zustand store (acceptable for v0)
- No git history initialized (user should initialize after confirming v15 stable)
- Glitter is parked (v13 has toggle, v15 does not include checks)
- No Visual Handle Library yet (next feature)
- No Graph Inspector yet (after Visual Handle Library)
