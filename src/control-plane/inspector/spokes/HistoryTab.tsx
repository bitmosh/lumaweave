// SPDX-License-Identifier: Apache-2.0
/**
 * History Tab (v86d.4)
 *
 * H1 model: shows current overrides for the inspected target.
 * Per-entry Reset and Reset-all affordances.
 * Derives overrides synchronously in render via useSyncExternalStore (matches useResolvedTargetColor pattern).
 */

import { useSyncExternalStore } from "react";
import {
  getTargetOverrides,
  removeTargetOverride,
} from "../../../themes/themeOverrideStorage";
import { notifyOverrideChange } from "../../../themes/useResolvedTargetColor";
import type { TargetDescriptor } from "../inspector.types";
import { t } from "../../../i18n";
import "../styles/color-tab.css";

const EVENT = "lw:override-change";

function subscribe(callback: () => void): () => void {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}

function getSnapshot(): number {
  return window.__lwOverrideVersion ?? 0;
}

export interface HistoryTabProps {
  targetDescriptor: TargetDescriptor;
  onClose?: () => void;
}

export function HistoryTab({ targetDescriptor, onClose }: HistoryTabProps) {
  // Subscribe to override changes; snapshot version triggers re-renders
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // DERIVE overrides synchronously in render — correct on first render,
  // re-derived whenever lw:override-change fires (via useSyncExternalStore subscription)
  const overrides = getTargetOverrides(targetDescriptor.targetId);

  const handleReset = (tokenPath: string) => {
    removeTargetOverride(targetDescriptor.targetId, tokenPath as any);
    notifyOverrideChange();
  };

  const handleResetAll = () => {
    for (const override of overrides) {
      removeTargetOverride(targetDescriptor.targetId, override.tokenPath);
    }
    notifyOverrideChange();
  };

  return (
    <div className="lw-history-tab" data-testid="history-tab">
      <header className="lw-tab-header">
        <span className="lw-tab-target-id">{targetDescriptor.targetId}</span>
        {onClose && (
          <button onClick={onClose} aria-label={t("inspector.backLabel")} className="lw-tab-back-button">
            {t("inspector.back")}
          </button>
        )}
      </header>

      {overrides.length === 0 ? (
        <section className="lw-tab-empty" data-testid="history-empty">
          <p>{t("inspector.spokes.history.noEdits")}</p>
        </section>
      ) : (
        <>
          <section className="lw-history-list" data-testid="history-list">
            {overrides.map((o) => (
              <div key={o.tokenPath} className="lw-history-row" data-testid={`history-row-${o.tokenPath}`}>
                <span className="lw-history-token-path">{o.tokenPath}</span>
                <span
                  className="lw-history-color-chip"
                  style={{
                    display: "inline-block",
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    backgroundColor:
                      typeof o.value === "string" ? o.value : "transparent",
                    border: "1px solid var(--lw-panel-border, rgba(255,179,71,0.32))",
                    marginInlineEnd: 6,
                    verticalAlign: "middle",
                  }}
                  aria-hidden="true"
                />
                <span className="lw-history-value">{String(o.value)}</span>
                {o.timestamp != null && (
                  <span className="lw-history-timestamp">
                    {new Date(o.timestamp).toLocaleTimeString()}
                  </span>
                )}
                <button
                  className="lw-history-reset-btn"
                  onClick={() => handleReset(o.tokenPath)}
                  data-testid={`reset-${o.tokenPath}`}
                >
                  {t("inspector.spokes.history.reset")}
                </button>
              </div>
            ))}
          </section>

          <button
            className="lw-history-reset-all"
            onClick={handleResetAll}
            data-testid="reset-all"
          >
            {t("inspector.spokes.history.resetAll")}
          </button>
        </>
      )}
    </div>
  );
}
