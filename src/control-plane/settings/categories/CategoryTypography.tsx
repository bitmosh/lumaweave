import { TypographyPlaygroundSection } from '../../panels/TypographyPlaygroundSection';
import { SettingsSubSection } from '../SettingsContent';

export function CategoryTypography() {
  return (
    <div data-testid="settings-category-content-typography" className="space-y-4">
      <SettingsSubSection id="typo.playground" label="Variable-font playground">
        <TypographyPlaygroundSection />
      </SettingsSubSection>

      <SettingsSubSection id="typo.coming" label="Coming later" defaultCollapsed>
        <p className="text-xs text-slate-500">
          Per-token font role assignment, custom font import, and per-weight overrides are
          planned for v89+.
        </p>
      </SettingsSubSection>
    </div>
  );
}
