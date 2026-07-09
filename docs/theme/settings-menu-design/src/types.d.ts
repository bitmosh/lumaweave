// SPDX-License-Identifier: Apache-2.0
/**
 * types.d.ts — Bandit handoff reference.
 *
 * Public interfaces of the Settings menu components, lifted out of the
 * prototype's .tsx files so Bandit can read them without scrolling.
 *
 * NOTE: this is reference material. The interfaces are also declared
 * (and used) inline at the top of each component file in src/. Keep both
 * in sync — or delete this file once Bandit lands the real components.
 */

/* ─── Shared scalar types ────────────────────────────────────────────── */
export type PanelPosition = 'floating' | 'docked-left' | 'docked-right' | 'minimized';
export type SaveState     = 'synced' | 'stale' | 'diff' | 'live';
export type OverrideScope = 'global' | 'target' | 'target-kind' | 'cluster';
export type CategoryId =
  | 'theme' | 'typography' | 'graph' | 'inspector'
  | 'data-sources' | 'display' | 'accessibility' | 'advanced';
export type WcagLevel     = 'AA-normal' | 'AAA-normal' | 'AA-large';
export type RowMatchLevel = 'AAA'|'AA'|'AA-large'|'fail';

/* ─── Theme tokens ────────────────────────────────────────────────────── */
export interface ThemePalette {
  id: string;
  name: string;
  mood: string;
  wcag: 'AAA' | 'AA' | 'partial';
  vars: Record<string, string>;
  thumb: { bg: [string, string]; nodes: string[]; edge: string };
  contrastPairs: Array<{
    label: string; fg: string; bg: string; ratio: number; level: RowMatchLevel;
  }>;
}

/* ─── Override storage ────────────────────────────────────────────────── */
export interface ThemeOverride {
  id: string;
  path: string;
  scope: OverrideScope;
  scopeLabel: string;
  value: string;
  chip: string | null;
  defaultValue: string;
}

/* ─── Drama factor registry ───────────────────────────────────────────── */
export interface DramaFactor {
  id: string;
  label: string;
  description: string;
  range: [number, number];
  default: number;
  value: number;
  unit: string;
  source: null | 'audio.tempo' | 'graph.activity' | 'system.load';
}

/* ─── Category definition ─────────────────────────────────────────────── */
export interface CategoryDef {
  id: CategoryId;
  label: string;
  description: string;
  iconPath: string; // 16x16 SVG path
}

/* ─── Component props ─────────────────────────────────────────────────── */
export interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  initialRect?: { left: number; top: number; width: number; height: number };
  onPositionChange?: (p: PanelPosition) => void;
  opacity: number;
  headerSlot?: React.ReactNode;
  sidebarSlot: React.ReactNode;
  contentSlot: React.ReactNode;
  statusBarSlot: React.ReactNode;
}

export interface SettingsSidebarProps {
  categories: readonly CategoryDef[];
  activeId: CategoryId;
  collapsed: boolean;
  matchCounts: Record<string, number> | null;
  onSelect: (id: CategoryId) => void;
}

export interface SettingsContentProps {
  title: string;
  description: string;
  search: string;
  children: React.ReactNode;
}

export interface SettingsSubSectionProps {
  id: string;
  label: string;
  defaultCollapsed?: boolean;
  count?: string | number;
  children: React.ReactNode;
}

export interface SettingsSearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

/* ─── Row primitives ──────────────────────────────────────────────────── */
export interface SettingsRowBaseProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  isModified?: boolean;
  onReset?: () => void;
  isSearchMatch?: boolean;
  children: React.ReactNode;
  block?: boolean;
  placeholder?: boolean;
}

export interface ToggleRowProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  value: boolean;
  defaultValue?: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  isSearchMatch?: boolean;
  placeholder?: boolean;
}

export interface SliderRowProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  value: number;
  defaultValue: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  format?: (v: number) => string;
  onChange: (v: number) => void;
  isSearchMatch?: boolean;
}

export interface SegmentedRowProps<T extends string> {
  label: React.ReactNode;
  description?: React.ReactNode;
  value: T;
  defaultValue: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
  isSearchMatch?: boolean;
}

export interface SelectRowProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  value: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
  isSearchMatch?: boolean;
}

export interface ButtonRowProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  buttonLabel: string;
  danger?: boolean;
  onClick: () => void;
  isSearchMatch?: boolean;
}

export interface DisplayRowProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  value: React.ReactNode;
  isSearchMatch?: boolean;
}

export interface PlaceholderRowProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  comingIn: string; // e.g. "v95"
  isSearchMatch?: boolean;
}

/* ─── Status bar ──────────────────────────────────────────────────────── */
export interface SettingsStatusBarProps {
  position: PanelPosition;
  saveState: SaveState;
  saveDiff?: { added: number; removed: number; changed: number };
  opacity: number;
  onOpacityChange: (v: number) => void;
}

/** Apply the opacity-layer scaling to a panel root element.
 *  bg scales 0→1 linearly. chrome scales 0.6→1. text stays at 1. */
export declare function applyOpacityLayers(root: HTMLElement, slider: number): void;
