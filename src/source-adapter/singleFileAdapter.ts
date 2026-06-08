/**
 * SingleFileAdapter — abstract base class for adapters that read a single file.
 * SDK_SPEC.md v0.1 §4
 *
 * readFile() wraps the v108 read_file Tauri command, which validates paths against
 * the project root. Adapters reading user-configured external paths will use
 * read_vault_file (landing in v109.0.3) instead.
 */

import type { AdapterCapabilities, AdapterConfig, AdapterFamily } from "./baseSourceAdapter";
import type { GraphSourceSummary } from "../graph/schema/graph.types";
import { invoke, invokeReadUserFile } from "../lib/tauri-invoke";

export abstract class SingleFileAdapter {
  abstract readonly adapterId: string;
  abstract readonly adapterType: string;
  abstract readonly adapterVersion: string;
  readonly family: AdapterFamily = "single-file";
  abstract readonly capabilities: AdapterCapabilities;

  abstract load(config: AdapterConfig): Promise<GraphSourceSummary>;

  // Wraps the v108 read_file Tauri command (validates against project root).
  protected async readFile(path: string): Promise<string> {
    return invoke<string>("read_file", { path });
  }

  // Wraps read_user_file for user-supplied absolute paths (no scope restriction).
  protected async readUserFile(path: string): Promise<string> {
    return invokeReadUserFile(path);
  }
}
