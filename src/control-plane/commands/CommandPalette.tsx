import { useEffect } from "react";
import { hotkeyRegistry } from "../hotkeys/hotkey-registry";
import { formatBinding } from "../hotkeys/hotkey-utils";
import { commandRegistry } from "./command-registry";
import { recordExecution } from "./palette/palettePersistence";
import type { RankedCommandEntry } from "./palette/palette.types";
import type { CommandPaletteState } from "./palette/useCommandPaletteState";
import { PaletteSearchInput } from "./palette/components/PaletteSearchInput";
import { PaletteCategoryChips } from "./palette/components/PaletteCategoryChips";
import { PaletteResultsList } from "./palette/components/PaletteResultsList";
import { PaletteHintBar } from "./palette/components/PaletteHintBar";
import { PaletteDestructiveConfirm } from "./palette/components/PaletteDestructiveConfirm";

interface CommandPaletteProps {
  state: CommandPaletteState;
}

function getHotkey(commandId: string): string | undefined {
  const entry = hotkeyRegistry.getActiveByCommandId(commandId);
  return entry ? formatBinding(entry.binding) : undefined;
}

export function CommandPalette({ state }: CommandPaletteProps) {
  const {
    query,
    filter,
    sections,
    flatItems,
    selectedIndex,
    suggestions,
    confirmingId,
    setQuery,
    setFilter,
    moveSelection,
    executeSelected,
    executeItem,
    pinItem,
    requestConfirm,
    cancelConfirm,
    close,
  } = state;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) close();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!state.isOpen) return;
      if (e.key === "Escape") { e.preventDefault(); close(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.isOpen, close]);

  const confirmingCommand = confirmingId
    ? commandRegistry.getById(confirmingId)
    : undefined;

  return (
    <div
      className="palette-backdrop"
      data-testid="palette-backdrop"
      onClick={handleBackdropClick}
    >
      <div
        className="palette-shell"
        data-testid="palette-shell"
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
      >
        <PaletteSearchInput
          value={query}
          onChange={setQuery}
          onEscape={close}
          onArrowDown={() => moveSelection(1)}
          onArrowUp={() => moveSelection(-1)}
          onEnter={executeSelected}
        />

        <PaletteCategoryChips active={filter} onChange={setFilter} />

        {confirmingId && confirmingCommand ? (
          <PaletteDestructiveConfirm
            command={confirmingCommand}
            onConfirm={() => {
              recordExecution(confirmingId);
              cancelConfirm();
              close();
              confirmingCommand.execute();
            }}
            onCancel={cancelConfirm}
          />
        ) : (
          <PaletteResultsList
            sections={sections}
            flatItems={flatItems}
            selectedIndex={selectedIndex}
            getHotkey={getHotkey}
            onExecute={(item: RankedCommandEntry) => executeItem(item)}
            onPin={pinItem}
            onRequestConfirm={requestConfirm}
            suggestions={suggestions}
          />
        )}

        <PaletteHintBar hasSelection={flatItems.length > 0} />
      </div>
    </div>
  );
}
