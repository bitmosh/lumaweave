// SPDX-License-Identifier: Apache-2.0
/**
 * Music Reactive Mapping Registry
 *
 * Registry for mapping audio signal channels to future graph visual targets.
 *
 * This registry does not execute mappings or drive visual effects. It provides classification
 * data for future safety gates and passive inventory display.
 *
 * v64: Passive Music Reactive Mapping Inventory - static/read-only registry with passive UI
 * v86e: Aligned to standard class-based registry contract pattern
 *
 * Contract: docs/audio/contracts/MUSIC_REACTIVE_MAPPING_REGISTRY_CONTRACT.md (forthcoming)
 */

import type { MotionRiskLevel, ReducedMotionBehavior, EpilepsyRiskLevel } from "../accessibility/motionSafetyRegistry";

export type AudioChannel = "rms" | "bass" | "mid" | "treble" | "beat" | "silence" | "tempo";

export type GraphTarget =
  | "graph.shell.glow"
  | "graph.shell.pulse"
  | "graph.frame.border"
  | "graph.node.halo"
  | "graph.edge.current"
  | "graph.cluster.aura"
  | "graph.label.glow"
  | "graph.overlay.particles"
  | "graph.camera.breathing"
  | "graph.path.highlight"
  | "graph.depth.architecture"
  | "graph.depth.module"
  | "graph.depth.leaf"
  | "static.signal.readout"
  | "calm.state.indicator";

export type ModeFamily =
  | "Lantern Pulse"
  | "Plasma Loom"
  | "Constellation Beat"
  | "Signal Trace"
  | "Spectral Debug"
  | "Focus-Safe";

export type MappingStatus =
  | "proposed-passive"
  | "locked-until-safety-gate"
  | "future"
  | "forbidden";

export interface MusicReactiveMapping {
  id: string;
  title: string;
  description: string;
  audioChannel: AudioChannel;
  graphTarget: GraphTarget;
  motionSafetyEffectId: string;
  risk: MotionRiskLevel;
  reducedMotionBehavior: ReducedMotionBehavior;
  epilepsyRisk: EpilepsyRiskLevel;
  status: MappingStatus;
  modeFamily: ModeFamily;
  futurePhase: string;
  safetyNotes: string;
}

export interface MusicReactiveMappingFilterQuery {
  audioChannel?: AudioChannel;
  modeFamily?: ModeFamily;
  status?: MappingStatus;
  risk?: MotionRiskLevel;
}

export interface MusicReactiveMappingRegistryContract {
  list: () => MusicReactiveMapping[];
  getById: (id: string) => MusicReactiveMapping | undefined;
  filterByCategory: (query: MusicReactiveMappingFilterQuery) => MusicReactiveMapping[];
  validateShape: (entry: unknown) => entry is MusicReactiveMapping;
  register: (entry: MusicReactiveMapping) => void;
  subscribe: (listener: () => void) => () => void;
}

