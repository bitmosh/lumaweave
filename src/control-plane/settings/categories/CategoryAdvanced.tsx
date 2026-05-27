import { SettingsSubSection } from '../SettingsContent';
import { t } from '../../../i18n';

export function CategoryAdvanced() {
  return (
    <div data-testid="settings-category-content-advanced" className="space-y-4">
      <SettingsSubSection id="advanced.devtools" label={t("settings.sections.advanced.devtools")}>
        <p className="text-xs text-slate-500">
          {t("settings.sections.advanced.devtoolsDesc")}
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="advanced.flags" label={t("settings.sections.advanced.flags")}>
        <p className="text-xs text-slate-500">
          {t("settings.sections.advanced.flagsDesc")}
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="advanced.reset" label={t("settings.sections.advanced.reset")} defaultCollapsed>
        <p className="text-xs text-slate-500">
          {t("settings.sections.advanced.resetDesc")}
        </p>
      </SettingsSubSection>
    </div>
  );
}
