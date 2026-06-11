import { SettingsSubSection } from '../SettingsContent';
import { t } from '../../../i18n';
import { GraphVisualInventoryPanel } from '../../graph/GraphVisualInventoryPanel';
import { SystemIndexPanel } from '../../system-index/SystemIndexPanel';
import { CommandDeckShell } from '../../command-deck/CommandDeckShell';
import { useSettingsStore } from '../settings.store';
import { getThemeRuntimeTokens } from '../../../themes/themeTokens';

export function CategoryAdvanced() {
  const theme = useSettingsStore((s) => s.settings.appearance.theme);
  const devMode = useSettingsStore((s) => s.settings.developer?.devMode ?? false);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const tokens = getThemeRuntimeTokens(theme);
  const themeAccent = tokens.app.accent;
  const themeTextMuted = tokens.app.textMuted;

  return (
    <div data-testid="settings-category-content-advanced" className="space-y-4">
      <SettingsSubSection id="advanced.devMode" label={t("settings.advanced.devMode.label")}>
        <p className="text-xs text-slate-500 mb-2">
          {t("settings.advanced.devMode.description")}
        </p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={devMode}
            onChange={(e) => setSetting("developer.devMode", e.target.checked)}
            data-testid="settings-dev-mode-toggle"
          />
          <span className="text-xs text-slate-400">{t("settings.advanced.devMode.hint")}</span>
        </label>
      </SettingsSubSection>

      <SettingsSubSection id="advanced.devtools" label={t("settings.sections.advanced.devtools")}>
        <p className="text-xs text-slate-500">
          {t("settings.sections.advanced.devtoolsDesc")}
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="advanced.graphVisualInventory" label={t("settings.advanced.graphVisualInventory.title")}>
        <p className="text-xs text-slate-500 mb-2">{t("settings.advanced.graphVisualInventory.description")}</p>
        <GraphVisualInventoryPanel />
      </SettingsSubSection>

      <SettingsSubSection id="advanced.systemIndex" label={t("settings.advanced.systemIndex.title")}>
        <p className="text-xs text-slate-500 mb-2">{t("settings.advanced.systemIndex.description")}</p>
        <SystemIndexPanel />
      </SettingsSubSection>

      <SettingsSubSection id="advanced.commandDeck" label={t("settings.advanced.commandDeck.title")}>
        <p className="text-xs text-slate-500 mb-2">{t("settings.advanced.commandDeck.description")}</p>
        <CommandDeckShell themeAccent={themeAccent} themeTextMuted={themeTextMuted} />
      </SettingsSubSection>

      <SettingsSubSection id="advanced.flags" label={t("settings.sections.advanced.flags")}>
        <p className="text-xs text-slate-500">
          {t("settings.sections.advanced.flagsDesc")}
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="advanced.reset" label={t("settings.sections.advanced.reset")} defaultCollapsed>
        <p className="text-xs text-slate-500">
          {t("settings.sections.advanced.resetDesc")}
        </p>
      </SettingsSubSection>
    </div>
  );
}
