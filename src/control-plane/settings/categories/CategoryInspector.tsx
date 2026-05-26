import { SettingsSubSection } from '../SettingsContent';

export function CategoryInspector() {
  return (
    <div data-testid="settings-category-content-inspector" className="space-y-4">
      <SettingsSubSection id="inspector.preview" label="Preview">
        <p className="text-xs text-slate-500">
          Live radial inspector preview renders here. Full inspector internals land in v89.
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="inspector.activation" label="Activation">
        <p className="text-xs text-slate-500">
          Hotkey rebind for radial inspector activation lands in v89 alongside the hotkey registry.
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="inspector.behavior" label="Behavior">
        <p className="text-xs text-slate-500">
          Dim graph while inspecting, persist recent swatches, and draggable inspector
          panel toggles land in v89.
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="inspector.coming" label="Coming later" defaultCollapsed>
        <p className="text-xs text-slate-500">
          Per-spoke configuration, default scope picker, custom spoke order — v89.
        </p>
      </SettingsSubSection>
    </div>
  );
}
