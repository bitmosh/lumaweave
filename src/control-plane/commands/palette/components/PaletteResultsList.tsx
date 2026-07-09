// SPDX-License-Identifier: Apache-2.0
import { useEffect, useRef } from "react";
import type { CommandEntry } from "../../command.types";
import type { PaletteSection, RankedCommandEntry } from "../palette.types";
import { PaletteSectionHeader } from "./PaletteSectionHeader";
import { PaletteResultRow } from "./PaletteResultRow";
import { t } from "../../../../i18n";

interface PaletteResultsListProps {
  sections: PaletteSection[];
  flatItems: RankedCommandEntry[];
  selectedIndex: number;
  getHotkey: (id: string) => string | undefined;
  onExecute: (item: RankedCommandEntry) => void;
  onPin: (id: string) => void;
  onRequestConfirm: (id: string) => void;
  suggestions: CommandEntry[];
}

export function PaletteResultsList({
  sections,
  flatItems,
  selectedIndex,
  getHotkey,
  onExecute,
  onPin,
  onRequestConfirm,
  suggestions,
}: PaletteResultsListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current?.querySelector("[data-selected='true']");
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (flatItems.length === 0 && suggestions.length === 0) {
    return (
      <div className="palette-empty" data-testid="palette-empty">
        {t("palette.noResults")}
      </div>
    );
  }

  let flatIdx = 0;

  return (
    <div
      ref={listRef}
      className="palette-results-list"
      data-testid="palette-results-list"
      role="listbox"
    >
      {sections.map((section) => (
        <div key={section.kind} className="palette-section">
          <PaletteSectionHeader label={section.label} />
          {section.items.map((item) => {
            const idx = flatIdx++;
            return (
              <PaletteResultRow
                key={item.command.id}
                item={item}
                isSelected={idx === selectedIndex}
                hotkey={getHotkey(item.command.id)}
                onExecute={onExecute}
                onPin={onPin}
                onRequestConfirm={onRequestConfirm}
              />
            );
          })}
        </div>
      ))}

      {suggestions.length > 0 && (
        <div className="palette-suggestions" data-testid="palette-suggestions">
          <PaletteSectionHeader label={t("palette.didYouMean")} />
          {suggestions.map((cmd) => (
            <PaletteResultRow
              key={cmd.id}
              item={{ command: cmd, rank: 0 }}
              isSelected={false}
              hotkey={getHotkey(cmd.id)}
              onExecute={onExecute}
              onPin={onPin}
              onRequestConfirm={onRequestConfirm}
            />
          ))}
        </div>
      )}
    </div>
  );
}
