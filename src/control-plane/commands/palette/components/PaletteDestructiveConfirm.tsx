import type { CommandEntry } from "../../command.types";

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
        Run <strong>{command.label}</strong>? This cannot be undone.
      </p>
      <div className="palette-destructive-actions">
        <button
          className="palette-destructive-confirm-btn"
          data-testid="palette-destructive-confirm-btn"
          onClick={onConfirm}
          type="button"
        >
          Confirm
        </button>
        <button
          className="palette-destructive-cancel-btn"
          data-testid="palette-destructive-cancel-btn"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
