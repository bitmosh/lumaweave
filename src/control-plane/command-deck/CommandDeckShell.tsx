// SPDX-License-Identifier: Apache-2.0
import { perspectiveRegistry } from "../perspectives/perspectiveRegistry";
import { hotkeyRegistry } from "../hotkeys/hotkey-registry";
import { commandRegistry } from "../commands/command-registry";
import { formatBinding } from "../hotkeys/hotkey-utils";
import { t } from "../../i18n";

interface CommandDeckShellProps {
  themeAccent?: string;
  themeTextMuted?: string;
}

export function CommandDeckShell({
  themeAccent = "var(--lw-accent, #FFB347)",
  themeTextMuted = "var(--lw-text-muted, rgba(255,179,71,0.45))",
}: CommandDeckShellProps) {
  const activeHotkeys = hotkeyRegistry.getActive();
  const commands = commandRegistry.getAll();

  return (
    <div
      className="rounded-lg p-3"
      data-testid="command-deck-shell"
      style={{
        border: `1px solid ${themeAccent}30`,
        backgroundColor: `${themeAccent}10`,
      }}
    >
      <div className="space-y-3">
        <div>
          <h4
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: themeAccent }}
          >
            {t("commandDeck.status")}
          </h4>
          <p
            className="mt-1 text-xs"
            style={{ color: "var(--lw-text-primary)" }}
          >
            {t("commandDeck.readOnlyShell")}
          </p>
        </div>

        <div>
          <h4
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: themeAccent }}
          >
            {t("commandDeck.contractBoundary")}
          </h4>
          <p
            className="mt-1 text-xs"
            style={{ color: themeTextMuted }}
          >
            {t("commandDeck.contractDesc")}
          </p>
        </div>

        <div>
          <h4
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: themeAccent }}
          >
            {t("commandDeck.description")}
          </h4>
          <p
            className="mt-1 text-xs"
            style={{ color: "var(--lw-text-primary)" }}
          >
            {t("commandDeck.descriptionText")}
          </p>
        </div>

        <div>
          <h4
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: themeAccent }}
          >
            {t("commandDeck.hotkeyRegistry")}
          </h4>
          <div className="mt-2 space-y-2">
            {activeHotkeys.map((entry) => (
              <div
                key={entry.id}
                className="rounded px-2 py-1 text-xs"
                data-testid={`hotkey-row-${entry.id}`}
                style={{
                  border: `1px solid ${themeAccent}40`,
                  backgroundColor: `${themeAccent}15`,
                  color: themeAccent,
                }}
              >
                <span className="font-semibold">{formatBinding(entry.binding)}</span>
                {": "}
                {entry.label}
              </div>
            ))}
            <p
              className="mt-1 text-xs italic"
              style={{ color: themeTextMuted }}
            >
              {t("commandDeck.hotkeyFootnote")}
            </p>
          </div>
        </div>

        <div>
          <h4
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: themeAccent }}
          >
            {t("commandDeck.commandRegistry")}
          </h4>
          <div className="mt-2 space-y-2">
            {commands.map((cmd) => (
              <div
                key={cmd.id}
                className="rounded px-2 py-2 text-xs"
                data-testid={`command-row-${cmd.id}`}
                style={{
                  border: `1px solid ${themeAccent}40`,
                  backgroundColor: `${themeAccent}15`,
                }}
              >
                <p
                  className="font-semibold"
                  style={{ color: themeAccent }}
                >
                  {t(`commands.${cmd.id.replace(/\./g, "_")}`) || cmd.label}
                </p>
                <p
                  className="mt-1 text-xs italic"
                  style={{ color: themeTextMuted }}
                >
                  {t("commandDeck.commandCategoryStatus", { category: cmd.category })}
                </p>
              </div>
            ))}
            <p
              className="mt-1 text-xs italic"
              style={{ color: themeTextMuted }}
            >
              {t("commandDeck.commandFootnote")}
            </p>
          </div>
        </div>

        <div>
          <h4
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: themeAccent }}
          >
            {t("commandDeck.perspectiveSystem")}
          </h4>
          <div className="mt-2 space-y-2">
            {perspectiveRegistry.perspectives.map((perspective) => (
              <div
                key={perspective.id}
                className="rounded px-2 py-2 text-xs"
                data-testid={`perspective-row-${perspective.id}`}
                style={{
                  border: `1px solid ${themeAccent}40`,
                  backgroundColor: `${themeAccent}15`,
                }}
              >
                <p
                  className="font-semibold"
                  style={{ color: themeAccent }}
                >
                  {perspective.title}
                </p>
                <p className="mt-1" style={{ color: "var(--lw-text-primary)" }}>
                  {perspective.description}
                </p>
                <p
                  className="mt-1 text-xs italic"
                  style={{ color: themeTextMuted }}
                >
                  {t("commandDeck.perspectiveCategoryStatus", { category: perspective.category, status: perspective.status })}
                </p>
                {perspective.status === "future" && (
                  <p
                    className="mt-1 text-xs italic"
                    style={{ color: themeAccent }}
                  >
                    {t("commandDeck.perspectiveLocked")}
                  </p>
                )}
              </div>
            ))}
            <p
              className="mt-1 text-xs italic"
              style={{ color: themeTextMuted }}
            >
              {t("commandDeck.perspectiveFootnote")}
            </p>
          </div>
        </div>

        <div
          className="rounded px-2 py-1 text-xs"
          style={{
            border: `1px solid ${themeAccent}40`,
            backgroundColor: `${themeAccent}15`,
            color: themeAccent,
          }}
        >
          <span className="font-semibold">{t("commandDeck.changelog36c")}</span> {t("commandDeck.changelog36cText")}
        </div>
        <div
          className="rounded px-2 py-1 text-xs"
          style={{
            border: `1px solid ${themeAccent}40`,
            backgroundColor: `${themeAccent}15`,
            color: themeAccent,
          }}
        >
          <span className="font-semibold">{t("commandDeck.changelog38")}</span> {t("commandDeck.changelog38Text")}
        </div>
      </div>
    </div>
  );
}
