---
id: lumaweave.settings.menu.brief
title: LumaWeave Settings Menu — Design Brief
type: design-brief
status: design-ready
audience: claude-design
last_updated: 2026-05-22
---

# LumaWeave Settings Menu — Design Brief

You are designing the LumaWeave Settings menu. This brief gives you the thesis, the surface ecology, and the principles to design against. Companion documents (`CATEGORIES`, `PATTERNS`, `TECH_NOTES`) cover what specifically goes inside, how it behaves, and technical constraints.

## The product, in one paragraph

LumaWeave is a luminous architecture workbench — a graph visualization and theme authoring environment for software systems. Users load a graph (their codebase, a knowledge base, a system architecture), explore it visually, theme it heavily, and gain understanding through direct manipulation. It runs local-first. It has identity (the Solar Plasma look) and a deep theme system (six built-in themes, override storage at multiple scopes, accessibility profiles, provenance tracking). It's not shipping to users yet — the developer is the primary user during v0-v97. Public shipping is post-v97.

## Workflow context

This design will be implemented by another AI agent (codename Bandit) working in TypeScript. Your output should be transposable to TypeScript-first React components — types declared upfront, props clean, no implicit-any patterns. Bandit will write the actual code; your job is to design the structure, layout, components, and interaction model so Bandit has a clear specification to build from. High-fidelity design with clean component decomposition. Not throwaway sketches.

## The thesis

**The Settings menu is part of the workspace, not a destination away from it.**

Every design decision flows from this thesis. The menu sits as a floating panel over the graph, never blocks it entirely (opacity controls let users see through to the work), updates live so changes are immediately visible, and integrates with the existing tile system so users can dock, attach, resize, and re-flow it like any other workspace element.

This is different from most settings menus. Standard pattern: modal overlay with backdrop, isolating you from your work. LumaWeave pattern: a floating, dockable, semi-transparent companion to the work itself.

## Three-surface ecology

LumaWeave has three surfaces for accessing functionality. Understanding the ecology helps you understand what BELONGS in Settings versus what doesn't.

### Surface 1 — The Radial Inspector

Triggered by Alt+Shift+click on any UI element. Opens a radial menu (8 spokes) around the clicked target. Each spoke is a category for editing THAT specific element: Color, Geometry, Type, Motion, Layout, Code, Apply-to, History.

**Scope:** the one thing you clicked.
**Purpose:** immediate, contextual edits.
**Speed:** very fast — open, edit, close.

### Surface 2 — The Settings Menu (your design)

Triggered by a permanent gear icon in the topbar. Opens a floating panel.

**Scope:** the whole app, or whole theme, or whole workspace.
**Purpose:** deep configuration of categories. Browse, discover, configure.
**Speed:** deliberate — open, browse, configure, sometimes close.

The Settings menu contains EVERYTHING configuration-related that doesn't fit in the radial menu due to space constraints. The radial menu has only 8 slots for the most-used contextual options; everything else lives in Settings, laid out clearly with full breathing room.

### Surface 3 — The Command Deck

Triggered by ⌘K. A search bar that finds and executes anything by name.

**Scope:** anything in the app.
**Purpose:** fast access by name.
**Speed:** fastest — type, find, execute.

The Command Deck can OPEN Settings (search "settings" → opens the menu). It can also trigger setting changes directly (search "switch theme to dream" → switches theme without opening Settings). It's the keyboard-first power user path.

### The lines

- Know the element you want to edit? → Radial
- Know the action by name? → Command Deck
- Want to browse or configure deeply? → Settings menu

## Audience and use cases

The Settings menu serves everyone. There's no "admin mode" or "developer settings" hidden behind a flag — accessibility, motion settings, theme overrides, and developer tools all live in the same menu, organized into categories.

Sessions split into two modes:

- **Find-and-change** — 30 seconds, user knows what they want to adjust. Search and filter must support this.
- **Browse-and-explore** — minutes to hours, especially for new users discovering what's possible. Sidebar navigation must support this.

Both modes have to feel good. Design for the find-and-change case (fast access, clear labels) without sacrificing the browse case (good hierarchy, discoverable categories).

## The 8 top-level categories

