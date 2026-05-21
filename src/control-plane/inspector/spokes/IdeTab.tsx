/**
 * IDE Tab (v86d.5)
 *
 * Shows source location + snippet for the inspected target via provenanceRegistry.
 * v86d.4 always showed empty state; v86d.5 shows actual code context.
 * Dispatches inspector:open-in-ide event on button click.
 */

import { getProvenance } from "../../../themes/provenanceRegistry";
import type { TargetDescriptor } from "../inspector.types";
import "../styles/color-tab.css";

export interface IdeTabProps {
  targetDescriptor: TargetDescriptor;
  onClose?: () => void;
}

export function IdeTab({ targetDescriptor, onClose }: IdeTabProps) {
  const provenance = getProvenance(targetDescriptor.targetId);

  const handleOpenInIde = () => {
    if (!provenance) return;
    window.dispatchEvent(
      new CustomEvent("inspector:open-in-ide", {
        detail: {
          filePath: provenance.filePath,
          lineNumber: provenance.startLine,
        },
      }),
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

      {provenance ? (
        <section className="lw-ide-source-info" data-testid="source-info">
          <div className="lw-ide-source-path">
            {provenance.filePath}:{provenance.startLine}
          </div>
          <pre className="lw-ide-snippet" data-testid="snippet">
            <code>{provenance.snippet}</code>
          </pre>
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
          <p>No provenance data found for this target.</p>
          <p>Regenerate the manifest with `npm run generate-provenance` if you recently added this target.</p>
        </section>
      )}
    </div>
  );
}
