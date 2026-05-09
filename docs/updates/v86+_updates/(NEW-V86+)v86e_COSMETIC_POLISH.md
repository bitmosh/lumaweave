# Phase Packet: v86e Cosmetic Polish

## A. Phase Mission

Land the visible Solar Plasma identity. TopBar with hex logo, "PANORAMA ATLAS" wordmark, status pill with pulsing dot, status cluster (n/e/fps). Footer with command-palette hint. ControlDock rebuilt to render dock sections via the extended `settingsRegistry` (Theme + Inspector categories added). Font loading for Space Grotesk + IBM Plex Sans + IBM Plex Mono.

This is the final v86 sub-arc. Lowest risk; lands after v86a + v86c (a for tokens, c for the tile-section bodies the dock now renders).

## B. Scope Boundaries

### Allowed

- `AppShell.tsx` — header replacement, footer replacement
- `ControlDock.tsx` — full rebuild to consume extended settings registry
- `settings.registry.ts` — add 7+ new entries under "Theme" category, 4+ under "Inspector"
- `index.html` — font preconnect + stylesheet links
- `App.css` — font-family declarations
- `LeftTabPanel.tsx` — tab strip styling adjustments only (4-tab layout was v86a)
- New component files in `/src/control-plane/topbar/`:
  - `HexLogo.tsx`
  - `WordmarkBlock.tsx`
  - `StatusPill.tsx`
  - `StatusCluster.tsx`
  - `Topbar.tsx` (consolidates the above)
- New component file `/src/control-plane/footer/Footer.tsx`

### Forbidden

- Visual treatment changes → v86b
- Tile system changes → v86c
- Inspector mini-graph → v86d
- New token paths beyond what v86a added → v86e is value-consumer only
- Theme value changes beyond what v86a established
- Workshop / asset bank UI → v88
- Command palette runtime (the ⌘K hint is a static label; full runtime is v97)
- Hotkey registry → v97

## C. Architecture Map

```
Layer 1 — Skeleton
  No new types.

Layer 2 — Organs
  No state changes.

Layer 3 — Muscles
  No renderer changes.

Layer 4 — Nerves
  settings.registry.ts        7 new "Theme" entries + 4+ "Inspector" entries
  
Layer 5 — Armor
  AppShell.tsx                Header replaced with new TopBar; footer replaced
  ControlDock.tsx             Rebuilt — iterates settingsRegistry by category, 
                              renders DockSection per category
  
Layer 6 — Paint
  HexLogo.tsx                 Hex SVG with gradient stroke + center pip + spokes
  WordmarkBlock.tsx           "LumaWeave / PANORAMA ATLAS / Map. Understand. Build."
  StatusPill.tsx              Solar Plasma label + pulsing dot
  StatusCluster.tsx           graph n/e · layout · fps live counters
  Topbar.tsx                  Container
  Footer.tsx                  control-plane status + ⌘K hint
  
  Font loading: index.html + App.css
  
  Reads tokens: typography.font.display, typography.font.body, typography.font.mono
                + all Tier 2 chrome tokens for layout
```

## D. Non-Negotiable Contracts

The seven v86 long-term contracts apply. Plus these v86e-specific:

1. **The dock is registry-driven.** ControlDock rebuilds to iterate `settingsRegistry`'s distinct categories, render a `DockSection` per category, populate with the registry's controls for that category. No hand-crafted sections. This is the project-wide standardization the user asked for in answering Q1.
2. **Settings tab content lives in the dock now.** v86a removed the Settings tab from the left panel. v86e ensures every setting is reachable via the dock's category sections.
3. **Hex logo is the project mark.** Reuse the hex SVG from `_NEW_shell.jsx`. Replace the design's hardcoded `SP.*` constants with token references (e.g. `var(--lw-color-gold-500)`).
4. **Status cluster shows live values.** Subscribes to graph metrics: node count, edge count, FA2 supervisor state, current FPS. Don't fake the values; read from the actual graph.
5. **⌘K hint is decorative in v86e.** The command palette runtime arrives in v97. v86e's footer just shows the hint text and keystroke decoration; no actual handler.
6. **Font loading is two-tier.** Preconnect tags in `index.html`; stylesheet link with the actual font URLs. Token paths `typography.font.display/body/mono` reference the family stacks. Components apply `font-family: var(--lw-typography-font-display)`.
7. **Reduced-motion respect.** Pulsing dot in StatusPill respects `appearance.reduceMotion`. CSS `@media (prefers-reduced-motion)` PLUS the explicit setting toggle.

