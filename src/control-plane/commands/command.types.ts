// SPDX-License-Identifier: Apache-2.0
export type CommandCategory =
  | "view"
  | "theme"
  | "graph"
  | "inspector"
  | "physics"
  | "labels"
  | "debug"
  | "general";

export interface CommandEntry {
  id: string;
  label: string;
  category: CommandCategory;
  execute: () => void | Promise<void>;
  featureFlag?: string;
  aliases?: string[];
  description?: string;
  enabled?: () => boolean;
  currentState?: () => string;
  destructive?: boolean;
}
