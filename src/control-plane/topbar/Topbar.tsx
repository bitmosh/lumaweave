import { useSettingsStore } from "../../control-plane/settings/settings.store";
import { HexLogo } from "./HexLogo";
import { WordmarkBlock } from "./WordmarkBlock";
import { StatusPill } from "./StatusPill";
import { StatusCluster } from "./StatusCluster";
import "./topbar.css";

export function Topbar() {
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
      </div>
    </header>
  );
}
