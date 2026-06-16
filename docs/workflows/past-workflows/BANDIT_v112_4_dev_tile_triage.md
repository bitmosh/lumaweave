# Bandit — v112.4: dev tile triage

Fourth implementation pass of the v112 UI-completeness arc. Adds a `dev-mode` settings toggle, gates three internal tile sections behind it (QaPanel, system-index, graph-visual-inventory), and renames Command Deck to "Keyboard Shortcuts" with the dev mode UI integration. Two commits — settings infrastructure first, then tile triage.

Basis: `~/Projects/lumaweave/docs/SHIP_READINESS_ROADMAP.md` §3 (v112) + `docs/workflows/v112_0_ui_completeness_report.md` §5 (dev tooling tile triage) + Ryan-locked decisions on D5: dev-gate via settings store toggle, Command Deck rename to "Keyboard Shortcuts."

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE (each commit)
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680). 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

No semver bump (arc closes at v112.6, renumbered from v112.7).

## v112 arc context (post-v112.4-skip renumber)

- v112.1 (`d5319d8`) — string scrub + 3 gwells log removals
- v112.2 (`2823b1f`) — theme export sub-area MVP
- v112.3 (`92c6696`) — Type spoke MVP
- v112.3a (`874ef58`) — Motion spoke MVP
- ~~v112.4 — Bookmarks placeholder~~ (SKIPPED, deferred to Theme menu population audit)
- **v112.4 (THIS PASS)** — dev tile triage (was v112.5 in report)
- v112.5 — agent chat MVP (was v112.6)
- v112.6 — arc close (was v112.7)

## Locked decisions

| # | Locked |
|---|---|
| D5.1 | QaPanel: **dev-gate** via new settings toggle |
| D5.2 | system-index: **dev-gate** |
| D5.3 | graph-visual-inventory: **dev-gate** |
| D5.4 | Command Deck: **rename to "Keyboard Shortcuts"** + remove dev-only test surfaces; remains user-facing |
| Mechanism | **Settings store toggle** (not URL param, not build-time flag). Default OFF in shipped state; toggleable in Settings → Advanced or similar. |

Targeted-test-scope + CI fast-jobs only.

---

## Commit 1 — `feat(v112.4.0): dev-mode settings toggle + tile section gating infrastructure`

Adds the settings schema field, default value, UI toggle for enabling dev mode, and the gating mechanism that tile sections will consume. No tile section content changes yet — just infrastructure.

### Pre-flight (verify, report, STOP if diverges)

1. Confirm v112.3a (commit `874ef58`) is on HEAD; `package.json` reads `"version": "0.18.0"`.

