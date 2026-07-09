// SPDX-License-Identifier: Apache-2.0
import { CommandDeckPanel } from "./CommandDeckPanel";

export function CommandDeckTileContent() {
  return (
    <div className="lw-command-deck-tile-content" data-testid="command-deck-panel">
      <CommandDeckPanel />
    </div>
  );
}
