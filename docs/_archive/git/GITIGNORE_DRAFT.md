# .gitignore Draft

**Date:** 2026-05-02
**Baseline:** v15
**Status:** DRAFT - Do not apply until reviewed

## Dependencies

### Node
node_modules/
.pnpm-store/
.yarn/
.yarn-integrity/

### Rust/Tauri
src-tauri/target/

## Build Output

### Vite
dist/
dist-ssr/
.vite/

### Tauri Bundles
*.dmg
*.app
*.exe
*.deb
*.AppImage
*.msi
src-tauri/target/release/bundle/

## Test Artifacts

### Playwright
test-results/
playwright-report/
playwright/.cache/
screenshots/
recordings/
trace/

### Coverage
coverage/
.nyc_output/

## Environment / Secrets

.env
.env.local
.env.*.local
*.pem
*.key
*.crt
secrets/
*.secret

## OS / Editor Junk

### macOS
.DS_Store
.AppleDouble
.LSOverride

### Windows
Thumbs.db
ehthumbs.db
Desktop.ini

### Linux
*~
.directory

### Editors
*.swp
*.swo
*.swn
*.bak
*.tmp
*.temp
.vscode/
.idea/
*.sublime-project
*.sublime-workspace

## Generated Graph Outputs

### Graphify
.graphify_*
cache/
examples/*/graphify-out/
graphify-out/

### Other Generated
generated/
output/

## Local Backups / Temp Files

backup/
backups/
tmp/
temp/
*.backup
*.old

## Logs (except intentional docs/logs)

*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

## Intentionally Tracked

### Session Logs (DO NOT IGNORE)
!docs/logs/
!docs/logs/sessions/
!docs/logs/failures/
!docs/logs/qa/

### Documentation (DO NOT IGNORE)
!docs/
!*.md

## Lockfiles (DO NOT IGNORE)
!package-lock.json
!yarn.lock
!pnpm-lock.yaml
!src-tauri/Cargo.lock

## Configuration (DO NOT IGNORE)
!package.json
!tsconfig.json
!vite.config.ts
!src-tauri/tauri.conf.json
!src-tauri/Cargo.toml

## Source (DO NOT IGNORE)
!src/
!src-tauri/src/
!public/
!tests/

## Notes

### What This Ignores
- Node modules and build artifacts
- Test results and coverage reports
- Environment files and secrets
- OS/editor junk files
- Generated graph outputs
- Temporary and backup files

### What This Tracks
- All source code
- All documentation (including session logs)
- Configuration files
- Lockfiles
- Test source files

### Review Before Applying
1. Confirm examples/*/graphify-out/ should be ignored
2. Confirm cache/ should be ignored
3. Confirm .vscode/ should be ignored (or commit selectively)
4. Confirm no project-specific secrets are in untracked files
5. Run `git status --ignored` after applying to verify