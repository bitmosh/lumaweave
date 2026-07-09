// SPDX-License-Identifier: Apache-2.0
import { SettingsSubSection } from '../SettingsContent';
import { t } from '../../../i18n';

export function CategoryDisplay() {
  return (
    <div data-testid="settings-category-content-display" className="space-y-4">
      <SettingsSubSection id="display.mirrors" label={t("settings.sections.display.mirrors")}>
        <p className="text-xs text-slate-500">
          {t("settings.sections.display.mirrorsDesc")}
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="display.coming" label={t("settings.sections.display.coming")} defaultCollapsed>
        <p className="text-xs text-slate-500">
          {t("settings.sections.display.comingDesc")}
        </p>
      </SettingsSubSection>
    </div>
  );
}
