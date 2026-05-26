import { SettingsSubSection } from '../SettingsContent';

export function CategoryDisplay() {
  return (
    <div data-testid="settings-category-content-display" className="space-y-4">
      <SettingsSubSection id="display.mirrors" label="Mirrors">
        <p className="text-xs text-slate-500">
          Display mirrors (Effects, Reduce Motion, Panel Blur, Glow Intensity, Motion Scale)
          are accessible in Theme. Full mirror surface lands in the Display pass alongside
          performance mode (v90).
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="display.coming" label="Coming later" defaultCollapsed>
        <p className="text-xs text-slate-500">
          Performance mode (v90) · Particle density (v92) · Detail level slider (v90) ·
          3D minimap controls (v94).
        </p>
      </SettingsSubSection>
    </div>
  );
}
