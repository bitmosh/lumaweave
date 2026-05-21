/**
 * IDE Tab (v86d.4)
 *
 * Shows source location for the inspected target when available.
 * Dispatches inspector:open-in-ide event on button click.
 * v86d.5 upgrades with provenance-based code snippets.
 */

import { getThemeTargetById } from "../../../themes/themeTargetRegistry";
import type { TargetDescriptor } from "../inspector.types";
import "../styles/color-tab.css";

export interface IdeTabProps {
  targetDescriptor: TargetDescriptor;
  onClose?: () => void;
}

export function IdeTab({ targetDescriptor, onClose }: IdeTabProps) {
  const targetEntry = getThemeTargetById(targetDescriptor.targetId);
  // Source location not yet recorded — provenance system arrives in v86d.5
  const sourceLocation = (targetEntry as any)?.sourceLocation as
    | { filePath: string; lineNumber?: number }
    | undefined;

  const handleOpenInIde = () => {
    if (!sourceLocation) return;
    window.dispatchEvent(
      new CustomEvent("inspector:open-in-ide", { detail: sourceLocation }),
    );
  };

  return (
    <div className="lw-ide-tab" data-testid="ide-tab">
      <header className="lw-tab-header">
        <span className="lw-tab-target-id">{targetDescriptor.targetId}</span>
        {onClose && (
          <button onClick={onClose} aria-label="back" className="lw-tab-back-button">
            ← back
          </button>
        )}
      </header>

      {sourceLocation ? (
        <section className="lw-ide-source-info" data-testid="source-info">
          <div className="lw-ide-source-path">
            {sourceLocation.filePath}
            {sourceLocation.lineNumber != null && `:${sourceLocation.lineNumber}`}
          </div>
          <button
            className="lw-ide-open-button"
            onClick={handleOpenInIde}
            data-testid="open-in-ide-button"
          >
            Open in editor
          </button>
        </section>
      ) : (
        <section className="lw-tab-empty" data-testid="ide-empty">
          <p>Source location not recorded for this target.</p>
          <p>Provenance system arrives in v86d.5 — code snippets will display here.</p>
        </section>
      )}
    </div>
  );
}
