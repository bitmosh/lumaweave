# First Commit Plan

**Date:** 2026-05-02
**Baseline:** v15
**Status:** PLAN - Do not run git init until user approves

## Prerequisites

### Before Running Git Init
1. ✅ Verify v15 baseline is stable
2. ✅ Review GIT_READINESS_AUDIT.md
3. ✅ Review GITIGNORE_DRAFT.md
4. ⏳ Confirm user has external backup
5. ⏳ Create .gitignore from draft
6. ⏳ Review untracked files manually

## Step-by-Step Plan

### Step 1: Verify v15 Baseline
- **Status:** ✅ Complete
- **Action:** Run typecheck and Playwright
- **Result:** Typecheck PASSED, Playwright 45/45 PASSED
- **Confirmation:** v15 is stable baseline

### Step 2: Review Git Readiness Audit
- **Status:** ✅ Complete
- **Action:** Review docs/repo/GIT_READINESS_AUDIT.md
- **Confirmation:** No git repo exists, backup status unknown

### Step 3: Review .gitignore Draft
- **Status:** ✅ Complete
- **Action:** Review docs/repo/GITIGNORE_DRAFT.md
- **Confirmation:** .gitignore draft ready for review

### Step 4: Confirm User Backup
- **Status:** ⏳ Pending
- **Action:** User confirms external backup exists
- **Risk:** HIGH - Do not proceed without backup confirmation

### Step 5: Create .gitignore
- **Status:** ⏳ Pending
- **Action:** Copy docs/repo/GITIGNORE_DRAFT.md to .gitignore
- **Command:** cp docs/repo/GITIGNORE_DRAFT.md .gitignore
- **Verification:** Review .gitignore contents

### Step 6: Run Git Status --Ignored
- **Status:** ⏳ Pending
- **Action:** Run `git status --ignored` to verify ignores
- **Command:** git status --ignored
- **Verification:** Confirm no sensitive files in untracked

### Step 7: Review Untracked Files Manually
- **Status:** ⏳ Pending
- **Action:** Review `git status` output manually
- **Check for:**
  - Environment files (.env)
  - Private keys (*.key, *.pem)
  - Secrets in untracked files
  - Large generated outputs
- **Action:** Remove or add to .gitignore if needed

### Step 8: Stage Safe Files
- **Status:** ⏳ Pending
- **Action:** Stage source code and docs
- **Commands:**
  ```bash
  git add src/
  git add public/
  git add src-tauri/src/
  git add src-tauri/Cargo.toml
  git add src-tauri/Cargo.lock
  git add src-tauri/tauri.conf.json
  git add tests/
  git add docs/
  git add package.json
  git add package-lock.json
  git add tsconfig.json
  git add vite.config.ts
  git add README.md
  git add .gitignore
  ```

### Step 9: Review Staged Files
- **Status:** ⏳ Pending
- **Action:** Run `git status` to review staged files
- **Command:** git status
- **Verification:** Confirm no sensitive files staged

### Step 10: Do First Commit
- **Status:** ⏳ Pending
- **Action:** Create initial commit
- **Command:** git commit -m "chore: establish accepted LumaWeave v15 baseline"
- **Verification:** Confirm commit succeeded

## Suggested First Commit Message

```
chore: establish accepted LumaWeave v15 baseline

- Lock v15 baseline with Mission Control Advisory Cleanup complete
- Add documentation index and staleness audit
- Add git readiness audit and .gitignore draft
- Add first commit plan
- All tests passing (typecheck, Playwright 45/45)
```

## Files to Stage

### Source Code
- `src/` - All TypeScript source
- `public/` - Public assets
- `src-tauri/src/` - Rust source
- `src-tauri/Cargo.toml` - Rust dependencies
- `src-tauri/Cargo.lock` - Rust lockfile
- `src-tauri/tauri.conf.json` - Tauri config

### Configuration
- `package.json` - Node dependencies
- `package-lock.json` - Node lockfile
- `tsconfig.json` - TypeScript config
- `vite.config.ts` - Vite config

### Documentation
- `docs/` - All documentation
- `README.md` - README (even if superseded)
- `.gitignore` - Git ignore file

### Tests
- `tests/` - All test files

## Files to Ignore

### Build Artifacts
- `node_modules/`
- `src-tauri/target/`
- `dist/`
- `dist-ssr/`
- `.vite/`

### Test Artifacts
- `test-results/`
- `playwright-report/`
- `playwright/.cache/`
- `screenshots/`
- `recordings/`
- `coverage/`

### Environment/Secrets
- `.env`
- `.env.local`
- `.env.*.local`
- `*.pem`
- `*.key`

### OS/Editor Junk
- `.DS_Store`
- `Thumbs.db`
- `*.swp`
- `*~`
- `.vscode/`
- `.idea/`

### Generated Outputs
- `examples/*/graphify-out/`
- `.graphify_*`
- `cache/`
- `generated/`

### Local Files
- `backup/`
- `backups/`
- `tmp/`
- `temp/`
- `*.log`

## Risk Assessment

### Low Risk
- Staging source code
- Staging documentation
- Staging configuration files
- Staging lockfiles

### Medium Risk
- Staging examples (review generated outputs)
- Staging .vscode/ (review sensitive settings)

### High Risk
- Staging environment files
- Staging private keys
- Staging without backup
- Staging build artifacts

## Pre-Commit Checklist

- [ ] User confirms external backup exists
- [ ] .gitignore created from draft
- [ ] `git status --ignored` reviewed
- [ ] No sensitive files in untracked
- [ ] No environment files staged
- [ ] No private keys staged
- [ ] No build artifacts staged
- [ ] Only source, config, docs, tests staged

## Post-Commit Steps

### Verify Commit
- **Action:** Run `git log` to verify commit
- **Command:** git log --oneline
- **Expected:** Single commit with v15 baseline message

### Create Initial Branch
- **Action:** Create main branch if not default
- **Command:** git branch -M main
- **Verification:** Confirm branch is main

### Optional: Add Remote
- **Action:** Add remote repository (if user has one)
- **Command:** git remote add origin <url>
- **Verification:** Confirm remote added

### Optional: Push
- **Action:** Push to remote (if user wants)
- **Command:** git push -u origin main
- **Verification:** Confirm push succeeded

## Do Not Run Git Init Yet

**IMPORTANT:** Do not run `git init` until:
1. User confirms external backup exists
2. User reviews and approves .gitignore
3. User reviews untracked files manually
4. User approves this plan

## Next Steps After First Commit

1. Create feature branches for new work
2. Use conventional commits for changes
3. Update documentation with changes
4. Keep session logs for history
5. Review and update staleness audit periodically

## Rollback Plan

If anything goes wrong:
1. User has external backup (confirmed before init)
2. Can restore from backup if needed
3. Can delete .git directory to undo init
4. Can reinitialize with different .gitignore if needed