1. **Theme** — presets, overrides, transitions, accessibility readouts, drama/intensity controls
2. **Typography** — font axis playgrounds, font selection (custom font import deferred to Workshop)
3. **Graph** — physics defaults, edge styling (mostly placeholders until v90-v93), reduce-motion mirror
4. **Inspector** — radial activation hotkey, dim main graph toggle, recent swatches, panel dragability
5. **Data & Sources** — current source indicator, registered adapters list (read-only); diff triage and vault/profile management arrive later
6. **Display** — glitter, reduce-motion, panel blur, glow intensity, motion scale (mirrors from other categories for easy access)
7. **Accessibility** — WCAG target level, contrast warnings, color-blind simulation toggle (placeholder until v93)
8. **Advanced** — developer probe visibility, provenance regeneration, feature flags display, clear overrides, reset all settings

**About** is NOT a category. It's a small info button next to the gear icon in the topbar. Opens a simple dialog with version, links to socials/website/contact, bug report link. Don't design it as a Settings category.

See `SETTINGS_MENU_CATEGORIES.md` for the per-category content inventory with scaffolding-now vs land-later breakdown.

## Layout pattern

**Sidebar + content, in a floating panel.**

The panel itself is a "giant tile" that obeys LumaWeave's existing tile system: drag to move, resize from corners, minimize, attach to the right or left tile bank, or float freely. Default opens floating, centered, ~70% of viewport. User's last position persists.

Inside the panel:
- **Top bar of the panel** — title ("Settings"), close button, dock affordances
- **Left sidebar** — the 8 categories listed vertically with icons + labels
- **Main content** — the selected category's sub-sections and controls
- **Bottom status bar** — always-visible row of bordered status sections (see PATTERNS doc)

Sidebar is around 200px wide on desktop. Main content fills the rest. On narrow widths (when docked to a tile bank), the sidebar can collapse to icon-only.

## Visual style

**Theme-aware and consistent with LumaWeave's plasma aesthetic.**

The Settings panel reads tokens from the active theme. Background uses `panel.background`, borders use `panel.border`, accents use the active theme's accent color, etc. Switching themes restyles Settings live (consuming v87.4's theme crossfade).

Settings is part of LumaWeave's visual identity, not a generic admin panel. Soft glow on accents, subtle blur on backgrounds, plasma-feel borders.

## Interaction model

- **Live updates.** Every change applies immediately. No Apply button. Each setting has a Reset-to-default per-row affordance.
- **Search.** A search bar at the top filters settings across all categories in real-time. Type "blur" → shows panel blur, glow blur, etc. across whatever categories they live in.
- **Keyboard nav.** Tab through controls, Enter to activate, Esc to close the panel. Arrow keys navigate the sidebar.
- **Tooltip discipline.** See PATTERNS doc — three-tier disclosure model balancing discoverability with non-invasiveness.
- **Opacity control.** A slider in the bottom status bar adjusts the panel's transparency. The user can see through to the graph underneath while configuring.

## Scaffolding scope for this design pass

You're designing the platform AND filling in the working components that have their data settled today. Not every subcomponent is implementable now — some wait for upstream features. The CATEGORIES doc has a per-category breakdown of "ships now" vs "ships later (in arc X)."

**Acceptance criteria for scaffolding-complete:**

- Every category has at least 2 working subcomponents demonstrating the patterns
- Theme, Display, and Advanced have richer coverage (5-6 working components) because their data is settled
- Sparse categories (Data & Sources, Graph) have honest "coming soon in v95" placeholders alongside what works now
- The platform supports easily adding new subcomponents to any category as features ship

## Out of scope for this design

- **Workshop** — separate surface, designed later, reuses Settings' visual language but not its components
- **The radial inspector** — already designed and shipped (v86d, v89 ahead)
- **The command deck** — already exists as a top-bar hint; full runtime arrives v97
- **About dialog content** — simple, don't design a category for it
- **Onboarding flows** — Settings should be discoverable on its own; first-run experiences are a separate concern
- **Multi-window or multi-tab Settings** — single panel instance only
- **Mobile/responsive** — desktop-first; tablet/mobile is a much later concern

## Output expectations

Deliver as TypeScript-friendly React component prototypes. Reasonable component decomposition — Settings shell, Sidebar, CategoryContent, StatusBar, SettingRow, etc. Props typed. Styling using CSS variables that map to LumaWeave's theme tokens. No business logic specific to Bandit's existing files — design components and we'll wire them in.

If you have questions about specific patterns or want to propose deviations from this brief, surface them as you go. The user is available to settle ambiguity.