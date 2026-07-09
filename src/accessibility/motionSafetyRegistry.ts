// SPDX-License-Identifier: Apache-2.0
/**
 * Motion Safety Registry
 *
 * Static, read-only registry for classifying visual effects by risk, reduced-motion behavior, and epilepsy risk.
 *
 * This registry does not execute effects. It provides classification data for future safety gates.
 *
 * v60: Reduced Motion Guard Registry - static/read-only registry with passive UI
 */

export type MotionRiskLevel = "safe" | "low" | "moderate" | "high";

export type ReducedMotionBehavior = "allow" | "soften" | "disable";

export type EpilepsyRiskLevel = "none" | "possible" | "high";

export interface MotionSafetyEntry {
  /**
   * Unique identifier for the visual effect
   */
  id: string;

  /**
   * Human-readable name of the effect
   */
  name: string;

  /**
   * Description of what the effect does
   */
  description: string;

  /**
   * Risk classification: safe, low, moderate, high
   */
  risk: MotionRiskLevel;

  /**
   * Behavior when reduce motion is enabled: allow, soften, disable
   */
  reducedMotionBehavior: ReducedMotionBehavior;

  /**
   * Epilepsy risk level: none, possible, high
   */
  epilepsyRisk: EpilepsyRiskLevel;

  /**
   * Whether this effect requires explicit user opt-in before use
   */
  requiresExplicitOptIn: boolean;

  /**
   * Notes about this effect's safety considerations
   */
  notes?: string;
}

/**
 * Static registry of motion safety classifications
 *
 * This is a read-only registry. Effects are classified but not executed.
 * Future runtime safety gates will use this registry to decide whether to allow, soften, or disable effects.
 */
export const MOTION_SAFETY_REGISTRY: readonly MotionSafetyEntry[] = [
  {
    id: "static-signal-readout",
    name: "Static Signal Readout",
    description: "Static text labels and status indicators with no animation",
    risk: "safe",
    reducedMotionBehavior: "allow",
    epilepsyRisk: "none",
    requiresExplicitOptIn: false,
    notes: "Always safe regardless of reduce motion setting",
  },
  {
    id: "slow-border-glow-2s",
    name: "Slow Border Glow (2+ seconds)",
    description: "Slow border glow with transitions lasting 2+ seconds",
    risk: "safe",
    reducedMotionBehavior: "allow",
    epilepsyRisk: "none",
    requiresExplicitOptIn: false,
    notes: "Transitions are slow enough to be safe",
  },
  {
    id: "gradual-color-shift-2s",
    name: "Gradual Color Shift (2+ seconds)",
    description: "Gradual color shifts with transitions lasting 2+ seconds",
    risk: "safe",
    reducedMotionBehavior: "allow",
    epilepsyRisk: "none",
    requiresExplicitOptIn: false,
    notes: "Slow color changes are safe",
  },
  {
    id: "slow-border-glow-1s",
    name: "Slow Border Glow (1+ seconds)",
    description: "Slow border glow with transitions lasting 1+ seconds",
    risk: "low",
    reducedMotionBehavior: "soften",
    epilepsyRisk: "possible",
    requiresExplicitOptIn: false,
    notes: "Softened under reduce motion: disable animation, keep static state",
  },
  {
    id: "gentle-particle-sparkle-2s",
    name: "Gentle Particle Sparkle (2+ seconds)",
    description: "Gentle particle sparkle with 2+ second intervals between effects",
    risk: "low",
    reducedMotionBehavior: "soften",
    epilepsyRisk: "possible",
    requiresExplicitOptIn: false,
    notes: "Softened under reduce motion: disable animation, keep static state",
  },
  {
    id: "breathing-animation-3s",
    name: "Breathing Animation (3+ seconds)",
    description: "Breathing animation with 3+ second cycles",
    risk: "low",
    reducedMotionBehavior: "soften",
    epilepsyRisk: "possible",
    requiresExplicitOptIn: false,
    notes: "Softened under reduce motion: disable animation, keep static state",
  },
  {
    id: "graph-shell-pulse",
    name: "Graph Shell Pulse",
    description: "Graph shell pulse animation",
    risk: "moderate",
    reducedMotionBehavior: "disable",
    epilepsyRisk: "possible",
    requiresExplicitOptIn: true,
    notes: "Disabled by default and under reduce motion. Requires explicit opt-in.",
  },
  {
    id: "edge-shimmer",
    name: "Edge Shimmer",
    description: "Edge shimmer animation",
    risk: "moderate",
    reducedMotionBehavior: "disable",
    epilepsyRisk: "possible",
    requiresExplicitOptIn: true,
    notes: "Disabled by default and under reduce motion. Requires explicit opt-in.",
  },
] as const;

/**
 * Get all motion safety entries
 */
export function getAllMotionSafetyEntries(): readonly MotionSafetyEntry[] {
  return MOTION_SAFETY_REGISTRY;
}

/**
 * Get motion safety entry by ID
 */
export function getMotionSafetyEntry(id: string): MotionSafetyEntry | undefined {
  return MOTION_SAFETY_REGISTRY.find((entry) => entry.id === id);
}

/**
 * Get entries by risk level
 */
export function getEntriesByRisk(risk: MotionRiskLevel): readonly MotionSafetyEntry[] {
  return MOTION_SAFETY_REGISTRY.filter((entry) => entry.risk === risk);
}

/**
 * Get entries by epilepsy risk level
 */
export function getEntriesByEpilepsyRisk(epilepsyRisk: EpilepsyRiskLevel): readonly MotionSafetyEntry[] {
  return MOTION_SAFETY_REGISTRY.filter((entry) => entry.epilepsyRisk === epilepsyRisk);
}

/**
 * Get entries that require explicit opt-in
 */
export function getEntriesRequiringOptIn(): readonly MotionSafetyEntry[] {
  return MOTION_SAFETY_REGISTRY.filter((entry) => entry.requiresExplicitOptIn);
}

/**
 * Check if an entry is allowed under reduce motion
 */
export function isAllowedUnderReduceMotion(entry: MotionSafetyEntry): boolean {
  return entry.reducedMotionBehavior === "allow";
}

/**
 * Check if an entry should be softened under reduce motion
 */
export function shouldSoftenUnderReduceMotion(entry: MotionSafetyEntry): boolean {
  return entry.reducedMotionBehavior === "soften";
}

/**
 * Check if an entry should be disabled under reduce motion
 */
export function shouldDisableUnderReduceMotion(entry: MotionSafetyEntry): boolean {
  return entry.reducedMotionBehavior === "disable";
}
