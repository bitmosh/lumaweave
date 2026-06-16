# Investigation brief — v111.4e Vite production-preview switch

**For:** Terminal Claude · **Output:** one markdown report dropped into PK as `v111_4e_vite_preview_report.md` · **No code changes, no commits, no installs.**

v111.4 has gone through 4 amendments (a, b, c, d). All failed. Bandit's diagnosis of the final state: Vite dev-server cold-start (30-60s per `page.goto` in CI) is the load-bearing slowness; no timeout or shard count fixes it. Proposed fix: switch CI to a Vite production-preview build via `playwright.config.ts` webServer config.

This is a sound proposal in principle, but every prior amendment was also sound in principle. Pattern: confident diagnosis → config change → discover new failure mode → diagnose again. Before we authorize v111.4e, we verify the proposal against actual codebase reality.

**Hard stops:**
- No code changes. No commits. No `playwright.config.ts` edits.
- No installs. No `npm run build` execution (just read what `build` does).
- Cite file:line for every claim about current code.
- Each section asks a specific question; answer each with direct evidence.
- Where measurement is needed, mark "needs measurement, not yet performed" honestly; don't fabricate timing numbers.

---

## §1 — Current Playwright config state

1.1 Read `playwright.config.ts` end-to-end and quote in full. We need to know exactly what the `webServer` config currently looks like (if any) and what it commands.

1.2 If there IS a `webServer` block currently, what does it do? Is it pointing at `npm run dev`, `npm run preview`, something custom?

1.3 If there is NO `webServer` block currently, how does the test suite expect the dev server to be running? Is there a manual start step somewhere (in `package.json` scripts, in CI YAML, in helper code)?

1.4 What's the `baseURL` Playwright tests assert against? Quote the exact URL/port.

1.5 Are there environment-based branches in playwright.config.ts (e.g., `process.env.CI ? X : Y`)? Quote any.

---

## §2 — `npm run build` reality check

2.1 Read `package.json` and quote the `build` script. What does it actually run? (Likely `vite build` or `tsc && vite build` or similar.)

2.2 Are there any pre-build or post-build hooks (`prebuild`, `postbuild`, `generate:graph` invocations chained, etc.)? Quote them.

2.3 What's the output directory of the build? (Likely `dist/` per Vite convention, but verify in `vite.config.ts`.)

2.4 Does the build require any environment variables to succeed? Look for `import.meta.env.VITE_*` usages or any `.env` file requirements. Note any.

2.5 Estimated build duration: are there any cached prior runs of `npm run build` whose timing is known? If not, mark "needs measurement."

---

## §3 — `vite preview` reality check

3.1 Does `vite preview` work as a standalone command in this project, or does it need a `preview` script defined in `package.json`? Check `package.json` scripts.

3.2 What port does `vite preview` default to? Confirm against the test suite's expected `baseURL`. Per Vite docs, default is `4173` but configurable in `vite.config.ts`. Bandit's proposal uses port `1420`; confirm that's the LumaWeave-expected port (likely tied to Tauri's dev port).

3.3 If `vite preview` defaults to a different port than tests expect, the webServer command needs to explicitly set it. Bandit's proposal does (`npx vite preview --port 1420`). Verify the test suite agrees on 1420.

