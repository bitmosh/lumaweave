import { CommandDeckShell } from "../command-deck/CommandDeckShell";
import { t } from "../../i18n";

interface CommandDeckPanelProps {
  themeAccent?: string;
  themeTextMuted?: string;
  themePanelBorder?: string;
}

export function CommandDeckPanel({
  themeAccent = "var(--lw-accent, #FFB347)",
  themeTextMuted = "var(--lw-text-muted, rgba(255,179,71,0.45))",
  themePanelBorder = "rgba(255,179,71,0.32)",
}: CommandDeckPanelProps) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        border: `1px solid ${themePanelBorder}`,
        backgroundColor: `rgba(var(--lw-panel-background), 0.7)`,
      }}
    >
      <h3
        className="mb-2 text-sm font-semibold"
        style={{ color: "var(--lw-text-primary)" }}
      >
        {t("commandDeck.title")}
      </h3>
      <div className="min-h-0">
        <CommandDeckShell
          themeAccent={themeAccent}
          themeTextMuted={themeTextMuted}
        />
      </div>
    </div>
  );
}
