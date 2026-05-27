import type { CommandEntry } from "../../command.types";
import { t } from "../../../../i18n";

interface PaletteDestructiveConfirmProps {
  command: CommandEntry;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PaletteDestructiveConfirm({
  command,
  onConfirm,
  onCancel,
}: PaletteDestructiveConfirmProps) {
  return (
    <div className="palette-destructive-confirm" data-testid="palette-destructive-confirm">
      <p className="palette-destructive-label">
        {t("palette.confirmRun", { label: command.label })}
      </p>
      <div className="palette-destructive-actions">
        <button
          className="palette-destructive-confirm-btn"
          data-testid="palette-destructive-confirm-btn"
          onClick={onConfirm}
          type="button"
        >
          {t("palette.confirmButton")}
        </button>
        <button
          className="palette-destructive-cancel-btn"
          data-testid="palette-destructive-cancel-btn"
          onClick={onCancel}
          type="button"
        >
          {t("palette.cancelButton")}
        </button>
      </div>
    </div>
  );
}
