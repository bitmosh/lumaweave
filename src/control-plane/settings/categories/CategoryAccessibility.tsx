// SPDX-License-Identifier: Apache-2.0
import { SettingsSubSection } from '../SettingsContent';
import { t } from '../../../i18n';

export function CategoryAccessibility() {
  return (
    <div data-testid="settings-category-content-accessibility" className="space-y-4">
      <SettingsSubSection id="a11y.wcag" label={t("settings.sections.accessibility.wcag")}>
        <p className="text-xs text-slate-500">
          {t("settings.sections.accessibility.wcagDesc")}
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="a11y.colorblind" label={t("settings.sections.accessibility.colorblind")}>
        <p className="text-xs text-slate-500">
          {t("settings.sections.accessibility.colorblindDesc")}
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="a11y.coming" label={t("settings.sections.accessibility.coming")} defaultCollapsed>
        <p className="text-xs text-slate-500">
          {t("settings.sections.accessibility.comingDesc")}
        </p>
      </SettingsSubSection>
    </div>
  );
}
