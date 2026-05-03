interface CommandDeckShellProps {
  themeAccent: string;
  themeTextMuted: string;
}

export function CommandDeckShell({
  themeAccent,
  themeTextMuted,
}: CommandDeckShellProps) {
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
            Status
          </h4>
          <p
            className="mt-1 text-xs"
            style={{ color: "var(--lw-text-primary)" }}
          >
            Read-Only Shell
          </p>
        </div>

        <div>
          <h4
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: themeAccent }}
          >
            Contract Boundary
          </h4>
          <p
            className="mt-1 text-xs"
            style={{ color: themeTextMuted }}
          >
            Command execution is locked/deferred to v37 or later.
          </p>
        </div>

        <div>
          <h4
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: themeAccent }}
          >
            Description
          </h4>
          <p
            className="mt-1 text-xs"
            style={{ color: "var(--lw-text-primary)" }}
          >
            The Command Deck is a discovery surface for available actions. In
            v36, it displays only passive metadata. No commands can be executed
            from this interface.
          </p>
        </div>

        <div>
          <h4
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: themeAccent }}
          >
            Hotkey Registry
          </h4>
          <div className="mt-2 space-y-2">
            <div
              className="rounded px-2 py-1 text-xs"
              style={{
                border: `1px solid ${themeAccent}40`,
                backgroundColor: `${themeAccent}15`,
                color: themeAccent,
              }}
            >
              <span className="font-semibold">Alt+Shift+I</span>: Inspector
              Toggle
            </div>
            <div
              className="rounded px-2 py-1 text-xs"
              style={{
                border: `1px solid ${themeAccent}40`,
                backgroundColor: `${themeAccent}15`,
                color: themeAccent,
              }}
            >
              <span className="font-semibold">Alt+Shift+P</span>: Pin/Unpin
              Target
            </div>
            <p
              className="mt-1 text-xs italic"
              style={{ color: themeTextMuted }}
            >
              No new hotkeys may be added without registry approval.
            </p>
          </div>
        </div>

        <div>
          <h4
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: themeAccent }}
          >
            Command Registry
          </h4>
          <div className="mt-2 space-y-2">
            <div
              className="rounded px-2 py-2 text-xs"
              style={{
                border: `1px solid ${themeAccent}40`,
                backgroundColor: `${themeAccent}15`,
              }}
            >
              <p
                className="font-semibold"
                style={{ color: themeAccent }}
              >
                Export Theme Override Bundle
              </p>
              <p className="mt-1" style={{ color: "var(--lw-text-primary)" }}>
                Export current theme overrides to a JSON bundle file
              </p>
              <p
                className="mt-1 text-xs italic"
                style={{ color: themeTextMuted }}
              >
                Category: Theme | Status: Eligible
              </p>
            </div>
            <div
              className="rounded px-2 py-2 text-xs"
              style={{
                border: `1px solid ${themeAccent}40`,
                backgroundColor: `${themeAccent}15`,
              }}
            >
              <p
                className="font-semibold"
                style={{ color: themeAccent }}
              >
                Toggle Theme Target Inspector
              </p>
              <p className="mt-1" style={{ color: "var(--lw-text-primary)" }}>
                Enable or disable the theme target inspector overlay
              </p>
              <p
                className="mt-1 text-xs italic"
                style={{ color: themeTextMuted }}
              >
                Category: View | Status: Eligible | Shortcut: Alt+Shift+I
              </p>
            </div>
            <p
              className="mt-1 text-xs italic"
              style={{ color: themeTextMuted }}
            >
              Command registry is read-only. No commands can be executed.
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
          <span className="font-semibold">v36c:</span> Command Registry
          Metadata
        </div>
      </div>
    </div>
  );
}