## E. Dependency Order

```txt
1. Skeleton: no new types

2. Nerves:
   - settings.registry.ts: 7 new "Theme" entries + 4 "Inspector" entries
   
3. Armor:
   - ControlDock.tsx rebuild (consume registry, render DockSection per category)
   - DockSection component (extends CollapsibleSection with tear-off via v86c contracts)
   
4. Paint:
   - index.html font preconnect + stylesheet
   - App.css font-family declarations
   - HexLogo.tsx (extract from design file, parameterize via tokens)
   - WordmarkBlock.tsx
   - StatusPill.tsx (subscribes to motion-safety policy)
   - StatusCluster.tsx (subscribes to graph metrics)
   - Topbar.tsx (composes the above)
   - Footer.tsx (control-plane status + ⌘K hint)
   - AppShell.tsx wires Topbar + Footer in place of existing header/footer

5. Validation:
   - Topbar renders Solar Plasma identity
   - All settings reachable via dock category sections
   - Status cluster shows live values
   - Fonts load (visual confirmation)
   - Reduced motion silences pulsing dot
   - Tile tear-off works on dock sections (depends on v86c)
```

## F. Current Permissions

Bandit may patch the Allowed list. May NOT touch graph rendering, tile system internals, inspector mini-graph, or theme tokens.

## G. Later-Phase Items

- Command palette runtime → v97
- Hotkey registry behind ⌘K → v97
- StatusCluster's FPS source switching to a real performance monitor → vP1
- Wordmark gradient animation → deferred polish
- Mobile-responsive topbar collapse → out of scope for v86

## H. Known Failure Modes

1. **DockSection renders settings in wrong order.** `settingsRegistry` array order is the render order. If the design wants "Physics → Labels → Theme → Inspector", the entries must be ordered accordingly. Verify before assuming.
2. **Theme category settings without controls render as empty section.** Ensure every "Theme" entry has a matching control type that maps to an existing `SettingsPanel` renderer (boolean/range/select/text). For new control types (e.g. drama as pretty radio), extend `SettingsPanel` to handle the new type — this is one place where SettingsPanel's pattern needs an addition.
3. **Status cluster FPS drift.** Use `requestAnimationFrame` delta-timing OR a 60-frame moving average. Don't display raw 1-frame deltas.
4. **Hex logo SVG too literal.** The design's logo has gradient strokes that reference SP color constants. Replace those with token references (`var(--lw-color-gold-500)` etc.) so theme switching restyles the logo automatically.
5. **Wordmark gradient breaks on Safari.** `-webkit-background-clip: text` requires `-webkit-text-fill-color: transparent`. Test on Safari before declaring done.
6. **Status pill's pulsing dot keeps animating with reduce-motion.** CSS `@media (prefers-reduced-motion: reduce)` blocks at the system level; `appearance.reduceMotion` setting needs JS-level kill via class toggle. Both required.
7. **Font loading flashes unstyled text.** Use `font-display: swap` in the stylesheet link query string, OR self-host fonts and use `font-display: optional`.

## I. Troubleshooting Playbooks

### Setting controls don't appear in dock

1. Check `settingsRegistry` has entries with `category: "Theme"` (or whichever).
2. Check ControlDock iterates distinct categories and renders one DockSection each.
3. Check DockSection passes the filtered controls to a renderer.
4. If renderer doesn't recognize a control type, extend SettingsPanel to handle it.

