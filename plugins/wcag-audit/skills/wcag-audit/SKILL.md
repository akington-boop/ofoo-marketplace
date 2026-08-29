---
name: wcag-audit
description: Audits code against WCAG 2.2 AA accessibility guidelines across React, Angular, Vue, HTML, and CSS. Default mode scans staged git changes; supports full-repo or scoped-path scans too. Use when the user says /wcag-audit or asks for an accessibility audit.
---

# wcag-audit: WCAG 2.2 Accessibility Auditor

You audit user code against WCAG 2.2 AA accessibility guidelines.

## Invocation Modes

The user can invoke you in three ways:

- **`/wcag-audit`** (default, staged mode) — Audits only staged git changes (`git diff --staged`). Fast, pre-commit safe.
- **`/wcag-audit full`** (full repo scan) — Audits the entire repo, filtering to UI file types.
- **`/wcag-audit full <path>`** (scoped full scan) — Audits a specific folder, filtering to UI file types.

## Your Workflow

1. **Parse the invocation** — Determine which mode the user requested.
2. **Retrieve staged diff** (staged mode only) — Run `git diff --staged` in the repo. If no files are staged, stop immediately and emit the guard message (see below).
3. **Collect code snippets** — From the git diff (staged) or filesystem (full scan), collect all UI-relevant files (`*.tsx`, `*.jsx`, `*.html`, `*.vue`, `*.css`, `*.scss`). Exclude test files, config files, and non-UI code.
4. **Audit directly** — Read `rules/a11y.md` once (all 38+ anti-patterns: S1–S8, A1–A8, K1–K7, F1–F6, V1–V5, D1–D4, RX1–RX4, NG1–NG4, VU1–VU3) and check every collected file against the full ruleset yourself, in a single pass.
   - Do **not** fan this out to sub-agents. The whole ruleset is one file, well within context, and one reviewer holding all categories at once catches cross-category overlap that siloed reviewers miss — e.g. a clickable `<div>` is both S8 (no semantic HTML) and K1 (no keyboard handler) on the same line; a single pass reports it once with both codes, where split reviewers would either duplicate it or each only catch half.
   - Go file by file, checking every anti-pattern against every relevant line. Don't skim — a miss here is a missed accessibility bug, not a token saved.
5. **Assemble findings** — For each violation: `id`, `severity` (from the anti-pattern's definition in `rules/a11y.md` — never invent a severity), `file`, `line`, `description`.
   - Deduplicate by the tuple `(file, line, id)` — keep the first occurrence.
   - Group by severity: CRITICAL → IMPORTANT → SUGGESTION.
   - Within each group, sort alphabetically by file path, then by line number.
6. **Emit report** — Render and display the Markdown report (format below).

## Staged Mode Guard

If mode is **staged** and `git diff --staged` is empty (no staged changes), emit this message and stop:

> No staged changes found. Stage files first, or use `/wcag-audit full` to scan the repo.

## File Types to Scan

Full scan only. Staged mode scans whatever was staged, but you should note which file types have UI violations:

- `*.tsx` — React TypeScript components
- `*.jsx` — React JavaScript components
- `*.html` — HTML templates
- `*.vue` — Vue single-file components
- `*.css` — Stylesheets (for visual violations: contrast, animation, layout, etc.)
- `*.scss` — SCSS stylesheets

Exclude: `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`, `*.config.ts`, `*.config.js`, `.json`, `.md`, etc.

## Anti-Pattern Categories (all checked in one pass)

| Codes | Category | POUR |
|-------|----------|------|
| S1–S8 | Semantic HTML | Perceivable |
| D1–D4 | Media (decorative/informational) | Perceivable |
| V1–V5 | Visual and color | Perceivable |
| K1–K7 | Keyboard and focus | Operable |
| F1–F6 | Forms, labels, error handling | Understandable |
| A1–A8 | ARIA | Robust |
| RX1–RX4 | React/Next.js | Robust |
| NG1–NG4 | Angular | Robust |
| VU1–VU3 | Vue | Robust |

Detect framework-specific patterns by file type and syntax: React (`htmlFor`, `useRef`, `.tsx`), Angular (`(click)`, `cdkTrapFocus`), Vue (`@click`, `v-if`).

Full definitions (severity, detection method, WCAG reference, corrective examples) are in `rules/a11y.md` — read it before auditing, don't rely on the summary table above.

## Report Format

```markdown
## WCAG Audit — [staged diff | full repo | full scan: <path>]

### 🔴 CRITICAL ([count])
- **S8** `src/Button.tsx:42` — Interactive div with onClick but no role or keyboard handler
- **F1** `src/Form.tsx:18` — Input without associated label

### 🟡 IMPORTANT ([count])
- **K4** `src/App.tsx:5` — No skip link as first focusable element
- **V3** `src/styles.css:24` — Fixed font-size preventing resize

### 🔵 SUGGESTION ([count])
- **V5** `src/Card.css:12` — Animation without prefers-reduced-motion guard

✅ No findings in: [categories with no violations, if any]
```

**Special case**: If a POUR category has zero findings across all files, list it under "No findings in:" at the end.

## Implementation Notes

- **Report-only**: This skill produces no file edits, no auto-fix. All findings are human-reviewed by the developer.
- **Severity mapping**: The severity levels in the audit output (CRITICAL, IMPORTANT, SUGGESTION) come directly from each anti-pattern's definition in `rules/a11y.md`.
- **Large repos**: For full scans of very large repos (100+ UI files), you may hit context limits. Scope to a folder (`/wcag-audit full src/components`) rather than trying to hold the whole repo in one pass.
- **Git context**: The script assumes you're in a git repository. If not, full scan mode will still work (scanning the filesystem). Staged mode will fail with a clear message ("Not a git repository").
