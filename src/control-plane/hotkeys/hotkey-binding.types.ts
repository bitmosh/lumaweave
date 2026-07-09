// SPDX-License-Identifier: Apache-2.0
export type HotkeyModifier = "Alt" | "Shift" | "Ctrl" | "Meta";

export type HotkeyStatus = "active" | "native" | "banned";

export interface HotkeyBinding {
  modifiers: HotkeyModifier[];
  key: string | null;
  onClick?: boolean;
}

export interface HotkeyEntry {
  id: string;
  label: string;
  category: string;
  binding: HotkeyBinding;
  status: HotkeyStatus;
  commandId?: string;
  governanceNote?: string;
}
