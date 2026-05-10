# Git Readiness Audit

**Date:** 2026-05-02
**Baseline:** v15

## Current Git Status

### Git Repository
- **Status:** No git repo currently exists
- **Action:** git init required when user approves
- **Recommendation:** Wait until .gitignore is reviewed before initializing

## External Backups

### User Backup Status
- **Status:** Unknown (user should confirm)
- **Recommendation:** User should have external backup before git init
- **Action:** Confirm user has backup before proceeding

## Likely Commit Directories

### Source Code (Should Commit)
- `src/` - All source code
- `public/` - Public assets
- `src-tauri/` - Tauri Rust source (may need .gitignore for build artifacts)

### Configuration (Should Commit)
- `package.json` - Node dependencies
- `package-lock.json` - Node lockfile
- `tsconfig.json` - TypeScript config
- `vite.config.ts` - Vite config
- `src-tauri/tauri.conf.json` - Tauri config
- `src-tauri/Cargo.toml` - Rust dependencies
- `src-tauri/Cargo.lock` - Rust lockfile

### Documentation (Should Commit)
- `docs/` - All documentation (including session logs)
- `README.md` - Even if superseded, keep for now
- `.gitignore` - Once created

### Tests (Should Commit)
- `tests/` - All test files

## Likely Ignore Directories

### Build Output
- `dist/` - Vite build output
- `src-tauri/target/` - Rust build artifacts
- `node_modules/` - Node dependencies

### Test Artifacts
- `test-results/` - Playwright test results
- `playwright-report/` - Playwright HTML reports
- `playwright/.cache/` - Playwright cache

### Coverage
- `coverage/` - Code coverage reports

### OS/Editor Junk
- `.DS_Store` - macOS
- `Thumbs.db` - Windows
- `*.swp` - Vim swap files
- `*~` - Backup files
- `.vscode/` - VS Code settings (optional, may want to commit some settings)
- `.idea/` - JetBrains IDE settings

## Risky/Generated Directories

### Generated Graph Outputs
- `examples/ai-lab/graphify-out/` - Generated graph artifacts
- `examples/*/graphify-out/` - Any graphify output directories
- `.graphify_*` - Graphify cache files
- `cache/` - Graph cache directories

### Screenshots/Recordings
- `screenshots/` - Playwright screenshots
- `recordings/` - Playwright video recordings

### Local Environment/Secrets
- `.env` - Environment variables
- `.env.local` - Local environment
- `.env.*.local` - Environment files
- `*.pem` - Certificates
- `*.key` - Private keys

## Tauri/Rust Artifacts

### Rust Build
- `src-tauri/target/` - Rust build directory
- `src-tauri/target/debug/` - Debug builds
- `src-tauri/target/release/` - Release builds
- `src-tauri/Cargo.lock` - Should commit (lockfile)
- `src-tauri/target/` - Should ignore (build artifacts)

### Tauri Bundles
- `src-tauri/target/release/bundle/` - App bundles
- `*.dmg` - macOS disk images
- `*.app` - macOS apps
- `*.exe` - Windows executables
- `*.deb` - Linux packages
- `*.AppImage` - Linux AppImages

## Node Artifacts

### Dependencies
- `node_modules/` - Node packages
- `package-lock.json` - Should commit (lockfile)
- `.pnpm-store/` - pnpm store (if using pnpm)

### Build
- `dist/` - Vite build output
- `dist-ssr/` - SSR build output
- `.vite/` - Vite cache

## Test Artifacts

### Playwright
- `test-results/` - Test results
- `playwright-report/` - HTML reports
- `playwright/.cache/` - Cache
- `screenshots/` - Failure screenshots
- `recordings/` - Test recordings
- `trace/` - Trace files

### Other
- `coverage/` - Coverage reports
- `.nyc_output/` - NYC coverage output

## Local Backups/Temp Files

### Backups
- `*.bak` - Backup files
- `backup/` - Backup directory
- `backups/` - Backup directory

### Temp
- `tmp/` - Temp directory
- `temp/` - Temp directory
- `*.tmp` - Temp files

## Intentionally Tracked Docs/Logs

### Session Logs
- `docs/logs/sessions/` - Session logs (should track)
- `docs/logs/failures/` - Failure logs (should track)
- `docs/logs/qa/` - QA logs (should track)

### Documentation
- `docs/` - All docs (should track)
- `*.md` - Markdown files (should track)

## Recommended .gitignore Structure

### High-Priority Ignores
1. `node_modules/` - Node dependencies
2. `src-tauri/target/` - Rust build artifacts
3. `dist/` - Build output
4. `test-results/` - Playwright results
5. `playwright-report/` - Playwright reports
6. `.env*` - Environment files
7. `*.log` - Log files (except intentional ones)
8. `.DS_Store` - macOS
9. `Thumbs.db` - Windows

### Medium-Priority Ignores
1. `examples/*/graphify-out/` - Generated graph outputs
2. `.graphify_*` - Graphify cache
3. `cache/` - Cache directories
4. `screenshots/` - Screenshots (except intentional ones)
5. `recordings/` - Recordings
6. `coverage/` - Coverage reports
7. `.vscode/` - VS Code settings (optional)
8. `.idea/` - JetBrains settings

### Low-Priority Ignores
1. `*.swp` - Vim swap
2. `*~` - Backup files
3. `*.bak` - Backup files
4. `tmp/` - Temp directories
5. `temp/` - Temp directories

## Special Considerations

### Examples Directory
- **Status:** Review needed
- **Question:** Should examples be committed?
- **Recommendation:** Commit examples source, ignore generated outputs

### AI-Lab Graphify Outputs
- **Status:** Ignore generated outputs
- **Recommendation:** Ignore `examples/ai-lab/graphify-out/` and similar

### Session Logs
- **Status:** Track session logs
- **Recommendation:** Commit `docs/logs/sessions/` for history

### Lockfiles
- **Status:** Commit lockfiles
- **Recommendation:** Commit `package-lock.json` and `Cargo.lock`

## Next Steps

1. **Review .gitignore draft** - See GITIGNORE_DRAFT.md
2. **Confirm user has external backup** - Critical before git init
3. **Create .gitignore** - After review
4. **Run git status --ignored** - To verify ignores
5. **Review untracked files manually** - Before staging
6. **Stage safe files** - Selective staging
7. **Do first commit** - See FIRST_COMMIT_PLAN.md

## Risk Assessment

### Low Risk
- Committing source code
- Committing documentation
- Committing configuration files
- Committing lockfiles

### Medium Risk
- Committing examples (review generated outputs)
- Committing .vscode/ settings (review sensitive settings)

### High Risk
- Committing environment files (.env)
- Committing private keys
- Committing build artifacts
- Committing without backup

## Recommendation

**DO NOT initialize git yet.**

1. Review GITIGNORE_DRAFT.md
2. Confirm user has external backup
3. Create .gitignore
4. Review untracked files manually
5. Then proceed with FIRST_COMMIT_PLAN.md