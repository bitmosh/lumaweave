/* IIFE-WRAPPED */
(() => {
/**
 * settings-data.ts
 *
 * Seeded fixture data for the prototype. Bandit will replace each of these
 * with reads from the real LumaWeave stores (themePresets, themeOverrideStorage,
 * fontAxisRegistry, settings.store, etc.) noted in TECH_NOTES.
 *
 * Every shape here is what the UI will see at runtime — keep them stable.
 */

type OverrideScope = 'global' | 'target' | 'target-kind' | 'cluster';

interface ThemeOverride {
  id: string;
  path: string;
  scope: OverrideScope;
  scopeLabel: string;
  value: string;
  /** Display chip: hex color, or null for a value chip rendered as text */
  chip: string | null;
  /** What this value was before override (shown in the reset hint) */
  defaultValue: string;
}

const SEED_OVERRIDES: ThemeOverride[] = [
  { id: 'o1', path: 'node.color',
    scope: 'target',      scopeLabel: 'target · applyTheme',
    value: '#ff52a8', chip: '#ff52a8', defaultValue: '#ff8a5b' },
  { id: 'o2', path: 'edge.opacity',
    scope: 'target-kind', scopeLabel: 'target-kind · alert',
    value: '0.70',    chip: null,      defaultValue: '0.45' },
  { id: 'o3', path: 'panel.blur',
    scope: 'global',      scopeLabel: 'global',
    value: '12 px',   chip: null,      defaultValue: '16 px' },
  { id: 'o4', path: 'typography.body.weight',
    scope: 'cluster',     scopeLabel: 'cluster · control-plane',
    value: '500',     chip: null,      defaultValue: '400' },
  { id: 'o5', path: 'accent.color',
    scope: 'target',      scopeLabel: 'target · pinned',
    value: '#b56cff', chip: '#b56cff', defaultValue: '#ff8a5b' },
  { id: 'o6', path: 'glow.intensity',
    scope: 'target-kind', scopeLabel: 'target-kind · provenance-gap',
    value: '0.92',    chip: null,      defaultValue: '0.55' },
  { id: 'o7', path: 'background.fade',
    scope: 'cluster',     scopeLabel: 'cluster · minimap',
    value: '0.40',    chip: null,      defaultValue: '1.00' },
];

/** Intensity factors plugged into the Drama slider.
 *
 *  MODULAR HOOK ─────────────────────────────────────────────────────────
 *  Drama is a scalar that multiplies an *ordered list of intensity factors*.
 *  Each factor declares its own range, default, and live source. Today they're
 *  static; later, sources like 'audio.tempo' or 'graph.activity' can stream in.
 *
 *  To plug in a new factor:
 *    1. Add a record to DRAMA_FACTORS with a unique id, label, default, range.
 *    2. (Optional) set `source: 'audio.tempo'` and Bandit wires a hook that
 *       pushes live values to setDramaFactor(id, value).
 *    3. The Drama slider scales every factor by `drama / 0.5` (1.0 == neutral).
 *
 *  The visible Drama UI doesn't need to change — new factors render as
 *  inline children of the Drama section automatically.
 */
interface DramaFactor {
  id: string;
  label: string;
  description: string;
  /** Numeric range [min, max] */
  range: [number, number];
  /** Default value */
  default: number;
  /** Current value */
  value: number;
  /** Unit suffix shown in the slider readout */
  unit: string;
  /** Live source id — null for user-controlled, string for streaming */
  source: null | 'audio.tempo' | 'graph.activity' | 'system.load';
}

const DRAMA_FACTORS: DramaFactor[] = [
  { id: 'motionScale',     label: 'Motion scale',      description: 'Multiplier on all motion durations and amplitudes.',
    range: [0, 1.5],  default: 1.0,  value: 1.0,  unit: '×',  source: null },
  { id: 'panelBlur',       label: 'Panel blur',        description: 'Backdrop blur strength on glass tiles.',
    range: [0, 28],   default: 16,   value: 16,   unit: 'px', source: null },
  { id: 'glowIntensity',   label: 'Glow intensity',    description: 'Spread of accent halos and node bloom.',
    range: [0, 1],    default: 0.55, value: 0.55, unit: '',   source: null },
  { id: 'sphereHum',       label: 'Sphere hum',        description: 'Idle vibration amplitude on lit spheres.',
    range: [0, 1],    default: 0.32, value: 0.32, unit: '',   source: null },
  { id: 'sphereFlowSpeed', label: 'Sphere flow speed', description: 'Surface flow rate inside spheres.',
    range: [0, 2],    default: 1.0,  value: 1.0,  unit: '×',  source: null },
  { id: 'sphereGlow',      label: 'Sphere glow',       description: 'Outer halo intensity around spheres.',
    range: [0, 1],    default: 0.70, value: 0.70, unit: '',   source: null },
];

/** Font axis registry stand-in (mirrors src/themes/fontAxisRegistry.ts). */
interface FontFamily {
  id: string;
  name: string;
  role: 'display' | 'body' | 'mono';
  cssFamily: string;
  axes: Array<{ id: 'wght'|'wdth'|'slnt'|'opsz'; label: string; min: number; max: number; value: number; default: number }>;
  sample: string;
}

const FONT_FAMILIES: FontFamily[] = [
  { id: 'space-grotesk', name: 'Space Grotesk', role: 'display',
    cssFamily: '"Space Grotesk", system-ui, sans-serif',
    axes: [{ id: 'wght', label: 'Weight', min: 300, max: 700, value: 600, default: 500 }],
    sample: 'Map. Understand. Build.' },
  { id: 'ibm-plex-sans', name: 'IBM Plex Sans', role: 'body',
    cssFamily: '"IBM Plex Sans", system-ui, sans-serif',
    axes: [{ id: 'wght', label: 'Weight', min: 300, max: 700, value: 400, default: 400 }],
    sample: 'A luminous architecture workbench.' },
  { id: 'ibm-plex-mono', name: 'IBM Plex Mono', role: 'mono',
    cssFamily: '"IBM Plex Mono", ui-monospace, monospace',
    axes: [{ id: 'wght', label: 'Weight', min: 300, max: 700, value: 400, default: 400 }],
    sample: 'graph 100n · 110e · dialect radial-backbone' },
];

/** Feature flag fixtures (mirrors feature.flags.ts). */
const FEATURE_FLAGS = [
  { id: 'radial.inspector.v89',     label: 'Radial inspector v89',        on: true,  description: 'Full 9-spoke radial menu.' },
  { id: 'theme.crossfade.v87_4',    label: 'Theme crossfade v87.4',       on: true,  description: 'CSS-variable interpolation on theme switch.' },
  { id: 'edge.plasma.full.v91',     label: 'Edge plasma · full',          on: false, description: 'Edges shade by source/target theme bleed.' },
  { id: 'audio.reactive.v92',       label: 'Audio-reactive graph',        on: false, description: 'Pipes audio analyser into Drama factors.' },
  { id: 'physics.dialect.registry', label: 'gwells dialect registry',     on: false, description: 'Pluggable layout dialects beyond the built-in pair.' },
  { id: 'minimap.3d.v94',           label: '3D minimap',                  on: false, description: 'Volumetric overview tile.' },
];

/** Categories declared once so sidebar + content + search share one source. */
interface CategoryDef {
  id: 'theme'|'typography'|'graph'|'inspector'|'data-sources'|'display'|'accessibility'|'advanced';
  label: string;
  description: string;
  /** SVG path data for the sidebar icon (16x16 viewBox, fill currentColor) */
  iconPath: string;
}

const CATEGORIES: CategoryDef[] = [
  { id: 'theme',         label: 'Theme',         description: 'Presets, overrides, transitions, accessibility readouts.',
    iconPath: 'M4 2h6a4 4 0 0 1 4 4v2a3 3 0 0 1-3 3h-1.5a1.5 1.5 0 0 0-1.5 1.5V14a2 2 0 1 1-4 0V8a6 6 0 0 1 0-6Zm2 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm5 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-2 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z' },
  { id: 'typography',    label: 'Typography',    description: 'Font roles, axis playground, custom font import.',
    iconPath: 'M3 3h10v2.5H8.7V13H7.3V5.5H3V3Z' },
  { id: 'graph',         label: 'Graph',         description: 'Physics, rendering, edge styling, motion mirror.',
    iconPath: 'M3 4a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm6 6a2 2 0 1 1 4 0 2 2 0 0 1-4 0ZM5 6l4 4M9 4h2M3 10v2' },
  { id: 'inspector',     label: 'Inspector',     description: 'Radial activation, dim graph, recent swatches.',
    iconPath: 'M7 2a5 5 0 0 1 3.9 8.1l3 3-1.4 1.4-3-3A5 5 0 1 1 7 2Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z' },
  { id: 'data-sources',  label: 'Data & Sources',description: 'Active source, registered adapters, diff triage.',
    iconPath: 'M8 2c3.3 0 6 1 6 2.5V12c0 1.5-2.7 2.5-6 2.5S2 13.5 2 12V4.5C2 3 4.7 2 8 2Zm0 4c-2.5 0-4.5-.5-4.5-1.5S5.5 3 8 3s4.5.5 4.5 1.5S10.5 6 8 6Z' },
  { id: 'display',       label: 'Display',       description: 'Effects, reduce motion, panel blur, glow.',
    iconPath: 'M2 4h12v7H2V4Zm0 8h12v1H2v-1Zm4 2h4v1H6v-1Z' },
  { id: 'accessibility', label: 'Accessibility', description: 'WCAG targets, contrast warnings, color-blind sim.',
    iconPath: 'M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 2.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM5 7h6v1.2L8.6 9.4 9.5 13H8l-.5-2.1L7 13H5.5l1-3.6L5 8.2V7Z' },
  { id: 'advanced',      label: 'Advanced',      description: 'Developer probes, feature flags, resets.',
    iconPath: 'M8 1.5l1.2 2 2.3-.5.5 2.3 2 1.2-1.2 2 1.2 2-2 1.2-.5 2.3-2.3-.5L8 14.5l-1.2-2-2.3.5-.5-2.3-2-1.2 1.2-2-1.2-2 2-1.2.5-2.3 2.3.5L8 1.5Zm0 3.7a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z' },
];

/** gwells dialect registry — the production codebase keeps the canonical
 *  list at src/physics/gwells/dialects.ts. This file is the prototype
 *  stand-in. Bandit reads from the real registry, never this one.
 *
 *  "FA2" used to be the brand name for the whole solver; v90 renamed it to
 *  "gwells" and split it into pluggable dialects (radial-backbone, parallel-
 *  spines). Spectral was dropped — its eigendecomposition step doesn't fit
 *  the streaming-update model and the team chose to invest elsewhere. */
interface GwellsDialect {
  id: string;
  label: string;
  description: string;
  /** Live status. Only `active` and `ready` are user-selectable. */
  status: 'active' | 'ready' | 'experimental';
  /** When the dialect landed (or will land). */
  ship: string;
}

const GW_DIALECT_REGISTRY: GwellsDialect[] = [
  { id: 'radial-backbone', label: 'Radial Backbone',
    description: 'Concentric rings around hub nodes. Best for hierarchical sources.',
    status: 'active', ship: 'v90' },
  { id: 'parallel-spines', label: 'Parallel Spines',
    description: 'Vertical lanes per cluster. Best for code-graph traversal.',
    status: 'ready',  ship: 'v90' },
  { id: 'tidal-flow',      label: 'Tidal Flow',
    description: 'Edge-flow physics with current direction. Experimental.',
    status: 'experimental', ship: 'v93' },
];

/** Inspector spoke registry — mirrors src/inspectors/radial/spokeRegistry.ts.
 *  The Inspector category's Preview reads from this list directly so it
 *  cannot diverge from the production radial. New spokes show up
 *  automatically when added here. */
interface InspectorSpoke {
  id: string;
  label: string;
  /** SVG path for the spoke icon, 24x24 viewBox, stroke=currentColor. */
  iconPath: string;
  /** Whether to fill the icon (true) or stroke it (false, default). */
  iconFill?: boolean;
  /** Order around the ring, 0=top, clockwise. */
  order: number;
  /** Demo stub rendered when the spoke is opened in the Preview. */
  stub: 'swatches' | 'geometry-presets' | 'type-axes' | 'motion-curves'
      | 'layout-toggles' | 'code-snippet' | 'apply-scopes' | 'ide-targets' | 'history-list';
  /** Status — feature flag controlled in the real radial. */
  status: 'ready' | 'beta';
}

const INSPECTOR_SPOKE_REGISTRY: InspectorSpoke[] = [
  { id: 'color',    label: 'Color',       order: 0, status: 'ready', stub: 'swatches',
    iconPath: 'M12 3a4 4 0 1 1-4 4c0-1.5.6-2.5 2-3.5C11.4 2.6 11.6 3 12 3Zm5 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm-3 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm-3 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM7 11a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z' },
  { id: 'geometry', label: 'Geometry',    order: 1, status: 'ready', stub: 'geometry-presets',
    iconPath: 'M12 3l8 9-8 9-8-9z' },
  { id: 'type',     label: 'Type',        order: 2, status: 'ready', stub: 'type-axes',
    iconPath: 'M5 6h14M12 6v13M9 19h6', iconFill: false },
  { id: 'motion',   label: 'Motion',      order: 3, status: 'ready', stub: 'motion-curves',
    iconPath: 'M3 16c3 0 3-8 6-8s3 8 6 8 3-8 6-8' },
  { id: 'layout',   label: 'Layout',      order: 4, status: 'ready', stub: 'layout-toggles',
    iconPath: 'M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z' },
  { id: 'code',     label: 'Code',        order: 5, status: 'ready', stub: 'code-snippet',
    iconPath: 'M8 6l-5 6 5 6M16 6l5 6-5 6M14 4l-4 16' },
  { id: 'apply',    label: 'Apply to…',   order: 6, status: 'ready', stub: 'apply-scopes',
    iconPath: 'M5 12a7 7 0 1 1 14 0M5 12v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5M9 12l3 3 3-3' },
  { id: 'ide',      label: 'Open in IDE', order: 7, status: 'beta',  stub: 'ide-targets',
    iconPath: 'M14 5h5v5M19 5l-8 8M9 6H6a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-3' },
  { id: 'history',  label: 'History',     order: 8, status: 'ready', stub: 'history-list',
    iconPath: 'M3 12a9 9 0 1 1 3 6.7M3 19v-6h6M12 7v5l4 2' },
];

/** Hotkey registry stub — mirrors src/control-plane/hotkeys/registry.ts.
 *  Each binding is keyed by command id; the registry exposes a collision
 *  check for the rebind UX. */
interface HotkeyBinding {
  /** Modifiers in canonical order: ctrl, alt, shift, meta. */
  modifiers: Array<'Ctrl'|'Alt'|'Shift'|'Meta'>;
  /** Trailing key, or null for modifier-only "hold to activate". */
  key: string | null;
  /** Whether the binding fires on click (not just key). */
  onClick?: boolean;
}
interface HotkeyEntry {
  id: string;
  command: string;
  binding: HotkeyBinding;
}

const HOTKEY_REGISTRY: HotkeyEntry[] = [
  { id: 'radial.activate',       command: 'Open radial inspector',  binding: { modifiers: ['Alt','Shift'], key: null,  onClick: true  } },
  { id: 'settings.open',         command: 'Open Settings',           binding: { modifiers: ['Meta'],        key: ','                    } },
  { id: 'search.focus',          command: 'Focus settings search',   binding: { modifiers: ['Meta'],        key: 'f'                    } },
  { id: 'commandDeck.open',      command: 'Open command deck',       binding: { modifiers: ['Meta'],        key: 'k'                    } },
  { id: 'inspector.toggle.dim',  command: 'Toggle dim main graph',   binding: { modifiers: ['Alt','Shift'], key: 'd'                    } },
];

/** Helper: serialize a binding for display (e.g. "Alt + Shift + Click"). */
function formatBinding(b: HotkeyBinding): string {
  const parts: string[] = [...b.modifiers];
  if (b.key) parts.push(b.key.length === 1 ? b.key.toUpperCase() : b.key);
  else if (b.onClick) parts.push('Click');
  else parts.push('(hold)');
  return parts.join(' + ');
}

/** Helper: find a colliding binding in the registry, ignoring a given id. */
function findCollision(b: HotkeyBinding, ignoreId: string): HotkeyEntry | null {
  const sig = JSON.stringify({ m: [...b.modifiers].sort(), k: b.key, c: !!b.onClick });
  for (const entry of HOTKEY_REGISTRY) {
    if (entry.id === ignoreId) continue;
    const eSig = JSON.stringify({ m: [...entry.binding.modifiers].sort(), k: entry.binding.key, c: !!entry.binding.onClick });
    if (sig === eSig) return entry;
  }
  return null;
}

(window as any).LW_SETTINGS_DATA = {
  SEED_OVERRIDES, DRAMA_FACTORS, FONT_FAMILIES, FEATURE_FLAGS, CATEGORIES,
  GW_DIALECT_REGISTRY, INSPECTOR_SPOKE_REGISTRY, HOTKEY_REGISTRY,
  formatBinding, findCollision,
};

})();