3.4 Are there any LumaWeave-specific dev-only behaviors that `vite preview` (production mode) wouldn't have? Specifically:
   - **`__lwStore`, `__lwSigma`, `__lwGraphSummary` globals** — these are referenced throughout the E2E suite (e.g., the `loadFixture` patterns in v109's adapter specs). Are they exposed in production builds, or are they dev-only? Grep for where these are assigned to `window` and check if they're guarded by `import.meta.env.DEV` or `process.env.NODE_ENV === "development"` or similar.
   - **Source maps** — tests don't usually need them, but if any test framework hooks depend on them, flag.
   - **Hot module reload** — definitely not in production. Are any tests relying on HMR behavior? (Unlikely but worth checking.)
   - **Console behavior** — production builds typically suppress some console output. Are any tests asserting on `console.error` / `console.warn`?

3.5 The most important check: **are any `data-testid` attributes conditionally rendered based on dev vs production mode?** Grep for `process.env.NODE_ENV`, `import.meta.env.DEV`, `import.meta.env.PROD`, `__DEV__`, or similar in the source tree. Each result needs evaluation: does this gate a testid or test-visible behavior?

---

## §4 — Tauri-specific concerns

4.1 LumaWeave is a Tauri app. The web E2E tests run against the dev server (or preview server), not the Tauri shell. But the source code may have Tauri-specific paths that behave differently when not inside the Tauri runtime. Grep for `window.__TAURI__`, `@tauri-apps/api`, or similar references. Are any tests affected by whether the Tauri context exists?

4.2 Self-graph fixture generation (per CI's `npm run generate:graph` step) — does the generated fixture work the same way in production builds as in dev? Verify the script outputs to a path the production build can read.

4.3 Anything else Tauri-specific that might surface only when running production-preview rather than dev?

---

## §5 — Bandit's proposal verification

Quote Bandit's exact proposed change:

```typescript
webServer: {
  command: process.env.CI
    ? "npm run build && npx vite preview --port 1420"
    : "npm run dev",
  url: "http://localhost:1420",
  reuseExistingServer: !process.env.CI,
  timeout: 120_000,
  env: { PLAYWRIGHT: "true" },
},
```

5.1 Verify each piece:
   - `process.env.CI` — does Playwright respect this? (Per Playwright docs: yes, CI is auto-set in GitHub Actions and similar.)
   - `npm run build && npx vite preview --port 1420` — does this command actually succeed when run locally? (Don't run it; reason from the package.json scripts and Vite config.)
   - `url: "http://localhost:1420"` — matches expected base URL per §1.4 and §3.2?
   - `reuseExistingServer: !process.env.CI` — correct convention: locally reuse if a dev server is running; in CI always start fresh.
   - `timeout: 120_000` — 2 minute startup budget. Reasonable for `npm run build` (30-60s typical) + `vite preview` startup (~1-2s).
   - `env: { PLAYWRIGHT: "true" }` — does the app code read `PLAYWRIGHT` anywhere? Grep. If no, this env var is harmless but unused. If yes, what does it gate?

5.2 What happens to the existing CI YAML's `npm run qa:e2e` invocation? Currently it expects an externally-managed dev server (via CI YAML running `npm run dev &` in some step, or similar). If playwright.config.ts owns the webServer lifecycle, the CI YAML changes too — does Bandit's proposal account for this?

5.3 Estimated runtime per shard if this works:
   - Build: ~30-60s (once per shard, amortized across all tests in the shard)
   - Preview startup: ~1-2s
   - Per-test: ~1-3s (vs 30-60s with dev server)
   - For ~145 tests per shard at 3s average / 4 workers = ~2 min
   - Total per shard: ~3-5 min including build overhead
   - All 5 shards in parallel: ~5 min wall-clock
   - **Bandit's projection (~5-8 min total) — is this realistic given the build cost per shard?**

5.4 Could anything in the production build *break* tests that pass in dev? List concretely:
   - Conditional testid rendering (per §3.5)
   - Console behavior differences (per §3.4)
   - Asset paths (production builds often hash filenames; do tests assert on asset paths?)
   - Service worker behavior (Vite doesn't ship one by default, but check)
   - Other potential breakage modes

---

## §6 — Alternative approaches (sanity check)

Before authorizing the prod-preview fix, briefly evaluate alternatives so we know the chosen path is the best one:

6.1 **Static file serving** — could the built artifacts be served via a simpler static server (`npx serve dist/`) rather than `vite preview`? Pros: faster startup, fewer Vite-specific concerns. Cons: no SPA fallback by default, missing Vite's preview-specific features.

6.2 **Pre-warming the dev server** — could the CI YAML run `npm run dev` in a background step and wait for it to be ready before invoking Playwright? Bandit's prior amendments tried timeouts; this approach is different (pre-warm rather than tolerate). Pros: tests run against dev mode (no production-build surprises). Cons: still slow per-test if dev server's per-request handling is the bottleneck (not just initial cold-start).

6.3 **Reducing test scope in CI** — only run the subset of tests that don't rely on full app load (e.g., unit-test-ish E2E that hits specific pages). The full suite continues to run locally. Pros: trivial implementation. Cons: bifurcates "what CI tests" vs "what dev tests" — known maintenance burden.

6.4 **Recommend with reasoning.** Given the alternatives, is the prod-preview fix still the right call, or is one of these better? Bias toward what produces a stable v1.0 path with minimum future investigation overhead.

---

## §7 — Confidence assessment

7.1 How confident are you that production-preview will work on first attempt? Scale: LOW (multiple unknowns, likely to surface new failure modes), MEDIUM (some unknowns, fix likely but verify), HIGH (well-understood, near-certain).

7.2 What are the unknown unknowns? Concretely: what could surface during the fix that we haven't anticipated? Examples of categories:
   - Testid rendering differences (production vs dev)
   - Asset loading differences (hashed filenames, lazy chunks)
   - Tauri-specific behaviors that need a real Tauri shell
   - Environment variable differences
   - Build-time failures specific to CI (no caches, fresh container)

7.3 If we authorize v111.4e and it fails, what's the next thing we'd need to investigate? Surface the next likely failure mode now so we know what to look for if it happens.

---

## §8 — Pre-flight decisions for Ryan

Aggregate findings into a clear go/no-go checklist:

1. Does the prod-preview proposal have any blocking issues? (E.g., critical dev-only globals not exposed in production builds.) If YES, name them — they need fixing in source before the CI fix can land.
2. Is the proposed `playwright.config.ts` change correct as written, or does it need amendment? (E.g., wrong port, missing env vars, doesn't account for CI YAML interaction.)
3. Does the CI YAML need any changes in conjunction with the playwright.config.ts change? (E.g., remove the existing dev server startup step; ensure CI installs Playwright browsers before webServer starts.)
4. Confidence assessment — does Terminal Claude recommend authorizing v111.4e now, or doing more verification (running the build locally, checking specific testid renders, etc.) first?
5. If we authorize and the first run fails, what's the abort condition? (Ryan's hard-stop instinct: if v111.4e fails CI, pull v111.4 entirely. Confirm or amend this stance based on findings.)

---

## Output format

One markdown file in PK as `v111_4e_vite_preview_report.md`. Eight sections (§1-§8). File:line citations for every code claim. Doc-URL citations for Playwright/Vite behavior claims. LOW/MED/HIGH confidence ratings where relevant. Honest about gaps — when something needs measurement that hasn't been done, say so.

When complete: ping back; planning Claude reads + works through §8 with Ryan; then either scopes v111.4e implementation or recommends the abort path.
