import { useSettingsStore } from "../../control-plane/settings/settings.store";
import { HexLogo } from "./HexLogo";
import { WordmarkBlock } from "./WordmarkBlock";
import { StatusPill } from "./StatusPill";
import { StatusCluster } from "./StatusCluster";
import "./topbar.css";

interface TopbarProps {
  onOpenSettings?: () => void;
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
const kbdHint = isMac ? '⌘,' : 'Ctrl+,';

export function Topbar({ onOpenSettings }: TopbarProps) {
  const settings = useSettingsStore((s) => s.settings);
  const setSetting = useSettingsStore((s) => s.setSetting);

  return (
    <header className="lw-topbar" data-lw-theme-target="topbar.root">
      <div className="lw-topbar-left">
        <HexLogo size={34} />
        <WordmarkBlock />
        <StatusPill />
      </div>
      <div className="lw-topbar-right">
        <StatusCluster />
        <select
          data-testid="theme-preset-selector"
          value={settings.appearance.theme}
          onChange={(e) => setSetting("appearance.theme", e.currentTarget.value)}
          className="lw-theme-select"
        >
          <option value="solar-plasma">Solar Plasma</option>
          <option value="obsidian-aurora">Obsidian Aurora</option>
          <option value="midnight-loom">Midnight Loom</option>
          <option value="void-circuit">Void Circuit</option>
          <option value="agartha-dream">Agartha Dream</option>
          <option value="agartha-dusk">Agartha Dusk</option>
        </select>
        <label className="lw-toggle">
          <span>Glitter</span>
          <input
            type="checkbox"
            checked={settings.appearance.glitterEnabled}
            onChange={(e) =>
              setSetting("appearance.glitterEnabled", e.currentTarget.checked)
            }
          />
        </label>
        <label className="lw-toggle">
          <span>Reduce Motion</span>
          <input
            type="checkbox"
            checked={settings.appearance.reduceMotion}
            onChange={(e) =>
              setSetting("appearance.reduceMotion", e.currentTarget.checked)
            }
          />
        </label>
        <button
          type="button"
          data-testid="topbar-settings-button"
          className="lw-topbar-icon-btn"
          aria-label="Open settings"
          title={`Settings · ${kbdHint}`}
          onClick={onOpenSettings}
        >
          <span className="lw-topbar-kbd" style={{ marginRight: 6 }}>{kbdHint}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
            <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
