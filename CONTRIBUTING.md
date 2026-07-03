# Contributing to LumaWeave

LumaWeave is a personal portfolio project maintained by one developer.
External contributions are welcome but not actively solicited.

## Reporting bugs

Open a GitHub Issue using the bug report template. Include:
- Steps to reproduce (source file type, adapter used, graph size if relevant)
- What you expected vs. what happened
- Node/npm/Rust versions (`node --version`, `rustc --version`)
- Console errors or Tauri logs if available

## Proposing changes

Open an Issue to discuss the change before sending a pull request.
PRs without a prior discussion may be closed if they conflict with the
project direction.

If you do send a PR:
1. Fork the repo and create a branch from `main`.
2. Run the validation suite before submitting:
   ```bash
   npm run typecheck
   npm run lint:css
   npm run physics:gwells
   ```
3. Describe *why* the change is needed, not just what it does.
4. Keep the diff focused — one concern per PR.

## Code of conduct

Be direct and respectful. This project does not have a formal CoC at this
stage; basic professional standards apply.
