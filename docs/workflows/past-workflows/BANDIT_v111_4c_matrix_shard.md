# Bandit — v111.4c: convert E2E CI job to 3-shard matrix

Amendment to v111.4. The "single runner" lock from v111.0 was based on a projection that turned out wrong. Terminal Claude diagnosed correctly: full 725-test suite × CI's 7-8× slowdown for browser automation = 70-100 min on a single runner. No timeout config fixes this. Sharding does.

Ryan's call: **Option B — matrix shard (3 runners).** Honest CI signal preserved; single-runner lock revised based on real measurement.

Basis: Terminal Claude's v111.4b failure analysis + Playwright's official shard documentation (https://playwright.dev/docs/test-sharding) + Ryan's locked Option B decision.

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680). 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

No semver bump. ONE commit. After this lands green, v111.5 arc-close unblocks.

## Locked decisions (Ryan-confirmed, amending v111.0 §7)

| # | Original lock | Amendment |
|---|---|---|
| 5 | Single runner | **3-shard matrix** (parallel completion ~10 min wall-clock vs 70-100 min single-runner) |
| 6 | Required (gate merges) | Unchanged — required after all 3 shards pass |
| 7 | Playwright official cache action | Unchanged |
| - | (new) | Document amendment in KNOWN_SHARP_EDGES at v111.5 close: audit projections about CI runtime must be measured, not treated as locked planning inputs |

Rationale for amendment: the audit's "5-7 min CI runtime" projection was based on the GVI split's 233-test local measurement extrapolated linearly, with no CI-overhead factor applied. Reality at full-suite (725 tests) with CI's browser-automation slowdown is 70-100 min single-runner. The "single runner" lock was conditional on a projection that turned out incorrect. Amending locked decisions when input data proves wrong is engineering discipline, not backtracking.

## v111 arc context

- v111.1 (`cc42b94`) — GVI split → 2m 58s for 233 tests
- v111.2 (`fcd79d0`) — qa.ts helpers → contract-registry stable
- v111.3 (`68e543c`) — flaker triage → color-tab fixed, gwells deferred
- v111.4 (`915d6a5`) — initial CI E2E wiring (timed out)
- v111.4a (`4fedf4f`) — replaced deprecated Playwright action (still timed out)
- v111.4b (`74bf554`) — increased timeouts (still insufficient)
- **v111.4c (THIS PASS)** — 3-shard matrix conversion
- v111.5 — arc close (blocked until v111.4c CI is green)

## Targeted test scope

Local verification:
```bash
npm run typecheck
npm run lint:css
# Validate YAML parses (read carefully or use any available linter)
# Confirm npm script supports --shard flag:
npm run qa:e2e -- --help | grep -i shard
```

**Real verification is post-merge:** all 3 matrix shards must complete green in CI. The new CI run for v111.4c's push should show 3 parallel `e2e` jobs (e.g., `e2e (1/3)`, `e2e (2/3)`, `e2e (3/3)`) all green within ~10-15 min wall-clock.

---

## Pre-flight (verify, report, STOP if diverges)

1. Confirm v111.4b (`74bf554`) is on HEAD.

2. Read current `.github/workflows/ci.yml` end-to-end. Quote the `e2e` job in full. Confirm:
   - Job exists with `needs: [lint-css, typecheck]`
   - Uses `microsoft/playwright-github-action@v1` for browser caching (or whatever the v111.4a fix replaced it with — quote the actual action in use)
   - Calls `npm run qa:e2e` (with or without flags)
   - Has `timeout-minutes: 30` per v111.4b
   - Has `--timeout=60000` (per-test timeout) per v111.4b

3. Confirm `npm run qa:e2e` accepts `--shard=N/M` flag passthrough. Test locally:
   ```bash
   npm run qa:e2e -- --shard=1/3 --list  # --list shows which tests would run, doesn't execute
   ```
   If `--shard` isn't honored (e.g., the npm script wraps Playwright in a way that strips arguments), STOP and report — we'll need a different invocation pattern.

4. Confirm Playwright version supports `--shard`. Per Playwright docs, sharding has been stable since 1.10+. Quote `package.json`'s Playwright version.

5. Identify any test files that have **inter-file state coupling** that sharding would break. Playwright shards distribute tests across runners by file (not by test), so cross-file dependencies would cause shards to fail. Likely there are none (Playwright tests are conventionally independent), but verify. Grep for any `test.beforeAll` that references global state, or any tests that document "must run after X" in comments.

6. **STOP if anything diverges.** Especially #3 — if `--shard` doesn't work, the whole approach needs different mechanics.

---

## Files (explicit paths only)

- `.github/workflows/ci.yml` — convert the existing `e2e` job to a matrix shard.

Nothing else modified.

---

## Implementation

### Target shape of the e2e job

Per Playwright's official sharding docs (https://playwright.dev/docs/test-sharding) and GitHub Actions matrix strategy syntax:

