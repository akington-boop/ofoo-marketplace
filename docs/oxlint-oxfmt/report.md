# Adopting oxlint + oxfmt

## What changed

- Added `oxlint` (linting) and `oxfmt` (formatting) via `.oxlintrc.json` / `.oxfmtrc.json`.
- These sit alongside, not instead of, `@webmdhs/eslint-config` — eslint still covers rules oxlint doesn't (see [unsupported.md](./unsupported.md), [still-unsupported.md](./still-unsupported.md)).

## Pros

- **Blazingly fast** — oxlint/oxfmt are Rust-based, order of magnitude faster than eslint on this repo.
- oxfmt closes the entire `@stylistic` gap (formatting rules) that oxlint can't cover itself — no more style-rule disagreements between formatter and linter.
- Fast enough to run on every save / pre-commit without the usual eslint drag.
- `jsPlugins` (oxlint's ESLint v9-plugin-compatible loader) can likely close most of the `n:*` gap below by pointing at `eslint-plugin-n` directly, without installing eslint — unverified, needs a smoke test.

## Cons

Coverage gap vs. `@webmdhs/eslint-config` — these rules have no oxlint equivalent and still need eslint:

- `eslint:camelcase`
- `n:no-deprecated-api`
- `n:no-extraneous-import`
- `n:no-extraneous-require`
- `n:no-missing-import`
- `n:no-missing-require`
- `n:no-process-exit` (indirect equivalent only: `unicorn/no-process-exit`, different plugin)
- `n:no-unpublished-import`
- `n:no-unpublished-require`
- `n:no-unsupported-features/es-builtins`
- `n:no-unsupported-features/es-syntax`
- `n:no-unsupported-features/node-builtins`
- `n:process-exit-as-throw`
- `n:hashbang`

Net result: eslint can't be fully retired — it stays in the pipeline for the rules above, so this is an added tool, not a replacement, at least for now.
