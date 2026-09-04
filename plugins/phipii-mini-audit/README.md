# phipii-mini-audit

Audits staged git changes for PII/PHI rendered, logged, or transmitted without
translation-blocking coverage (`GlobalLinkNoTx` via `MuiComponentDecoratorPlugin`,
configured in `component-decorator.config.js`). Report-only — never edits code.

## 📌 What it's for

Catching user-identifiable data (PII) or health data (PHI) that gets added to a
component, log line, or API payload without the coverage that keeps it out of
third-party translation servers. Coverage is checked against the repo's
`component-decorator.config.js` rules, not against a literal tag in source —
see `how-to-tag.md` for why tagging is invisible in source. Audit logic lives
in `skills/phipii-mini-audit/SKILL.md`.

## 🎯 When to use it

Before committing changes that touch form fields, user profile data, logging,
analytics, or API payloads — anywhere new PII/PHI could start flowing through
the app. Run it as a pre-commit sanity check whenever a diff adds or edits
anything user-identifiable.

## 🛠️ Usage

```
/phipii-mini-audit
```

Runs against `git diff --staged`. Stage your changes first.

## 📸 Example output

- [Violations found](violations.png)
- [No violations found](no-violations.png)
