import { hotkeyRegistry } from "./hotkey-registry";
import { commandRegistry } from "../commands/command-registry";
import { matchesKeyEvent } from "./hotkey-utils";

let installed = false;

export function installGlobalHotkeyListener(): void {
  if (installed) return;
  installed = true;

  window.addEventListener("keydown", (e: KeyboardEvent) => {
    const tag = (e.target as Element | null)?.tagName?.toLowerCase() ?? "";
    if (tag === "input" || tag === "textarea" || tag === "select") return;

    for (const entry of hotkeyRegistry.getActive()) {
      if (matchesKeyEvent(entry.binding, e)) {
        const targetId = entry.commandId ?? entry.id;
        const cmd = commandRegistry.getById(targetId);
        if (cmd) {
          e.preventDefault();
          cmd.execute();
        }
        break;
      }
    }
  });
}
