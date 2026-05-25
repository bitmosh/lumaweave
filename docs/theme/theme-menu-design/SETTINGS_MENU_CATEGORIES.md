---
id: lumaweave.settings.menu.categories
title: LumaWeave Settings Menu — Category Content Inventory
type: design-spec
status: design-ready
audience: claude-design
last_updated: 2026-05-22
---

# LumaWeave Settings Menu — Category Content Inventory

This document enumerates what lives in each of the 8 Settings categories. Each category has two sections: **Ships in this pass** (subcomponents whose data exists today and can be designed-and-implemented now) and **Ships later** (subcomponents waiting on upstream feature arcs).

Design ALL the "Ships in this pass" subcomponents fully. Design SPACE for "Ships later" items — placeholder cards with a "Coming in <arc>" label, demonstrating where the content will eventually go without filling it in yet.

## Category 1 — Theme

The richest category. Most data is settled.

### Ships in this pass

1. **Theme picker grid** — 6 built-in themes shown as cards with thumbnails (SVG generated from theme tokens, ~200×140). Click to switch. Active theme is highlighted. Each card shows theme name and a WCAG badge (AA/AAA/partial).

2. **Active theme accessibility readout** — for the current theme, list the 4 contrast pairs with their ratios and pass levels. Tooltip on hover shows the foreground/background colors.

3. **Override list** — every override the user has set, scoped (global / target / target-kind / cluster). Each row shows the override path, the resolved value (with a colored chip), the scope label, and a Reset button. "Clear all" affordance at the bottom.

4. **Crossfade duration slider** — controls the theme transition animation duration. Range 0-1000ms. 0 = snap. Default 300ms.

5. **Drama and intensity controls** — sliders for: Drama (quiet/cranked/extreme as radio buttons), Motion Scale (0-1.5), Panel Blur (0-28), Glow Intensity, Sphere Hum, Sphere Flow Speed, Sphere Glow. Each with a Reset button.

6. **Glitter and Reduce Motion toggles** — mirrored from the topbar, accessible here too.

### Ships later

- Custom theme management (v88b+) — rename, delete, fork user-created themes
- Theme import/export (v88b+) — load a theme JSON, export current state as a theme
- Color suggestion engine controls (v88b+) — view and edit per-theme selectable color slots
- Per-theme thumbnail regeneration (v88b+)
- Theme lineage viewer (v88b+) — show a theme's fork/remix history

## Category 2 — Typography

Partial coverage. Playground exists; deeper editing waits.

### Ships in this pass

1. **Typography Playground** — variable font axis playground (already exists from v87.4 as a dock tile; surface it here too). Three font families (Space Grotesk, IBM Plex Sans, IBM Plex Mono) with wght axis sliders and live sample text.

2. **Font role indicators** — read-only display of which font family is assigned to each role (display, body, mono) for the current theme.

### Ships later

- Per-token typography editing (v89 Type spoke) — assign different families to different tokens
- Custom font import (v88b+ Workshop) — load font packs
- Other axis controls beyond wght (future, when font loads include richer axes)

## Category 3 — Graph

Mostly placeholders. Real content arrives v90-v93.

### Ships in this pass

1. **Physics defaults section** — read existing physics settings (force values, layout algorithm choices) and surface them here.

2. **Reduce Motion toggle** — mirrored.

### Ships later

- Edge styling controls (v91 Edge plasma full)
- Render quality controls (v90+ Node program registry)
- Layout dialect picker (v93 Physics dialect registry)
- Node program selection (v90)
- Audio-reactive graph settings (v92)
- 3D minimap settings (v94)

Most of this category is "coming soon" placeholders. Design the placeholder card pattern carefully — it should look intentional, not broken.

## Category 4 — Inspector

Settings for the radial inspector's behavior.

### Ships in this pass

1. **Radial activation hotkey** — select from: Alt+Shift+Click, Alt+Shift+I (toggle), Both. Radio buttons.

2. **Dim main graph toggle** — when inspector is open, dim main graph nodes outside the selected cluster.

3. **Persist recent swatches toggle** — remember the last 8 picked colors across sessions.

4. **Draggable inspector panel toggle** — allow dragging the inspector panel by its title bar.

### Ships later

- Per-spoke configuration (v89 full radial) — show/hide individual spokes
- Default scope settings (v89) — choose default scope (target/kind/cluster/global) for color picks
- Custom spoke order (v89)

## Category 5 — Data & Sources

Read-only display now; richer controls later.

### Ships in this pass

