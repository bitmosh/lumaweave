# Bandit — v112.3: Type spoke MVP

Third implementation pass of the v112 UI-completeness arc (first half of D3). Replaces the Type spoke's placeholder tab with a read-only typography specimen display reading from the existing `typographyRegistry`. No edit controls (those wait for the `fontAxisRegistry` to populate in a future arc).

Basis: `~/Projects/lumaweave/docs/SHIP_READINESS_ROADMAP.md` §3 (v112) + `docs/workflows/v112_0_ui_completeness_report.md` §3.2 (Type spoke) + Ryan-locked decision: MVP read-only role cards.

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680). 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

No semver bump (arc closes at v112.7).

## Locked decision

| # | Locked |
|---|---|
| D3 (Type) | MVP: read-only typography role cards from `typographyRegistry` (3 seed entries: display, body, mono). Specimen text + font family + fallback stack visible. **No edit controls.** Update placeholderMessage (already done in v112.1). |

Targeted-test-scope + CI fast-jobs only.

## v112 arc context

- v112.1 (`d5319d8`) — string scrub + 3 gwells log removals; Type spoke placeholder message already updated to "Typography controls are in development."
- v112.2 (`2823b1f`) — theme export sub-area MVP
- **v112.3 (THIS PASS)** — Type spoke MVP
- v112.3a — Motion spoke MVP (NEXT)
- v112.4 → v112.7 per ROADMAP §3

---

## Pre-flight (verify, report, STOP if diverges)

1. Confirm v112.2 (commit `2823b1f`) is on HEAD; `package.json` reads `"version": "0.18.0"`.

2. Quote `src/themes/typographyRegistry.ts` end-to-end. Confirm:
   - 3 seed entries present (`display`, `body`, `mono`)
   - Each entry's shape (family name, fallback stack, any specimen-related fields like `previewText` or sample chars)
   - The registration API (`registerTypographyRole(...)` or equivalent)
   - The query API (`getTypographyRole(id)` or `getAllRoles()` or similar)

3. Quote `src/control-plane/inspector/spokes/registerTypeSpoke.ts` current state. Per v112.1 it currently uses `makePlaceholderTab("type")` — confirm.

4. Quote `src/control-plane/inspector/tabs/PlaceholderTab.tsx` if it exists, or wherever `makePlaceholderTab` lives. This is the pattern we're replacing for Type only.

5. Identify how other working spoke tabs are registered (e.g., `registerColorSpoke.ts`, `registerGeometrySpoke.ts`). Quote one as the reference shape. The new Type spoke must register the same way — a real component, not the placeholder helper.

6. Identify where other working spokes' components live (e.g., `ColorTab.tsx`, `GeometryTab.tsx`). The new `TypeTab.tsx` (or whatever the canonical name is) lives in the same directory.

7. Identify the i18n keys currently used by the Type spoke (per the v112.0 report, `en.json:280` is `inspector.type.placeholderMessage`). Check for any other `inspector.type.*` keys. New keys for the role cards will be needed:
   - `inspector.type.title` (or section header)
   - `inspector.type.displayRole`, `inspector.type.bodyRole`, `inspector.type.monoRole` (role labels)
   - `inspector.type.specimenText` (the sample text — likely "The quick brown fox" or similar)
   - `inspector.type.fallbackStackLabel` (label for the fallback stack display)

8. Confirm CSS conventions. Check whether existing spoke tabs use co-located CSS, a shared spoke-tab stylesheet, or inline styles.

9. **STOP if any structural claim diverges from the v112.0 report or these expectations.**

---

## Files (explicit paths only)

- `src/control-plane/inspector/spokes/registerTypeSpoke.ts` — MODIFIED. Replace `makePlaceholderTab("type")` with a real component registration.
- `src/control-plane/inspector/tabs/TypeTab.tsx` — NEW (path adjusted if existing spokes use a different directory; pre-flight confirms).
- `src/i18n/manifests/en.json` — ADD `inspector.type.*` keys for role cards, specimen text, fallback stack label.
- CSS (location TBD per pre-flight) — ADD `.lw-type-tab*` rules if needed.
- `tests/e2e/inspector-type-spoke.spec.ts` — NEW. 3-4 small tests verifying role cards render correctly.

Nothing else modified.

---

## Step 1 — TypeTab component shape

The MVP UI:

