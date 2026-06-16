# LumaWeave — Current State

**As of:** 2026-05-27 (evening)
**Project start:** 2026-05-05 (~3 weeks of development)
**Status:** Active development, pre-public-release. Solo development at ~10-30x typical team velocity.

This is the canonical entry-point doc. When context needs reset, this is read first. Everything else is detail.

---

## What LumaWeave Is

LumaWeave is a graph visualization and theming platform within the broader **Lattica** product suite. It treats graphs as instruments — visual, themable, manipulable. Designed for design-tool-quality interaction, not just data display. Built solo by Ryan with parallel Claude orchestration (planning Claude drafts, Bandit/Claude Code executes).

---

## Architecture (high level)

```mermaid
graph TB
    subgraph Topbar
        WM[Wordmark + Hex Logo]
        TP[Theme/WCAG Pill]
        AT[Animation/Reduce-Motion Toggles]
        SB[Settings Gear]
    end

    subgraph Viewport[Center Viewport]
        SG[SigmaGraphView<br/>2D WebGL graph]
        TL[TileLayer<br/>floating tiles]
        TI[ThemeTargetInspectorOverlay<br/>Alt+Shift+I]
        IM[InspectorMiniGraph<br/>radial spoke UI]
    end

    subgraph Tiles[Tile System — 11 entries]
        direction LR
        T1[Physics ⚛]
        T2[Appearance 🎨]
        T3[Labels 🏷]
        T4[Typography Aa]
        T5[Graph Sources 🗂]
        T6[Graph Inspector 🔍]
        T7[QA/Feedback 📋]
        T8[Agent Chat 💬]
        T9[Graph Visual Inventory 📊]
        T10[System Index 🗃]
        T11[Command Deck ⌘]
    end

    subgraph StatusBar[Bottom Status Bar — 26px static]
        DBG[Debug ▾<br/>Renderer info popover]
        TILES[Tiles ▾<br/>Visibility popover]
        ST[control plane online · theme · animation · renderer]
        UI[UI Inspector Pill]
    end

    subgraph Stores[Zustand Stores]
        SS[Settings Store]
        DS[Debug Store]
        TS[Tile Provider]
    end

    subgraph Registries[Typed Registries — modern pattern]
        TR[tileSectionRegistry]
        CR[commandRegistry]
        HR[hotkeyRegistry]
        TTR[themeTargetRegistry]
        SR[Many more]
    end

    subgraph Settings[Settings Panel — IIFE pattern, refactor target v98.5]
        SC[8 categories<br/>Theme · Typography · Graph · Inspector · DataSources · Display · Accessibility · Advanced]
    end

    SG -.writes.-> DS
    DS -.read by.-> DBG
    SS -.read by.-> Tiles
    TR -.populates.-> TS
    TS -.renders.-> TL
    HR -.connects via commandId.-> CR
```

**Key invariants:**
- Status bar dimensions are **static** (26px). Popovers expand upward via portals; never resize the bar.
- All `*TileContent` components are **self-contained** — no required props from AppShell. Theme tokens come via CSS variables.
- The tile system is the **default workspace primitive.** LeftTabPanel was removed. Tiles are how surfaces appear.

---

## Versioning Narrative

```mermaid
gantt
    title LumaWeave Development Timeline (May 2026)
    dateFormat YYYY-MM-DD
    axisFormat %m-%d

    section Foundation
    v86 (foundation/tile system)     :done, v86, 2026-05-05, 5d
    v87 (theme value population)     :done, v87, after v86, 3d
    v88-v92 (workshop, presets)      :done, v88, after v87, 4d
    v93 (lens + physics dialect)     :done, v93, after v88, 1d
    v96 (IDE integration)            :done, v96, after v93, 1d

    section Command Layer
    v97 (command palette + i18n)     :done, v97, after v96, 3d

    section Cleanup Arc
    v98.1 structural cleanup         :done, v981, after v97, 1d
    v98.2 CSS/debug-store recovery   :done, v982, after v981, 1d
    v98.3 QA tile + auto-populate    :done, v983, after v982, 1d
    v98.4 panels-as-tiles + closer   :done, v984, after v983, 1d

    section Active
    v98.5 settings modernization     :active, v985, 2026-05-28, 2d
    v99 OKLCH upgrade                :v99, after v985, 1d
    v100 tile migration              :v100, after v99, 4d
    v101 theme menu integration      :v101, after v100, 2d
    v102 minimap integration         :v102, after v101, 2d
```