### Pulsing dot keeps animating with reduce motion

1. Check `appearance.reduceMotion` value reaches StatusPill.
2. Check the component conditionally applies an animation class based on the setting.
3. CSS `@media (prefers-reduced-motion: reduce)` should ALSO kill the animation regardless of the setting.

### Fonts don't load

1. Open DevTools Network tab; look for the Google Fonts request.
2. If 404, check the URL.
3. If blocked by CSP, add fonts.googleapis.com + fonts.gstatic.com to allowed sources.
4. If loaded but not applied, check `font-family` in computed styles — is the family name spelled exactly?

## J. Validation Ladder

```bash
npm run typecheck                              # zero errors
npm run qa:e2e                                 # all tests green
node scripts/validate-system-index.mjs         # system index sound
```

New tests required:

- `topbar.spec.ts` — hex logo visible, wordmark visible, status pill visible, status cluster shows numbers.
- `dock-registry-driven.spec.ts` — adding a new entry to settingsRegistry produces a new control in the dock without code change to ControlDock.
- `reduced-motion.spec.ts` — toggling reduce motion stops the pulsing dot animation.
- `fonts.spec.ts` — fonts loaded; computed font-family matches token value.

Manual QA:

1. Topbar shows hex logo + LumaWeave wordmark + PANORAMA ATLAS sub-line + tagline.
2. Solar Plasma pill with pulsing dot (when reduce motion off).
3. Status cluster shows live n/e/fps.
4. Theme selector still works.
5. Glitter and Reduce Motion toggles still work.
6. ControlDock renders 4+ category sections (Physics, Labels, Theme, Inspector — Graph View if kept).
7. Each section has working controls.
8. Tear-off (⤴) handles work on dock sections (depends on v86c).
9. Footer shows control-plane status, theme name, renderer, layout state, ⌘K hint.
10. Reduce motion checked → pulsing dot stops; no other motion in chrome.
11. Reload → Topbar/Footer/Dock all restored; tile layouts persist.
12. Resize window → Topbar/Footer reflow gracefully; ControlDock width adjustable.

## K. Research / Tool Policy

- Google Fonts: standard `<link>` approach with preconnect.
- CSS `prefers-reduced-motion`: well-supported.
- Font fallback chains: include `system-ui` and generic family at end.

## L. Output Requirements

Final report must include:

1. Number of new "Theme" category settings registry entries (expected: 7 — drama, motionScale, panelBlur, nodeHum, nodeFlowSpeed, nodeGlow + theme select).
2. Number of new "Inspector" category settings registry entries (expected: 4+).
3. Distinct dock category count after v86e.
4. Hex logo confirmed using token references (no hardcoded SP constants).
5. Wordmark gradient verified on Safari + Chrome + Firefox.
6. Reduce-motion verification: pulsing dot stops; no other chrome motion.
7. Font load timing: any FOIT/FOUT documented.

---

## Appendix A — Settings Registry Additions

