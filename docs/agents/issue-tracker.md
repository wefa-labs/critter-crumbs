# Issue tracker

Use GitHub issues on `wefa-labs/critter-crumbs`. Labels `ready-for-agent`, `blocked`, and `needs-human` exist. Issues is enabled (checked 2026-11-10; it was disabled on 2026-09-04). Agents must not change repository settings. If GitHub cannot be reached, keep drafts in `.scratch/<feature>/issues/`.

Read an issue and its discussion with:

```sh
gh issue view NUMBER --repo wefa-labs/critter-crumbs --json number,title,body,labels,state,url,comments
```

Find available work with:

```sh
gh issue list --repo wefa-labs/critter-crumbs --label ready-for-agent --state open
```

Write the exact issue body into a Markdown file, then file it with:

```sh
gh issue create --repo wefa-labs/critter-crumbs --title 'Concrete task title' --label needs-human --body-file /absolute/path/to/issue.md
```

Use `ready-for-agent` for defined work, `blocked` when a recorded dependency prevents progress, and `needs-human` for a step only a person can complete. Cite the relevant spec sections and blocking issue numbers in each body. Do not file duplicates: search open issues first. If `gh auth status` fails or Issues remains disabled, preserve the draft locally and list it in the handoff. Never place credentials in issue bodies.
