import { SettingsSubSection } from '../SettingsContent';

export function CategoryAdvanced() {
  return (
    <div data-testid="settings-category-content-advanced" className="space-y-4">
      <SettingsSubSection id="advanced.devtools" label="Developer tools">
        <p className="text-xs text-slate-500">
          Window probe exposure toggle and provenance manifest regeneration land
          in v95 alongside the Advanced category full implementation.
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="advanced.flags" label="Feature flags">
        <p className="text-xs text-slate-500">
          Feature flag browser lands in v95. Flags are currently managed
          in the settings store directly.
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="advanced.reset" label="Reset" defaultCollapsed>
        <p className="text-xs text-slate-500">
          Clear-all-overrides and reset-all-settings destructive actions land in v95.
        </p>
      </SettingsSubSection>
    </div>
  );
}
