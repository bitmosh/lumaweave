/**
 * DirectoryAdapter — abstract base class for adapters that read from a directory root.
 * SDK_SPEC.md v0.1 §4
 *
 * listFiles() and readVaultFile() are stubs until the list_files and read_vault_file
 * Tauri commands land in v109.0.3. The class structure ships now so v109.1 (markdown-vault)
 * can subclass it.
 */

import type { AdapterCapabilities, AdapterConfig, AdapterFamily } from "./baseSourceAdapter";
import type { GraphSourceSummary } from "../graph/schema/graph.types";

export abstract class DirectoryAdapter {
  abstract readonly adapterId: string;
  abstract readonly adapterType: string;
  abstract readonly adapterVersion: string;
  readonly family: AdapterFamily = "directory";
  abstract readonly capabilities: AdapterCapabilities;

  abstract load(config: AdapterConfig): Promise<GraphSourceSummary>;

  // Wired to list_files Tauri command in v109.0.3. Returns relative paths.
  protected async listFiles(
    _root: string,
    _extensions: string[],
    _excludePrefixes: string[],
  ): Promise<string[]> {
    throw new Error(
      "DirectoryAdapter.listFiles: not yet wired to Tauri (lands in v109.0.3)",
    );
  }

  // Wired to read_vault_file Tauri command in v109.0.3.
  protected async readVaultFile(
    _root: string,
    _relativePath: string,
  ): Promise<string> {
    throw new Error(
      "DirectoryAdapter.readVaultFile: not yet wired to Tauri (lands in v109.0.3)",
    );
  }
}
