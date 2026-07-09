# Contributing to LumaWeave

LumaWeave is a personal portfolio project maintained by one developer.
External contributions are welcome but not actively solicited.

## License

By submitting a pull request, you agree that your contribution will be
licensed under the [Apache License, Version 2.0][apache-2.0] — the same
license as this project.

You do not lose the rights to your contribution by submitting it; the
Apache-2.0 license grants the project (and downstream users) the same
rights as everyone else has to use, modify, and distribute your work.

## Developer Certificate of Origin (DCO)

All commits must be signed off, attesting to the [Developer Certificate of
Origin][dco]:

```
Signed-off-by: Your Name <your.email@example.com>
```

Use `git commit -s` (or `git commit --signoff`) to add this line
automatically. This is a lightweight alternative to a full Contributor
License Agreement and serves the same provenance function.

If you forget to sign off, `git commit --amend --signoff` (or, for many
commits, `git rebase --signoff HEAD~N`) can fix it before pushing.

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
3. Sign off your commits (`git commit -s`).
4. Describe *why* the change is needed, not just what it does.
5. Keep the diff focused — one concern per PR.

## Code of conduct

Be direct and respectful. This project does not have a formal CoC at this
stage; basic professional standards apply.

[apache-2.0]: https://www.apache.org/licenses/LICENSE-2.0
[dco]: https://developercertificate.org/
