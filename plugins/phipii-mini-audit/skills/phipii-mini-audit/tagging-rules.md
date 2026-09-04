tagging=compile-time only. no source string/attr marker exists (`GlobalLinkNoTx`, `data-pii`, `<PII_TAG>` etc never appear in source, even when covered). never grep diff for tag literals.

config: `component-decorator.config.js` (repo root). find: `find . -name "component-decorator.config.js" -not -path "*/node_modules/*"`. missing → no coverage assertable, mark all hits unverified.

config schema:
```
{ rules: [{ match, target?, wrapWith?, whenProp?: {name,value,match:"exact"|"token",matchConditionalBranches?} }], ignore: [], defaultWrapWith }
```

covered = matches a rule's `match` (exact path | `**`/`Foo**`/`**Foo` wildcard by import suffix/prefix/substring | bare package name = package-mode, patches node_modules entry) AND whenProp (if present) satisfied by actual diff prop values AND not in `ignore`.

not covered (violation) = no matching rule, OR whenProp guard unsatisfied, OR listed in `ignore`.

logging/analytics/console calls: config never applies (no DOM to inject class into) → always violation regardless of rules.

local storage / API payload / anywhere leaving render path: always violation (config only covers rendered DOM, not data egress).

no `className`/prop path a rule could ever target → real gap (needs `wrapWith` or new rule), not a false negative.
