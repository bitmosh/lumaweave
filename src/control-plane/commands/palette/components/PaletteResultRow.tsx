import type { RankedCommandEntry } from "../palette.types";
import { isPinned } from "../palettePersistence";
import { t } from "../../../../i18n";

interface PaletteResultRowProps {
  item: RankedCommandEntry;
  isSelected: boolean;
  hotkey?: string;
  onExecute: (item: RankedCommandEntry) => void;
  onPin: (id: string) => void;
  onRequestConfirm: (id: string) => void;
}

export function PaletteResultRow({
  item,
  isSelected,
  hotkey,
  onExecute,
  onPin,
  onRequestConfirm,
}: PaletteResultRowProps) {
  const { command } = item;
  const pinned = isPinned(command.id);

  const handleClick = () => {
    if (command.destructive) {
      onRequestConfirm(command.id);
    } else {
      onExecute(item);
    }
  };

  return (
    <div
      className={`palette-result-row${isSelected ? " palette-result-row--selected" : ""}${command.destructive ? " palette-result-row--destructive" : ""}`}
      data-testid={`palette-result-${command.id}`}
      data-selected={isSelected}
      onClick={handleClick}
      role="option"
      aria-selected={isSelected}
    >
      <div className="palette-result-main">
        <span className="palette-result-label">{t(`commands.${command.id.replace(/\./g, "_")}`) || command.label}</span>
        {command.description && (
          <span className="palette-result-desc">{command.description}</span>
        )}
      </div>
      <div className="palette-result-actions">
        {hotkey && (
          <kbd className="palette-result-hotkey" data-testid={`palette-hotkey-${command.id}`}>
            {hotkey}
          </kbd>
        )}
        <button
          className={`palette-pin-btn${pinned ? " palette-pin-btn--active" : ""}`}
          data-testid={`palette-pin-${command.id}`}
          onClick={(e) => { e.stopPropagation(); onPin(command.id); }}
          type="button"
          aria-label={pinned ? t("palette.unpinLabel") : t("palette.pinLabel")}
        >
          {pinned ? "★" : "☆"}
        </button>
      </div>
    </div>
  );
}