---

## Roadmap

```mermaid
flowchart LR
    v985[v98.5<br/>Settings Modernization<br/>IIFE → typed registry] --> v99[v99<br/>OKLCH Crossfade]
    v99 --> v100[v100<br/>Tile Migration<br/>react-grid-layout + react-moveable]
    v100 --> v101[v101<br/>Theme Menu Integration]
    v100 -.parallel.-> v102[v102<br/>Minimap Integration]
    v101 --> v103[v103<br/>Code Spoke<br/>live + diff editor]
    v103 --> v104[v104<br/>History Spoke Deepening]
    v104 --> v110[v110+<br/>Beta Release Prep]

    style v985 fill:#7c3aed,stroke:#fbbf24
    style v99 fill:#4c1d95,stroke:#fbbf24
```

**Aspirational/deferred** (no version commitment):
- Lattica Workshop hardening (sandbox, signing, threat model) — pre-1.0 security
- Agent Familiar System — pet project after everything is ~98% polished
- VR compatibility — stretch, may defer indefinitely

**Scrapped from this project:**
- Arena (agent tournament infrastructure) — moved to external project

---

## Critical Process Rules

```mermaid
flowchart TD
    A[Bandit needs to install a package] --> B{Approved?}
    B -->|No| C[STOP. Post DEPENDENCY REQUEST<br/>to #current-task]
    C --> D[Wait for Ryan to vet + install manually]
    D --> E[Ryan confirms in Discord]
    E --> F[Bandit proceeds]
    B -->|Yes via prior confirmation| F

    style C fill:#dc2626,stroke:#fff,color:#fff
```

**Package safeguard:** NO unsupervised installs of any kind. npm, yarn, pnpm, pip, apt, snap, flatpak, brew, cargo, etc. Every install goes through manual vetting. Live supply-chain attacks (self-replicating worms in canonical packages) make this non-negotiable. Documented in `CLAUDE.md` at repo root.

**Arc structure:** Every version follows `vN.0` (design/opener) → `vN.1..vN.x-1` (implementation passes) → `vN.x` (arc closer with summary, polish-debt reconciliation, test cleanup).

**Verification discipline:** Every Bandit pass requires explicit pass/fail per smoke item, screenshots for visual deliverables, dependency-removal verification (grep + visual). "Manual smoke verified" without enumeration is not acceptable.

---

## Current State of Components

```mermaid
quadrantChart
    title Component Health (May 27, 2026)
    x-axis Solid → Tangled
    y-axis Hidden → User-Facing
    quadrant-1 Visible & Solid
    quadrant-2 Hidden & Solid
    quadrant-3 Hidden & Tangled
    quadrant-4 Visible & Tangled

    Tile System: [0.2, 0.85]
    Anchor System: [0.25, 0.7]
    Command Palette: [0.15, 0.75]
    Hotkey Registry: [0.15, 0.55]
    Settings Panel: [0.7, 0.8]
    Source Adapter: [0.85, 0.6]
    Theme Workshop: [0.8, 0.45]
    Theme Crossfade: [0.45, 0.7]
    Status Bar: [0.55, 0.85]
    PillToggle CSS: [0.6, 0.9]
    Debug Store: [0.2, 0.4]
    Gwells: [0.3, 0.5]
    QA Panel: [0.35, 0.65]
    Feedback Form: [0.4, 0.5]
    Inspector: [0.3, 0.75]
    Minimap: [0.5, 0.7]
```

---

## Known Paperweights & Tangles

These are items that are present in the codebase but not functioning as intended. They're acceptable in private development; they need resolution before public release.

