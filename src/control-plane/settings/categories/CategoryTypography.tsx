// SPDX-License-Identifier: Apache-2.0
import { TypographyPlaygroundSection } from '../../panels/TypographyPlaygroundSection';
import { SettingsSubSection } from '../SettingsContent';
import { t } from '../../../i18n';

export function CategoryTypography() {
  return (
    <div data-testid="settings-category-content-typography" className="space-y-4">
      <SettingsSubSection id="typo.playground" label={t("settings.sections.typography.playground")}>
        <TypographyPlaygroundSection />
      </SettingsSubSection>

      <SettingsSubSection id="typo.coming" label={t("settings.sections.typography.coming")} defaultCollapsed>
        <p className="text-xs text-slate-500">
          {t("settings.sections.typography.comingDesc")}
        </p>
      </SettingsSubSection>
    </div>
  );
}
