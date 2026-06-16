# Bandit — v111.4: CI E2E wiring

Fourth pass of the v111 test-infrastructure arc. Adds the E2E test suite to `.github/workflows/ci.yml` as a required job gated on `lint-css` + `typecheck` passing first. Uses the Playwright official cache action for browser caching. Single runner, no matrix.

After v111.4 lands, every push and PR runs the full E2E suite in CI alongside lint + typecheck. v110+ era of unmonitored E2E ends here.

Basis: `~/Projects/lumaweave/docs/SHIP_READINESS_ROADMAP.md` §3 (v111) + `docs/workflows/v111_0_test_infrastructure_report.md` §5 (CI wiring strategy) + Ryan-locked decisions: single runner, required (gate merges), Playwright official cache action.

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680). 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

No semver bump. ONE commit.

## v111 arc context

- v111.1 (`cc42b94`) — GVI split → 2m 58s for 233 tests
- v111.2 (`fcd79d0`) — qa.ts helpers → contract-registry stable
- v111.3 (`68e543c`) — flaker triage → color-tab fixed, 3 documented, gwells deferred
- **v111.4 (THIS PASS)** — CI E2E wiring
- v111.5 — arc close

## Locked decisions (Ryan-confirmed)

| # | Locked |
|---|---|
| 5 | CI wiring: **single runner** (Option 1) |
| 6 | Gating: **required** (E2E failure blocks merge) |
| 7 | Browser caching: **Playwright official cache action** (microsoft/playwright-github-action) |
| Workers | **4** (matches typical CI runner vCPU count; not the 12 used locally) |

Targeted-test-scope + CI fast-jobs only.

---

## Targeted test scope

This commit modifies `.github/workflows/ci.yml`. Local verification can confirm the YAML parses and the script invocation works, but the *real* verification is whether CI actually goes green on the push that lands this commit.

**Local verification:**
```bash
npm run typecheck
npm run lint:css
# YAML validation (if available; otherwise inspect by reading):
# Some IDEs/editors have built-in YAML linting; or use a tool like yamllint if installed.
# Don't install anything new for this.
```

**Post-commit verification (Ryan watches CI):**
After pushing, the new `e2e` job appears in the GitHub Actions UI. Within ~10 minutes it should report success. If it fails on the first run, that's the signal something's wrong with the CI wiring — investigate before declaring v111.4 done.

---

## Pre-flight (verify, report, STOP if diverges)

1. Confirm v111.3 (commit `68e543c`) is on HEAD.

2. Read `.github/workflows/ci.yml` end-to-end. Quote the entire file. Confirm per audit §5.1:
   - 34 lines
   - 2 jobs: `lint-css` and `typecheck`
   - No `e2e` job yet
   - Triggers on `push` (any branch) and `pull_request` (main)
   - Both existing jobs use `actions/checkout@v4` and `actions/setup-node@v4` with `node-version: 20`

3. Confirm `package.json` has the `qa:e2e` npm script. Quote it. Expected to be the Playwright command we'll invoke from CI. If the script doesn't exist or is named differently, report — the YAML's `run` step must use whatever script actually runs E2E.

4. Confirm Playwright version in `package.json`. Quote the relevant lines. The microsoft/playwright-github-action version compatibility matters; if Playwright version is significantly behind the action's documented support range, flag for amendment.

5. Confirm `playwright.config.ts` settings per audit:
   - Workers: 12 locally
   - Timeout: 30s
   - Chromium only
   - Quote any project-level settings that may need different CI behavior (e.g., `forbidOnly` settings, retries configuration)

6. **Confirm if `npm run generate:graph` is a real script** that needs to run before E2E. The current typecheck job per audit §5.3 references "self-graph fixture generation" as part of its flow — confirm whether this is a separate npm script or baked into typecheck, and whether the E2E job will need it too.

7. **STOP and report if anything diverges from the audit.** The YAML's structure depends on the exact existing CI shape; mismatched assumptions create CI breakage that's hard to debug remotely.

---

## Files (explicit paths only)

- `.github/workflows/ci.yml` — add the new `e2e` job; preserve the existing `lint-css` and `typecheck` jobs unchanged.

Nothing else modified.

---

## Implementation

### The full target shape of ci.yml after this commit

