import { settingsRegistry } from "./settings.registry";
import { useSettingsStore } from "./settings.store";
import { CollapsibleSection } from "../panels/CollapsibleSection";
import { PhysicsSectionContent } from "../panels/PhysicsSectionContent";
import { LabelsSectionContent } from "../panels/LabelsSectionContent";
import { AppearanceSectionContent } from "../panels/AppearanceSectionContent";

function getNestedValue(obj: any, path: string) {
  return path.split(".").reduce((cursor, key) => cursor?.[key], obj);
}

export function SettingsPanel() {
  const settings = useSettingsStore((state) => state.settings);
  const setSetting = useSettingsStore((state) => state.setSetting);

  const categories = Array.from(
    new Set(settingsRegistry.map((setting) => setting.category)),
  );

  // Map category names to tile section registry keys
  const categoryToTileKey: Record<string, string> = {
    "Physics": "physics-section",
    "Labels": "labels-section",
    "Graph View": "appearance-section",
  };

  return (
    <div className="space-y-5">
      {categories.map((category) => {
        const tileableKey = categoryToTileKey[category];

        // Extracted components for v86c (Option X pattern).
        const innerContent = category === "Physics"
          ? <PhysicsSectionContent />
          : category === "Labels"
          ? <LabelsSectionContent />
          : category === "Graph View"
          ? <AppearanceSectionContent />
          : (
            // Defensive fallback for any future category not yet extracted
            <section
              className="rounded-xl border border-cyan-400/20 bg-slate-950/70 p-4"
            >
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-cyan-300">
                {category}
              </h3>

              <div className="space-y-4">
                {settingsRegistry
                  .filter((setting) => setting.category === category)
                  .map((setting) => {
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
              </div>
            </section>
          );

        return (
          <CollapsibleSection
            key={category}
            title={category}
            isOpen={true}
            onToggle={() => {}}
            testId={`settings-section-${category.toLowerCase().replace(" ", "-")}`}
            tileableKey={tileableKey}
          >
            {innerContent}
          </CollapsibleSection>
        );
      })}
    </div>
  );
}