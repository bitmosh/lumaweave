import { SettingsSubSection } from '../SettingsContent';
import { t } from '../../../i18n';

export function CategoryInspector() {
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
