/**
 * Tier 1 — Primitives
 * 
 * The raw vocabulary. Themes redefine these. Components never reference them directly.
 * Solar Plasma values shown as reference. Other themes will have their own values.
 */

export interface TokenPrimitives {
  color: {
    void: { 900: string; 800: string; 700: string; 600: string };
    gold: { 500: string; 400: string };
    flare: { 500: string };
    magenta: { 500: string };
    fuchsia: { 500: string };
    purple: { 500: string };
    corona: { 500: string; 400: string };
    cream: { 100: string; 200: string };
    green: { 500: string };
    red: { 500: string };
  };
  space: { 0: number; 1: number; 2: number; 3: number; 4: number; 5: number; 6: number; 8: number; 12: number };
  radius: { sm: number; md: number; lg: number; full: number };
  shadow: { sm: string; lg: string };
  duration: { fast: number; base: number; slow: number };
  easing: { standard: string; out: string };
}

export const solarPlasmaPrimitives: TokenPrimitives = {
  color: {
    void: { 900: "#03000A", 800: "#0E0420", 700: "#1B0830", 600: "#14071F" },
    gold: { 500: "#FFB347", 400: "#FFD79A" },
    flare: { 500: "#FF6B1A" },
    magenta: { 500: "#FF1F8F" },
    fuchsia: { 500: "#CC2EFA" },
    purple: { 500: "#7B2FFF" },
    corona: { 500: "#00D4FF", 400: "#4FACFF" },
    cream: { 100: "#FFE9D6", 200: "#F5DAB7" },
    green: { 500: "#7CF6B5" },
    red: { 500: "#FF4D6D" },
  },
  space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 8: 48, 12: 96 },
  radius: { sm: 4, md: 8, lg: 12, full: 9999 },
  shadow: { sm: "0 1px 2px rgba(0,0,0,.4)", lg: "0 25px 50px -12px rgba(0,0,0,.5)" },
  duration: { fast: 150, base: 220, slow: 380 },
  easing: { standard: "cubic-bezier(.4,0,.2,1)", out: "cubic-bezier(0,0,.2,1)" },
};

// Other themes will have their own primitive definitions in v87
// For v86a, they get neutral defaults that don't break their visual identity
export const obsidianAuroraPrimitives: TokenPrimitives = {
  color: {
    void: { 900: "#020617", 800: "#0f172a", 700: "#1e293b", 600: "#334155" },
    gold: { 500: "#94a3b8", 400: "#cbd5e1" },
    flare: { 500: "#64748b" },
    magenta: { 500: "#8b5cf6" },
    fuchsia: { 500: "#a855f7" },
    purple: { 500: "#7c3aed" },
    corona: { 500: "#38bdf8", 400: "#60a5fa" },
    cream: { 100: "#f8fafc", 200: "#f1f5f9" },
    green: { 500: "#10b981" },
    red: { 500: "#ef4444" },
  },
  space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 8: 48, 12: 96 },
  radius: { sm: 4, md: 8, lg: 12, full: 9999 },
  shadow: { sm: "0 1px 2px rgba(0,0,0,.4)", lg: "0 25px 50px -12px rgba(0,0,0,.5)" },
  duration: { fast: 150, base: 220, slow: 380 },
  easing: { standard: "cubic-bezier(.4,0,.2,1)", out: "cubic-bezier(0,0,.2,1)" },
};

export const midnightLoomPrimitives: TokenPrimitives = {
  color: {
    void: { 900: "#0a0a0a", 800: "#171717", 700: "#262626", 600: "#404040" },
    gold: { 500: "#a3a3a3", 400: "#d4d4d4" },
    flare: { 500: "#737373" },
    magenta: { 500: "#d946ef" },
    fuchsia: { 500: "#c026d3" },
    purple: { 500: "#9333ea" },
    corona: { 500: "#06b6d4", 400: "#22d3ee" },
    cream: { 100: "#fafafa", 200: "#e5e5e5" },
    green: { 500: "#22c55e" },
    red: { 500: "#dc2626" },
  },
  space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 8: 48, 12: 96 },
  radius: { sm: 4, md: 8, lg: 12, full: 9999 },
  shadow: { sm: "0 1px 2px rgba(0,0,0,.4)", lg: "0 25px 50px -12px rgba(0,0,0,.5)" },
  duration: { fast: 150, base: 220, slow: 380 },
  easing: { standard: "cubic-bezier(.4,0,.2,1)", out: "cubic-bezier(0,0,.2,1)" },
};