```yaml
  e2e:
    name: E2E Tests (Shard ${{ matrix.shard }}/${{ matrix.total }})
    runs-on: ubuntu-latest
    needs: [lint-css, typecheck]
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2, 3]
        total: [3]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Cache Playwright browsers
        # Use whatever action v111.4a replaced the deprecated one with — keep it.
        uses: <CURRENT_PLAYWRIGHT_ACTION_FROM_PREFLIGHT>
        with:
          browsers-to-install: "chromium"
      - name: Generate self-graph fixture
        run: npm run generate:graph
      - name: Run E2E tests (Shard ${{ matrix.shard }}/${{ matrix.total }})
        run: npm run qa:e2e -- --shard=${{ matrix.shard }}/${{ matrix.total }} --workers=4
        timeout-minutes: 20
```

**Key shape decisions:**

- `strategy.matrix.shard: [1, 2, 3]` — three shards. `strategy.matrix.total: [3]` — keeps the divisor consistent.
- `strategy.fail-fast: false` — if shard 1 fails, shards 2 and 3 still run. We want all failure signals, not just the first.
- `name: E2E Tests (Shard ${{ matrix.shard }}/${{ matrix.total }})` — each shard's CI status shows its number for clear identification.
- `--shard=${{ matrix.shard }}/${{ matrix.total }}` — Playwright's standard sharding flag. Distributes tests across shards automatically by file.
- `--workers=4` retained — each runner uses 4 workers internally for its ~1/3 of the suite.
- `timeout-minutes: 20` — generous buffer over the projected ~8-12 min per shard. Was 30 for single-runner; can drop to 20 since each shard is smaller.

### Step 1 — Read current ci.yml end-to-end

Per pre-flight. Quote the existing e2e job in full so the diff in the commit message is clear.

### Step 2 — Replace the e2e job with the matrix version

Preserve `lint-css` and `typecheck` jobs unchanged. Only the `e2e` job is replaced.

### Step 3 — Verify the npm script passes through --shard correctly

```bash
# This should list ~1/3 of the tests across files (Playwright distributes by file):
npm run qa:e2e -- --shard=1/3 --list
```

If the count of listed tests is approximately 240 (725 / 3 ≈ 242), sharding is working. If it lists all tests or zero, the npm script is not passing arguments correctly.

If broken: STOP and report. The fix would be amending `package.json`'s `qa:e2e` script to use `--` argument passthrough correctly, but that's a separate concern.

### Step 4 — Local sanity (don't run the full suite)

```bash
npm run typecheck
npm run lint:css
```

Both clean. No local E2E run for this commit — the verification is *post-merge in CI*.

### Step 5 — Commit + push

MERGE GATE → commit:
`ci(v111.4c): convert E2E CI job to 3-shard matrix — single runner couldn't fit 725-test suite`

END-OF-RUN REPORT to #changelog with SHA + bump+push gate.

### Step 6 — Watch the first CI run

After the push lands, the CI tab will show three parallel `e2e` jobs:
- `E2E Tests (Shard 1/3)`
- `E2E Tests (Shard 2/3)`
- `E2E Tests (Shard 3/3)`

Each should complete within ~10-15 min wall-clock. All three must pass.

**If any shard fails:** investigate which tests are in that shard (Playwright's output names them). The failure mode determines next steps:
- If all 3 shards time out: increase `timeout-minutes` higher or shard further (4 or 5 shards)
- If specific tests fail: investigate those tests; may be CI-specific flakes that need their own conversion
- If a single shard fails repeatedly: a test in that shard may have CI-specific issues

**If all 3 pass:** v111.4c succeeds. v111.5 unblocks.

---

## END-OF-RUN REPORT (required content)

- Pre-flight findings (current e2e job quoted; Playwright version confirmed; `--shard` flag passthrough confirmed)
- The new e2e job YAML in full (for review in #changelog)
- typecheck + lint:css confirmation
- Local sharding verification (`--shard=1/3 --list` shows ~240 tests)
- **Post-merge verification request:** ping Ryan when the matrix CI run lands so he can confirm all 3 shards green (or report any failures)

---

## Hard stops

- **Only `.github/workflows/ci.yml` is modified.** No npm scripts changed. No Playwright config changes. No test changes.
- **Preserve `lint-css` and `typecheck` jobs unchanged.** Only the `e2e` job is replaced.
- **`fail-fast: false` is non-negotiable.** We need all failure signals, not just the first.
- **`needs: [lint-css, typecheck]` retained.** Fast jobs still gate before E2E.
- **Required, not advisory.** No `continue-on-error: true`. All 3 shards must pass for the commit to be considered green.
- **If `--shard` doesn't pass through the npm script correctly, STOP and ask.** Don't hack around it; the fix may need a package.json change which is out of scope for this commit.
- No new dependencies. No new Rust. No semver bump.
- Explicit-path git. Discord MCP only.
- Targeted-test-scope locally (typecheck + lint:css only); real verification is post-merge CI.