```typescript
// settings.registry.ts additions for v86e

// "Theme" category — 7 entries
{
  type: "select",
  category: "Theme",
  path: "appearance.theme",
  label: "Theme Preset",
  description: "Active theme.",
  options: [
    { value: "solar-plasma",    label: "⚡ Solar Plasma" },
    { value: "obsidian-aurora", label: "◇ Obsidian Aurora" },
    { value: "midnight-loom",   label: "✦ Midnight Loom" },
    { value: "void-circuit",    label: "▦ Void Circuit" },
    { value: "agartha-dream",   label: "❀ Agartha Dream" },
    { value: "agartha-dusk",    label: "☾ Agartha Dusk" },
  ],
},
{
  type: "select",
  category: "Theme",
  path: "appearance.drama",
  label: "Drama",
  description: "Solar Plasma mood preset — multiplier on glow + motion intensity.",
  options: [
    { value: "quiet",   label: "Quiet" },
    { value: "cranked", label: "Cranked" },
    { value: "extreme", label: "Extreme" },
  ],
},
{
  type: "range",
  category: "Theme",
  path: "appearance.motionScale",
  label: "Motion Scale",
  description: "Master multiplier on backdrop and effect motion. 0 = still.",
  min: 0, max: 1.5, step: 0.05,
},
{
  type: "range",
  category: "Theme",
  path: "appearance.panelBlur",
  label: "Panel Blur",
  description: "backdrop-filter blur amount on dock and panels.",
  min: 0, max: 28, step: 1,
},
{
  type: "range",
  category: "Theme",
  path: "appearance.nodeHum",
  label: "Sphere Hum",
  description: "Node interior fade rate.",
  min: 0, max: 2, step: 0.05,
},
{
  type: "range",
  category: "Theme",
  path: "appearance.nodeFlowSpeed",
  label: "Sphere Flow Speed",
  description: "Node interior rotational flow speed.",
  min: 0, max: 2, step: 0.05,
},
{
  type: "range",
  category: "Theme",
  path: "appearance.nodeGlow",
  label: "Sphere Glow",
  description: "Node halo glow strength.",
  min: 0.2, max: 2, step: 0.05,
},

// "Inspector" category — 4 entries
{
  type: "boolean",
  category: "Inspector",
  path: "ui.inspectorPanelDraggable",
  label: "Draggable Inspector",
  description: "Drag the floating inspector panel by its title bar.",
},
{
  type: "select",
  category: "Inspector",
  path: "ui.inspectorRadialActivation",
  label: "Radial Menu Activation",
  description: "How the inspector mini-graph is summoned.",
  options: [
    { value: "alt-shift-click", label: "Alt + Shift + Click" },
    { value: "alt-shift-i",     label: "Alt + Shift + I (toggle)" },
    { value: "both",            label: "Both" },
  ],
},
{
  type: "boolean",
  category: "Inspector",
  path: "ui.inspectorDimMainGraph",
  label: "Dim Main Graph",
  description: "When inspector is open, dim main graph nodes outside the selected cluster.",
},
{
  type: "boolean",
  category: "Inspector",
  path: "ui.inspectorPersistRecentSwatches",
  label: "Remember Color Swatches",
  description: "Remember the last 8 colors picked across sessions.",
}
```

## Appendix B — Topbar Composition

```tsx
// Topbar.tsx
function Topbar() {
  return (
    <header className="lw-topbar" data-lw-theme-target="topbar.root">
      <div className="lw-topbar-left">
        <HexLogo size={34} />
        <WordmarkBlock />
        <StatusPill />
      </div>
      <div className="lw-topbar-right">
        <StatusCluster />
        <ThemeSelect />
        <Toggle path="appearance.glitterEnabled" label="Glitter" />
        <Toggle path="appearance.reduceMotion" label="Reduce Motion" />
      </div>
    </header>
  );
}

// HexLogo.tsx — SVG copied from _NEW_shell.jsx with SP constants replaced by tokens:
//   SP.flareOrange  → var(--lw-color-flare-500)
//   SP.magenta      → var(--lw-color-magenta-500)
//   SP.purple       → var(--lw-color-purple-500)
//   SP.flareGold    → var(--lw-color-gold-500)
//   SP.ink          → var(--lw-text-primary)

// StatusPill.tsx
function StatusPill() {
  const reduceMotion = useSettingsStore(s => s.settings.appearance.reduceMotion);
  return (
    <div className="lw-status-pill" data-reduce-motion={reduceMotion}>
      <span className="lw-status-dot" />
      <span className="lw-status-label">Solar Plasma</span>
    </div>
  );
}
// CSS:
//   .lw-status-dot { animation: solarPulse 2.4s ease-in-out infinite; }
//   .lw-status-pill[data-reduce-motion="true"] .lw-status-dot { animation: none; }
//   @media (prefers-reduced-motion: reduce) { .lw-status-dot { animation: none; } }

// StatusCluster.tsx
function StatusCluster() {
  const { nodeCount, edgeCount } = useGraphMetrics();
  const fps = useFps();
  const layoutState = useLayoutSupervisorState();
  return (
    <div className="lw-status-cluster">
      <span className="lw-status-key">graph</span>
      <span className="lw-status-val">{nodeCount}n · {edgeCount}e</span>
      <span className="lw-sep">·</span>
      <span className="lw-status-key">layout</span>
      <span className="lw-status-val">{layoutState}</span>
      <span className="lw-sep">·</span>
      <span className="lw-status-key">fps</span>
      <span className="lw-status-val ok">{fps}</span>
    </div>
  );
}
```

