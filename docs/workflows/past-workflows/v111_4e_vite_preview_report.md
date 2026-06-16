# Investigation Report — v111.4e Vite Production-Preview Switch

**Date:** 2026-06-09 · **Author:** Terminal Claude · **Input:** `INVESTIGATION_v111_4e_vite_preview.md`

---

## §1 — Current Playwright config state

**1.1 playwright.config.ts in full:**

```typescript
import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: "http://localhost:1420",
    trace: "on-first-retry",
    screenshot: "off",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:1420",
    reuseExistingServer: true,
    timeout: 120_000,
    env: { PLAYWRIGHT: "true" },
  },
});
```

**1.2** The `webServer` block exists. It runs `npm run dev` (Vite dev server), which is exactly the slow path that breaks CI.

**1.3** N/A — webServer block is present.

**1.4** `baseURL: "http://localhost:1420"` (`playwright.config.ts:10`).

**1.5** No CI-conditional branches in playwright.config.ts. The entire config is static.

---

## §2 — `npm run build` reality check

**2.1** From `package.json`:
```
build: tsc && vite build
```
Runs TypeScript compilation first, then Vite bundling.

**2.2** No prebuild/postbuild hooks in `package.json`. No `generate:graph` is chained into the build script. The CI YAML handles fixture generation as a separate explicit step before invoking `npm run qa:e2e`.

**2.3** No `build.outDir` in `vite.config.ts`. Defaults to Vite's standard: **`dist/`**.

**2.4** One env var matters: `PLAYWRIGHT`. `vite.config.ts:106-108`:
```typescript
define: {
  __PLAYWRIGHT__: JSON.stringify(
    process.env.PLAYWRIGHT === "true"
  ),
},
```
`PLAYWRIGHT=true` during the build sets `__PLAYWRIGHT__` to `true` in every built file. This is a load-bearing distinction for test behavior (see §3.3). No `VITE_*` env vars are used anywhere in the source tree.

**2.5** Build duration: **needs measurement** — no prior CI build run timing available. Typical estimate for a React/TypeScript/Vite project of this size: 30–60s in CI (no cache). This is the one-time cost per shard.

---

## §3 — `vite preview` reality check

**3.1** `package.json` has `"preview": "vite preview"`. The BANDIT proposal uses `npx vite preview --port 1420` rather than `npm run preview -- --port 1420`; both work, but the `npx` form is more explicit. Either is correct.

**3.2** Default `vite preview` port: **4173** (Vite default). The test suite expects port **1420** (`playwright.config.ts:10` and `:22`). BANDIT's `--port 1420` flag is **required**. Without it, tests would fail to connect.

**3.3** Port confirmation: `vite.config.ts:112-113`:
```typescript
server: {
  port: 1420,
  strictPort: true,
```
The `server` block configures the dev server only. The `preview` block is absent from `vite.config.ts` — so preview port defaults to 4173. The `--port 1420` flag in the BANDIT proposal is necessary and correct.

**3.4 Window globals analysis:**

All three critical globals are available in production builds. Evidence:

- **`__lwSigma`**: `src/graph/renderers/sigma2d/SigmaGraphView.tsx:440` — **unconditional**, no guard:
  ```typescript
  (window as any).__lwSigma = sigma;
  ```
  Also `__lwCameraController` at line 441, also unconditional.

- **`__lwStore`**: `src/control-plane/settings/settings.store.ts:79`:
  ```typescript
  (import.meta.env.DEV || (window as any).PLAYWRIGHT)
  ```
  Guarded, but `window.PLAYWRIGHT` is **always `true`** — see §3.4 critical finding below.

- **`__lwGraphSummary`**: `src/app/AppShell.tsx:84`:
  ```typescript
  if (import.meta.env.DEV || (window as any).PLAYWRIGHT) {
    (window as any).__lwGraphSummary = summary;
  }
  ```
  Same guard — always evaluates to `true`.

**Critical finding: `src/main.tsx:17` sets `window.PLAYWRIGHT = true` unconditionally:**
```typescript
// Set PLAYWRIGHT flag for test helpers
(window as any).PLAYWRIGHT = true;
```
No guard. This runs in every build — dev, production, whatever. Consequently, every `(import.meta.env.DEV || (window as any).PLAYWRIGHT)` guard in the entire codebase evaluates to `true` in production builds. All dev probes, all window globals, all registry inspectors are always enabled. This is architectural intentionality for a single-developer tool.

