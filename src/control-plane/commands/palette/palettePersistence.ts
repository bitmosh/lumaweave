// SPDX-License-Identifier: Apache-2.0
import type { PalettePersistedState } from "./palette.types";

const STORAGE_KEY = "lumaweave.commandPalette.v1";
const MAX_RECENT = 20;

const EMPTY: PalettePersistedState = { pinned: [], recent: [] };

export function readPersistedState(): PalettePersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<PalettePersistedState>;
    return {
      pinned: Array.isArray(parsed.pinned) ? parsed.pinned : [],
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
    };
  } catch {
    return EMPTY;
  }
}

export function writePersistedState(state: PalettePersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable in some environments
  }
}

export function recordExecution(id: string): void {
  const state = readPersistedState();
  const recent = [id, ...state.recent.filter((r) => r !== id)].slice(0, MAX_RECENT);
  writePersistedState({ ...state, recent });
}

export function togglePin(id: string): void {
  const state = readPersistedState();
  const pinned = state.pinned.includes(id)
    ? state.pinned.filter((p) => p !== id)
    : [...state.pinned, id];
  writePersistedState({ ...state, pinned });
}

export function isPinned(id: string): boolean {
  return readPersistedState().pinned.includes(id);
}
