# Repo Root Sandbox Protocol

## Status

Durable Bandit operating rule.

This document defines the hard repo-root confinement rule for all LumaWeave commands, validations, edits, commits, greps, file operations, and Playwright runs.

## Purpose

Bandit must not wander out of the LumaWeave repo.

Several failures and confusing validation outputs have occurred because commands were run from a parent directory such as:

```txt
/home/boop/Projects
```

instead of the actual project root:

```txt
/home/boop/Projects/lumaweave
```

When commands run from the wrong directory, Bandit may produce false evidence such as:

```txt
fatal: not a git repository
grep: src: No such file or directory
grep: tests: No such file or directory
grep: docs: No such file or directory
```

Those outputs are command-context failures, not project evidence.

## Hard Boundary

The only allowed working directory for LumaWeave work is:

```txt
/home/boop/Projects/lumaweave
```

The only valid git root is:

```txt
/home/boop/Projects/lumaweave
```

## Parent Directory Auto-Redirect Rule

If Bandit ever finds itself in:

```txt
/home/boop/Projects

it must treat that location as an invalid command context.

Bandit must not run project commands from /home/boop/Projects.

Project commands include:

git
npm
npx
grep
find
cat
sed
ls
tree
Playwright
file edits
validation
commits
Required Redirect

If Bandit is in /home/boop/Projects, the only allowed action is to redirect to the LumaWeave repo:

cd /home/boop/Projects/lumaweave || exit 1

Then verify:

pwd
git rev-parse --show-toplevel

Both must output:

/home/boop/Projects/lumaweave

If either value is different, Bandit must stop and report.

Important

/home/boop/Projects is not the LumaWeave repo.

Commands run from /home/boop/Projects are invalid for LumaWeave and will often fail with:

fatal: not a git repository

or will inspect the wrong files.

No Parent Directory Recovery Loops

Bandit must not try to diagnose the parent directory.

Bandit must not inspect sibling projects.

Bandit must not run:

git status
find .
grep -R ...
ls

from /home/boop/Projects.

The only valid action from /home/boop/Projects is:

cd /home/boop/Projects/lumaweave || exit 1
Locked Terminal Exception

If Bandit is in Locked Terminal Mode, it must not run the redirect itself.

Instead it must tell the user:

I appear to be in /home/boop/Projects. Please run:
cd /home/boop/Projects/lumaweave || exit 1
pwd
git rev-parse --show-toplevel
git status --short

Add this shorter version to `24_BANDIT_WORKING_MEMORY_REFRESHER.md` under Repo / Command Work:

```md
### Parent Directory Auto-Redirect

If the command context is `/home/boop/Projects`, Bandit is outside the LumaWeave repo.

Required behavior:

- do not run project commands
- do not inspect parent directories
- do not diagnose sibling folders
- redirect immediately to `/home/boop/Projects/lumaweave`
- verify `pwd` and `git rev-parse --show-toplevel`

In Locked Terminal Mode, Bandit must not run the redirect. It must ask the user to run it.

Add this to 25_BANDIT_SELF_MODEL_AND_GROWTH_PROTOCOL.md under Repo / Terminal Work:

### Parent Directory Escape Response

If Bandit detects `/home/boop/Projects`, it must classify this as parent-directory escape.

If terminal privileges are active, the only permitted command is:

```bash
cd /home/boop/Projects/lumaweave || exit 1

Then verify repo root.

If terminal privileges are revoked, Bandit must not run commands and must ask the user to redirect manually.

Bandit must not treat /home/boop/Projects as a valid workspace.


And here’s a quick prompt to have Bandit add it:

```txt
Bandit Brain Patch — Parent Directory Auto-Redirect Rule

Mission:
Add a hard parent-directory auto-redirect rule to Bandit brain docs.

Problem:
Bandit keeps ending up in /home/boop/Projects. That is not the LumaWeave repo. Commands from there fail or inspect the wrong context.

Docs-only.
Terminal privileges remain revoked unless user explicitly grants them.
Do not run commands.
Do not continue v61/v62.

Patch these files:
- docs/lumaweave_bandit_brain_packet/docs/agent-learning/18_REPO_ROOT_SANDBOX_PROTOCOL.md
- docs/lumaweave_bandit_brain_packet/docs/agent-learning/24_BANDIT_WORKING_MEMORY_REFRESHER.md
- docs/lumaweave_bandit_brain_packet/docs/agent-learning/25_BANDIT_SELF_MODEL_AND_GROWTH_PROTOCOL.md

Add rule:
If Bandit ever detects /home/boop/Projects, it must treat that as invalid command context.

If terminal privileges are active:
The only allowed command from /home/boop/Projects is:
cd /home/boop/Projects/lumaweave || exit 1

