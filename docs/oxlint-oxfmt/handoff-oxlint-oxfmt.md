# Handoff: oxlint/oxfmt vs eslint rule comparison

## Context

Repo: `/home/akington/ofoo-marketplace` (branch `oxlint-oxfmt`). The repo is
adopting `oxlint` (linting) and `oxfmt` (formatting) alongside the existing
`@webmdhs/eslint-config`. Config files already added: `.oxlintrc.json`,
`.oxfmtrc.json`.

## What's been done this session

1. Moved two rule-gap docs into a new folder:
   - `docs/oxlint-oxfmt/unsupported.md` — eslint rules with no oxlint
     equivalent (before oxfmt adoption).
   - `docs/oxlint-oxfmt/still-unsupported.md` — same, but after accounting
     for oxfmt covering all `@stylistic` rules. Remaining gaps: `eslint:camelcase`
     and most of `eslint-plugin-n`'s `flat/recommended-module` rules.
2. Wrote `docs/oxlint-oxfmt/report.md` — short pros/cons report on adopting
   oxfmt + oxlint and the impact on `@webmdhs/eslint-config`. Per user
   feedback, the "cons" section now lists each unsupported rule as its own
   bullet (not prose). Notable pro called out: oxlint/oxfmt are "blazingly
   fast" (Rust-based).

Read these three files directly for full current content rather than having
this doc restate them.

## Open question (the actual next task)

User asked: **"are there no rules that oxlint has that eslint doesn't?"**

I answered honestly that this wasn't knowable from the existing docs —
`unsupported.md`/`still-unsupported.md` only document one direction (eslint
rules oxlint lacks). I did not fabricate an answer.

The user is now going to gather oxlint and oxfmt rule information themselves
(per their command arguments: "I will gather some oxlint and oxfmt rule
information so you can make that comparison"). The next agent's job, once
that data is provided, is:

- Compare oxlint's full rule set (and any oxfmt-specific formatting rules)
  against the rules actually enabled/covered by `@webmdhs/eslint-config` in
  this repo.
- Identify oxlint (or oxfmt) rules that have **no eslint-config equivalent**
  — i.e., the reverse direction of `unsupported.md`.
- Add a section to `docs/oxlint-oxfmt/report.md` (likely a new "oxlint-only
  rules" or "additional coverage" heading under Pros) listing those, one
  bullet per rule, matching the existing list style used for the Cons
  section.
- Do not re-verify or re-derive the existing unsupported/still-unsupported
  lists — treat those two files as settled/authoritative for the
  eslint-has-no-oxlint-equivalent direction.

## Suggested skills for next agent

- None of the currently listed skills specifically cover "diff two linter
  rule sets" — no skill invocation is required to do the comparison and
  markdown edit. If further formatting polish of the final report is wanted,
  consider `upscale-markdown` (header decoration) only if the user asks for
  it — not requested so far, skip by default.
