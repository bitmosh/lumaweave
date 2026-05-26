import { SettingsSubSection } from '../SettingsContent';

export function CategoryDataSources() {
  return (
    <div data-testid="settings-category-content-data-sources" className="space-y-4">
      <SettingsSubSection id="data.active" label="Active source">
        <p className="text-xs text-slate-500">
          Source adapter status and loaded graph info lands in v95. For now, the active
          graph is the self-graph fixture loaded by the Vite plugin on startup.
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="data.adapters" label="Registered adapters">
        <p className="text-xs text-slate-500">
          Adapter activation toggles and connection configuration land in v95.
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="data.coming" label="Coming later" defaultCollapsed>
        <p className="text-xs text-slate-500">
          Adapter activation (v95) · Diff triage (v95) · Profile/vault switcher (v97).
        </p>
      </SettingsSubSection>
    </div>
  );
}