## Appendix C — Font Loading

```html
<!-- index.html additions -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" />
```

```css
/* App.css */
:root {
  --lw-typography-font-display: "Space Grotesk", system-ui, -apple-system, sans-serif;
  --lw-typography-font-body:    "IBM Plex Sans", system-ui, -apple-system, sans-serif;
  --lw-typography-font-mono:    "IBM Plex Mono", ui-monospace, "SF Mono", monospace;
}

body { font-family: var(--lw-typography-font-body); }
.lw-display { font-family: var(--lw-typography-font-display); }
.lw-mono    { font-family: var(--lw-typography-font-mono); }
```

## Appendix D — ControlDock Rebuild

```tsx
// ControlDock.tsx (v86e rebuild)
function ControlDock({ collapsed, width }) {
  const settingsRegistry = useSettingsRegistry();
  const categories = Array.from(new Set(settingsRegistry.map(s => s.category)));
  
  return (
    <aside className="lw-dock" data-lw-theme-target="dock.root">
      <div className="lw-dock-content">
        <div className="lw-dock-head">
          <span className="lw-dock-eyebrow">CONTROL PLANE</span>
        </div>
        {categories.map(category => (
          <DockSection key={category} title={category} sectionKey={`dock_${category.toLowerCase()}`}>
            <CategoryControls category={category} />
          </DockSection>
        ))}
      </div>
      <div className="lw-dock-rail">
        {categories.map(category => (
          <RailButton key={category} category={category} />
        ))}
      </div>
    </aside>
  );
}

// DockSection extends CollapsibleSection with the v86c tear-off handle.
// CategoryControls iterates settingsRegistry filtered by category and renders 
//   the appropriate control via the existing SettingsPanel pattern (extracted
//   into a reusable ControlRenderer function).
```

## Appendix E — Footer

```tsx
// Footer.tsx
function Footer() {
  const theme = useSettingsStore(s => s.settings.appearance.theme);
  const renderer = useSettingsStore(s => s.settings.graphView.defaultRenderer);
  const layoutState = useLayoutSupervisorState();
  
  return (
    <footer className="lw-footer">
      <div className="lw-footer-cluster">
        <span className="lw-footer-tag">CONTROL PLANE</span>
        <span className="lw-footer-state">online</span>
        <span className="lw-sep">·</span>
        <span className="lw-footer-key">theme</span><span className="lw-footer-val">{theme}</span>
        <span className="lw-sep">·</span>
        <span className="lw-footer-key">renderer</span><span className="lw-footer-val">{renderer}</span>
        <span className="lw-sep">·</span>
        <span className="lw-footer-key">layout</span><span className="lw-footer-val">{layoutState}</span>
      </div>
      <div className="lw-footer-right">
        <span className="lw-footer-key">selection</span>
        <span className="lw-footer-val hot">live</span>
        <span className="lw-sep">·</span>
        <span className="lw-footer-kbd">⌘K</span>
        <span className="lw-footer-val">command palette</span>
      </div>
    </footer>
  );
}
```

⌘K hint is decorative. v97 wires up the runtime.

---

*v86e is the final v86 sub-arc. After this lands, v86 is complete and ready for v87 retrofit of remaining themes.*
