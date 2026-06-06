/**
 * DirectoryAdapter — abstract base class for adapters that read from a directory root.
 * SDK_SPEC.md v0.1 §4
 */

import type { AdapterCapabilities, AdapterConfig, AdapterFamily } from "./baseSourceAdapter";
import type { GraphSourceSummary } from "../graph/schema/graph.types";
import { invokeListFiles, invokeReadVaultFile } from "../lib/tauri-invoke";

export abstract class DirectoryAdapter {
  abstract readonly adapterId: string;
  abstract readonly adapterType: string;
  abstract readonly adapterVersion: string;
  readonly family: AdapterFamily = "directory";
  abstract readonly capabilities: AdapterCapabilities;

  abstract load(config: AdapterConfig): Promise<GraphSourceSummary>;

  protected async listFiles(
    root: string,
    extensions: string[],
    excludePrefixes: string[],
  ): Promise<string[]> {
    return invokeListFiles(root, extensions, excludePrefixes, 20);
  }

  protected async readVaultFile(root: string, relativePath: string): Promise<string> {
    return invokeReadVaultFile(root, relativePath);
  }
}
