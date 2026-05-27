import type { HotkeyBinding, HotkeyEntry, HotkeyModifier } from "./hotkey-binding.types";

const MODIFIER_ORDER: HotkeyModifier[] = ["Ctrl", "Meta", "Alt", "Shift"];

export function canonicalizeModifiers(modifiers: HotkeyModifier[]): HotkeyModifier[] {
  return [...modifiers].sort(
    (a, b) => MODIFIER_ORDER.indexOf(a) - MODIFIER_ORDER.indexOf(b),
  );
}

export function formatBinding(binding: HotkeyBinding): string {
  const mods = canonicalizeModifiers(binding.modifiers);
  const parts: string[] = [...mods];
  if (binding.key !== null) parts.push(binding.key);
  if (binding.onClick) parts.push("Click");
  return parts.join("+");
}

export function bindingSignature(binding: HotkeyBinding): string {
  return formatBinding({
    ...binding,
    modifiers: canonicalizeModifiers(binding.modifiers),
  });
}

export function bindingsEqual(a: HotkeyBinding, b: HotkeyBinding): boolean {
  return bindingSignature(a) === bindingSignature(b);
}

export function findCollision(
  candidate: HotkeyBinding,
  entries: readonly HotkeyEntry[],
): HotkeyEntry | null {
  for (const entry of entries) {
    if (bindingsEqual(entry.binding, candidate)) return entry;
  }
  return null;
}

export function matchesKeyEvent(binding: HotkeyBinding, e: KeyboardEvent): boolean {
  if (binding.key === null) return false;
  if (e.key.toLowerCase() !== binding.key.toLowerCase()) return false;
  const mods = binding.modifiers;
  return (
    !!e.altKey === mods.includes("Alt") &&
    !!e.shiftKey === mods.includes("Shift") &&
    !!e.ctrlKey === mods.includes("Ctrl") &&
    !!e.metaKey === mods.includes("Meta")
  );
}

export function matchesClickEvent(binding: HotkeyBinding, e: MouseEvent): boolean {
  if (!binding.onClick) return false;
  const mods = binding.modifiers;
  return (
    !!e.altKey === mods.includes("Alt") &&
    !!e.shiftKey === mods.includes("Shift") &&
    !!e.ctrlKey === mods.includes("Ctrl") &&
    !!e.metaKey === mods.includes("Meta")
  );
}