```yaml
name: CI

on:
  push:
    branches: ["**"]
  pull_request:
    branches: [main]

jobs:
  lint-css:
    # Existing job — preserve verbatim
    # ...

  typecheck:
    # Existing job — preserve verbatim
    # ...

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [lint-css, typecheck]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Cache Playwright browsers
        uses: microsoft/playwright-github-action@v1
        with:
          browsers-to-install: "chromium"
      - name: Generate self-graph fixture
        # Only if the typecheck job's self-graph generation isn't separately persisted;
        # most likely needed since each job runs in a fresh container.
        # Confirm in pre-flight what script generates the fixture.
        run: npm run generate:graph
      - name: Run E2E tests
        run: npm run qa:e2e -- --workers=4
        timeout-minutes: 15
```

### Step-by-step implementation

**Step 1 — Read the existing ci.yml.** Quote it in full to the pre-flight report.

**Step 2 — Determine if `generate:graph` step is needed.**
- If the current `typecheck` job runs `npm run generate:graph` separately (a `run:` step explicitly invoking it), then the `e2e` job needs the same step.
- If `generate:graph` is implicit in `typecheck`'s flow (e.g., a postinstall script or part of the build), then the `e2e` job might inherit it via `npm ci`. Verify in pre-flight.
- **If unsure, include the explicit `npm run generate:graph` step** in the e2e job. Extra defensive; small cost. This is the safer default.

**Step 3 — Append the `e2e` job to the existing ci.yml.**
- Insert the job AFTER the existing two jobs.
- The `needs: [lint-css, typecheck]` clause makes E2E sequential after fast jobs pass. Saves CI time if linting fails.
- All other YAML indentation, key order, and styling matches the existing jobs.

**Step 4 — Verify the YAML parses.**
- If a YAML validator is locally available, use it. Otherwise read the file carefully and confirm indentation is consistent.
- The shape of `microsoft/playwright-github-action@v1` is documented at https://github.com/microsoft/playwright-github-action — match the official usage pattern.

**Step 5 — Confirm `npm run qa:e2e` from terminal.**
- Verify the script exists and runs from a clean state. Don't actually run the full suite — just confirm the script is invokable: `npm run qa:e2e --help` or similar verification that exercises the script entrypoint without running tests.
- If the script does NOT accept `--workers=4`, adjust. Playwright's `--workers` flag is standard; the npm script should pass it through.

**Step 6 — Local CI fast-jobs verify:**
```bash
npm run typecheck
npm run lint:css
```
Both clean. No E2E re-run locally for this commit.

---

## Commit

MERGE GATE → commit (explicit paths only — just the one file):
`ci(v111.4): wire E2E suite into CI — required, gated on lint+typecheck, Playwright cache action`

END-OF-RUN REPORT to #changelog with SHA + bump+push gate.

---

## END-OF-RUN REPORT (required content)

- Pre-flight findings (full existing ci.yml quoted; confirmation of npm scripts; Playwright version; any divergences from audit)
- The full new ci.yml content (so it's reviewable in #changelog)
- typecheck + lint:css confirmation (local)
- **Post-merge note:** v111.4's REAL verification is CI itself going green. Ryan watches the GitHub Actions tab after the push lands. If the first run fails, that's a v111.4 amendment needed before v111.5 closes the arc.
- Any decisions made during implementation (e.g., "included explicit `generate:graph` step because typecheck's was implicit")

---

## Hard stops

- **Only `.github/workflows/ci.yml` is modified.** No npm scripts changed. No `package.json` edits. No Playwright config changes.
- **Preserve existing `lint-css` and `typecheck` jobs unchanged.** Add the new `e2e` job; don't refactor what works.
- **Required, not advisory.** No `continue-on-error: true` on the new e2e job. Per Ryan's locked decision: gate merges.
- **Playwright official action (microsoft/playwright-github-action@v1) only.** Don't substitute a community action or hand-roll browser installation.
- **`needs: [lint-css, typecheck]` is non-negotiable.** Fast jobs must pass first; CI minutes are conserved that way.
- **Workers = 4 in CI.** Don't use the local 12 (CI runners only have 4 vCPU; running with 12 workers would oversubscribe and likely fail).
- **`timeout-minutes: 15`** on the e2e step. Safety margin over the projected ~3-7 min runtime.
- **The first CI run after this commit lands is the real test.** If CI fails on the v111.4 push, that's a real signal — don't proceed to v111.5 until CI is green.
- No new dependencies. No new Rust. No semver bump. No docs edits this commit (v111.5 handles arc-close docs).
- Explicit-path git. Discord MCP only.
- Targeted-test-scope only.
