/**
 * Tier 3 — Components
 * 
 * Component families. Reference Tier 2 only. Stable across themes.
 * These are theme-agnostic by design.
 */

export interface TokenComponents {
  shell: { background: string; glow: string };
  topbar: { background: string; border: string; text: string; accent: string };
  panel: { background: string; border: string; text: string };
  tile: { background: string; border: string; handle: string; groupOutline: string };
  graph: { background: string; frameBorder: string };
  inspector: {
    radial: { halo: string; spoke: string };
    popover: { background: string; border: string };
  };
}

export const components: TokenComponents = {
  shell: { background: "{surface.background.deep}", glow: "{surface.accent.warm}" },
  topbar: { background: "{surface.background.deep}", border: "{surface.border.accent}", text: "{text.primary}", accent: "{surface.accent.primary}" },
  panel: { background: "{surface.panel.warm}", border: "{surface.border.accent}", text: "{text.primary}" },
  tile: { background: "{surface.panel.warm}", border: "{surface.border.accent}", handle: "{surface.border.hot}", groupOutline: "{surface.accent.primary}" },
  graph: { background: "{surface.background.deep}", frameBorder: "{surface.border.accent}" },
  inspector: {
    radial: { halo: "{surface.border.hot}", spoke: "{surface.accent.primary}" },
    popover: { background: "{surface.panel.warm}", border: "{surface.border.accent}" },
  },
};