| Item | Issue | Priority | Notes |
|---|---|---|---|
| **Source Adapter** | Reads incorrect information, has hardcoded values instead of metadata | High | Was deprioritized due to context density during v86-v97 |
| **Theme Workshop** | Functionality incomplete; components present but not wired | Medium | Re-arms via Settings → Advanced are stubs |
| **Tile CSS theming** | All tiles use hardcoded CSS, don't obey theme tokens | Medium | Visible but acceptable in private dev |
| **Topbar PillToggle styling** | Pills render as raw text+glyphs in some states | Low (cosmetic) | CSS landed in v98.2; may have regressed; re-verify |
| **Status bar layout** | Multi-line stack in some screenshots; may be CSS regression | Low (cosmetic) | Re-verify in clean state |
| **Settings IIFE pattern** | `window.LW_*` globals instead of typed registries | High | v98.5 target |
| **Settings store stale keys** | `leftPanelCollapsed`, `*TabSections` from removed LeftTabPanel | Low | Future schema cleanup |
| **AppShell commented blocks** | `{/* v86a: tile system is v86c */}` style cruft | Low | Future cleanup |
| **Various tangled pipelines** | Hard to identify without dedicated investigation | Variable | "Once context is cleaner, easier to surface" |

This list will grow as items are surfaced. Polish-debt files accumulate the formal record.

---

## Six Things Before Ship (Sequenced)

Ryan's count of "half dozen major things." The roadmap above expresses these as version arcs:

```mermaid
flowchart LR
    A[1. Settings modernization<br/>v98.5] --> B[2. OKLCH upgrade<br/>v99]
    B --> C[3. Tile migration<br/>v100]
    C --> D[4. Theme menu<br/>v101]
    C -.-> E[5. Minimap<br/>v102]
    D --> F[6. Code + History spokes<br/>v103-104]
    F --> G[7. Source Adapter fix]
    G --> H[8. Theme Workshop polish]
    H --> I[9. Tile theming wiring]
    I --> J[10. Pre-1.0 cleanup]
```

Items 7-10 are the paperweight tangles surfacing as their own polish passes. Their exact version numbers depend on what gets surfaced as Ryan navigates clearer post-cleanup context.

---

## Tools & Workflow

```mermaid
graph LR
    R[Ryan] -->|drafts via| P[Planning Claude<br/>this conversation]
    P -->|prompts| B[Bandit / Claude Code<br/>Sonnet 200K context]
    B -->|approval gates| D[Discord<br/>commit → merge → push]
    D --> R

    B -.deferred work.-> PD[Polish-debt files]
    B -.completion docs.-> AC[Arc closer docs]
    P -.banks decisions.-> M[Memory edits]
```

**Two-Claude orchestration:** Planning Claude drafts architecture and prompts. Bandit executes. Discord coordinates with explicit approval gates (commit → merge → push), each requiring Ryan's confirmation.

**Hardware:** Local dev on RTX 4070 Super. Ollama + LiteLLM + Open WebUI (Docker) for local agent infrastructure.

**Implementation context:** Bandit runs Sonnet 200K context. Long context lets it hold the project model but doesn't replace explicit verification.

---

## Stop-the-World Items

- **Tonight (2026-05-27):** Local codebase backed up to offline medium. STARTED at ~7:00 PM, ETA ~9:00 PM. Critical given active npm supply-chain attacks.
- **Before any package install:** Manual vetting (publication date, maintainer history, dependency chain). No exceptions.
- **Before any pass commit merge:** Verification discipline observed. Screenshots and pass/fail enumeration required.

---

## Reading Order for Context Reset

When context is fresh (new conversation, after a break, etc.), read in this order:

1. **This doc** — orientation
2. **`docs/v98_4_ARC_CLOSER.md`** (or latest arc closer) — what just landed
3. **Whatever prompt is being drafted/executed** — current focus
4. **Specific files referenced by that prompt** — only as needed

Don't pre-load every doc. The forest is dense. This doc is the trailhead.

---

## Doc Consolidation Plan

The full doc consolidation is queued for **after v100-v101 settle.** At that point:
- Add status headers to every doc (`status: current` / `status: superseded by X` / `status: archive-candidate`)
- Move superseded docs to `docs/archive/`
- Separate generated docs (`provenance-manifest.json`, `self-graph-generated.json`) into their own folder so PK searches stay clean
- Update this doc to reflect post-v100 architecture

Until then: this doc is the entry point. Other docs supplement.
