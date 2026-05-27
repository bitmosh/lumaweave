import { SettingsSubSection } from '../SettingsContent';
import { t } from '../../../i18n';
import { useSettingsStore } from '../settings.store';

export function CategoryInspector() {
  const settings = useSettingsStore((s) => s.settings);
  const setSetting = useSettingsStore((s) => s.setSetting);

  return (
    <div data-testid="settings-category-content-inspector" className="space-y-4">
      <SettingsSubSection id="inspector.preview" label={t("settings.sections.inspector.preview")}>
        <p className="text-xs text-slate-500">
          {t("settings.sections.inspector.previewDesc")}
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="inspector.activation" label={t("settings.sections.inspector.activation")}>
        <p className="text-xs text-slate-500">
          {t("settings.sections.inspector.activationDesc")}
        </p>
        <label className="flex items-center gap-2 mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.inspector?.autoOpenOnSelection ?? true}
            onChange={(e) =>
              setSetting("inspector.autoOpenOnSelection" as any, e.target.checked)
            }
          />
          <div>
            <div className="text-xs text-slate-300">
              {t("settings.inspector.autoOpen.label")}
            </div>
            <div className="text-xs text-slate-500">
              {t("settings.inspector.autoOpen.description")}
            </div>
          </div>
        </label>
      </SettingsSubSection>

      <SettingsSubSection id="inspector.behavior" label={t("settings.sections.inspector.behavior")}>
        <p className="text-xs text-slate-500">
          {t("settings.sections.inspector.behaviorDesc")}
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="inspector.coming" label={t("settings.sections.inspector.coming")} defaultCollapsed>
        <p className="text-xs text-slate-500">
          {t("settings.sections.inspector.comingDesc")}
        </p>
      </SettingsSubSection>
    </div>
  );
}
