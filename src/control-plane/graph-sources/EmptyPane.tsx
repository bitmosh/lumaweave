// SPDX-License-Identifier: Apache-2.0
import "./EmptyPane.css";

interface EmptyPaneProps {
  onOpenPicker: () => void;
  hasRecents?: boolean;
  onOpenRecent?: () => void;
}

export function EmptyPane({ onOpenPicker, hasRecents, onOpenRecent }: EmptyPaneProps) {
  return (
    <div className="lw-empty-pane" data-testid="graph-sources-empty-pane">
      <div className="lw-empty-pane__icon" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="28" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="20" cy="28" r="4" stroke="currentColor" strokeWidth="1.5" />
          <line x1="16" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="14" y1="15" x2="18" y2="25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="26" y1="15" x2="22" y2="25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="lw-empty-pane__label">No graph source selected</p>
      <button
        className="lw-empty-pane__cta"
        onClick={onOpenPicker}
        data-testid="graph-sources-open-picker-btn"
      >
        Select graph source
      </button>
      {hasRecents && onOpenRecent && (
        <button
          className="lw-empty-pane__secondary"
          onClick={onOpenRecent}
          data-testid="graph-sources-open-recent-btn"
        >
          Open a recent source
        </button>
      )}
    </div>
  );
}