```tsx
function TypeTab() {
  const { t } = useTranslation();
  const roles = useMemo(() => getAllTypographyRoles(), []);
  // Or whatever the canonical query is. Pre-flight identifies.
  // If the API is one-at-a-time: const display = getTypographyRole("display"); etc.
  
  if (roles.length === 0) {
    return (
      <div className="lw-type-tab-empty">
        <p>{t("inspector.type.placeholderMessage")}</p>
      </div>
    );
  }
  
  return (
    <div className="lw-type-tab" data-testid="inspector-type-tab">
      {roles.map((role) => (
        <TypeRoleCard key={role.id} role={role} />
      ))}
    </div>
  );
}

function TypeRoleCard({ role }: { role: TypographyRole }) {
  const { t } = useTranslation();
  const specimenText = t("inspector.type.specimenText");  // e.g. "The quick brown fox jumps over the lazy dog"
  
  return (
    <div className="lw-type-role-card" data-testid={`type-role-card-${role.id}`}>
      <div className="lw-type-role-label">
        {t(`inspector.type.${role.id}Role`) ?? role.id}
        {/* Falls back to the raw id if i18n key missing */}
      </div>
      <div
        className="lw-type-role-specimen"
        style={{
          fontFamily: `${role.family}, ${role.fallbackStack ?? "sans-serif"}`,
          // The role's actual font family with its fallback chain
        }}
      >
        {specimenText}
      </div>
      <div className="lw-type-role-meta">
        <span className="lw-type-role-family">{role.family}</span>
        {role.fallbackStack && (
          <span className="lw-type-role-fallback">
            <span className="lw-type-role-fallback-label">
              {t("inspector.type.fallbackStackLabel")}:
            </span>{" "}
            <span className="lw-type-role-fallback-value">{role.fallbackStack}</span>
          </span>
        )}
      </div>
    </div>
  );
}
```

**Pre-flight confirms the exact shape of `TypographyRole`** — the field names (`family`, `fallbackStack`, etc.) may differ in the actual registry. The component reads whatever the registry provides; don't fabricate field names.

**The specimen string is rendered in the role's actual font family.** Each card shows the same text but in different typography roles. This is the value of the MVP — users *see* the typography ramp visually.

---

## Step 2 — registerTypeSpoke.ts update

Replace the placeholder tab registration with a real component reference.

**Current shape (per v112.1):**
```typescript
{
  id: "type",
  // ...
  tab: makePlaceholderTab("type"),
  placeholderMessage: "Typography controls are in development.",
  // ...
}
```

