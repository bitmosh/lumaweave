/**
 * Synthetic Audio Signal
 *
 * Deterministic, static audio signal model for development and Playwright testing.
 * No real audio input, no microphone, no Web Audio API, no playback.
 *
 * v62: Synthetic Audio Signal Preview - static/read-only, deterministic values
 */

export interface AudioSignal {
  rms: number;        // 0 to 1
  bass: number;       // 0 to 1
  mid: number;        // 0 to 1
  treble: number;     // 0 to 1
  beat: number;       // 0 to 1
  silence: number;    // 0 to 1
  tempo: number;      // 60 to 200
}

export interface SyntheticAudioSignal {
  id: string;
  title: string;
  description: string;
  channels: AudioSignal;
  deterministic: true;
  source: "synthetic";
  visualOutputStatus: "deferred";
  motionSafetyStatus: "required-before-visual-output";
}

// Synthetic signal presets - all values are static and deterministic
export const SYNTHETIC_SIGNALS: SyntheticAudioSignal[] = [
  {
    id: "silence",
    title: "Silence",
    description: "Complete silence with no audio activity",
    channels: {
      rms: 0,
      bass: 0,
      mid: 0,
      treble: 0,
      beat: 0,
      silence: 1,
      tempo: 60,
    },
    deterministic: true,
    source: "synthetic",
    visualOutputStatus: "deferred",
    motionSafetyStatus: "required-before-visual-output",
  },
  {
    id: "lantern-pulse-demo",
    title: "Lantern Pulse Demo",
    description: "Low-energy synthetic signal for lantern pulse effect demo",
    channels: {
      rms: 0.15,
      bass: 0.2,
      mid: 0.1,
      treble: 0.05,
      beat: 0.3,
      silence: 0.7,
      tempo: 80,
    },
    deterministic: true,
    source: "synthetic",
    visualOutputStatus: "deferred",
    motionSafetyStatus: "required-before-visual-output",
  },
  {
    id: "plasma-loom-demo",
    title: "Plasma Loom Demo",
    description: "Medium-energy synthetic signal for plasma loom effect demo",
    channels: {
      rms: 0.45,
      bass: 0.5,
      mid: 0.4,
      treble: 0.35,
      beat: 0.6,
      silence: 0.4,
      tempo: 120,
    },
    deterministic: true,
    source: "synthetic",
    visualOutputStatus: "deferred",
    motionSafetyStatus: "required-before-visual-output",
  },
  {
    id: "constellation-demo",
    title: "Constellation Demo",
    description: "High-energy synthetic signal for constellation effect demo",
    channels: {
      rms: 0.75,
      bass: 0.8,
      mid: 0.7,
      treble: 0.6,
      beat: 0.85,
      silence: 0.15,
      tempo: 160,
    },
    deterministic: true,
    source: "synthetic",
    visualOutputStatus: "deferred",
    motionSafetyStatus: "required-before-visual-output",
  },
];

export function getAllSyntheticSignals(): SyntheticAudioSignal[] {
  return SYNTHETIC_SIGNALS;
}

export function getSyntheticSignalById(id: string): SyntheticAudioSignal | undefined {
  return SYNTHETIC_SIGNALS.find((signal) => signal.id === id);
}

export function getSyntheticSignalCount(): number {
  return SYNTHETIC_SIGNALS.length;
}
