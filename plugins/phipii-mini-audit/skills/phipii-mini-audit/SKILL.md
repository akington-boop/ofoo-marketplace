---
name: phipii-mini-audit
description: Audits staged git changes for PII/PHI rendered, logged, or passed without translation-blocking coverage. Use when the user says "/phipii-mini-audit", asks for a PII/PHI compliance audit, or wants to check whether new form fields or logging need GlobalLinkNoTx coverage before commit. Report-only — never edits code.
---

# phipii-mini-audit: PII/PHI Compliance Auditor

You audit staged changes for user-identifiable data (PII) or health data (PHI) that
renders, logs, or transmits without the project's translation-blocking coverage.

## How tagging actually works here

Read `./tagging-rules.md` (sibling of this file) before auditing — it has the coverage
rules you need. Tagging is compile-time only; never grep the diff for tag literals.

## Analysis Process

1. Run `git diff --staged` (not `git status --porcelain` — porcelain lists filenames, not
   line content, and you need the actual added lines).
2. If nothing is staged, stop and say so: "No staged changes found. Stage files first."
3. Walk the diff file by file, looking only at added/modified lines (`+` lines, excluding
   the `+++` file header).
4. Skip test/mock/fixture files (`*.test.*`, `*.spec.*`, `__mocks__/`, `__fixtures__/`,
   `*.stories.*`) — flag PII/PHI-looking literals there only if it's clearly real user
   data copy-pasted in, not synthetic test data.
5. For each remaining line, check for PII/PHI:
   - **PII**: full names, email addresses, phone numbers, SSNs, physical addresses, IP
     addresses, user IDs, dates of birth, device IDs.
   - **PHI**: medical conditions, health insurance info, prescriptions, treatment notes,
     doctor details, test results, appointment records.
6. For each hit, identify the component/element it renders through (or the log/API call
   it passes through) and check coverage against `component-decorator.config.js` as above.
7. Classify:
   - **Missing Tag Violation** — PII/PHI rendered through a component with no matching
     config rule.
   - **Logging Exposure** — PII/PHI passed to a logger, console, or analytics call
     (config rules don't apply here; there's no DOM class to inject into a log line — this
     is always a violation regardless of config coverage).
   - **Potential Data Leak** — PII/PHI written to local storage, sent in an API payload,
     or otherwise leaves the tagged-rendering path entirely.

## Report Format

```markdown
## 🛡️ PII/PHI Compliance Audit Report

### Summary
- **Files Audited:** [count]
- **Potential Violations Found:** [count]
- **Status:** [PASS / ACTION REQUIRED]

---

### Findings Breakdown

#### 1. [File Path] (Line [Line Number])
- **Severity:** [HIGH / MEDIUM / LOW]
- **Category:** [Missing Tag Violation / Logging Exposure / Potential Data Leak]
- **Snippet:**
  ```[language]
  [offending staged line]
  ```
- **Why:** [which config rule is missing / why this path bypasses coverage]
```

If `component-decorator.config.js` wasn't found, replace `Category` with `Unverified —
no config found` for every hit instead of asserting a violation, and note it in the
Summary.

## Severity Guide

- **HIGH** — Logging/analytics exposure, or PII/PHI sent off-device (API payload, local
  storage) unencrypted.
- **MEDIUM** — Rendered in UI with no matching config rule.
- **LOW** — Rendered through a component that's close to an existing rule (e.g. a
  wildcard almost matches, or a sibling component in the same file is already covered) —
  likely just needs a config tweak, not new plumbing.

## Implementation Notes

- **Report-only**: no edits, no patches, no config changes. All fixes are human-applied.
- Don't flag a `whenProp`-guarded rule as covering code that doesn't satisfy the guard —
  read the actual prop values in the diff.
- A component with no `className`/prop path a rule could ever target is a real gap, not
  a false negative — call it out explicitly so the human knows a `wrapWith` or new rule
  is needed, not just a config edit.
