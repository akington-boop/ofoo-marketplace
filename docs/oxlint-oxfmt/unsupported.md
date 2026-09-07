# Rules not supported by oxlint

Checked against oxlint 1.81.0 (`node_modules/.bin/oxlint`, cross-referenced with
https://oxc.rs/docs/guide/usage/linter/rules.html).

## eslint (core)

- `eslint:camelcase` — no oxlint equivalent.

## @stylistic

oxlint has no formatting/style-plugin support at all (it's a dedicated linter;
formatting is handled by a separate tool, Oxfmt). All of `CommonStylisticConfigs.js`
is unsupported:

- `stylistic:array-bracket-newline`
- `stylistic:array-bracket-spacing`
- `stylistic:arrow-parens`
- `stylistic:arrow-spacing`
- `stylistic:block-spacing`
- `stylistic:brace-style`
- `stylistic:comma-dangle`
- `stylistic:comma-spacing`
- `stylistic:comma-style`
- `stylistic:dot-location`
- `stylistic:eol-last`
- `stylistic:function-call-spacing`
- `stylistic:implicit-arrow-linebreak`
- `stylistic:indent`
- `stylistic:key-spacing`
- `stylistic:keyword-spacing`
- `stylistic:linebreak-style`
- `stylistic:lines-between-class-members`
- `stylistic:new-parens`
- `stylistic:no-mixed-operators`
- `stylistic:no-multi-spaces`
- `stylistic:no-multiple-empty-lines`
- `stylistic:no-trailing-spaces`
- `stylistic:no-whitespace-before-property`
- `stylistic:object-curly-newline`
- `stylistic:object-curly-spacing`
- `stylistic:padded-blocks`
- `stylistic:quotes`
- `stylistic:semi-spacing`
- `stylistic:semi-style`
- `stylistic:semi`
- `stylistic:space-before-blocks`
- `stylistic:space-before-function-paren`
- `stylistic:space-in-parens`
- `stylistic:space-infix-ops`
- `stylistic:spaced-comment`
- `stylistic:switch-colon-spacing`

## eslint-plugin-n

`NodeModuleConfigs.js` applies `eslintNode.configs["flat/recommended-module"]`, which
expands to the rules below. Only `n:no-exports-assign` has an oxlint equivalent
(as `node/no-exports-assign`, included in `.oxlintrc.json`).

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
