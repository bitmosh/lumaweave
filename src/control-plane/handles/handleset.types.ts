// SPDX-License-Identifier: Apache-2.0
/**
 * Handleset Type Definitions
 * 
 * This file defines the core types for the machine-readable handleset registry.
 * The registry serves as documentation and scaffolding for future tooling.
 */

export type HandleStatus =
  | "active" // Handle visibly affects runtime behavior
  | "partial" // Handle is defined but not fully wired or behavior is uncertain
  | "planned" // Handle is defined in schema/registry but marked as future work
  | "deprecated" // Handle is obsolete
  | "retired" // Handle was removed from schema but kept for documentation
  | "internal" // Handle used internally, not user-facing
  | "experimental"; // Handle in early development, unstable

export type HandleControlType =
  | "range" // Slider with min/max
  | "select" // Dropdown selection
  | "color" // Color picker
  | "checkbox" // Boolean toggle
  | "text" // Text input
  | "internal"; // Internal state, no UI control

export type HandleCategory =
  | "Appearance"
  | "Graph View"
  | "Labels"
  | "Evidence"
  | "Source Linking"
  | "Performance"
  | "Developer"
  | "Mission Control"
  | "Theme"
  | "Layout"
  | "Internal";

export interface HandlesetRuntimeBinding {
  /** Source file where the handle is defined */
  sourceFile: string;
  /** Function or component that applies the handle value */
  runtimeTarget: string;
  /** Whether changes apply immediately without restart */
  liveUpdate: boolean;
  /** Any additional binding notes */
  notes?: string;
}

export interface HandlesetQAReference {
  /** QA checklist ID that validates this handle */
  checklistId?: string;
  /** Playwright test file that tests this handle */
  playwrightTest?: string;
  /** Manual QA notes */
  manualQA?: string;
}

export interface HandlesetEntry {
  /** Unique handle identifier (e.g., "labels.nodeLabelMode") */
  handle: string;
  /** Human-readable label */
  label: string;
  /** Handle category */
  category: HandleCategory;
  /** Default value */
  defaultValue: any;
  /** UI control type */
  controlType: HandleControlType;
  /** Handle status */
  status: HandleStatus;
  /** Runtime binding information */
  binding?: HandlesetRuntimeBinding;
  /** QA reference information */
  qa?: HandlesetQAReference;
  /** Additional notes */
  notes?: string;
  /** When the handle was retired (for status="retired") */
  retiredAt?: string;
  /** Reason for retirement (for status="retired") */
  retiredReason?: string;
}

export interface HandlesetRegistry {
  /** All handleset entries */
  entries: HandlesetEntry[];
  /** Registry version */
  version: string;
  /** Last updated timestamp */
  updatedAt: string;
}