1. **Active source indicator** — read-only display of the currently loaded graph fixture (name, node count, edge count, source type).

2. **Source adapter list** — read-only list of all registered adapters with their version and active/idle status.

### Ships later

- Adapter activation/deactivation (v95 source adapter arc)
- Graph import/export (v95+)
- Diff triage UI (v95+) — when a static source (e.g., Obsidian export) has changed since last load, show changes with accept/reject affordances per change
- Profile/vault switching UI (later) — separate workspaces for separate graph collections
- Auto-refresh settings for live sources

## Category 6 — Display

Mirror-heavy category. Most controls are duplicates of items in Theme, exposed here for easy access.

### Ships in this pass

1. **Glitter toggle** — mirror
2. **Reduce Motion toggle** — mirror
3. **Panel Blur slider** — mirror
4. **Glow Intensity slider** — mirror
5. **Motion Scale slider** — mirror

These mirrors are not duplicates in storage — they bind to the same setting paths as their Theme counterparts. Changing here changes everywhere.

### Ships later

- Performance mode picker (v90+ render quality work)
- 3D minimap controls (v94)
- Particle density (v92)
- Detail level slider (when low-end fallback rendering matters)

## Category 7 — Accessibility

Working WCAG controls now; richer features in v93.

### Ships in this pass

1. **WCAG target level selector** — radio: AA Normal (4.5:1) / AAA Normal (7:1) / AA Large (3:1). Default AA Normal. Affects what counts as "passing" in the Theme category's accessibility readout.

2. **Show contrast warnings toggle** — when on, themes failing the user's WCAG target level show a warning indicator in the picker.

3. **Color-blind simulation preview** — toggle with sub-controls for deuteranopia / protanopia / tritanopia / achromatopsia. Currently disabled with "Coming v93" label visible; the toggle and sub-controls render but don't functionally simulate yet.

### Ships later

- Color-blind palette filtering (v93 culori) — engine filters to color-blind-safe sets
- APCA contrast targets (v93)
- Motion intensity floor settings (v93+) — minimum acceptable motion level
- High contrast mode override

## Category 8 — Advanced

Developer-facing tools. Always visible (not behind a "show developer settings" toggle), but clearly labeled as advanced.

### Ships in this pass

1. **Developer probes visibility toggle** — controls whether `__lw*` window probes are exposed (currently always exposed in dev; this would gate them in future production builds).

2. **Provenance manifest regeneration button** — re-runs the provenance manifest generator. Useful after JSX changes.

3. **Feature flags list** — read-only display of feature flag toggles (from `feature.flags.ts` if present).

4. **Clear all overrides button** — one-click clear of `themeOverrideStorage` with confirm dialog.

5. **Reset all settings button** — confirm dialog, then full settings store reset.

### Ships later

- Telemetry settings (post-v97 ship)
- Experimental features list (grows as we have experimental features)
- Profile management (when profile system implements)
- Diagnostic export (logs, perf traces)

## Subcomponent count summary

| Category | Ships now | Ships later | Total at completion |
|---|---|---|---|
| Theme | 6 | 5+ | 11+ |
| Typography | 2 | 3+ | 5+ |
| Graph | 2 | 6+ | 8+ |
| Inspector | 4 | 3+ | 7+ |
| Data & Sources | 2 | 5+ | 7+ |
| Display | 5 | 4+ | 9+ |
| Accessibility | 3 (2 working + 1 placeholder) | 4+ | 7+ |
| Advanced | 5 | 4+ | 9+ |
| **Total** | **29** | **34+** | **63+** |

The scaffolding pass ships ~29 working subcomponents and reserves design space for ~34 more that arrive across v89-v97.

## Placeholder pattern for "Ships later"

For subcomponents not yet implementable, render an honest placeholder card in the category content area:

- Same visual frame as a real setting row
- Greyed/desaturated content
- Clear label: "[Setting name] — coming in v[arc]"
- Subtle disabled-state styling, not a broken-feeling absence
- Tooltip on hover: brief explanation of when and why

This honest signaling is important. It tells the user "this exists in the design, just not yet" rather than "this is missing entirely."

## Cross-category mirrors

Several settings appear in multiple categories (e.g., Reduce Motion is in Theme, Display, and as a topbar toggle). All mirrors bind to the same underlying setting path. Changing in one place changes everywhere. The mirror pattern is intentional — accessibility is served by exposing important settings in multiple natural homes rather than burying them.

When designing, treat mirrors as separate UI rows that happen to share state. Each mirror has its own Reset-to-default affordance; resetting one resets the others (they're the same setting).