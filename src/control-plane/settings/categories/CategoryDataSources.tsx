import { SettingsSubSection } from '../SettingsContent';
import { t } from '../../../i18n';

export function CategoryDataSources() {
  return (
    <div data-testid="settings-category-content-data-sources" className="space-y-4">
      <SettingsSubSection id="data.active" label={t("settings.sections.dataSources.active")}>
        <p className="text-xs text-slate-500">
          {t("settings.sections.dataSources.activeDesc")}
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="data.adapters" label={t("settings.sections.dataSources.adapters")}>
        <p className="text-xs text-slate-500">
          {t("settings.sections.dataSources.adaptersDesc")}
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="data.coming" label={t("settings.sections.dataSources.coming")} defaultCollapsed>
        <p className="text-xs text-slate-500">
          {t("settings.sections.dataSources.comingDesc")}
        </p>
      </SettingsSubSection>
    </div>
  );
}
