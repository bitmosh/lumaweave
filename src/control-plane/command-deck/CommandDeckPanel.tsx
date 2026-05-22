import { CommandDeckShell } from "../command-deck/CommandDeckShell";

interface CommandDeckPanelProps {
  themeAccent: string;
  themeTextMuted: string;
  themePanelBorder: string;
}

export function CommandDeckPanel({
  themeAccent,
  themeTextMuted,
  themePanelBorder,
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
        Command Deck
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
