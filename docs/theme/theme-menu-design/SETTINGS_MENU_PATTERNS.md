---
id: lumaweave.settings.menu.patterns
title: LumaWeave Settings Menu — Interaction Patterns
type: design-spec
status: design-ready
audience: claude-design
last_updated: 2026-05-22
---

# LumaWeave Settings Menu — Interaction Patterns

How the menu behaves. Each pattern is something Claude Design needs to embody in the prototype.

## Pattern 1 — The floating-tile panel

### Behavior

The Settings menu is a floating panel that obeys LumaWeave's existing tile system. Default opens floating in the center of the viewport, ~70% width × ~70% height. User's last position and dock state persist across reloads.

### Tile system integration

- **Drag from title bar** to move
- **Resize from corners and edges** within reasonable bounds (min 600×400, max viewport)
- **Minimize** (collapse to a thin bar with title and expand button) — like other tiles
- **Dock to right tile bank** or **left tile bank** — when dragged to the bank edge, a highlighted drop zone appears; release to dock
- **Detach from tile bank** — drag away to float again

### Dock state behavior

When docked to a tile bank:
- Panel adopts the bank's width (typically narrower)
- Sidebar collapses to icons only (no labels) to save horizontal space
- Status bar stays at bottom but may stack items vertically if too cramped
- Resize from the bank-edge to adjust the bank's width

When floating:
- Sidebar shows icons + labels
- Resize freely
- Position persists per-session

### Affordances

Clear visual cues for what the panel can do:

- Title bar shows: drag-grip icon, panel title "Settings", minimize button, close button
- Dock targets (the bank edges) highlight when the panel is being dragged
- Corner resize handles are subtly visible on hover

### What this means for design

Don't design Settings as a modal. Design it as a tile-class component. The shell (frame, title bar, status bar, close button) should mirror other LumaWeave tile components. The interior (sidebar + content + status bar) is what makes it specifically Settings.

## Pattern 2 — Opacity control

### Behavior

A single slider in the bottom status bar controls the panel's opacity. The mapping is scaled, not linear:

- **Background layer** (panel fill, dock chrome): scales 0% → 100% as slider goes 0 → 100
- **Controls layer** (borders, button chrome, sliders, etc.): scales 60% → 100% as slider goes 0 → 100
- **Text layer**: always 100%, unaffected by slider

### Why scaled

Single slider, single mental dimension ("more transparent" or "less transparent"). The 60% floor on controls keeps the panel usable at low opacity values — controls don't disappear, just become subtle. Text always sharp because legibility is non-negotiable.

### Implementation note

The panel needs three CSS layers, each with independent opacity:
- `.lw-settings-panel-bg` — background layer
- `.lw-settings-panel-chrome` — controls, borders, button frames
- `.lw-settings-panel-text` — labels, values, headings

CSS custom properties drive the opacity values; the slider updates the properties on the panel root element. The crossfade animation from v87.4 can interpolate these values if the user adjusts the slider quickly.

### Default value

Start at 100% (fully opaque) on first open. User adjusts and the value persists per-session.

## Pattern 3 — Status bar at panel bottom

### Behavior

