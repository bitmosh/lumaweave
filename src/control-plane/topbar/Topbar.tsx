import { useSettingsStore } from "../../control-plane/settings/settings.store";
import { HexLogo } from "./HexLogo";
import { WordmarkBlock } from "./WordmarkBlock";
import { StatusPill } from "./StatusPill";
import { StatusCluster } from "./StatusCluster";
import "./topbar.css";

interface TopbarProps {
  onOpenSettings?: () => void;
}

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
          className="lw-topbar-icon-btn"
          aria-label="Open settings"
          title="Settings · ⌘,"
          onClick={onOpenSettings}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1.5l1.2 2 2.3-.5.5 2.3 2 1.2-1.2 2 1.2 2-2 1.2-.5 2.3-2.3-.5L8 14.5l-1.2-2-2.3.5-.5-2.3-2-1.2 1.2-2-1.2-2 2-1.2.5-2.3 2.3.5L8 1.5Zm0 3.7a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z" />
          </svg>
          <span className="lw-topbar-kbd" style={{ marginLeft: 6 }}>⌘,</span>
        </button>
      </div>
    </header>
  );
}