**New shape (match other working spokes' registration pattern from pre-flight):**
```typescript
import { TypeTab } from "../tabs/TypeTab";

// In the registry entry:
{
  id: "type",
  // ...
  tab: TypeTab,
  // ... keep placeholderMessage for accessibility/fallback rendering if the working spoke pattern uses it
}
```

**Pre-flight provides the exact pattern** — some spokes may use `tab: () => <TypeTab />` (factory) instead of `tab: TypeTab` (component reference). Match whatever the working spokes use.

The `placeholderMessage` field stays in the entry even though TypeTab now renders real content — the message is the empty-state fallback if the registry returns no roles for any reason. TypeTab uses it in the `roles.length === 0` branch.

---

## Step 3 — i18n keys

Add to `src/i18n/manifests/en.json` under `inspector.type` (this object already exists per v112.1 — extend it):

```json
"inspector": {
  "...": "(existing keys preserved)",
  "type": {
    "placeholderMessage": "Typography controls are in development.",
    "displayRole": "Display",
    "bodyRole": "Body",
    "monoRole": "Mono",
    "specimenText": "The quick brown fox jumps over the lazy dog",
    "fallbackStackLabel": "Fallback"
  }
}
```

The specimen text is intentionally pangrammatic — covers all 26 letters so users see how each role handles the full alphabet. Standard typography convention.

---

## Step 4 — CSS

Per pre-flight, match the existing spoke-tab CSS convention. Likely rules needed:

```css
.lw-type-tab {
  /* spacing: stacked vertically, padded */
}

.lw-type-role-card {
  /* card-like with subtle border or background, padding, margin between cards */
}

.lw-type-role-label {
  /* small caps or smaller weight; tertiary visual hierarchy */
}

.lw-type-role-specimen {
  /* the big visual — generous font size (e.g. 1.5rem-2rem), the role's font family applied inline */
  /* No max-width truncation — let the specimen breathe */
}

.lw-type-role-meta {
  /* small text, secondary color */
}

.lw-type-role-fallback {
  /* subtle styling for the fallback stack info */
}
```

**Match the existing spoke-tab aesthetic.** ColorTab.css or GeometryTab.css are the reference. Use existing `--lw-*` token variables for colors and spacing — don't hardcode hex/px values.

---

## Step 5 — E2E spec

`tests/e2e/inspector-type-spoke.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Inspector Type spoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Open the radial inspector via the standard helper (pre-flight identifies it)
    // ...
    // Activate the Type spoke
    await page.getByTestId("inspector-spoke-type").click();
  });

  test("Type tab renders 3 role cards", async ({ page }) => {
    await expect(page.getByTestId("inspector-type-tab")).toBeVisible();
    await expect(page.getByTestId("type-role-card-display")).toBeVisible();
    await expect(page.getByTestId("type-role-card-body")).toBeVisible();
    await expect(page.getByTestId("type-role-card-mono")).toBeVisible();
  });

  test("each role card shows specimen text", async ({ page }) => {
    const specimen = "The quick brown fox jumps over the lazy dog";
    await expect(
      page.getByTestId("type-role-card-display").getByText(specimen)
    ).toBeVisible();
    await expect(
      page.getByTestId("type-role-card-body").getByText(specimen)
    ).toBeVisible();
    await expect(
      page.getByTestId("type-role-card-mono").getByText(specimen)
    ).toBeVisible();
  });

  test("specimen text uses the role's font family", async ({ page }) => {
    const monoCard = page.getByTestId("type-role-card-mono");
    const specimen = monoCard.locator(".lw-type-role-specimen");
    // The mono role's font-family inline style should contain the registered mono family
    // Pre-flight confirms the exact family name (e.g. "IBM Plex Mono")
    await expect(specimen).toHaveCSS("font-family", /IBM Plex Mono|monospace/i);
  });

  test("placeholder message is no longer visible (real content renders)", async ({ page }) => {
    await expect(
      page.getByText("Typography controls are in development.")
    ).not.toBeVisible();
  });
});
```

The 4th test verifies the v112.1 placeholder is no longer the active content — confirms the spoke graduated from stub to MVP.

---

## Step 6 — Verify

```bash
npm run typecheck
npm run lint:css
npx playwright test tests/e2e/inspector-type-spoke.spec.ts --reporter=line
```

Expected:
- typecheck → 0 errors
- lint:css → 0/0
- inspector-type-spoke.spec.ts → 4/4 pass

**Manual smoke (Ryan, `npm run tauri dev`):**
1. Open the radial inspector. Click the Type spoke (formerly stubbed).
2. Confirm 3 role cards appear: Display, Body, Mono.
3. Each card shows "The quick brown fox..." in the role's actual font family.
4. The font families look visually distinct (Display vs Body vs Mono should be clearly different).
5. The metadata under each specimen shows the family name + fallback stack.
6. No "Typography controls are in development." message appears — the real content has replaced it.

---

## Commit

MERGE GATE → commit (explicit paths only):
`feat(v112.3): inspector Type spoke MVP — read-only typography role cards`

END-OF-RUN REPORT to #changelog with SHA + bump+push gate.

---

## END-OF-RUN REPORT (required content)

- Pre-flight findings (typographyRegistry shape, existing spoke registration pattern, i18n location, CSS convention)
- The TypeTab component path and shape
- The 5 new i18n keys added
- typecheck + lint:css confirmation
- 4 E2E test results
- Manual smoke confirmation
- Any deviations (e.g., different registry API shape than expected, additional CSS file needed)

---

## Hard stops

- **Only the named files are modified.** No other spoke files, no registry-shape changes.
- **No edit controls.** Read-only MVP only. Pickers, sliders, axis controls all wait for the future Typography arc.
- **No font loading.** The fonts are already loaded by the existing typography registry; this commit displays what's already there.
- **No changes to `typographyRegistry.ts`.** The existing 3 seed entries are used as-is. Adding more roles is a future arc.
- **Match existing spoke patterns.** If ColorTab registers via `tab: ColorTab`, TypeTab uses the same shape. Don't invent a new registration shape.
- **CSS uses `--lw-*` tokens.** No hardcoded colors or spacing values. Match the theme system.
- **The specimen text is exact:** "The quick brown fox jumps over the lazy dog" — pangrammatic, no period changes, no localization speculation for v1.0.
- **The placeholderMessage stays in the registry entry** — used as the empty-state fallback if the typography registry returns no roles for any reason. Don't delete it.
- No new dependencies. No new Rust. No semver bump. No NOW.md / ROADMAP edits.
- Explicit-path git. Discord MCP only.
- Targeted-test-scope only.
