// SPDX-License-Identifier: Apache-2.0
/**
 * Editor Template Registry (v96)
 *
 * URL templates for opening files in supported editors.
 * Used by installOpenInIdeListener to construct the URL passed to the Tauri opener.
 * Editors without a URL scheme (vim, neovim, system-default) return null — caller
 * uses open_path instead of open_url in that case.
 */

export type EditorId =
  | "vscode"
  | "windsurf"
  | "cursor"
  | "zed"
  | "webstorm"
  | "sublime"
  | "vim"
  | "neovim"
  | "system-default"
  | "custom";

export interface EditorTemplate {
  id: EditorId;
  label: string;
  urlTemplate: string | null;
}

export const editorTemplates: Record<EditorId, EditorTemplate> = {
  vscode:           { id: "vscode",          label: "VS Code",       urlTemplate: "vscode://file/{path}:{line}" },
  windsurf:         { id: "windsurf",        label: "Windsurf",      urlTemplate: "windsurf://file/{path}:{line}" },
  cursor:           { id: "cursor",          label: "Cursor",        urlTemplate: "cursor://file/{path}:{line}" },
  zed:              { id: "zed",             label: "Zed",           urlTemplate: "zed://{path}:{line}" },
  webstorm:         { id: "webstorm",        label: "WebStorm",      urlTemplate: "webstorm://open?file={path}&line={line}" },
  sublime:          { id: "sublime",         label: "Sublime Text",  urlTemplate: "subl://{path}:{line}" },
  vim:              { id: "vim",             label: "Vim",           urlTemplate: null },
  neovim:           { id: "neovim",          label: "Neovim",        urlTemplate: null },
  "system-default": { id: "system-default",  label: "System Default", urlTemplate: null },
  custom:           { id: "custom",          label: "Custom",        urlTemplate: "{customTemplate}" },
};

export function buildEditorUrl(
  editorId: EditorId,
  filePath: string,
  lineNumber: number,
  customTemplate?: string,
): string | null {
  const template = editorTemplates[editorId];
  if (!template) return null;

  if (!template.urlTemplate) return null;

  let url = template.urlTemplate;
  if (editorId === "custom" && customTemplate) {
    url = customTemplate;
  }

  return url
    .replace("{path}", filePath)
    .replace("{line}", String(lineNumber))
    .replace("{customTemplate}", "");
}

if (
  typeof window !== "undefined" &&
  (import.meta.env.DEV || (window as any).PLAYWRIGHT)
) {
  (window as any).__lwEditorTemplateRegistry = { templates: editorTemplates, buildEditorUrl };
}
