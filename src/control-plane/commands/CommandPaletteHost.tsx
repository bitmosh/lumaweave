import { useCommandPaletteState } from "./palette/useCommandPaletteState";
import { CommandPalette } from "./CommandPalette";

export function CommandPaletteHost() {
  const state = useCommandPaletteState();

  if (!state.isOpen) return null;

  return <CommandPalette state={state} />;
}
