// SPDX-License-Identifier: Apache-2.0
import type { ThemeId } from "../control-plane/settings/settings.schema";

export interface ColorSlot {
  id: string;
  hex: string;
  label: string;
  hueAngle: number;
  lightness: number;
  saturation: number;
  role?: "primary" | "secondary" | "accent" | "neutral";
}

export interface ThemeSelectableColors {
  themeId: ThemeId;
  slots: ColorSlot[];
  rotationOrder: string[];
  semantics: {
    success: string;
    warning: string;
    danger: string;
    info: string;
  };
}

// ── Solar Plasma ─────────────────────────────────────────────────────────────

const solarPlasmaSelectable: ThemeSelectableColors = {
  themeId: "solar-plasma",
  slots: [
    { id: "plasma-cyan",  hex: "#00D4FF", label: "Plasma Cyan",  hueAngle: 190, lightness: 50, saturation: 100, role: "primary" },
    { id: "gold-flare",   hex: "#FFB347", label: "Gold Flare",   hueAngle: 30,  lightness: 64, saturation: 100, role: "primary" },
    { id: "magenta-glow", hex: "#FF6B9D", label: "Magenta Glow", hueAngle: 340, lightness: 70, saturation: 100, role: "accent" },
    { id: "purple-haze",  hex: "#A855F7", label: "Purple Haze",  hueAngle: 270, lightness: 65, saturation: 90,  role: "accent" },
    { id: "coral-spark",  hex: "#FF8C42", label: "Coral Spark",  hueAngle: 20,  lightness: 65, saturation: 100, role: "accent" },
    { id: "mint-flux",    hex: "#7CF6B5", label: "Mint Flux",    hueAngle: 145, lightness: 75, saturation: 90,  role: "secondary" },
    { id: "azure-light",  hex: "#4FACFF", label: "Azure Light",  hueAngle: 210, lightness: 65, saturation: 100, role: "secondary" },
    { id: "violet-mist",  hex: "#C084FC", label: "Violet Mist",  hueAngle: 280, lightness: 75, saturation: 95,  role: "secondary" },
  ],
  rotationOrder: [
    "plasma-cyan", "gold-flare", "magenta-glow", "purple-haze",
    "coral-spark", "mint-flux", "azure-light", "violet-mist",
  ],
  semantics: {
    success: "mint-flux",
    warning: "gold-flare",
    danger: "magenta-glow",
    info: "plasma-cyan",
  },
};

// ── Obsidian Aurora ───────────────────────────────────────────────────────────
// Dark crystalline aurora borealis. Violet-forward, jewel-like saturation.
// success lock uses jade (closest green), warning uses warm gold for contrast.

const obsidianAuroraSelectable: ThemeSelectableColors = {
  themeId: "obsidian-aurora",
  slots: [
    { id: "aurora-violet",   hex: "#8B5CF6", label: "Aurora Violet",   hueAngle: 262, lightness: 65, saturation: 89,  role: "primary" },
    { id: "aurora-crystal",  hex: "#38BDF8", label: "Aurora Crystal",  hueAngle: 199, lightness: 60, saturation: 93,  role: "primary" },
    { id: "aurora-amethyst", hex: "#A855F7", label: "Aurora Amethyst", hueAngle: 271, lightness: 64, saturation: 91,  role: "accent" },
    { id: "aurora-sapphire", hex: "#60A5FA", label: "Aurora Sapphire", hueAngle: 213, lightness: 66, saturation: 94,  role: "accent" },
    { id: "aurora-teal",     hex: "#2DD4BF", label: "Aurora Teal",     hueAngle: 174, lightness: 50, saturation: 62,  role: "accent" },
    { id: "aurora-rose",     hex: "#F472B6", label: "Aurora Rose",     hueAngle: 328, lightness: 70, saturation: 86,  role: "secondary" },
    { id: "aurora-jade",     hex: "#34D399", label: "Aurora Jade",     hueAngle: 158, lightness: 52, saturation: 63,  role: "secondary" },
    { id: "aurora-gold",     hex: "#FCD34D", label: "Aurora Gold",     hueAngle: 43,  lightness: 65, saturation: 96,  role: "secondary" },
  ],
  rotationOrder: [
    "aurora-violet", "aurora-crystal", "aurora-amethyst", "aurora-sapphire",
    "aurora-teal", "aurora-rose", "aurora-jade", "aurora-gold",
  ],
  semantics: {
    success: "aurora-jade",
    warning: "aurora-gold",
    danger: "aurora-rose",
    info: "aurora-crystal",
  },
};

// ── Midnight Loom ─────────────────────────────────────────────────────────────
// Dark warm gold candlelight. Amber/gold-forward, cozy tones.
// moonbeam (cool violet) and teal-ember provide visual contrast.