const entries: MusicReactiveMapping[] = [
  // Lantern Pulse (2 entries)
  {
    id: "rms-to-shell-glow",
    title: "RMS to Shell Glow",
    description: "Root mean square amplitude drives shell border glow intensity",
    audioChannel: "rms",
    graphTarget: "graph.shell.glow",
    motionSafetyEffectId: "slow-border-glow-2s",
    risk: "safe",
    reducedMotionBehavior: "allow",
    epilepsyRisk: "none",
    status: "proposed-passive",
    modeFamily: "Lantern Pulse",
    futurePhase: "v65+",
    safetyNotes: "Safe static glow effect, always allowed",
  },
  {
    id: "beat-to-shell-pulse",
    title: "Beat to Shell Pulse",
    description: "Detected beat events drive shell pulse animation",
    audioChannel: "beat",
    graphTarget: "graph.shell.pulse",
    motionSafetyEffectId: "graph-shell-pulse",
    risk: "moderate",
    reducedMotionBehavior: "disable",
    epilepsyRisk: "possible",
    status: "locked-until-safety-gate",
    modeFamily: "Lantern Pulse",
    futurePhase: "v65+",
    safetyNotes: "Moderate risk, requires safety gate and explicit opt-in",
  },
  // Plasma Loom (3 entries)
  {
    id: "bass-to-node-halo",
    title: "Bass to Node Halo",
    description: "Low-frequency energy drives node halo/glow effects",
    audioChannel: "bass",
    graphTarget: "graph.node.halo",
    motionSafetyEffectId: "graph-shell-pulse",
    risk: "moderate",
    reducedMotionBehavior: "disable",
    epilepsyRisk: "possible",
    status: "future",
    modeFamily: "Plasma Loom",
    futurePhase: "v66+",
    safetyNotes: "Moderate risk, disabled under reduce motion",
  },
  {
    id: "mid-to-edge-current",
    title: "Mid to Edge Current",
    description: "Mid-frequency energy drives edge current/flow visualization",
    audioChannel: "mid",
    graphTarget: "graph.edge.current",
    motionSafetyEffectId: "edge-shimmer",
    risk: "moderate",
    reducedMotionBehavior: "disable",
    epilepsyRisk: "possible",
    status: "future",
    modeFamily: "Plasma Loom",
    futurePhase: "v66+",
    safetyNotes: "Moderate risk, disabled under reduce motion",
  },
  {
    id: "treble-to-particle-sparkle",
    title: "Treble to Particle Sparkle",
    description: "High-frequency energy drives particle overlay sparkle",
    audioChannel: "treble",
    graphTarget: "graph.overlay.particles",
    motionSafetyEffectId: "gentle-particle-sparkle-2s",
    risk: "low",
    reducedMotionBehavior: "soften",
    epilepsyRisk: "possible",
    status: "future",
    modeFamily: "Plasma Loom",
    futurePhase: "v66+",
    safetyNotes: "Low risk, softened under reduce motion",
  },
  // Constellation Beat (2 entries)
  {
    id: "treble-to-label-glow",
    title: "Treble to Label Glow",
    description: "High-frequency energy drives label glow effects",
    audioChannel: "treble",
    graphTarget: "graph.label.glow",
    motionSafetyEffectId: "slow-border-glow-1s",
    risk: "low",
    reducedMotionBehavior: "soften",
    epilepsyRisk: "possible",
    status: "future",
    modeFamily: "Constellation Beat",
    futurePhase: "v66+",
    safetyNotes: "Low risk, softened under reduce motion",
  },
  {
    id: "beat-to-cluster-aura",
    title: "Beat to Cluster Aura",
    description: "Detected beat events drive cluster aura effects",
    audioChannel: "beat",
    graphTarget: "graph.cluster.aura",
    motionSafetyEffectId: "graph-shell-pulse",
    risk: "moderate",
    reducedMotionBehavior: "disable",
    epilepsyRisk: "possible",
    status: "future",
    modeFamily: "Constellation Beat",
    futurePhase: "v66+",
    safetyNotes: "Moderate risk, disabled under reduce motion",
  },
  // Signal Trace (2 entries)
  {
    id: "mid-to-edge-current-trace",
    title: "Mid to Edge Current (Trace)",
    description: "Mid-frequency energy drives edge path highlighting",
    audioChannel: "mid",
    graphTarget: "graph.path.highlight",
    motionSafetyEffectId: "edge-shimmer",
    risk: "moderate",
    reducedMotionBehavior: "disable",
    epilepsyRisk: "possible",
    status: "future",
    modeFamily: "Signal Trace",
    futurePhase: "v66+",
    safetyNotes: "Moderate risk, disabled under reduce motion",
  },
  {
    id: "beat-to-path-highlight",
    title: "Beat to Path Highlight",
    description: "Detected beat events drive path highlighting",
    audioChannel: "beat",
    graphTarget: "graph.path.highlight",
    motionSafetyEffectId: "edge-shimmer",
    risk: "moderate",
    reducedMotionBehavior: "disable",
    epilepsyRisk: "possible",
    status: "future",
    modeFamily: "Signal Trace",
    futurePhase: "v66+",
    safetyNotes: "Moderate risk, disabled under reduce motion",
  },
  // Spectral Debug (3 entries)
  {
    id: "bass-to-depth-architecture",
    title: "Bass to Depth Architecture",
    description: "Low-frequency energy drives architecture depth visualization",
    audioChannel: "bass",
    graphTarget: "graph.depth.architecture",
    motionSafetyEffectId: "slow-border-glow-2s",
    risk: "safe",
    reducedMotionBehavior: "allow",
    epilepsyRisk: "none",
    status: "future",
    modeFamily: "Spectral Debug",
    futurePhase: "v66+",
    safetyNotes: "Safe static depth visualization",
  },
  {
    id: "mid-to-depth-module",
    title: "Mid to Depth Module",
    description: "Mid-frequency energy drives module depth visualization",
    audioChannel: "mid",
    graphTarget: "graph.depth.module",
    motionSafetyEffectId: "slow-border-glow-2s",
    risk: "safe",
    reducedMotionBehavior: "allow",
    epilepsyRisk: "none",
    status: "future",
    modeFamily: "Spectral Debug",
    futurePhase: "v66+",
    safetyNotes: "Safe static depth visualization",
  },
  {
    id: "treble-to-depth-leaf",
    title: "Treble to Depth Leaf",
    description: "High-frequency energy drives leaf depth visualization",
    audioChannel: "treble",
    graphTarget: "graph.depth.leaf",
    motionSafetyEffectId: "slow-border-glow-2s",
    risk: "safe",
    reducedMotionBehavior: "allow",
    epilepsyRisk: "none",
    status: "future",
    modeFamily: "Spectral Debug",
    futurePhase: "v66+",
    safetyNotes: "Safe static depth visualization",
  },
  // Focus-Safe (2 entries)
  {
    id: "rms-to-signal-readout",
    title: "RMS to Signal Readout",
    description: "Root mean square amplitude drives static signal readout display",
    audioChannel: "rms",
    graphTarget: "static.signal.readout",
    motionSafetyEffectId: "static-signal-readout",
    risk: "safe",
    reducedMotionBehavior: "allow",
    epilepsyRisk: "none",
    status: "proposed-passive",
    modeFamily: "Focus-Safe",
    futurePhase: "v65+",
    safetyNotes: "Focus-safe static readout, always allowed",
  },
  {
    id: "silence-to-calm-indicator",
    title: "Silence to Calm Indicator",
    description: "Audio absence drives calm state indicator",
    audioChannel: "silence",
    graphTarget: "calm.state.indicator",
    motionSafetyEffectId: "static-signal-readout",
    risk: "safe",
    reducedMotionBehavior: "allow",
    epilepsyRisk: "none",
    status: "proposed-passive",
    modeFamily: "Focus-Safe",
    futurePhase: "v65+",
    safetyNotes: "Focus-safe calm indicator, always allowed",
  },
];

