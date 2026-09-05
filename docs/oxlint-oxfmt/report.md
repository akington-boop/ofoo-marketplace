# Adopting oxlint + oxfmt

## What changed

- Added `oxlint` (linting) and `oxfmt` (formatting) via `.oxlintrc.json` / `.oxfmtrc.json`.
- These sit alongside, not instead of, `@webmdhs/eslint-config` — eslint still covers rules oxlint doesn't (see [unsupported.md](./unsupported.md), [still-unsupported.md](./still-unsupported.md)).

## Pros

- **Blazingly fast** — oxlint/oxfmt are Rust-based, order of magnitude faster than eslint on this repo.
- oxfmt closes the entire `@stylistic` gap (formatting rules) that oxlint can't cover itself — no more style-rule disagreements between formatter and linter.
- Fast enough to run on every save / pre-commit without the usual eslint drag.
- `jsPlugins` (oxlint's ESLint v9-plugin-compatible loader) closes the `n:*` gap below by pointing at `eslint-plugin-n` directly, without installing eslint — verified working (see `.oxlintrc.json`'s `jsPlugins`/`n-js/*` rules).

## Cons

Coverage gap vs. `@webmdhs/eslint-config` — these rules have no oxlint equivalent and still need eslint:

- `eslint:camelcase`

The `n:*` rules previously listed here are now covered via `jsPlugins` + `eslint-plugin-n` (see `.oxlintrc.json`):

- `n-js/no-deprecated-api`
- `n-js/no-extraneous-import`
- `n-js/no-extraneous-require`
- `n-js/no-missing-import`
- `n-js/no-missing-require`
- `n-js/no-process-exit`
- `n-js/no-unpublished-import`
- `n-js/no-unpublished-require`
- `n-js/no-unsupported-features/es-builtins`
- `n-js/no-unsupported-features/es-syntax`
- `n-js/no-unsupported-features/node-builtins`
- `n-js/process-exit-as-throw`
- `n-js/hashbang`

Note: the `no-unsupported-features/*` rules read the `engines.node` field in `package.json` to know which Node APIs are safe — added `"engines": {"node": ">=22.16.0"}` so they don't flag things like `node:test` or `import.meta.dirname` as unsupported.

Net result: eslint stays in the pipeline only for `camelcase` now — a much smaller remaining gap.
