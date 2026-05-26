/**
 * installOpenInIdeListener (v96)
 *
 * Installs a window-level listener for the `inspector:open-in-ide` custom event
 * dispatched by IdeTab when the user clicks "Open in editor".
 *
 * Reads `developer.preferredEditor` from the settings store, builds a URL using
 * editorTemplateRegistry, then invokes the Tauri `open_in_ide` command.
 *
 * Safe to call in browser/test environments — Tauri invoke is wrapped in try/catch
 * and silently no-ops when the Tauri IPC layer is absent.
 */

import { useSettingsStore } from "../settings/settings.store";
import { buildEditorUrl } from "./editorTemplateRegistry";
import type { EditorId } from "./editorTemplateRegistry";

let installed = false;

export function installOpenInIdeListener(): void {
  if (installed) return;
  installed = true;

  window.addEventListener("inspector:open-in-ide", async (event) => {
    const { filePath, lineNumber } = (
      event as CustomEvent<{ filePath: string; lineNumber: number }>
    ).detail;

    const { developer } = useSettingsStore.getState().settings;
    const preferredEditor = developer.preferredEditor as EditorId;
    const customTemplate = developer.customEditorTemplate;

    const url = buildEditorUrl(preferredEditor, filePath, lineNumber, customTemplate);

    try {
      const { invoke } = await import("@tauri-apps/api/core");

      if (url) {
        await invoke("open_in_ide", { url });
      } else {
        // Editors without a URL scheme (vim, neovim, system-default) — open file path
        const fileUrl = `file://${filePath}`;
        await invoke("open_in_ide", { url: fileUrl });
      }
    } catch {
      // Not in Tauri context (browser / Playwright test env) — silently no-op
    }
  });
}
