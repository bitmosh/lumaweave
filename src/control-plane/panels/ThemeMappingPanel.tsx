import { useState, useEffect } from "react";
import type { ThemeTargetInspectorEntity } from "../../themes/themeTargetInspectorTypes";
import type { ThemeEditableProperty } from "../../themes/themeTargetRegistry";
import type { ThemeTokenPath } from "../../themes/themeTokenPaths";
import {
  getGlobalOverride,
  setGlobalOverride,
  removeGlobalOverride,
  type ThemeTokenValue,
} from "../../themes/themeOverrideStorage";

interface ThemeMappingPanelProps {
  pinnedEntity: ThemeTargetInspectorEntity | null;
}

const CONTROL_HINTS: Record<ThemeEditableProperty, string> = {
  background: "Color swatch",
  border: "Border selector",
  text: "Typography selector",
  accent: "Accent picker",
  glow: "Glow slider",
  opacity: "Opacity slider",
  radius: "Radius slider",
};

// v34b: Enable panel.background control for mission-control.panel only
const V34B_ENABLED_TARGET = "mission-control.panel";
const V34B_ENABLED_PROPERTY = "background" as ThemeEditableProperty;
const V34B_ENABLED_TOKEN_PATH = "panel.background" as ThemeTokenPath;

export function ThemeMappingPanel({ pinnedEntity }: ThemeMappingPanelProps) {
  const [overrideValue, setOverrideValue] = useState<ThemeTokenValue | undefined>(undefined);

  // Load override value when pinned entity changes
  useEffect(() => {
    if (pinnedEntity?.kind === "registered" && pinnedEntity.themeTargetId === V34B_ENABLED_TARGET) {
      const value = getGlobalOverride(V34B_ENABLED_TOKEN_PATH);
      setOverrideValue(value);
    } else {
      setOverrideValue(undefined);
    }
  }, [pinnedEntity]);

  const handleValueChange = (newValue: string) => {
    setOverrideValue(newValue);
    try {
      setGlobalOverride(V34B_ENABLED_TOKEN_PATH, newValue);
    } catch (error) {
      console.error("Failed to set override:", error);
      // Revert on error
      setOverrideValue(getGlobalOverride(V34B_ENABLED_TOKEN_PATH));
    }
  };

  const handleReset = () => {
    removeGlobalOverride(V34B_ENABLED_TOKEN_PATH);
    setOverrideValue(undefined);
  };

  const isV34bEnabled =
    pinnedEntity?.kind === "registered" &&
    pinnedEntity.themeTargetId === V34B_ENABLED_TARGET;

  const isPropertyEnabled = (property: ThemeEditableProperty, tokenPath?: string) =>
    isV34bEnabled && property === V34B_ENABLED_PROPERTY && tokenPath === V34B_ENABLED_TOKEN_PATH;
  if (!pinnedEntity) {
    return (
      <section
        data-testid="theme-mapping-panel"
        className="bg-slate-900/85 border border-slate-800 rounded-lg p-4 text-sm text-slate-200"
      >
        <div data-testid="theme-mapping-empty-state">
          <p className="font-semibold">Theme Mapping Panel (Read-Only)</p>
          <p className="mt-2 text-slate-400">
            Pin a registered UI surface or warning candidate using Alt+Shift+P to preview its mapping contract.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Editing, storage, and presets remain locked until the Theme Mapping override contract ships.
          </p>
        </div>
      </section>
    );
  }

  if (pinnedEntity.kind === "candidate") {
    return (
      <section
        data-testid="theme-mapping-panel"
        className="bg-slate-900/85 border border-slate-800 rounded-lg p-4 text-sm text-slate-200"
      >
        <div data-testid="theme-mapping-candidate-target" className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Candidate Surface</span>
            <span className="text-xs uppercase tracking-wide text-amber-400">Review Required</span>
          </div>
          <div className="text-slate-400">
            {pinnedEntity.descriptor} {pinnedEntity.dataTestId ? `· [${pinnedEntity.dataTestId}]` : ""}
          </div>
          <div className="text-xs text-slate-300">
            Signals ({pinnedEntity.signals.length}): {pinnedEntity.signals.join(" · ")}
          </div>
          <div className="text-xs text-slate-500">
            This candidate is not registered. Review and propose a ThemeTargetRegistry entry before generating controls.
          </div>
          <div data-testid="theme-mapping-storage-locked-notice" className="text-xs text-slate-500">
            Editing & storage remain locked until override semantics exist.
          </div>
        </div>
      </section>
    );
  }

  const metadata = pinnedEntity.metadata;

  return (
    <section
      data-testid="theme-mapping-panel"
      className="bg-slate-900/85 border border-slate-800 rounded-lg p-4 text-sm text-slate-200"
    >
      {metadata ? (
        <div data-testid="theme-mapping-registered-target" className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{metadata.label ?? pinnedEntity.themeTargetId}</div>
              <div className="text-xs text-slate-400">{pinnedEntity.themeTargetId} · surface {metadata.surface}</div>
            </div>
            {metadata.status && (
              <span className="text-xs uppercase tracking-wide text-slate-400">{metadata.status}</span>
            )}
          </div>
          {metadata.visualHandle && (
            <div className="text-xs text-slate-400">Visual Handle: {metadata.visualHandle}</div>
          )}

          <div>
            <div className="text-xs font-semibold text-slate-400 tracking-wide uppercase mb-1">Token Bindings</div>
            {Object.entries(metadata.tokenBindings).length ? (
              <ul data-testid="theme-mapping-token-binding-row" className="text-xs text-slate-300 space-y-1">
                {Object.entries(metadata.tokenBindings).map(([property, token]) => (
                  <li key={property}>{property}: {token}</li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-amber-400">No token bindings recorded.</div>
            )}
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-400 tracking-wide uppercase mb-1">Generated Read-Only Controls</div>
            {metadata.editableProperties.length ? (
              <div className="space-y-2">
                {metadata.editableProperties.map((property) => {
                  const token = metadata.tokenBindings[property];
                  const isEnabled = isPropertyEnabled(property, token);
                  
                  return (
                    <div
                      key={property}
                      data-testid={isEnabled ? "theme-mapping-enabled-control" : "theme-mapping-disabled-control"}
                      className={`rounded border px-3 py-2 text-xs ${
                        isEnabled
                          ? "border-blue-500/50 bg-blue-950/30 text-slate-200"
                          : "border-slate-800 bg-slate-950/40 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-slate-200">{property}</div>
                        <div className="text-[10px] uppercase tracking-wide text-slate-500">
                          {isEnabled ? "ENABLED" : `${CONTROL_HINTS[property]} (disabled)`}
                        </div>
                      </div>
                      <div className="text-slate-400">Canonical Token: {token ?? "Not bound"}</div>
                      {metadata.visualHandle && (
                        <div className="text-slate-400">Visual Handle: {metadata.visualHandle}</div>
                      )}
                      {isEnabled && (
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              data-testid="theme-mapping-control-input"
                              value={overrideValue ?? ""}
                              onChange={(e) => handleValueChange(e.target.value)}
                              placeholder="Enter color value (e.g., #1a1a2e)"
                              className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 placeholder-slate-500"
                            />
                            <button
                              data-testid="theme-mapping-control-reset"
                              onClick={handleReset}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700"
                            >
                              Reset
                            </button>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            v34b narrow control: panel.background only
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-amber-400">Editable properties not defined.</div>
            )}
          </div>

          <div data-testid="theme-mapping-storage-locked-notice" className="text-xs text-slate-500">
            {isV34bEnabled
              ? "v34b: panel.background control enabled. All other controls remain disabled."
              : "Editing, override storage, and preset saving remain locked until v33–v34 storage work ships. This panel is diagnostic only."}
          </div>
        </div>
      ) : (
        <div data-testid="theme-mapping-registered-target" className="text-xs text-amber-400">
          Metadata unavailable for {pinnedEntity.themeTargetId}. Verify ThemeTargetRegistry entry before mapping.
        </div>
      )}
    </section>
  );
}