const listeners: Set<() => void> = new Set();

export const musicReactiveMappingRegistry: MusicReactiveMappingRegistryContract = {
  list: () => [...entries],
  getById: (id) => entries.find((e) => e.id === id),
  filterByCategory: ({ audioChannel, modeFamily, status, risk }) =>
    entries.filter((e) => {
      if (audioChannel !== undefined && e.audioChannel !== audioChannel) return false;
      if (modeFamily !== undefined && e.modeFamily !== modeFamily) return false;
      if (status !== undefined && e.status !== status) return false;
      if (risk !== undefined && e.risk !== risk) return false;
      return true;
    }),
  validateShape: (entry): entry is MusicReactiveMapping => {
    if (typeof entry !== "object" || entry === null) return false;
    const e = entry as any;
    return (
      typeof e.id === "string" &&
      typeof e.title === "string" &&
      typeof e.description === "string" &&
      typeof e.audioChannel === "string" &&
      typeof e.graphTarget === "string" &&
      typeof e.motionSafetyEffectId === "string" &&
      typeof e.risk === "string" &&
      typeof e.reducedMotionBehavior === "string" &&
      typeof e.epilepsyRisk === "string" &&
      typeof e.status === "string" &&
      typeof e.modeFamily === "string" &&
      typeof e.futurePhase === "string" &&
      typeof e.safetyNotes === "string"
    );
  },
  register: (entry) => {
    entries.push(entry);
    listeners.forEach((l) => l());
  },
  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

// Dev probe
if (
  typeof window !== "undefined" &&
  (import.meta.env.DEV || (window as any).PLAYWRIGHT)
) {
  (window as any).__lwMusicReactiveMappingRegistry = musicReactiveMappingRegistry;
}

// Backward-compatible helpers (used by GraphVisualInventoryPanel)
export function getAllMusicReactiveMappings(): MusicReactiveMapping[] {
  return musicReactiveMappingRegistry.list();
}

export function getMusicReactiveMappingById(id: string): MusicReactiveMapping | undefined {
  return musicReactiveMappingRegistry.getById(id);
}

export function getMappingsByAudioChannel(channel: AudioChannel): MusicReactiveMapping[] {
  return musicReactiveMappingRegistry.filterByCategory({ audioChannel: channel });
}

export function getMappingsByModeFamily(modeFamily: ModeFamily): MusicReactiveMapping[] {
  return musicReactiveMappingRegistry.filterByCategory({ modeFamily });
}

export function getMappingsByStatus(status: MappingStatus): MusicReactiveMapping[] {
  return musicReactiveMappingRegistry.filterByCategory({ status });
}

export function getMappingsByRisk(risk: MotionRiskLevel): MusicReactiveMapping[] {
  return musicReactiveMappingRegistry.filterByCategory({ risk });
}

export function getMusicReactiveMappingCount(): number {
  return musicReactiveMappingRegistry.list().length;
}

export function getModeFamilies(): ModeFamily[] {
  const families = new Set(musicReactiveMappingRegistry.list().map((m) => m.modeFamily));
  return Array.from(families);
}