Then verify:
pwd
git rev-parse --show-toplevel

Both must equal:
/home/boop/Projects/lumaweave

If terminal privileges are revoked:
Bandit must not run commands. It must ask the user to run the redirect manually.

Also state:
- /home/boop/Projects is not the repo
- do not run git/npm/npx/grep/find/Playwright/file edits from /home/boop/Projects
- do not inspect sibling projects
- do not diagnose the parent directory
- redirect or report only

After editing, report files changed and summary only.
Do not validate.
Do not commit.

## Forbidden Working Directories

Do not run LumaWeave commands from:

```txt
/home/boop/Projects
/home/boop
any parent directory
any sibling repo
any directory where git rev-parse --show-toplevel is not /home/boop/Projects/lumaweave
```

This applies even if the command appears harmless.

## Commands Covered By This Rule

Repo-root verification is required before running:

```txt
git
npm
npx
playwright
grep
find
rm
mv
cp
sed
cat for source inspection
file edits
validation scripts
commit commands
test commands
```

If the command reads, writes, validates, searches, tests, or commits LumaWeave project state, it must run from `/home/boop/Projects/lumaweave`.

## Mandatory Root Verification

Before any Quest Mode pass, recovery pass, Playwright pass, validation block, or commit, run:

```bash
pwd
git rev-parse --show-toplevel
```

Expected exact outputs:

```txt
pwd:
/home/boop/Projects/lumaweave

git rev-parse --show-toplevel:
/home/boop/Projects/lumaweave
```

If either output differs, run:

```bash
cd /home/boop/Projects/lumaweave
pwd
git rev-parse --show-toplevel
```

If the second verification still fails, stop and report.

Do not continue.

## Required Command Wrapper

**Raw project commands are forbidden.**

All git/npm/grep/find/Playwright/file inspection commands must use the wrapper script:

```bash
/home/boop/Projects/lumaweave/scripts/lw-repo-run.sh <command>
```

The wrapper performs mandatory root verification before executing the requested command:
- Changes to `/home/boop/Projects/lumaweave`
- Verifies `pwd` is exactly `/home/boop/Projects/lumaweave`
- Verifies `git rev-parse --show-toplevel` is exactly `/home/boop/Projects/lumaweave`
- Executes the requested command
- Fails loudly if root verification fails

**Examples:**

```bash
# Valid - using wrapper
/home/boop/Projects/lumaweave/scripts/lw-repo-run.sh git status --short
/home/boop/Projects/lumaweave/scripts/lw-repo-run.sh npm run typecheck
/home/boop/Projects/lumaweave/scripts/lw-repo-run.sh grep -R "test.skip" tests/

# Invalid - raw commands
git status --short
npm run typecheck
grep -R "test.skip" tests/
```

**Wrapper Usage Rule:**

Do not run:
- Raw git commands
- Raw npm commands
- Raw grep/find commands
- Raw Playwright commands
- Any project-relative command without the wrapper

Always use:
- `/home/boop/Projects/lumaweave/scripts/lw-repo-run.sh <command>`

## Command Confinement Rule

All project-relative commands must be run from:

```txt
/home/boop/Projects/lumaweave
```

Good examples:

```bash
cd /home/boop/Projects/lumaweave
git status --short
npm run typecheck
npm run qa:e2e
grep -R "test.skip" -n tests/e2e || true
grep -R -E "Ctrl\+Alt\+T|ctrl\+alt\+t|Alt\+F8|alt\+f8" -n src tests docs || true
```

Bad examples:

```bash
cd /home/boop/Projects
git status --short
grep -R "test.skip" -n tests/e2e || true
grep -R -E "Ctrl\+Alt\+T|ctrl\+alt\+t|Alt\+F8|alt\+f8" -n src tests docs || true
npm run qa:e2e
```

Do not run validation from a parent directory and then interpret failures as meaningful.

## If A Command Runs From The Wrong Root

If Bandit discovers that a command ran outside `/home/boop/Projects/lumaweave`, it must:

1. Stop immediately.
2. Mark the output as invalid evidence.
3. Change into the project root.
4. Re-run root verification.
5. Re-run the command from the correct root.
6. Report the repo-root drift.

Use this report format:

```txt
Repo-Root Drift Detected

Invalid command:
...

Invalid working directory:
...

Why output is invalid:
...

Corrected root:
...

Command rerun from correct root:
...

Corrected result:
...
```

## Before Validation Blocks

Before running any validation block, run:

```bash
pwd
git rev-parse --show-toplevel
```

Then run the validation commands.

Standard validation block:

