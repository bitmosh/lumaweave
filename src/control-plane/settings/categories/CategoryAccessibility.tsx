import { SettingsSubSection } from '../SettingsContent';

export function CategoryAccessibility() {
  return (
    <div data-testid="settings-category-content-accessibility" className="space-y-4">
      <SettingsSubSection id="a11y.wcag" label="WCAG target">
        <p className="text-xs text-slate-500">
          Contrast target level and contrast warning toggles land in v93 alongside
          OKLCH color migration and APCA contrast targets.
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="a11y.colorblind" label="Color-blind simulation">
        <p className="text-xs text-slate-500">
          Deuteranopia, protanopia, tritanopia, achromatopsia simulation modes land in v93.
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="a11y.coming" label="Coming later" defaultCollapsed>
        <p className="text-xs text-slate-500">
          APCA contrast targets (v93) · Motion intensity floor (v93).
        </p>
      </SettingsSubSection>
    </div>
  );
}
