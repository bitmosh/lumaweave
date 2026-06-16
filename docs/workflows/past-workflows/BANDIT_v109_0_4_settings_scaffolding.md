# Bandit — v109.0.4: SourceAdapterPanel per-adapter settings scaffolding

Fourth and final commit of the v109.0 platform pass. Adds the per-adapter settings sub-panel scaffolding: a small dispatch component (`AdapterConfigForm`) backed by a registry (`adapterConfigFormRegistry`). Ships empty — no forms registered. v109.1 (markdown-vault) will register the first concrete form.

Purpose: pre-build the UI surface so v109.1's prompt is "register a vault-root text input form" rather than "add settings UI from scratch."

Basis: `~/Projects/future-integration/SDK_SPEC.md` §8 (Per-Adapter Settings Shape) + v109.0.1/0.2/0.3 commits.

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`. ONE commit this pass.

## ⏩ BANDIT PASS PREFACE
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680), commit explicit paths. 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

No semver bump (v109 arc closes at a later pass — likely v109.5 after all 4 adapters land).

## Targeted test scope

- `tests/e2e/source-adapter.spec.ts` — adapter panel surface (where the Configuration section lives)

That's it. No Rust. No schema. Single small UI scaffolding change.

NO full-suite run. If the source-adapter spec goes red: STOP and report.

## Locked decisions
- `AdapterConfigForm` is a dispatch component; registry returns `null` for adapters without a registered form (which is all of them in v109.0).
- Configuration section renders ONLY for the active adapter, not all entries.
- Empty-state has its own testid (`adapter-config-empty`) so v109.1 can assert the form replaces it.

## Pre-flight (verify, report, STOP)
1. Confirm v109.0.3 (commit `51e58f6`) is on HEAD.
2. Confirm `SourceAdapterPanel.tsx` current structure — quote the entry-card render loop. The Configuration section sits *under* the active entry's card.
3. Confirm the existing test from v107.0.3 ("Set as active" flow) — that test is preserved as-is; we add to the file, don't modify it.

## Files to commit (explicit paths only)

- `src/source-adapter/adapterConfigFormRegistry.ts` — NEW, tiny registry
- `src/source-adapter/AdapterConfigForm.tsx` — NEW, dispatch component
- `src/source-adapter/SourceAdapterPanel.tsx` — MODIFIED, render Configuration section under active entry
- `tests/e2e/source-adapter.spec.ts` — MODIFIED, add one new test for the Configuration section

DO NOT touch other files. Hard stop if scope creep.

## Implementation — `adapterConfigFormRegistry.ts` (NEW)

Tiny registry. ~20 lines.

```typescript
import type { FC } from "react";
import type { AdapterConfig } from "./baseSourceAdapter";

export interface AdapterConfigFormProps<T extends AdapterConfig = AdapterConfig> {
  config: T;
  onChange: (next: Partial<T>) => void;
}

type AdapterConfigFormComponent = FC<AdapterConfigFormProps>;

const formRegistry = new Map<string, AdapterConfigFormComponent>();

export function registerAdapterConfigForm(
  adapterId: string,
  component: AdapterConfigFormComponent,
): void {
  formRegistry.set(adapterId, component);
}

export function getAdapterConfigForm(adapterId: string): AdapterConfigFormComponent | undefined {
  return formRegistry.get(adapterId);
}
```

No subscriber pattern needed — forms register at module-init time alongside their adapters, before any render. v109.1 will call `registerAdapterConfigForm("markdown-vault", MarkdownVaultConfigForm)` from somewhere natural to the adapter's module.

## Implementation — `AdapterConfigForm.tsx` (NEW)

Dispatch component. Reads from settings, renders the matching form, or empty state if no form is registered. ~30 lines.

```typescript
import { useSettingsStore } from "../control-plane/settings/settings.store";
import { setSetting } from "../control-plane/settings/settings.store";  // or equivalent existing helper
import { getAdapterConfigForm } from "./adapterConfigFormRegistry";
import type { AdapterConfig } from "./baseSourceAdapter";

interface AdapterConfigFormHostProps {
  adapterId: string;
}