**Other dev-mode concerns:**
- **Source maps**: tests do not assert on source map content; not a factor.
- **HMR**: no `import.meta.hot` patterns in source (`src/themes/useResolvedTargetColor.ts:5` references HMR only in a comment). No tests rely on HMR behavior.
- **Console behavior** (v90b/v90c/v90d specs): these tests filter for `console.error` + `pageerror` events. In production, `installOpenInIdeListener.ts` silently no-ops when Tauri is absent (`src/control-plane/ide/installOpenInIdeListener.ts:75-77`). `useGraphSourceSummary` catches loader errors and sets `summaryError` without emitting `console.error` (`src/graph/ingest/useGraphSourceSummary.ts:44-54`). No uncaught exceptions at startup expected.

**3.5 `data-testid` conditional rendering:**

Grep found no `data-testid` attributes guarded by `import.meta.env.DEV`, `import.meta.env.PROD`, or `__DEV__`. QA-panel occurrences of "playwright" in grep output are in documentation strings within the qa-registry, not in rendering conditions. **No testids are conditionally removed in production builds.**

---

## §4 — Tauri-specific concerns

**4.1 Tauri API usage:**

Two files use `@tauri-apps/api/core`:
- `src/lib/tauri-invoke.ts:38` — wrapped with mock-first check and dynamic import
- `src/control-plane/ide/installOpenInIdeListener.ts:28,64` — wrapped in try/catch with explicit browser-context no-op

`tauri-invoke.ts:32-37`:
```typescript
if (
  (import.meta.env.DEV || (window as any).PLAYWRIGHT) &&
  typeof window !== "undefined" &&
  (window as any).__lwTauriMock?.[cmd]
) {
  return (window as any).__lwTauriMock[cmd](args) as T;
}
```
Since `window.PLAYWRIGHT` is always `true`, E2E tests that inject `__lwTauriMock` get the mock path. Tests that DON'T inject mocks (most of the suite) would hit the real Tauri invoke, which fails in browser context. The failure propagates to `loadSource` → `useGraphSourceSummary` → `summaryError` set → `hasRealSource = false` → app uses fixture. No uncaught exception.

Tests that DO inject `__lwTauriMock` (`tests/e2e/graph-sources.spec.ts`, `package-dependency-adapter.spec.ts`, `cytoscape-json-adapter.spec.ts`, `csv-edge-list-adapter.spec.ts`, `markdown-vault.spec.ts`) inject it via `page.evaluate()` before testing. This pattern works identically in dev and production builds.

**4.2 Self-graph fixture:**

`src/app/AppShell.tsx:31`: **static import**:
```typescript
import generatedGraph from "../fixtures/self-graph-generated.json";
```
This JSON is bundled at build time. CI YAML generates the fixture at `npm run generate:graph` (step 3) BEFORE `npm run qa:e2e` (step 4). When the webServer's `npm run build` runs (triggered by Playwright), the fixture already exists. It gets bundled into `dist/`. ✓

`src/app/AppShell.tsx:93-94`:
```typescript
const isTestEnv =
  typeof __PLAYWRIGHT__ !== "undefined" && __PLAYWRIGHT__;
```
With `PLAYWRIGHT=true` in the environment during build (from `env: { PLAYWRIGHT: "true" }` in webServer config), `__PLAYWRIGHT__` compiles to `true`. So `isTestEnv = true` → `useFixture = true` → app uses the bundled fixture for rendering. The `loadSelfGraph` Tauri path is never the bottleneck.

Even without `PLAYWRIGHT=true` during build (fallback): `isTestEnv = false`, but `hasRealSource = false` (Tauri failing in browser), so `useFixture = !hasRealSource = true`. The fixture still gets used. The `env: { PLAYWRIGHT: "true" }` in the webServer config makes this explicit rather than relying on the fallback.

`selfGraphWatcherPlugin` in `vite.config.ts:19` has `apply: "serve" as const`. It only runs during `vite dev`, never during `vite build`. No impact on production build path.

**4.3 Other Tauri concerns:**

`@tauri-apps/plugin-opener ^2` is in `package.json` but no usage was found in the `src/` tree. Not a concern.

The app does not check `window.__TAURI__` anywhere in the source tree. The Tauri IPC bridge check happens implicitly inside `@tauri-apps/api/core`'s `invoke()` — which is always wrapped in try/catch.

---

## §5 — BANDIT proposal verification

**Proposed change:**
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

**5.1 Piece-by-piece:**

