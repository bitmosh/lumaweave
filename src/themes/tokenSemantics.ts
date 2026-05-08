/**
 * Tier 2 — Semantics
 * 
 * Role assignments. Every reference resolves to a primitive. Themes redefine these.
 * Solar Plasma values shown as reference. Other themes will have their own values.
 */

export interface TokenSemantics {
  surface: {
    background: { deep: string; mid: string; warm: string };
    panel: { warm: string; muted: string };
    border: { accent: string; hot: string; subtle: string };
    accent: { warm: string; primary: string };
  };
  text: {
    primary: string;
    muted: string;
    faint: string;
    accent: string;
    success: string;
    danger: string;
  };
  motion: {
    duration: string;
    easing: string;
  };
}

export const solarPlasmaSemantics: TokenSemantics = {
  surface: {
    background: { deep: "{color.void.900}", mid: "{color.void.800}", warm: "{color.void.700}" },
    panel: { warm: "{color.void.700} / 82%", muted: "{color.void.800} / 60%" },
    border: { accent: "{color.gold.500} / 32%", hot: "{color.gold.500} / 62%", subtle: "{color.cream.100} / 14%" },
    accent: { warm: "{color.flare.500}", primary: "{color.gold.500}" },
  },
  text: {
    primary: "{color.cream.100}",
    muted: "{color.cream.100} / 55%",
    faint: "{color.cream.100} / 32%",
    accent: "{color.gold.500}",
    success: "{color.green.500}",
    danger: "{color.red.500}",
  },
  motion: {
    duration: "{duration.base}",
    easing: "{easing.out}",
  },
};

// Other themes get neutral defaults that don't break their visual identity
export const obsidianAuroraSemantics: TokenSemantics = {
  surface: {
    background: { deep: "{color.void.900}", mid: "{color.void.800}", warm: "{color.void.700}" },
    panel: { warm: "{color.void.700} / 82%", muted: "{color.void.800} / 60%" },
    border: { accent: "{color.gold.500} / 32%", hot: "{color.gold.500} / 62%", subtle: "{color.cream.100} / 14%" },
    accent: { warm: "{color.flare.500}", primary: "{color.gold.500}" },
  },
  text: {
    primary: "{color.cream.100}",
    muted: "{color.cream.100} / 55%",
    faint: "{color.cream.100} / 32%",
    accent: "{color.gold.500}",
    success: "{color.green.500}",
    danger: "{color.red.500}",
  },
  motion: {
    duration: "{duration.base}",
    easing: "{easing.out}",
  },
};

export const midnightLoomSemantics: TokenSemantics = {
  surface: {
    background: { deep: "{color.void.900}", mid: "{color.void.800}", warm: "{color.void.700}" },
    panel: { warm: "{color.void.700} / 82%", muted: "{color.void.800} / 60%" },
    border: { accent: "{color.gold.500} / 32%", hot: "{color.gold.500} / 62%", subtle: "{color.cream.100} / 14%" },
    accent: { warm: "{color.flare.500}", primary: "{color.gold.500}" },
  },
  text: {
    primary: "{color.cream.100}",
    muted: "{color.cream.100} / 55%",
    faint: "{color.cream.100} / 32%",
    accent: "{color.gold.500}",
    success: "{color.green.500}",
    danger: "{color.red.500}",
  },
  motion: {
    duration: "{duration.base}",
    easing: "{easing.out}",
  },
};

export const voidCircuitSemantics: TokenSemantics = {
  surface: {
    background: { deep: "{color.void.900}", mid: "{color.void.800}", warm: "{color.void.700}" },
    panel: { warm: "{color.void.700} / 82%", muted: "{color.void.800} / 60%" },
    border: { accent: "{color.gold.500} / 32%", hot: "{color.gold.500} / 62%", subtle: "{color.cream.100} / 14%" },
    accent: { warm: "{color.flare.500}", primary: "{color.gold.500}" },
  },
  text: {
    primary: "{color.cream.100}",
    muted: "{color.cream.100} / 55%",
    faint: "{color.cream.100} / 32%",
    accent: "{color.gold.500}",
    success: "{color.green.500}",
    danger: "{color.red.500}",
  },
  motion: {
    duration: "{duration.base}",
    easing: "{easing.out}",
  },
};

export const agarthaDreamSemantics: TokenSemantics = {
  surface: {
    background: { deep: "{color.void.900}", mid: "{color.void.800}", warm: "{color.void.700}" },
    panel: { warm: "{color.void.700} / 82%", muted: "{color.void.800} / 60%" },
    border: { accent: "{color.gold.500} / 32%", hot: "{color.gold.500} / 62%", subtle: "{color.cream.100} / 14%" },
    accent: { warm: "{color.flare.500}", primary: "{color.gold.500}" },
  },
  text: {
    primary: "{color.cream.100}",
    muted: "{color.cream.100} / 55%",
    faint: "{color.cream.100} / 32%",
    accent: "{color.gold.500}",
    success: "{color.green.500}",
    danger: "{color.red.500}",
  },
  motion: {
    duration: "{duration.base}",
    easing: "{easing.out}",
  },
};

export const agarthaDuskSemantics: TokenSemantics = {
  surface: {
    background: { deep: "{color.void.900}", mid: "{color.void.800}", warm: "{color.void.700}" },
    panel: { warm: "{color.void.700} / 82%", muted: "{color.void.800} / 60%" },
    border: { accent: "{color.gold.500} / 32%", hot: "{color.gold.500} / 62%", subtle: "{color.cream.100} / 14%" },
    accent: { warm: "{color.flare.500}", primary: "{color.gold.500}" },
  },
  text: {
    primary: "{color.cream.100}",
    muted: "{color.cream.100} / 55%",
    faint: "{color.cream.100} / 32%",
    accent: "{color.gold.500}",
    success: "{color.green.500}",
    danger: "{color.red.500}",
  },
  motion: {
    duration: "{duration.base}",
    easing: "{easing.out}",
  },
};

export const themeSemantics: Record<string, TokenSemantics> = {
  "solar-plasma": solarPlasmaSemantics,
  "obsidian-aurora": obsidianAuroraSemantics,
  "midnight-loom": midnightLoomSemantics,
  "void-circuit": voidCircuitSemantics,
  "agartha-dream": agarthaDreamSemantics,
  "agartha-dusk": agarthaDuskSemantics,
};
