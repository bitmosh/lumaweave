/**
 * Audio Source Registry
 *
 * A passive/read-only registry of audio source types for the music-reactive graph system.
 *
 * This registry defines the available audio sources, their status, permission boundaries,
 * privacy risks, and decoding requirements. Only the synthetic source is active in v66;
 * all other sources are future/locked/deferred.
 *
 * v66: Passive Audio Source Registry
 * - No microphone permission
 * - No file upload
 * - No audio playback
 * - No Web Audio input
 * - No graph/Sigma mutation
 * - No visual reactivity
 */

export type AudioSourceType =
  | "synthetic"
  | "local-file-metadata"
  | "local-file-decoded-signal"
  | "microphone"
  | "system-audio"
  | "streaming-source"
  | "external-adapter";

export type AudioSourceStatus =
  | "active-passive"
  | "active-reactive"
  | "future"
  | "locked"
  | "deferred"
  | "forbidden";

export type AudioSourcePermission =
  | "none"
  | "user-selected-file"
  | "explicit-browser-permission"
  | "os-browser-dependent"
  | "network"
  | "adapter-defined";

export type PrivacyRisk =
  | "none"
  | "low"
  | "moderate"
  | "high";

export type PlaybackStatus =
  | "forbidden"
  | "not-required"
  | "future"
  | "locked-until-contracted";

export type DecodingStatus =
  | "not-required"
  | "forbidden-in-v66"
  | "forbidden"
  | "future"
  | "deferred";

export type VisualOutputStatus =
  | "deferred"
  | "forbidden"
  | "future";

export interface AudioSource {
  id: string;
  type: AudioSourceType;
  title: string;
  description: string;
  status: AudioSourceStatus;
  permission: AudioSourcePermission;
  privacyRisk: PrivacyRisk;
  playback: PlaybackStatus;
  decoding: DecodingStatus;
  visualOutput: VisualOutputStatus;
  motionSafetyEffectId?: string;
  safetyNotes?: string;
}

export const AUDIO_SOURCES: AudioSource[] = [
  {
    id: "synthetic-signal-source",
    type: "synthetic",
    title: "Synthetic Signal Source",
    description: "Deterministic, static audio signal models defined in code (SYNTHETIC_SIGNALS). No microphone, file upload, or Web Audio API required.",
    status: "active-passive",
    permission: "none",
    privacyRisk: "none",
    playback: "not-required",
    decoding: "not-required",
    visualOutput: "deferred",
    safetyNotes: "Safe by design - no user data, no privacy risk, no motion safety concerns.",
  },
  {
    id: "local-file-metadata-source",
    type: "local-file-metadata",
    title: "Local File Metadata Source",
    description: "User-selected audio file for metadata extraction only (duration, format, sample rate). No signal decoding, no playback.",
    status: "future",
    permission: "user-selected-file",
    privacyRisk: "low",
    playback: "forbidden",
    decoding: "forbidden-in-v66",
    visualOutput: "deferred",
    safetyNotes: "Low risk - metadata only, no signal content exposed to graph. Deferred to v67+ after file picker UI and metadata extraction contract.",
  },
  {
    id: "local-file-decoded-signal-source",
    type: "local-file-decoded-signal",
    title: "Local File Decoded Signal Source",
    description: "User-selected audio file with full signal decoding for music-reactive mapping. Requires file validation, decoding, and safety gate.",
    status: "locked",
    permission: "user-selected-file",
    privacyRisk: "moderate",
    playback: "locked-until-contracted",
    decoding: "future",
    visualOutput: "deferred",
    safetyNotes: "Moderate risk - file content exposed to graph, requires Motion Safety gate enforcement. Locked until safety gate and governance approval (v67+).",
  },
  {
    id: "microphone-input-source",
    type: "microphone",
    title: "Microphone Input Source",
    description: "Real-time audio input from user microphone via Web Audio API. Requires explicit browser permission, explicit opt-in, and safety gate.",
    status: "locked",
    permission: "explicit-browser-permission",
    privacyRisk: "high",
    playback: "forbidden",
    decoding: "future",
    visualOutput: "deferred",
    safetyNotes: "High risk - real-time audio capture, requires Motion Safety gate, epilepsy risk assessment, and explicit user consent. Locked until safety gate, governance approval, and advisory approval (v67+).",
  },
  {
    id: "system-audio-source",
    type: "system-audio",
    title: "System Audio Source",
    description: "Audio output from operating system or other applications. Requires OS/browser-dependent permissions and has high privacy risk.",
    status: "deferred",
    permission: "os-browser-dependent",
    privacyRisk: "high",
    playback: "forbidden",
    decoding: "deferred",
    visualOutput: "deferred",
    safetyNotes: "High risk - system audio capture, requires strong governance and likely forbidden. Deferred/forbidden pending architecture and governance review.",
  },
  {
    id: "streaming-source",
    type: "streaming-source",
    title: "Streaming Source",
    description: "Remote audio data received over network (e.g., streaming services, radio). Requires network permissions and may involve tracking.",
    status: "deferred",
    permission: "network",
    privacyRisk: "moderate",
    playback: "forbidden",
    decoding: "deferred",
    visualOutput: "deferred",
    safetyNotes: "Moderate risk - remote audio, requires governance and tracking policy. Deferred/forbidden pending architecture and governance review.",
  },
  {
    id: "external-adapter-source",
    type: "external-adapter",
    title: "External Adapter Source",
    description: "Audio data provided by third-party adapter or plugin. Permission and privacy models are adapter-defined.",
    status: "future",
    permission: "adapter-defined",
    privacyRisk: "low",
    playback: "forbidden",
    decoding: "deferred",
    visualOutput: "deferred",
    safetyNotes: "Risk depends on adapter implementation, requires adapter contract and governance. Future after adapter contract and governance framework.",
  },
];

export function getAllAudioSources(): AudioSource[] {
  return AUDIO_SOURCES;
}

export function getAudioSourceById(id: string): AudioSource | undefined {
  return AUDIO_SOURCES.find((source) => source.id === id);
}

export function getAudioSourcesByType(type: AudioSourceType): AudioSource[] {
  return AUDIO_SOURCES.filter((source) => source.type === type);
}

export function getAudioSourcesByStatus(status: AudioSourceStatus): AudioSource[] {
  return AUDIO_SOURCES.filter((source) => source.status === status);
}
