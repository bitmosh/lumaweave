// SPDX-License-Identifier: Apache-2.0
import { settingsRegistry } from "../settings/settings.registry";
import { useSettingsStore } from "../settings/settings.store";
import { HelixTwistSliders } from "./HelixTwistSliders";
import { getNestedValue } from "../settingsUtils";

/**
 * Physics section content. Used in two places:
 * - SettingsPanel (when not tiled out)
 * - FloatingTile via tileSectionRegistry (when tiled out)
 *
 * Single source of truth — the same JSX renders in both contexts.
 * This is the Option X pattern from the v86c-A audit: extracted
 * shared component instead of parallel render paths.
 */
export function PhysicsSectionContent() {
  const settings = useSettingsStore((state) => state.settings);
  const setSetting = useSettingsStore((state) => state.setSetting);

  const physicsSettings = settingsRegistry.filter(
    (setting) => setting.category === "graph" && setting.path.startsWith("physics."),
  );

  return (
    <section
      className="rounded-xl border border-cyan-400/20 bg-slate-950/70 p-4"
      data-testid="physics-section-content"
    >
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-cyan-300">
        Physics
      </h3>

      <div className="space-y-4">
        {physicsSettings.map((setting) => {
          const value = getNestedValue(settings, setting.path);

          if (setting.type === "boolean") {
            return (
              <label
                key={setting.path}
                className="flex items-start justify-between gap-4 text-sm"
              >
                <span>
                  <span className="block text-slate-200">
                    {setting.label}
                  </span>
                  {setting.description ? (
                    <span className="block text-xs text-slate-500">
                      {setting.description}
                    </span>
                  ) : null}
                </span>

                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(event) =>
                    setSetting(setting.path, event.currentTarget.checked)
                  }
                  className="mt-1"
                />
              </label>
            );
          }

          if (setting.type === "range") {
            return (
              <label key={setting.path} className="block text-sm">
                <div className="mb-1 flex justify-between gap-4">
                  <span className="text-slate-200">{setting.label}</span>
                  <span className="text-xs text-cyan-300">
                    {String(value)}
                  </span>
                </div>
                {setting.description ? (
                  <p className="mb-2 text-xs text-slate-500">
                    {setting.description}
                  </p>
                ) : null}
                <input
                  data-testid={`setting-${setting.path.replace(/\./g, '-')}`}
                  type="range"
                  min={setting.min}
                  max={setting.max}
                  step={setting.step}
                  value={Number(value)}
                  ref={(el) => {
                    if (!el) return;
                    const min = Number(el.min) || 0;
                    const max = Number(el.max) || 100;
                    const val = Number(el.value);
                    const pct = ((val - min) / (max - min)) * 100;
                    el.style.setProperty("--range-progress", `${pct}%`);
                  }}
                  onChange={(event) =>
                    setSetting(
                      setting.path,
                      Number(event.currentTarget.value),
                    )
                  }
                  onInput={(e) => {
                    const input = e.target as HTMLInputElement;
                    const min = Number(input.min) || 0;
                    const max = Number(input.max) || 100;
                    const val = Number(input.value);
                    const pct = ((val - min) / (max - min)) * 100;
                    input.style.setProperty(
                      "--range-progress", `${pct}%`
                    );
                  }}
                  className="w-full"
                />
              </label>
            );
          }

          if (setting.type === "select") {
            return (
              <label key={setting.path} className="block text-sm">
                <span className="mb-1 block text-slate-200">
                  {setting.label}
                </span>
                {setting.description ? (
                  <p className="mb-2 text-xs text-slate-500">
                    {setting.description}
                  </p>
                ) : null}
                <select
                  data-testid={setting.testId || `setting-${setting.path.replace(/\./g, '-')}`}
                  value={String(value)}
                  onChange={(event) =>
                    setSetting(setting.path, event.currentTarget.value)
                  }
                  className="w-full rounded-lg border border-cyan-400/20 bg-slate-900 px-3 py-2 text-slate-100"
                >
                  {setting.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            );
          }

          // Pass C9.2: Reset Pinned button for physics.dialectId
          if (setting.path === "physics.dialectId") {
            return (
              <button
                key="reset-pinned"
                data-testid="reset-pinned-button"
                onClick={() => {
                  const currentAll = settings.physics.pins ?? {};
                  const newAll = { ...currentAll };
                  delete newAll[settings.physics.dialectId];
                  setSetting("physics.pins" as any, newAll);
                }}
                className="mt-2 w-full rounded-lg border border-cyan-400/20 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Reset Pinned
              </button>
            );
          }

          if (setting.type === "text") {
            return (
              <label key={setting.path} className="block text-sm">
                <span className="mb-1 block text-slate-200">
                  {setting.label}
                </span>
                {setting.description ? (
                  <p className="mb-2 text-xs text-slate-500">
                    {setting.description}
                  </p>
                ) : null}
                <input
                  type="text"
                  value={String(value)}
                  onChange={(event) =>
                    setSetting(setting.path, event.currentTarget.value)
                  }
                  className="w-full rounded-lg border border-cyan-400/20 bg-slate-900 px-3 py-2 text-slate-100"
                />
              </label>
            );
          }

          return null;
        })}

        {/* Pass C4: HelixTwistSliders for live tuning */}
        <HelixTwistSliders />
      </div>
    </section>
  );
}
