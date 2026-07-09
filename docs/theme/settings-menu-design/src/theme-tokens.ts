// SPDX-License-Identifier: Apache-2.0
/* IIFE-WRAPPED */
(() => {
/**
 * theme-tokens.ts
 *
 * Six built-in LumaWeave themes. Each theme is a flat record of CSS-variable
 * values that the demo host applies to :root on theme switch. Bandit reads
 * the live theme presets from src/themes/themePresets.ts in the real codebase;
 * this file is the prototype's stand-in.
 *
 * Naming: align with what the codebase ACTIVELY consumes today
 * (--lw-panel-bg, --lw-app-bg, etc.), NOT the dashed-from-canonical-path
 * names that haven't been migrated yet.
 */

interface ThemePalette {
  id: string;
  name: string;
  /** Mood tag for thumbnail caption */
  mood: string;
  /** WCAG self-rating on text-primary / panel-bg */
  wcag: 'AAA' | 'AA' | 'partial';
  /** CSS variables — values are raw color strings */
  vars: {
    '--lw-app-bg': string;
    '--lw-panel-bg': string;
    '--lw-panel-bg-solid': string;
    '--lw-panel-border': string;
    '--lw-text-primary': string;
    '--lw-text-muted': string;
    '--lw-accent': string;
    '--lw-glow': string;
    '--lw-color-flare-500': string;
    '--lw-color-magenta-500': string;
    '--lw-color-purple-500': string;
    '--lw-color-gold-500': string;
  };
  /** Thumbnail composition colors */
  thumb: {
    bg: [string, string]; // radial gradient stops
    nodes: string[];
    edge: string;
  };
  /** Contrast pairs displayed in the accessibility readout */
  contrastPairs: Array<{ label: string; fg: string; bg: string; ratio: number; level: 'AAA'|'AA'|'AA-large'|'fail' }>;
}

const THEMES: ThemePalette[] = [
  {
    id: 'solar-plasma',
    name: 'Solar Plasma',
    mood: 'Warm · Magenta corona',
    wcag: 'AAA',
    vars: {
      '--lw-app-bg':         '#1a0d22',
      '--lw-panel-bg':       'rgba(40, 18, 48, 0.78)',
      '--lw-panel-bg-solid': '#281230',
      '--lw-panel-border':   'rgba(255, 140, 110, 0.32)',
      '--lw-text-primary':   '#fde3d0',
      '--lw-text-muted':     '#a48a92',
      '--lw-accent':         '#ff8a5b',
      '--lw-glow':           'rgba(255, 110, 80, 0.55)',
      '--lw-color-flare-500':   '#ff7a4a',
      '--lw-color-magenta-500': '#ff52a8',
      '--lw-color-purple-500':  '#b56cff',
      '--lw-color-gold-500':    '#ffc857',
    },
    thumb: {
      bg: ['#3a1442', '#150818'],
      nodes: ['#ff8a5b','#ff52a8','#b56cff','#ffc857','#4ad8ff'],
      edge: 'rgba(255, 138, 91, 0.55)',
    },
    contrastPairs: [
      { label: 'Primary text on panel',  fg: '#fde3d0', bg: '#281230', ratio: 11.2, level: 'AAA' },
      { label: 'Muted text on panel',    fg: '#a48a92', bg: '#281230', ratio: 4.9,  level: 'AA'  },
      { label: 'Accent on panel',        fg: '#ff8a5b', bg: '#281230', ratio: 5.4,  level: 'AA'  },
      { label: 'Primary on accent',      fg: '#1a0d22', bg: '#ff8a5b', ratio: 8.1,  level: 'AAA' },
    ],
  },
  {
    id: 'midnight-loom',
    name: 'Midnight Loom',
    mood: 'Cool · Cyan weave',
    wcag: 'AAA',
    vars: {
      '--lw-app-bg':         '#06090f',
      '--lw-panel-bg':       'rgba(12, 22, 34, 0.82)',
      '--lw-panel-bg-solid': '#0c1622',
      '--lw-panel-border':   'rgba(120, 220, 255, 0.22)',
      '--lw-text-primary':   '#e6f5ff',
      '--lw-text-muted':     '#7d96ad',
      '--lw-accent':         '#5cd6ff',
      '--lw-glow':           'rgba(92, 214, 255, 0.45)',
      '--lw-color-flare-500':   '#ffb461',
      '--lw-color-magenta-500': '#ff6fb5',
      '--lw-color-purple-500':  '#8a78ff',
      '--lw-color-gold-500':    '#f6d35a',
    },
    thumb: {
      bg: ['#0e1f30', '#03060b'],
      nodes: ['#5cd6ff','#ffb461','#8a78ff','#f6d35a','#ff6fb5'],
      edge: 'rgba(92, 214, 255, 0.5)',
    },
    contrastPairs: [
      { label: 'Primary text on panel',  fg: '#e6f5ff', bg: '#0c1622', ratio: 14.8, level: 'AAA' },
      { label: 'Muted text on panel',    fg: '#7d96ad', bg: '#0c1622', ratio: 5.6,  level: 'AA'  },
      { label: 'Accent on panel',        fg: '#5cd6ff', bg: '#0c1622', ratio: 9.2,  level: 'AAA' },
      { label: 'Primary on accent',      fg: '#06090f', bg: '#5cd6ff', ratio: 12.4, level: 'AAA' },
    ],
  },
  {
    id: 'verdant-mesh',
    name: 'Verdant Mesh',
    mood: 'Green · Mycelial',
    wcag: 'AA',
    vars: {
      '--lw-app-bg':         '#06120e',
      '--lw-panel-bg':       'rgba(14, 32, 26, 0.80)',
      '--lw-panel-bg-solid': '#0e201a',
      '--lw-panel-border':   'rgba(120, 240, 170, 0.25)',
      '--lw-text-primary':   '#e2f7e4',
      '--lw-text-muted':     '#7da78c',
      '--lw-accent':         '#5cffae',
      '--lw-glow':           'rgba(92, 255, 174, 0.45)',
      '--lw-color-flare-500':   '#a4ff61',
      '--lw-color-magenta-500': '#ff7ad1',
      '--lw-color-purple-500':  '#a890ff',
      '--lw-color-gold-500':    '#e8d370',
    },
    thumb: {
      bg: ['#14302a', '#040c08'],
      nodes: ['#5cffae','#a4ff61','#e8d370','#a890ff','#ff7ad1'],
      edge: 'rgba(92, 255, 174, 0.45)',
    },
    contrastPairs: [
      { label: 'Primary text on panel',  fg: '#e2f7e4', bg: '#0e201a', ratio: 12.9, level: 'AAA' },
      { label: 'Muted text on panel',    fg: '#7da78c', bg: '#0e201a', ratio: 4.7,  level: 'AA'  },
      { label: 'Accent on panel',        fg: '#5cffae', bg: '#0e201a', ratio: 10.1, level: 'AAA' },
      { label: 'Primary on accent',      fg: '#06120e', bg: '#5cffae', ratio: 13.2, level: 'AAA' },
    ],
  },
  {
    id: 'dreamfield',
    name: 'Dreamfield',
    mood: 'Pastel · Lilac haze',
    wcag: 'partial',
    vars: {
      '--lw-app-bg':         '#1d142a',
      '--lw-panel-bg':       'rgba(54, 36, 78, 0.74)',
      '--lw-panel-bg-solid': '#36244e',
      '--lw-panel-border':   'rgba(255, 200, 240, 0.28)',
      '--lw-text-primary':   '#fbe8ff',
      '--lw-text-muted':     '#b0a0c8',
      '--lw-accent':         '#ffa6e8',
      '--lw-glow':           'rgba(255, 166, 232, 0.55)',
      '--lw-color-flare-500':   '#ffb4b0',
      '--lw-color-magenta-500': '#ff8ad6',
      '--lw-color-purple-500':  '#c9a8ff',
      '--lw-color-gold-500':    '#ffe084',
    },
    thumb: {
      bg: ['#3d2658', '#150b22'],
      nodes: ['#ffa6e8','#c9a8ff','#ffb4b0','#ffe084','#9be7ff'],
      edge: 'rgba(255, 166, 232, 0.50)',
    },
    contrastPairs: [
      { label: 'Primary text on panel',  fg: '#fbe8ff', bg: '#36244e', ratio: 9.4, level: 'AAA'      },
      { label: 'Muted text on panel',    fg: '#b0a0c8', bg: '#36244e', ratio: 4.1, level: 'AA-large' },
      { label: 'Accent on panel',        fg: '#ffa6e8', bg: '#36244e', ratio: 6.7, level: 'AA'       },
      { label: 'Primary on accent',      fg: '#1d142a', bg: '#ffa6e8', ratio: 6.2, level: 'AA'       },
    ],
  },
  {
    id: 'glacier-hold',
    name: 'Glacier Hold',
    mood: 'Ice · Pale blue',
    wcag: 'AAA',
    vars: {
      '--lw-app-bg':         '#070d14',
      '--lw-panel-bg':       'rgba(18, 30, 44, 0.82)',
      '--lw-panel-bg-solid': '#121e2c',
      '--lw-panel-border':   'rgba(200, 230, 255, 0.22)',
      '--lw-text-primary':   '#f0f8ff',
      '--lw-text-muted':     '#8497ad',
      '--lw-accent':         '#9ee2ff',
      '--lw-glow':           'rgba(158, 226, 255, 0.42)',
      '--lw-color-flare-500':   '#c0d8ff',
      '--lw-color-magenta-500': '#dba8ff',
      '--lw-color-purple-500':  '#a5b8ff',
      '--lw-color-gold-500':    '#f0e8a8',
    },
    thumb: {
      bg: ['#152537', '#04090e'],
      nodes: ['#9ee2ff','#c0d8ff','#a5b8ff','#dba8ff','#f0e8a8'],
      edge: 'rgba(158, 226, 255, 0.5)',
    },
    contrastPairs: [
      { label: 'Primary text on panel',  fg: '#f0f8ff', bg: '#121e2c', ratio: 14.1, level: 'AAA' },
      { label: 'Muted text on panel',    fg: '#8497ad', bg: '#121e2c', ratio: 5.4,  level: 'AA'  },
      { label: 'Accent on panel',        fg: '#9ee2ff', bg: '#121e2c', ratio: 10.8, level: 'AAA' },
      { label: 'Primary on accent',      fg: '#070d14', bg: '#9ee2ff', ratio: 13.1, level: 'AAA' },
    ],
  },
  {
    id: 'ember-kiln',
    name: 'Ember Kiln',
    mood: 'Fire · Forge red',
    wcag: 'AA',
    vars: {
      '--lw-app-bg':         '#150806',
      '--lw-panel-bg':       'rgba(40, 16, 14, 0.80)',
      '--lw-panel-bg-solid': '#28100e',
      '--lw-panel-border':   'rgba(255, 130, 80, 0.30)',
      '--lw-text-primary':   '#ffe6d4',
      '--lw-text-muted':     '#b3897a',
      '--lw-accent':         '#ff6b3d',
      '--lw-glow':           'rgba(255, 107, 61, 0.55)',
      '--lw-color-flare-500':   '#ff5e3a',
      '--lw-color-magenta-500': '#ff3d8a',
      '--lw-color-purple-500':  '#a55fff',
      '--lw-color-gold-500':    '#ffb240',
    },
    thumb: {
      bg: ['#3a140e', '#0d0403'],
      nodes: ['#ff6b3d','#ffb240','#ff3d8a','#a55fff','#ffe6d4'],
      edge: 'rgba(255, 107, 61, 0.55)',
    },
    contrastPairs: [
      { label: 'Primary text on panel',  fg: '#ffe6d4', bg: '#28100e', ratio: 12.2, level: 'AAA' },
      { label: 'Muted text on panel',    fg: '#b3897a', bg: '#28100e', ratio: 5.1,  level: 'AA'  },
      { label: 'Accent on panel',        fg: '#ff6b3d', bg: '#28100e', ratio: 5.2,  level: 'AA'  },
      { label: 'Primary on accent',      fg: '#150806', bg: '#ff6b3d', ratio: 7.4,  level: 'AAA' },
    ],
  },
];

/** Apply a theme's CSS variables to a root element. The codebase's
 *  v87.4 theme crossfade will animate these values for free. */
function applyTheme(themeId: string, root: HTMLElement = document.documentElement): void {
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.setAttribute('data-theme', theme.id);
}

// Export to global scope so other text/babel files can pick these up without
// needing a module loader.
(window as any).LW_THEMES = THEMES;
(window as any).LW_applyTheme = applyTheme;

})();