```bash
npm run typecheck
npm run qa:e2e
grep -R "test.skip" -n tests/e2e || true
grep -R -E "Ctrl\+Alt\+T|ctrl\+alt\+t|Alt\+F8|alt\+f8" -n src tests docs || true
grep -R "Run window.__lwRunThemeTargetProbe() from devtools\|triggered from DevTools\|can be triggered from DevTools" -n src docs tests || true
git diff --name-only
git status --short
```

All of those commands must run from `/home/boop/Projects/lumaweave`.

## Before Commits

Before committing, run:

```bash
pwd
git rev-parse --show-toplevel
git status --short
git diff --name-only
```

Only commit if:

```txt
pwd and git root are correct
changed files match the allowed scope
no unexpected parent-directory output exists
```

After committing, run:

```bash
git status --short
git diff --name-only
git log --oneline -10
```

The final report must use post-commit status from the correct repo root.

## Quest Mode Requirement

Every Quest Mode prompt should include the Repo Root Guard:

```txt
Repo Root Guard:
Before running npm, git, grep, Playwright, or edits, verify:

pwd
git rev-parse --show-toplevel

Both must resolve to:
/home/boop/Projects/lumaweave

If not, cd there and verify again.
Stop if verification fails.
```

Bandit must perform this before:

```txt
sub-pass planning
implementation
validation
commit
recovery
Playwright cascade diagnosis
```

## Playwright-Specific Rule

Do not run Playwright from a parent directory.

Wrong root can produce misleading failures, missing files, or unrelated command behavior.

Before every Playwright run:

```bash
pwd
git rev-parse --show-toplevel
```

Then run:

```bash
npm run qa:e2e
```

or targeted Playwright commands.

If Playwright failures occur, root verification must be included in the failure report.

## Grep-Specific Rule

Grep commands must be run only from the repo root.

Valid:

```bash
cd /home/boop/Projects/lumaweave
grep -R "test.skip" -n tests/e2e || true
```

Invalid:

```bash
cd /home/boop/Projects
grep -R "test.skip" -n tests/e2e || true
```

If grep says `src`, `tests`, or `docs` do not exist, suspect wrong root first.

Do not treat that as a project finding until root is verified.

## File Operation Rule

Never run `rm`, `mv`, `cp`, or broad file operations unless root is verified.

Before destructive or moving operations:

```bash
pwd
git rev-parse --show-toplevel
git status --short
```

If root is not exactly `/home/boop/Projects/lumaweave`, stop.

## Stop Conditions

Stop and report if:

```txt
pwd is not /home/boop/Projects/lumaweave
git rev-parse --show-toplevel does not return /home/boop/Projects/lumaweave
git reports "not a git repository"
grep reports src/tests/docs missing
npm or Playwright appears to run from parent directory
command output is from /home/boop/Projects or another parent directory
Bandit cannot prove which directory a command ran from
```

Do not continue until corrected.

## Report Format

Use this format after root verification:

```txt
Repo Root Verified

pwd:
...

git root:
...

working tree:
...

latest commit:
...

commands previously run from wrong root:
yes/no

invalid outputs discarded:
yes/no

safe to continue:
yes/no
```

## Relationship To Other Brain Docs

This protocol supports:

```txt
09_SELF_SPLITTING_QUEST_PROTOCOL.md
12_PLAYWRIGHT_OPERATING_PROCEDURES.md
13_MCP_TOOL_SUITE_PROTOCOL.md
14_BANDIT_ABILITY_AUDIT.md
15_PLAYWRIGHT_WORKING_PATTERN_DIFF_AUDIT.md
16_SELF_IMPROVEMENT_SUGGESTION_BOX.md
17_PASS_FRICTION_REPORT_TEMPLATE.md
```

Repo-root drift should be treated as:

```txt
a command-context failure
a validation integrity risk
a possible suggestion-box entry if repeated
```

## Suggested Suggestion Box Entry

If repo-root drift happens again, add:

```md
### YYYY-MM-DD — Repo-root drift into parent directory

**Pass / Context:**
...

**Symptom:**
Bandit ran project commands from `/home/boop/Projects` or another parent directory instead of `/home/boop/Projects/lumaweave`.

**What Went Roughly:**
Commands produced invalid evidence such as `not a git repository` or missing `src/tests/docs`.

**Likely Root Cause:**
Repo-root verification was missing or not enforced before command execution.

**Impact / Risk:**
High

**Repeated Pattern?**
Yes / No / Unknown

**Suggested Improvement:**
Require `pwd` and `git rev-parse --show-toplevel` before validation, grep, Playwright, file operations, and commits.

**Suggested Target:**
- brain doc
- prompt template
- stop condition

**Status:**
Open / Adopted

**Follow-Up Owner:**
Bandit
```

## Summary

Bandit must never wander.

For LumaWeave:

```txt
/home/boop/Projects/lumaweave
```

is the arena.

Everything outside it is lava.
