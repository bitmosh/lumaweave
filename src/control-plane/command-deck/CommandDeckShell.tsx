import { perspectiveRegistry } from "../perspectives/perspectiveRegistry";
import { hotkeyRegistry } from "../hotkeys/hotkey-registry";
import { commandRegistry } from "../commands/command-registry";
import { formatBinding } from "../hotkeys/hotkey-utils";

interface CommandDeckShellProps {
  themeAccent: string;
  themeTextMuted: string;
}

export function CommandDeckShell({
  themeAccent,
  themeTextMuted,
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
                  {cmd.label}
                </p>
                <p
                  className="mt-1 text-xs italic"
                  style={{ color: themeTextMuted }}
                >
                  Category: {cmd.category} | Status: Eligible
                </p>
              </div>
            ))}
            <p
              className="mt-1 text-xs italic"
              style={{ color: themeTextMuted }}
            >
              Command registry is read-only. No commands can be executed.
            </p>
          </div>
        </div>

        <div>
          <h4
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: themeAccent }}
          >
            Perspective System
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
                  Category: {perspective.category} | Status: {perspective.status}
                </p>
                {perspective.status === "future" && (
                  <p
                    className="mt-1 text-xs italic"
                    style={{ color: themeAccent }}
                  >
                    Locked in v38 - requires explicit contract
                  </p>
                )}
              </div>
            ))}
            <p
              className="mt-1 text-xs italic"
              style={{ color: themeTextMuted }}
            >
              Perspective registry is read-only. No perspective switching.
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
        <div
          className="rounded px-2 py-1 text-xs"
          style={{
            border: `1px solid ${themeAccent}40`,
            backgroundColor: `${themeAccent}15`,
            color: themeAccent,
          }}
        >
          <span className="font-semibold">v38:</span> Perspective System v0
        </div>
      </div>
    </div>
  );
}
