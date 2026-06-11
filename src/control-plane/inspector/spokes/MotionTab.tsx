import { useMemo } from "react";
import {
  getAllMotionSafetyEntries,
  type MotionSafetyEntry,
  type MotionRiskLevel,
} from "../../../accessibility/motionSafetyRegistry";
import { useSettingsStore } from "../../settings/settings.store";
import type { TargetDescriptor } from "../inspector.types";
import { t } from "../../../i18n";
import "../styles/motion-tab.css";

export interface MotionTabProps {
  targetDescriptor: TargetDescriptor;
  onClose?: () => void;
}

const RISK_ORDER: MotionRiskLevel[] = ["safe", "low", "moderate", "high"];

export function MotionTab(_props: MotionTabProps) {
  const reduceMotion = useSettingsStore((s) => s.settings.appearance.reduceMotion);
  const entries = useMemo(() => getAllMotionSafetyEntries(), []);

  const grouped = useMemo(() => {
    const map: Partial<Record<MotionRiskLevel, MotionSafetyEntry[]>> = {};
    for (const entry of entries) {
      if (!map[entry.risk]) map[entry.risk] = [];
      map[entry.risk]!.push(entry);
    }
    return map;
  }, [entries]);

  function handleToggle() {
    const { settings, setSetting } = useSettingsStore.getState();
    setSetting("appearance.reduceMotion", !settings.appearance.reduceMotion);
  }

  if (entries.length === 0) {
    return (
      <div className="lw-motion-tab-empty" data-testid="inspector-motion-tab">
        <p>{t("inspector.spokes.motion.placeholderMessage")}</p>
      </div>
    );
  }

  return (
    <div className="lw-motion-tab" data-testid="inspector-motion-tab">
      <div className="lw-motion-toggle-section">
        <label className="lw-motion-toggle-label">
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={handleToggle}
            data-testid="motion-reduce-toggle"
          />
          <span>{t("inspector.spokes.motion.reduceMotionLabel")}</span>
        </label>
        <p className="lw-motion-toggle-hint">
          {t("inspector.spokes.motion.reduceMotionHint")}
        </p>
      </div>

      <div className="lw-motion-safety-section">
        <h3 className="lw-motion-section-header">
          {t("inspector.spokes.motion.safetyReferenceHeader")}
        </h3>
        {RISK_ORDER.map((risk) => {
          const group = grouped[risk];
          if (!group || group.length === 0) return null;
          return (
            <MotionSafetyGroup key={risk} risk={risk} entries={group} />
          );
        })}
      </div>
    </div>
  );
}

function MotionSafetyGroup({
  risk,
  entries,
}: {
  risk: MotionRiskLevel;
  entries: MotionSafetyEntry[];
}) {
  return (
    <div
      className={`lw-motion-safety-group lw-motion-safety-${risk}`}
      data-testid={`motion-safety-group-${risk}`}
    >
      <h4 className="lw-motion-group-label">
        {t(`inspector.spokes.motion.classification.${risk}`)}
      </h4>
      <ul className="lw-motion-group-list">
        {entries.map((entry) => (
          <li key={entry.id} className="lw-motion-entry" data-testid={`motion-entry-${entry.id}`}>
            <span className="lw-motion-entry-name">{entry.name}</span>
            <span className="lw-motion-entry-description">{entry.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
