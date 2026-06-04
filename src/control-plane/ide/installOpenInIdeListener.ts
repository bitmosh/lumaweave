/**
 * installOpenInIdeListener (v96)
 *
 * Installs a window-level listener for the `inspector:open-in-ide` custom event
 * dispatched by IdeTab when the user clicks "Open in editor".
 *
 * Reads `developer.preferredEditor` from the settings store, builds a URL using
 * editorTemplateRegistry, then invokes the Tauri `open_in_ide` command.
 *
 * Resolves relative filePaths to absolute using get_project_root (cached).
 * Safe to call in browser/test environments — Tauri invoke is wrapped in try/catch
 * and silently no-ops when the Tauri IPC layer is absent.
 */

import { useSettingsStore } from "../settings/settings.store";
import { buildEditorUrl } from "./editorTemplateRegistry";
import type { EditorId } from "./editorTemplateRegistry";

let installed = false;
let projectRootCache: string | null = null;

async function getProjectRoot(): Promise<string> {
  if (projectRootCache !== null) {
    return projectRootCache;
  }

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    projectRootCache = await invoke<string>("get_project_root");
    return projectRootCache;
  } catch {
    throw new Error("Failed to get project root from Tauri");
  }
}

function resolveAbsolutePath(relativeFilePath: string, projectRoot: string): string {
  // Ensure project root doesn't end with a slash, and path doesn't start with one
  const root = projectRoot.replace(/\/$/, "");
  const path = relativeFilePath.replace(/^\//, "");
  return `${root}/${path}`;
}

export function installOpenInIdeListener(): void {
  if (installed) return;
  installed = true;

  window.addEventListener("inspector:open-in-ide", async (event) => {
    try {
      const { filePath, lineNumber } = (
        event as CustomEvent<{ filePath: string; lineNumber: number }>
      ).detail;

      const { developer } = useSettingsStore.getState().settings;
      const preferredEditor = developer.preferredEditor as EditorId;
      const customTemplate = developer.customEditorTemplate;

      // Get project root and resolve absolute path
      const projectRoot = await getProjectRoot();
      const absolutePath = resolveAbsolutePath(filePath, projectRoot);

      // Build editor URL with absolute path
      const url = buildEditorUrl(preferredEditor, absolutePath, lineNumber, customTemplate);

      const { invoke } = await import("@tauri-apps/api/core");

      if (url) {
        await invoke("open_in_ide", { url });
      } else {
        // Editors without a URL scheme (vim, neovim, system-default) — open file path
        const fileUrl = `file://${absolutePath}`;
        await invoke("open_in_ide", { url: fileUrl });
      }
    } catch (err) {
      // Log real errors; Tauri-absent (not in Tauri context) is expected in browser/Playwright
      if (err instanceof Error && err.message.includes("Failed to get project root")) {
        // Not in Tauri context — silently no-op
        return;
      }
      console.error("[open-in-ide] failed:", err);
    }
  });
}
