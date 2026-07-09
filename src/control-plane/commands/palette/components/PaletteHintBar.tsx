// SPDX-License-Identifier: Apache-2.0
import { t } from "../../../../i18n";

interface PaletteHintBarProps {
  hasSelection: boolean;
}

export function PaletteHintBar({ hasSelection }: PaletteHintBarProps) {
  return (
    <div className="palette-hint-bar" data-testid="palette-hint-bar">
      {hasSelection && (
        <>
          <span><kbd>↑↓</kbd> {t("palette.hintNavigate")}</span>
          <span><kbd>↵</kbd> {t("palette.hintExecute")}</span>
          <span><kbd>☆</kbd> {t("palette.hintPin")}</span>
        </>
      )}
      <span><kbd>Esc</kbd> {t("palette.hintClose")}</span>
    </div>
  );
}
