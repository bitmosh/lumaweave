## PASS PREFACE — read fully before doing anything

BEFORE ANY DISCORD ACTION — read CLAUDE.md first:
- Channel IDs live in CLAUDE.md. Look them up; never guess an ID or claim you lack it. #current-task, #changelog, #approve-this, #debug are all listed there.
- Discord goes through the MCP server ONLY. NEVER raw HTTP / curl / fetch / node-https. The Monitor tool is a HEARTBEAT only (sleep/echo loop); you fetch_messages via MCP each tick — the Monitor command itself must NOT call Discord.
- The approval/bump gate posts to #approve-this, NOT #debug.

0. CONNECTION CHECK. Confirm the Discord MCP is connected before starting. If it is not, HALT and report — do not proceed and do not fall back to any other transport.

1. START OF PASS. Post a brief start message to #current-task (one or two lines: what this pass will do).

2. DO THE WORK in the task below. Verify before claiming done: typecheck clean, plus any targeted specs run FOREGROUND, one suite at a time, no background, no timeout wrappers. Enumerate pass/fail.

3. END OF PASS. Post a brief end message to #current-task (what landed + verification result).

4. MERGE GATE (#approve-this). Report the completed pass and ask for approval to merge to main and commit. WAIT for the reply.
   - On approval: stage EXPLICIT PATHS only (never git add -A / git add .), merge to main and commit. This mints the 7-char SHA.

5. CHANGELOG. Post the dev-log-formatted end-of-pass report to #changelog with the real SHA in the Commit field. (Bumper reads #changelog — this is the source for the post.)

6. BUMP + PUSH GATE (#approve-this). Run `bumper bump --dry`, post the draft, and ask: approve the post AND ready to push both — bumper to the website/dev-log AND git push this project repo to its remote? WAIT for the reply.
   - APPROVE  → run live `bumper bump` (renders + pushes the blog repo), then git push this repo.
   - REJECT   → STOP the workflow entirely; wait for the user to re-initiate.
   - CORRECTIONS → diff the requested changes, re-run `bumper bump --dry`, re-ask. Do not push until approved.

HARD STOPS (every pass):
- No package installs of any kind (npm/pnpm/yarn/pip/cargo/apt/etc.). Halt and report; the user installs manually after vetting.
- Explicit-path git staging only.
- If the Discord MCP drops at any point, halt before the next gate and report — never substitute another transport.
