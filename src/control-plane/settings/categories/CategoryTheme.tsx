import { settingsRegistry } from '../settings.registry';
import { useSettingsStore } from '../settings.store';
import { SettingsSubSection } from '../SettingsContent';

function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((cursor, key) => cursor?.[key], obj);
}

export function CategoryTheme() {
  const settings = useSettingsStore((state) => state.settings);
  const setSetting = useSettingsStore((state) => state.setSetting);

  const themeSettings = settingsRegistry.filter((s) => s.category === 'theme');

  function renderControl(setting: typeof themeSettings[number]) {
    const value = getNestedValue(settings, setting.path);

    if (setting.type === 'boolean') {
      return (
        <label key={setting.path} className="flex items-start justify-between gap-4 text-sm">
          <span>
            <span className="block text-slate-200">{setting.label}</span>
            {setting.description && <span className="block text-xs text-slate-500">{setting.description}</span>}
          </span>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => setSetting(setting.path, e.currentTarget.checked)}
            className="mt-1"
          />
        </label>
      );
    }

    if (setting.type === 'range') {
      return (
        <label key={setting.path} className="block text-sm">
          <div className="mb-1 flex justify-between gap-4">
            <span className="text-slate-200">{setting.label}</span>
            <span className="text-xs text-cyan-300">{String(value)}</span>
          </div>
          {setting.description && <p className="mb-2 text-xs text-slate-500">{setting.description}</p>}
          <input
            data-testid={`setting-${setting.path.replace(/\./g, '-')}`}
            type="range"
            min={setting.min}
            max={setting.max}
            step={setting.step}
            value={Number(value)}
            ref={(el) => {
              if (!el) return;
              const pct = ((Number(el.value) - Number(el.min)) / (Number(el.max) - Number(el.min))) * 100;
              el.style.setProperty('--range-progress', `${pct}%`);
            }}
            onChange={(e) => setSetting(setting.path, Number(e.currentTarget.value))}
            onInput={(e) => {
              const el = e.target as HTMLInputElement;
              const pct = ((Number(el.value) - Number(el.min)) / (Number(el.max) - Number(el.min))) * 100;
              el.style.setProperty('--range-progress', `${pct}%`);
            }}
            className="w-full"
          />
        </label>
      );
    }

    if (setting.type === 'select') {
      return (
        <label key={setting.path} className="block text-sm">
          <span className="mb-1 block text-slate-200">{setting.label}</span>
          {setting.description && <p className="mb-2 text-xs text-slate-500">{setting.description}</p>}
          <select
            data-testid={`setting-${setting.path.replace(/\./g, '-')}`}
            value={String(value)}
            onChange={(e) => setSetting(setting.path, e.currentTarget.value)}
            className="w-full rounded-lg border border-cyan-400/20 bg-slate-900 px-3 py-2 text-slate-100"
          >
            {setting.options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
      );
    }

    if (setting.type === 'text') {
      return (
        <label key={setting.path} className="block text-sm">
          <span className="mb-1 block text-slate-200">{setting.label}</span>
          {setting.description && <p className="mb-2 text-xs text-slate-500">{setting.description}</p>}
          <input
            type="text"
            value={String(value)}
            onChange={(e) => setSetting(setting.path, e.currentTarget.value)}
            className="w-full rounded-lg border border-cyan-400/20 bg-slate-900 px-3 py-2 text-slate-100"
          />
        </label>
      );
    }

    return null;
  }

  const presetSetting = themeSettings.filter((s) => s.path === 'appearance.theme');
  const dramaSetting = themeSettings.filter((s) => s.path === 'appearance.drama');
  const intensitySettings = themeSettings.filter(
    (s) => s.path !== 'appearance.theme' && s.path !== 'appearance.drama',
  );

  return (
    <div data-testid="settings-category-content-theme" className="space-y-4">
      <SettingsSubSection id="theme.preset" label="Preset">
        <div className="space-y-4">
          {presetSetting.map(renderControl)}
        </div>
      </SettingsSubSection>

      <SettingsSubSection id="theme.drama" label="Drama">
        <div className="space-y-4">
          {dramaSetting.map(renderControl)}
        </div>
      </SettingsSubSection>

      <SettingsSubSection id="theme.intensity" label="Intensity">
        <div className="space-y-4">
          {intensitySettings.map(renderControl)}
        </div>
      </SettingsSubSection>

      <SettingsSubSection id="theme.overrides" label="Overrides" defaultCollapsed>
        <p className="text-xs text-slate-500">
          Theme token overrides (via radial inspector) will appear here. Full overrides UI lands in the Theme Menu pass.
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="theme.accessibility" label="Accessibility" defaultCollapsed>
        <p className="text-xs text-slate-500">
          WCAG contrast readout for the active theme lands in the Theme Menu pass.
        </p>
      </SettingsSubSection>
    </div>
  );
}
