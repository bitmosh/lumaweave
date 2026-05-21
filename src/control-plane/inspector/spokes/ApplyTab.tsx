/**
 * Apply Tab (v86d.4)
 *
 * Copies current overrides of the inspected target to selected candidates.
 * Candidates sourced from runAndRecordThemeTargetProbe() DOM scan.
 */

import { useEffect, useState } from "react";
import { runAndRecordThemeTargetProbe } from "../../../themes/themeTargetHeuristics";
import type { ThemeTargetProbeCandidate } from "../../../themes/themeTargetHeuristics";
import {
  getTargetOverrides,
  setTargetOverride,
} from "../../../themes/themeOverrideStorage";
import { notifyOverrideChange } from "../../../themes/useResolvedTargetColor";
import type { TargetDescriptor } from "../inspector.types";
import "../styles/color-tab.css";

export interface ApplyTabProps {
  targetDescriptor: TargetDescriptor;
  onClose?: () => void;
}

export function ApplyTab({ targetDescriptor, onClose }: ApplyTabProps) {
  const [candidates, setCandidates] = useState<ThemeTargetProbeCandidate[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const result = runAndRecordThemeTargetProbe();
    // Filter out the inspected target itself
    const filtered = result.candidates.filter(
      (c) => c.dataTestId !== targetDescriptor.targetId && c.descriptor !== targetDescriptor.targetId,
    );
    setCandidates(filtered);
    setSelectedIds(new Set());
  }, [targetDescriptor.targetId]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(candidates.map((c) => c.descriptor)));
  const selectNone = () => setSelectedIds(new Set());

  const handleApplySelected = () => {
    const currentOverrides = getTargetOverrides(targetDescriptor.targetId);
    if (currentOverrides.length === 0 || selectedIds.size === 0) return;
    for (const candidateId of selectedIds) {
      for (const override of currentOverrides) {
        setTargetOverride(candidateId, override.tokenPath, override.value);
      }
    }
    notifyOverrideChange();
  };

  return (
    <div className="lw-apply-tab" data-testid="apply-tab">
      <header className="lw-tab-header">
        <span className="lw-tab-target-id">{targetDescriptor.targetId}</span>
        {onClose && (
          <button onClick={onClose} aria-label="back" className="lw-tab-back-button">
            ← back
          </button>
        )}
      </header>

      {candidates.length === 0 ? (
        <section className="lw-tab-empty" data-testid="apply-empty">
          <p>No similar targets found.</p>
        </section>
      ) : (
        <>
          <div className="lw-apply-select-controls">
            <button onClick={selectAll} data-testid="select-all">Select all</button>
            <button onClick={selectNone} data-testid="select-none">Select none</button>
          </div>

          <section className="lw-apply-candidates" data-testid="candidates">
            {candidates.map((c) => (
              <label key={c.descriptor} className="lw-apply-candidate-row">
                <input
                  type="checkbox"
                  checked={selectedIds.has(c.descriptor)}
                  onChange={() => toggleSelection(c.descriptor)}
                  data-testid={`candidate-checkbox-${c.dataTestId ?? c.descriptor}`}
                />
                <span className="lw-apply-candidate-label">
                  {c.dataTestId ?? c.descriptor}
                </span>
                <span className="lw-apply-candidate-signals">
                  {c.signals.length} signal{c.signals.length !== 1 ? "s" : ""}
                </span>
              </label>
            ))}
          </section>

          <button
            className="lw-apply-submit"
            onClick={handleApplySelected}
            disabled={selectedIds.size === 0}
            data-testid="apply-selected"
          >
            Apply to {selectedIds.size} target{selectedIds.size !== 1 ? "s" : ""}
          </button>
        </>
      )}
    </div>
  );
}