const midnightLoomSelectable: ThemeSelectableColors = {
  themeId: "midnight-loom",
  slots: [
    { id: "ember-gold",   hex: "#FBBF24", label: "Ember Gold",   hueAngle: 45,  lightness: 57, saturation: 96,  role: "primary" },
    { id: "candlelight",  hex: "#F59E0B", label: "Candlelight",  hueAngle: 38,  lightness: 48, saturation: 91,  role: "primary" },
    { id: "copper-warm",  hex: "#FB923C", label: "Copper Warm",  hueAngle: 21,  lightness: 62, saturation: 96,  role: "accent" },
    { id: "rose-ember",   hex: "#FB7185", label: "Rose Ember",   hueAngle: 351, lightness: 68, saturation: 95,  role: "accent" },
    { id: "amber-mist",   hex: "#FCD34D", label: "Amber Mist",   hueAngle: 43,  lightness: 65, saturation: 96,  role: "accent" },
    { id: "moonbeam",     hex: "#C084FC", label: "Moonbeam",     hueAngle: 280, lightness: 75, saturation: 95,  role: "secondary" },
    { id: "teal-ember",   hex: "#2DD4BF", label: "Teal Ember",   hueAngle: 174, lightness: 50, saturation: 62,  role: "secondary" },
    { id: "verdant",      hex: "#86EFAC", label: "Verdant",      hueAngle: 142, lightness: 80, saturation: 77,  role: "secondary" },
  ],
  rotationOrder: [
    "ember-gold", "copper-warm", "moonbeam", "rose-ember",
    "candlelight", "teal-ember", "amber-mist", "verdant",
  ],
  semantics: {
    success: "verdant",
    warning: "ember-gold",
    danger: "rose-ember",
    info: "teal-ember",
  },
};

// ── Void Circuit ──────────────────────────────────────────────────────────────
// Dark cyberpunk neon. High contrast, sharp brights across the spectrum.

const voidCircuitSelectable: ThemeSelectableColors = {
  themeId: "void-circuit",
  slots: [
    { id: "neon-pink",   hex: "#EC4899", label: "Neon Pink",   hueAngle: 322, lightness: 55, saturation: 88,  role: "primary" },
    { id: "neon-blue",   hex: "#3B82F6", label: "Neon Blue",   hueAngle: 217, lightness: 58, saturation: 93,  role: "primary" },
    { id: "neon-violet", hex: "#A855F7", label: "Neon Violet", hueAngle: 271, lightness: 64, saturation: 91,  role: "accent" },
    { id: "neon-cyan",   hex: "#22D3EE", label: "Neon Cyan",   hueAngle: 188, lightness: 53, saturation: 85,  role: "accent" },
    { id: "neon-lime",   hex: "#A3E635", label: "Neon Lime",   hueAngle: 78,  lightness: 55, saturation: 80,  role: "accent" },
    { id: "neon-orange", hex: "#FB923C", label: "Neon Orange", hueAngle: 21,  lightness: 62, saturation: 96,  role: "secondary" },
    { id: "neon-green",  hex: "#4ADE80", label: "Neon Green",  hueAngle: 142, lightness: 58, saturation: 72,  role: "secondary" },
    { id: "neon-red",    hex: "#F87171", label: "Neon Red",    hueAngle: 0,   lightness: 70, saturation: 89,  role: "secondary" },
  ],
  rotationOrder: [
    "neon-pink", "neon-blue", "neon-violet", "neon-cyan",
    "neon-lime", "neon-orange", "neon-green", "neon-red",
  ],
  semantics: {
    success: "neon-green",
    warning: "neon-orange",
    danger: "neon-red",
    info: "neon-cyan",
  },
};

// ── Agartha Dream ─────────────────────────────────────────────────────────────
// Light pastel dreamy. ONLY LIGHT THEME. Softer saturation, lavender-forward.
// Slots chosen to remain legible as fills on a light background.

const agarthaDreamSelectable: ThemeSelectableColors = {
  themeId: "agartha-dream",
  slots: [
    { id: "dream-lavender", hex: "#A855F7", label: "Dream Lavender", hueAngle: 271, lightness: 64, saturation: 91,  role: "primary" },
    { id: "dream-azure",    hex: "#60A5FA", label: "Dream Azure",    hueAngle: 213, lightness: 66, saturation: 94,  role: "primary" },
    { id: "dream-rose",     hex: "#F472B6", label: "Dream Rose",     hueAngle: 328, lightness: 70, saturation: 86,  role: "accent" },
    { id: "dream-mint",     hex: "#6EE7B7", label: "Dream Mint",     hueAngle: 155, lightness: 70, saturation: 71,  role: "accent" },
    { id: "dream-coral",    hex: "#FCA5A5", label: "Dream Coral",    hueAngle: 0,   lightness: 82, saturation: 93,  role: "accent" },
    { id: "dream-lilac",    hex: "#C084FC", label: "Dream Lilac",    hueAngle: 280, lightness: 75, saturation: 95,  role: "secondary" },
    { id: "dream-sky",      hex: "#93C5FD", label: "Dream Sky",      hueAngle: 213, lightness: 79, saturation: 95,  role: "secondary" },
    { id: "dream-peach",    hex: "#FDBA74", label: "Dream Peach",    hueAngle: 30,  lightness: 72, saturation: 97,  role: "secondary" },
  ],
  rotationOrder: [
    "dream-lavender", "dream-azure", "dream-rose", "dream-mint",
    "dream-coral", "dream-lilac", "dream-sky", "dream-peach",
  ],
  semantics: {
    success: "dream-mint",
    warning: "dream-peach",
    danger: "dream-coral",
    info: "dream-azure",
  },
};

