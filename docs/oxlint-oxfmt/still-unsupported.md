# Rules still unsupported after adopting oxfmt

Oxfmt covers all `@stylistic` rules from `unsupported.md`. Remaining gaps:

## eslint (core)

- `eslint:camelcase` — no oxlint equivalent.

## eslint-plugin-n

- `n:no-deprecated-api`
- `n:no-extraneous-import`
- `n:no-extraneous-require`
- `n:no-missing-import`
- `n:no-missing-require`
- `n:no-process-exit` (oxlint has an equivalent under a different plugin: `unicorn/no-process-exit`)
- `n:no-unpublished-import`
- `n:no-unpublished-require`
- `n:no-unsupported-features/es-builtins`
- `n:no-unsupported-features/es-syntax`
- `n:no-unsupported-features/node-builtins`
- `n:process-exit-as-throw`
- `n:hashbang`
