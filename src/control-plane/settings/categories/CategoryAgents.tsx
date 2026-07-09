// SPDX-License-Identifier: Apache-2.0
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { SettingsSubSection } from "../SettingsContent";
import { t } from "../../../i18n";
import { useSettingsStore } from "../settings.store";

export function CategoryAgents() {
  const config = useSettingsStore((s) => s.settings.agents.inference);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await invoke<{ ok: boolean; message: string }>(
        "test_inference_connection",
        {
          config: {
            endpoint: config.endpoint,
            model: config.model,
            api_key: config.byokKey || undefined,
          },
        },
      );
      setTestResult(result);
    } catch (e: unknown) {
      const msg =
        typeof e === "string"
          ? e
          : (e as { message?: string })?.message ?? "Unknown error";
      setTestResult({ ok: false, message: msg });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div data-testid="settings-category-content-agents" className="space-y-4">
      <SettingsSubSection id="agents.endpoint" label={t("settings.agents.endpoint.label")}>
        <p className="text-xs text-slate-500 mb-2">{t("settings.agents.endpoint.hint")}</p>
        <input
          type="text"
          data-testid="settings-agents-endpoint"
          className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 outline-none focus:border-cyan-500/50"
          value={config.endpoint}
          onChange={(e) => setSetting("agents.inference.endpoint", e.target.value)}
          placeholder="http://localhost:11434/v1"
        />
      </SettingsSubSection>

      <SettingsSubSection id="agents.model" label={t("settings.agents.model.label")}>
        <p className="text-xs text-slate-500 mb-2">{t("settings.agents.model.hint")}</p>
        <input
          type="text"
          data-testid="settings-agents-model"
          className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 outline-none focus:border-cyan-500/50"
          value={config.model}
          onChange={(e) => setSetting("agents.inference.model", e.target.value)}
          placeholder="llama3.1"
        />
      </SettingsSubSection>

      <SettingsSubSection id="agents.apiKey" label={t("settings.agents.apiKey.label")}>
        <p className="text-xs text-slate-500 mb-2">{t("settings.agents.apiKey.hint")}</p>
        <input
          type="password"
          data-testid="settings-agents-apikey"
          className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 outline-none focus:border-cyan-500/50"
          value={config.byokKey}
          onChange={(e) => setSetting("agents.inference.byokKey", e.target.value)}
        />
        <p
          className="text-xs text-amber-500/70 mt-2"
          data-testid="settings-agents-warning"
        >
          {t("settings.agents.apiKey.warning")}
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="agents.testConnection" label={t("settings.agents.test.label")}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="settings-agents-test"
            className="text-xs px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={handleTest}
            disabled={testing}
          >
            {testing ? t("settings.agents.test.testing") : t("settings.agents.test.button")}
          </button>
          {testResult && (
            <span
              data-testid="settings-agents-test-result"
              className={`text-xs ${testResult.ok ? "text-emerald-400" : "text-red-400"}`}
            >
              {testResult.message}
            </span>
          )}
        </div>
      </SettingsSubSection>
    </div>
  );
}
