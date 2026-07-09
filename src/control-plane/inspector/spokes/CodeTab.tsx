// SPDX-License-Identifier: Apache-2.0
/**
 * Code Tab (v105.0.1)
 *
 * Renamed from IdeTab. The IDE spoke (real provenance/snippet feature) is
 * now the Code spoke. Shows source location + snippet for the inspected target,
 * with the open-in-editor link UNDER the snippet.
 */

import { getProvenance } from "../../../themes/provenanceRegistry";
import type { TargetDescriptor } from "../inspector.types";
import { t } from "../../../i18n";
import "../styles/color-tab.css";

export interface CodeTabProps {
  targetDescriptor: TargetDescriptor;
  onClose?: () => void;
}

export function CodeTab({ targetDescriptor, onClose }: CodeTabProps) {
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
    <div className="lw-ide-tab" data-testid="code-tab">
      <header className="lw-tab-header">
        <span className="lw-tab-target-id">{targetDescriptor.targetId}</span>
        {onClose && (
          <button onClick={onClose} aria-label={t("inspector.backLabel")} className="lw-tab-back-button">
            {t("inspector.back")}
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
          {/* Open-in-editor link is UNDER the snippet (v105.0.1 decision) */}
          <button
            className="lw-ide-open-button"
            onClick={handleOpenInIde}
            data-testid="open-in-ide-button"
          >
            {t("inspector.spokes.code.openInEditor")}
          </button>
        </section>
      ) : (
        <section className="lw-tab-empty" data-testid="code-empty">
          <p>{t("inspector.spokes.code.noProvenance")}</p>
          <p>{t("inspector.spokes.code.noProvenanceHint")}</p>
        </section>
      )}
    </div>
  );
}
