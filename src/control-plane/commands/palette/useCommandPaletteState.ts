// SPDX-License-Identifier: Apache-2.0
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { commandRegistry } from "../command-registry";
import type { CategoryFilter, PaletteSection, RankedCommandEntry } from "./palette.types";
import { readPersistedState, recordExecution, togglePin } from "./palettePersistence";
import { buildIdleSections, searchCommands } from "./paletteSearch";
import { findSuggestions } from "./paletteSuggestions";

type Subscriber = () => void;

// Module-level singleton — shared across all instances
const subscribers = new Set<Subscriber>();
let _isOpen = false;

export const paletteController = {
  open(): void {
    _isOpen = true;
    subscribers.forEach((fn) => fn());
  },
  close(): void {
    _isOpen = false;
    subscribers.forEach((fn) => fn());
  },
  toggle(): void {
    _isOpen ? paletteController.close() : paletteController.open();
  },
  isOpen(): boolean {
    return _isOpen;
  },
  subscribe(fn: Subscriber): () => void {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  },
};

export interface CommandPaletteState {
  isOpen: boolean;
  query: string;
  filter: CategoryFilter;
  sections: PaletteSection[];
  flatItems: RankedCommandEntry[];
  selectedIndex: number;
  suggestions: import("../command.types").CommandEntry[];
  confirmingId: string | null;

  setQuery: (q: string) => void;
  setFilter: (f: CategoryFilter) => void;
  selectIndex: (i: number) => void;
  moveSelection: (delta: number) => void;
  executeSelected: () => void;
  executeItem: (item: RankedCommandEntry) => void;
  pinItem: (id: string) => void;
  requestConfirm: (id: string) => void;
  cancelConfirm: () => void;
  close: () => void;
}

export function useCommandPaletteState(): CommandPaletteState {
  const [, forceRender] = useReducer((n: number) => n + 1, 0);
  const [query, setQueryRaw] = useState("");
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [, persistedTick] = useReducer((n: number) => n + 1, 0);
  const focusTargetRef = useRef<Element | null>(null);

  useEffect(() => {
    if (_isOpen) {
      focusTargetRef.current = document.activeElement;
    }
    return paletteController.subscribe(() => forceRender());
  }, []);

  const commands = commandRegistry.getAll();
  const persisted = readPersistedState();

  let sections: PaletteSection[];
  let suggestions: import("../command.types").CommandEntry[] = [];

  if (query.trim()) {
    const results = searchCommands(query, commands, filter);
    sections = results.length > 0
      ? [{ kind: "search", label: "Results", items: results }]
      : [];
    if (results.length === 0) {
      suggestions = findSuggestions(query, [...commands]);
    }
  } else {
    sections = buildIdleSections(commands, persisted);
  }

  const flatItems = sections.flatMap((s) => s.items);

  const setQuery = useCallback((q: string) => {
    setQueryRaw(q);
    setSelectedIndex(0);
    setConfirmingId(null);
  }, []);

  const selectIndex = useCallback((i: number) => {
    setSelectedIndex(Math.max(0, Math.min(i, flatItems.length - 1)));
  }, [flatItems.length]);

  const moveSelection = useCallback((delta: number) => {
    setSelectedIndex((prev) => {
      const next = prev + delta;
      if (next < 0) return flatItems.length - 1;
      if (next >= flatItems.length) return 0;
      return next;
    });
  }, [flatItems.length]);

  const close = useCallback(() => {
    paletteController.close();
    setQueryRaw("");
    setFilter("all");
    setSelectedIndex(0);
    setConfirmingId(null);
    // Restore focus
    if (focusTargetRef.current instanceof HTMLElement) {
      focusTargetRef.current.focus();
    }
  }, []);

  const executeItem = useCallback((item: RankedCommandEntry) => {
    const cmd = item.command;
    if (cmd.destructive) {
      setConfirmingId(cmd.id);
      return;
    }
    recordExecution(cmd.id);
    persistedTick();
    close();
    cmd.execute();
  }, [close, persistedTick]);

  const executeSelected = useCallback(() => {
    const item = flatItems[selectedIndex];
    if (item) executeItem(item);
  }, [flatItems, selectedIndex, executeItem]);

  const pinItem = useCallback((id: string) => {
    togglePin(id);
    persistedTick();
  }, [persistedTick]);

  const requestConfirm = useCallback((id: string) => {
    setConfirmingId(id);
  }, []);

  const cancelConfirm = useCallback(() => {
    setConfirmingId(null);
  }, []);

  return {
    isOpen: _isOpen,
    query,
    filter,
    sections,
    flatItems,
    selectedIndex,
    suggestions,
    confirmingId,
    setQuery,
    setFilter,
    selectIndex,
    moveSelection,
    executeSelected,
    executeItem,
    pinItem,
    requestConfirm,
    cancelConfirm,
    close,
  };
}