- `process.env.CI` in playwright.config.ts: GitHub Actions sets `CI=true` automatically. Playwright reads it at the time playwright.config.ts is loaded by `playwright test`. ✓
- `npm run build && npx vite preview --port 1420`: `package.json` has `build: "tsc && vite build"` and `preview: "vite preview"`. Both exist. The `&&` chain runs them sequentially in the same shell. The `PLAYWRIGHT=true` env var from `env: { PLAYWRIGHT: "true" }` is set on the shell process — both subcommands in the chain inherit it. ✓
- `url: "http://localhost:1420"`: matches `playwright.config.ts:10` (`baseURL`). ✓
- `reuseExistingServer: !process.env.CI`: in CI, `process.env.CI = "true"` (string); `!("true") = false`. In CI: always start fresh. Locally: reuse if running. ✓
- `timeout: 120_000`: 2 minutes for build + preview startup. Build is 30–60s; preview startup is ~1–2s. 120s budget is comfortable. ✓
- `env: { PLAYWRIGHT: "true" }`: **load-bearing**. This env var passes to `npm run build`, which passes to `vite build`, which reads `process.env.PLAYWRIGHT` in `vite.config.ts:108` to set `__PLAYWRIGHT__ = true` in the bundle. Without it, `isTestEnv` would be `false` (though `useFixture` would still be `true` via the error-fallback path). Include it.

**5.2 CI YAML interaction:**

The existing CI YAML (`.github/workflows/ci.yml` post-v111.4d) does NOT start a dev server manually. It runs `npm run qa:e2e` which internally triggers Playwright's webServer lifecycle. The playwright.config.ts change replaces what that webServer does — the YAML itself needs no changes.

The CI YAML already has `npm run generate:graph` before `npm run qa:e2e`, so the fixture is present when the build runs. ✓

**5.3 Runtime projection per shard:**

- Build: 30–60s (needs measurement; this is the dominant cost per shard)
- Preview startup: ~1–2s
- Per-test navigation: ~0.5–2s (static file serving, no JIT) vs 30–60s (dev JIT)
- ~145 tests per shard / 4 workers × ~2s average = ~73s = ~1.2 min test runtime
- Total per shard: ~2–3 min test runtime + ~1 min build = ~3–4 min
- **Bandit's projection of 5–8 min is realistic but may be optimistic on build cost.** If build takes 60s, a shard is ~2 min. If build takes 90s (cold CI, no cache), ~3 min. Worst case ~4 min. 20-min `timeout-minutes` provides plenty of headroom.

**5.4 Production build breakage risks:**

| Risk | Likelihood | Evidence |
|---|---|---|
| Conditional testid rendering | **None** | No env-guarded testids found in source tree |
| Console/pageerror on startup | **Low** | Tauri failures are caught; loadSource error sets summaryError silently |
| Asset path assertions | **None** | No tests assert on hashed filenames |
| Service worker | **None** | No service worker in codebase |
| `__lwSigma` not available | **Low** | Assigned unconditionally (SigmaGraphView.tsx:440) |
| `__lwStore` not available | **None** | `window.PLAYWRIGHT=true` ensures the guard passes |
| gwells beforeEach timeout | **Low** | 10s timeout; production startup should be <5s |

---

## §6 — Alternative approaches

**6.1 Static file serving** (`npx serve dist/`):
- Pros: Faster startup, no Vite-specific concerns
- Cons: No SPA fallback by default. React Router (or any SPA) needs all unrecognized URLs served as `index.html`. Without SPA fallback, direct deep-link navigation would 404. Would require either `serve --single` or a config file. Also: `serve` is not in `node_modules/` as a bundled dependency; adding it requires approval per the package-install safeguard. **Not recommended.**

**6.2 Pre-warming the dev server:**
- How: Add a CI step that runs `npm run dev &` and waits for the port before tests
- The fatal flaw: The slowness is NOT just cold-start. It's per-request on-demand transformation. Each `page.goto("/")` triggers Vite to transform the full module graph for that page load. Pre-warming the server does NOT eliminate per-request transform cost. gwells-physics and other tests that call `page.goto("/")` multiple times in a describe block would still hit 30–60s per goto. **Does not solve the root cause. Not recommended.**

**6.3 Reducing test scope in CI:**
- Pros: No config changes; trivially implementable
- Cons: Creates "CI runs subset, dev runs full suite" bifurcation. This is exactly the maintenance pattern that CLAUDE.md warns against. Also makes CI meaningless as a signal for the tests it skips. **Not recommended.**

**6.4 Recommendation:** Production preview is the right call. It directly addresses the root cause (per-request JIT overhead), requires no new packages, is supported by Vite natively, and has clear precedent in the Vite docs. The production-mode window global situation (§3.4 finding: `window.PLAYWRIGHT = true` unconditionally) means there's no "dev-only globals" risk — all probes are always active. The mock-first Tauri pattern (§4.1) means no Tauri runtime is needed.

---

## §7 — Confidence assessment

**7.1** Confidence: **MEDIUM-HIGH**.

The window global situation is better than feared — `window.PLAYWRIGHT = true` is unconditional, so no dev-only gates block the test suite. The mock-first Tauri pattern is solid. The `PLAYWRIGHT=true` build define correctly gates fixture mode. The static import of the self-graph fixture means production builds have the fixture bundled in.