// ── Agartha Dusk ──────────────────────────────────────────────────────────────
// Dark pastel moonlit. Rose/pink-forward with teal contrast.
// danger uses dusk-mauve (deep magenta) as the closest danger-signaling tone.

const agarthaDuskSelectable: ThemeSelectableColors = {
  themeId: "agartha-dusk",
  slots: [
    { id: "dusk-rose",    hex: "#F472B6", label: "Dusk Rose",    hueAngle: 328, lightness: 70, saturation: 86,  role: "primary" },
    { id: "dusk-lavender",hex: "#6C5CE7", label: "Dusk Lavender",hueAngle: 255, lightness: 64, saturation: 78,  role: "primary" },
    { id: "dusk-coral",   hex: "#FF6B9D", label: "Dusk Coral",   hueAngle: 340, lightness: 70, saturation: 100, role: "accent" },
    { id: "dusk-teal",    hex: "#00CEC9", label: "Dusk Teal",    hueAngle: 178, lightness: 40, saturation: 100, role: "accent" },
    { id: "dusk-amber",   hex: "#FDCB6E", label: "Dusk Amber",   hueAngle: 43,  lightness: 72, saturation: 98,  role: "accent" },
    { id: "dusk-mint",    hex: "#55EFC4", label: "Dusk Mint",    hueAngle: 162, lightness: 64, saturation: 82,  role: "secondary" },
    { id: "dusk-mauve",   hex: "#E84393", label: "Dusk Mauve",   hueAngle: 320, lightness: 56, saturation: 83,  role: "secondary" },
    { id: "dusk-sky",     hex: "#81ECEC", label: "Dusk Sky",     hueAngle: 178, lightness: 73, saturation: 81,  role: "secondary" },
  ],
  rotationOrder: [
    "dusk-rose", "dusk-lavender", "dusk-coral", "dusk-teal",
    "dusk-amber", "dusk-mint", "dusk-mauve", "dusk-sky",
  ],
  semantics: {
    success: "dusk-mint",
    warning: "dusk-amber",
    danger: "dusk-mauve",
    info: "dusk-teal",
  },
};

// ── Validation ────────────────────────────────────────────────────────────────

export function validateSelectableColors(set: ThemeSelectableColors): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (set.slots.length < 8 || set.slots.length > 10) {
    errors.push(`Must have 8-10 slots, has ${set.slots.length}`);
  }

  const slotIds = new Set(set.slots.map((s) => s.id));

  for (const id of set.rotationOrder) {
    if (!slotIds.has(id)) {
      errors.push(`rotationOrder references unknown slot: ${id}`);
    }
  }
  if (set.rotationOrder.length !== set.slots.length) {
    errors.push(
      `rotationOrder length (${set.rotationOrder.length}) doesn't match slots count (${set.slots.length})`
    );
  }
  const rotationSet = new Set(set.rotationOrder);
  if (rotationSet.size !== set.rotationOrder.length) {
    errors.push("rotationOrder has duplicates");
  }

  for (const [role, slotId] of Object.entries(set.semantics)) {
    if (!slotIds.has(slotId)) {
      errors.push(`semantics.${role} references unknown slot: ${slotId}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ── Registry ──────────────────────────────────────────────────────────────────

export const themeSelectableColors: Record<ThemeId, ThemeSelectableColors> = {
  "solar-plasma": solarPlasmaSelectable,
  "obsidian-aurora": obsidianAuroraSelectable,
  "midnight-loom": midnightLoomSelectable,
  "void-circuit": voidCircuitSelectable,
  "agartha-dream": agarthaDreamSelectable,
  "agartha-dusk": agarthaDuskSelectable,
};

// Run validation at load; warn (don't throw) on any failure.
for (const set of Object.values(themeSelectableColors)) {
  const { valid, errors } = validateSelectableColors(set);
  if (!valid) {
    console.warn(`[themeSelectableColors] Validation failed for "${set.themeId}":`, errors);
  }
}

// Dev probe
if (typeof window !== "undefined" && (import.meta.env.DEV || (window as any).PLAYWRIGHT)) {
  (window as any).__lwThemeSelectableColors = {
    get: (themeId: ThemeId) => themeSelectableColors[themeId],
    all: () => themeSelectableColors,
    validate: validateSelectableColors,
  };
}