export const voidCircuitPrimitives: TokenPrimitives = {
  color: {
    void: { 900: "#000000", 800: "#0a0a0a", 700: "#171717", 600: "#262626" },
    gold: { 500: "#ffffff", 400: "#e5e5e5" },
    flare: { 500: "#a3a3a3" },
    magenta: { 500: "#ec4899" },
    fuchsia: { 500: "#db2777" },
    purple: { 500: "#a855f7" },
    corona: { 500: "#3b82f6", 400: "#60a5fa" },
    cream: { 100: "#ffffff", 200: "#f5f5f5" },
    green: { 500: "#10b981" },
    red: { 500: "#ef4444" },
  },
  space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 8: 48, 12: 96 },
  radius: { sm: 4, md: 8, lg: 12, full: 9999 },
  shadow: { sm: "0 1px 2px rgba(0,0,0,.4)", lg: "0 25px 50px -12px rgba(0,0,0,.5)" },
  duration: { fast: 150, base: 220, slow: 380 },
  easing: { standard: "cubic-bezier(.4,0,.2,1)", out: "cubic-bezier(0,0,.2,1)" },
};

export const agarthaDreamPrimitives: TokenPrimitives = {
  color: {
    void: { 900: "#1a1a2e", 800: "#16213e", 700: "#0f3460", 600: "#533483" },
    gold: { 500: "#e94560", 400: "#ff6b6b" },
    flare: { 500: "#ff9a3c" },
    magenta: { 500: "#c77dff" },
    fuchsia: { 500: "#9d4edd" },
    purple: { 500: "#7b2cbf" },
    corona: { 500: "#00d4ff", 400: "#4facfe" },
    cream: { 100: "#fff0e6", 200: "#ffe4cc" },
    green: { 500: "#00ff88" },
    red: { 500: "#ff4757" },
  },
  space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 8: 48, 12: 96 },
  radius: { sm: 4, md: 8, lg: 12, full: 9999 },
  shadow: { sm: "0 1px 2px rgba(0,0,0,.4)", lg: "0 25px 50px -12px rgba(0,0,0,.5)" },
  duration: { fast: 150, base: 220, slow: 380 },
  easing: { standard: "cubic-bezier(.4,0,.2,1)", out: "cubic-bezier(0,0,.2,1)" },
};

export const agarthaDuskPrimitives: TokenPrimitives = {
  color: {
    void: { 900: "#0d0d1a", 800: "#1a1a2e", 700: "#2d2d44", 600: "#40405c" },
    gold: { 500: "#ff8c42", 400: "#ffb366" },
    flare: { 500: "#ff6b35" },
    magenta: { 500: "#ff6b9d" },
    fuchsia: { 500: "#e84393" },
    purple: { 500: "#6c5ce7" },
    corona: { 500: "#00cec9", 400: "#81ecec" },
    cream: { 100: "#ffeaa7", 200: "#fdcb6e" },
    green: { 500: "#55efc4" },
    red: { 500: "#ff7675" },
  },
  space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 8: 48, 12: 96 },
  radius: { sm: 4, md: 8, lg: 12, full: 9999 },
  shadow: { sm: "0 1px 2px rgba(0,0,0,.4)", lg: "0 25px 50px -12px rgba(0,0,0,.5)" },
  duration: { fast: 150, base: 220, slow: 380 },
  easing: { standard: "cubic-bezier(.4,0,.2,1)", out: "cubic-bezier(0,0,.2,1)" },
};

export const themePrimitives: Record<string, TokenPrimitives> = {
  "solar-plasma": solarPlasmaPrimitives,
  "obsidian-aurora": obsidianAuroraPrimitives,
  "midnight-loom": midnightLoomPrimitives,
  "void-circuit": voidCircuitPrimitives,
  "agartha-dream": agarthaDreamPrimitives,
  "agartha-dusk": agarthaDuskPrimitives,
};
