import { CommandDeckPanel } from "./CommandDeckPanel";

export function CommandDeckTileContent() {
  return (
    <div className="lw-command-deck-tile-content" data-testid="command-deck-panel">
      <CommandDeckPanel />
    </div>
  );
}