2. Read `src/control-plane/settings/settings.schema.ts` end-to-end. Identify:
   - The top-level settings shape (`LumaWeaveSettings` after v110.1's rename)
   - Whether `developer` or `dev` or `advanced` sections already exist
   - The migration pattern (current schema version, how previous migrations added fields)

3. Read `src/control-plane/settings/settings.defaults.ts`. Identify how defaults are structured. The new `dev.mode` (or `developer.mode` — whichever the existing convention prefers) defaults to `false`.

4. Read `src/control-plane/settings/settings.migrations.ts`. Identify the next migration number (current is v93 per project knowledge; v112.4.0 adds v94).

5. Find `tileSectionRegistry.ts`. Quote how tile sections are currently registered and rendered. Specifically:
   - The shape of a tile section entry (`id`, `title`, render function, etc.)
   - How active tile sections are determined (registered = visible, or filtered by some condition?)
   - Whether there's a `category` or `visibility` field already that this work can hook into vs. requiring a new field

6. Identify all four tile sections being affected. Quote each registration entry:
   - QaPanel (likely `tileSectionRegistry.ts` near a `qa-feedback` or `qa-panel` id)
   - system-index
   - graph-visual-inventory
   - command-deck

7. Find the Settings → Advanced category (per project knowledge, `CategoryAdvanced.tsx` exists). Confirm it's the right home for the dev-mode toggle. If not, identify whichever Settings category is appropriate.

8. **STOP if any structural claim diverges.** The settings schema migration is the load-bearing piece — getting it wrong breaks v89+ user settings on next load.

### Files (explicit paths only — Commit 1)

- `src/control-plane/settings/settings.schema.ts` — ADD `dev.mode: boolean` field (or `developer.mode`, matching convention)
- `src/control-plane/settings/settings.defaults.ts` — ADD default `false`
- `src/control-plane/settings/settings.migrations.ts` — ADD v93 → v94 migration that backfills `dev.mode = false`
- `src/control-plane/settings/categories/CategoryAdvanced.tsx` — ADD a "Developer Mode" toggle row
- `src/tiles/tileSectionRegistry.ts` — ADD a `requiresDevMode?: boolean` field to the tile section entry shape; ADD a hook/selector to filter tile sections by dev-mode state
- `src/i18n/manifests/en.json` — ADD `settings.advanced.devMode.{label,description,hint}` keys
- `tests/e2e/settings-dev-mode.spec.ts` — NEW. 3-4 tests verifying toggle + tile filtering.

### Step 1 — Settings schema + migration

```typescript
// settings.schema.ts — add to LumaWeaveSettings
{
  // ... existing fields preserved
  dev: {
    mode: boolean;  // defaults to false; enables dev-only UI surfaces
  };
}
```

```typescript
// settings.defaults.ts — add to defaults
{
  // ... existing defaults preserved
  dev: {
    mode: false,
  },
}
```

```typescript
// settings.migrations.ts — new migration v93 → v94
{
  version: 94,
  migrate: (settings) => ({
    ...settings,
    dev: settings.dev ?? { mode: false },
  }),
}
```

**Pre-flight verifies the exact migration shape** — some migrations use a different pattern (e.g., partial updates instead of spread). Match the existing convention.

### Step 2 — CategoryAdvanced toggle UI

Add a toggle row to `CategoryAdvanced.tsx`:

```tsx
function DevModeToggle() {
  const { t } = useTranslation();
  const devMode = useSettingsStore((s) => s.settings.dev?.mode ?? false);
  const setSetting = useSettingsStore((s) => s.setSetting);
  
  return (
    <SettingsRow
      label={t("settings.advanced.devMode.label")}
      description={t("settings.advanced.devMode.description")}
      hint={t("settings.advanced.devMode.hint")}
    >
      <input
        type="checkbox"
        data-testid="settings-dev-mode-toggle"
        checked={devMode}
        onChange={(e) => setSetting("dev.mode", e.target.checked)}
      />
    </SettingsRow>
  );
}
```

Match the existing `SettingsRow` component conventions per pre-flight. The exact shape may differ.

### Step 3 — Tile registry filtering

In `tileSectionRegistry.ts`:

```typescript
// Extend the tile section entry shape
type TileSectionEntry = {
  id: string;
  title: string;
  // ... existing fields
  requiresDevMode?: boolean;  // NEW — if true, tile only renders when dev.mode is enabled
};

// Where tile sections are consumed (likely a hook or filter):
function useVisibleTileSections(): TileSectionEntry[] {
  const all = useTileSectionRegistry();
  const devMode = useSettingsStore((s) => s.settings.dev?.mode ?? false);
  return all.filter((entry) => !entry.requiresDevMode || devMode);
}
```

The actual hook/selector mechanism depends on the registry's current API. Pre-flight identifies whether to add a filter function inside the registry, a wrapper hook, or update the consumer site directly. **Goal: any tile section flagged `requiresDevMode: true` is hidden by default and revealed when the toggle is on.**

### Step 4 — i18n keys

```json
"settings": {
  "advanced": {
    "...": "(existing keys preserved)",
    "devMode": {
      "label": "Developer Mode",
      "description": "Enable internal tools and diagnostics.",
      "hint": "Reveals QA panels, system indexes, and other internal surfaces useful for debugging or contributing."
    }
  }
}
```

### Step 5 — E2E spec

```typescript
import { test, expect } from "@playwright/test";

test.describe("Dev mode settings toggle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Open Settings → Advanced (pre-flight identifies the helper)
  });

  test("dev mode toggle is off by default", async ({ page }) => {
    const toggle = page.getByTestId("settings-dev-mode-toggle");
    await expect(toggle).toBeVisible();
    await expect(toggle).not.toBeChecked();
  });

  test("toggling dev mode persists to settings store", async ({ page }) => {
    const toggle = page.getByTestId("settings-dev-mode-toggle");
    await toggle.click();
    
    const state = await page.evaluate(() =>
      window.__lwStore.getState().settings.dev?.mode
    );
    expect(state).toBe(true);
  });

  test("dev mode default migration v93 → v94 produces { mode: false }", async ({ page }) => {
    // Programmatically set settings to v93 shape (no dev field), trigger migration, verify v94 result
    // Pre-flight identifies the migration test helper if one exists; otherwise inline the verification
  });

  test("tile sections flagged requiresDevMode are not visible by default", async ({ page }) => {
    // Pre-flight identifies which tile sections will be flagged in Commit 2
    // For now this test can be a stub that verifies the filter mechanism with a test fixture
  });
});
```

### Verify (Commit 1)

```bash
npm run typecheck
npm run lint:css
npx playwright test tests/e2e/settings-dev-mode.spec.ts --reporter=line
```

Expected: all clean. 3-4 tests pass.

### Commit 1
MERGE GATE → commit (explicit paths only):
`feat(v112.4.0): dev-mode settings toggle + tile section gating infrastructure`
END-OF-RUN REPORT to #changelog + bump+push gate.

### Hard stops (Commit 1)
- **No tile section content changes in this commit.** Just infrastructure: schema, default, migration, UI toggle, registry filter mechanism. The four tile section entries get the `requiresDevMode: true` flag in Commit 2.
- **No new dependencies.** No new Rust.
- **Migration version is sequential.** If current schema is at v93, the new one is v94. Don't skip numbers.
- **Default is `false`.** Dev mode off in shipped state; users opt in.
- **The toggle must use `setSetting()` per the established convention.** Match v112.2 / v112.3a patterns.

---

## Commit 2 — `feat(v112.4.1): dev-gate QaPanel + system-index + graph-visual-inventory; rename command-deck to Keyboard Shortcuts`

Flags the three internal tiles as `requiresDevMode: true`. Renames the command-deck tile section to "Keyboard Shortcuts" with user-facing framing.

### Pre-flight (Commit 2)

1. Confirm Commit 1 lands cleanly.

2. Quote each of the four tile section registrations from `tileSectionRegistry.ts`:
   - `qa-panel` (or `qa-feedback` — exact id)
   - `system-index`
   - `graph-visual-inventory`
   - `command-deck`

3. Identify any tile section *content components* that have dev-only test surfaces in addition to user-facing function. Specifically:
   - QaPanel — likely all dev surface; the flag covers everything
   - command-deck — has the keyboard shortcuts list (user-facing) + possibly some dev-only diagnostics. If the dev-only diagnostics need separate gating, flag during pre-flight.

4. Find the i18n string for command-deck's tile title (e.g., `tiles.commandDeck.title`). Confirm it currently says something like "Command Deck" — needs renaming to "Keyboard Shortcuts."

5. Identify all E2E specs that reference the four tile sections by name or testid. If any assert on `"Command Deck"` text, those need updating.

### Files (explicit paths only — Commit 2)

- `src/tiles/tileSectionRegistry.ts` — ADD `requiresDevMode: true` to qa-panel, system-index, graph-visual-inventory entries
- `src/control-plane/commands/command-registry.entries.ts` (if applicable) — RENAME any command opening command-deck to use the new label
- `src/i18n/manifests/en.json` — UPDATE the command-deck tile title to "Keyboard Shortcuts"; possibly rename the i18n key from `tiles.commandDeck.*` to `tiles.keyboardShortcuts.*` if the naming convention prefers
- Affected E2E specs — UPDATE assertions that reference "Command Deck" text or the old i18n key path
- `tests/e2e/settings-dev-mode.spec.ts` — EXTEND (from Commit 1) to add a real test for the three dev-gated tiles being hidden by default and visible when dev mode is on

### Step 1 — Tile section gating

```typescript
// tileSectionRegistry.ts
{
  id: "qa-panel",
  // ... existing fields
  requiresDevMode: true,  // NEW
},
{
  id: "system-index",
  // ... existing fields
  requiresDevMode: true,  // NEW
},
{
  id: "graph-visual-inventory",
  // ... existing fields
  requiresDevMode: true,  // NEW
},
```

command-deck does NOT get the flag — it stays user-facing. Just the rename:

```typescript
// If the tile registration has its own title:
{
  id: "command-deck",
  title: t("tiles.commandDeck.title"),  // i18n still resolves; just the value changes
  // ...
}
```

### Step 2 — Command Deck → Keyboard Shortcuts rename

Approach: change the i18n value, NOT the id/key paths (preserving stable internal identifiers while changing user-visible strings).

```json
"tiles": {
  "commandDeck": {
    "title": "Keyboard Shortcuts"  // was "Command Deck"
  }
}
```

This keeps `tiles.commandDeck.*` as the key path (internal identifier) while users see "Keyboard Shortcuts" in the UI. Future renaming of the key path itself is a separate concern.

If there are tooltips, descriptions, or other user-visible strings under `tiles.commandDeck.*`, update them to use "Keyboard Shortcuts" language too. Pre-flight enumerates them.

### Step 3 — E2E spec updates

Find any specs asserting on "Command Deck" text. Update to "Keyboard Shortcuts." Likely affected:
- Any spec that opens the command-deck tile via title text
- Any spec asserting on the tile palette / picker listing it

### Step 4 — Extend dev-mode E2E spec

In `tests/e2e/settings-dev-mode.spec.ts`, add real tests now that tile flags exist:

```typescript
test("QaPanel tile is hidden when dev mode is off", async ({ page }) => {
  // Verify the qa-panel tile section is NOT in the tile palette / picker
});

test("QaPanel tile appears when dev mode is enabled", async ({ page }) => {
  await page.getByTestId("settings-dev-mode-toggle").click();
  // Verify the qa-panel tile section IS now in the tile palette / picker
});

test("Command Deck tile is visible regardless of dev mode (renamed to Keyboard Shortcuts)", async ({ page }) => {
  // dev mode off
  await expect(page.getByText("Keyboard Shortcuts")).toBeVisible();
  await expect(page.getByText("Command Deck")).not.toBeVisible();
});
```

### Verify (Commit 2)

```bash
npm run typecheck
npm run lint:css
npx playwright test tests/e2e/settings-dev-mode.spec.ts --reporter=line
# Plus any affected specs from Step 3:
npx playwright test tests/e2e/<affected-spec>.spec.ts --reporter=line
```

Expected: all clean.

**Manual smoke (Ryan, `npm run tauri dev`):**
1. Open Settings → Advanced. Confirm Developer Mode toggle is OFF.
2. Open the tile palette (or wherever tile sections are picked). Confirm QaPanel, system-index, graph-visual-inventory are NOT visible. Confirm command-deck appears as "Keyboard Shortcuts."
3. Toggle Developer Mode ON.
4. Re-open tile palette. Confirm QaPanel, system-index, graph-visual-inventory are now visible (in addition to all the user-facing tiles).
5. Toggle Developer Mode OFF. Confirm the dev tiles disappear again.

### Commit 2
MERGE GATE → commit (explicit paths only):
`feat(v112.4.1): dev-gate internal tiles (QaPanel + system-index + graph-visual-inventory); rename Command Deck → Keyboard Shortcuts`
END-OF-RUN REPORT to #changelog + bump+push gate.

### Hard stops (Commit 2)
- **Only the named files are modified.** No reshuffling of the four tile section entries' other fields.
- **command-deck does NOT get the dev flag.** It stays user-facing. Only the user-visible label changes.
- **Internal id/key paths preserved.** Keys remain `tiles.commandDeck.*`; only the *value* changes to "Keyboard Shortcuts." Renaming keys is a separate concern (and adds churn).
- **The three dev-gated tiles' content components don't change.** Just the registration flag. The components render the same when visible; visibility is controlled at the registry level.
- **Update every E2E spec affected by the Command Deck → Keyboard Shortcuts rename.** Missed assertions cause CI failures.

---

## END-OF-RUN REPORTS (each commit)

Files committed, pre-flight findings, verification results, manual smoke notes, any deviations.

**Final report (after Commit 2):**
- v112.4 complete; v112.5 (agent chat MVP) is next
- Dev mode toggle infrastructure in place + 3 tiles gated + Command Deck renamed
- Settings schema at v94
- KNOWN_SHARP_EDGES candidates surfaced (if any) for v112.6 arc close

## Hard stops (arc-level)
- Targeted-test-scope + CI fast-jobs only.
- No installs. No new deps. No new Rust.
- No semver bump (v112.6 handles).
- Explicit-path git. Discord MCP only.
- Migration version must be sequential (v93 → v94).
- Dev mode default is `false`. Don't ship enabled.
