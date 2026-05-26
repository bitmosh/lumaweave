import type { Page } from '@playwright/test';

/**
 * Open the radial inspector by Alt+Shift+clicking the topbar.
 *
 * Why this helper exists: tests historically clicked the bounding-box
 * center of `[data-lw-theme-target="topbar.root"]`. That center contains
 * interactive mirrors (theme picker, toggles, gear button) whose click
 * handlers swallow the Alt+Shift modifiers, preventing the inspector
 * from opening. This helper clicks the topbar logo region instead —
 * text-only area on the far left with no interactive children.
 *
 * Coordinates are relative to the topbar element's bounding box:
 *   x: 8   → within the topbar's 18px left padding — no child elements here,
 *            event.target is the <header> element itself. Avoids HexLogo (SVG,
 *            not HTMLElement — fails the instanceof check in resolveEntityFromEventTarget)
 *            and WordmarkBlock (its own data-lw-theme-target="topbar.wordmark",
 *            which is not a registered inspector target).
 *   y: 16  → roughly vertical center of the topbar (32px tall)
 */
export async function openInspectorOnTopbar(page: Page): Promise<void> {
  await page.locator('[data-lw-theme-target="topbar.root"]').click({
    modifiers: ['Alt', 'Shift'],
    position: { x: 8, y: 16 },
  });
}