A horizontal strip at the bottom of the panel. Always visible (doesn't scroll with content). Contains bordered status sections, each showing a piece of state. Sections are sized to content, separated by border lines.

### Sections, left to right

```
┌─[Account]──┬─[Profile]──┬─[Position]──┬─[Save state]──┬─[Opacity]──────┐
└────────────┴────────────┴─────────────┴───────────────┴────────────────┘
```

#### Account section

Shows the current account state. Possible values:
- `Account: Offline` (default — no account logged in)
- `Account: <username>` (when an account is logged in; post-v97)

Click to open account management (future) or no-op (now).

#### Profile section

Shows the current profile (= workspace, = vault). Possible values:
- `Profile: default` (initial)
- `Profile: <user-defined>` (user has renamed their default)
- `Profile: <system_handle_id>` (a system-generated id when a profile is created without naming)
- `Profile: Company-graphing`, `Profile: Personal-notes`, etc. (user-organized workspaces)

Each profile owns its own:
- Graph sources
- Custom themes
- Asset bank state
- Tile layouts
- Settings overrides (some shared with global account, some per-profile)

Click opens a profile switcher (future) or shows the current profile name (now).

For scaffolding now: design the slot but the switcher is a "coming later" placeholder.

#### Position section

Shows the panel's current location. Possible values:
- `Position: floating`
- `Position: docked left`
- `Position: docked right`
- `Position: minimized`

Updates live as the user docks/undocks the panel. Informational; not interactive.

#### Save state section

Shows the current state of the loaded source. Possible values:
- `Save: synced ●` (green dot — current with source)
- `Save: stale ●` (amber dot — source has changed since load)
- `Save: diff available (3+/1-/2~)` (yellow indicator — source changed, diff is computable)
- `Save: live` (for live sources, no save concept)

Click opens diff triage UI (future) or no-op (now).

#### Opacity section

The opacity slider described in Pattern 2. Always present at the right edge of the status bar.

### Designing the section frame

Each section has a subtle border on left and right (not top/bottom — the status bar itself has a top border). Sections have ~12-16px padding. Text is small (10-11px), labels are dim, values use the panel's text color.

The bordered section pattern is important — it signals "these are separate pieces of state, related but independent" rather than "a smushed-together strip of values."

## Pattern 4 — Sidebar + Content layout

### Sidebar

Left side of the panel. Vertical list of the 8 categories. Each row:
- Category icon (left)
- Category label
- Optional badge (e.g., showing a warning count or a "new" indicator)
- Hover state, active state

Icons should be simple, single-color (uses theme accent). Suggestions:
- Theme — paint swatch / palette
- Typography — Aa / type character
- Graph — connected nodes
- Inspector — magnifying glass / target reticle
- Data & Sources — database / stack
- Display — monitor / sun
- Accessibility — universal symbol / circle with notches
- Advanced — gear / wrench

The active category is highlighted with a left border accent in the theme's primary color.

When docked (narrow), labels hide and icons remain. Tooltips on hover show the category name.

### Content area

Right side of the panel. The selected category's content fills this area. Layout:

- Category title at top (large heading)
- Optional category description (small, muted)
- Sub-sections within the category (collapsible if multiple)
- Settings rows within each section

Scrolls vertically if content exceeds viewport. Sub-sections that aren't visible can be collapsed by default to reduce initial visual load.

### Sub-sections

For categories with many settings (Theme especially), group related controls into sub-sections:

```
┌─ Theme ─────────────────────────────────────────────┐
│ Select a preset and configure overrides.            │
│                                                      │
│ ▼ PRESET                                            │
│   [Theme picker grid here]                          │
│                                                      │
│ ▼ ACCESSIBILITY                                     │
│   [Contrast readout here]                           │
│                                                      │
│ ▼ OVERRIDES                                         │
│   [Override list here]                              │
│                                                      │
│ ▶ TRANSITIONS (collapsed by default)                │
│                                                      │
│ ▼ INTENSITY                                         │
│   [Drama + intensity sliders here]                  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Sub-section headers are uppercase, dim, with a chevron showing collapse state.

## Pattern 5 — Setting row

The atomic unit of the content area. Each row is one setting.

### Anatomy

```
┌────────────────────────────────────────────────────────┐
│ [Label]                          [Control]    [Reset]  │
│ Description (small, muted)                              │
└────────────────────────────────────────────────────────┘
```

- **Label** — the setting's name (clear, sentence case)
- **Description** — what the setting does, one or two lines, muted
- **Control** — the appropriate input (toggle / slider / select / button / etc.)
- **Reset** — circular arrow button. Resets just this setting to its default. Click → confirm via visual feedback (the value snaps back, optional brief animation).

### Variations

- **Toggle row** — control is a switch on/off
- **Slider row** — control is a labeled slider with value display
- **Select row** — control is a dropdown or radio set
- **Text row** — control is a text input
- **Color row** — control is a color picker (uses existing palette pattern from inspector v86d.3b)
- **Button row** — control is an action button (e.g., "Regenerate provenance manifest")
- **Display row** — read-only value (e.g., active graph node count)
- **Placeholder row** — for "ships later" items, greyed out, "Coming in v[arc]" tooltip

### Visual treatment

- Subtle row separators (thin border-bottom in muted color) between rows
- Row hover state — slight background tint
- Active/focused row — accent-colored left border or background tint
- Disabled rows (for placeholders) — desaturated, italic description

## Pattern 6 — Search and filter

### Behavior

A search bar lives at the top of the panel, above the sidebar and content. Always visible.

As the user types:
- All categories with no matches collapse
- Matching settings highlight (the search term is underlined in their labels)
- Categories show a small match count badge
- The currently visible content area shows only matching settings within the selected category

If the user selects a different category while a search is active, the new category's content also filters by the search term.

### Search scope

Match against:
- Setting labels
- Setting descriptions
- Category names
- Setting paths (for power users typing "appearance.theme")

Case-insensitive substring match. Future: fuzzy match.

### Clear search

An X button in the search bar clears the query and restores full visibility. Esc key while focused also clears.

## Pattern 7 — Tooltip discipline (three-tier model)

Goal: discoverable but not invasive.

### Tier 1 — Permanent affordances

Visible icons, labels, hover states. No tooltip needed. Examples: the gear icon, category icons, the close button, slider handles.

Design rule: if the affordance is in active use, its purpose should be visible. No "what does this do?" tooltips on the obvious.

### Tier 2 — Hover tooltips

Short text tooltip appears on hover for controls with non-obvious purpose. Examples:
- "What does Sphere Hum control?" → hover the Sphere Hum slider, tooltip explains
- "What's a target-kind override?" → hover the scope indicator in an override row

**Always non-blocking.** Appears below or beside the cursor with an offset. Dismisses when cursor moves away. Never covers the control being hovered.

**Globally muteable.** A small "tooltip" toggle lives in the topbar (next to the gear and info icons). Off = no Tier 2 tooltips appear anywhere. On = they appear normally. Default: on.

### Tier 3 — Dialog announcements

For genuinely new or important features. Triggered the first time a user encounters the feature. Format:

```
┌─ Welcome to <feature name> ──────────────┐
│                                            │
│ Brief description of what this feature    │
│ does and how to use it.                   │
│                                            │
│ ☐ Don't show this again                   │
│                                            │
│       [Tell me more]  [Got it]            │
└────────────────────────────────────────────┘
```

- Compact dialog, not a backdrop overlay
- "Got it" dismisses; "Tell me more" links to docs or expands inline
- The checkbox persists the dismissal
- Dismissed announcements live in a list at Settings > Advanced > Announcement History, where they can be re-enabled

### Intelligent suppression

Tier 3 dialogs respect the user's flow. They DO NOT show:
- While the user is dragging a tile
- While the user is in the middle of a setting change (clicking, dragging a slider)
- While another dialog is open
- Within 5 seconds of a previous Tier 3 dialog dismissal (avoid stacking)

Queue them up. Show when the user is idle (no input for 3+ seconds).

## Pattern 8 — Keyboard navigation

### Standard expectations

- **Tab** moves focus between interactive elements in DOM order
- **Shift+Tab** moves focus backward
- **Enter** activates the focused control (button click, dropdown open, etc.)
- **Arrow keys** navigate within multi-option controls (radio sets, segmented controls)
- **Esc** closes the Settings panel (with confirmation if there are unsaved changes — except there shouldn't be since live updates)
- **Cmd/Ctrl+F** focuses the search bar

### Sidebar navigation

- **Up/Down arrows** navigate the sidebar when focused
- **Enter or right arrow** activates the selected category and moves focus into content

### Focus indicators

Clear focus ring on whatever is focused. Theme-aware (uses the active theme's accent color). Visible in all themes including light mode.

## Pattern 9 — Live updates

Every setting applies immediately. No Apply / Save / Cancel buttons.

### Implementation expectations

Settings bind to LumaWeave's existing settings store. Changes write to the store; the store emits updates; consumers re-render. The existing pattern from v86d/v87.

### What "immediate" means in practice

- Toggle a Reduce Motion toggle → animation stops within a frame
- Drag a Panel Blur slider → blur amount updates live as you drag
- Switch theme → theme crossfade begins immediately (300ms over to the new theme)
- Color picker change → the affected element updates color immediately

For destructive actions (Clear all overrides, Reset all settings):
- Show a confirm dialog
- After confirmation, action is immediate
- No "undo" except by re-doing the action manually

## Pattern 10 — Placeholder rendering for "ships later"

Subcomponents whose data isn't yet implementable still render in the design, as honest placeholders.

### Placeholder card pattern

Same visual frame as a working subcomponent, but:
- Background slightly desaturated
- Content text muted/italic
- A small badge in the corner: "Coming v[arc]" (e.g., "Coming v95")
- Hover tooltip: brief description of what will be here and when

For example, a placeholder for the Diff Triage UI in Data & Sources:

```
┌─ Diff Triage ──────────────────[Coming v95]─┐
│ When loaded sources have changes, triage   │
│ them here with accept/reject affordances.  │
│                                              │
│ ┌──────────────────────────────────────┐   │
│ │  [Empty preview area]                │   │
│ └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

Clean visual signaling. "This is intentional design space waiting to be filled" rather than "this is broken."