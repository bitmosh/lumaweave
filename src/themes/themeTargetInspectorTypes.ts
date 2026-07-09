// SPDX-License-Identifier: Apache-2.0
import type { ThemeTargetContract } from "./themeTargetRegistry";
import type { ThemeTargetCandidateSignal } from "./themeTargetHeuristics";

export type ThemeTargetInspectorEntity =
  | {
      kind: "registered";
      themeTargetId: string;
      metadata?: ThemeTargetContract;
    }
  | {
      kind: "candidate";
      descriptor: string;
      dataTestId?: string | null;
      signals: ThemeTargetCandidateSignal[];
    };

export const THEME_TARGET_PIN_EVENT = "lw:theme-target-pin-change";

declare global {
  interface Window {
    __lwPinnedInspectorEntity?: ThemeTargetInspectorEntity | null;
  }
}
