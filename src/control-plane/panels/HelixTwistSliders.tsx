// SPDX-License-Identifier: Apache-2.0
import { useSettingsStore } from "../settings/settings.store";

interface HelixTwistRecord {
  all?: number;
  spine?: number;
  directory?: number;
  file?: number;
}

const SLIDER_MIN = -30;
const SLIDER_MAX = 30;
const SLIDER_STEP = 0.5;
const DEFAULT_VALUE = 0;

/**
 * HelixTwistSliders — live tuning controls for the active dialect's
 * helixTwist record. Per-well-type targets: spine, directory, file.
 *
 * Persistence: per-dialect via settings.physics.seedParamOverrides.
 * Switching dialects shows that dialect's stored overrides (each dialect
 * has independent slider positions).
 *
 * Unit: degrees per 100 units of distance.
 * Range: -30 to +30, step 0.5.
 */
export function HelixTwistSliders() {
  const settings = useSettingsStore((state) => state.settings);
  const setSetting = useSettingsStore((state) => state.setSetting);

  const dialectId = settings.physics.dialectId;
  const overrides = settings.physics.seedParamOverrides ?? {};
  const dialectOverrides = (overrides[dialectId] ?? {}) as Record<string, unknown>;
  const helixTwist = (dialectOverrides.helixTwist ?? {}) as HelixTwistRecord;

  function updateTwist(target: "spine" | "directory" | "file", value: number) {
    const newDialectOverrides = {
      ...dialectOverrides,
      helixTwist: {
        ...helixTwist,
        [target]: value,
      },
    };
    const newOverrides = {
      ...overrides,
      [dialectId]: newDialectOverrides,
    };
    setSetting("physics.seedParamOverrides", newOverrides);
  }

  const sliderConfigs = [
    { target: "spine" as const, label: "Helix Twist — Spine", testId: "helix-twist-spine" },
    { target: "directory" as const, label: "Helix Twist — Directory", testId: "helix-twist-directory" },
    { target: "file" as const, label: "Helix Twist — File", testId: "helix-twist-file" },
  ];

  return (
    <div className="space-y-3" data-testid="helix-twist-sliders">
      {sliderConfigs.map(({ target, label, testId }) => {
        const value = helixTwist[target] ?? DEFAULT_VALUE;
        return (
          <label key={target} className="block text-sm">
            <div className="mb-1 flex justify-between gap-4">
              <span className="text-slate-200">{label}</span>
              <span className="text-xs text-cyan-300">{value.toFixed(1)}°</span>
            </div>
            <input
              type="range"
              data-testid={testId}
              min={SLIDER_MIN}
              max={SLIDER_MAX}
              step={SLIDER_STEP}
              value={value}
              onChange={(e) => updateTwist(target, parseFloat(e.currentTarget.value))}
              className="w-full"
            />
          </label>
        );
      })}
    </div>
  );
}