**7.2 Unknown unknowns:**

1. **Build time in CI**: The most uncertain number. If `tsc && vite build` takes >90s in CI (fresh container, no build cache), it pushes per-shard time toward 3–4 min. The 20-min `timeout-minutes` has headroom for this, but it's unknown.

2. **WebGL in CI headless**: gwells-physics.spec.ts tests WebGL-driven physics. Playwright uses software WebGL rendering in headless Chromium. Production builds and dev builds both run the same WebGL code. The gwells C9.0 drift-back test is already documented as architecturally flaky (v111.3 deferral). Production mode doesn't make this better or worse — the flake is in the rAF/engine layer.

3. **TypeScript build errors in clean CI container**: `tsc` is already run as a separate CI job (`typecheck`). If `tsc` passes in the typecheck job, it should also pass inside `npm run build`. Low risk.

4. **Chunk loading failures**: Production builds split code into chunks. If a dynamic import fails (e.g., network error in CI serving static files locally), some tests might fail. Very unlikely with localhost preview server.

5. **`gwells-physics` `beforeEach` timing**: This is the test that blocked v111.4c/d (30–60s per `page.goto` with dev server). With production preview, the page load should be 1–3s. The 10s `waitForFunction` timeout (`tests/e2e/gwells-physics.spec.ts:16`) should be sufficient. If Sigma initialization takes longer than expected in production mode (e.g., due to heavier fixture parsing), this could still time out. Low probability but non-zero.

**7.3 Next likely failure mode:**

If v111.4e fails, the most probable cause is **gwells-physics `beforeEach` timeout** — `page.waitForFunction(() => (window as any).__lwSigma !== undefined, { timeout: 10000 })` (line 16). If the production build takes unexpectedly long to mount the Sigma component (e.g., > 10s), this would still fail. The diagnostic: check if it's specifically gwells-physics shard, and look at the actual `page.goto` timing in the Playwright trace.

Second likely failure: **build failure** during `tsc`. If `npm run generate:graph` doesn't complete before Playwright spawns the webServer, the static import at AppShell.tsx:31 would fail the build. The CI YAML mitigates this by running `generate:graph` explicitly before `qa:e2e`. However, verify the sequence holds under Playwright's webServer startup ordering.

---

## §8 — Pre-flight decisions for Ryan

**1. Does the prod-preview proposal have any blocking issues?**

No blocking issues found. The critical check — dev-only globals blocked in production — resolves to "no block": `window.PLAYWRIGHT = true` is unconditional in `src/main.tsx:17`, so all dev probes are always active regardless of build mode.

**2. Is the proposed `playwright.config.ts` change correct as written?**

Yes, with two clarifications:
- The `env: { PLAYWRIGHT: "true" }` is **load-bearing** (not metadata). It must be present for the `__PLAYWRIGHT__` build-time define to compile to `true`. Document this in the commit message.
- The proposal is correct as written. No port change needed (BANDIT specifies `--port 1420`). No additional env vars needed.

**3. Does the CI YAML need changes?**

No. The existing YAML already:
- Runs `npm run generate:graph` before `npm run qa:e2e` (fixture present when build runs) ✓
- Does not manually start a dev server (playwright.config.ts owns the lifecycle) ✓
- Has `npx playwright install --with-deps chromium` before the test run ✓
- Has `timeout-minutes: 20` which is ample for ~3–4 min per shard ✓

**4. Does Terminal Claude recommend authorizing v111.4e now?**

**Yes.** The investigation found no structural blockers. The design is sound:
- Window globals: always available
- Tauri mocking: works identically
- Fixture mode: correctly gated by `__PLAYWRIGHT__` build define
- No conditional testids
- CI YAML sequence is correct

The main unknown (build time in CI) doesn't need pre-verification — the 20-min timeout provides enough headroom even for a pessimistic 90s build.

**5. Abort condition if v111.4e fails CI:**

Before pulling v111.4 entirely, **do one diagnostic run**:
- If gwells-physics times out: the fix is increasing the `beforeEach` `waitForFunction` timeout from 10s → 20s, or adding a longer page-load wait. Incremental, low-risk fix.
- If the build step fails (tsc error): investigate what module is broken; likely fixable without pulling.
- If multiple shards time out: the build is taking longer than 120s and Playwright kills the webServer before tests run. Increase `webServer.timeout` to 180s.
- If it's a pageerror/crash: examine the actual error; could be a production-specific issue.

**Pull v111.4 entirely if:** the production build itself crashes with an unrecoverable error, or if the fix requires source changes that expand scope beyond playwright.config.ts. Ryan's instinct (pull if it fails) is a reasonable hard limit after one diagnostic amendment.

---

*Citations: all file:line references verified against current on-disk state. No code changes made. No npm installs performed.*