export function AdapterConfigForm({ adapterId }: AdapterConfigFormHostProps) {
  const config = useSettingsStore(
    (s) => s.sources.configurations[adapterId] ?? ({ adapterId } as AdapterConfig),
  );
  const FormComponent = getAdapterConfigForm(adapterId);
  
  if (!FormComponent) {
    return (
      <div
        data-testid="adapter-config-empty"
        className="lw-adapter-config-empty"
      >
        No configuration required for this adapter.
      </div>
    );
  }
  
  const handleChange = (next: Partial<AdapterConfig>) => {
    const merged = { ...config, ...next, adapterId } as AdapterConfig;
    // Use the canonical setSetting pattern from existing code:
    setSetting("sources.configurations", {
      ...useSettingsStore.getState().sources.configurations,
      [adapterId]: merged,
    });
  };
  
  return (
    <div data-testid={`adapter-config-${adapterId}`} className="lw-adapter-config-form">
      <FormComponent config={config} onChange={handleChange} />
    </div>
  );
}
```

**Note on `setSetting`:** confirm the exact import/usage pattern in pre-flight. The existing settings store should already have a setter for nested paths. If `setSetting("sources.configurations", {...})` isn't the right pattern, use whatever the existing code uses (e.g. `useSettingsStore.setState((s) => ({...}))` direct update). Don't invent a new pattern.

**Empty-state copy:** "No configuration required for this adapter." is reasonable for self-graph (which genuinely needs no config). It will be replaced by real forms for the 4 v109 adapters. Keep the testid `adapter-config-empty` for the spec assertion.

## Implementation — `SourceAdapterPanel.tsx` modification

Add the Configuration section render under the active entry's card. The render condition is: this entry is the currently-active adapter.

Sketch (adjust to match the actual entry-card render loop):

```typescript
{entries.map((entry) => (
  <div key={entry.adapterId} className="lw-adapter-entry">
    {/* existing entry card content */}
    
    {/* NEW: Configuration section, only for active entry */}
    {entry.adapterId === activeAdapterId && (
      <div className="lw-adapter-entry-configuration">
        <h4>Configuration</h4>
        <AdapterConfigForm adapterId={entry.adapterId} />
      </div>
    )}
  </div>
))}
```

Keep the heading text + class naming consistent with the panel's existing aesthetic. Use the existing `activeAdapterId` selector that v107.0.3 introduced.

## Implementation — E2E test addition

Add ONE new test to `tests/e2e/source-adapter.spec.ts`. Don't modify existing tests. Pseudo-code:

```typescript
test("Configuration section appears for active entry only", async ({ page }) => {
  await openSourceAdapterPanel(page);  // helper from existing tests
  
  // Self-graph is active by default
  const activeEntry = page.locator(`[data-testid="source-adapter-entry-self-graph-yaml-frontmatter"]`);
  await expect(activeEntry.getByTestId("adapter-config-empty")).toBeVisible();
  
  // Other entries do NOT have a Configuration section
  const candidateEntry = page.locator(`[data-testid="source-adapter-entry-markdown-vault"]`);
  await expect(candidateEntry.getByTestId("adapter-config-empty")).not.toBeVisible();
  await expect(candidateEntry.getByTestId("adapter-config-markdown-vault")).not.toBeVisible();
});
```

Adjust testid names + helper names to match the existing spec's conventions. The principle: assert the empty-state appears for the active entry, doesn't appear for non-active entries. v109.1's spec will assert that the empty state is *replaced* by the real markdown-vault form.

## Verify (targeted scope)

```
npm run typecheck
npx playwright test tests/e2e/source-adapter.spec.ts --reporter=line
```

Expected:
- typecheck → 0 errors
- source-adapter.spec.ts → 10 tests pass (9 existing + 1 new)

**Manual smoke (Ryan, `npm run tauri dev`):**
- Open SourceAdapterPanel. Active entry (self-graph) shows a Configuration section with the "No configuration required" empty state.
- Click "Set as active" on a candidate (e.g. markdown-vault). Its card now shows the empty state; self-graph's no longer does.
- Click back to self-graph. State reverses cleanly.
- No console errors.

## Commit
- MERGE GATE → commit (explicit paths only): `feat(v109.0.4): SourceAdapterPanel per-adapter settings scaffolding (AdapterConfigForm + registry)`
- END-OF-RUN REPORT to #changelog + bump+push gate.

## END-OF-RUN REPORT (#changelog)
- Files committed (explicit list).
- Pre-flight findings (HEAD state, `SourceAdapterPanel` structure confirmed, `setSetting` pattern used).
- Verification: typecheck + source-adapter.spec.ts pass count.
- Manual smoke notes.
- Confirmation: `adapterConfigFormRegistry` ships empty; no forms registered this commit.
- Total line count for the three new/modified files (sanity — should be small).

## Hard stops
- **Targeted-test-scope only.** Just `source-adapter.spec.ts`. Don't run the full suite.
- **NO new installs. NO new deps.**
- **NO new Rust.** This is pure frontend.
- **NO actual forms.** The registry ships empty. The 4 adapters' forms land with their respective v109.1–v109.4 passes.
- **NO `cerebra-vault` entry, no form for it.** Even though SDK_SPEC discusses sibling-module coupling, this commit adds zero Cerebra-specific code.
- Explicit-path git. Discord MCP only. No semver bump.
- If `setSetting` for nested paths isn't the existing pattern, use the existing pattern — don't invent.
- If the existing E2E spec uses helper names different from what's sketched above, match the existing conventions.
